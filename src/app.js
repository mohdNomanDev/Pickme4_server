import express from "express";
import cors from "cors";
const app = express();

import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";


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
app.use("/user",userRoutes);

export default app;
