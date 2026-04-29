import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isConvertPage = location.pathname === "/convert/image";

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full border-b-2 border-black bg-white font-['Inter'] sticky top-0 z-50"
    >
      <div className="flex items-center justify-between w-full px-6 py-4 max-w-7xl mx-auto">
        <div>
          <h1 onClick={() => navigate("/")} className="cursor-pointer text-xl  md:text-2xl font-extrabold uppercase text-black tracking-tighter">
            Ezy Convert
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Secondary Button (Ghost/Outline style) */}
          <button className="px-4 py-2 cursor-pointer font-bold text-gray-700 transition-all duration-200 hover:text-black hover:bg-gray-100 active:bg-gray-200 active:scale-95 uppercase text-xs tracking-widest hidden sm:block">
            Contact
          </button>

          {/* Primary Button (Solid Black style) */}
          {!isConvertPage && (
            <button onClick={() => navigate("/convert/image")} className="relative cursor-pointer overflow-hidden px-6 py-2.5 text-sm font-bold tracking-wide text-white bg-black border-2 border-black transition-all duration-300 hover:bg-[#333333] outline-none active:scale-95 after:absolute after:inset-0 after:content-[''] after:bg-[radial-gradient(circle,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_70%)] after:scale-0 after:transition-transform after:duration-500 hover:after:scale-[4]">
              Convert
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
