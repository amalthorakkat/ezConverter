const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const heicConvert = require("heic-convert");

/**
 * Core image processing service using the sharp library.
 * Reads an input image, applies format-specific high-quality conversions,
 * and saves the output to a designated directory.
 *
 * HEIC/HEIF files are pre-decoded via heic-convert since Sharp's bundled
 * libvips may not include HEIF decoding support on all platforms.
 *
 * @param {string} inputPath - The absolute path of the original image to convert.
 * @param {string} format - The desired target format ('png', 'webp', 'jpeg', 'jpg', 'avif', 'tiff', or 'gif').
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

  // --- HEIC/HEIF pre-processing ---
  // Sharp can't decode HEIC natively on most builds, so we convert to a PNG buffer first
  const ext = path.extname(inputPath).toLowerCase();
  let sharpInput;

  if (ext === ".heic" || ext === ".heif") {
    const inputBuffer = fs.readFileSync(inputPath);
    const pngBuffer = await heicConvert({
      buffer: inputBuffer,
      format: "PNG", // Lossless intermediate to avoid double quality loss
    });
    sharpInput = Buffer.from(pngBuffer);
  } else {
    sharpInput = inputPath;
  }

  let pipeline = sharp(sharpInput).withMetadata(); // Preserve EXIF, ICC color profiles, orientation

  // Apply format-specific conversion settings optimized for the highest possible quality
  switch (format) {
    case "png":
      pipeline = pipeline.png({
        compressionLevel: 0, // No compression = lossless + fastest
        adaptiveFiltering: true,
      });
      break;

    case "webp":
      pipeline = pipeline.webp({
        lossless: true, // Pixel-perfect lossless output
        effort: 6, // Maximum compression effort (no quality loss)
      });
      break;

    case "jpeg":
    case "jpg":
      pipeline = pipeline.jpeg({
        quality: 100,
        chromaSubsampling: "4:4:4", // Full color resolution, no chroma downsampling
        mozjpeg: true, // Better encoder — higher quality at same file size
      });
      break;

    case "avif":
      pipeline = pipeline.avif({
        quality: 90, // Near-lossless; AVIF at 90 is visually indistinguishable from source
        effort: 6, // Max compression effort for best quality-to-size ratio
        lossless: false,
      });
      break;

    case "tiff":
      pipeline = pipeline.tiff({
        compression: "lzw", // Lossless LZW
        predictor: "horizontal", // Improves LZW compression on continuous-tone images
        quality: 100,
      });
      break;

    case "gif":
      pipeline = pipeline.gif({
        effort: 10, // Max effort for best dithering/palette selection
      });
      break;

    default:
      throw new Error("Unsupported format");
  }

  // Execute the conversion and write the output file
  await pipeline.toFile(outputPath);

  return outputPath;
};
