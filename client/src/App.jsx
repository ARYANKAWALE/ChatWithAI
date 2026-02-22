import Sidebar from "./components/Sidebar";
import ChatBox from "./components/ChatBox";
import Credits from "./pages/Credits";
import Community from "./pages/Community";
import Loading from "./pages/Loading";
import { Routes, Route, useLocation } from "react-router-dom";
import { assets } from "./assets/assets";
import { useState } from "react";
import "./assets/prism.css";

const App = () => {
  const [isMenuOpen, setIsMeuOpen] = useState(false);
  const {pathname} = useLocation()

  if(pathname === '/loading') return <Loading/>

  return (
    <>
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert"
          onClick={() => setIsMeuOpen(true)}
        />
      )}
      <div className="bg-white dark:bg-[#000000] dark:text-white">
        <div className="flex h-screen w-screen">
          <Sidebar isMenuOpen={isMenuOpen} setIsMeuOpen={setIsMeuOpen} />
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
