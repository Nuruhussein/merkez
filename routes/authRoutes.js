import express from "express";
import passport from "passport";
import { registerAdmin, login, logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", passport.authenticate("local"), login);
router.get("/logout", logout);

export default router;
