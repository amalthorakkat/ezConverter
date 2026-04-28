const fs = require("fs").promises;

module.exports = async (inputPath, outputPath) => {
  try {
    await fs.unlink(inputPath);
    await fs.unlink(outputPath);
  } catch (err) {
    console.error("Cleanup error:", err.message);
  }
};
