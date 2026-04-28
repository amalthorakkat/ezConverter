const sharp = require("sharp");
const path = require("path");

module.exports = async (inputPath, format) => {
  const outputFileName =
    Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + format;

  const outputPath = path.join(__dirname, "../outputs", outputFileName);

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
