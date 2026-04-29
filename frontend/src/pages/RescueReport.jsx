import React, { useState } from 'react';
import { Camera, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import axios from 'axios';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RescueReport() {
  const { user } = useAuth();
  const { location, getLocation, loading: locLoading } = useLocation();
  const [formData, setFormData] = useState({
    animalType: 'dog',
    count: 1,
    severity: 'moderate',
    description: '',
    address: ''
  });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState(null);

  if (!user) return <Navigate to="/" />; // Usually should redirect to login, but for simple app, home is fine

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.lat) {
      alert("Please allow location access to report accurately.");
      return;
    }
    
    setSubmitting(true);
    const data = new FormData();
    data.append('animalType', formData.animalType);
    data.append('count', formData.count);
    data.append('severity', formData.severity);
    data.append('description', formData.description);
    data.append('address', formData.address);
    data.append('lat', location.lat);
    data.append('lng', location.lng);
    if (image) data.append('images', image);

    try {
      const res = await axios.post('http://localhost:5000/api/rescue', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setSuccessId(res.data.data._id);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit report');
    }
    setSubmitting(false);
  };

  if (successId) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center max-w-lg">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-10 rounded-3xl border-[var(--accent-green)]/30">
          <div className="w-20 h-20 bg-[var(--accent-green)]/20 text-[var(--accent-green)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Report Received!</h2>
          <p className="text-[var(--text-muted)] mb-6">
            Thank you for being their voice. Nearby NGOs have been alerted.
          </p>
          <div className="bg-black/50 rounded-xl p-4 mb-8">
            <p className="text-sm text-[var(--text-secondary)] mb-1">Rescue ID</p>
            <p className="mono-stats text-xl text-[var(--accent-teal)]">#{successId.slice(-8)}</p>
          </div>
          <Link to="/dashboard" className="bg-[var(--accent-teal)] text-black px-6 py-3 rounded-full font-bold w-full block">
            Return to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 container mx-auto px-4 md:px-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Report a Rescue</h1>
        <p className="text-[var(--text-muted)]">Every detail helps them get faster care.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-3xl space-y-6">
        
        {/* Image Upload */}
        <div className="relative">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Photo</label>
          <div className="border-2 border-dashed border-[var(--border)] rounded-2xl h-48 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 transition cursor-pointer overflow-hidden relative">
            {image ? (
              <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-10 h-10 text-[var(--text-muted)] mb-2" />
                <span className="text-sm text-[var(--text-muted)]">Tap to upload photo</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Location</label>
          <div className="flex gap-2 mb-2">
            <button 
              type="button"
              onClick={getLocation}
              className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl flex items-center justify-center text-[var(--accent-teal)] hover:bg-white/10"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              placeholder="Detailed Address (e.g., Near City Mall)" 
              className="flex-1 bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:border-[var(--accent-teal)] focus:outline-none"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
            />
          </div>
          {locLoading && <p className="text-xs text-[var(--accent-amber)]">Getting GPS...</p>}
          {location.lat && !locLoading && <p className="text-xs text-[var(--accent-green)]">GPS locked: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Animal</label>
            <select 
              className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:border-[var(--accent-teal)] focus:outline-none appearance-none"
              value={formData.animalType}
              onChange={(e) => setFormData({...formData, animalType: e.target.value})}
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="cow">Cow</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Count</label>
            <input 
              type="number" 
              min="1"
              className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:border-[var(--accent-teal)] focus:outline-none"
              value={formData.count}
              onChange={(e) => setFormData({...formData, count: e.target.value})}
            />
          </div>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Severity</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'minor', label: 'Minor', color: 'text-[var(--accent-green)] border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10' },
              { id: 'moderate', label: 'Moderate', color: 'text-[var(--accent-amber)] border-[var(--accent-amber)]/30 bg-[var(--accent-amber)]/10' },
              { id: 'critical', label: 'Critical', color: 'text-[var(--accent-coral)] border-[var(--accent-coral)]/30 bg-[var(--accent-coral)]/10' }
            ].map(s => (
              <div 
                key={s.id}
                onClick={() => setFormData({...formData, severity: s.id})}
                className={`border rounded-xl p-3 text-center cursor-pointer transition-all ${
                  formData.severity === s.id ? s.color : 'border-[var(--border)] bg-black/30 text-[var(--text-muted)] hover:border-white/20'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Description</label>
          <textarea 
            rows="3"
            placeholder="What's wrong? (e.g., Bleeding from leg, hasn't eaten in days)" 
            className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:border-[var(--accent-teal)] focus:outline-none resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-[var(--accent-teal)] text-black py-4 rounded-xl font-bold text-lg magnetic-btn hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {submitting ? 'Submitting...' : <><AlertCircle /> Submit Report</>}
        </button>
      </form>
    </div>
  );
}
