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

  switch (format) {
    case "png":
      pipeline = pipeline.png({
        compressionLevel: 0, // minimal compression, no loss
      });
      break;

    case "webp":
      pipeline = pipeline.webp({
        lossless: true, // 🔥 NO QUALITY LOSS
      });
      break;

    case "jpeg":
    case "jpg":
      // ⚠️ JPEG cannot be truly lossless
      pipeline = pipeline.jpeg({
        quality: 100,
        chromaSubsampling: "4:4:4", // best possible quality
      });
      break;

    default:
      throw new Error("Unsupported format");
  }

  await pipeline.toFile(outputPath);

  return outputPath;
};
