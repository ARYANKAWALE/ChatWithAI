import React from "react";
import { assets } from "../assets/assets";
import moment from "moment";
import Markdown from "react-markdown";
import { useEffect } from "react";
import Prism from "prismjs";

const Message = ({ message }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start justify-end my-4 gap-2">
          <div className="flex flex-col gap-2 p-2 px-4 bg-[#fdf6e3] dark:bg-[#1e1a02] max-w-2xl rounded-2xl rounded-tr-sm">
            <p className="text-sm">{message.content}</p>
            <span className="text-xs text-gray-400 ">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
          <img
            src={assets.user_icon}
            className="w-8 rounded-full"
            alt="User Icon"
          />
        </div>
      ) : (
        <div className="inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-[#d0b611]/10 dark:bg-[#282a2c] my-4 rounded-2xl rounded-tl-sm">
          {message.isImage ? (
            <img
              src={message.content}
              alt=""
              className="w-full max-w-md mt-2 rounded-md"
            />
          ) : (
            <div className="text-sm reset-tw">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
          <span className="text-xs text-gray-400">
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
      )}
    </div>
  );
};

export default Message;
