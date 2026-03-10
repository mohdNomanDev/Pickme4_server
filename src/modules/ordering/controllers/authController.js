import User from "../models/userModel.js";
import { generateOTP } from "../../../shared/utils/otpUtils.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../../../shared/utils/asyncHandler.js";
import ApiError from "../../../shared/utils/ApiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../shared/utils/tokenUtils.js";

// Controller function to handle user registration
export const register = asyncHandler(async (req, res) => {
  const { name, phone, terms } = req.body;

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const otp = generateOTP();

  await User.create({
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
    success: true,
    message: "OTP sent to your email/phone",
  });
});

// verify otp after registration controller
export const verifyOTP = asyncHandler(async (req, res) => {
  const { identifier, otp } = req.body;
  let isPhone = /^\d+$/.test(identifier);

  let user;
  if (isPhone) {
    user = await User.findOne({ phone: identifier });
  } else {
    user = await User.findOne({ email: identifier });
  }

  if (!user) throw new ApiError(404, "User not found");

  if (!user.otp || user.otp.code !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (user.otp.expiresAt < new Date()) {
    throw new ApiError(400, "OTP expired");
  }

  // Update user and get the updated document
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $set: { isVerified: true }, $unset: { otp: "" } },
    { returnDocument: "after" },
  ).select("-otp -refreshTokens");

  res.json({
    success: true,
    message: "Account verified successfully",
    user: updatedUser,
  });
});

// send login otp
export const sendLoginOTP = asyncHandler(async (req, res) => {
  const { identifier, type } = req.body;
  let user;
  if (type == "phone") {
    if (!/^\d+$/.test(identifier)) {
      throw new ApiError(400, "Invalid phone number");
    }
    user = await User.findOne({ phone: identifier });
  } else if (type == "email") {
    if (!/\S+@\S+\.\S+/.test(identifier)) {
      throw new ApiError(400, "Invalid email address");
    }
    user = await User.findOne({ email: identifier });
  } else {
    throw new ApiError(400, "Invalid identifier type");
  }

  if (!user) throw new ApiError(404, "User not found");

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

  res.json({ success: true, message: "OTP sent successfully" });
});

// Controller function to handle user login
export const loginVerify = asyncHandler(async (req, res) => {
  const { identifier, type, otp } = req.body;
  let user;
  if (type == "phone") {
    if (!/^\d+$/.test(identifier)) {
      throw new ApiError(400, "Invalid phone number");
    }
    user = await User.findOne({ phone: identifier });
  } else if (type == "email") {
    if (!/\S+@\S+\.\S+/.test(identifier)) {
      throw new ApiError(400, "Invalid email address");
    }
    user = await User.findOne({ email: identifier });
  } else {
    throw new ApiError(400, "Invalid identifier type");
  }

  if (!user) throw new ApiError(404, "User not found");

  if (!user.otp || user.otp.code !== otp)
    throw new ApiError(400, "Invalid OTP");

  if (user.otp.expiresAt < new Date()) throw new ApiError(400, "OTP expired");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await user.updateOne({
    refreshTokens: {
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    $unset: { otp: "" },
  });

  const cookieOptions = {
    httpOnly: true,
    //secure: process.env.NODE_ENV === "production",// Set secure flag in production
    secure: false, // Disable secure flag for development
    sameSite: "strict",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: "Logged in successfully",
    accessToken,
    user,
  });
});

// Refresh token controller function
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) throw new ApiError(401, "Refresh token not found");

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshTokens.token !== refreshToken) {
      throw new ApiError(403, "Invalid refresh token");
    }

    if (user.refreshTokens.expiresAt < new Date()) {
      throw new ApiError(403, "Refresh token expired");
    }

    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    throw new ApiError(403, err.message || "Invalid refresh token");
  }
});

// Controller function to handle user logout
export const logout = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await User.findByIdAndUpdate(userId, { $unset: { refreshTokens: "" } });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
});
