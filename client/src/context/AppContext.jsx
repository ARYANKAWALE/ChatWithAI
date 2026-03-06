import { createContext, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: token },
      });

      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingUser(false);
    }
  };

  const createNewChat = async () => {
    try {
      if (!user) return toast("Login to create a new Chat");
      navigate("/");
      setSelectedChat(null);
      await axios.get("/api/chat/create", {
        headers: { Authorization: token },
      });
      await fetchUsersChats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const renameChat = async (chatId, newName) => {
    try {
      const { data } = await axios.put(
        "/api/chat/rename",
        { chatId, name: newName },
        { headers: { Authorization: token } },
      );
      if (data.success) {
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === chatId ? { ...chat, name: newName } : chat,
          ),
        );
        if (selectedChat?._id === chatId) {
          setSelectedChat((prev) => ({ ...prev, name: newName }));
        }
        toast.success("Chat renamed");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUsersChats = async () => {
    try {
      setLoadingChats(true);
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: token },
      });

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      if (data.chats.length === 0) {
        // Create a new chat and use the returned chat directly
        const { data: createData } = await axios.get("/api/chat/create", {
          headers: { Authorization: token },
        });

        if (createData.success && createData.chat) {
          setChats([createData.chat]);
          setSelectedChat(createData.chat);
        }
      } else {
        setChats(data.chats);
        setSelectedChat(data.chats[0]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsersChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user?._id]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    loadingChats,
    fetchUsersChats,
    token,
    setToken,
    axios,
    renameChat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
