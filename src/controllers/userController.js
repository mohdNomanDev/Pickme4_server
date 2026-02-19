// update user profile and get user profile controller functions
import User from "../models/userModel.js";

// Controller function to get user profile details
export const getUserProfile = async (req, res) => {
  const userId = req.user._id; // Get user ID from authenticated user (set by auth middleware)
  const user = await User.findById(userId).select("-password -refreshTokens"); // Find the user by ID and exclude sensitive fields
  res.json(user); // Return the user profile data
};

// Controller function to update user profile personal details like name, phone, email
export const updateUserProfile = async (req, res) => {
  const userId = req.user._id; // Get user ID from authenticated user (set by auth middleware)

  const user = await User.findById(userId); // Find the user by ID in the database
  if (!user) return res.status(404).json({ message: "User not found" }); // If user not found, return 404

  const { name, phone, email } = req.body; // Get updated profile data from request body

  // Update user fields with new data
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (email) user.email = email;

  await user.save(); // Save the updated user document to the database

  res.json({ message: "Profile updated successfully", user }); // Return success message and updated user data
};
