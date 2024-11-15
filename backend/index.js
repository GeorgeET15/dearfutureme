const PORT = process.env.PORT || 8000;
const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const nodemailer = require("nodemailer");
const cron = require("node-cron"); // For scheduling tasks
const moment = require("moment"); // For date handling

const uri = process.env.URI;
const app = express();
const cors = require("cors");

// Middleware to handle CORS
const corsOptions = {
  origin: "*", // Allow requests from any origin. Change this for production.
  credentials: true, // Access-Control-Allow-Credentials: true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB client setup with a persistent connection
const client = new MongoClient(uri);
let db;

async function connectToDB() {
  try {
    await client.connect();
    db = client.db("app-data");
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // or use your preferred email service
  auth: {
    user: process.env.EMAIL, // Your email (e.g., "example@gmail.com")
    pass: process.env.EMAIL_PASSWORD, // Your email password or an app-specific password
  },
});

// Function to send email reminder
async function sendEmailReminder(userEmail, capsuleMessage, openingTime) {
  const mailOptions = {
    from: process.env.EMAIL, // Sender address
    to: userEmail, // Recipient address
    subject: "Reminder: Your Time Capsule is About to Be Unlocked!", // Subject line
    text: `Hello! This is a reminder that your time capsule with the message: "${capsuleMessage}" will be unlocked in 10 minutes. Opening time: ${openingTime}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending reminder email:", error);
  }
}

// Schedule the task to run every minute and check for time capsules
cron.schedule("* * * * *", async () => {
  try {
    const now = moment();
    const tenMinutesFromNow = now.clone().add(10, "minutes"); // Get the time 10 minutes from now

    // Find capsules that will open in 10 minutes
    const capsules = await db
      .collection("time_capsules")
      .find({
        openingTime: { $gte: now.toDate(), $lte: tenMinutesFromNow.toDate() },
      })
      .toArray();

    // Send reminders for each capsule found
    for (const capsule of capsules) {
      const user = await db
        .collection("users")
        .findOne({ user_id: capsule.userId });

      if (user) {
        await sendEmailReminder(
          user.email,
          capsule.message,
          moment(capsule.openingTime).format("MMMM Do YYYY, h:mm:ss a")
        );
      }
    }
  } catch (error) {
    console.error("Error checking for time capsules:", error);
  }
});

// Route for home
app.get("/", (req, res) => {
  res.json("Dear Future Me Backend");
});

// Signup Route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const generatedUserId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const users = db.collection("users");
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(409).send("User already exists. Please login");
    }

    const sanitizedEmail = email.toLowerCase();
    const data = {
      user_id: generatedUserId,
      email: sanitizedEmail,
      hashed_password: hashedPassword,
      capsules: [], // Initialize capsules as an empty array for new users
    };

    const insertedUser = await users.insertOne(data);

    const token = jwt.sign(
      { userId: generatedUserId },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d", // Consider using a shorter expiry time or refresh tokens for better security
      }
    );

    res.status(201).json({ token, userId: generatedUserId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating user" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = db.collection("users");
    const user = await users.findOne({ email });

    if (user) {
      const correctPassword = await bcrypt.compare(
        password,
        user.hashed_password
      );

      if (correctPassword) {
        const token = jwt.sign(
          { userId: user.user_id },
          process.env.JWT_SECRET,
          {
            expiresIn: "1d", // Same suggestion for refresh tokens as above
          }
        );

        return res
          .status(200) // Use 200 for successful login
          .json({ success: true, token, userId: user.user_id });
      }
    }

    res.status(400).json({ success: false, error: "Invalid Credentials" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "An error occurred during login." });
  }
});

// Create Time Capsule Route
app.post("/create-time-capsule", async (req, res) => {
  const { message, files, openingTime } = req.body; // Extract openingTime from the body

  // Extract token from Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Authentication required" });
  }

  try {
    // Verify the token and extract user information
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const timeCapsule = {
      message,
      userId,
      files,
      openingTime: new Date(openingTime), // Store the openingTime as a Date object
      createdAt: new Date(),
    };

    const capsules = db.collection("time_capsules");
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
  }
});

// Get Time Capsules Route
app.get("/time-capsules", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid token format" });
  }

  try {
    // Verify the token and extract user information
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Retrieve the time capsules for the current user
    const capsules = await db
      .collection("time_capsules")
      .find({ userId })
      .toArray(); // Find capsules where userId matches the current user

    res.status(200).json({ success: true, capsules });
  } catch (error) {
    console.error(error);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, error: "Token has expired" });
    }

    res
      .status(500)
      .json({ success: false, error: "Error fetching time capsules" });
  }
});

// Server Start
app.listen(PORT, async () => {
  // Ensure the database connection is successful before starting the server
  if (!process.env.URI) {
    console.error("MongoDB URI is not defined");
    process.exit(1);
  }
  await connectToDB();
  console.log(`Server running on PORT ${PORT}`);
});
