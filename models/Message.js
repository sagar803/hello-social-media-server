import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the Message schema
const messageSchema = new Schema({
  chatId: {
    type: String,
    required: true,
    ref: "Chat", // Reference to the Chat schema
  },
  senderId: {
    type: String,
    required: true,
  },
  recipientId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create a Message model
const Message = mongoose.model("Message", messageSchema);

export default Message;
