
import User from "../models/userModel.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";

// Controller function to handle user registration
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({ name, email, password });

  res.status(201).json({ message: "User Registered", user });
};

// Controller function to handle user login
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }); // Find the user by email in the database
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await user.comparePassword(password); // Compare the provided password with the hashed password in the database
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = generateAccessToken(user); // Generate an access token for the authenticated user
  const refreshToken = generateRefreshToken(user); // Generate a refresh token for the authenticated user

  user.refreshTokens = {
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Set expiration time for the refresh token (7 days)
  };
  await user.save(); // Save the user document with the new refresh token

  // ✅ Store BOTH tokens in cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // ✅ Send response with access token (optional, since it's in cookie)
  res.json({ message: "Logged in successfully", accessToken });
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
