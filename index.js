import express from "express";
import session from "express-session";
import cors from "cors";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postsRoute from "./routes/postRoutes.js";
import messageRoute from "./routes/messageRoutes.js";
import { environment } from "./utils/environment.js";
import upload from "./middlewares/multer.js";

const app = express();
app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
app.use(express.json());
app.set("trust proxy", true);

connectDB();

const store = new MongoStore({
  mongoUrl: environment.mongoURI,
  collectionName: "sessions",
  autoRemove: "native",
});

app.use(
  session({
    secret: environment.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "None",
    },
  })
);

app.use(
  cors({
    origin: environment.corsOrigin,
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);
app.use("/posts", postsRoute);
app.use("/messages", messageRoute);

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

app.get("/", (req, res) => {
  res.send("Welcome to the backend!");
});

const PORT = process.env.PORT || 5555;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
