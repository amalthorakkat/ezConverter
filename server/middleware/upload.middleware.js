const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Ensure the uploads directory exists upon initialization.
 * This prevents ENOENT errors during the initial file uploads.
 */
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure Multer disk storage engine.
 * Controls where the files are stored and how they are named to prevent collisions.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Store files in the guaranteed 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using a timestamp and a random suffix
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

// MIME types that are always acceptable
const ALLOWED_MIMETYPES = new Set([
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
]);

// Extension-based fallback for files whose MIME type is ambiguous (e.g. Windows reports HEIC as application/octet-stream)
const ALLOWED_EXTENSIONS = new Set([
  '.heic', '.heif', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.tiff', '.tif', '.gif',
]);

/**
 * Filter incoming uploads to strictly allow only image files.
 * Handles HEIC/HEIF which Windows often reports as application/octet-stream.
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.mimetype.startsWith('image/') || ALLOWED_MIMETYPES.has(file.mimetype) || ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true); // Accept the file
  } else {
    // Reject non-image files with a properly formatted HTTP 400 error
    const error = new Error('Only image files are allowed');
    error.statusCode = 400;
    cb(error, false);
  }
};

/**
 * Export the configured Multer instance.
 * Applies the storage engine, the file filter, and a hard 10MB payload limit.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit payload to 10 MB maximum
  },
});

module.exports = upload;