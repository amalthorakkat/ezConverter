const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

/**
 * Core image processing service using the sharp library.
 * Reads an input image, applies format-specific high-quality conversions,
 * and saves the output to a designated directory.
 *
 * @param {string} inputPath - The absolute path of the original image to convert.
 * @param {string} format - The desired target format ('png', 'webp', 'jpeg', or 'jpg').
 * @returns {Promise<string>} - Resolves with the absolute path to the newly created image.
 */
module.exports = async (inputPath, format) => {
  // Generate a unique filename using timestamp and a random suffix to prevent collisions
  const outputFileName =
    Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + format;

  const outputDir = path.join(__dirname, "../outputs");

  // Ensure the outputs directory exists before saving
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, outputFileName);

  let pipeline = sharp(inputPath);

  // Apply format-specific conversion settings optimized for the highest possible quality
  switch (format) {
    case "png":
      pipeline = pipeline.png({
        compressionLevel: 0, // Minimal compression, completely lossless
      });
      break;

    case "webp":
      pipeline = pipeline.webp({
        lossless: true, // No quality loss
      });
      break;

    case "jpeg":
    case "jpg":
      // Note: JPEG is inherently a lossy format, but we use settings for maximum quality
      pipeline = pipeline.jpeg({
        quality: 100,
        chromaSubsampling: "4:4:4", // Best possible color retention
      });
      break;

    default:
      throw new Error("Unsupported format");
  }

  // Execute the conversion and write the output file
  await pipeline.toFile(outputPath);

  return outputPath;
};
