const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");

require("dotenv").config();

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

console.log("Starting the Server ...");
console.log(" Trying to Connect to MongoDB...");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully Connected to MongoDB");

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(` Server is now running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      " MongoDB is not connected: connection error:",
      error.message
    );
    process.exit(1);
  });
