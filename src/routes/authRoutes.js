import express from "express";
const router = express.Router();
import auth from "../middlewares/authMiddleware.js";

import {
  register,
  verifyOTP,
  login,
  logout,
  sendLoginOTP,
  refreshToken,
} from "../controllers/authController.js";

// Routes for /auth

// --- Signup Flow ---
router
  .route("/register")
  .get((req, res) => {
    res.json({
      message: "Step 1: POST to /register with name, phone, and terms to get OTP",
    });
  })
  .post(register);

// Verify registration OTP
router.post("/register/verify", verifyOTP);


// --- Login Flow ---
// Step 1: Send login OTP
router.post("/login/otp", sendLoginOTP);

// Step 2: Final Login (Verify OTP)
router
  .route("/login/verify")
  .get((req, res) => {
    res.json({
      message: "Step 2: POST to /login/verify with identifier (phone/email) and otp to log in",
    });
  })
  .post(login);


// --- Token Management ---
router.post("/refresh-token", refreshToken);

// --- Protected Routes ---
router.get("/home", auth, (req, res) => {
  res.json({ success: true, message: "Welcome to the home page", user: req.user });
});

// Logout
router.post("/logout", auth, logout);

export default router;
