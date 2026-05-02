import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-[100px] pb-[100px] px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-[600px]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-[120px] font-bold text-[#00C896] mb-4 font-[Playfair_Display]"
        >
          404
        </motion.div>
        
        <h1 className="font-[Playfair_Display] text-[32px] font-bold text-[#111827] mb-4">
          Page Not Found
        </h1>
        
        <p className="font-[Plus_Jakarta_Sans] text-[#6B7280] text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00C896] text-white rounded-xl font-[Plus_Jakarta_Sans] font-bold hover:bg-[#00A878] transition-colors"
          >
            <Home size={20} /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#E5E7EB] text-[#111827] rounded-xl font-[Plus_Jakarta_Sans] font-bold hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} /> Go Back
          </button>
        </div>

        <div className="mt-12">
          <p className="font-[Plus_Jakarta_Sans] text-sm text-[#9CA3AF]">
            Lost? Let us help you find what you need:
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <Link to="/" className="text-[#00C896] text-sm font-semibold hover:underline">Home</Link>
            <span className="text-[#9CA3AF]">•</span>
            <Link to="/report" className="text-[#00C896] text-sm font-semibold hover:underline">Report Animal</Link>
            <span className="text-[#9CA3AF]">•</span>
            <Link to="/food" className="text-[#00C896] text-sm font-semibold hover:underline">Food Rescue</Link>
            <span className="text-[#9CA3AF]">•</span>
            <Link to="/volunteer" className="text-[#00C896] text-sm font-semibold hover:underline">Volunteer Hub</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
