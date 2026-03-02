import express from "express";
const router = express.Router();
import auth from "../middlewares/authMiddleware.js";

import {
  register,
  verifyOTP,
  login,
  logout,
  sendLoginOTP,
} from "../controllers/authController.js";

//use with /auth

// Signup route
router
  .route("/register")
  .get((req, res) => {
    res.json({
      message:
        "Please send a POST request with name, email, and password to register",
    });
  })
  .post(register);

// otp verify
router.post("/verify-otp", verifyOTP);

// Login route  
router.route("/login/send-otp").post(sendLoginOTP);

router
  .route("/login/verify-otp")
  .get((req, res) => {
    res.json({
      message: "Please send a POST request with email and password to log in",
    });
  })
  .post(login);

// Home route
router.route("/home").get(auth, (req, res) => {
  res.json({ message: "Welcome to the home page", user: req.user });
});

// Logout route
router.post("/logout", auth, logout);

export default router;
