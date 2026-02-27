import { createContext, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { dummyUserData, dummyChats } from "../assets/assets";

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

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch("http://localhost:3000/api/user/data", {
          headers: {
            Authorization: token,
          },
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          // Token might be invalid or expired
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    } else {
      setUser(null);
    }
  };

  const fetchUsersChats = async () => {
    setChats(dummyChats);
    setSelectedChat(dummyChats[0]);
  };
  useEffect(() => {
    if (user) {
      fetchUsersChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchUser();
  }, []);

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
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
