import express from "express";
import passport from "passport";
import {
  registerAdmin,
  login,
  logout,
  checker,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", passport.authenticate("local"), login);
router.get("/check", checker);
router.get("/logout", logout);

export default router;
