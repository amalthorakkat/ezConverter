const path = require("path");
const { processConversion } = require("./file.service");
const cleanupFiles = require("../../services/cleanup.service");

exports.convertFile = async (req, res, next) => {
  try {
    const file = req.file;
    const { format } = req.body;

    // 🔴 Basic validation
    if (!file) {
      const err = new Error("No file uploaded");
      err.statusCode = 400;
      throw err;
    }

    if (!format) {
      const err = new Error("Target format is required");
      err.statusCode = 400;
      throw err;
    }

    // 🔷 Process conversion via service layer
    const outputPath = await processConversion(file.path, format);

    // 🔷 Extract filename with extension (CRITICAL)
    const fileName = path.basename(outputPath);

    // 🔷 Set headers so browser/Postman downloads correctly
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    res.setHeader(
      "Content-Type",
      `image/${format === "jpg" ? "jpeg" : format}`,
    );

    // 🔷 Send file
    res.sendFile(outputPath, async (err) => {
      // Always cleanup temp files
      await cleanupFiles(file.path, outputPath);

      if (err) {
        console.error("Send error:", err);
      }
    });
  } catch (error) {
    // If an error happens before sendFile, ensure the uploaded file is cleaned up
    if (req.file && req.file.path) {
      await cleanupFiles(req.file.path);
    }
    next(error);
  }
};
