import axios from "axios";
import { Chat } from "../models/Chat.js";
import { User } from "../models/User.js";
import imagekit from "../Configs/imagekit.js";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY,
});

// Helper: build conversation context from last N messages
const buildConversationContext = (
  messages,
  currentPrompt,
  maxMessages = 10,
) => {
  const recentMessages = messages
    .filter((m) => !m.isImage)
    .slice(-maxMessages)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

  recentMessages.push({ role: "user", content: currentPrompt });
  return recentMessages;
};

// Helper: auto-generate a short chat title from the first prompt
const generateChatTitle = (prompt) => {
  // Take first 40 chars, trim to last complete word
  const trimmed = prompt.slice(0, 40).trim();
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace > 20) {
    return trimmed.slice(0, lastSpace) + "…";
  }
  return trimmed.length < prompt.length ? trimmed + "…" : trimmed;
};

export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    if (req.user.credits < 1) {
      return res.status(402).json({
        success: false,
        message:
          "Insufficient credits. Please purchase more credits to continue.",
        errorType: "INSUFFICIENT_CREDITS",
      });
    }
    const { chatId, prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
        errorType: "INVALID_INPUT",
      });
    }

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
        errorType: "NOT_FOUND",
      });
    }

    // Push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Build full conversation context for multi-turn
    const conversationMessages = buildConversationContext(
      chat.messages,
      prompt,
    );
    // Remove the duplicate last message since we already pushed it
    conversationMessages.pop();
    const contextMessages = chat.messages
      .filter((m) => !m.isImage)
      .slice(-10)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: contextMessages,
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };

    // Auto-name chat if it's still "New Chat" and this is the first real message
    if (chat.name === "New Chat" && chat.messages.length <= 2) {
      chat.name = generateChatTitle(prompt);
    }

    res.json({ success: true, reply });
    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (error) {
    console.error("Text message error:", error);
    const statusCode = error.status || 500;
    const errorType =
      error.code === "insufficient_quota" ? "API_QUOTA" : "SERVER_ERROR";
    res.status(statusCode).json({
      success: false,
      message:
        errorType === "API_QUOTA"
          ? "AI service is temporarily unavailable. Please try again later."
          : error.message || "Something went wrong. Please try again.",
      errorType,
    });
  }
};

export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    if (req.user.credits < 2) {
      return res.status(402).json({
        success: false,
        message: "Insufficient credits. Image generation requires 2 credits.",
        errorType: "INSUFFICIENT_CREDITS",
      });
    }
    const { prompt, chatId, isPublished } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt cannot be empty",
        errorType: "INVALID_INPUT",
      });
    }

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
        errorType: "NOT_FOUND",
      });
    }

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // ENCODE THE PROMPT
    const encodedPrompt = encodeURIComponent(prompt);
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
      timeout: 30000, // 30s timeout for image generation
    });

    const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;

    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "quickgpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    // Auto-name chat
    if (chat.name === "New Chat" && chat.messages.length <= 2) {
      chat.name = generateChatTitle(prompt);
    }

    res.json({ success: true, reply });
    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (error) {
    console.error("Image message error:", error);
    const isTimeout =
      error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
    res.status(isTimeout ? 504 : 500).json({
      success: false,
      message: isTimeout
        ? "Image generation timed out. Please try again with a simpler prompt."
        : error.message || "Failed to generate image. Please try again.",
      errorType: isTimeout ? "TIMEOUT" : "SERVER_ERROR",
    });
  }
};

export const editLastMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    if (req.user.credits < 1) {
      return res
        .status(402)
        .json({
          success: false,
          message: "Insufficient credits.",
          errorType: "INSUFFICIENT_CREDITS",
        });
    }

    const { chatId, newContent } = req.body;

    if (!newContent || !newContent.trim()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Message cannot be empty",
          errorType: "INVALID_INPUT",
        });
    }

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Chat not found",
          errorType: "NOT_FOUND",
        });
    }

    // Find the last user message index
    let lastUserIdx = -1;
    for (let i = chat.messages.length - 1; i >= 0; i--) {
      if (chat.messages[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }

    if (lastUserIdx === -1) {
      return res
        .status(400)
        .json({
          success: false,
          message: "No user message found to edit",
          errorType: "INVALID_INPUT",
        });
    }

    // Update the user message content
    chat.messages[lastUserIdx].content = newContent.trim();
    chat.messages[lastUserIdx].timestamp = Date.now();

    // Remove all messages after the edited user message (the AI reply)
    chat.messages = chat.messages.slice(0, lastUserIdx + 1);

    // Re-generate AI response using conversation context
    const contextMessages = chat.messages
      .filter((m) => !m.isImage)
      .slice(-10)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: contextMessages,
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };

    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

    // Return updated messages so frontend can sync
    res.json({ success: true, reply, messages: chat.messages });
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to edit message.",
      errorType: "SERVER_ERROR",
    });
  }
};
