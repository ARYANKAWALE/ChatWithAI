import React from "react";
import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";
import Credits from "./pages/Credits";
import Community from "./pages/Community";
import Loading from "./pages/loading";
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <>
    <div className="dark:bg-gradient-to-b from-[#242124] to-[#00000] dark:text-white">

      <div className="flex h-screen w-screen">
        <Sidebar />
        <Routes>
          <Route path="/" element={<ChatBox />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/community" element={<Community />} />
          <Route path="/loading" element={<Loading />} />
        </Routes>
      </div>
    </div>
    </>
  );
};

export default App;
