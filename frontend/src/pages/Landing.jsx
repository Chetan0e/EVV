import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AnimatedCounter from '../components/AnimatedCounter';
import logo from '../assets/logo.png';
import { statsAPI, rescueAPI } from '../services/api';

const dummyNews = [
  {
    img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600",
    tag: "ROAD ANIMALS",
    title: "Over 3 crore stray dogs roam Indian streets — and most are injured"
  },
  {
    img: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600",
    tag: "URBAN STRAYS",
    title: "Urban street cats face starvation as cities grow faster than care"
  },
  {
    img: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600",
    tag: "FOOD WASTE CRISIS",
    title: "30% of restaurant food waste in India could feed 5 lakh animals daily"
  }
];

const cities = [
  { name: 'Kolhapur' },
  { name: 'Pune' },
  { name: 'Mumbai' },
  { name: 'Nashik' },
  { name: 'Aurangabad' },
  { name: 'Nagpur' }
];

// Custom Leaflet Icons
const createIcon = (color, isCritical = false) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; ${isCritical ? 'animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; border: 2px solid ' + color : 'border: 2px solid white'}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export default function Landing() {
  const heroWords1 = "Every Voice".split(" ");
  const heroWords2 = "for Voiceless.".split(" ");
  
  const [stats, setStats] = useState({
    rescues: null,
    animalsHelped: null,
    foodSaved: null,
    volunteers: null
  });
  const [mapReports, setMapReports] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 16.7050, lng: 74.2433 });
  const [cityStats, setCityStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch public stats
    statsAPI.getPublicStats()
      .then(res => {
        const data = res.data?.data || {};
        setStats({
          rescues: data.rescues || null,
          animalsHelped: data.animalsHelped || null,
          foodSaved: data.foodSaved || null,
          volunteers: data.volunteers || null
        });
      })
      .catch(() => {
        setStats({
          rescues: null,
          animalsHelped: null,
          foodSaved: null,
          volunteers: null
        });
      })
      .finally(() => setLoading(false));

    // Get user location and fetch map reports
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        rescueAPI.getNearby(latitude, longitude, 15)
          .then(res => setMapReports(res.data?.data || []))
          .catch(() => setMapReports([]));
      },
      () => {
        // Location denied - use Kolhapur default
        rescueAPI.getNearby(16.7050, 74.2433, 15)
          .then(res => setMapReports(res.data?.data || []))
          .catch(() => setMapReports([]));
      }
    );

    // Fetch city stats
    cities.forEach(city => {
      statsAPI.getCityStats(city.name)
        .then(res => {
          setCityStats(prev => ({
            ...prev,
            [city.name]: res.data?.data?.rescues || null
          }));
        })
        .catch(() => {
          setCityStats(prev => ({
            ...prev,
            [city.name]: null
          }));
        });
    });
  }, []);

  return (
    <div className="bg-white min-h-screen">

      {/* SECTION 1 - HERO */}
      <section className="relative pt-[120px] pb-20 overflow-hidden bg-dot-grid">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left Content (55%) */}
            <div className="w-full lg:w-[55%] z-10 pt-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 border border-[var(--accent-primary)] bg-[#00C8961A] px-3 py-1 rounded-full mb-6"
              >
                <span>🐾</span>
                <span className="font-mono text-[12px] font-bold text-[var(--accent-primary)] uppercase">
                  3,400+ animals rescued so far
                </span>
              </motion.div>

              <h1 className="text-hero mb-6">
                <div className="flex flex-wrap gap-x-4">
                  {heroWords1.map((w, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="text-[var(--dark)] font-normal"
                    >
                      {w}
                    </motion.span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-4 mt-2">
                  {heroWords2.map((w, i) => (
                    <motion.span
                      key={i + 10}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (i + 2) * 0.15 }}
                      className="text-[var(--accent-primary)] italic font-black"
                    >
                      {w}
                    </motion.span>
                  ))}
                </div>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="font-sans text-[18px] text-[var(--mid-gray)] max-w-[480px] mb-8 leading-relaxed"
              >
                Millions of street animals in India suffer daily — injured, hungry,
                alone. EVV connects every person who cares with every animal that needs
                help. No money needed. Just one tap.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Link to="/report" className="h-[52px] bg-[var(--accent-primary)] text-white px-8 rounded-full font-sans font-semibold flex items-center justify-center hover:bg-[#00A878] transition-colors hover:-translate-y-[2px] shadow-lg hover:shadow-xl">
                  Report an Animal &rarr;
                </Link>
                <button className="h-[52px] bg-white text-[var(--accent-primary)] border border-[var(--accent-primary)] px-8 rounded-full font-sans font-semibold flex items-center justify-center hover:bg-green-50 transition-colors">
                  See How It Works
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap gap-4 text-sm font-sans text-[var(--mid-gray)]"
              >
                <span className="flex items-center gap-1"><span className="text-[var(--accent-primary)]">✓</span> Free to use</span>
                <span className="flex items-center gap-1"><span className="text-[var(--accent-primary)]">✓</span> No adoption needed</span>
                <span className="flex items-center gap-1"><span className="text-[var(--accent-primary)]">✓</span> NGO-verified</span>
              </motion.div>
            </div>

            {/* Right Content (45%) */}
            <div className="w-full lg:w-[45%] relative mt-16 lg:mt-0 h-[500px] flex justify-center items-center">
              <div className="relative w-full max-w-[420px] h-[380px]">
                {/* Main image */}
                <motion.div
                  className="relative w-full h-full rounded-[24px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.15)]"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    border: '3px dashed rgba(0, 200, 150, 0.4)'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800"
                    alt="Stray dog on street"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>

                {/* Overlapping smaller image - bottom left */}
                <motion.img
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400"
                  alt="Street dogs together"
                  className="absolute bottom-[-30px] left-[-40px] w-[160px] h-[160px] rounded-[16px] border-4 border-white shadow-[0_16px_40px_rgba(0,0,0,0.12)] object-cover"
                  style={{ transform: 'rotate(-4deg)' }}
                  loading="lazy"
                />

                {/* Overlapping smaller image - top right */}
                <motion.img
                  src="https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=400"
                  alt="Stray cat looking at camera"
                  className="absolute top-[-20px] right-[-30px] w-[140px] h-[140px] rounded-[16px] border-4 border-white shadow-[0_16px_40px_rgba(0,0,0,0.12)] object-cover"
                  style={{ transform: 'rotate(3deg)' }}
                  loading="lazy"
                />

                {/* Floating stat cards */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 1 }}
                  className="absolute top-4 right-4 bg-white border-l-4 border-[#00C896] p-4 rounded-lg shadow-xl"
                >
                  <p className="font-sans font-bold text-[#111827]">{stats.rescues !== null ? stats.rescues : '—'}</p>
                  <p className="text-xs text-[#6B7280]">rescued this week</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 1.2 }}
                  className="absolute bottom-4 left-4 bg-white border-l-4 border-[#00C896] p-4 rounded-lg shadow-xl"
                >
                  <p className="font-sans font-bold text-[#111827]">{stats.volunteers !== null ? stats.volunteers : '—'}</p>
                  <p className="text-xs text-[#6B7280]">active volunteers</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - LIVE STATS */}
      <section className="bg-[var(--section-alt)] py-[100px]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12">
            {[
              { num: stats.rescues, label: "Rescues" },
              { num: stats.animalsHelped, label: "Animals Helped" },
              { num: stats.foodSaved, label: "KG Food Saved" },
              { num: stats.volunteers, label: "Volunteers" }
            ].map((stat, idx) => (
              <div key={idx} className={`text-center relative ${idx !== 3 ? 'lg:after:content-[""] lg:after:absolute lg:after:right-0 lg:after:top-0 lg:after:h-full lg:after:w-[1px] lg:after:bg-white/15' : ''}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="text-stat text-white mb-2"
                >
                  {stat.num !== null ? <AnimatedCounter value={stat.num} duration={2} /> : '—'}
                </motion.div>
                <div className="font-sans text-[13px] text-[#86efac] uppercase tracking-widest font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 - NEWS / AWARENESS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-h2 text-[var(--dark)] mb-4"
          >
            Why This Matters
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-decorative text-2xl text-[var(--mid-gray)]"
          >
            Real stories. Real crisis. Real impact needed.
          </motion.p>
        </div>

        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {dummyNews.map((news, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative rounded-2xl overflow-hidden h-[400px] group cursor-pointer"
            >
              <img
                src={news.img}
                alt="News"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 text-left">
                <span className="inline-block bg-[var(--accent-primary)] text-white text-[10px] font-bold tracking-wider px-2 py-1 rounded uppercase mb-3">
                  {news.tag}
                </span>
                <h3 className="font-display text-[22px] font-bold text-white mb-2 leading-snug">
                  {news.title}
                </h3>
                <p className="font-sans text-[14px] text-white/80 group-hover:text-white transition-colors">
                  Read More &rarr;
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4 - HOW IT WORKS */}
      <section className="py-24 bg-[var(--off-white)]">
        <div className="container mx-auto px-4 md:px-8 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-h2 text-[var(--dark)] mb-2"
          >
            How EVV Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-sans text-lg text-[var(--mid-gray)]"
          >
            Three modules. Zero barriers. Infinite impact.
          </motion.p>
        </div>

        <div className="container mx-auto px-4 md:px-8 flex flex-col gap-24">
          {/* Module 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-12"
          >
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-[340px] h-[260px] rounded-[20px] overflow-hidden border-l-4 border-[#00C896] shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600"
                  alt="Person helping injured dog"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute top-4 left-4 bg-[#00C896] text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded uppercase">
                  RESCUE REPORTER
                </span>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <span className="text-label text-[var(--accent-primary)] mb-4 block">RESCUE REPORTER</span>
              <h3 className="font-display text-[36px] font-bold text-[var(--dark)] mb-4 leading-tight">Report in 30 Seconds</h3>
              <p className="font-sans text-[var(--mid-gray)] mb-6 text-lg">
                See an injured animal? Open EVV, snap a photo. Your GPS location auto-attaches. Nearest NGO gets alerted instantly. You just saved a life.
              </p>
              <Link to="/report" className="font-sans font-bold text-[var(--accent-primary)] hover:text-[#00A878] flex items-center gap-2">
                Try Reporting &rarr;
              </Link>
            </div>
          </motion.div>

          {/* Module 2 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row-reverse items-center gap-12"
          >
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-[340px] h-[260px] rounded-[20px] overflow-hidden border-l-4 border-[#FBBF24] shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"
                  alt="Person feeding street animals"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute top-4 left-4 bg-[#FBBF24] text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded uppercase">
                  FOOD CONNECT
                </span>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <span className="text-label text-[var(--accent-yellow)] mb-4 block">FOOD CONNECT</span>
              <h3 className="font-display text-[36px] font-bold text-[var(--dark)] mb-4 leading-tight">Food That Was Trash Is Now Life</h3>
              <p className="font-sans text-[var(--mid-gray)] mb-6 text-lg">
                Restaurants, hostels, events post leftover food on EVV. Nearby animal feeders claim it within minutes. Zero food wasted. Zero animals hungry.
              </p>
              <Link to="/food" className="font-sans font-bold text-[var(--accent-yellow)] hover:text-yellow-600 flex items-center gap-2">
                Donate Food &rarr;
              </Link>
            </div>
          </motion.div>

          {/* Module 3 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-12"
          >
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-[340px] h-[260px] rounded-[20px] overflow-hidden border-l-4 border-[#3B82F6] shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600"
                  alt="Volunteer helping animal shelter"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute top-4 left-4 bg-[#3B82F6] text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded uppercase">
                  VOLUNTEER HUB
                </span>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <span className="text-label text-[var(--accent-blue)] mb-4 block">VOLUNTEER HUB</span>
              <h3 className="font-display text-[36px] font-bold text-[var(--dark)] mb-4 leading-tight">Help Without Adopting</h3>
              <p className="font-sans text-[var(--mid-gray)] mb-6 text-lg">
                You don't need a home or money to help. Choose your role — feeder, transporter, foster parent, or donor. Pick tasks near you. Be the difference.
              </p>
              <Link to="/volunteer" className="font-sans font-bold text-[var(--accent-blue)] hover:text-blue-700 flex items-center gap-2">
                Join as Volunteer &rarr;
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 - TESTIMONIAL */}
      <section className="py-24 bg-white relative overflow-hidden" style={{ background: 'radial-gradient(circle at center, rgba(0,200,150,0.04) 0%, transparent 70%)' }}>
        {/* Large Decorative Quote */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] text-[#E8F5E9] font-serif select-none pointer-events-none">
          "
        </div>

        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <p className="font-[Caveat] text-[26px] text-[#111827] italic max-w-[800px] mx-auto leading-relaxed mb-8">
              "Before EVV, I watched a dog bleed on the road and felt helpless.
              Now I just open the app and someone comes in 20 minutes.
              I didn't need money. Just one tap changed everything."
            </p>
            
            {/* Author block */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-[52px] h-[52px] rounded-full bg-[#00C896] flex items-center justify-center text-white font-[Plus_Jakarta_Sans] font-bold text-[18px]">
                PK
              </div>
              <div>
                <h4 className="font-[Plus_Jakarta_Sans] font-semibold text-[16px] text-[#111827]">Priya Kulkarni</h4>
                <p className="font-[Plus_Jakarta_Sans] text-[12px] text-[#6B7280]">Animal Feeder · Kolhapur</p>
              </div>
              <div className="flex gap-1 mt-2 text-[#FBBF24] text-lg">
                ★ ★ ★ ★ ★
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 6 - MAP PREVIEW */}
      <section className="bg-[var(--dark)] py-20">
        <div className="container mx-auto px-4 md:px-8 mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-h2 text-white mb-2"
          >
            Animals Near You Right Now
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-sans text-[var(--accent-primary)] text-lg"
          >
            Live rescue activity across Maharashtra
          </motion.p>
        </div>

        <div className="relative w-full h-[500px] md:h-[500px]">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={11}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', zIndex: 10 }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {mapReports.map((report, i) => {
              let color = '#ef4444'; // critical red
              if (report.status === 'rescued') color = '#10b981'; // green
              if (report.type === 'food') color = '#f59e0b'; // amber
              const isCritical = report.status === 'reported' || report.status === 'assigned';

              return (
                <Marker
                  key={i}
                  position={[report.location?.lat || report.lat, report.location?.lng || report.lng]}
                  icon={createIcon(color, isCritical)}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-semibold">{report.animalType || 'Animal'}</p>
                      <p className="text-sm text-gray-600">Status: {report.status}</p>
                      <Link to={`/report/${report._id}`} className="text-green-600 text-sm hover:underline">View Details</Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Empty state overlay */}
          {mapReports.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-[15]">
              <div className="text-center text-white">
                <p className="text-xl font-semibold mb-2">No active rescues in your area right now.</p>
                <p className="text-gray-300 mb-4">Be the first to report one.</p>
                <Link to="/report" className="btn-primary bg-[#00C896] text-white px-6 py-2 rounded-full inline-block">
                  Report an Animal →
                </Link>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute top-4 right-4 z-[20] bg-white rounded-lg shadow-xl p-4">
            <h4 className="font-sans font-bold text-sm mb-3">Live Map Legend</h4>
            <div className="flex flex-col gap-2 font-sans text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ef4444] animate-pulse"></span> Critical
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10b981]"></span> Rescued
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Food Available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 - IMPACT BY CITY */}
      <section className="bg-[#F8F9FA] py-[80px]">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-[Playfair_Display] text-[40px] font-bold text-[#111827] mb-4">
              Growing Across Maharashtra
            </h2>
            <p className="font-[Plus_Jakarta_Sans] text-[#6B7280]">
              Join your city's rescue network
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl p-6 border border-[#E5E7EB] hover:border-l-4 hover:border-l-[#00C896] hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-[#00C896]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-[Plus_Jakarta_Sans] font-bold text-[18px] text-[#111827]">
                    {city.name}
                  </h3>
                </div>
                <p className="font-[Plus_Jakarta_Sans] text-[12px] text-[#6B7280] mb-2">Maharashtra</p>
                <p className="font-[Plus_Jakarta_Sans] font-semibold text-[#00C896]">
                  {cityStats[city.name] !== null ? `${cityStats[city.name]} rescues` : '—'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 - JOIN US CTA */}
      <section className="bg-[var(--gradient-hero)] py-[120px] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-3xl"
        >
          <span className="text-label text-white block mb-6">READY TO MAKE A DIFFERENCE?</span>
          <h2 className="text-h2 text-white mb-6">Join 312 people already saving lives</h2>
          <p className="font-sans text-white/70 text-lg mb-10">
            No money. No adoption. Just your phone and your heart.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link to="/report" className="btn-primary bg-white text-[var(--accent-primary)] hover:bg-gray-100 hover:text-[#00A878] h-[56px] text-lg px-8">
              Report an Animal
            </Link>
            <Link to="/join" className="btn-primary bg-transparent border-2 border-white text-white hover:bg-white/10 h-[56px] text-lg px-8">
              Join as Volunteer
            </Link>
          </div>
          <p className="font-sans text-white/50 text-sm">
            Trusted by NGOs in Pune · Kolhapur · Mumbai · Nashik
          </p>
        </motion.div>
      </section>

      {/* SECTION 8 - FOOTER */}
      <footer className="bg-[var(--dark)] pt-16 pb-24 md:pb-8 text-[#6B7280] font-sans">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 border-b border-[#1f2937] pb-12">
            {/* Left */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="EVV" className="h-[30px]" />
                <span className="font-display font-bold text-xl text-white">EVV</span>
              </div>
              <p className="mb-4">"Be the voice they never had."</p>
              <p className="text-sm">&copy; 2025 EVV. Built with ❤️ for animals.</p>
            </div>

            {/* Center */}
            <div className="flex flex-col gap-3 md:items-center">
              <Link to="/report" className="hover:text-[var(--accent-primary)] transition-colors">Report</Link>
              <Link to="/food" className="hover:text-[var(--accent-primary)] transition-colors">Food</Link>
              <Link to="/volunteer" className="hover:text-[var(--accent-primary)] transition-colors">Volunteer</Link>
              <Link to="/about" className="hover:text-[var(--accent-primary)] transition-colors">About</Link>
              <Link to="/contact" className="hover:text-[var(--accent-primary)] transition-colors">Contact</Link>
            </div>

            {/* Right */}
            <div className="md:text-right">
              <p className="mb-4 font-bold text-white">Follow our mission</p>
              <div className="flex gap-4 md:justify-end">
                <a href="#" className="hover:text-[var(--accent-primary)]">Insta</a>
                <a href="#" className="hover:text-[var(--accent-primary)]">Twitter</a>
                <a href="#" className="hover:text-[var(--accent-primary)]">LinkedIn</a>
              </div>
            </div>
          </div>

          <div className="text-center text-xs">
            EVV is a free, open-source civic platform. Not affiliated with any government.
          </div>
        </div>
      </footer>
    </div>
  );
}
