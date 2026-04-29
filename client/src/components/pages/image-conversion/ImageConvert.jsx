import React from "react";
import { motion } from "framer-motion";

const ImageConvert = () => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 w-full max-w-7xl mx-auto relative font-['Inter'] my-12"
    >
      {/* Success Toast Notification (Hidden by default) */}
      <div className="absolute top-6 right-6 bg-white border-2 border-black px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-40 hidden">
        <span
          className="material-symbols-outlined text-[16px] text-black"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-black">
          Conversion Complete
        </span>
      </div>

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
        {/* Structural Layering: Tonal Offset behind main container */}
        <div className="absolute -inset-2 bg-gray-200 -z-10 hidden md:block border-2 border-black"></div>

        {/* Drag and Drop Zone */}
        <div className="border-2 border-dashed border-black bg-gray-50 flex flex-col items-center justify-center p-12 md:p-20 mb-6 cursor-pointer hover:bg-gray-100 transition-colors group">
          <span className="material-symbols-outlined text-[48px] mb-4 text-gray-500 group-hover:text-black transition-colors">
            upload_file
          </span>
          <span className="text-2xl font-bold text-black mb-2">
            Drag & Drop Image
          </span>
          <span className="text-base text-gray-500">
            or click to browse your files
          </span>
          <input accept="image/*" className="hidden" type="file" />
        </div>

        {/* Image Preview (Hidden by default, shown for structure) */}
        {/* 
        <div className="flex items-center justify-between border-2 border-black p-4 bg-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 border-2 border-black overflow-hidden flex items-center justify-center">
              <img src="https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=150&h=150" alt="Preview" className="w-full h-full object-cover grayscale" />
            </div>
            <div>
              <div className="text-sm font-bold text-black">source_image_raw.tiff</div>
              <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">24 MB • TIFF</div>
            </div>
          </div>
          <button className="text-gray-500 hover:text-red-600 transition-colors p-1 border-2 border-transparent hover:border-red-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        */}

        {/* Settings & Action Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t-2 border-black pt-6">
          {/* Format Selector */}
          <div className="flex flex-col w-full md:w-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Target Format
            </span>
            <div className="flex border-2 border-black w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-2 text-sm font-bold bg-black text-white hover:bg-gray-800 transition-colors">
                PNG
              </button>
              <button className="flex-1 md:flex-none px-6 py-2 text-sm font-bold bg-white text-black border-l-2 border-r-2 border-black hover:bg-gray-100 transition-colors">
                JPG
              </button>
              <button className="flex-1 md:flex-none px-6 py-2 text-sm font-bold bg-white text-black hover:bg-gray-100 transition-colors">
                WEBP
              </button>
            </div>
          </div>

          {/* Convert Button */}
          <button className="w-full md:w-auto bg-black text-white px-8 py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-[#333333] transition-colors flex items-center justify-center gap-2 active:scale-95 duration-200">
            Convert Now
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </motion.main>
  );
};

export default ImageConvert;
