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
            {/* Search and Filter */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00C896]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00C896]"
              >
                <option value="all">All Status</option>
                <option value="reported">Reported</option>
                <option value="assigned">Assigned</option>
                <option value="rescued">Rescued</option>
              </select>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('_id')}>
                      <div className="flex items-center gap-2">ID <SortIcon key="_id" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('animalType')}>
                      <div className="flex items-center gap-2">Animal <SortIcon key="animalType" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">Status <SortIcon key="status" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('location')}>
                      <div className="flex items-center gap-2">Location <SortIcon key="location" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(reports, 'reports')).map((report) => (
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
                            onClick={() => handleViewDetails(report)}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-semibold hover:bg-gray-500"
                          >
                            <Eye size={14} />
                          </button>
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
              {getFilteredData(reports, 'reports').length === 0 ? (
                <div className="p-8 text-center text-gray-400">No reports found</div>
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
            <div className="bg-gray-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00C896]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00C896]"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="claimed">Claimed</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('title')}>
                      <div className="flex items-center gap-2">Title <SortIcon key="title" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('type')}>
                      <div className="flex items-center gap-2">Type <SortIcon key="type" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">Status <SortIcon key="status" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('volunteer')}>
                      <div className="flex items-center gap-2">Volunteer <SortIcon key="volunteer" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(tasks, 'tasks')).map((task) => (
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
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(task)}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-semibold hover:bg-gray-500"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredData(tasks, 'tasks').length === 0 ? (
                <div className="p-8 text-center text-gray-400">No tasks found</div>
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
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00C896]"
                />
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">Name <SortIcon key="name" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('role')}>
                      <div className="flex items-center gap-2">Role <SortIcon key="role" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('city')}>
                      <div className="flex items-center gap-2">City <SortIcon key="city" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('tasksCompleted')}>
                      <div className="flex items-center gap-2">Tasks <SortIcon key="tasksCompleted" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(volunteers, 'volunteers')).map((vol) => (
                    <tr key={vol._id} className="border-t border-gray-700">
                      <td className="px-6 py-4">{vol.name}</td>
                      <td className="px-6 py-4">{vol.role}</td>
                      <td className="px-6 py-4">{vol.city}</td>
                      <td className="px-6 py-4">{vol.tasksCompleted || 0}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(vol)}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-semibold hover:bg-gray-500"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredData(volunteers, 'volunteers').length === 0 ? (
                <div className="p-8 text-center text-gray-400">No volunteers found</div>
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
            <div className="bg-gray-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search food donations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00C896]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00C896]"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="claimed">Claimed</option>
                <option value="distributed">Distributed</option>
              </select>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('description')}>
                      <div className="flex items-center gap-2">Description <SortIcon key="description" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('qty')}>
                      <div className="flex items-center gap-2">Quantity <SortIcon key="qty" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-2">Status <SortIcon key="status" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-600" onClick={() => handleSort('donor')}>
                      <div className="flex items-center gap-2">Donor <SortIcon key="donor" /></div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(food, 'food')).map((item) => (
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
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-semibold hover:bg-gray-500"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredData(food, 'food').length === 0 ? (
                <div className="p-8 text-center text-gray-400">No food donations found</div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">ID</p>
                      <p className="font-semibold">{selectedItem._id?.slice(-6)}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedItem.status === 'reported' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                        selectedItem.status === 'assigned' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                        selectedItem.status === 'rescued' ? 'bg-[#00C896]/20 text-[#00C896]' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Animal Type</p>
                    <p className="font-semibold">{selectedItem.animalType}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Description</p>
                    <p className="font-semibold">{selectedItem.description || 'No description'}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Location</p>
                    <p className="font-semibold flex items-center gap-2">
                      <MapPin size={16} /> {selectedItem.location?.address || selectedItem.location?.city || '—'}
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Reported By</p>
                    <p className="font-semibold">{selectedItem.reportedBy?.name || 'Anonymous'}</p>
                  </div>
                  {selectedItem.reportedBy?.phone && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Contact</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Phone size={16} /> {selectedItem.reportedBy.phone}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Title</p>
                    <p className="font-semibold">{selectedItem.title}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Type</p>
                      <p className="font-semibold">{selectedItem.type}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedItem.status === 'open' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                        selectedItem.status === 'claimed' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' :
                        'bg-[#00C896]/20 text-[#00C896]'
                      }`}>
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Description</p>
                    <p className="font-semibold">{selectedItem.description || 'No description'}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Location</p>
                    <p className="font-semibold flex items-center gap-2">
                      <MapPin size={16} /> {selectedItem.location || '—'}
                    </p>
                  </div>
                  {selectedItem.claimedBy && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Claimed By</p>
                      <p className="font-semibold">{selectedItem.claimedBy.name}</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'volunteers' && (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Name</p>
                    <p className="font-semibold">{selectedItem.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Role</p>
                      <p className="font-semibold">{selectedItem.role}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Tasks Completed</p>
                      <p className="font-semibold">{selectedItem.tasksCompleted || 0}</p>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">City</p>
                    <p className="font-semibold flex items-center gap-2">
                      <MapPin size={16} /> {selectedItem.city || '—'}
                    </p>
                  </div>
                  {selectedItem.email && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Email</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Mail size={16} /> {selectedItem.email}
                      </p>
                    </div>
                  )}
                  {selectedItem.phone && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Phone</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Phone size={16} /> {selectedItem.phone}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'food' && (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Description</p>
                    <p className="font-semibold">{selectedItem.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Quantity</p>
                      <p className="font-semibold">{selectedItem.qty} {selectedItem.unit}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedItem.status === 'available' ? 'bg-[#00C896]/20 text-[#00C896]' :
                        selectedItem.status === 'claimed' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Donor</p>
                    <p className="font-semibold">{selectedItem.donorName || 'Anonymous'}</p>
                  </div>
                  {selectedItem.donorContact && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Donor Contact</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Phone size={16} /> {selectedItem.donorContact}
                      </p>
                    </div>
                  )}
                  {selectedItem.pickupLocation && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Pickup Location</p>
                      <p className="font-semibold flex items-center gap-2">
                        <MapPin size={16} /> {selectedItem.pickupLocation}
                      </p>
                    </div>
                  )}
                  {selectedItem.expiryDate && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Expiry Date</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar size={16} /> {new Date(selectedItem.expiryDate).toLocaleDateString()}
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
