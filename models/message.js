import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: false },
  message: { type: String, required: false },
  phonenumber: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});
export const Message = mongoose.model("Message", MessageSchema);
