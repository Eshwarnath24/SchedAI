const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');

// Load config from server/.env
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Allows JSON parsing
app.use(cors());         // Allows Frontend connection

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
