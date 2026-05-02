import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, AlertTriangle, Utensils, HandHeart } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function BottomNav() {
  const location = useLocation();

  const links = [
    { path: '/', icon: <Home size={20} />, label: 'Home' },
    { path: '/report', icon: <AlertTriangle size={20} />, label: 'Report' },
    { path: '/food', icon: <Utensils size={20} />, label: 'Food' },
    { path: '/volunteer', icon: <HandHeart size={20} />, label: 'Volunteer' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 pb-safe">
      <div className="flex justify-around items-center h-[64px]">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path}
              className="relative flex flex-col items-center justify-center w-full h-full text-[#6B7280] hover:text-[var(--accent-primary)] transition-colors"
            >
              <div className={clsx("transition-transform duration-300", isActive ? "text-[var(--accent-primary)] -translate-y-1" : "")}>
                {link.icon}
              </div>
              <span className={clsx("text-[10px] mt-1 font-sans", isActive ? "text-[var(--accent-primary)] font-semibold" : "")}>
                {link.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
