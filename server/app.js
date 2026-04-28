const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

/**
 * ==========================================
 * Global Middleware Configuration
 * ==========================================
 */

// Secure HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Log HTTP requests to the console in development mode
app.use(morgan("dev"));

/**
 * ==========================================
 * Rate Limiting Configuration
 * ==========================================
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    status: "error",
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

// Apply rate limiting to all requests
app.use(limiter);

/**
 * ==========================================
 * Application Routes
 * ==========================================
 */
app.use("/api", routes);

/**
 * ==========================================
 * Fallback & Error Handling
 * ==========================================
 */

// 404 handler: Catch unmatched routes and forward to error handler
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Centralized global error handling middleware
app.use(errorMiddleware);

module.exports = app;
