const path = require("path");
const { processConversion } = require("./file.service");
const cleanupFiles = require("../../services/cleanup.service");

/**
 * Controller to handle file conversion requests.
 * Parses the incoming file and target format, delegates conversion to the service layer,
 * and streams the converted file back to the client.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 */
exports.convertFile = async (req, res, next) => {
  try {
    const file = req.file;
    const { format } = req.body;

    // --- 1. Basic Request Validation ---
    if (!file) {
      const err = new Error("No file uploaded");
      err.statusCode = 400;
      throw err;
    }

    if (!format) {
      const err = new Error("Target format is required");
      err.statusCode = 400;
      throw err;
    }

    // --- 2. Process Conversion via Service Layer ---
    const outputPath = await processConversion(file.path, format);

    // --- 3. Extract Filename for Headers ---
    const fileName = path.basename(outputPath);

    // --- 4. Set Headers for Downloading ---
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader(
      "Content-Type",
      `image/${format === "jpg" ? "jpeg" : format}`,
    );

    // --- 5. Send File & Cleanup ---
    res.sendFile(outputPath, async (err) => {
      // Regardless of send success or failure, always clean up both input and output files
      await cleanupFiles(file.path, outputPath);

      if (err) {
        console.error("Error sending converted file to client:", err.message);
      }
    });
  } catch (error) {
    // If an error happens before res.sendFile is reached, ensure the uploaded input file is cleaned up
    if (req.file && req.file.path) {
      await cleanupFiles(req.file.path);
    }
    // Forward the error to the global error handling middleware
    next(error);
  }
};
