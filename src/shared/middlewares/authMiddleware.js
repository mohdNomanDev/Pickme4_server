import jwt from "jsonwebtoken";
import User from "../../modules/ordering/models/userModel.js";

// Middleware to authenticate requests using the access token
export default async (req, res, next) => {
  // ✅ Extract the access token from cookies
  const token = req.cookies.accessToken;

  // ✅ If no token is found, return 401 Unauthorized
  if (!token) return res.status(401).json({ message: "Access token missing" });

  // ✅ Verify the token and attach user info to the request object
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded; // Attach user info to the request object

    const user = await User.findById(req.user.id).select(
      "-password -refreshTokens",
    );
    if (!user) return res.status(401).json({ message: "User not found" });

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res.status(403).json({ message: "Invalid access token" });
  }
};
