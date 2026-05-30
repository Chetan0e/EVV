import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Award, Map as MapIcon } from 'lucide-react';
import { volunteerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoginModal from '../components/LoginModal';

const FILTERS = [
  { id: 'all', label: 'All', icon: '' },
  { id: 'Feeder', label: 'Feeder', icon: '🍽️' },
  { id: 'Transporter', label: 'Transporter', icon: '🚗' },
  { id: 'Foster', label: 'Foster', icon: '🏠' },
  { id: 'Donor', label: 'Donor', icon: '💰' }
];

const MOCK_TASKS = [
  {
    id: 't1',
    title: 'Feed 5 stray dogs near Rankala Lake',
    type: 'Feeder',
    urgency: 'HIGH',
    ngo: 'Prani Mitra NGO, Kolhapur',
    desc: 'Regular feeder is out of town. Needs someone to cover for 3 days morning feeding.',
    distance: '0.4km',
    tags: ['3 days', 'Morning'],
    reward: '🏅 Rescue Hero Badge',
    duration: '2-3 hours',
    requirements: 'Your time and love for animals',
    verified: true
  },
  {
    id: 't2',
    title: 'Transport injured cat to Prani Seva Kendra',
    type: 'Transporter',
    urgency: 'HIGH',
    ngo: 'Paws Rescue, Kolhapur',
    desc: 'Cat with broken leg needs immediate transport from Tarabai Park to clinic.',
    distance: '1.2km',
    tags: ['Urgent', 'Car needed'],
    reward: '🏅 Rescue Hero Badge',
    duration: '1-2 hours',
    requirements: 'A bike or car',
    verified: true
  },
  {
    id: 't3',
    title: 'Temporary foster for 3 puppies (2 weeks)',
    type: 'Foster',
    urgency: 'MEDIUM',
    ngo: 'Animal Hope, Pune',
    desc: 'Mother was killed, puppies need a safe place until they are vaccinated and adopted.',
    distance: '2.1km',
    tags: ['Foster', 'Puppies', 'Food Provided'],
    reward: '🌟 Community Champion',
    duration: '2 weeks',
    requirements: 'A safe space for puppies',
    verified: true
  },
  {
    id: 't4',
    title: 'Daily morning feeding near bus stand',
    type: 'Feeder',
    urgency: 'MEDIUM',
    ngo: 'Street Friends, Kolhapur',
    desc: 'Looking for a dedicated volunteer to feed 10 dogs daily at 8 AM.',
    distance: '0.8km',
    tags: ['Daily', 'Long-term'],
    reward: '🌟 Community Champion',
    duration: '30 mins daily',
    requirements: 'Consistency and dedication',
    verified: false
  },
  {
    id: 't5',
    title: 'Donate medicines for injured cow',
    type: 'Donor',
    urgency: 'LOW',
    ngo: 'Gau Seva Trust',
    desc: 'Need specific antibiotics and dressing materials for a cow hit by a truck.',
    distance: 'Any location',
    tags: ['Medical', 'Urgent'],
    reward: '🏅 Rescue Hero Badge',
    duration: 'Flexible',
    requirements: 'Medicines or funds',
    verified: true
  },
  {
    id: 't6',
    title: 'Weekend rescue driver needed',
    type: 'Transporter',
    urgency: 'MEDIUM',
    ngo: 'Prani Mitra NGO, Kolhapur',
    desc: 'We need someone with an SUV/Van to help transport rescued animals on weekends.',
    distance: '3.5km',
    tags: ['Weekend', 'Driver'],
    reward: '⭐ Top Volunteer',
    duration: '4-6 hours',
    requirements: 'SUV or Van',
    verified: true
  }
];

export default function VolunteerHub() {
  const { isLoggedIn } = useAuth();
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimedIds, setClaimedIds] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await volunteerAPI.getTasks({});
      setTasks(res.data?.data?.length ? res.data.data : MOCK_TASKS);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setTasks(MOCK_TASKS);
    }
    setLoading(false);
  };

  const handleClaim = async (taskId) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      await volunteerAPI.claimTask(taskId);
      setClaimedIds([...claimedIds, taskId]);
      toast.success('Task claimed! Check My Tasks for details.');
    } catch (err) {
      console.error('Failed to claim task:', err);
      toast.error('Failed to claim task. Please try again.');
    }
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'HIGH': return 'bg-[#ef4444] text-white';
      case 'MEDIUM': return 'bg-[#FBBF24] text-[var(--dark)]';
      case 'LOW': return 'bg-[var(--accent-primary)] text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getIcon = (type) => {
    const found = FILTERS.find(f => f.id === type);
    return found ? found.icon : '🐾';
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.type === filter);

  return (
    <div className="min-h-screen bg-[var(--off-white)] pt-[100px] pb-[100px]">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="text-center mb-10">
          <h1 className="font-display text-[48px] font-bold text-[var(--dark)] leading-tight mb-2">Volunteer Hub</h1>
          <p className="font-sans text-[var(--mid-gray)] text-lg">Choose how you help. No commitment too small.</p>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-10 pb-2 justify-start md:justify-center">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-sans font-bold text-sm transition-colors border shadow-sm ${filter === f.id ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'bg-white text-[var(--mid-gray)] border-[#E5E7EB] hover:border-[var(--accent-primary)]'}`}
            >
              {f.icon && <span className="mr-2">{f.icon}</span>}
              {f.label}
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="w-8 h-8 border-4 border-[var(--accent-blue)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task, i) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-[#F1F3F5] transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] hover:border-l-4 hover:border-l-[var(--accent-primary)] flex flex-col h-full group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl bg-[var(--off-white)] w-12 h-12 flex items-center justify-center rounded-xl">
                    {getIcon(task.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    {task.verified && (
                      <span className="text-[#00C896]" title="Verified NGO">
                        <Award size={16} />
                      </span>
                    )}
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${getUrgencyColor(task.urgency)}`}>
                      {task.urgency}
                    </span>
                  </div>
                </div>

                <p className="font-sans font-bold text-sm text-[var(--mid-gray)] mb-2 flex items-center gap-1">
                  {task.ngo}
                  {task.verified && <span className="text-[#00C896] text-xs">✓</span>}
                </p>
                <h3 className="font-display text-xl font-bold text-[var(--dark)] mb-3 leading-snug">{task.title}</h3>
                
                <p className="font-sans text-[15px] text-[var(--mid-gray)] mb-4 line-clamp-2 flex-grow">
                  {task.desc}
                </p>

                <div className="flex items-center gap-1 text-[var(--dark)] font-sans font-semibold text-sm mb-4">
                  <MapPin size={16} className="text-[var(--accent-primary)]" /> 
                  {task.distance} {task.distance !== 'Any location' && 'from you'}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {task.tags.map(tag => (
                    <span key={tag} className="bg-[var(--light-gray)] text-[var(--dark)] px-3 py-1 rounded-md font-sans text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Reward Section */}
                <div className="task-reward bg-[#00C896]/10 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <span className="text-lg">{task.reward.split(' ')[0]}</span>
                  <span className="font-sans text-sm text-[#00C896]">
                    Earn: <strong>{task.reward.split(' ').slice(1).join(' ')}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <button 
                    onClick={() => handleClaim(task.id)}
                    disabled={claimedIds.includes(task.id)}
                    className={`px-5 py-2.5 rounded-lg font-sans font-bold text-sm transition-colors ${
                      claimedIds.includes(task.id)
                        ? 'bg-[#00C896] text-white cursor-not-allowed'
                        : 'bg-[var(--accent-primary)] text-white hover:bg-[#00A878]'
                    }`}
                  >
                    {claimedIds.includes(task.id) ? '✓ Task Claimed' : 'Claim Task'}
                  </button>
                  <button 
                    onClick={() => openTaskModal(task)}
                    className="font-sans text-sm font-semibold text-[var(--accent-primary)] hover:text-[#00A878]"
                  >
                    Learn More
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!loading && filteredTasks.length === 0 && (
          <div className="text-center text-[var(--mid-gray)] py-10 font-sans">
            No tasks found for this filter.
          </div>
        )}

        {/* Task Detail Modal */}
        <AnimatePresence>
          {showTaskModal && selectedTask && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setShowTaskModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
              >
                <div className="bg-white rounded-[20px] p-8 relative">
                  <button 
                    onClick={() => setShowTaskModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>

                  <h2 className="font-[Playfair_Display] text-[28px] font-bold text-[#111827] mb-2">
                    {selectedTask.title}
                  </h2>
                  <p className="font-[Plus_Jakarta_Sans] text-[#6B7280] mb-4 flex items-center gap-2">
                    {selectedTask.ngo}
                    {selectedTask.verified && <span className="text-[#00C896]">✓ Verified</span>}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${getUrgencyColor(selectedTask.urgency)}`}>
                      {selectedTask.urgency} URGENCY
                    </span>
                    <span className="bg-[#3B82F6]/10 text-[#3B82F6] px-3 py-1 rounded-full font-sans font-bold text-[10px] uppercase tracking-wide">
                      {selectedTask.type}
                    </span>
                  </div>

                  <p className="font-[Plus_Jakarta_Sans] text-[16px] text-[#374151] leading-relaxed mb-6">
                    {selectedTask.desc}
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2">
                      <MapIcon size={18} className="text-[#00C896]" />
                      <span className="font-[Plus_Jakarta_Sans] text-[#111827]">
                        {selectedTask.distance} from you
                      </span>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedTask.distance)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00C896] font-semibold text-sm hover:underline ml-2"
                      >
                        Open in Google Maps →
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-[Plus_Jakarta_Sans] text-[#6B7280]">Estimated time:</span>
                      <span className="font-[Plus_Jakarta_Sans] font-semibold text-[#111827]">{selectedTask.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-[Plus_Jakarta_Sans] text-[#6B7280]">What you need:</span>
                      <span className="font-[Plus_Jakarta_Sans] font-semibold text-[#111827]">{selectedTask.requirements}</span>
                    </div>
                  </div>

                  <div className="bg-[#00C896]/10 rounded-lg p-4 mb-6">
                    <p className="font-[Plus_Jakarta_Sans] text-sm text-[#00C896]">
                      <strong>Reward:</strong> {selectedTask.reward}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setShowTaskModal(false);
                        handleClaim(selectedTask.id);
                      }}
                      disabled={claimedIds.includes(selectedTask.id)}
                      className={`flex-1 h-[52px] font-[Plus_Jakarta_Sans] font-bold rounded-xl transition-colors ${
                        claimedIds.includes(selectedTask.id)
                          ? 'bg-[#00C896] text-white cursor-not-allowed'
                          : 'bg-[#00C896] text-white hover:bg-[#00A878]'
                      }`}
                    >
                      {claimedIds.includes(selectedTask.id) ? '✓ Task Claimed' : 'Claim This Task →'}
                    </button>
                    <button
                      onClick={() => setShowTaskModal(false)}
                      className="px-6 h-[52px] bg-gray-100 text-[#111827] font-[Plus_Jakarta_Sans] font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Login Modal */}
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </div>
    </div>
  );
}
