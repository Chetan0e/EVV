const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Simple in-memory OTP store (in production, use Redis)
const otpStore = new Map();

// Generate dynamic OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number required' });
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 5-minute expiration
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  
  // In a real application, we would send this OTP via SMS (Twilio/AWS SNS)
  // For now, we log it and return it in the response so the user can test
  console.log(`[OTP] Generated for ${phone}: ${otp}`);
  
  res.json({ 
    success: true, 
    message: 'OTP generated. Check console or use the provided OTP for testing.', 
    otp 
  }); 
});

// Verify OTP and Login/Register
router.post('/verify-otp', async (req, res) => {
  const { phone, otp, name, role } = req.body;
  
  const storedOtpData = otpStore.get(phone);
  if (!storedOtpData) {
    return res.status(400).json({ success: false, message: 'OTP not requested or expired' });
  }

  if (Date.now() > storedOtpData.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }

  if (storedOtpData.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  // Clear OTP
  otpStore.delete(phone);

  try {
    let user = await User.findOne({ phone });
    if (!user) {
      if (!name) return res.status(400).json({ success: false, message: 'Name required for new registration' });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('random_secure_password_base', salt);
      user = new User({ phone, name, password: hashedPassword, role: role || 'reporter' });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({ success: true, data: { token, user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
