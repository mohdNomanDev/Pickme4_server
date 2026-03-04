import express from "express";
import cors from "cors";
const app = express();

import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import ApiError from "./utils/ApiError.js";

dotenv.config(); // Load environment variables from .env file

app.use(
  // Use Helmet to set security-related HTTP headers
  helmet(),
);

// Configure CORS to allow requests from the frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies (for form submissions)
app.use(cookieParser()); // To parse cookies

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(new ApiError(404, "Not Found"));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
