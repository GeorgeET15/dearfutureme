const PORT = process.env.PORT || 8000;
const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const uri = process.env.URI;
const app = express();
const cron = require("node-cron");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000/");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const cors = require("cors");
const corsOptions = {
  origin: "*", // Allow requests from any origin
  credentials: true, // Access-Control-Allow-Credentials: true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const client = new MongoClient(uri);

app.get("/", (req, res) => {
  res.json("Hello to my app");
});

app.post("/signup", async (req, res) => {
  const client = new MongoClient(uri);
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

    const token = jwt.sign(insertedUser, sanitizedEmail, {
      expiresIn: 60 * 24,
    });
    res.status(201).json({ token, userId: generatedUserId });
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

app.post("/login", async (req, res) => {
  const client = new MongoClient(uri);
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
        const token = jwt.sign(user, email, { expiresIn: 60 * 24 });
        return res
          .status(201)
          .json({ success: true, token, userId: user.user_id });
      }
    }

    // Move this line outside of the try block
    return res
      .status(400)
      .json({ success: false, error: "Invalid Credentials" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: "An error occurred during login." });
  } finally {
    // Make sure to close the database connection in the finally block
    await client.close();
  }
});

app.listen(PORT, () => console.log("Server running on PORT " + PORT));
