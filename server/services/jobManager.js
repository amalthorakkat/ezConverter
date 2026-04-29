const crypto = require("crypto");
const cleanupFiles = require("./cleanup.service");

/**
 * In-memory job store for tracking conversion progress.
 *
 * Each job entry contains:
 *  - status: "pending" | "processing" | "completed" | "failed"
 *  - progress: 0–100
 *  - stage: human-readable stage description
 *  - outputPath: absolute path to the converted file (set on completion)
 *  - format: target format
 *  - inputPath: path to the uploaded file (for cleanup)
 *  - error: error message if failed
 *  - createdAt: timestamp for auto-cleanup
 */
const jobs = new Map();

// Auto-cleanup completed/failed jobs after 10 minutes
const JOB_TTL_MS = 10 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > JOB_TTL_MS) {
      // Clean up any orphaned files left on disk (e.g. user refreshed and never downloaded)
      cleanupFiles(job.inputPath, job.outputPath);
      jobs.delete(id);
    }
  }
}, 60 * 1000); // Sweep every minute

/**
 * Create a new job and return its unique ID.
 */
exports.createJob = (inputPath, format, originalName) => {
  const jobId = crypto.randomUUID();
  jobs.set(jobId, {
    status: "pending",
    progress: 0,
    stage: "Queued",
    outputPath: null,
    format,
    originalName,
    inputPath,
    error: null,
    createdAt: Date.now(),
  });
  return jobId;
};

/**
 * Update the progress of a job.
 * @param {string} jobId
 * @param {number} progress - 0 to 100
 * @param {string} [stage] - Human-readable stage name
 */
exports.updateProgress = (jobId, progress, stage) => {
  const job = jobs.get(jobId);
  if (!job) return;
  job.progress = Math.min(100, Math.max(0, progress));
  if (stage) job.stage = stage;
};

/**
 * Mark a job as processing.
 */
exports.markProcessing = (jobId) => {
  const job = jobs.get(jobId);
  if (!job) return;
  job.status = "processing";
  job.stage = "Starting conversion";
};

/**
 * Mark a job as completed with the output path.
 */
exports.markCompleted = (jobId, outputPath) => {
  const job = jobs.get(jobId);
  if (!job) return;
  job.status = "completed";
  job.progress = 100;
  job.stage = "Complete";
  job.outputPath = outputPath;
};

/**
 * Mark a job as failed with an error message.
 */
exports.markFailed = (jobId, errorMessage) => {
  const job = jobs.get(jobId);
  if (!job) return;
  job.status = "failed";
  job.stage = "Failed";
  job.error = errorMessage;
};

/**
 * Get the current state of a job.
 * Returns null if the job doesn't exist.
 */
exports.getJob = (jobId) => {
  return jobs.get(jobId) || null;
};

/**
 * Delete a job from the store.
 */
exports.deleteJob = (jobId) => {
  jobs.delete(jobId);
};
