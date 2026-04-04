import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {

  axios.defaults.withCredentials = true; // Ensure cookies are sent with every request

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  // Function to check if the user is authenticated by making a request to the backend
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth");
      if (data.success) {
        setIsLoggedin(true);
        getUserData();  // Fetch user data if authenticated
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  }

  // Function to fetch user data from the backend
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

  useEffect(() => {
    getAuthState();
  }, []);

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