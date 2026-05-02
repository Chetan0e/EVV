import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogOut, Users, AlertCircle, Activity, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [food, setFood] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('evv_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, tasksRes, volunteersRes, foodRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getReports({}),
        adminAPI.getTasks(),
        adminAPI.getVolunteers(),
        adminAPI.getFood()
      ]);
      setStats(statsRes.data?.data || {});
      setReports(reportsRes.data?.data || []);
      setTasks(tasksRes.data?.data || []);
      setVolunteers(volunteersRes.data?.data || []);
      setFood(foodRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('evv_admin_token');
    navigate('/admin/login');
  };

  const updateReportStatus = async (id, status) => {
    try {
      await adminAPI.updateReport(id, { status });
      toast.success('Report status updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteReport = async (id) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await adminAPI.deleteReport(id);
      toast.success('Report deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const chartData = [
    { name: 'Mon', rescues: stats.rescuesToday || 0 },
    { name: 'Tue', rescues: stats.rescuesToday || 0 },
    { name: 'Wed', rescues: stats.rescuesToday || 0 },
    { name: 'Thu', rescues: stats.rescuesToday || 0 },
    { name: 'Fri', rescues: stats.rescuesToday || 0 },
    { name: 'Sat', rescues: stats.rescuesToday || 0 },
    { name: 'Sun', rescues: stats.rescuesToday || 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield size={32} className="text-[#00C896]" />
            <div>
              <h1 className="font-[Playfair_Display] text-xl font-bold">EVV Admin</h1>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {['overview', 'reports', 'tasks', 'volunteers', 'food'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition-colors whitespace-nowrap ${
                activeTab === tab ? 'bg-[#00C896] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="text-[#ef4444]" />
                  <span className="text-xs text-gray-400">Total</span>
                </div>
                <div className="text-3xl font-bold">{stats.totalReports || 0}</div>
                <div className="text-sm text-gray-400">Reports</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="text-[#00C896]" />
                  <span className="text-xs text-gray-400">Active</span>
                </div>
                <div className="text-3xl font-bold">{stats.activeVolunteers || 0}</div>
                <div className="text-sm text-gray-400">Volunteers</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="text-[#FBBF24]" />
                  <span className="text-xs text-gray-400">Open</span>
                </div>
                <div className="text-3xl font-bold">{stats.openTasks || 0}</div>
                <div className="text-sm text-gray-400">Tasks</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="text-[#3B82F6]" />
                  <span className="text-xs text-gray-400">Available</span>
                </div>
                <div className="text-3xl font-bold">{stats.foodDonations || 0}</div>
                <div className="text-sm text-gray-400">Food Donations</div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Weekly Rescue Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Line type="monotone" dataKey="rescues" stroke="#00C896" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Animal</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Location</th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id} className="border-t border-gray-700">
                      <td className="px-6 py-4">{report._id?.slice(-6)}</td>
                      <td className="px-6 py-4">{report.animalType}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          report.status === 'reported' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                          report.status === 'assigned' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                          report.status === 'rescued' ? 'bg-[#00C896]/20 text-[#00C896]' :
                          'bg-gray-600/20 text-gray-400'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{report.location?.city || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateReportStatus(report._id, 'assigned')}
                            className="px-3 py-1 bg-[#FBBF24] text-black rounded text-xs font-semibold hover:bg-yellow-500"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => updateReportStatus(report._id, 'rescued')}
                            className="px-3 py-1 bg-[#00C896] text-black rounded text-xs font-semibold hover:bg-green-500"
                          >
                            Rescued
                          </button>
                          <button
                            onClick={() => deleteReport(report._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reports.length === 0 && (
                <div className="p-8 text-center text-gray-400">No reports found</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Title</th>
                    <th className="px-6 py-4 text-left font-semibold">Type</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Volunteer</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id} className="border-t border-gray-700">
                      <td className="px-6 py-4">{task.title}</td>
                      <td className="px-6 py-4">{task.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.status === 'open' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                          task.status === 'claimed' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' :
                          'bg-[#00C896]/20 text-[#00C896]'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{task.claimedBy?.name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tasks.length === 0 && (
                <div className="p-8 text-center text-gray-400">No tasks found</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Volunteers Tab */}
        {activeTab === 'volunteers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Role</th>
                    <th className="px-6 py-4 text-left font-semibold">City</th>
                    <th className="px-6 py-4 text-left font-semibold">Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((vol) => (
                    <tr key={vol._id} className="border-t border-gray-700">
                      <td className="px-6 py-4">{vol.name}</td>
                      <td className="px-6 py-4">{vol.role}</td>
                      <td className="px-6 py-4">{vol.city}</td>
                      <td className="px-6 py-4">{vol.tasksCompleted || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {volunteers.length === 0 && (
                <div className="p-8 text-center text-gray-400">No volunteers found</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Food Tab */}
        {activeTab === 'food' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Description</th>
                    <th className="px-6 py-4 text-left font-semibold">Quantity</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Donor</th>
                  </tr>
                </thead>
                <tbody>
                  {food.map((item) => (
                    <tr key={item._id} className="border-t border-gray-700">
                      <td className="px-6 py-4">{item.description}</td>
                      <td className="px-6 py-4">{item.qty} {item.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'available' ? 'bg-[#00C896]/20 text-[#00C896]' :
                          item.status === 'claimed' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                          'bg-gray-600/20 text-gray-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.donorName || 'Anonymous'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {food.length === 0 && (
                <div className="p-8 text-center text-gray-400">No food donations found</div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
