import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t-2 border-black font-['Inter'] mt-auto">
      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <span className="text-xl font-extrabold uppercase text-black tracking-tighter">
            Ezy Convert
          </span>
          <div className="flex gap-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">GitHub</a>
          </div>
        </div>
        
        <div className="text-black font-bold text-xs tracking-widest uppercase text-center md:text-left bg-gray-100 px-4 py-2 border-2 border-black">
          &copy; {new Date().getFullYear()} EZY CONVERT
        </div>
      </div>
    </footer>
  );
};

export default Footer;