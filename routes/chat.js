import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getChatId, createChatId, getMessages } from "../controllers/chat.js";

const router = express.Router();

router.post("/newChat", verifyToken, createChatId);
router.get("/messages/:chatId", verifyToken, getMessages);
router.get("/chatId", verifyToken, getChatId);

export default router;
