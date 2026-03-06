import express from "express";
import { protect } from "../Middlewares/auth.js";
import {
  textMessageController,
  imageMessageController,
  editLastMessage,
} from "../Controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.post("/text", protect, textMessageController);
messageRouter.post("/image", protect, imageMessageController);
messageRouter.put("/edit", protect, editLastMessage);

export default messageRouter;
