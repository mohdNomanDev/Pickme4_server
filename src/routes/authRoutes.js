import express from "express";
const router = express.Router();
import auth from "../middlewares/authMiddleware.js";


import {
 register,
 login,
 logout,
} from "../controllers/authController.js";

//use with /auth

// Signup route
router
 .route("/register")
 .get((req, res) => {
   res.json({ message: "Please send a POST request with name, email, and password to register" });
 })
 .post(register);


// Login route
router
 .route("/login")
 .get((req, res) => {
    res.json({ message: "Please send a POST request with email and password to log in" });
 })
 .post(login);


// Home route
router.route("/home").get(auth, (req, res) => {
 res.json({ message: "Welcome to the home page", user: req.user });
});


// Logout route
router.post("/logout", auth, logout);



export default router;
