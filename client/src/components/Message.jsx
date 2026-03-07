import React, { useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import moment from "moment";
import Markdown from "react-markdown";
import Prism from "prismjs";
import toast from "react-hot-toast";

/* ── Inline SVG icons (monochrome, 12-14px) ── */
const IconCopy = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconEdit = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);
const IconX = () => (
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const formatTimestamp = (timestamp) => {
  const m = moment(timestamp);
  if (m.isSame(moment(), "day")) return m.format("h:mm A");
  if (m.isSame(moment().subtract(1, "day"), "day"))
    return "Yesterday " + m.format("h:mm A");
  return m.format("MMM D, h:mm A");
};

const Message = ({
  message,
  index = 0,
  isLastUserMessage = false,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}) => {
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const editRef = useRef(null);

  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      const len = editRef.current.value.length;
      editRef.current.setSelectionRange(len, len);
      editRef.current.style.height = "auto";
      editRef.current.style.height = editRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  useEffect(() => {
    setEditText(message.content);
  }, [message.content]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (editText.trim() && editText.trim() !== message.content) {
        onSaveEdit(editText);
      } else {
        onCancelEdit();
      }
    }
    if (e.key === "Escape") {
      setEditText(message.content);
      onCancelEdit();
    }
  };

  return (
    <>
      <div
        className="msg-animate"
        style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
      >
        {message.role === "user" ? (
          <div className="flex items-start justify-end my-3 gap-1.5 sm:gap-2.5 group mb-8 sm:mb-3">
            <div className="flex flex-col gap-1.5 py-2.5 px-3 sm:px-4 bg-user-bubble dark:bg-user-bubble-dark max-w-[85%] sm:max-w-2xl rounded-2xl rounded-tr-sm shadow-sm relative break-words">
              {isEditing ? (
                /* ── Inline Edit Mode ── */
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <textarea
                    ref={editRef}
                    value={editText}
                    onChange={(e) => {
                      setEditText(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    onKeyDown={handleEditKeyDown}
                    className="text-sm text-gray-800 dark:text-gray-100 bg-transparent outline-none resize-none leading-relaxed w-full border-b-2 border-primary pb-1"
                    rows={1}
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditText(message.content);
                        onCancelEdit();
                      }}
                      className="text-[11px] px-3 py-1 rounded-lg border border-gray-300 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (
                          editText.trim() &&
                          editText.trim() !== message.content
                        ) {
                          onSaveEdit(editText);
                        } else {
                          onCancelEdit();
                        }
                      }}
                      disabled={
                        !editText.trim() || editText.trim() === message.content
                      }
                      className="text-[11px] px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save & Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Normal Display Mode ── */
                <>
                  <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    {message.isEdited && (
                      <span className="text-[10px] text-gray-400 dark:text-green-200/40 italic">
                        edited
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500 dark:text-green-200/50">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </>
              )}

              {/* Action buttons */}
              {!isEditing && (
                <div className="absolute top-[calc(100%+4px)] right-0 sm:top-1/2 sm:-translate-y-1/2 sm:right-auto sm:-left-20 flex sm:flex-row gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all z-10 w-max">
                  {/* Edit button — only on last user message */}
                  {isLastUserMessage && onStartEdit && (
                    <button
                      onClick={onStartEdit}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-ai-bubble-dark shadow-md border border-gray-100 dark:border-white/10 hover:scale-110 cursor-pointer transition-transform text-gray-500 dark:text-gray-400"
                      title="Edit message"
                    >
                      <IconEdit />
                    </button>
                  )}
                  {/* Copy button */}
                  <button
                    onClick={copyToClipboard}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-ai-bubble-dark shadow-md border border-gray-100 dark:border-white/10 hover:scale-110 cursor-pointer transition-transform text-gray-500 dark:text-gray-400"
                    title="Copy"
                  >
                    {copied ? <IconCheck /> : <IconCopy />}
                  </button>
                </div>
              )}
            </div>
            <img
              src={assets.user_icon}
              className="w-8 h-8 rounded-full ring-2 ring-primary/30 shadow-sm shrink-0"
              alt="User"
            />
          </div>
        ) : (
          <div className="flex items-start my-3 gap-1.5 sm:gap-2.5 group mb-8 sm:mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
              AI
            </div>
            <div className="inline-flex flex-col gap-1.5 py-2.5 px-3 sm:px-4 max-w-[85%] sm:max-w-2xl bg-white dark:bg-ai-bubble-dark rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-white/5 relative break-words">
              {message.isImage ? (
                <img
                  src={message.content}
                  alt="AI Generated"
                  className="w-full max-w-md mt-1 rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxOpen(true)}
                />
              ) : (
                <div className="text-sm reset-tw text-gray-800 dark:text-gray-200 leading-relaxed overflow-x-auto w-full">
                  <Markdown>{message.content}</Markdown>
                </div>
              )}
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              {/* Copy button for text messages */}
              {!message.isImage && (
                <button
                  onClick={copyToClipboard}
                  className="absolute top-[calc(100%+4px)] left-0 sm:top-1/2 sm:-translate-y-1/2 sm:left-auto sm:-right-12 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-ai-bubble-dark shadow-md border border-gray-100 dark:border-white/10 hover:scale-110 cursor-pointer text-gray-500 dark:text-gray-400 z-10"
                  title="Copy"
                >
                  {copied ? <IconCheck /> : <IconCopy />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && message.isImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 lightbox-overlay cursor-pointer"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={message.content}
              alt="Full size"
              className="lightbox-image max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-ai-bubble-dark rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform cursor-pointer"
            >
              <IconX />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
