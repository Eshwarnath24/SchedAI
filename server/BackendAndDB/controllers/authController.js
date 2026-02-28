const User = require('../DB_models/User');
const Student = require('../DB_models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'schedai_jwt_secret_key_2026_amrita';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// --- Helper: Sign a JWT ---
const signToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// --- Roll number parsing (mirrors client-side logic) ---
const SECTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const STUDENTS_PER_SECTION = 10;
const ROLL_FORMAT = /^([A-Z]{2})\.([A-Z]{2})\.U(\d)([A-Z]{3,4})(\d{2})(\d{3})$/;

const parseStudentRollNumber = (input) => {
    if (!input) return null;
    const normalized = input.trim().toUpperCase();
    const match = normalized.match(ROLL_FORMAT);
    if (!match) return null;

    const [, campus, program, yearCode, branch, batchYear, uniqueCode] = match;
    const studentNumber = parseInt(uniqueCode, 10);

    if (Number.isNaN(studentNumber) || studentNumber < 1) {
        return null;
    }

    // Range-based section assignment:
    // 001-010 → A, 011-020 → B, 021-030 → C, etc.
    const sectionIndex = Math.floor((studentNumber - 1) / STUDENTS_PER_SECTION);

    if (sectionIndex < 0 || sectionIndex >= SECTION_LETTERS.length) {
        return null;
    }

    const sectionLetter = SECTION_LETTERS[sectionIndex];

    return {
        normalized,
        campus,
        program,
        yearCode,
        branch,
        batchYear,
        sectionIndex,
        sectionLetter,
        sectionName: `${branch} ${sectionLetter}`,
        studentNumber: uniqueCode,
    };
};

// ==========================================
// POST /api/auth/login — Faculty/Admin login
// ==========================================
const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Find user by email — try exact match first, then by username prefix
        let user = await User.findOne({ email });

        if (!user) {
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

        // Sign JWT token
        const token = signToken({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });

        // Return user info (without password) + token
        res.json({
            success: true,
            token,
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

// ==========================================
// POST /api/auth/student-login — Student login (DB-backed)
// ==========================================
const loginStudent = async (req, res) => {
    try {
        const { rollNo, password } = req.body;

        if (!rollNo) {
            return res.status(400).json({ error: 'Roll number is required.' });
        }

        if (!password) {
            return res.status(400).json({ error: 'Password is required.' });
        }

        // Parse & validate roll number format
        const parsed = parseStudentRollNumber(rollNo);
        if (!parsed) {
            return res.status(400).json({
                error: 'Invalid roll number format. Expected format: CB.SC.U4CSE23XXX'
            });
        }

        // Find student in DB
        const student = await Student.findOne({ rollNo: parsed.normalized });
        if (!student) {
            return res.status(401).json({ error: 'Invalid credentials. No student found with this roll number.' });
        }

        // Verify password using bcrypt
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
        }

        // Sign JWT with student details
        const token = signToken({
            studentId: student._id.toString(),
            rollNo: student.rollNo,
            role: 'student',
            sectionName: student.sectionName,
            sectionLetter: student.sectionLetter,
            branch: student.department,
            batchYear: student.batchYear,
        });

        res.json({
            success: true,
            token,
            student: {
                _id: student._id,
                rollNo: student.rollNo,
                name: student.name,
                role: 'student',
                sectionName: student.sectionName,
                sectionIndex: SECTION_LETTERS.indexOf(student.sectionLetter),
                sectionLetter: student.sectionLetter,
                branch: student.department,
                batchYear: student.batchYear,
                campus: parsed.campus,
                program: parsed.program,
                yearCode: parsed.yearCode,
                studentNumber: parsed.studentNumber,
            }
        });
    } catch (err) {
        console.error('❌ Student login error:', err);
        res.status(500).json({ error: 'Server error during student authentication.' });
    }
};

// ==========================================
// GET /api/auth/me — Verify token & return user info
// ==========================================
const getMe = async (req, res) => {
    try {
        // req.user is set by the auth middleware
        const decoded = req.user;

        if (decoded.role === 'student') {
            // Student token — return student profile from token payload
            return res.json({
                success: true,
                role: 'student',
                student: {
                    rollNo: decoded.rollNo,
                    role: 'student',
                    sectionName: decoded.sectionName,
                    sectionIndex: SECTION_LETTERS.indexOf(decoded.sectionLetter),
                    sectionLetter: decoded.sectionLetter,
                    branch: decoded.branch,
                    batchYear: decoded.batchYear,
                }
            });
        }

        // Faculty/Admin token — fetch fresh user data from DB
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({
            success: true,
            role: user.role === 'Faculty' ? 'teacher' : user.role === 'Admin' ? 'admin' : user.role,
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
        console.error('❌ getMe error:', err);
        res.status(500).json({ error: 'Server error verifying token.' });
    }
};

module.exports = { loginUser, loginStudent, getMe, parseStudentRollNumber };
