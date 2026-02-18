import app from "./src/app.js";
import connectDB from "./src/config/dbConfig.js";

connectDB();

app.listen(process.env.PORT, () => {
  console.log("Server running...");
});
