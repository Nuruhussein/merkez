import bcrypt from "bcrypt";
import { User } from "../models/users.js";

export const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminExists = await User.findOne({ isAdmin: true });
    if (adminExists) {
      return res.status(403).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({
      username,
      password: hashedPassword,
      isAdmin: true,
    });
    await admin.save();
    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Error in /register:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = (req, res) => {
  res.cookie("connect.sid", req.sessionID, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  res.json({ message: "Login successful" });
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Logout failed", error: err.message });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logout successful" });
  });
};
