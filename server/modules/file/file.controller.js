const path = require("path");
const { processConversion } = require("./file.service");
const cleanupFiles = require("../../services/cleanup.service");
const jobManager = require("../../services/jobManager");

/**
 * Start a conversion job asynchronously.
 * Immediately returns a jobId for the client to poll against.
 *
 * @route POST /api/files/convert
 */
exports.convertFile = async (req, res, next) => {
  try {
    const file = req.file;
    const { format } = req.body;

    // --- 1. Basic Request Validation ---
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

    // --- 2. Create a job and return immediately ---
    const jobId = jobManager.createJob(file.path, format);
    res.status(202).json({ jobId });

    // --- 3. Process asynchronously (non-blocking) ---
    setImmediate(async () => {
      try {
        jobManager.markProcessing(jobId);

        const onProgress = (progress, stage) => {
          jobManager.updateProgress(jobId, progress, stage);
        };

        const outputPath = await processConversion(
          file.path,
          format,
          onProgress,
        );

        jobManager.markCompleted(jobId, outputPath);

        // Clean up the uploaded input file (output is kept until download)
        await cleanupFiles(file.path);
      } catch (error) {
        jobManager.markFailed(jobId, error.message || "Conversion failed");
        // Clean up input file on failure
        await cleanupFiles(file.path);
      }
    });
  } catch (error) {
    // If validation fails before job creation, clean up the uploaded file
    if (req.file && req.file.path) {
      await cleanupFiles(req.file.path);
    }
    next(error);
  }
};

/**
 * Get the current status and progress of a conversion job.
 *
 * @route GET /api/files/status/:jobId
 */
exports.getJobStatus = (req, res) => {
  const { jobId } = req.params;
  const job = jobManager.getJob(jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  res.json({
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    error: job.error,
  });
};

/**
 * Download the converted file once the job is complete.
 * Cleans up the output file after sending.
 *
 * @route GET /api/files/download/:jobId
 */
exports.downloadResult = (req, res, next) => {
  const { jobId } = req.params;
  const job = jobManager.getJob(jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.status !== "completed") {
    return res
      .status(400)
      .json({ message: "Job not yet completed", status: job.status });
  }

  const outputPath = job.outputPath;
  const fileName = path.basename(outputPath);

  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader(
    "Content-Type",
    `image/${job.format === "jpg" ? "jpeg" : job.format}`,
  );

  res.sendFile(outputPath, async (err) => {
    // Clean up the output file after sending
    await cleanupFiles(outputPath);
    // Remove the job from the store
    jobManager.deleteJob(jobId);

    if (err) {
      console.error("Error sending converted file to client:", err.message);
    }
  });
};
