import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Middleware to authenticate requests using the access token
export default async (req, res, next) => {
 // ✅ Extract the access token from cookies
 const token = req.cookies.accessToken;


 // ✅ If no token is found, return 401 Unauthorized
 if (!token) return res.status(401).send("Unauthorized");


 // ✅ Verify the token and attach user info to the request object
 try {
   const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
   
   req.user = decoded; // Attach user ID to the request object for use in controllers
   const user = await User.findById(req.user.id).select("-password -refreshTokens"); // Fetch user details from the database and exclude sensitive fields
    if (!user) return res.status(401).send("Unauthorized"); // If user not found, return 401 Unauthorized
   next();
 } catch (err) {
   return res.status(403).send("Forbidden");
 }
};
