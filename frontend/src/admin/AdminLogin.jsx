import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await adminAPI.login(credentials);
      sessionStorage.setItem('evv_admin_token', res.data.data.token);
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Invalid credentials. Access denied.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px]"
      >
        <div className="bg-white rounded-[24px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#111827] rounded-full flex items-center justify-center">
              <Shield size={32} className="text-white" />
            </div>
          </div>

          <h2 className="font-[Playfair_Display] text-[28px] font-bold text-center text-[#111827] mb-2">
            Admin Portal
          </h2>
          <p className="font-[Plus_Jakarta_Sans] text-center text-[#6B7280] mb-8">
            Secure access for authorized personnel only
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block font-[Plus_Jakarta_Sans] font-bold text-[#111827] mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full h-[52px] border border-[#D1D5DB] rounded-xl px-4 font-[Plus_Jakarta_Sans] text-[#111827] outline-none focus:border-[#111827] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block font-[Plus_Jakarta_Sans] font-bold text-[#111827] mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full h-[52px] border border-[#D1D5DB] rounded-xl px-4 font-[Plus_Jakarta_Sans] text-[#111827] outline-none focus:border-[#111827] transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !credentials.username || !credentials.password}
              className="w-full h-[56px] bg-[#111827] text-white font-[Plus_Jakarta_Sans] font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock size={20} /> Login
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="font-[Plus_Jakarta_Sans] text-sm text-[#6B7280] hover:text-[#111827]">
              ← Back to Public Site
            </Link>
          </div>
        </div>

        <p className="text-center font-[Plus_Jakarta_Sans] text-xs text-gray-500 mt-6">
          Unauthorized access attempts are logged and monitored.
        </p>
      </motion.div>
    </div>
  );
}
