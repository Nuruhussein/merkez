import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"; // Correct import for LocalStrategy
import multer from "multer"; // Import Multer for handling file uploads
import { fileURLToPath } from "url";
import path from "path";
import MongoStore from "connect-mongo";
import dotenv from "dotenv"; // Load environment variables
dotenv.config(); // Initialize dotenv to load variables from `.env`

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import postsRoute from "./routes/postsroute.js";
import messageRoute from "./routes/messageroute.js";
import { User } from "./models/users.js";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json()); // Ensure this middleware is included
app.set("trust proxy", true);

// MongoDB Connection
const mongoURI = process.env.MONGO_URI; // Use environment variables for security
mongoose
  .connect(mongoURI, {
    ssl: true, // Ensure SSL/TLS is enabled
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const store = new MongoStore({
  mongoUrl: process.env.MONGO_URI, // Use correct MongoDB connection string
  collectionName: "sessions", // Ensure the collection name matches the one in MongoDB
  autoRemove: "native", // Choose how sessions are removed (e.g., 'native' for MongoDB's TTL)
});

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Ensure a strong session secret
    resave: false, // Avoid unnecessarily saving unchanged sessions
    saveUninitialized: false, // Prevent creating sessions for unauthenticated users
    store: store, // Ensure MongoStore is properly initialized
    cookie: {
      secure: process.env.NODE_ENV === "production", // Set secure to true if using HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // Set session cookie expiry (1 day)
    },
  })
);

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Use environment variable to set allowed CORS origins
    credentials: true,
  })
);

// Passport Configuration
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure the uploads directory exists
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Limit file size to 5 MB
}).single("image");
app.use("/uploads", express.static(path.join(__dirname, "/uploads"))); // Correctly set up static file serving

// Route for Uploading Images
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to upload image", error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.status(200).json({ filename: req.file.filename });
  });
});

// Route for Checking Authentication Status
app.get("/auth/check", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ isAuthenticated: true, user: req.user });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if an admin already exists
    const adminExists = await User.findOne({ isAdmin: true });
    if (adminExists) {
      return res.status(403).json({ message: "Admin already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new admin user
    const admin = new User({
      username,
      password: hashedPassword,
      isAdmin: true,
    });

    // Save the admin user to the database
    await admin.save();

    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Error in /register:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route for User Login
app.post("/login", passport.authenticate("local"), (req, res) => {
  res.cookie("connect.sid", req.sessionID, {
    maxAge: 1000 * 60 * 60 * 24, // Session expiry time (1 day)
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure cookies in production
  });
  res.json({ message: "Login successful" });
});

// Route for User Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Logout failed", error: err.message });
    }
    res.clearCookie("connect.sid"); // Clear session cookie
    res.status(200).json({ message: "Logout successful" });
  });
});

// app.use(cors({ origin: "*", credentials: true }));

// Define a route for the root path
app.get("/", (req, res) => {
  res.send("Welcome to the backend!");
});

// Routes for Posts and Messages
app.use("/posts", postsRoute);
app.use("/messages", messageRoute);

// Start the Server
const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
