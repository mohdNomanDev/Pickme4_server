import jwt from "jsonwebtoken";


// Function to generate an access token for a user
export const generateAccessToken = (user) => {
 return jwt.sign(      // Generate a JWT access token with the user's ID and role as payload
   { id: user._id},
   process.env.ACCESS_TOKEN_SECRET,
   { expiresIn: process.env.ACCESS_TOKEN_EXPIRE }
 );
};


// Function to generate a refresh token for a user
export const generateRefreshToken = (user) => {
 return jwt.sign(     // Generate a JWT refresh token with the user's ID as payload
   { id: user._id },
   process.env.REFRESH_TOKEN_SECRET,
   { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
 );
};
