import jwt from "jsonwebtoken";


// Middleware to authenticate requests using the access token
export default (req, res, next) => {
 // ✅ Extract the access token from cookies
 const token = req.cookies.accessToken;


 // ✅ If no token is found, return 401 Unauthorized
 if (!token) return res.status(401).send("Unauthorized");


 // ✅ Verify the token and attach user info to the request object
 try {
   const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
   
   req.user = decoded; // Attach user ID to the request object for use in controllers
   next();
 } catch (err) {
   return res.status(403).send("Forbidden");
 }
};
