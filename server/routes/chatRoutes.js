import express from "express"
import { createdChat, deleteChats, getChats } from "../Controllers/chatController.js";
import { protect } from "../Middlewares/auth.js";

const chatRouter = express.Router();

chatRouter.get('/create',protect,createdChat)
chatRouter.get('/get',protect,getChats)
chatRouter.delete('/delete',protect,deleteChats)

export default chatRouter