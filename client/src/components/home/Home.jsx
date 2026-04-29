import React from "react";
import { motion } from "framer-motion";
import HeroGraphic from "./HeroGraphic";

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const featureContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const featureItemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full flex flex-col items-center font-['Inter'] bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 md:py-[120px] flex flex-col lg:flex-row items-center justify-between gap-20">
        <motion.div 
          className="w-full lg:w-1/2 flex flex-col gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <span className="inline-block bg-gray-200 px-3 py-1 text-xs font-semibold tracking-widest text-black w-max mb-4 border border-black uppercase">
              V 2.0 LIVE
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-black max-w-xl leading-tight">
              Image conversion made effortless.
            </h1>
          </motion.div>
          
          <motion.p variants={itemVariants} className="text-lg text-gray-700 max-w-lg mb-4 leading-relaxed">
            The fastest way to transform your pixels. High-performance, secure,
            and completely free.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-4">
            <button className="relative cursor-pointer overflow-hidden bg-black text-white text-sm font-bold tracking-wide px-8 py-4 border-2 border-black transition-all duration-300 hover:bg-[#333333] outline-none active:scale-95 text-center w-full sm:w-auto after:absolute after:inset-0 after:content-[''] after:bg-[radial-gradient(circle,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_70%)] after:scale-0 after:transition-transform after:duration-500 hover:after:scale-[4]">
              Convert Now
            </button>
            <button className="bg-transparent text-black text-sm font-bold tracking-wide px-8 py-4 border-2 border-black hover:bg-gray-100 transition-colors text-center w-full sm:w-auto">
              How It Works
            </button>
          </motion.div>
        </motion.div>

        <HeroGraphic />
      </section>

      {/* Features Grid (Bento Style) */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 mb-20">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={featureContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Feature 1 */}
          <motion.div variants={featureItemVariants} className="border-2 border-black bg-white p-12 flex flex-col gap-4 hover:bg-gray-100 transition-colors group">
            <div className="w-12 h-12 border-2 border-black flex items-center justify-center bg-black text-white group-hover:bg-transparent group-hover:text-black transition-colors">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-black mt-4">
              Lightning Fast
            </h3>
            <p className="text-base text-gray-700 leading-relaxed">
              Optimized engines for instant results. Process batches of files
              without the wait.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={featureItemVariants} className="border-2 border-black bg-white p-12 flex flex-col gap-4 hover:bg-gray-100 transition-colors group">
            <div className="w-12 h-12 border-2 border-black flex items-center justify-center bg-black text-white group-hover:bg-transparent group-hover:text-black transition-colors">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-black mt-4">
              Privacy First
            </h3>
            <p className="text-base text-gray-700 leading-relaxed">
              Your files are processed in-memory and never stored on our
              servers. Period.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={featureItemVariants} className="border-2 border-black bg-white p-12 flex flex-col gap-4 hover:bg-gray-100 transition-colors group">
            <div className="w-12 h-12 border-2 border-black flex items-center justify-center bg-black text-white group-hover:bg-transparent group-hover:text-black transition-colors">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                file_present
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-black mt-4">
              Format Freedom
            </h3>
            <p className="text-base text-gray-700 leading-relaxed">
              Convert seamlessly between PNG, JPG, WebP, AVIF, and dozens of
              other formats.
            </p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
