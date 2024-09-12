import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Chat schema
const chatSchema = new Schema({
  chatId: {
    type: String,
    required: true,
    unique: true, // Ensure unique chatId
  },
  participants: {
    type: [String], // Array of user IDs
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastMessageTimestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "archived", "deleted"],
    default: "active",
  },
});

// Create a Chat model
const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
