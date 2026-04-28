/**
 * Entry point for the Node.js application.
 * Loads environment variables and starts the Express server.
 */
require("dotenv").config();
const app = require("./app");

// Define the port, defaulting to 5000 if not specified in the environment
const PORT = process.env.PORT || 5000;

// Bootstrap the server
app.listen(PORT, () => {
  console.log(`[Server] running on port: ${PORT}`);
  console.log(`[Environment] ${process.env.NODE_ENV || "development"}`);
});