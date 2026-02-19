import express from "express";
const router = express.Router({ mergeParams: true }); // Merge params to access user ID in nested routes
import auth from "../middlewares/authMiddleware.js";

import {
  getUserProfile,
  updateUserProfile,
  getUserAddress,
  addUserAddress,
  editUserAddress,
} from "../controllers/userController.js";

//use with /user

// Get user profile and update user profile routes 
router.route("/profile")
.get(auth, getUserProfile)
.post(auth, updateUserProfile);

// get user address details and add user address details routes
router.route("/address")
.get(auth, getUserAddress)
.post(auth, addUserAddress);

// edit existing address
router.route('/address/:addressId')
.post(auth, editUserAddress);


export default router;