import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  deleteUser,
  getUsers, 
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// READ
// the syntax :id = if frontend is sending a particular id we can grab it 
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);
router.get("/", verifyToken, getUsers);

/* UPDATE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);

/*DELETE USER*/
router.delete("/:id", verifyToken, deleteUser);


export default router;