import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import chatRoutes from "./routes/chat.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { saveMessage } from "./controllers/chat.js";
import Message from "./models/Message.js";

// CONFIGURATIONS

//This is only when you use type module in package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
//To console log any request comming to backend, morgan is used
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// FILE STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// ROUTES WITH FILES
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

// ROUTES
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/chat", chatRoutes);

// MONGOOSE SETUP
/* if there is an error regarding ip address you can visit myipaddress.com and add your ip address to your mongoDB network access*/
const port = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const httpServer = createServer(app); // Create HTTP server with Express

    const io = new Server(httpServer, {
      cors: {
        origin: "*", // Adjust CORS for your frontend
      },
    });

    const onlineUsers = {};

    io.on("connection", (socket) => {
      socket.on("userOnline", (userId) => {
        onlineUsers[userId] = socket.id;
        io.emit("onlineUsers", Object.keys(onlineUsers));
        console.log(onlineUsers);
      });

      socket.on(
        "privateMessage",
        async ({ chatId, senderId, receiverId, message, timestamp }) => {
          const receiverSocketId = onlineUsers[receiverId];

          try {
            const newMessage = new Message({
              chatId,
              senderId: senderId,
              recipientId: receiverId,
              message: message,
              timestamp,
            });

            if (receiverSocketId) {
              io.to(receiverSocketId).emit("receivePrivateMessage", newMessage);
            } else {
              console.log(`User ${receiverId} is not online.`);
            }

            await newMessage.save();
          } catch (error) {
            console.error("Error saving message:", error);
          }
        }
      );

      socket.on("disconnect", () => {
        for (let userId in onlineUsers) {
          if (onlineUsers[userId] === socket.id) {
            delete onlineUsers[userId];
            console.log(`User ${userId} went offline`);
            io.emit("onlineUsers", Object.keys(onlineUsers));
            break;
          }
        }
      });
    });

    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
