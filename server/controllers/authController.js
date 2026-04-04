import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

// Register a new user
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // if any of the details are missing, then return error
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  // create new user
  try {
    // if user already exists, then return error
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user in database
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    // create and send token in cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    //send an email to the user(welcome email)
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Welcome to Our App",
      text: `Hi ${user.name},\n\nWelcome to our app! We're excited to have you on board.\nYour account has been created successfully with the email ${user.email}.\n\nBest regards,\nThe Team`,
    };

    await transporter.sendMail(mailOptions);

    // return success response
    return res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  // if any of the details are missing, then return error
  if (!email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    // find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    // check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    // create and send token in cookie
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // return success response
    return res.json({ success: true, message: "Logged in successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    // return success response
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// email verification(OTP is generated and sent to user's email)
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;

    // find user by id
    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account is already verified",
      });
    }

    // generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    // send OTP email to user
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      // text: `Hi ${user.name},\n\nYour OTP for account verification is: ${otp}\nThis OTP is valid for 10 minutes.\n\nBest regards,\nThe Team`, 
      html: EMAIL_VERIFY_TEMPLATE.replace("{{email}}", user.email).replace("{{otp}}", otp),
    };

    await transporter.sendMail(mailOption);

    // return success response
    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// verify account using OTP
export const verifyEmail = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    // find user by id
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // if account is already verified, then return error
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    // check if OTP is valid
    if (user.verifyOtp !== otp || user.verifyOtp === "") {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // check if OTP is expired
    if (Date.now() > user.verifyOtpExpireAt) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    // verify account
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    // return success response
    return res.json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// user is already authenticated or not
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message: "User is authenticated" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// send the password reset OTP to user's email
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  // if email is not provided, then return error
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    await user.save();

    // send OTP email to user
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      // text: `Hi ${user.name},\n\nYour OTP for password reset is: ${otp}\nThis OTP is valid for 10 minutes.\n\nBest regards,\nThe Team`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{email}}", user.email).replace("{{otp}}", otp),
    };
    await transporter.sendMail(mailOption);

    return res.json({
      success: true,
      message: `OTP sent successfully to ${user.email}`,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// reset password using OTP
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // if any of the fields is not provided, then return error
  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // check if OTP is valid
    if (user.resetOtp !== otp || user.resetOtp === "") {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // check if OTP is expired
    if (Date.now() > user.resetOtpExpireAt) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    // hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // reset password
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    // return success response
    return res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
