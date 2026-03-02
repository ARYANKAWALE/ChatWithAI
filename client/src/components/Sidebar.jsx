import { assets } from "../assets/assets";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import moment from "moment";
import toast from "react-hot-toast";

const Sidebar = ({ isMenuOpen, setIsMeuOpen }) => {
  const {
    chats,
    setSelectedChat,
    theme,
    setTheme,
    user,
    navigate,
    createNewChat,
    axios,
    setChats,
    fetchUsersChats,
    setToken,
    token,
  } = useContext(AppContext);
  const [search, setSearch] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.success("Logged out successfully");
  };
  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation();
      const confirm = window.confirm(
        "Are you sure you want to delete this chat?",
      );
      if (!confirm) return;
      const { data } = await axios.delete("/api/chat/delete", {
        data: { chatId },
        headers: {
          Authorization: token,
        },
      });
      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        await fetchUsersChats();
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div
      className={`sticky top-0 flex flex-col h-screen min-w-[280px] w-72 p-5 bg-white dark:bg-[#0A0A0A] border-r border-gray-200 dark:border-white/5 transition-all duration-500 max-md:fixed left-0 top-0 z-10 ${isMenuOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}`}
    >
      <img
        src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
        alt="Logo"
        className="w-full max-w-48 mb-2"
      />

      <button
        onClick={createNewChat}
        className="flex justify-center items-center w-full py-2.5 mt-6 text-white bg-gradient-to-r from-[#9F5BFF] to-[#3B82F6] rounded-xl cursor-pointer hover:opacity-90 transition-opacity font-medium shadow-lg shadow-purple-500/20"
      >
        <span className="mr-2 text-xl">+</span> New Chat
      </button>

      {/* search conversation */}
      <div className="flex items-center gap-2 p-3 mt-5 border border-gray-300 dark:border-white/10 dark:bg-[#141414] rounded-xl focus-within:border-gray-400 dark:focus-within:border-white/20 transition-all">
        <img
          src={assets.search_icon}
          className="w-4 opacity-60   not-dark:invert"
        />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search conversations"
          className="text-xs placeholder:text-gray-500 outline-none bg-transparent w-full dark:text-gray-200"
        />
      </div>

      {/* Recent chats */}
      {chats.length > 0 && (
        <p className="mt-6 mb-1 text-xs font-semibold text-gray-800 dark:text-gray-300 capitalize tracking-wide">
          Recent Chats
        </p>
      )}
      <div className="flex-1 overflow-y-scroll mt-2 space-y-2 pr-1 custom-scrollbar">
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((chat) => (
            <div
              key={chat._id}
              onClick={() => {
                navigate("/");
                setSelectedChat(chat);
                setIsMeuOpen(false);
              }}
              className="p-3 dark:bg-[#141414] hover:dark:bg-[#1A1A1A] border border-transparent dark:border-white/5 rounded-xl flex justify-between items-center group cursor-pointer transition-colors"
            >
              <div className="flex flex-col overflow-hidden w-full">
                <p className="truncate w-full text-sm font-medium text-gray-900 dark:text-gray-200">
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-1">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>
              <img
                src={assets.bin_icon}
                className="block md:hidden md:group-hover:block w-4 h-4 opacity-60 hover:opacity-100 cursor-pointer not-dark:invert transition-opacity shrink-0"
                onClick={(e) => deleteChat(e, chat._id)}
              />
            </div>
          ))}
      </div>

      {/* <div className="flex flex-col mt-4 gap-2"> */}
      {/* Community images */}
      <div
        onClick={() => {
          navigate("/community");
          setIsMeuOpen(false);
        }}
        className="flex items-center gap-3 p-3 dark:bg-transparent hover:dark:bg-[#141414] rounded-xl cursor-pointer transition-all border border-transparent dark:border-white/10"
      >
        <img
          src={assets.gallery_icon}
          className="w-5 dark:opacity-80 not-dark:invert"
        />
        <div className="flex flex-col text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors">
          <p>Community Images</p>
        </div>
      </div>

      {/* Credits options */}
      <div
        onClick={() => {
          navigate("/credits");
          setIsMeuOpen(false);
        }}
        className="flex items-center gap-3 p-3 dark:bg-transparent hover:dark:bg-[#141414] rounded-xl cursor-pointer transition-all border border-transparent dark:hover:border-white/5"
      >
        <img
          src={assets.diamond_icon}
          className="w-5 dark:invert dark:opacity-80"
        />
        <div className="flex flex-col text-sm font-medium text-gray-800 dark:text-gray-200">
          <p>Credits: {user?.credits}</p>
        </div>
      </div>

      {/* Dark Mode toggle */}
      <div className="flex items-center justify-between p-3 dark:bg-transparent hover:dark:bg-[#141414] rounded-xl transition-all border border-transparent dark:hover:border-white/5">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-gray-200">
          <img
            src={assets.theme_icon}
            className="w-5 dark:opacity-80 not-dark:invert"
          />
          <p>Dark Mode</p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            onChange={() => {
              setTheme(theme === "dark" ? "light" : "dark");
            }}
            type="checkbox"
            className="sr-only peer"
            checked={theme === "dark"}
          />
          <div className="w-8 h-4 bg-gray-300 dark:bg-[#202020] rounded-full peer-checked:bg-gradient-to-r peer-checked:from-[#9F5BFF] peer-checked:to-[#3B82F6] transition-all"></div>
          <span className="absolute left-[2px] top-[2px] w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-4 shadow pointer-events-none"></span>
        </label>
      </div>
      {/* User Account */}
      <div className="flex items-center gap-3 p-3 mt-4  dark:bg-transparent hover:dark:bg-[#141414] rounded-xl cursor-pointer group">
        <img src={assets.user_icon} className="w-7 rounded-full" />
        <p className="flex-1 text-sm dark:text-primary truncate">
          {user ? user.name : "Login your account"}
        </p>
        {user && (
          <img
            onClick={logout}
            src={assets.logout_icon}
            className="h-5 cursor-pointer not-dark:invert block md:hidden md:group-hover:block"
          />
        )}
      </div>

      <img
        onClick={() => {
          setIsMeuOpen(false);
        }}
        src={assets.close_icon}
        className="absolute top-4 right-4 w-5 h-5 cursor-pointer md:hidden not-dark:invert"
      />
    </div>
  );
};

export default Sidebar;
