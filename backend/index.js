const PORT = process.env.PORT || 8000;
const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const uri = process.env.URI;
const app = express();
const cors = require("cors");

// Middleware to handle CORS
const corsOptions = {
  origin: "*", // Allow requests from any origin
  credentials: true, // Access-Control-Allow-Credentials: true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB client setup
const client = new MongoClient(uri);

// Route for home
app.get("/", (req, res) => {
  res.json("Hello to my app");
});

// Signup Route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const generatedUserId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");

    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(409).send("User already exists. Please login");
    }

    const sanitizedEmail = email.toLowerCase();

    const data = {
      user_id: generatedUserId,
      email: sanitizedEmail,
      hashed_password: hashedPassword,
    };

    const insertedUser = await users.insertOne(data);

    const token = jwt.sign({ userId: generatedUserId }, "your-secret-key", {
      expiresIn: "1d",
    });

    res.status(201).json({ token, userId: generatedUserId });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error creating user" });
  } finally {
    await client.close();
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    await client.connect();
    const database = client.db("app-data");
    const users = database.collection("users");
    const user = await users.findOne({ email });

    if (user) {
      const correctPassword = await bcrypt.compare(
        password,
        user.hashed_password
      );

      if (correctPassword) {
        const token = jwt.sign({ userId: user.user_id }, "your-secret-key", {
          expiresIn: "1d",
        });
        return res
          .status(201)
          .json({ success: true, token, userId: user.user_id });
      }
    }

    return res
      .status(400)
      .json({ success: false, error: "Invalid Credentials" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "An error occurred during login." });
  } finally {
    await client.close();
  }
});

// Create Time Capsule Route
app.post("/create-time-capsule", async (req, res) => {
  const { message, files } = req.body;

  // Assuming JWT token is sent in the Authorization header
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from header (Bearer <token>)

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Authentication required" });
  }

  try {
    // Verify the token and extract user information
    const decoded = jwt.verify(token, "your-secret-key"); // Replace with your actual secret key
    const userId = decoded.userId; // Assuming userId is stored in the token payload

    const timeCapsule = {
      message,
      userId, // Associated with the logged-in user
      files, // Array of file URLs
      createdAt: new Date(),
    };

    await client.connect();
    const database = client.db("app-data");
    const capsules = database.collection("time_capsules");

    // Insert the time capsule data into the database
    const result = await capsules.insertOne(timeCapsule);

    res.status(201).json({
      success: true,
      message: "Time Capsule created successfully!",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error creating time capsule" });
  } finally {
    await client.close();
  }
});

// Server Start
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
