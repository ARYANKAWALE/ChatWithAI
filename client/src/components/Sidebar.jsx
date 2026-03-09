import { assets } from "../assets/assets";
import { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import moment from "moment";
import toast from "react-hot-toast";

const Sidebar = ({ isMenuOpen, setIsMeuOpen }) => {
  const {
    chats,
    selectedChat,
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
    loadingChats,
    renameChat,
  } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editName, setEditName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const editInputRef = useRef(null);

  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.success("Logged out successfully");
  };

  const handleRenameSubmit = async (chatId) => {
    if (editName.trim()) {
      await renameChat(chatId, editName.trim());
    }
    setEditingChatId(null);
    setEditName("");
  };

  const confirmDelete = async (chatId) => {
    try {
      const { data } = await axios.delete("/api/chat/delete", {
        data: { chatId },
        headers: { Authorization: token },
      });
      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        await fetchUsersChats();
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setShowDeleteModal(null);
  };

  // Skeleton loading items
  const SkeletonChat = () => (
    <div className="p-3 flex gap-3 items-center">
      <div className="flex flex-col gap-2 flex-1">
        <div className="skeleton h-3.5 w-3/4"></div>
        <div className="skeleton h-2.5 w-1/3"></div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`sidebar-slide sticky top-0 flex flex-col h-[100dvh] min-w-[280px] w-72 p-5 bg-white dark:bg-sidebar-dark border-r border-gray-200 dark:border-white/8 max-md:fixed left-0 top-0 z-10 ${isMenuOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
            alt="Logo"
            className="w-full max-w-48"
          />
        </div>

        {/* New Chat */}
        <button
          onClick={() => {
            createNewChat();
            setIsMeuOpen(false);
          }}
          className="ripple flex justify-center items-center w-full py-3 mt-6 text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl cursor-pointer hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all font-medium"
        >
          <span className="mr-2 text-xl">+</span> New Chat
        </button>

        {/* Search */}
        <div className="flex items-center gap-2 p-3 mt-5 border border-gray-200 dark:border-white/10 dark:bg-[#1a2730] rounded-xl focus-within:border-primary/50 dark:focus-within:border-primary/40 transition-all">
          <img
            src={assets.search_icon}
            className="w-4 opacity-50 not-dark:invert"
          />
          <input
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            type="text"
            placeholder="Search conversations"
            className="text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none bg-transparent w-full dark:text-gray-200"
          />
        </div>

        {/* Recent chats label */}
        {chats.length > 0 && (
          <p className="mt-6 mb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Recent Chats
          </p>
        )}

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-1">
          {loadingChats ? (
            <>
              <SkeletonChat />
              <SkeletonChat />
              <SkeletonChat />
              <SkeletonChat />
            </>
          ) : (
            chats
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
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingChatId(chat._id);
                    setEditName(
                      chat.messages.length > 0
                        ? chat.messages[0].content.slice(0, 32)
                        : chat.name,
                    );
                  }}
                  className={`p-3 rounded-xl flex justify-between items-center group cursor-pointer transition-all border ${
                    selectedChat?._id === chat._id
                      ? "bg-primary/8 dark:bg-primary/8 border-primary/25 dark:border-primary/20 shadow-sm"
                      : "border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:border-primary/10"
                  }`}
                >
                  <div className="flex flex-col overflow-hidden w-full">
                    {editingChatId === chat._id ? (
                      <input
                        ref={editInputRef}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => handleRenameSubmit(chat._id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSubmit(chat._id);
                          if (e.key === "Escape") {
                            setEditingChatId(null);
                            setEditName("");
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-medium text-gray-800 dark:text-gray-200 bg-transparent border-b-2 border-primary outline-none pb-0.5 w-full"
                      />
                    ) : (
                      <p className="truncate w-full text-sm font-medium text-gray-800 dark:text-gray-200">
                        {chat.messages.length > 0
                          ? chat.messages[0].content.slice(0, 32)
                          : chat.name}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {moment(chat.updatedAt).fromNow()}
                    </p>
                  </div>
                  <img
                    src={assets.bin_icon}
                    className="block md:hidden md:group-hover:block w-4 h-4 opacity-40 hover:opacity-80 cursor-pointer not-dark:invert transition-opacity shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(chat._id);
                    }}
                  />
                </div>
              ))
          )}
        </div>

        {/* Community images */}
        <div
          onClick={() => {
            navigate("/community");
            setIsMeuOpen(false);
          }}
          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-primary/10"
        >
          <img
            src={assets.gallery_icon}
            className="w-5 opacity-70 not-dark:invert"
          />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Community Images
          </p>
        </div>

        {/* Credits */}
        <div
          onClick={() => {
            navigate("/credits");
            setIsMeuOpen(false);
          }}
          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-primary/10"
        >
          <img
            src={assets.diamond_icon}
            className="w-5 dark:invert opacity-70"
          />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Credits:{" "}
            <span className="text-primary font-semibold count-animate inline-block">
              {user?.credits}
            </span>
          </p>
        </div>

        {/* Dark Mode toggle */}
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all">
          <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <img
              src={assets.theme_icon}
              className="w-5 opacity-70 not-dark:invert"
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
            <div className="w-9 h-5 bg-gray-300 dark:bg-[#2a3942] rounded-full peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-primary-dark transition-all"></div>
            <span className="absolute left-[3px] top-[3px] w-3.5 h-3.5 bg-white rounded-full transition-all peer-checked:translate-x-4 shadow-sm pointer-events-none"></span>
          </label>
        </div>

        {/* User Account */}
        <div className="flex items-center gap-3 p-3 mt-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl cursor-pointer group border-t border-gray-100 dark:border-white/5">
          <img
            src={assets.user_icon}
            className="w-8 h-8 rounded-full ring-2 ring-primary/20"
          />
          <p className="flex-1 text-sm truncate text-gray-700 dark:text-gray-300 font-medium">
            {user ? user.name : "Login your account"}
          </p>
          {user && (
            <img
              onClick={logout}
              src={assets.logout_icon}
              className="h-5 cursor-pointer not-dark:invert block md:hidden md:group-hover:block opacity-60 hover:opacity-100 transition-opacity"
            />
          )}
        </div>

        {/* Close (mobile) */}
        <img
          onClick={() => setIsMeuOpen(false)}
          src={assets.close_icon}
          className="absolute top-4 right-4 w-5 h-5 cursor-pointer md:hidden not-dark:invert opacity-60 hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 lightbox-overlay"
          onClick={() => setShowDeleteModal(null)}
        >
          <div
            className="glass rounded-2xl p-6 w-80 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Delete Chat
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(showDeleteModal)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors cursor-pointer active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
