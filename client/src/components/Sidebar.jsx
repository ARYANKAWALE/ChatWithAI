import { assets } from "../assets/assets";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";

const Sidebar = () => {
  const { chats, setSelectedChat, theme, setTheme, user } =
    useContext(AppContext);
  const [search, setSearch] = useState("");
  return (
    <div
      className="flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30
     border-r border-[#800609F]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-1"
    >
      <img
        src={theme === "dark" ? assets.logo_light : assets.logo_dark}
        alt=""
        className="w-full max-w-48"
      />
    </div>
  );
};

export default Sidebar;
