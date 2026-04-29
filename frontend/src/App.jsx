import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import RescueReport from './pages/RescueReport';
import FoodRescue from './pages/FoodRescue';
import VolunteerHub from './pages/VolunteerHub';
import NGODashboard from './pages/NGODashboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="flex flex-col min-h-screen pb-16 md:pb-0">
            <Navbar />
            <main className="flex-1 overflow-x-hidden">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/report" element={<RescueReport />} />
                <Route path="/food" element={<FoodRescue />} />
                <Route path="/volunteer" element={<VolunteerHub />} />
                <Route path="/ngo" element={<NGODashboard />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
