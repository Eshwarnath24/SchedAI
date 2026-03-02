/**
 * Test Express app instance (no listen, no real DB connection).
 * Used by Supertest integration tests.
 */
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import Routes
const leaveRoutes = require('../BackendAndDB/routes/leaveRoutes');
const reportRoutes = require('../BackendAndDB/routes/reportRoutes');
const scheduleRoutes = require('../BackendAndDB/routes/scheduleRoutes');
const authRoutes = require('../BackendAndDB/routes/authRoutes');

// Use Routes
app.use('/api/leaves', leaveRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;
