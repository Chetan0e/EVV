import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Shadow past 80px
      setScrolled(currentScrollY > 80);

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { name: 'Report', path: '/report' },
    { name: 'Food', path: '/food' },
    { name: 'Volunteer', path: '/volunteer' }
  ];

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: showNav ? 0 : '-100%' }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'fixed top-0 w-full z-50 bg-white border-b border-[#E5E7EB] transition-shadow duration-300',
        scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : ''
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="EVV Logo" className="h-[40px] object-contain" />
            <div className="h-6 w-px bg-[#E5E7EB]" />
            <div className="flex flex-col">
              <span 
                className="font-[Playfair_Display] font-bold text-[22px] leading-none"
                style={{
                  background: 'linear-gradient(to right, #00C896, #007A5E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.08em'
                }}
              >
                EVV
              </span>
              <span className="font-[Plus_Jakarta_Sans] text-[9px] text-[#9CA3AF] uppercase mt-1" style={{ letterSpacing: '0.15em' }}>
                FOR THE VOICELESS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  'font-sans text-[15px] text-[#374151] nav-link transition-colors',
                  location.pathname === link.path ? 'text-[var(--accent-primary)] font-semibold' : ''
                )}
              >
                {link.name}
              </Link>
            ))}

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#00C896] flex items-center justify-center text-white font-[Plus_Jakarta_Sans] font-bold text-sm">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </div>
                  <span className="font-[Plus_Jakarta_Sans] text-sm text-[#374151] font-medium">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown size={16} className="text-[#6B7280]" />
                </button>
                
                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-2 z-50"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="block px-4 py-2 text-sm text-[#374151] hover:bg-gray-50 font-[Plus_Jakarta_Sans]"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/volunteer"
                        onClick={() => setShowUserDropdown(false)}
                        className="block px-4 py-2 text-sm text-[#374151] hover:bg-gray-50 font-[Plus_Jakarta_Sans]"
                      >
                        My Tasks
                      </Link>
                      <hr className="my-2 border-[#E5E7EB]" />
                      <button
                        onClick={() => {
                          logout()
                          setShowUserDropdown(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 font-[Plus_Jakarta_Sans]"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigate('/join')}
                className="btn-primary"
              >
                Join Us
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#374151] p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-[#E5E7EB] overflow-hidden"
          >
            <div className="flex flex-col px-4 py-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="font-sans text-[15px] text-[#374151] py-2 w-full block border-b border-[#F1F3F5]"
                >
                  {link.name}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="font-[Plus_Jakarta_Sans] text-[15px] text-[#374151] py-2 w-full block border-b border-[#F1F3F5]"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/volunteer"
                    onClick={() => setIsOpen(false)}
                    className="font-[Plus_Jakarta_Sans] text-[15px] text-[#374151] py-2 w-full block border-b border-[#F1F3F5]"
                  >
                    My Tasks
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="font-[Plus_Jakarta_Sans] text-[15px] text-red-600 py-2 w-full block border-b border-[#F1F3F5] text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/join');
                  }}
                  className="btn-primary w-full mt-2"
                >
                  Join Us
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
