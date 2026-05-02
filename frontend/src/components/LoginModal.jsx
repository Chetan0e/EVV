import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: register
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.sendOTP(phone);
      setStep(2);
      setResendTimer(30);
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      toast.success('OTP sent successfully!');
    } catch (err) {
      toast.error('Failed to send OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const otpValue = otp.join('');
    try {
      const res = await authAPI.verifyOTP(phone, otpValue);
      if (res.data?.data?.isNewUser) {
        setStep(3);
      } else {
        login(res.data.data.token, res.data.data.user);
        toast.success(`Welcome, ${res.data.data.user?.name || 'User'}! You're now logged in.`);
        onClose();
      }
    } catch (err) {
      toast.error('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register({ phone, name, city, role });
      login(res.data.data.token, res.data.data.user);
      toast.success(`Welcome, ${name}! You're now logged in.`);
      onClose();
    } catch (err) {
      toast.error('Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-advance to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[440px]"
          >
            <div className="bg-white rounded-[24px] p-8 relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>

              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img src={logo} alt="EVV Logo" className="h-[32px] object-contain" />
              </div>

              <h2 className="font-[Playfair_Display] text-[28px] font-bold text-center text-[#111827] mb-2">
                Welcome Back
              </h2>
              <p className="font-[Plus_Jakarta_Sans] text-center text-[#6B7280] mb-6">
                Login with your phone number
              </p>

              {/* Step 1: Phone Input */}
              {step === 1 && (
                <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                  <div>
                    <label className="block font-[Plus_Jakarta_Sans] font-bold text-[#111827] mb-2">
                      Phone Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-[#D1D5DB] rounded-l-xl text-[#6B7280] font-[Plus_Jakarta_Sans]">
                        +91
                      </span>
                      <input
                        type="tel"
                        placeholder="XXXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="flex-1 h-[52px] border border-[#D1D5DB] rounded-r-xl px-4 font-[Plus_Jakarta_Sans] text-[#111827] outline-none focus:border-[#00C896] transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || phone.length !== 10}
                    className="w-full h-[56px] bg-[#00C896] text-white font-[Plus_Jakarta_Sans] font-bold rounded-xl hover:bg-[#00A878] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Send OTP →'
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Input */}
              {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                  <p className="text-center font-[Plus_Jakarta_Sans] text-[#6B7280]">
                    Enter the 6-digit OTP sent to +91{phone}
                  </p>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        className="w-12 h-12 text-center text-2xl font-bold border border-[#D1D5DB] rounded-xl outline-none focus:border-[#00C896] transition-colors"
                        required
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full h-[56px] bg-[#00C896] text-white font-[Plus_Jakarta_Sans] font-bold rounded-xl hover:bg-[#00A878] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Verify →'
                    )}
                  </button>
                  {resendTimer > 0 ? (
                    <p className="text-center font-[Plus_Jakarta_Sans] text-sm text-[#6B7280]">
                      Resend OTP in {resendTimer}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="text-center font-[Plus_Jakarta_Sans] text-sm text-[#00C896] hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </form>
              )}

              {/* Step 3: Registration */}
              {step === 3 && (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div>
                    <label className="block font-[Plus_Jakarta_Sans] font-bold text-[#111827] mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-[52px] border border-[#D1D5DB] rounded-xl px-4 font-[Plus_Jakarta_Sans] text-[#111827] outline-none focus:border-[#00C896] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-[Plus_Jakarta_Sans] font-bold text-[#111827] mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full h-[52px] border border-[#D1D5DB] rounded-xl px-4 font-[Plus_Jakarta_Sans] text-[#111827] outline-none focus:border-[#00C896] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-[Plus_Jakarta_Sans] font-bold text-[#111827] mb-2">
                      I want to help as
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Reporter', 'Feeder', 'Transporter', 'Donor'].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-3 rounded-xl font-[Plus_Jakarta_Sans] font-semibold transition-colors ${
                            role === r 
                              ? 'bg-[#00C896] text-white' 
                              : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !name || !city || !role}
                    className="w-full h-[56px] bg-[#00C896] text-white font-[Plus_Jakarta_Sans] font-bold rounded-xl hover:bg-[#00A878] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Complete Registration →'
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
