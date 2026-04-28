const path = require("path");
const convertImage = require("../../services/image.service");

const allowedFormats = ["png", "jpg", "jpeg", "webp"];

exports.processConversion = async (inputPath, format) => {
  if (!format) {
    const err = new Error("Target format is required");
    err.statusCode = 400;
    throw err;
  }

  const normalizedFormat = format.toLowerCase();

  if (!allowedFormats.includes(normalizedFormat)) {
    const err = new Error("Unsupported format");
    err.statusCode = 400;
    throw err;
  }

  // 🔷 Convert image using Sharp
  const outputPath = await convertImage(inputPath, normalizedFormat);

  // 🔷 Ensure extension is correct
  const ext = path.extname(outputPath);
  if (!ext) {
    const err = new Error("Conversion failed: no output extension");
    err.statusCode = 500;
    throw err;
  }

  return outputPath;
};
