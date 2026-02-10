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
const leaveRoutes = require('./routes/leaveRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Use Routes
app.use('/api/leaves', leaveRoutes);
app.use('/api/reports', reportRoutes);

// Connect to DB
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://vishalRajaraman:Vishal%40123.@schedai.p21uk9p.mongodb.net/?appName=schedAI")
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log(err));

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
