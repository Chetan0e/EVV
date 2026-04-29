import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, AlertTriangle, Coffee, Users, User } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const links = [
    { path: '/', icon: <Home className="w-6 h-6" />, label: 'Home' },
    { path: '/report', icon: <AlertTriangle className="w-6 h-6" />, label: 'Report' },
    { path: '/food', icon: <Coffee className="w-6 h-6" />, label: 'Food' },
    { path: '/volunteer', icon: <Users className="w-6 h-6" />, label: 'Tasks' },
  ];

  if (user?.role === 'ngo') {
    links[3] = { path: '/ngo', icon: <Users className="w-6 h-6" />, label: 'NGO' };
  }

  links.push({ path: '/profile', icon: <User className="w-6 h-6" />, label: 'Profile' });

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full glass-panel border-t border-[var(--border)] pb-safe z-40">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <div className={clsx(
                "p-1 rounded-full transition-all duration-300",
                isActive ? "bg-[var(--accent-teal)]/20 text-[var(--accent-teal)] scale-110" : "text-[var(--text-muted)]"
              )}>
                {link.icon}
              </div>
              <span className={clsx(
                "text-[10px] mt-1 font-medium",
                isActive ? "text-[var(--accent-teal)]" : "text-[var(--text-muted)]"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
