import express from "express";
import nodemailer from "nodemailer";
import validator from "validator"; // Import validator
import { Message } from "../models/message.js";
// import { isLoggedIn, isAdmin } from "../middleware/middleware.js";
const router = express.Router();
// POST endpoint to store a new message

// Configure the transporter for your email service
const transporter = nodemailer.createTransport({
  service: "gmail", // or 'hotmail', 'outlook', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/", async (req, res) => {
  try {
    const { name, email, message, phonenumber } = req.body;

    // Validate email using validator
    if (!validator.isEmail(email)) {
      return res.status(400).send({ message: "Invalid email address" });
    }

    const newMessage = new Message({ name, email, message, phonenumber });
    await newMessage.save();

    // Send email notification
    const mailOptions = {
      from: `"${name}" <${email}>`, // Sender address is user's email
      to: "weddihaji@gmail.com", // List of receivers
      to: "weddihaji@gmail.com", // List of receivers
      subject: "New Contact Form Message", // Subject line
      text: `You have received a new message from ${name} (${email}):\n\n${message}\n\nPhone Number: ${phonenumber}`, // Plain text body
      html: `<p>You have received a new message from <strong>${name}</strong> (${email}):</p><p>${message}</p><p>Phone Number: ${phonenumber}</p>`, // HTML body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`Error sending email: ${error}`);
        return res.status(500).send({
          message: "Error creating message and sending email",
          error: error.message,
        });
      } else {
        console.log(`Email sent: ${info.messageId}`);
        return res.status(201).send({
          message: "Message created successfully and email sent",
          data: newMessage,
        });
      }
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error creating message", error: error.message });
  }
});

// Route for deleting a post by ID
router.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const result = await Message.findByIdAndDelete(id);
    if (!result) {
      return response.status(404).json({ message: "Post not found" });
    } else {
      return response
        .status(200)
        .json({ message: "message deleted successfully" });
    }
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

// Route for getting all posts
router.get("/", async (request, response) => {
  try {
    const messages = await Message.find({}).limit();
    return response.status(200).json({ messages });
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

// Route for getting a post by ID
router.get("/:id", async (request, response) => {
  try {
    const message = await Message.findById(request.params.id);
    if (!message) {
      return response.status(404).json({ message: "message not found" });
    } else {
      return response.status(200).json({ message });
    }
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

export default router;
