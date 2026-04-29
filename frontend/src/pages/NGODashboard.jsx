import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import RescueCard from '../components/RescueCard';
import MapView from '../components/MapView';

export default function NGODashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  
  const fetchReports = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rescue');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === 'ngo') fetchReports();
  }, [user]);

  if (!user || user.role !== 'ngo') return <Navigate to="/" />;

  return (
    <div className="pt-24 pb-20 container mx-auto px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">NGO Command Center</h1>
        <p className="text-[var(--text-muted)]">Manage rescues, dispatch volunteers, save lives.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-3xl text-center">
          <div className="text-4xl font-bold text-[var(--accent-coral)] mb-2">{reports.filter(r => r.status === 'reported').length}</div>
          <div className="text-sm text-[var(--text-muted)] uppercase tracking-wide">Pending Rescues</div>
        </div>
        <div className="glass-panel p-6 rounded-3xl text-center">
          <div className="text-4xl font-bold text-[var(--accent-amber)] mb-2">{reports.filter(r => r.status === 'assigned').length}</div>
          <div className="text-sm text-[var(--text-muted)] uppercase tracking-wide">In Progress</div>
        </div>
        <div className="glass-panel p-6 rounded-3xl text-center">
          <div className="text-4xl font-bold text-[var(--accent-green)] mb-2">{reports.filter(r => r.status === 'rescued').length}</div>
          <div className="text-sm text-[var(--text-muted)] uppercase tracking-wide">Rescued</div>
        </div>
        <div className="glass-panel p-6 rounded-3xl text-center bg-[var(--accent-teal)]/10 border-[var(--accent-teal)]">
          <button className="w-full h-full text-[var(--accent-teal)] font-bold text-lg flex items-center justify-center">
            + Request Volunteer
          </button>
        </div>
      </div>

      <div className="mb-10 h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Live Incident Map</h2>
        <MapView items={reports} type="rescue" />
      </div>

      <h2 className="text-2xl font-bold mb-6">Incoming Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(report => (
          <RescueCard key={report._id} report={report} />
        ))}
      </div>
    </div>
  );
}
