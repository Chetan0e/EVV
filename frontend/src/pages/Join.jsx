import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ROLES = [
  { id: 'reporter', icon: '🙋', label: 'Reporter' },
  { id: 'feeder', icon: '🍱', label: 'Feeder' },
  { id: 'transporter', icon: '🚗', label: 'Transporter' },
  { id: 'foster', icon: '🏠', label: 'Foster' },
  { id: 'ngo', icon: '🏢', label: 'NGO' },
];

export default function Join() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    role: 'reporter'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post('/api/auth/send-otp', formData, { timeout: 2000 });
      setIsSuccess(true);
    } catch (err) {
      // Local fallback
      localStorage.setItem('evv_user', JSON.stringify({ ...formData, isAuthenticated: true }));
      setIsSuccess(true);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 pt-[100px]">
        <div className="w-full max-w-[480px]">
          
          <Link to="/" className="inline-flex items-center gap-2 mb-10 text-[var(--mid-gray)] hover:text-[var(--dark)] transition-colors">
            &larr; Back to Home
          </Link>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-[#00C8961A] text-[var(--accent-primary)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h2 className="font-display text-[32px] font-bold text-[var(--dark)] mb-4">Welcome to EVV!</h2>
                <p className="font-sans text-[var(--mid-gray)] mb-8">We'll be in touch shortly to get you started on your journey to saving lives.</p>
                <Link to="/" className="btn-primary w-full">Go to Dashboard</Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h1 className="font-display text-[40px] font-bold text-[var(--dark)] mb-8 leading-tight">Join EVV</h1>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div>
                    <label className="block font-sans font-bold text-[var(--dark)] mb-2">Full Name</label>
                    <input 
                      type="text" required
                      className="w-full h-[52px] bg-white border border-[#D1D5DB] rounded-xl px-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block font-sans font-bold text-[var(--dark)] mb-2">Phone Number</label>
                    <div className="flex">
                      <div className="w-[60px] h-[52px] bg-[var(--off-white)] border border-[#D1D5DB] border-r-0 rounded-l-xl flex items-center justify-center font-sans font-medium text-[var(--mid-gray)]">
                        +91
                      </div>
                      <input 
                        type="tel" required pattern="[0-9]{10}"
                        className="flex-1 h-[52px] bg-white border border-[#D1D5DB] rounded-r-xl px-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans font-bold text-[var(--dark)] mb-2">City</label>
                    <input 
                      type="text" required
                      className="w-full h-[52px] bg-white border border-[#D1D5DB] rounded-xl px-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block font-sans font-bold text-[var(--dark)] mb-3">Primary Role</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ROLES.map(role => (
                        <div 
                          key={role.id}
                          onClick={() => setFormData({...formData, role: role.id})}
                          className={`relative border rounded-xl p-3 text-center cursor-pointer transition-all ${formData.role === role.id ? 'border-[var(--accent-primary)] bg-[#00C89608]' : 'border-[#E5E7EB] hover:border-[var(--accent-primary)]'}`}
                        >
                          <div className="text-2xl mb-1">{role.icon}</div>
                          <div className={`font-sans text-sm font-bold ${formData.role === role.id ? 'text-[var(--accent-primary)]' : 'text-[var(--mid-gray)]'}`}>
                            {role.label}
                          </div>
                          {formData.role === role.id && (
                            <div className="absolute top-2 right-2 text-[var(--accent-primary)]">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-[56px] bg-[var(--accent-primary)] text-white font-sans font-bold text-lg rounded-xl hover:bg-[#00A878] transition-colors shadow-lg shadow-[#00C89640] mt-4 flex items-center justify-center"
                  >
                    {isSubmitting ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Join Now →'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Illustration */}
      <div className="hidden lg:flex w-1/2 bg-[var(--off-white)] p-12 items-center justify-center relative overflow-hidden border-l border-[#E5E7EB]">
        {/* Decorative BG pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-dot-grid" style={{ backgroundSize: '20px 20px' }}></div>
        
        <div className="relative z-10 max-w-[400px]">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl mb-8 shadow-sm">
            🐾
          </div>
          
          <h2 className="font-display text-[48px] font-bold text-[var(--dark)] mb-8 leading-tight">Why join EVV?</h2>
          
          <div className="space-y-6">
            {[
              "Help animals without adopting",
              "Your own impact dashboard",
              "NGO-verified tasks near you",
              "100% free, always"
            ].map((text, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="flex items-center gap-4"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="font-sans text-lg text-[var(--dark)] font-medium">{text}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-[#D1D5DB]">
            <p className="font-decorative text-2xl text-[var(--mid-gray)] italic">
              "We cannot do everything, but we can all do something."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
