import mongoose from "mongoose";
// Define Post and User schemas
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  image: { type: String }, // Add image field to store image filename
});
export const Post = mongoose.model("Post", PostSchema);
