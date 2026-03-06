import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";
const ChatBox = () => {
  const containerRef = useRef(null);
  const { selectedChat, setSelectedChat, theme, user, setUser, axios, token } =
    useAppContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("image");

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!prompt.trim()) return toast.error("Please enter a message");
      if (!user) return toast.error("Login to send message");
      if (!selectedChat)
        return toast.error("Please wait while a new session is starting...");
      setLoading(true);
      const promptCopy = prompt;
      setPrompt("");
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: prompt,
          timestamp: new Date(),
          isImage: false,
        },
      ]);
      const { data } = await axios.post(
        `/api/message/${mode}`,
        { chatId: selectedChat._id, prompt, isPublished: mode === "image" },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.reply]);
        if (mode === "image") {
          setUser((prev) => ({ ...prev, credits: prev.credits - 2 }));
        } else {
          setUser((prev) => ({ ...prev, credits: prev.credits - 1 }));
        }
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setPrompt(promptCopy);
    } finally {
      setLoading(false);
    }
  };

  // Only reload messages when switching to a different chat (by _id),
  // not when the same chat object gets updated
  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    } else {
      setMessages([]);
    }
  }, [selectedChat?._id]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behaviour: "smooth",
      });
    }
  }, [messages]);

  const renderForm = () => (
    <form
      onSubmit={onSubmit}
      className="bg-primary/10 dark:bg-[#1a1a1a] border border-primary/20 dark:border-gray-800 rounded-full w-full max-w-3xl p-3 pl-4 flex gap-4 items-center shadow-sm"
    >
      <div className="flex items-center gap-2 border-r border-gray-300 dark:border-gray-800 pr-3">
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm outline-none bg-transparent cursor-pointer dark:text-gray-400"
        >
          <option className="dark:bg-[#0A0A0A]" value="text">
            Text
          </option>
          <option className="dark:bg-[#0A0A0A]" value="image">
            Image
          </option>
        </select>
      </div>
      <input
        onChange={(e) => {
          setPrompt(e.target.value);
        }}
        value={prompt}
        type="text"
        placeholder={
          mode === "image" ? "Ask Gemini to create..." : "Ask Gemini 3..."
        }
        className="flex-1 w-full text-base outline-none bg-transparent dark:text-gray-200"
      />
      <button disabled={loading}>
        <img
          src={loading ? assets.stop_icon : assets.send_icon}
          className="w-8 cursor-pointer"
        />
      </button>
    </form>
  );

  return (
    <div
      className={`flex flex-1 flex-col m-5 md:m-10 max-md:mt-14 min-h-0 ${messages.length === 0 ? "justify-center items-center" : "justify-between xl:mx-30 2xl:pr-40"}`}
    >
      {messages.length === 0 ? (
        <div className="w-full max-w-3xl flex flex-col gap-6 -mt-20 px-4">
          <div className="mb-2 pl-2">
            <h1 className="text-4xl sm:text-5xl font-medium mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400 font-semibold">
                ✨ Hi {user?.name?.split(" ")[0] || "aryan"}
              </span>
            </h1>
            <h2 className="text-3xl sm:text-5xl font-medium text-gray-400 dark:text-gray-500">
              Where should we start?
            </h2>
          </div>

          {renderForm()}

          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 ml-2">
            <div
              onClick={() => setPrompt("Create an image of ")}
              className="px-4 py-2.5 bg-gray-100 dark:bg-[#1a1a1a] rounded-full text-sm font-medium dark:text-gray-400 border border-transparent cursor-pointer hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors flex items-center gap-2"
            >
              🎨 <span className="hidden sm:inline">Create image</span>
            </div>
            <div
              onClick={() => setPrompt("Explore cricket ")}
              className="px-4 py-2.5 bg-gray-100 dark:bg-[#1a1a1a] rounded-full text-sm font-medium dark:text-gray-400 border border-transparent cursor-pointer hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors flex items-center gap-2"
            >
              🏏 <span className="hidden sm:inline">Explore cricket</span>
            </div>
            <div
              onClick={() => setPrompt("Create music about ")}
              className="px-4 py-2.5 bg-gray-100 dark:bg-[#1a1a1a] rounded-full text-sm font-medium dark:text-gray-400 border border-transparent cursor-pointer hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors flex items-center gap-2"
            >
              🎸 <span className="hidden sm:inline">Create music</span>
            </div>
            <div
              onClick={() => setPrompt("Write a story about ")}
              className="px-4 py-2.5 bg-gray-100 dark:bg-[#1a1a1a] rounded-full text-sm font-medium dark:text-gray-400 border border-transparent cursor-pointer hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors flex items-center gap-2"
            >
              ✍️ <span className="hidden sm:inline">Write anything</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* chat messages */}
          <div
            ref={containerRef}
            className="flex-1 mb-5 overflow-y-auto overflow-x-hidden pr-2"
          >
            {messages.map((msg, index) => (
              <Message key={index} message={msg} />
            ))}

            {/* Three dot loading */}
            {loading && (
              <div className="loader flex items-center gap-1.5 mt-4 ml-4">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
              </div>
            )}
          </div>

          <div className="w-full mx-auto flex flex-col items-center">
            {renderForm()}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;
