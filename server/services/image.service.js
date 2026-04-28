const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

module.exports = async (inputPath, format) => {
  const outputFileName =
    Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + format;

  const outputDir = path.join(__dirname, "../outputs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, outputFileName);

  let pipeline = sharp(inputPath);

  // Choose format
  switch (format) {
    case "png":
      pipeline = pipeline.png();
      break;
    case "webp":
      pipeline = pipeline.webp();
      break;
    case "jpeg":
    case "jpg":
      pipeline = pipeline.jpeg();
      break;
    default:
      throw new Error("Unsupported format");
  }

  await pipeline.toFile(outputPath);

  return outputPath;
};
