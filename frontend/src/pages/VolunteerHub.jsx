import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Heart, Truck, MapPin } from 'lucide-react';
import Loading from '../components/Loading';

export default function VolunteerHub() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/volunteer/tasks');
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const handleClaim = async (id) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/volunteer/tasks/${id}/claim`);
      if (res.data.success) {
        alert('Task claimed! Thank you for helping.');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) return <Loading message="Scouting for volunteer opportunities" />;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="pt-24 pb-20 container mx-auto px-4 md:px-6 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl mb-4">Volunteer Hub</h1>
        <p className="text-[var(--text-muted)] max-w-xl mx-auto">
          Can't adopt? You can still save lives. Claim a task requested by local NGOs.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {['All', 'Rescue', 'Feed', 'Transport', 'Foster'].map((filter, i) => (
          <button key={i} className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium ${i===0 ? 'bg-white text-black' : 'bg-white/5 text-white border border-white/10'}`}>
            {filter}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tasks.map(task => (
          <div key={task._id} className="glass-panel p-6 rounded-3xl flex flex-col hover:border-[var(--accent-teal)]/50 transition duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{task.title}</h3>
                <p className="text-sm text-[var(--accent-teal)]">Posted by: {task.postedBy?.name || 'NGO'}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                task.urgency === 'high' ? 'bg-[var(--accent-coral)]/20 text-[var(--accent-coral)]' : 
                'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]'
              }`}>
                {task.urgency} Priority
              </div>
            </div>
            
            <p className="text-[var(--text-secondary)] mb-6 flex-1">{task.description}</p>
            
            <div className="bg-black/30 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] mb-2">
                <MapPin className="w-4 h-4 text-[var(--accent-teal)]" />
                <span>{task.location?.address || 'Unknown Location'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                {task.taskType === 'transport' ? <Truck className="w-4 h-4 text-[var(--accent-amber)]" /> : <Heart className="w-4 h-4 text-[var(--accent-coral)]" />}
                <span className="capitalize">Type: {task.taskType}</span>
              </div>
            </div>

            <button 
              onClick={() => handleClaim(task._id)}
              className="w-full bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)] text-[var(--accent-teal)] py-3 rounded-xl font-bold hover:bg-[var(--accent-teal)] hover:text-black transition-colors"
            >
              I Can Do This
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full text-center p-10 glass-panel rounded-3xl text-[var(--text-muted)]">
            No active volunteer tasks right now. Great job, community!
          </div>
        )}
      </div>
    </div>
  );
}
