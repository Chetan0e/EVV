import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';

export default function NewsDetailModal({ isOpen, onClose, article }) {
  if (!isOpen || !article) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[700px] max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white rounded-[20px] overflow-hidden">
              {/* Hero Image */}
              <div className="relative h-[250px]">
                <img 
                  src={article.img} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                <span className="inline-block px-3 py-1 bg-[#00C896]/10 text-[#00C896] rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
                  {article.tag}
                </span>
                
                <h2 className="font-[Playfair_Display] text-[28px] font-bold text-[#111827] mb-4 leading-tight">
                  {article.title}
                </h2>
                
                <div className="flex items-center gap-2 text-[#6B7280] font-[Plus_Jakarta_Sans] text-sm mb-6">
                  <Calendar size={16} />
                  <span>{article.date || 'Recent Article'}</span>
                </div>

                <div className="font-[Plus_Jakarta_Sans] text-[#111827] leading-relaxed">
                  {article.fullContent || (
                    <p>
                      This is a placeholder for the full article content. In a production implementation, 
                      this would display the complete article with rich text formatting, images, 
                      and additional details about the topic.
                    </p>
                  )}
                </div>

                {article.author && (
                  <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                    <p className="font-[Plus_Jakarta_Sans] text-sm text-[#6B7280]">
                      By <span className="font-semibold text-[#111827]">{article.author}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
