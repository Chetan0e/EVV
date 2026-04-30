import React from 'react';
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';

const Loading = ({ fullScreen = true, message = "Loading..." }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0f0a]" 
    : "w-full h-64 flex flex-col items-center justify-center";

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Animated Background Rings */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-[var(--accent-teal)] rounded-full blur-2xl"
        />
        
        {/* Main Icon Container - Walking Paws */}
        <div className="relative bg-[#111811] p-10 rounded-[40px] border border-[var(--border)] shadow-2xl flex gap-6">
          <motion.div
            animate={{
              y: [0, -15, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <PawPrint className="w-12 h-12 text-[var(--accent-teal)]" />
          </motion.div>
          
          <motion.div
            animate={{
              y: [0, -15, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="mt-6"
          >
            <PawPrint className="w-12 h-12 text-[var(--accent-teal)] opacity-60" />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-[var(--accent-teal)] font-medium tracking-widest uppercase text-sm mb-2">{message}</p>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-1.5 h-1.5 rounded-full bg-[var(--accent-teal)]"
            />
          ))}
        </div>
      </motion.div>

      {/* Decorative background elements if full screen */}
      {fullScreen && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--accent-teal)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[var(--accent-teal)]/5 rounded-full blur-3xl" />
        </div>
      )}
    </div>
  );
};

export default Loading;
