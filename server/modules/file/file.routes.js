const express = require("express");
const router = express.Router();

const {
  convertFile,
  getJobStatus,
  downloadResult,
} = require("./file.controller");
const upload = require("../../middleware/upload.middleware");

/**
 * @route POST /api/files/convert
 * @desc Uploads an image and starts async conversion. Returns { jobId }.
 * @access Public
 * @middleware upload.single("file") - Intercepts multipart/form-data and processes the 'file' field
 */
router.post("/convert", upload.single("file"), convertFile);

/**
 * @route GET /api/files/status/:jobId
 * @desc Returns the current progress and status of a conversion job.
 * @access Public
 */
router.get("/status/:jobId", getJobStatus);

/**
 * @route GET /api/files/download/:jobId
 * @desc Downloads the converted file once the job is complete.
 * @access Public
 */
router.get("/download/:jobId", downloadResult);

module.exports = router;