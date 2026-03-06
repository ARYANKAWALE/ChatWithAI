import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";
import Credits from "./pages/Credits";
import Community from "./pages/Community";
import Loading from "./pages/Loading";
import { Routes, Route, useLocation } from "react-router-dom";
import { assets } from "./assets/assets";
import { useState } from "react";
import "./assets/prism.css";
import { useAppContext } from "./context/AppContext";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { user, loadingUser } = useAppContext();
  const [isMenuOpen, setIsMeuOpen] = useState(false);
  const { pathname } = useLocation();

  if (pathname === "/loading" || loadingUser) return <Loading />;

  return (
    <>
      <Toaster
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#111b21",
            color: "#e9edef",
            border: "1px solid rgba(37, 211, 102, 0.2)",
          },
        }}
      />
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          className="absolute top-4 left-4 w-7 h-7 cursor-pointer md:hidden not-dark:invert z-20 hover:opacity-80 transition-opacity"
          onClick={() => setIsMeuOpen(true)}
        />
      )}
      {user ? (
        <div className="bg-chat-light dark:bg-chat-dark dark:text-white transition-colors duration-300">
          <div className="flex h-[100dvh] w-full overflow-hidden">
            <Sidebar isMenuOpen={isMenuOpen} setIsMeuOpen={setIsMeuOpen} />
            <Routes>
              <Route path="/" element={<ChatBox />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/community" element={<Community />} />
              <Route path="/loading" element={<Loading />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary-darker via-primary-dark to-primary-darker dark:from-[#0b141a] dark:via-[#111b21] dark:to-[#0b141a] flex items-center justify-center h-screen w-screen">
          <Login />
        </div>
      )}
    </>
  );
};

export default App;
