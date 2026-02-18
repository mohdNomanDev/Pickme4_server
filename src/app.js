import express from "express";
const app = express();


import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";



dotenv.config(); // Load environment variables from .env file


app.use(    // Use Helmet to set security-related HTTP headers
 helmet()
);


app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies (for form submissions)
app.use(cookieParser()); // To parse cookies


app.use("/auth", authRoutes);


export default app;