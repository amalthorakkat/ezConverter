import React from "react";
import { motion } from "framer-motion";

const HeroGraphic = () => {
  // Define grid layout: 9 blocks
  // 0 1 2
  // 3 4 5
  // 6 7 8

  // Create a diagonal wave stagger effect using (row + col)
  const blocks = Array.from({ length: 9 }).map((_, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const isBlack = i % 2 !== 0; // 1, 3, 5, 7 are black. 0, 2, 4, 6, 8 are gray.

    return {
      id: i,
      delayIndex: row + col,
      defaultBg: isBlack ? "#000000" : "#e5e7eb", // Tailwind gray-200 is #e5e7eb
      hoverBg: isBlack ? "#e5e7eb" : "#000000",
    };
  });

  const blockVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: (custom) => ({
      opacity: 1,
      scale: [1, 0.95, 1],
      transition: {
        opacity: { duration: 0.8, ease: "easeOut", delay: custom * 0.15 },
        scale: {
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          delay: custom * 0.15,
        },
      },
    }),
  };

  return (
    <div
      className="flex justify-center w-full lg:w-1/2 lg:justify-end"
      style={{ perspective: "1000px" }}
    >
      {/* Minimalist Abstract Representation */}
      <motion.div
        className="relative grid w-full max-w-lg grid-cols-3 grid-rows-3 gap-2 p-8 bg-white border-2 border-black aspect-square shadow-[0_0_40px_rgba(0,0,0,0.03)]"
        whileHover={{ rotateX: 2, rotateY: -2 }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
        style={{ willChange: "transform" }}
      >
        {/* Animated Blocks */}
        {blocks.map((block) => (
          <motion.div
            key={block.id}
            custom={block.delayIndex}
            variants={blockVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
              scale: 0.9,
              borderRadius: "0.75rem", // rounded-xl equivalent
              backgroundColor: block.hoverBg,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            className="border border-black cursor-pointer will-change-transform"
            style={{
              backgroundColor: block.defaultBg,
              originX: 0.5,
              originY: 0.5,
            }}
          />
        ))}

        {/* Overlay crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
            className="absolute h-px bg-black"
          />
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
            className="absolute w-px bg-black"
          />

          {/* Animated Center Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: 1,
              rotate: 360,
            }}
            transition={{
              opacity: { duration: 0.8, delay: 1 },
              scale: {
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 1,
              },
              rotate: { duration: 12, ease: "linear", repeat: Infinity },
            }}
            className="z-10 flex items-center justify-center w-10 h-10 bg-white border-2 border-black rounded-full shadow-md"
          >
            <span
              className="text-black material-symbols-outlined drop-shadow-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              transform
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroGraphic;
