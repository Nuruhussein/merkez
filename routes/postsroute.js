import express from "express";
import { Post } from "../models/Posts.js";
// postsroute.js

import { isLoggedIn, isAdmin } from "../middleware/middleware.js";

const router = express.Router();
// Route for getting all posts
router.get("/", async (request, response) => {
  try {
    const posts = await Post.find({}).limit(8);
    return response.status(200).json({ posts });
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

// Route for creating posts
router.post("/", async (request, response) => {
  try {
    if (!request.body.title || !request.body.content || !request.body.image) {
      return response.status(400).json({
        message: "Send all required fields: title, content, image",
      });
    }
    const newPost = {
      title: request.body.title,
      content: request.body.content,

      image: request.body.image, // Updated to retrieve image filename from request body
    };
    const post = await Post.create(newPost);
    return response.status(201).json(post);
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

// Route for deleting a post by ID
router.delete("/:id", isLoggedIn, isAdmin, async (request, response) => {
  try {
    const { id } = request.params;
    const result = await Post.findByIdAndDelete(id);
    if (!result) {
      return response.status(404).json({ message: "Post not found" });
    } else {
      return response
        .status(200)
        .json({ message: "Post deleted successfully" });
    }
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});
// Route for getting a post by ID
router.get("/:id", async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);
    if (!post) {
      return response.status(404).json({ message: "Post not found" });
    } else {
      return response.status(200).json({ post });
    }
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

// Route for updating a post by ID
router.put("/:id", async (request, response) => {
  try {
    if (!request.body.title || !request.body.content || !request.body.image) {
      return response.status(400).json({
        message: "Send all required fields: title, content",
      });
    }
    const { id } = request.params;

    const result = await Post.findByIdAndUpdate(id, request.body);
    if (!result) {
      return response.status(404).json({ message: "Post not found" });
    }
    return response.status(200).json({ message: "Post updated successfully" });
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

// // Route for creating posts
// app.post("/posts", isLoggedIn, isAdmin, async (request, response) => {
//   try {
//     if (!request.body.title || !request.body.content) {
//       return response.status(400).json({
//         message: "Send all required fields: title, content",
//       });
//     }
//     const newPost = {
//       title: request.body.title,
//       content: request.body.content,
//       author: request.user._id,
//       image: request.body.image, // Set image filename in the post
//     };
//     const post = await Post.create(newPost);
//     return response.status(201).json(post);
//   } catch (error) {
//     console.log(error.message);
//     response.status(500).json({ message: error.message });
//   }
// });

export default router;
