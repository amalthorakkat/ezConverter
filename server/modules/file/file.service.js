const path = require("path");
const convertImage = require("../../services/image.service");

// Define supported target conversion formats
const allowedFormats = ["png", "jpg", "jpeg", "webp", "avif", "tiff", "gif"];

/**
 * Validates the requested format and delegates the image conversion task
 * to the underlying image processing service.
 *
 * @param {string} inputPath - The absolute path to the uploaded original file.
 * @param {string} format - The desired target format (e.g., 'png', 'webp').
 * @param {function} [onProgress] - Optional progress callback: (progress, stage) => void
 * @returns {Promise<string>} - Resolves with the absolute path to the converted image.
 * @throws {Error} - Throws a custom error if validation or conversion fails.
 */
exports.processConversion = async (inputPath, format, onProgress) => {
  // Ensure a format is provided
  if (!format) {
    const err = new Error("Target format is required");
    err.statusCode = 400;
    throw err;
  }

  const normalizedFormat = format.toLowerCase();

  // Validate that the requested format is supported
  if (!allowedFormats.includes(normalizedFormat)) {
    const err = new Error("Unsupported format");
    err.statusCode = 400;
    throw err;
  }

  // Delegate the actual heavy lifting to the image service (Sharp)
  const outputPath = await convertImage(inputPath, normalizedFormat, onProgress);

  // Sanity check: verify the output filename generated has a valid extension
  const ext = path.extname(outputPath);
  if (!ext) {
    const err = new Error("Conversion failed: no output extension");
    err.statusCode = 500;
    throw err;
  }

  return outputPath;
};
