import React from "react";

const Loading = () => {
  return (
    <div className="bg-chat-light dark:bg-chat-dark flex flex-col items-center justify-center h-screen w-screen gap-4">
      <div className="w-11 h-11 rounded-full border-[3px] border-primary border-t-transparent animate-spin"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
};

export default Loading;
