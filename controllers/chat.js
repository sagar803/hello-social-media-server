import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

// API route to create a new chat
export const createChatId = async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;
    const chatId = `${userId1}-${userId2}`;

    // Create a new chat document
    const newChat = new Chat({
      chatId: chatId,
      participants: [userId1, userId2],
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create chat" });
  }
};

export const getChatId = async (req, res) => {
  try {
    const { userId1, userId2 } = req.query;
    console.log(userId1);

    if (!userId1 || !userId2) {
      return res
        .status(400)
        .json({ error: "Both userId1 and userId2 are required" });
    }

    // Generate chatId in a consistent manner
    const chatId1 = `${userId1}-${userId2}`;
    const chatId2 = `${userId2}-${userId1}`; // Check in case the chatId is reversed

    // Find chat document
    const chat = await Chat.findOne({
      $or: [{ chatId: chatId1 }, { chatId: chatId2 }],
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json({ chatId: chat.chatId });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve chat ID" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId: chatId }).sort({
      timestamp: 1,
    });
    if (!messages) return res.status(404).json({ error: "Chat not found" });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve chat" });
  }
};

export const saveMessage = async ({
  chatId,
  senderId,
  recipientId,
  messageText,
}) => {
  try {
    if (!chatId || !senderId || !recipientId || !messageText) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newMessage = new Message({
      chatId: chatId,
      senderId: senderId,
      recipientId: recipientId,
      message: messageText,
    });

    await newMessage.save();

    // await Chat.updateOne(
    //   { chatId: chatId },
    //   { $set: { lastMessageTimestamp: new Date() } }
    // );
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
