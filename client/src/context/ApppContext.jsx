import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider=({children})=>{
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || 'light');

    const fetchUser = async () =>{
        setUser(dummyUserData)
    }

    const fetchUsersChats = async()=>{
        setChats(dummyChats)
        setSelectedChat(dummyChats[0])
    }
    useEffect(()=>{
        if(user){
            fetchUsersChats();
        }
        else{
            setChats([])
            setSelectedChat(null)
        }
    },[user])

    useEffect(()=>{
        if(theme==='light'){
            document.documentElement.classList.add('dark')
        }
        else{
            document.documentElement.classList.remove('dark')
        }
    },[theme])

    useEffect(() => {
        fetchUser();
    }, [])


    const value = {
        navigate, user, setUser, fetchUser, chats, setChats, selectedChat, setSelectedChat, theme
    }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}