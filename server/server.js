const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
require('dotenv').config(); 

// Load config from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
// CORS Configuration - Allow specific laptop IPs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://10.12.75.184:5173',  // Lap1
  'http://10.12.87.38:5173',   // Lap2
  'http://10.12.75.184:3000',  // Lap1 alternative port
  'http://10.12.87.38:3000',   // Lap2 alternative port
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Or use: callback(new Error('Not allowed by CORS')) for strict mode
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(express.json()); // Allows JSON parsing
app.use(cors(corsOptions)); // Allows Frontend connection from specific origins

// Import Routes
const leaveRoutes = require('./BackendAndDB/routes/leaveRoutes');
const reportRoutes = require('./BackendAndDB/routes/reportRoutes');
const scheduleRoutes = require('./BackendAndDB/routes/scheduleRoutes');
const authRoutes = require('./BackendAndDB/routes/authRoutes');
const announcementRoutes = require('./BackendAndDB/routes/announcementRoutes');
const dashboardRoutes = require('./BackendAndDB/routes/dashboardRoutes');

// Use Routes
app.use('/api/leaves', leaveRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Notification Module ────────────────────────────────────────────────────────
// Registers event listeners for class.cancelled and leave.approved.
// Must be called AFTER dotenv.config() so MAIL_* env vars are already loaded.
const NotificationListener = require('./BackendAndDB/notifications/NotificationListener');
NotificationListener.register();
// ──────────────────────────────────────────────────────────────────────────────

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log(err));


// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Backend is running successfully",
        status: "OK"
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
