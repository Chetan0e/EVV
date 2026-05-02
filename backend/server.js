require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const rescueRoutes = require('./routes/rescue');
const foodRoutes = require('./routes/food');
const volunteerRoutes = require('./routes/volunteer');
const ngoRoutes = require('./routes/ngo');
const socketHandler = require('./socket/rescueSocket');

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

// Attach io to app to use in routes
app.set('io', io);

// Handle sockets
socketHandler(io);

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute (increased for dev)
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.use('/api/', apiLimiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/evv_db')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rescue', rescueRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/ngo', ngoRoutes);

// Stats route
app.get('/api/stats', async (req, res) => {
  try {
    const RescueReport = require('./models/RescueReport');
    const FoodDonation = require('./models/FoodDonation');
    const User = require('./models/User');

    const totalRescues = await RescueReport.countDocuments();
    const animalsHelped = await RescueReport.countDocuments({ status: { $in: ['rescued', 'closed'] } });
    const activeVolunteers = await User.countDocuments({ role: 'volunteer' });
    
    // Calculate total food saved realistically
    const deliveredFoods = await FoodDonation.find({ status: 'delivered' });
    let foodSaved = 0;
    deliveredFoods.forEach(f => {
      const num = parseFloat(f.quantity);
      if (!isNaN(num)) {
         foodSaved += num;
      } else {
         // Fallback if quantity is something like "50 rotis", count as 1 unit
         foodSaved += 1;
      }
    });

    res.json({
      success: true,
      data: { totalRescues, animalsHelped, activeVolunteers, foodSaved: Math.round(foodSaved) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SLA monitoring via node-cron (example: alert on reports pending > 2 hours)
cron.schedule('0 * * * *', async () => {
  try {
    const RescueReport = require('./models/RescueReport');
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const pendingReports = await RescueReport.find({ status: 'reported', createdAt: { $lt: twoHoursAgo } });
    
    if (pendingReports.length > 0) {
      console.log(`[SLA ALERT] ${pendingReports.length} reports pending for > 2 hours.`);
      io.emit('rescue:slaAlert', { count: pendingReports.length, message: 'High priority pending rescues' });
    }
  } catch (err) {
    console.error('Cron job error:', err);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
