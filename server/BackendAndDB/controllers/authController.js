const User = require('../DB_models/User');
const Course = require('../DB_models/Course');
const bcrypt = require('bcryptjs');

// POST /api/auth/register — Register a new user
const registerUser = async (req, res) => {
    try {
        // 1. Get fields from the request body
        let { name, email, password, role, rank } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, error: 'Please provide all required fields' });
        }

        // 2. Set Default Rank if missing (must match User schema enum)
        if (!rank) {
            rank = "Assistant Prof";
        }

        // Normalize 'Assistant Professor' -> 'Assistant Prof' and 'Associate Professor' -> 'Associate Prof'
        if (rank === "Assistant Professor") rank = "Assistant Prof";
        if (rank === "Associate Professor") rank = "Associate Prof";

        // 3. SANITIZE & VALIDATE EMAIL
        // - Trim whitespace and convert to lowercase for consistency
        email = email.trim().toLowerCase();

        // 3.1 Strict Email Regex
        // Format: name@department.cb.amrita
        // - Group 1 (Name): Alphanumeric, dots, underscores allowed.
        // - Group 2 (Department): STRICTLY Alphanumeric (a-z0-9). NO dots, NO hyphens.
        // - Domain: fixed as .cb.amrita
        const amritaRegex = /^([a-z0-9._%+-]+)@([a-z0-9]+)\.cb\.amrita$/;

        const match = email.match(amritaRegex);

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Access Denied: Email must be in format: name@department.cb.amrita (Department must be alphanumeric only)"
            });
        }

        // Extract department from email (GROUP 2 in regex)
        const extractedDept = match[2].toUpperCase();

        // 3.2 Validate Department against Database
        // Check if any course exists with this department
        const validDept = await Course.findOne({ department: extractedDept });
        if (!validDept) {
            return res.status(400).json({
                success: false,
                message: `Invalid Department: The department '${extractedDept}' does not exist in the database records.`
            });
        }

        // 4. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Obfuscate user existence for security
            return res.status(400).json({ success: false, error: 'Registration failed. Please check your details or try logging in.' });
        }

        // 5. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6. Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            department: extractedDept,
            rank: rank
        });

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                rank: user.rank
            }
        });

    } catch (err) {
        console.error('❌ Register error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }
        res.status(500).json({ success: false, error: err.message });
    }
};


// POST /api/auth/login — Authenticate user against MongoDB
const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Ensure we search with lowercase email
        const normalizedEmail = email.toLowerCase();

        // Find user by email 
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // Fuzzy search (Legacy support for old formats or username-only login)
            const username = normalizedEmail.split('@')[0];
            if (username) {
                user = await User.findOne({ email: { $regex: `^${username}@`, $options: 'i' } });
            }
        }

        if (!user) {
            // Generic error to prevent user enumeration
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Verify password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Generic error to prevent user enumeration
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Optionally check role matches
        if (role && role !== 'student') {
            const roleMap = { teacher: 'Faculty', admin: 'Admin' };
            const expectedRole = roleMap[role] || role;
            if (user.role !== expectedRole) {
                // Keep distinct role error or make generic? User said "don't tell user is already exists".
                // Detailed role error implies existence. I'll make it generic too to be safe, or just "Access denied".
                return res.status(403).json({
                    error: 'Access denied. Incorrect role.'
                });
            }
        }

        // Return user info
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

module.exports = { loginUser, registerUser };