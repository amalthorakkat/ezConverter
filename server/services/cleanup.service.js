const fs = require("fs").promises;

module.exports = async (...filePaths) => {
  const cleanupTasks = filePaths
    .filter((filePath) => filePath) // filter out undefined/null paths
    .map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        // Ignore ENOENT errors (file already deleted or doesn't exist)
        if (err.code !== "ENOENT") {
          console.error(`Cleanup error for ${filePath}:`, err.message);
        }
      }
    });

  await Promise.all(cleanupTasks);
};
