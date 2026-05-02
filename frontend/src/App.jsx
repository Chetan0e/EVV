import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import Landing from './pages/Landing';
import RescueReport from './pages/RescueReport';
import FoodRescue from './pages/FoodRescue';
import VolunteerHub from './pages/VolunteerHub';
import Profile from './pages/Profile';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Loading from './components/Loading';

import { AuthProvider } from './context/AuthContext';

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/report" element={<PageWrapper><RescueReport /></PageWrapper>} />
        <Route path="/food" element={<PageWrapper><FoodRescue /></PageWrapper>} />
        <Route path="/volunteer" element={<PageWrapper><VolunteerHub /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/join" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Show premium loader for 2 seconds
    const timer = setTimeout(() => setIsLoaded(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Loading isLoaded={isLoaded} />

        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 w-full relative">
            <AnimatedRoutes />
          </main>
          <BottomNav />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#111827',
              color: '#fff',
            },
            success: {
              style: {
                background: '#00C896',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
