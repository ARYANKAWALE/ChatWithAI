import express from "express";
import {
  getPlans,
  purchasePlan,
  verifyRazorpay,
} from "../Controllers/creditController.js";
import { protect } from "../Middlewares/auth.js";

const creditRouter = express.Router();
creditRouter.get("/plan", getPlans);
creditRouter.post("/purchase", protect, purchasePlan);
creditRouter.post("/verify", protect, verifyRazorpay);

export default creditRouter;
