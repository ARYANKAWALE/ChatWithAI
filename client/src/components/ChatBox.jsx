import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";

/* ── Inline SVG icons (monochrome, 16px) ── */
const IconText = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconImage = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);
const IconBrush = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
    <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
    <path d="M14.5 17.5 4.5 15" />
  </svg>
);
const IconBat = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m4.93 4.93 4.24 4.24" />
    <path d="m14.83 9.17 4.24-4.24" />
    <path d="M12 2v4" />
    <path d="M12 18v4" />
  </svg>
);
const IconMusic = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);
const IconPen = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

const ChatBox = () => {
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const { selectedChat, setSelectedChat, theme, user, setUser, axios, token } =
    useAppContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("image");
  const [editingIndex, setEditingIndex] = useState(null);

  const MAX_CHARS = 2000;

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  // Find the index of the last user message
  const lastUserMsgIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return i;
    }
    return -1;
  })();

  const onSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (!prompt.trim()) return toast.error("Please enter a message");
      if (!user) return toast.error("Login to send message");
      if (!selectedChat)
        return toast.error("Please wait while a new session is starting...");
      setLoading(true);
      const promptCopy = prompt;
      setPrompt("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: promptCopy,
          timestamp: new Date(),
          isImage: false,
        },
      ]);
      const { data } = await axios.post(
        `/api/message/${mode}`,
        {
          chatId: selectedChat._id,
          prompt: promptCopy,
          isPublished: mode === "image",
        },
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
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (newContent) => {
    if (!newContent.trim() || !selectedChat) return;
    setEditingIndex(null);
    setLoading(true);

    try {
      const { data } = await axios.put(
        "/api/message/edit",
        { chatId: selectedChat._id, newContent: newContent.trim() },
        { headers: { Authorization: token } },
      );

      if (data.success) {
        setMessages(data.messages);
        setUser((prev) => ({ ...prev, credits: prev.credits - 1 }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    } else {
      setMessages([]);
    }
    setEditingIndex(null);
  }, [selectedChat?._id]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    autoResize();
  }, [prompt]);

  const renderForm = () => (
    <form
      onSubmit={onSubmit}
      className="bg-white dark:bg-[#1f2c34] border border-gray-200 dark:border-white/8 rounded-2xl w-full max-w-2xl p-2 pl-3 flex gap-2 items-center shadow-lg shadow-black/5 dark:shadow-black/20 transition-all focus-within:border-primary/30 dark:focus-within:border-primary/20"
    >
      <div className="flex items-center gap-1.5 border-r border-gray-200 dark:border-white/10 pr-2">
        <button
          type="button"
          onClick={() => setMode(mode === "text" ? "image" : "text")}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title={`Switch to ${mode === "text" ? "Image" : "Text"} mode`}
        >
          {mode === "text" ? <IconText /> : <IconImage />}
          <span>{mode === "text" ? "Text" : "Image"}</span>
        </button>
      </div>
      <textarea
        ref={textareaRef}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            setPrompt(e.target.value);
          }
        }}
        onKeyDown={handleKeyDown}
        value={prompt}
        rows={1}
        placeholder={
          mode === "image"
            ? "Describe the image you want..."
            : "Type a message..."
        }
        className="auto-resize-textarea flex-1 text-sm outline-none bg-transparent dark:text-gray-200 placeholder:text-gray-400 min-w-0"
      />
      {prompt.length > 0 && (
        <span
          className={`text-[10px] transition-colors shrink-0 ${prompt.length > MAX_CHARS * 0.9 ? "text-red-400" : "text-gray-400"}`}
        >
          {prompt.length}/{MAX_CHARS}
        </span>
      )}
      <button
        disabled={loading}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:shadow-md hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 ripple shrink-0"
      >
        <img
          src={loading ? assets.stop_icon : assets.send_icon}
          className="w-4.5 invert"
        />
      </button>
    </form>
  );

  return (
    <div
      className={`flex flex-1 flex-col m-2 sm:m-5 md:m-8 max-md:mt-14 min-h-0 page-enter ${messages.length === 0 ? "justify-center items-center" : "justify-between xl:mx-30 2xl:pr-40"}`}
    >
      {messages.length === 0 ? (
        <div className="w-full max-w-3xl flex flex-col gap-5 items-center -mt-12 px-4">
          {/* Welcome — centered */}
          <div className="text-center mb-1">
            <h1 className="text-4xl sm:text-5xl font-semibold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
                Hi {user?.name?.split(" ")[0] || "there"}
              </span>
            </h1>
            <h2 className="text-xl sm:text-3xl font-medium text-gray-400 dark:text-gray-500">
              Where should we start?
            </h2>
          </div>

          {renderForm()}

          {/* Quick action chips with stagger — centered */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {[
              {
                icon: <IconBrush />,
                label: "Create image",
                prompt: "Create an image of ",
              },
              {
                icon: <IconBat />,
                label: "Explore cricket",
                prompt: "Explore cricket ",
              },
              {
                icon: <IconMusic />,
                label: "Create music",
                prompt: "Create music about ",
              },
              {
                icon: <IconPen />,
                label: "Write anything",
                prompt: "Write a story about ",
              },
            ].map((chip, i) => (
              <div
                key={i}
                onClick={() => setPrompt(chip.prompt)}
                className="stagger-item px-3.5 py-2 bg-white dark:bg-[#1f2c34] border border-gray-200 dark:border-white/8 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:border-primary/40 hover:text-primary dark:hover:border-primary/30 dark:hover:text-primary transition-all hover:shadow-sm active:scale-95 flex items-center gap-2 ripple"
              >
                {chip.icon}
                <span className="hidden sm:inline">{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Chat messages */}
          <div
            ref={containerRef}
            className="flex-1 mb-4 overflow-y-auto overflow-x-hidden pr-1 sm:pr-2 chat-bg-pattern rounded-2xl p-2 sm:p-4"
          >
            {messages.map((msg, index) => (
              <Message
                key={index}
                message={msg}
                index={index}
                isLastUserMessage={index === lastUserMsgIndex && !loading}
                isEditing={editingIndex === index}
                onStartEdit={() => setEditingIndex(index)}
                onCancelEdit={() => setEditingIndex(null)}
                onSaveEdit={handleEditMessage}
              />
            ))}

            {/* Typing indicator bubble */}
            {loading && (
              <div className="msg-animate flex items-start my-3 gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                  AI
                </div>
                <div className="inline-flex items-center gap-1.5 py-3 px-5 bg-white dark:bg-ai-bubble-dark rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-white/5">
                  <div className="w-2 h-2 rounded-full bg-primary/60 typing-dot"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 typing-dot"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 typing-dot"></div>
                </div>
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
