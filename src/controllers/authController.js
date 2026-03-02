import User from "../models/userModel.js";
import { generateOTP } from "../utils/otpUtils.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";

// Controller function to handle user registration
export const register = async (req, res) => {
  const { name, phone, terms } = req.body;

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const otp = generateOTP();

  const user = await User.create({
    name,
    phone,
    terms,
    otp: {
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
    },
  });

  // TODO: Send OTP via SMS or Email
  console.log("OTP:", otp);

  res.status(200).json({
    message: "OTP sent to your email/phone",
  });
};

// verify otp after registration controller
export const verifyOTP = async (req, res) => {
  const { identifier, otp } = req.body;
  // convert string to number if it's a phone number
  let isPhone = /^\d+$/.test(identifier);

  let user;
  try {
    if (isPhone) {
      user = await User.findOne({ phone: identifier });
      if (!user) throw "User not found";
    } else {
      user = await User.findOne({ email: identifier });
      if (!user) throw "User not found";
    }
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }

  if (!user.otp || user.otp.code !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (user.otp.expiresAt < new Date()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  user.updateOne({ $set: { otp: undefined, isVerified: true } });

  res.json({ message: "Account verified successfully" });
};

// send login otp
export const sendLoginOTP = async (req, res) => {
  const { identifier } = req.body;
  // how convert string to number if it's a phone number?
  let isPhone = /^\d+$/.test(identifier);

  let user;
  try {
    if (isPhone) {
      user = await User.findOne({ phone: identifier });
      if (!user) throw "User not found";
    } else {
      user = await User.findOne({ email: identifier });
      if (!user) throw "User not found";
    }
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }

  const otp = generateOTP();

  await user.updateOne({
    $set: {
      otp: {
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    },
  });
  console.log("Login OTP:", otp);

  res.json({ message: "OTP sent successfully" });
};

// Controller function to handle user login
// This function authenticates the user and generates access and refresh tokens
// IT return the user data to react app to store in the state and use across the app
export const login = async (req, res) => {
  const { identifier, otp } = req.body;
  
  let isPhone = /^\d+$/.test(identifier);

  let user;
  try {
    if (isPhone) {
      user = await User.findOne({ phone: identifier });
      if (!user) throw "User not found";
    } else {
      user = await User.findOne({ email: identifier });
      if (!user) throw "User not found";
    }
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }


  if (!user.otp || user.otp.code !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  if (user.otp.expiresAt < new Date())
    return res.status(400).json({ message: "OTP expired" });

  // const isMatch = await user.comparePassword(password); // Compare the provided password with the hashed password in the database
  // if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = generateAccessToken(user); // Generate an access token for the authenticated user
  const refreshToken = generateRefreshToken(user); // Generate a refresh token for the authenticated user

  // Store the refresh token in the database with an expiration time
  await user.updateOne({
    refreshTokens: {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    otp: undefined,
  });

  // ✅ Store BOTH tokens in cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // ✅ Send response with access token (optional, since it's in cookie)
  res.json({ message: "Logged in successfully", accessToken, user: user });
};

// Controller function to handle user logout
export const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = req.user; // Get user ID from the authenticated request (set by authMiddleware)

  await User.findByIdAndUpdate(user.id, { $unset: { refreshTokens: "" } }); // Clear the refresh token from the database

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};
