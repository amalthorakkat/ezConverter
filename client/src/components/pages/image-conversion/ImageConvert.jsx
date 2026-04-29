import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  convertImage,
  recoverJob,
  downloadJobResult,
  clearError,
  resetConvertState,
} from "../../../features/converter/converterSlice";

const ImageConvert = () => {
  const dispatch = useDispatch();
  const {
    isLoading,
    error,
    phase,
    uploadProgress,
    conversionProgress,
    conversionStage,
    activeJobId,
    originalName,
    recoveredFormat,
    createdAt,
  } = useSelector((state) => state.convert);

  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("png");
  const [showToast, setShowToast] = useState(false);
  const [warningToast, setWarningToast] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const fileInputRef = useRef(null);

  // --- Countdown Timer Logic ---
  useEffect(() => {
    let interval;
    if (showTimer && createdAt && phase === "download") {
      const updateTimer = () => {
        const TTL = 10 * 60 * 1000; // 10 minutes
        const expiresAt = createdAt + TTL;
        const now = Date.now();
        const diff = expiresAt - now;

        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
        }
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [showTimer, createdAt, phase]);

  // --- Job Recovery on Mount ---
  useEffect(() => {
    const savedJobId = localStorage.getItem("activeJobId");
    if (savedJobId && !activeJobId) {
      dispatch(recoverJob(savedJobId));
    }
  }, [dispatch, activeJobId]);

  // --- Handlers for File Selection & Drag-and-Drop ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => fileInputRef.current.click();
  const handleDragOver = (e) => e.preventDefault();

  const ALLOWED_EXTS = new Set([
    ".heic",
    ".heif",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".avif",
    ".tiff",
    ".tif",
    ".gif",
  ]);

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
    if (phase === "upload") return Math.round(uploadProgress * 0.3);
    if (phase === "conversion") return Math.round(30 + conversionProgress * 0.6);
    if (phase === "download") return 100;
    return 0;
  };

  const getProgressLabel = () => {
    if (!phase) return "";
    if (phase === "upload") return `Uploading your image... ${uploadProgress}%`;
    if (phase === "conversion") return conversionStage || "Processing... almost there!";
    if (phase === "download") return "Ready for download!";
    return "";
  };

  // --- Submission Handler ---
  const handleAction = async () => {
    if (phase === "download" && activeJobId) {
      try {
        const { url, filename } = await dispatch(
          downloadJobResult({
            jobId: activeJobId,
            format: recoveredFormat || format,
          }),
        ).unwrap();

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        console.error("Download failed:", err);
      }
      return;
    }

    if (!file) return;

    try {
      const { jobId, format: targetFormat } = await dispatch(
        convertImage({ file, format }),
      ).unwrap();

      const { url, filename } = await dispatch(
        downloadJobResult({ jobId, format: targetFormat }),
      ).unwrap();

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Process failed:", err);
    }
  };

  const overallProgress = getOverallProgress();
  const displayName = file ? file.name : originalName;
  const displaySize = file
    ? (file.size / 1024 / 1024).toFixed(2) + " MB"
    : "Restored Session";
  const displayType = file
    ? file.type.split("/")[1] || file.name.split(".").pop()
    : (recoveredFormat || "").toUpperCase();

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 w-full max-w-7xl mx-auto relative font-['Inter'] my-12"
    >
      {/* Toast Notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 right-6 bg-white border-2 border-black px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-40"
          >
            <span
              className="material-symbols-outlined text-[16px] text-black"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-black">
              Download Started
            </span>
          </motion.div>
        )}

        {warningToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 right-6 bg-white border-2 border-red-600 px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] z-40"
          >
            <span
              className="material-symbols-outlined text-[16px] text-red-600"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              warning
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">
              Download the converted file to convert another
            </span>
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* User-Friendly Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-[#FF3333] border-2 border-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined">error</span>
                  <span className="text-sm font-bold uppercase tracking-widest leading-tight">
                    {error}
                  </span>
                </div>
                <button 
                  onClick={() => dispatch(clearError())}
                  className="text-white hover:scale-110 transition-transform"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag and Drop Zone */}
        {!file && !activeJobId ? (
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
          /* Active Image Preview / Restored Session Info */
          <div className="flex items-center justify-between border-2 border-black p-4 bg-gray-100 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 border-2 border-black overflow-hidden flex items-center justify-center">
                {file ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-full object-cover grayscale"
                  />
                ) : (
                  <span className="material-symbols-outlined text-gray-400">
                    image
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-black truncate max-w-[200px] sm:max-w-xs">
                  {displayName}
                </div>
                <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">
                  {displaySize} • {displayType}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (activeJobId) {
                  setWarningToast(true);
                  setTimeout(() => setWarningToast(false), 3000);
                  return;
                }
                setFile(null);
                dispatch(resetConvertState());
              }}
              disabled={isLoading && phase !== "download"}
              className="text-gray-500 hover:text-red-600 transition-colors p-1 border-2 border-transparent hover:border-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
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
              {["png", "jpg", "webp", "avif", "tiff", "gif"].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  disabled={isLoading || (phase && phase !== "download")}
                  className={`flex-1 md:flex-none px-5 py-2 text-sm font-bold transition-colors ${
                    (recoveredFormat || format) === fmt
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-100"
                  } border-r-2 last:border-r-0 border-black ${
                    isLoading || (phase && phase !== "download")
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="relative group/btn w-full md:w-auto">
            {/* Countdown Tooltip */}
            {showTimer && phase === "download" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-white whitespace-nowrap z-50 pointer-events-none"
              >
                Expires in: {timeLeft}
              </motion.div>
            )}

            <button
              onClick={handleAction}
              onMouseEnter={() => setShowTimer(true)}
              onMouseLeave={() => setShowTimer(false)}
              disabled={(!file && !activeJobId) || (isLoading && phase !== "download")}
              className={`w-full md:w-auto px-8 py-3.5 text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 duration-200 ${
                (!file && !activeJobId) || (isLoading && phase !== "download")
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-[#333333] active:scale-95"
              }`}
            >
              {isLoading && phase !== "download" ? (
                "Converting..."
              ) : phase === "download" ? (
                <>
                  Download Result
                  <span className="material-symbols-outlined text-[18px]">
                    download
                  </span>
                </>
              ) : (
                <>
                  Convert Now
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.main>
  );
};

export default ImageConvert;
