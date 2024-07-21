import express from "express";
import passport from "passport";
import {
  registerAdmin,
  login,
  logout,
  checking,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", passport.authenticate("local"), login);
router.get("/logout", logout);
router.get("check", checking);

export default router;
