import express from "express";
import { Message } from "../models/message.js";
// import { isLoggedIn, isAdmin } from "../middleware/middleware.js";
const router = express.Router();
// POST endpoint to store a new message
router.post("/", async (req, res) => {
  try {
    const { name, email, message, phonenumber } = req.body;

    const newMessage = new Message({ name, email, message, phonenumber });
    await newMessage.save();
    res
      .status(201)
      .send({ message: "Message created successfully", data: newMessage });
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
