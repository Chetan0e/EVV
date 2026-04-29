import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Profile() {
  const { user, requestOtp, login, logout } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="pt-24 pb-20 container mx-auto px-4 max-w-3xl">
        <div className="glass-panel p-10 rounded-3xl text-center">
          <div className="w-24 h-24 mx-auto bg-[var(--accent-teal)] rounded-full text-black flex items-center justify-center text-4xl font-bold mb-6">
            {user.name.charAt(0)}
          </div>
          <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
          <p className="text-[var(--accent-teal)] mb-6 capitalize">{user.role}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-black/30 p-4 rounded-2xl">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-xs text-[var(--text-muted)]">Rescues</div>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-xs text-[var(--text-muted)]">Tasks</div>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-xs text-[var(--text-muted)]">Impact Points</div>
            </div>
          </div>

          <button onClick={logout} className="text-[var(--accent-coral)] border border-[var(--accent-coral)]/30 px-8 py-3 rounded-full hover:bg-[var(--accent-coral)]/10 transition">
            Logout
          </button>
        </div>
      </div>
    );
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await requestOtp(phone);
    if (res.success) {
      setStep(2);
      setMessage(res.message); // This will show the OTP in the UI since it's just a demo without real SMS
    } else {
      setMessage(res.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await login(phone, otp);
    if (!res.success) {
      setMessage(res.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 max-w-md">
      <div className="glass-panel p-8 rounded-3xl text-center">
        <h1 className="text-3xl font-bold mb-2">Login</h1>
        <p className="text-[var(--text-muted)] mb-8">
          {step === 1 ? 'Enter your phone number to continue' : 'Enter the OTP sent to your phone'}
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.includes('Failed') || message.includes('Invalid') ? 'bg-[var(--accent-coral)]/20 text-[var(--accent-coral)]' : 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]'}`}>
            {message}
          </div>
        )}
        
        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <input 
              type="tel" 
              placeholder="Phone Number (e.g. 7777777777)" 
              className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 text-white mb-6 text-center text-lg tracking-widest outline-none focus:border-[var(--accent-teal)]"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={loading || phone.length < 10}
              className="w-full bg-[var(--accent-teal)] text-black py-4 rounded-xl font-bold text-lg magnetic-btn disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <input 
              type="text" 
              placeholder="Enter 6-digit OTP" 
              className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 text-white mb-6 text-center text-lg tracking-widest outline-none focus:border-[var(--accent-teal)]"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={loading || otp.length < 4}
              className="w-full bg-[var(--accent-teal)] text-black py-4 rounded-xl font-bold text-lg magnetic-btn disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 text-[var(--text-muted)] text-sm underline hover:text-white"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
