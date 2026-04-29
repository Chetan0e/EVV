import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        logout();
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const requestOtp = async (phone) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', { phone });
      return res.data;
    } catch (err) {
      console.error(err);
      return err.response?.data || { success: false, message: 'Error requesting OTP' };
    }
  };

  const login = async (phone, otp) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { phone, otp });
      if (res.data.success) {
        setToken(res.data.data.token);
        localStorage.setItem('token', res.data.data.token);
        setUser(res.data.data.user);
        return { success: true };
      }
    } catch (err) {
      console.error(err);
      return err.response?.data || { success: false, message: 'Error verifying OTP' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, requestOtp, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
