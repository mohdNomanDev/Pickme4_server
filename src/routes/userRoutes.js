import express from "express";
const router = express.Router();
import auth from "../middlewares/authMiddleware.js";

import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";

//use with /user

// Get user profile and update user profile routes 
router.route("/profile")
.get(auth, getUserProfile)
.put(auth, updateUserProfile);


export default router;