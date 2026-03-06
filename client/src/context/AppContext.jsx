import {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const SESSION_TIMEOUT = 2 * 24 * 60 * 60 * 1000; // 2 days in ms

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

  // ── Session timeout: check if token has expired due to inactivity ──
  const getInitialToken = () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return "";

    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity && Date.now() - Number(lastActivity) > SESSION_TIMEOUT) {
      // Inactive for more than 2 days — auto logout
      localStorage.removeItem("token");
      localStorage.removeItem("lastActivity");
      setTimeout(
        () =>
          toast("Session expired due to inactivity. Please log in again.", {
            icon: "⏳",
          }),
        500,
      );
      return "";
    }

    return storedToken;
  };

  const [token, setToken] = useState(getInitialToken);

  // Update last activity timestamp on user interactions
  const updateActivity = useCallback(() => {
    if (token) {
      localStorage.setItem("lastActivity", Date.now().toString());
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // Set initial activity
    updateActivity();

    // Listen to user interactions
    const events = ["click", "keydown", "scroll", "touchstart"];
    events.forEach((e) =>
      window.addEventListener(e, updateActivity, { passive: true }),
    );

    // Periodic check every 5 minutes
    const interval = setInterval(
      () => {
        const lastActivity = localStorage.getItem("lastActivity");
        if (
          lastActivity &&
          Date.now() - Number(lastActivity) > SESSION_TIMEOUT
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("lastActivity");
          setToken("");
          setUser(null);
          toast("Session expired due to inactivity. Please log in again.", {
            icon: "⏳",
          });
          navigate("/");
        }
      },
      5 * 60 * 1000,
    );

    return () => {
      events.forEach((e) => window.removeEventListener(e, updateActivity));
      clearInterval(interval);
    };
  }, [token, updateActivity, navigate]);

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
