import User from "../models/userModel.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";

// Controller function to handle user registration
export const register = async (req, res) => {
  const {
    name,
    phone,
    email,
    password,
    addressLabel,
    addressLine,
    city,
    state,
    country,
    locationCoordinates, // Expecting { lat: Number, lng: Number } from the request body
  } = req.body;

  const user = await User.create({
    name,
    phone,
    email,
    password,
    addressLabel,
    addressLine,
    city,
    state,
    country,
    locationCoordinates, // Store the location coordinates in the user document
  });

  res.status(201).json({ message: "User Registered", user });
};

// Controller function to handle user login
// This function authenticates the user and generates access and refresh tokens
// IT return the user data to react app to store in the state and use across the app
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }); // Find the user by email in the database
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await user.comparePassword(password); // Compare the provided password with the hashed password in the database
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = generateAccessToken(user); // Generate an access token for the authenticated user
  const refreshToken = generateRefreshToken(user); // Generate a refresh token for the authenticated user

  // Store the refresh token in the database with an expiration time
  await user.updateOne({
    refreshTokens: {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
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
