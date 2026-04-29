import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import MapView from '../components/MapView';
import RescueCard from '../components/RescueCard';
import { useLocation } from '../hooks/useLocation';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const { location } = useLocation();

  useEffect(() => {
    if (user) {
      axios.get('http://localhost:5000/api/rescue').then(res => {
        if (res.data.success) {
          setReports(res.data.data);
        }
      });
    }
  }, [user]);

  if (authLoading) return <div className="pt-24 text-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (user.role === 'ngo') return <Navigate to="/ngo" />;

  return (
    <div className="pt-24 pb-20 container mx-auto px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Welcome back, <span className="text-[var(--accent-teal)]">{user.name}</span></h1>
        <p className="text-[var(--text-muted)]">Here's what's happening near you.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 h-[400px]">
          <MapView 
            center={location.lat ? [location.lat, location.lng] : undefined} 
            items={reports} 
            type="rescue" 
          />
        </div>
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-teal)]/20 text-[var(--accent-teal)] flex items-center justify-center text-2xl font-bold mb-4">
            {reports.filter(r => r.status === 'reported').length}
          </div>
          <h3 className="text-xl font-bold mb-2">Active Rescues</h3>
          <p className="text-[var(--text-muted)] text-sm">Animals waiting for help in your city.</p>
          <button className="mt-6 w-full bg-white/5 border border-white/10 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition">
            View All Map
          </button>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-end">
        <h2 className="text-2xl font-bold">Recent Reports</h2>
        <button className="text-[var(--accent-teal)] text-sm font-medium">See all</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.slice(0, 6).map(report => (
          <RescueCard key={report._id} report={report} />
        ))}
        {reports.length === 0 && (
          <div className="col-span-full py-10 text-center text-[var(--text-muted)] glass-panel rounded-2xl">
            No active rescues nearby.
          </div>
        )}
      </div>
    </div>
  );
}
