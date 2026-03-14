import express from "express";
const router = express.Router({ mergeParams: true }); // Merge params to access user ID in nested routes
import auth from "../../../shared/middlewares/authMiddleware.js";

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
// .get(auth, getUserProfile)
.get(getUserProfile) // For testing purposes, remove auth middleware to access without authentication;
.post(auth, updateUserProfile);

// get user address details and add user address details routes
router.route("/address")
.get(auth, getUserAddress)
// .post(auth, addUserAddress); // For testing purposes, remove auth middleware to access without authentication;
.post(addUserAddress); // For testing purposes, remove auth middleware to access without authentication;

// route to edit existing user address details  
// edit existing address
router.route('/address/:addressId')
.post(auth, editUserAddress);


export default router;