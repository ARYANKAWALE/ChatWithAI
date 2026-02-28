import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Chat } from "../models/Chat.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// API to register User
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    return res
      .status(200)
      .json({ success: true, message: "User created successfully", token });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    return res
      .status(200)
      .json({ success: true, message: "User LoggedIn successfully..!", token });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = req.user;
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to get publised images
export const getPublishedImages = async (req, res) => {
  try {
    const publishedImageMessages = await Chat.aggregate([
      { $unwind: "$messages" },
      {
        $match: {
          "messages.isImage": true,
          "messages.isPublished": true,
        },
      },
      {
        $project: {
          _id: 0,
          imageUrl: "$messages.content",
          userName: "$username",
        },
      },
    ]);
    res
      .status(200)
      .json({ success: true, images: publishedImageMessages.reverse() });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
