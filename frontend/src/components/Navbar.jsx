import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, HeartPulse } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Report', path: '/report' },
    { name: 'Food', path: '/food' },
    { name: 'Volunteer', path: '/volunteer' }
  ];

  if (user?.role === 'ngo') {
    navLinks.push({ name: 'Dashboard', path: '/ngo' });
  } else if (user) {
    navLinks.push({ name: 'Dashboard', path: '/dashboard' });
  }

  return (
    <header className={clsx(
      'fixed top-0 w-full z-50 transition-all duration-300',
      scrolled ? 'glass-panel py-3' : 'bg-transparent py-5'
    )}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-[var(--accent-teal)] pulse-marker" />
            <span className="font-['Syne'] font-bold text-2xl tracking-wide">
              <span className="text-[var(--accent-teal)]">E</span>VV
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={clsx(
                  'font-medium text-sm transition-colors hover:text-[var(--accent-teal)]',
                  location.pathname === link.path ? 'text-[var(--accent-teal)]' : 'text-[var(--text-secondary)]'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-teal)] text-black flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                </Link>
                <button onClick={logout} className="text-sm text-[var(--accent-coral)] hover:text-red-400">
                  Logout
                </button>
              </div>
            ) : (
              <button className="bg-[var(--accent-teal)] text-black px-5 py-2 rounded-full font-bold text-sm magnetic-btn">
                Join Us
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isOpen && (
        <div className="md:hidden glass-panel absolute top-full left-0 w-full p-4 flex flex-col gap-4 border-t border-[var(--border)]">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-lg p-2"
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { logout(); setIsOpen(false); }} className="text-left text-[var(--accent-coral)] p-2 text-lg">
              Logout
            </button>
          ) : (
            <button className="bg-[var(--accent-teal)] text-black p-3 rounded-xl font-bold w-full mt-2">
              Join Us
            </button>
          )}
        </div>
      )}
    </header>
  );
}
