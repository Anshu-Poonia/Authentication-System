import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const EmailVerify = () => {

  axios.defaults.withCredentials = true;
  const {backendUrl, isLoggedin, userData, getUserData} = useContext(AppContent);
  const navigate = useNavigate();

  const inputRefs = React.useRef([]);

  // Function to handle input in OTP fields, automatically focusing the next field when a digit is entered
  const handleInput = (e, index) => {
    if(e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };
  
  // Function to handle backspace in OTP fields, automatically focusing the previous field when backspace is pressed and the current field is empty
  const handleKeyDown = (e, index) => {
    if(e.key === "Backspace" && e.target.value.length === 0 && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();
    const pasteArray = paste.split("").slice(0, 6); // Get only the first 6 characters from the pasted string
    pasteArray.forEach((char, index) => {
      if(inputRefs.current[index]) {
        inputRefs.current[index].value = char; // Set the value of each OTP input field to the corresponding character from the pasted string
      }
    });
  }  

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map(e => e.value); // Get the values from all OTP input fields
      const otp = otpArray.join(""); // Join the values to form the complete OTP string
      // Make API call to verify the OTP with the backend using the otp variable
      const {data} = await axios.post(backendUrl + "/api/auth/verify-account", { otp });

      if(data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      }else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    }
  }

  useEffect(() => {
    isLoggedin && userData && userData.isAccountVerified && navigate("/"); // If the user is logged in and their account is already verified, redirect to home page
  }, [isLoggedin, userData, navigate]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")} // Redirect to home page when logo is clicked
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <form onSubmit={onSubmitHandler} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email verify OTP
        </h1>
        <p className="text-indigo-400 text-center mb-6">
          Enter the 6-digit OTP sent to your email address!
        </p>
        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {/* Generate 6 input fields for OTP entry, styled with a consistent design */}
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-medium"
                type="text"
                maxLength={1}
                required
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
        </div>
        <button className="w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full">Verify email</button>
      </form>
    </div>
  );
};

export default EmailVerify;
