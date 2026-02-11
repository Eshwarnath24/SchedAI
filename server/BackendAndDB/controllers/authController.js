const User = require('../DB_models/User');
const bcrypt = require('bcryptjs');

// POST /api/auth/login — Authenticate user against MongoDB
const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Find user by email — try exact match first, then by username prefix
        // (Frontend sends 'smith@cb.teachers.amrita.edu' but DB stores 'smith@univ.edu')
        let user = await User.findOne({ email });

        if (!user) {
            // Extract username part (before @) and try matching that
            const username = email.split('@')[0];
            if (username) {
                user = await User.findOne({ email: { $regex: `^${username}@`, $options: 'i' } });
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials. No user found with this email.' });
        }

        // Verify password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
        }

        // Optionally check role matches
        if (role && role !== 'student') {
            const roleMap = { teacher: 'Faculty', admin: 'Admin' };
            const expectedRole = roleMap[role] || role;
            if (user.role !== expectedRole) {
                return res.status(403).json({
                    error: `Access denied. You are registered as ${user.role}, not ${expectedRole}.`
                });
            }
        }

        // Return user info (without password)
        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                rank: user.rank,
                officeLocation: user.officeLocation,
                phone: user.phone,
            }
        });
    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({ error: 'Server error during authentication.' });
    }
};

module.exports = { loginUser };
