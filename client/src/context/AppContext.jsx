import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  const getUserData = async () => {
    try {
        const {data} = await axios.get(backendUrl + "/api/user/data");
        if(data.success){
            setUserData(data.userData);
        }else{
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error?.response?.data?.message || "An error occurred");
    }
  }

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContent.Provider value={value}>
      {children}
    </AppContent.Provider>
  );
};