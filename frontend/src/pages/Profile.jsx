import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Download, MapPin, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { volunteerAPI } from '../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

export default function Profile() {
  const { user, logout, loading: authLoading, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/join');
      return;
    }
    fetchMyTasks();
  }, [isLoggedIn, navigate]);

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const res = await volunteerAPI.getMyTasks();
      setMyTasks(res.data?.data || []);
    } catch (err) {
      setMyTasks([]);
    }
    setLoading(false);
  };

  const handleDownloadCertificate = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    doc.setFillColor(0, 200, 150, 0.1);
    doc.rect(0, 0, pageWidth, 297, 'F');

    doc.setFontSize(32);
    doc.setTextColor(0, 122, 94);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Appreciation', centerX, 40, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('Every Voice for Voiceless', centerX, 52, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text('This certificate is proudly awarded to', centerX, 80, { align: 'center' });

    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(user?.name || 'Volunteer', centerX, 95, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.setFont('helvetica', 'normal');
    const description = `For their outstanding dedication and compassion in helping animals in need. Through ${myTasks.length} volunteer tasks, they have made a significant impact in ${user?.city || 'their community'}.`;
    const splitDescription = doc.splitTextToSize(description, pageWidth - 40);
    doc.text(splitDescription, centerX, 115, { align: 'center' });

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${today}`, centerX, 180, { align: 'center' });

    doc.setDrawColor(200);
    doc.line(centerX - 50, 200, centerX + 50, 200);
    doc.setFontSize(10);
    doc.text('EVV Team', centerX, 208, { align: 'center' });

    doc.setFontSize(30);
    doc.text('🏅', centerX - 40, 240, { align: 'center' });
    doc.text('🌟', centerX, 240, { align: 'center' });
    doc.text('⭐', centerX + 40, 240, { align: 'center' });

    doc.save(`EVV_Certificate_${user?.name || 'Volunteer'}.pdf`);
    toast.success('Certificate downloaded!');
  };

  const badges = [
    { icon: '🏅', name: 'Rescue Hero', desc: 'Completed 5+ rescue tasks', earned: myTasks.length >= 5 },
    { icon: '🌟', name: 'Community Champion', desc: 'Completed 10+ tasks', earned: myTasks.length >= 10 },
    { icon: '⭐', name: 'Top Volunteer', desc: 'Completed 20+ tasks', earned: myTasks.length >= 20 }
  ];

  if (authLoading) {
    return <div className="min-h-screen bg-[#F8F9FA] pt-[100px] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-[100px] pb-[100px] px-4">
      <div className="container mx-auto max-w-[900px]">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[24px] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.08)] mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-[#00C896] flex items-center justify-center text-white font-[Plus_Jakarta_Sans] font-bold text-[32px]">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-[Playfair_Display] text-[32px] font-bold text-[#111827] mb-2">
                {user?.name || 'Volunteer'}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[#6B7280] font-[Plus_Jakarta_Sans]">
                <span className="flex items-center gap-1">
                  <MapPin size={16} /> {user?.city || 'Unknown City'}
                </span>
                <span>•</span>
                <span className="px-3 py-1 bg-[#00C896]/10 text-[#00C896] rounded-full text-sm font-semibold">
                  {user?.role || 'Volunteer'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-[Plus_Jakarta_Sans] font-semibold"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.08)] text-center">
            <div className="text-4xl font-bold text-[#00C896] mb-2 font-[Playfair_Display]">
              {myTasks.length}
            </div>
            <div className="font-[Plus_Jakarta_Sans] text-[#6B7280]">Tasks Completed</div>
          </div>
          <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.08)] text-center">
            <div className="text-4xl font-bold text-[#FBBF24] mb-2 font-[Playfair_Display]">
              {badges.filter(b => b.earned).length}
            </div>
            <div className="font-[Plus_Jakarta_Sans] text-[#6B7280]">Badges Earned</div>
          </div>
          <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.08)] text-center">
            <div className="text-4xl font-bold text-[#3B82F6] mb-2 font-[Playfair_Display]">
              {user?.city || '—'}
            </div>
            <div className="font-[Plus_Jakarta_Sans] text-[#6B7280]">City</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[24px] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.08)] mb-8"
        >
          <h2 className="font-[Playfair_Display] text-[24px] font-bold text-[#111827] mb-6 flex items-center gap-2">
            <Award size={24} className="text-[#FBBF24]" /> Your Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  badge.earned
                    ? 'border-[#FBBF24] bg-[#FBBF24]/10'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                  {badge.icon}
                </div>
                <h3 className="font-[Plus_Jakarta_Sans] font-bold text-[#111827] mb-1">
                  {badge.name}
                </h3>
                <p className="font-[Plus_Jakarta_Sans] text-xs text-[#6B7280]">
                  {badge.desc}
                </p>
                {badge.earned && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[#00C896] text-xs font-semibold">
                    <ShieldCheck size={14} /> Earned
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-[#00C896] to-[#007A5E] rounded-[24px] p-8 text-white mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-[Playfair_Display] text-[24px] font-bold mb-2">
                Download Your Certificate
              </h2>
              <p className="font-[Plus_Jakarta_Sans] opacity-90">
                Get a personalized certificate for your volunteer work
              </p>
            </div>
            <button
              onClick={handleDownloadCertificate}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#00C896] rounded-xl font-[Plus_Jakarta_Sans] font-bold hover:bg-gray-100 transition-colors"
            >
              <Download size={20} /> Download PDF
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[24px] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.08)]"
        >
          <h2 className="font-[Playfair_Display] text-[24px] font-bold text-[#111827] mb-6">
            My Tasks
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="w-8 h-8 border-4 border-[#00C896] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : myTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="font-[Plus_Jakarta_Sans] font-bold text-[#111827] mb-2">No tasks yet</h3>
              <p className="font-[Plus_Jakarta_Sans] text-[#6B7280] mb-4">
                Start volunteering to earn badges and make a difference!
              </p>
              <Link
                to="/volunteer"
                className="inline-block px-6 py-3 bg-[#00C896] text-white rounded-xl font-[Plus_Jakarta_Sans] font-bold hover:bg-[#00A878] transition-colors"
              >
                Find Tasks →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myTasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-[#E5E7EB] rounded-xl hover:border-[#00C896] transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-[Plus_Jakarta_Sans] font-bold text-[#111827]">
                      {task.title || task.taskId}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'completed' 
                        ? 'bg-[#00C896]/10 text-[#00C896]' 
                        : 'bg-[#FBBF24]/10 text-[#FBBF24]'
                    }`}>
                      {task.status || 'In Progress'}
                    </span>
                  </div>
                  <p className="font-[Plus_Jakarta_Sans] text-sm text-[#6B7280]">
                    {task.type || 'Volunteer Task'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
