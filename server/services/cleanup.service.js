const fs = require("fs").promises;

/**
 * Utility service to delete temporary files from the filesystem.
 * Gracefully handles missing files without throwing unhandled exceptions.
 *
 * @param {...string} filePaths - An arbitrary number of absolute file paths to delete.
 * @returns {Promise<void>} - Resolves when all cleanup tasks have finished.
 */
module.exports = async (...filePaths) => {
  const cleanupTasks = filePaths
    .filter((filePath) => filePath) // Filter out any undefined or null paths
    .map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        // Safe fail: Ignore ENOENT (No such file or directory) if the file is already gone
        if (err.code !== "ENOENT") {
          console.error(`Cleanup error for ${filePath}:`, err.message);
        }
      }
    });

  // Execute all deletion operations in parallel
  await Promise.all(cleanupTasks);
};
