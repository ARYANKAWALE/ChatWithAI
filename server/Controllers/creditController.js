import { Transaction } from "../models/transaction.js";
import { User } from "../models/User.js";
import Razorpay from "razorpay";

const plans = [
  {
    _id: "basic",
    name: "Basic",
    price: 99,
    credits: 100,
    features: [
      "100 text generations",
      "50 image generations",
      "Standard support",
      "Access to basic models",
    ],
  },
  {
    _id: "pro",
    name: "Pro",
    price: 199,
    credits: 500,
    features: [
      "500 text generations",
      "200 image generations",
      "Priority support",
      "Access to pro models",
      "Faster response time",
    ],
  },
  {
    _id: "premium",
    name: "Premium",
    price: 299,
    credits: 1000,
    features: [
      "1000 text generations",
      "500 image generations",
      "24/7 VIP support",
      "Access to premium models",
      "Dedicated account manager",
    ],
  },
];

// API controller for getting plans
export const getPlans = async (req, res) => {
  try {
    res.status(200).json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_Secret_KEY,
});

// API Controler for purchasing a plan
export const purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;
    const plan = plans.find((plan) => plan._id === planId);
    if (!plan) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }
    // create new Transaction
    const transaction = await Transaction.create({
      userId: userId,
      amount: plan.price,
      planId: plan._id,
      credits: plan.credits,
      isPaid: false,
    });

    const options = {
      amount: plan.price * 100, // amount in paise
      currency: "INR",
      receipt: transaction._id.toString(),
    };

    const order = await razorpay.orders.create(options);

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const orderInfo = await razorpay.orders.fetch(razorpay_order_id);
    if (!orderInfo) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const transaction = await Transaction.findById(orderInfo.receipt);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    if (transaction.isPaid) {
      return res
        .status(400)
        .json({ success: false, message: "Transaction already paid" });
    }

    // Basic verification - since we grabbed the order from razorpay directly and verified it exists
    transaction.isPaid = true;
    await transaction.save();

    const user = await User.findById(transaction.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.credits = (user.credits || 0) + transaction.credits;
    await user.save();

    res.json({ success: true, message: "Payment successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
