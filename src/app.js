import express from "express";
import cors from "cors";
const app = express();

import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";

// Shared imports
import ApiError from "./shared/utils/ApiError.js";

// Module routes
import orderingRoutes from "./modules/ordering/routes/index.js";
import listingRoutes from "./modules/listing/routes/index.js";
import adminRoutes from "./modules/admin/routes/index.js";
import deliveryRoutes from "./modules/delivery/routes/index.js";

dotenv.config();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:8081", // Update with your frontend URL
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount Module Routes
app.use("/ordering", orderingRoutes);
app.use("/api/listing", listingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/delivery", deliveryRoutes);

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
