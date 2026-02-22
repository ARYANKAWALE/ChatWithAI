import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
const ChatBox = () => {
  const containerRef = useRef(null)
  const { selectedChat, theme } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("image");
  const [isPublished, setIsPublished] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top:containerRef.current.scrollHeight,behaviour:"smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40 min-h-0">
      {/* chat messages */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <img
              src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
              className="w-full max-w-[200px] mb-4"
            />
            <p className="text-4xl sm:text-5xl text-center text-gray-400 dark:text-gray-300 font-medium">
              Ask me anything.
            </p>
          </div>
        )}
        {messages.map((messages, index) => (
          <Message key={index} message={messages} />
        ))}

        {/* Three dot loading */}
        {loading && (
          <div className="loader flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )}
      </div>

      {mode === "image" && (
        <label className="flex items-center justify-center gap-2 mb-3 text-sm mx-auto w-full max-w-2xl">
          <p className="text-xs text-gray-500 dark:text-gray-300">
            Publish Generated Image to Community
          </p>
          <input
            type="checkbox"
            className="cursor-pointer accent-purple-700 dark:accent-purple-400"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {/* Prompt input */}
      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center"
      >
        <div className="flex items-center gap-2 border-r border-gray-300 dark:border-[#583C79] pr-3">
          <select
            onChange={(e) => setMode(e.target.value)}
            value={mode}
            className="text-sm outline-none bg-transparent cursor-pointer dark:text-gray-200"
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
          type="text"
          placeholder="Type your prompt here..."
          className="flex-1 w-full text-sm outline-none"
          required
        />
        <button disabled={loading}>
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-8 cursor-pointer"
          />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
