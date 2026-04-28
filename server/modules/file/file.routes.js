const express = require("express");
const router = express.Router();

const { convertFile } = require("./file.controller");
const upload = require("../../middleware/upload.middleware");

/**
 * @route POST /api/files/convert
 * @desc Uploads an image and converts it to the requested format
 * @access Public
 * @middleware upload.single("file") - Intercepts multipart/form-data and processes the 'file' field
 */
router.post("/convert", upload.single("file"), convertFile);

module.exports = router;