import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import MapView from '../components/MapView';
import FoodCard from '../components/FoodCard';
import { Plus } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function FoodRescue() {
  const { user } = useAuth();
  const { location } = useLocation();
  const [foods, setFoods] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    foodDescription: '',
    quantity: '',
    expiresIn: 4,
    address: ''
  });

  const fetchFoods = async () => {
    try {
      // In real app, pass lat/lng/radius
      const res = await axios.get('http://localhost:5000/api/food/available');
      if (res.data.success) {
        setFoods(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [location]);

  const handleClaim = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/food/${id}/claim`);
      if (res.data.success) {
        alert('Food claimed successfully! Please pick it up.');
        fetchFoods();
      }
    } catch (err) {
      console.error(err);
      alert('Error claiming food');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.lat) {
      alert("Please allow location access");
      return;
    }

    try {
      const data = new FormData();
      data.append('foodDescription', formData.foodDescription);
      data.append('quantity', formData.quantity);
      data.append('expiresIn', formData.expiresIn);
      data.append('address', formData.address);
      data.append('lat', location.lat);
      data.append('lng', location.lng);

      const res = await axios.post('http://localhost:5000/api/food', data);
      if (res.data.success) {
        setShowForm(false);
        setFormData({ foodDescription: '', quantity: '', expiresIn: 4, address: '' });
        fetchFoods();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <Navigate to="/" />;

  return (
    <div className="pt-24 pb-20 container mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl mb-2">Food Rescue</h1>
          <p className="text-[var(--text-muted)]">Don't throw it away. Feed the strays.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[var(--accent-teal)] text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 magnetic-btn"
        >
          {showForm ? 'Cancel' : <><Plus /> Post Food</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl mb-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold mb-4">Post Available Food</h2>
          <input 
            type="text" placeholder="What food? (e.g., Rice & Chicken)" required
            className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:border-[var(--accent-teal)] outline-none"
            value={formData.foodDescription} onChange={e => setFormData({...formData, foodDescription: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" placeholder="Quantity (e.g., 5 kg, 50 rotis)" required
              className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:border-[var(--accent-teal)] outline-none"
              value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}
            />
            <input 
              type="number" placeholder="Expires in (hours)" required min="1"
              className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:border-[var(--accent-teal)] outline-none"
              value={formData.expiresIn} onChange={e => setFormData({...formData, expiresIn: e.target.value})}
            />
          </div>
          <input 
            type="text" placeholder="Pickup Address" required
            className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 text-white focus:border-[var(--accent-teal)] outline-none"
            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
          />
          <button type="submit" className="w-full bg-[var(--accent-teal)] text-black py-3 rounded-xl font-bold mt-2 hover:bg-teal-400">
            Post Donation
          </button>
        </form>
      )}

      <div className="mb-8 h-[300px] md:h-[400px]">
        <MapView items={foods} type="food" center={location.lat ? [location.lat, location.lng] : undefined} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {foods.map(food => (
          <FoodCard key={food._id} food={food} onClaim={handleClaim} />
        ))}
        {foods.length === 0 && (
          <div className="col-span-full py-10 text-center text-[var(--text-muted)] glass-panel rounded-2xl">
            No food donations available right now.
          </div>
        )}
      </div>
    </div>
  );
}
