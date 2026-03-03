import React from "react";

const Loading = () => {
  return (
    <div className="bg-white dark:bg-[#2E2D2D] backdrop-opacity-60 flex items-center justify-center h-screen w-screen text-gray-800 dark:text-white text-2xl">
      <div className="w-10 h-10 rounded-full border-3 border-[#d0b611] border-t-transparent animate-spin"></div>
    </div>
  );
};

export default Loading;
