const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load config
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

// Use Routes
app.use('/api/leaves', leaveRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/auth', authRoutes);

// Connect to DB
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://vishalRajaraman:Vishal%40123.@schedai.p21uk9p.mongodb.net/?appName=schedAI")
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log(err));

// Start Server
const PORT = 619;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
