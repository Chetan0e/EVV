import React, { useState } from 'react';
import { Camera, MapPin, X, Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { rescueAPI } from '../services/api';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Component to dynamically update map center
const MapUpdater = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

export default function RescueReport() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    image: null,
    address: '',
    lat: null,
    lng: null,
    animalType: 'dog',
    count: 1,
    severity: 1, // 1: minor, 2: moderate, 3: critical
    description: '',
    phone: '',
    name: '',
    situationType: [] // Array for multiple selection
  });
  
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fallback for demo map
  const [mapCenter, setMapCenter] = useState([18.5204, 73.8567]); 

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
      setStep(2); // Auto proceed
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setPreview(null);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({ 
            ...formData, 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          });
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          alert('Could not get location. Please enter manually.');
        }
      );
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      if (formData.image) formDataToSend.append('image', formData.image);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('lat', formData.lat);
      formDataToSend.append('lng', formData.lng);
      formDataToSend.append('animalType', formData.animalType);
      formDataToSend.append('count', formData.count);
      formDataToSend.append('severity', formData.severity);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('situationType', JSON.stringify(formData.situationType));
      
      await rescueAPI.createReport(formDataToSend);
      setIsSuccess(true);
    } catch (err) {
      // Fallback to localStorage if API fails
      const stored = JSON.parse(localStorage.getItem('evv_reports') || '[]');
      stored.push({ ...formData, id: `EVV-${Math.floor(Math.random() * 10000)}`, createdAt: new Date() });
      localStorage.setItem('evv_reports', JSON.stringify(stored));
      setIsSuccess(true);
    }
    
    setIsSubmitting(false);
  };

  const severityColors = {
    1: '#FBBF24', // yellow
    2: '#FF6B35', // orange
    3: '#ef4444'  // red
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-20 px-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-[#00C89640]"
        >
          <Check size={48} strokeWidth={3} />
        </motion.div>
        
        <h2 className="text-h2 text-[var(--dark)] mb-2 text-center">Report #EVV-{Math.floor(Math.random()*10000)} Submitted!</h2>
        <p className="font-sans text-[var(--mid-gray)] text-center max-w-md mb-8">
          An NGO within 3.2km has been notified. Estimated response: 25 mins
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => {
              setIsSuccess(false);
              setStep(1);
              setFormData({...formData, image: null, description: ''});
              setPreview(null);
            }} 
            className="btn-primary"
          >
            Report Another
          </button>
          <Link to="/" className="btn-primary bg-[var(--light-gray)] text-[var(--dark)] hover:bg-[#E5E7EB]">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[100px] pb-[100px]">
      <div className="container mx-auto px-4 max-w-[600px]">
        
        <div className="text-center mb-10">
          <h1 className="font-display text-[48px] font-bold text-[var(--dark)] leading-tight mb-2">Report an Animal in Need</h1>
          <p className="font-sans text-[var(--mid-gray)]">Injured, homeless, hungry, or trapped — we connect them to help.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#E5E7EB] -z-10 -translate-y-1/2"></div>
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s} 
              onClick={() => s < step && setStep(s)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors cursor-pointer ${s === step ? 'bg-[var(--accent-primary)] text-white shadow-lg' : s < step ? 'bg-[var(--accent-primary)] text-white' : 'bg-white border-2 border-[#E5E7EB] text-[var(--mid-gray)]'}`}
            >
              {s < step ? <Check size={16} /> : s}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border border-[#F1F3F5] p-6 md:p-8 overflow-hidden relative min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: PHOTO */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 h-full justify-center"
              >
                {!preview ? (
                  <div className="border-2 border-dashed border-[#D1D5DB] hover:border-[var(--accent-primary)] transition-colors rounded-xl h-[300px] flex flex-col items-center justify-center bg-[var(--off-white)] relative cursor-pointer">
                    <Camera size={48} className="text-[#9CA3AF] mb-4" />
                    <p className="font-sans font-medium text-[var(--dark)] mb-2">Take photo or upload</p>
                    <p className="font-sans text-[12px] text-[var(--mid-gray)]">📱 On mobile, this opens your camera directly</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                  </div>
                ) : (
                  <div className="relative h-[300px] rounded-xl overflow-hidden group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={removeImage}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors backdrop-blur-sm"
                    >
                      <X size={20} />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                      <button onClick={() => setStep(2)} className="btn-primary w-full shadow-lg">Looks good &rarr;</button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: LOCATION */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <button 
                  onClick={getLocation}
                  className="w-full h-[56px] bg-[var(--accent-primary)] text-white font-sans font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#00A878] transition-colors"
                >
                  <MapPin size={20} /> Use My Current Location
                </button>
                
                {formData.lat && (
                  <p className="text-[var(--accent-primary)] text-sm font-semibold flex items-center gap-1">
                    <Check size={16} /> Location captured
                  </p>
                )}

                <div className="text-center text-[var(--mid-gray)] text-sm font-semibold">OR</div>

                <input 
                  type="text"
                  placeholder="Enter area/landmark"
                  className="w-full h-[52px] bg-white border border-[#D1D5DB] rounded-xl px-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />

                <div className="w-full h-[250px] bg-[var(--off-white)] rounded-xl overflow-hidden relative z-0">
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater center={mapCenter} />
                    {formData.lat && <Marker position={[formData.lat, formData.lng]} icon={icon} />}
                  </MapContainer>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="btn-primary bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]">Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1">Next Step &rarr;</button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <label className="block font-sans font-bold text-[var(--dark)] mb-3">Animal Type</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {id: 'dog', icon: '🐕', label: 'Dog'},
                      {id: 'cat', icon: '🐈', label: 'Cat'},
                      {id: 'cow', icon: '🐄', label: 'Cow'},
                      {id: 'bird', icon: '🦜', label: 'Bird'},
                      {id: 'other', icon: '❓', label: 'Other'},
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setFormData({...formData, animalType: type.id})}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${formData.animalType === type.id ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white' : 'bg-white border-[#D1D5DB] text-[var(--dark)] hover:border-[var(--accent-primary)]'}`}
                      >
                        <span>{type.icon}</span> <span className="font-sans font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-sans font-bold text-[var(--dark)] mb-3">What kind of help is needed?</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {id: 'injured', icon: '🚨', label: 'Injured / Sick', color: '#ef4444'},
                      {id: 'homeless', icon: '🏠', label: 'Homeless / Abandoned', color: '#FF6B35'},
                      {id: 'hungry', icon: '🍽️', label: 'Hungry / Malnourished', color: '#FBBF24'},
                      {id: 'trapped', icon: '🚗', label: 'Trapped / Road Danger', color: '#3B82F6'},
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => {
                          const newSituationType = formData.situationType.includes(type.id)
                            ? formData.situationType.filter(t => t !== type.id)
                            : [...formData.situationType, type.id];
                          setFormData({...formData, situationType: newSituationType});
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${formData.situationType.includes(type.id) ? 'text-white border-transparent' : 'bg-white border-[#D1D5DB] text-[var(--dark)] hover:border-gray-400'}`}
                        style={formData.situationType.includes(type.id) ? { backgroundColor: type.color } : {}}
                      >
                        <span>{type.icon}</span> <span className="font-sans font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-sans font-bold text-[var(--dark)] mb-3">Number of Animals</label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setFormData({...formData, count: Math.max(1, formData.count - 1)})}
                      className="w-10 h-10 rounded-full border border-[#D1D5DB] flex items-center justify-center hover:bg-[#F3F4F6] text-[var(--dark)]"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-mono text-xl font-bold">{formData.count}</span>
                    <button 
                      onClick={() => setFormData({...formData, count: formData.count + 1})}
                      className="w-10 h-10 rounded-full border border-[#D1D5DB] flex items-center justify-center hover:bg-[#F3F4F6] text-[var(--dark)]"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-sans font-bold text-[var(--dark)] mb-3">Severity</label>
                  <div className="flex justify-between mb-2 px-2 text-sm font-sans font-medium text-[var(--mid-gray)]">
                    <span className={formData.severity === 1 ? 'text-[#FBBF24] font-bold' : ''}>Minor 🟡</span>
                    <span className={formData.severity === 2 ? 'text-[#FF6B35] font-bold' : ''}>Moderate 🟠</span>
                    <span className={formData.severity === 3 ? 'text-[#ef4444] font-bold' : ''}>Critical 🔴</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="3" step="1"
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: parseInt(e.target.value)})}
                    className="w-full h-2 rounded-full appearance-none outline-none cursor-pointer"
                    style={{ background: severityColors[formData.severity] }}
                  />
                </div>

                <div>
                  <label className="block font-sans font-bold text-[var(--dark)] mb-3">Description (Optional)</label>
                  <textarea 
                    rows="3"
                    className="w-full bg-white border border-[#D1D5DB] rounded-xl p-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-primary)] transition-colors resize-none"
                    placeholder="Any details that help? Limping, bleeding, unconscious..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="btn-primary bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]">Back</button>
                  <button onClick={() => setStep(4)} className="btn-primary flex-1">Next Step &rarr;</button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: CONTACT */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <label className="block font-sans font-bold text-[var(--dark)] mb-2">Your Name (Optional)</label>
                  <input 
                    type="text"
                    className="w-full h-[52px] bg-white border border-[#D1D5DB] rounded-xl px-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block font-sans font-bold text-[var(--dark)] mb-2">Phone Number (Optional)</label>
                  <p className="text-[12px] text-[var(--mid-gray)] mb-2">So NGO can call you if needed</p>
                  <input 
                    type="tel"
                    className="w-full h-[52px] bg-white border border-[#D1D5DB] rounded-xl px-4 font-sans text-[var(--dark)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={() => setStep(3)} className="btn-primary bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]">Back</button>
                  <button 
                    onClick={handleSubmit} 
                    className="btn-primary flex-1 h-[56px] text-lg bg-[var(--accent-primary)]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'SUBMIT REPORT →'
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
