import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

const Loading = ({ isLoaded }) => {
  const text = "Every Voice for Voiceless";
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.5 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  // Paw particles
  const paws = Array.from({ length: 10 });

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] overflow-hidden"
        >
          {/* Paw Particles */}
          {paws.map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl opacity-15 select-none pointer-events-none"
              initial={{
                y: "100vh",
                x: Math.random() * window.innerWidth,
                scale: Math.random() * 0.5 + 0.5,
                rotate: Math.random() * 360,
              }}
              animate={{
                y: "-20vh",
                rotate: Math.random() * 360 + 180,
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
            >
              🐾
            </motion.div>
          ))}

          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", type: "spring", bounce: 0.4 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-[var(--accent-primary)]/20 rounded-full blur-xl animate-pulse" />
              <img
                src={logo}
                alt="EVV Logo"
                className="relative z-10 w-32 h-32 md:w-40 md:h-40 object-cover rounded-full shadow-xl border-4 border-white"
              />
            </motion.div>

            {/* Text Animation */}
            <motion.div
              className="flex overflow-hidden mb-8 font-display text-[var(--dark)] text-2xl font-bold"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              {letters.map((letter, index) => (
                <motion.span variants={child} key={index}>
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </motion.div>

            {/* Progress Bar */}
            <div className="w-[200px] h-[3px] bg-[var(--light-gray)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="h-full bg-[var(--accent-primary)] rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
