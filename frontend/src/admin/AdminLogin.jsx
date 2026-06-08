import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00C896]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#00C896]/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-[32px] p-8 shadow-2xl shadow-black/30 border border-white/20">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#111827] to-gray-800 rounded-2xl flex items-center justify-center shadow-xl shadow-gray-900/20">
              <Shield size={36} className="text-white" />
            </div>
          </div>

          <h2 className="font-[Playfair_Display] text-[32px] font-bold text-center text-[#111827] mb-3">
            Admin Portal
          </h2>
          <p className="font-[Plus_Jakarta_Sans] text-center text-[#6B7280] mb-8 text-base">
            Secure access for authorized personnel only
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block font-[Plus_Jakarta_Sans] font-bold text-[#111827] mb-2.5 text-sm">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full h-[56px] border border-gray-200 rounded-2xl px-5 font-[Plus_Jakarta_Sans] text-[#111827] outline-none focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/20 transition-all bg-white/50"
                required
              />
            </div>

            <div>
              <label className="block font-[Plus_Jakarta_Sans] font-bold text-[#111827] mb-2.5 text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full h-[56px] border border-gray-200 rounded-2xl px-5 pr-14 font-[Plus_Jakarta_Sans] text-[#111827] outline-none focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/20 transition-all bg-white/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !credentials.username || !credentials.password}
              className="w-full h-[56px] bg-gradient-to-r from-[#111827] to-gray-800 text-white font-[Plus_Jakarta_Sans] font-bold rounded-2xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 transform hover:scale-[1.02]"
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

          <div className="mt-8 text-center">
            <Link to="/" className="font-[Plus_Jakarta_Sans] text-sm text-[#6B7280] hover:text-[#111827] transition-colors inline-flex items-center gap-1">
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
