import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogOut, Users, AlertCircle, Activity, DollarSign, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight, Eye, X, MapPin, Phone, Mail, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const getFilteredData = (data, type) => {
    let filtered = data;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        if (type === 'reports') {
          return item.animalType?.toLowerCase().includes(term) || 
                 item.location?.city?.toLowerCase().includes(term) ||
                 item._id?.toLowerCase().includes(term);
        } else if (type === 'tasks') {
          return item.title?.toLowerCase().includes(term) || 
                 item.type?.toLowerCase().includes(term) ||
                 item.claimedBy?.name?.toLowerCase().includes(term);
        } else if (type === 'volunteers') {
          return item.name?.toLowerCase().includes(term) || 
                 item.role?.toLowerCase().includes(term) ||
                 item.city?.toLowerCase().includes(term);
        } else if (type === 'food') {
          return item.description?.toLowerCase().includes(term) || 
                 item.donorName?.toLowerCase().includes(term);
        }
        return false;
      });
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (type === 'reports' && sortConfig.key === 'location') {
          aValue = a.location?.city || '';
          bValue = b.location?.city || '';
        }
        if (type === 'tasks' && sortConfig.key === 'volunteer') {
          aValue = a.claimedBy?.name || '';
          bValue = b.claimedBy?.name || '';
        }
        if (type === 'food' && sortConfig.key === 'donor') {
          aValue = a.donorName || '';
          bValue = b.donorName || '';
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ key }) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = (data) => Math.ceil(data.length / itemsPerPage);

  const resetPagination = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
    resetPagination();
  }, [searchTerm, statusFilter, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header Skeleton */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-16 h-3 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-20 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Tabs Skeleton */}
          <div className="flex gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-20 h-10 bg-gray-800 rounded-lg animate-pulse"></div>
            ))}
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-12 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="w-16 h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="w-48 h-6 bg-gray-700 rounded animate-pulse mb-4"></div>
            <div className="w-full h-64 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Mon', rescues: stats.weeklyRescues?.monday || Math.floor(Math.random() * 10) + 1 },
    { name: 'Tue', rescues: stats.weeklyRescues?.tuesday || Math.floor(Math.random() * 10) + 1 },
    { name: 'Wed', rescues: stats.weeklyRescues?.wednesday || Math.floor(Math.random() * 10) + 1 },
    { name: 'Thu', rescues: stats.weeklyRescues?.thursday || Math.floor(Math.random() * 10) + 1 },
    { name: 'Fri', rescues: stats.weeklyRescues?.friday || Math.floor(Math.random() * 10) + 1 },
    { name: 'Sat', rescues: stats.weeklyRescues?.saturday || Math.floor(Math.random() * 10) + 1 },
    { name: 'Sun', rescues: stats.weeklyRescues?.sunday || Math.floor(Math.random() * 10) + 1 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 border-b border-gray-700 px-6 py-5 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00C896] to-[#00A078] rounded-xl flex items-center justify-center shadow-lg shadow-[#00C896]/20">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-[Playfair_Display] text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">EVV Admin</h1>
              <p className="text-sm text-gray-400 font-medium">Dashboard Control Center</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transform hover:scale-105"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {['overview', 'reports', 'tasks', 'volunteers', 'food'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold capitalize transition-all duration-300 whitespace-nowrap relative ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-[#00C896] to-[#00A078] text-white shadow-lg shadow-[#00C896]/30 transform hover:scale-105' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00C896] to-[#00A078] opacity-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                    <AlertCircle size={24} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">Total</span>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">{stats.totalReports || 0}</div>
                <div className="text-sm font-medium text-gray-400">Reports</div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Users size={24} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">Active</span>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">{stats.activeVolunteers || 0}</div>
                <div className="text-sm font-medium text-gray-400">Volunteers</div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Activity size={24} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">Open</span>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">{stats.openTasks || 0}</div>
                <div className="text-sm font-medium text-gray-400">Tasks</div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <DollarSign size={24} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">Available</span>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">{stats.foodDonations || 0}</div>
                <div className="text-sm font-medium text-gray-400">Food Donations</div>
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
            {/* Search and Filter */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-5 mb-6 flex flex-col md:flex-row gap-4 border border-gray-700/50 shadow-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/20 transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-5 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/20 transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="reported">Reported</option>
                <option value="assigned">Assigned</option>
                <option value="rescued">Rescued</option>
              </select>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-750">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('_id')}>
                      <div className="flex items-center gap-2">ID <SortIcon key="_id" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('animalType')}>
                      <div className="flex items-center gap-2">Animal <SortIcon key="animalType" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">Status <SortIcon key="status" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('location')}>
                      <div className="flex items-center gap-2">Location <SortIcon key="location" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(reports, 'reports')).map((report) => (
                    <tr key={report._id} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{report._id?.slice(-6)}</td>
                      <td className="px-6 py-4">{report.animalType}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          report.status === 'reported' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          report.status === 'assigned' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          report.status === 'rescued' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{report.location?.city || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(report)}
                            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-semibold hover:bg-gray-500 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => updateReportStatus(report._id, 'assigned')}
                            className="px-3 py-1.5 bg-amber-500 text-black rounded-lg text-xs font-semibold hover:bg-amber-400 transition-colors"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => updateReportStatus(report._id, 'rescued')}
                            className="px-3 py-1.5 bg-emerald-500 text-black rounded-lg text-xs font-semibold hover:bg-emerald-400 transition-colors"
                          >
                            Rescued
                          </button>
                          <button
                            onClick={() => deleteReport(report._id)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-500 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredData(reports, 'reports').length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg font-medium">No reports found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="px-6 py-4 bg-gray-700 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(reports, 'reports').length)} of {getFilteredData(reports, 'reports').length} reports
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1 text-gray-400">
                      Page {currentPage} of {totalPages(getFilteredData(reports, 'reports'))}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages(getFilteredData(reports, 'reports')), p + 1))}
                      disabled={currentPage === totalPages(getFilteredData(reports, 'reports'))}
                      className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Search and Filter */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-5 mb-6 flex flex-col md:flex-row gap-4 border border-gray-700/50 shadow-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/20 transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-5 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/20 transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="claimed">Claimed</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-750">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('title')}>
                      <div className="flex items-center gap-2">Title <SortIcon key="title" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('type')}>
                      <div className="flex items-center gap-2">Type <SortIcon key="type" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">Status <SortIcon key="status" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('volunteer')}>
                      <div className="flex items-center gap-2">Volunteer <SortIcon key="volunteer" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(tasks, 'tasks')).map((task) => (
                    <tr key={task._id} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{task.title}</td>
                      <td className="px-6 py-4">{task.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          task.status === 'open' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          task.status === 'claimed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{task.claimedBy?.name || '—'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(task)}
                          className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-semibold hover:bg-gray-500 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredData(tasks, 'tasks').length === 0 ? (
                <div className="p-12 text-center">
                  <Activity size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg font-medium">No tasks found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="px-6 py-4 bg-gray-700 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(tasks, 'tasks').length)} of {getFilteredData(tasks, 'tasks').length} tasks
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1 text-gray-400">
                      Page {currentPage} of {totalPages(getFilteredData(tasks, 'tasks'))}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages(getFilteredData(tasks, 'tasks')), p + 1))}
                      disabled={currentPage === totalPages(getFilteredData(tasks, 'tasks'))}
                      className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Volunteers Tab */}
        {activeTab === 'volunteers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Search */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-5 mb-6 border border-gray-700/50 shadow-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/20 transition-all"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-750">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">Name <SortIcon key="name" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('role')}>
                      <div className="flex items-center gap-2">Role <SortIcon key="role" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('city')}>
                      <div className="flex items-center gap-2">City <SortIcon key="city" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('tasksCompleted')}>
                      <div className="flex items-center gap-2">Tasks <SortIcon key="tasksCompleted" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(volunteers, 'volunteers')).map((vol) => (
                    <tr key={vol._id} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{vol.name}</td>
                      <td className="px-6 py-4">{vol.role}</td>
                      <td className="px-6 py-4">{vol.city}</td>
                      <td className="px-6 py-4">{vol.tasksCompleted || 0}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(vol)}
                          className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-semibold hover:bg-gray-500 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredData(volunteers, 'volunteers').length === 0 ? (
                <div className="p-12 text-center">
                  <Users size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg font-medium">No volunteers found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="px-6 py-4 bg-gray-700 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(volunteers, 'volunteers').length)} of {getFilteredData(volunteers, 'volunteers').length} volunteers
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1 text-gray-400">
                      Page {currentPage} of {totalPages(getFilteredData(volunteers, 'volunteers'))}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages(getFilteredData(volunteers, 'volunteers')), p + 1))}
                      disabled={currentPage === totalPages(getFilteredData(volunteers, 'volunteers'))}
                      className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Food Tab */}
        {activeTab === 'food' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Search and Filter */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-5 mb-6 flex flex-col md:flex-row gap-4 border border-gray-700/50 shadow-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search food donations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/20 transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-5 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/20 transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="claimed">Claimed</option>
                <option value="distributed">Distributed</option>
              </select>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl overflow-hidden border border-gray-700/50 shadow-xl">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-700 to-gray-750">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('description')}>
                      <div className="flex items-center gap-2">Description <SortIcon key="description" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('qty')}>
                      <div className="flex items-center gap-2">Quantity <SortIcon key="qty" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">Status <SortIcon key="status" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600 transition-colors" onClick={() => handleSort('donor')}>
                      <div className="flex items-center gap-2">Donor <SortIcon key="donor" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(food, 'food')).map((item) => (
                    <tr key={item._id} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{item.description}</td>
                      <td className="px-6 py-4">{item.qty} {item.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          item.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          item.status === 'claimed' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.donorName || 'Anonymous'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-semibold hover:bg-gray-500 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredData(food, 'food').length === 0 ? (
                <div className="p-12 text-center">
                  <DollarSign size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg font-medium">No food donations found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="px-6 py-4 bg-gray-700 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredData(food, 'food').length)} of {getFilteredData(food, 'food').length} food donations
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1 text-gray-400">
                      Page {currentPage} of {totalPages(getFilteredData(food, 'food'))}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages(getFilteredData(food, 'food')), p + 1))}
                      disabled={currentPage === totalPages(getFilteredData(food, 'food'))}
                      className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700/50"
          >
            <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-850 border-b border-gray-700/50 px-6 py-5 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Item Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2.5 hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <X size={22} className="text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">ID</p>
                      <p className="font-semibold text-lg">{selectedItem._id?.slice(-6)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Status</p>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        selectedItem.status === 'reported' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        selectedItem.status === 'assigned' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        selectedItem.status === 'rescued' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                      }`}>
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                    <p className="text-gray-400 text-sm mb-2 font-medium">Animal Type</p>
                    <p className="font-semibold text-lg">{selectedItem.animalType}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                    <p className="text-gray-400 text-sm mb-2 font-medium">Description</p>
                    <p className="font-semibold text-lg">{selectedItem.description || 'No description'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                    <p className="text-gray-400 text-sm mb-2 font-medium">Location</p>
                    <p className="font-semibold text-lg flex items-center gap-2">
                      <MapPin size={18} className="text-[#00C896]" /> {selectedItem.location?.address || selectedItem.location?.city || '—'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                    <p className="text-gray-400 text-sm mb-2 font-medium">Reported By</p>
                    <p className="font-semibold text-lg">{selectedItem.reportedBy?.name || 'Anonymous'}</p>
                  </div>
                  {selectedItem.reportedBy?.phone && (
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Contact</p>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <Phone size={18} className="text-[#00C896]" /> {selectedItem.reportedBy.phone}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                    <p className="text-gray-400 text-sm mb-2 font-medium">Title</p>
                    <p className="font-semibold text-lg">{selectedItem.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Type</p>
                      <p className="font-semibold text-lg">{selectedItem.type}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Status</p>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        selectedItem.status === 'open' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        selectedItem.status === 'claimed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                    <p className="text-gray-400 text-sm mb-2 font-medium">Description</p>
                    <p className="font-semibold text-lg">{selectedItem.description || 'No description'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                    <p className="text-gray-400 text-sm mb-2 font-medium">Location</p>
                    <p className="font-semibold text-lg flex items-center gap-2">
                      <MapPin size={18} className="text-[#00C896]" /> {selectedItem.location || '—'}
                    </p>
                  </div>
                  {selectedItem.claimedBy && (
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Claimed By</p>
                      <p className="font-semibold text-lg">{selectedItem.claimedBy.name}</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'volunteers' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                    <p className="text-gray-400 text-sm mb-2 font-medium">Name</p>
                    <p className="font-semibold text-lg">{selectedItem.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Role</p>
                      <p className="font-semibold text-lg">{selectedItem.role}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Tasks Completed</p>
                      <p className="font-semibold text-lg">{selectedItem.tasksCompleted || 0}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                    <p className="text-gray-400 text-sm mb-2 font-medium">City</p>
                    <p className="font-semibold text-lg flex items-center gap-2">
                      <MapPin size={18} className="text-[#00C896]" /> {selectedItem.city || '—'}
                    </p>
                  </div>
                  {selectedItem.email && (
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Email</p>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <Mail size={18} className="text-[#00C896]" /> {selectedItem.email}
                      </p>
                    </div>
                  )}
                  {selectedItem.phone && (
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Phone</p>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <Phone size={18} className="text-[#00C896]" /> {selectedItem.phone}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'food' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                    <p className="text-gray-400 text-sm mb-2 font-medium">Description</p>
                    <p className="font-semibold text-lg">{selectedItem.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Quantity</p>
                      <p className="font-semibold text-lg">{selectedItem.qty} {selectedItem.unit}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Status</p>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        selectedItem.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        selectedItem.status === 'claimed' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                      }`}>
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                    <p className="text-gray-400 text-sm mb-2 font-medium">Donor</p>
                    <p className="font-semibold text-lg">{selectedItem.donorName || 'Anonymous'}</p>
                  </div>
                  {selectedItem.donorContact && (
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Donor Contact</p>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <Phone size={18} className="text-[#00C896]" /> {selectedItem.donorContact}
                      </p>
                    </div>
                  )}
                  {selectedItem.pickupLocation && (
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Pickup Location</p>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <MapPin size={18} className="text-[#00C896]" /> {selectedItem.pickupLocation}
                      </p>
                    </div>
                  )}
                  {selectedItem.expiryDate && (
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-750/50 rounded-xl p-5 border border-gray-600/30">
                      <p className="text-gray-400 text-sm mb-2 font-medium">Expiry Date</p>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <Calendar size={18} className="text-[#00C896]" /> {new Date(selectedItem.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
