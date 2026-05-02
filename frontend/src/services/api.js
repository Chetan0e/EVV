import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' }
})

// Add JWT token to requests if logged in
api.interceptors.request.use(config => {
  const token = localStorage.getItem('evv_token')
  if (token) config.headers.Authorization = `Bearer ${token}` 
  return config
})

export const statsAPI = {
  getPublicStats: () => api.get('/api/stats'),
  getCityStats: (city) => api.get(`/api/stats?city=${city}`)
}

export const rescueAPI = {
  createReport: (formData) => api.post('/api/rescue', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getNearby: (lat, lng, radius = 10) => 
    api.get(`/api/rescue/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
  getAll: (filters) => api.get('/api/rescue', { params: filters }),
  updateStatus: (id, status) => api.put(`/api/rescue/${id}/status`, { status })
}

export const foodAPI = {
  create: (data) => api.post('/api/food', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAvailable: (lat, lng) => 
    api.get(`/api/food/available?lat=${lat}&lng=${lng}`),
  claim: (id) => api.put(`/api/food/${id}/claim`),
  markDelivered: (id) => api.put(`/api/food/${id}/delivered`)
}

export const volunteerAPI = {
  getTasks: (filters) => api.get('/api/volunteer/tasks', { params: filters }),
  claimTask: (id) => api.post(`/api/volunteer/tasks/${id}/claim`),
  getMyTasks: () => api.get('/api/volunteer/my-tasks'),
  completeTask: (id, proof) => api.put(`/api/volunteer/tasks/${id}/complete`, proof)
}

export const authAPI = {
  sendOTP: (phone) => api.post('/api/auth/send-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/api/auth/verify-otp', { phone, otp }),
  getMe: () => api.get('/api/auth/me'),
  register: (data) => api.post('/api/auth/register', data)
}

export const ngoAPI = {
  getNearby: (lat, lng) => api.get(`/api/ngo/nearby?lat=${lat}&lng=${lng}`),
  getById: (id) => api.get(`/api/ngo/${id}`)
}

export const adminAPI = {
  login: (creds) => api.post('/api/admin/login', creds),
  getStats: () => api.get('/api/admin/stats'),
  getReports: (filters) => api.get('/api/admin/reports', { params: filters }),
  getTasks: () => api.get('/api/admin/tasks'),
  getVolunteers: () => api.get('/api/admin/volunteers'),
  getFood: () => api.get('/api/admin/food'),
  updateReport: (id, data) => api.put(`/api/admin/reports/${id}`, data),
  verifyNGO: (id) => api.put(`/api/admin/ngo/${id}/verify`),
  deleteReport: (id) => api.delete(`/api/admin/reports/${id}`)
}

export default api
