import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, ArrowRight, Camera, Coffee, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedCounter from '../components/AnimatedCounter';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

export default function Landing() {
  const { loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ totalRescues: 0, animalsHelped: 0, activeVolunteers: 0, foodSaved: 0 });

  useEffect(() => {
    axios.get('http://localhost:5000/api/stats').then(res => {
      if (res.data.success) {
        setStats(res.data.data);
      }
    }).catch(console.error);
  }, []);

  if (authLoading) return <Loading message="Connecting to EVV" />;

  const titleWords = ["Every", "Voice", "for", "Voiceless"];

  return (
    <div className="relative min-h-screen pt-24 pb-20">
      <div className="bg-mesh"></div>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 pt-10 pb-20">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 z-10 relative">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              <div className="flex gap-4 mb-2">
                {titleWords.slice(0, 2).map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={i === 1 ? "text-[var(--accent-teal)]" : ""}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
              <div className="flex gap-4">
                {titleWords.slice(2).map((word, i) => (
                  <motion.span
                    key={i + 2}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i + 2) * 0.1 }}
                    className={i === 1 ? "text-white" : "text-[var(--text-secondary)]"}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </h1>
            <p className="text-xl text-[var(--text-muted)] max-w-lg leading-relaxed">
              Be the voice they never had. Connect food waste, volunteers, and animal rescue systems in one tap.
            </p>
            <div className="flex gap-4 pt-4">
              <Link to="/report" className="bg-[var(--accent-teal)] text-black px-8 py-4 rounded-full font-bold text-lg magnetic-btn flex items-center gap-2">
                Report Rescue <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 relative w-full h-[400px] flex justify-center items-center">
            {/* Abstract visual representing connectivity */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative w-full max-w-md h-full glass-panel rounded-[40px] overflow-hidden flex items-center justify-center p-8"
              style={{ clipPath: 'polygon(0 0, 100% 10%, 100% 100%, 0 90%)' }}
            >
              <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-[var(--accent-teal)] to-[var(--accent-amber)] mix-blend-overlay"></div>
              <HeartPulse className="w-40 h-40 text-[var(--accent-teal)] pulse-marker" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-[var(--border)] bg-[var(--bg-secondary)]/50 backdrop-blur-sm relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center transform -rotate-2">
              <div className="text-5xl md:text-7xl font-bold text-[var(--accent-teal)] mb-2">
                <AnimatedCounter value={stats.totalRescues} />
              </div>
              <div className="text-[var(--text-muted)] font-['Syne'] tracking-widest uppercase text-sm">Rescues Reported</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center transform rotate-1">
              <div className="text-5xl md:text-7xl font-bold text-[var(--accent-green)] mb-2">
                <AnimatedCounter value={stats.animalsHelped} />
              </div>
              <div className="text-[var(--text-muted)] font-['Syne'] tracking-widest uppercase text-sm">Animals Helped</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-center transform -rotate-1">
              <div className="text-5xl md:text-7xl font-bold text-[var(--accent-amber)] mb-2">
                <AnimatedCounter value={stats.foodSaved} />
              </div>
              <div className="text-[var(--text-muted)] font-['Syne'] tracking-widest uppercase text-sm">Kg Food Saved</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-center transform rotate-2">
              <div className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] mb-2">
                <AnimatedCounter value={stats.activeVolunteers} />
              </div>
              <div className="text-[var(--text-muted)] font-['Syne'] tracking-widest uppercase text-sm">Active Volunteers</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How EVV Works</h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">Three core modules designed to make an impact with zero friction.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <Camera />, title: "Rescue Reporter", desc: "See an injured animal? Snap a photo, auto-attach location, and alert nearby NGOs instantly." },
            { icon: <Coffee />, title: "Food Connect", desc: "Have leftover food? Post it here. Registered feeders will pick it up and feed strays. Zero waste." },
            { icon: <Users />, title: "Volunteer Hub", desc: "Want to help but can't adopt? Claim tasks like transporting an animal or feeding in your area." }
          ].map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="glass-panel p-8 rounded-3xl rescue-card"
            >
              <div className="w-14 h-14 rounded-full bg-[var(--accent-teal)]/10 flex items-center justify-center text-[var(--accent-teal)] mb-6">
                {feat.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{feat.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <div className="glass-panel p-10 md:p-16 rounded-[40px] relative">
            <div className="text-[var(--accent-teal)] text-6xl absolute top-6 left-10 opacity-20">"</div>
            <p className="text-2xl md:text-3xl font-medium leading-relaxed italic mb-8 relative z-10">
              Before EVV, I used to see injured dogs and feel helpless because I had no money. Now I just report them, and someone comes in 20 minutes. It changed everything.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-[var(--accent-amber)] rounded-full"></div>
              <div className="text-left">
                <h4 className="font-bold">Priya K.</h4>
                <p className="text-sm text-[var(--text-muted)]">Animal Feeder, Pune</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-[var(--border)] pt-10 pb-20 md:pb-10 mt-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HeartPulse className="w-6 h-6 text-[var(--accent-teal)]" />
            <span className="font-['Syne'] font-bold text-xl tracking-wide">
              <span className="text-[var(--accent-teal)]">E</span>VV
            </span>
          </div>
          <p className="text-[var(--text-muted)] text-sm mb-4">Every voice matters. Even the silent ones.</p>
          <div className="text-xs text-[var(--text-muted)]/50">
            &copy; 2026 EVV Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
