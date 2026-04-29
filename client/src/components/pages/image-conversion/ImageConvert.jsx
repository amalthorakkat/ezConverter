import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { convertImage } from "../../../features/converter/converterSlice";

const ImageConvert = () => {
  const dispatch = useDispatch();
  const {
    isLoading,
    error,
    phase,
    uploadProgress,
    conversionProgress,
    conversionStage,
  } = useSelector((state) => state.convert);

  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("png");
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef(null);

  // --- Handlers for File Selection & Drag-and-Drop ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => fileInputRef.current.click();

  const handleDragOver = (e) => e.preventDefault(); // Required to allow dropping

  const ALLOWED_EXTS = new Set([".heic", ".heif", ".png", ".jpg", ".jpeg", ".webp", ".avif", ".tiff", ".tif", ".gif"]);

  const isAllowedFile = (f) => {
    const ext = "." + f.name.split(".").pop().toLowerCase();
    return f.type.startsWith("image/") || ALLOWED_EXTS.has(ext);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isAllowedFile(droppedFile)) {
        setFile(droppedFile);
      } else {
        alert("Please drop an image file.");
      }
    }
  };

  // --- Compute overall progress for the progress bar ---
  const getOverallProgress = () => {
    if (!phase) return 0;
    // Upload = 0–30%, Conversion = 30–90%, Download = 90–100%
    if (phase === "upload") return Math.round(uploadProgress * 0.3);
    if (phase === "conversion") return Math.round(30 + conversionProgress * 0.6);
    if (phase === "download") return 95;
    return 0;
  };

  const getProgressLabel = () => {
    if (!phase) return "";
    if (phase === "upload") return `Uploading... ${uploadProgress}%`;
    if (phase === "conversion") return conversionStage || "Converting...";
    if (phase === "download") return "Downloading...";
    return "";
  };

  // --- Submission Handler ---
  const handleConvert = async () => {
    if (!file) return alert("Please select a file first.");

    try {
      const { url, filename } = await dispatch(
        convertImage({ file, format }),
      ).unwrap();

      // Trigger the browser download programmatically
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show Success Toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Conversion failed:", err);
    }
  };

  const overallProgress = getOverallProgress();

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 w-full max-w-7xl mx-auto relative font-['Inter'] my-12"
    >
      {/* Success Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 right-6 bg-white border-2 border-black px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-40"
        >
          <span
            className="material-symbols-outlined text-[16px] text-black"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-black">
            Conversion Complete
          </span>
        </motion.div>
      )}

      {/* Header Section */}
      <div className="text-center mb-12 w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-black mb-4">
          Convert Anything.
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Drop your file below to begin the instantaneous conversion process.
        </p>
      </div>

      {/* Conversion Interface Container */}
      <div className="w-full bg-white border-2 border-black p-4 md:p-8 relative group/container">
        <div className="absolute -inset-2 bg-gray-200 -z-10 hidden md:block border-2 border-black"></div>

        {/* Drag and Drop Zone */}
        {!file ? (
          <div
            onClick={triggerFileSelect}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-black bg-gray-50 flex flex-col items-center justify-center p-12 md:p-20 mb-6 cursor-pointer hover:bg-gray-100 transition-colors group"
          >
            <span className="material-symbols-outlined text-[48px] mb-4 text-gray-500 group-hover:text-black transition-colors">
              upload_file
            </span>
            <span className="text-2xl font-bold text-black mb-2">
              Drag & Drop Image
            </span>
            <span className="text-base text-gray-500">
              or click to browse your files
            </span>
            <input
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.heic,.heif"
              className="hidden"
              type="file"
            />
          </div>
        ) : (
          /* Active Image Preview */
          <div className="flex items-center justify-between border-2 border-black p-4 bg-gray-100 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 border-2 border-black overflow-hidden flex items-center justify-center">
                {/* Creating a quick local preview url for the selected file */}
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-black truncate max-w-[200px] sm:max-w-xs">
                  {file.name}
                </div>
                <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">
                  {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                  {file.type.split("/")[1] || file.name.split(".").pop()}
                </div>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              disabled={isLoading}
              className="text-gray-500 hover:text-red-600 transition-colors p-1 border-2 border-transparent hover:border-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <p className="text-red-600 font-bold mb-4 text-center">{error}</p>
        )}

        {/* Progress Bar — shown during active conversion */}
        {isLoading && phase && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                {getProgressLabel()}
              </span>
              <span className="text-xs font-bold text-black">
                {overallProgress}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 border-2 border-black overflow-hidden">
              <motion.div
                className="h-full bg-black"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Settings & Action Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t-2 border-black pt-6">
          {/* Format Selector */}
          <div className="flex flex-col w-full md:w-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Target Format
            </span>
            <div className="flex flex-wrap border-2 border-black w-full md:w-auto">
              {["png", "jpg", "webp", "avif", "tiff", "gif"].map(
                (fmt, i, arr) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    disabled={isLoading}
                    className={`flex-1 md:flex-none px-5 py-2 text-sm font-bold transition-colors ${
                      format === fmt
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-100"
                    } ${i > 0 ? "border-l-2 border-black" : ""} ${
                      isLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={!file || isLoading}
            className={`w-full md:w-auto px-8 py-3.5 text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 duration-200 ${
              !file || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-[#333333] active:scale-95"
            }`}
          >
            {isLoading ? "Converting..." : "Convert Now"}
            {!isLoading && (
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.main>
  );
};

export default ImageConvert;
