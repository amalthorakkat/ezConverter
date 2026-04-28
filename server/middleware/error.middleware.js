/**
 * Global Error Handling Middleware
 * Catches all exceptions thrown within routes or services and ensures
 * a consistent, properly formatted JSON response is sent to the client.
 *
 * @param {Error} err - The error object caught by the application.
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error stack to the console for server-side debugging
  console.error("[Global Error Handler]:", err);

  // Set defaults if they are not defined on the error object
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Send a standardized JSON error response
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
