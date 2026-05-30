import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Check, Utensils } from 'lucide-react';
import { foodAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoginModal from '../components/LoginModal';

const MOCK_DONATIONS = [
  {
    id: 'f1',
    description: 'Leftover rice and dal from wedding',
    qty: 25,
    unit: 'kg',
    expiresIn: '2 hrs',
    postedAgo: '12 mins ago',
    distance: '0.8 km',
    claimed: false
  },
  {
    id: 'f2',
    description: 'Unsold chicken biryani',
    qty: 15,
    unit: 'plates',
    expiresIn: '1 hr',
    postedAgo: '5 mins ago',
    distance: '1.2 km',
    claimed: false
  },
  {
    id: 'f3',
    description: 'Vegetable stew and roti',
    qty: 40,
    unit: 'plates',
    expiresIn: '4 hrs',
    postedAgo: '45 mins ago',
    distance: '3.5 km',
    claimed: false
  },
  {
    id: 'f4',
    description: 'Excess dog food packets',
    qty: 5,
    unit: 'kg',
    expiresIn: 'Next Day',
    postedAgo: '1 hr ago',
    distance: '5.0 km',
    claimed: false
  }
];

export default function FoodRescue() {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('donate'); // 'donate' | 'claim'
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Donate Form State
  const [formData, setFormData] = useState({
    description: '',
    qty: '',
    unit: 'kg',
    expiresIn: '2hr',
    location: '',
    phone: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donateSuccess, setDonateSuccess] = useState(false);

  // Claim State
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [claimedIds, setClaimedIds] = useState([]);

  useEffect(() => {
    if (activeTab === 'claim') {
      fetchDonations();
    }
  }, [activeTab]);

  const fetchDonations = async () => {
    setLoadingDonations(true);
    try {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              const res = await foodAPI.getAvailable(latitude, longitude);
              setDonations(res.data?.data || MOCK_DONATIONS);
            } catch (err) {
              console.error('Failed to fetch donations with location:', err);
              setDonations(MOCK_DONATIONS);
            }
            setLoadingDonations(false);
          },
          async () => {
            // Location denied - use Kolhapur default
            try {
              const res = await foodAPI.getAvailable(16.7050, 74.2433);
              setDonations(res.data?.data || MOCK_DONATIONS);
            } catch (err) {
              console.error('Failed to fetch donations with default location:', err);
              setDonations(MOCK_DONATIONS);
            }
            setLoadingDonations(false);
          }
        );
      } else {
        // Geolocation not supported - use default
        try {
          const res = await foodAPI.getAvailable(16.7050, 74.2433);
          setDonations(res.data?.data || MOCK_DONATIONS);
        } catch (err) {
          console.error('Failed to fetch donations:', err);
          setDonations(MOCK_DONATIONS);
        }
        setLoadingDonations(false);
      }
    } catch (err) {
      console.error('Error in fetchDonations:', err);
      setDonations(MOCK_DONATIONS);
      setLoadingDonations(false);
    }
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('description', formData.description);
      formDataToSend.append('qty', formData.qty);
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('expiresIn', formData.expiresIn);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('phone', formData.phone);
      if (formData.image) formDataToSend.append('image', formData.image);
      
      await foodAPI.create(formDataToSend);
      setDonateSuccess(true);
      toast.success('Food donation posted successfully!');
    } catch (err) {
      // Fallback to localStorage if API fails
      const stored = JSON.parse(localStorage.getItem('evv_food') || '[]');
      stored.push({ ...formData, id: `F-${Date.now()}`, createdAt: new Date() });
      localStorage.setItem('evv_food', JSON.stringify(stored));
      setDonateSuccess(true);
      toast.success('Food donation posted successfully!');
    }
    
    setIsSubmitting(false);
    setTimeout(() => {
      setDonateSuccess(false);
      setFormData({
        description: '', qty: '', unit: 'kg', expiresIn: '2hr', location: '', phone: '', image: null
      });
      setActiveTab('claim');
    }, 2500);
  };

  const handleClaim = async (id, donorPhone) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      await foodAPI.claim(id);
      setClaimedIds([...claimedIds, id]);
      toast.success(`You've claimed this donation! Contact the donor at ${donorPhone || 'the provided number'} to coordinate pickup.`);
    } catch (err) {
      console.error('Failed to claim donation:', err);
      toast.error('Failed to claim donation. Please try again.');
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({ ...formData, location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
        },
        (err) => {
          console.error('Geolocation error:', err);
          toast.error('Could not get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--off-white)] pt-[100px] pb-[100px]">
      <div className="container mx-auto px-4 max-w-[800px]">
        
        <div className="text-center mb-10">
          <h1 className="font-display text-[48px] font-bold text-[var(--dark)] leading-tight mb-2">Food Rescue Connect</h1>
          <p className="font-decorative text-[24px] text-[var(--accent-primary)] italic">"Your leftovers are their lifeline."</p>
        </div>

        {/* TABS */}
        <div className="flex bg-white p-1 rounded-full shadow-sm mb-8 relative border border-[#E5E7EB]">
          <div 
            className="absolute top-1 bottom-1 left-1 bg-[var(--accent-primary)] rounded-full transition-all duration-300 z-0"
            style={{ width: 'calc(50% - 4px)', transform: activeTab === 'donate' ? 'translateX(0)' : 'translateX(100%)' }}
          ></div>
          <button 
            onClick={() => setActiveTab('donate')}
            className={`flex-1 py-3 font-sans font-bold text-sm rounded-full relative z-10 transition-colors ${activeTab === 'donate' ? 'text-white' : 'text-[var(--mid-gray)]'}`}
          >
            Donate Food
          </button>
          <button 
            onClick={() => setActiveTab('claim')}
            className={`flex-1 py-3 font-sans font-bold text-sm rounded-full relative z-10 transition-colors ${activeTab === 'claim' ? 'text-white' : 'text-[var(--mid-gray)]'}`}
          >
            Find & Claim Donations
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border border-[#F1F3F5] p-6 md:p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: DONATE FOOD */}
            {activeTab === 'donate' && (
              <motion.div
                key="donate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {donateSuccess ? (
                  <div className="h-[300px] flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-[var(--accent-yellow)]/20 text-[var(--accent-yellow)] rounded-full flex items-center justify-center mb-4">
                      <Check size={40} strokeWidth={3} />
                    </div>
                    <h3 className="font-display text-[28px] font-bold text-[var(--dark)] mb-2">Posted!</h3>
                    <p className="font-sans text-[var(--mid-gray)]">Nearby feeders have been notified.</p>
                  </div>
                ) : (
                  <form onSubmit={handleDonateSubmit} className="flex flex-col gap-6">
                    <div>
                      <label className="block font-sans font-bold text-[var(--dark)] mb-2">Food Description</label>
                      <input 
                        type="text" required
                        placeholder="e.g., Leftover rice and dal, 5 rotis..."
                        className="w-full h-[52px] bg-[var(--off-white)] border border-[#D1D5DB] rounded-xl px-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-yellow)] transition-colors"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block font-sans font-bold text-[var(--dark)] mb-2">Quantity</label>
                        <input 
                          type="number" required min="1"
                          className="w-full h-[52px] bg-[var(--off-white)] border border-[#D1D5DB] rounded-xl px-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-yellow)] transition-colors"
                          value={formData.qty}
                          onChange={e => setFormData({...formData, qty: e.target.value})}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block font-sans font-bold text-[var(--dark)] mb-2">Unit</label>
                        <select 
                          className="w-full h-[52px] bg-[var(--off-white)] border border-[#D1D5DB] rounded-xl px-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-yellow)] transition-colors"
                          value={formData.unit}
                          onChange={e => setFormData({...formData, unit: e.target.value})}
                        >
                          <option value="kg">KG</option>
                          <option value="plates">Plates</option>
                          <option value="packets">Packets</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans font-bold text-[var(--dark)] mb-2">Expires In</label>
                      <div className="flex flex-wrap gap-2">
                        {['1hr', '2hr', '4hr', '6hr', 'Next Day'].map(t => (
                          <button
                            type="button"
                            key={t}
                            onClick={() => setFormData({...formData, expiresIn: t})}
                            className={`px-4 py-2 rounded-full font-sans text-sm font-semibold transition-colors ${formData.expiresIn === t ? 'bg-[var(--accent-yellow)] text-white' : 'bg-[var(--off-white)] text-[var(--mid-gray)] border border-[#D1D5DB]'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans font-bold text-[var(--dark)] mb-2">Location</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={getLocation} className="w-[52px] h-[52px] bg-[var(--off-white)] border border-[#D1D5DB] rounded-xl flex items-center justify-center text-[var(--accent-yellow)] hover:bg-yellow-50">
                          <MapPin size={20} />
                        </button>
                        <input 
                          type="text" required
                          placeholder="Address or detect location"
                          className="flex-1 h-[52px] bg-[var(--off-white)] border border-[#D1D5DB] rounded-xl px-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-yellow)] transition-colors"
                          value={formData.location}
                          onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans font-bold text-[var(--dark)] mb-2">Contact Phone</label>
                      <input 
                        type="tel" required
                        className="w-full h-[52px] bg-[var(--off-white)] border border-[#D1D5DB] rounded-xl px-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-yellow)] transition-colors"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-[56px] bg-[var(--accent-yellow)] text-[var(--dark)] font-sans font-bold text-lg rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-[#FBBF2440] flex items-center justify-center"
                    >
                      {isSubmitting ? <div className="w-6 h-6 border-2 border-[var(--dark)] border-t-transparent rounded-full animate-spin"></div> : 'Post Donation →'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* TAB 2: AVAILABLE DONATIONS */}
            {activeTab === 'claim' && (
              <motion.div
                key="claim"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {loadingDonations ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[var(--accent-yellow)] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : !donations || donations.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-[#00C896]/10 flex items-center justify-center mb-4">
                      <span className="text-4xl">🍱</span>
                    </div>
                    <h3 className="font-sans font-bold text-[#111827] mb-2">No donations near you right now.</h3>
                    <p className="font-sans text-sm text-[#6B7280] mb-4">Be the first to post leftover food for animals.</p>
                    <button 
                      onClick={() => setActiveTab('donate')}
                      className="bg-[var(--accent-primary)] text-white px-6 py-2 rounded-full font-sans font-bold hover:bg-[#00A878] transition-colors"
                    >
                      Donate Food →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {donations.map((d, i) => {
                      const isClaimed = claimedIds.includes(d.id);
                      return (
                        <motion.div 
                          key={d.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white border border-[#E5E7EB] border-l-4 border-l-[var(--accent-yellow)] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative"
                        >
                          <div className="flex gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-[var(--accent-yellow)] shrink-0">
                              <Utensils size={20} />
                            </div>
                            <div>
                              <h4 className="font-sans font-bold text-[var(--dark)] leading-snug">{d.description}</h4>
                              <p className="font-mono text-[11px] text-[var(--mid-gray)] mt-1">
                                Posted {d.createdAt ? new Date(d.createdAt).toLocaleString() : 'recently'}
                              </p>
                              <p className="font-sans text-xs text-[#6B7280] mt-1">
                                Donor: {d.donorName ? d.donorName.split(' ')[0] : 'Anonymous'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-[#00C8961A] text-[var(--accent-primary)] px-2 py-1 rounded-full font-sans font-bold text-[11px] uppercase tracking-wide">
                              {d.qty} {d.unit}
                            </span>
                            <span className="bg-[#FF6B351A] text-[#FF6B35] px-2 py-1 rounded-full font-sans font-bold text-[11px] uppercase tracking-wide">
                              Expires in {d.expiresIn}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-auto">
                            <span className="font-sans text-sm text-[var(--mid-gray)] flex items-center gap-1">
                              <MapPin size={14} /> {d.distance || 'Nearby'}
                            </span>
                            <button 
                              onClick={() => handleClaim(d.id, d.phone)}
                              disabled={isClaimed}
                              className={`px-4 py-2 rounded-lg font-sans font-bold text-sm transition-colors ${
                                isClaimed 
                                  ? 'bg-[#00C896] text-white cursor-not-allowed' 
                                  : 'bg-[var(--accent-yellow)] text-[var(--dark)] hover:bg-yellow-500'
                              }`}
                            >
                              {isClaimed ? '✓ Claimed by You' : 'Claim This →'}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

        {/* Login Modal */}
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
