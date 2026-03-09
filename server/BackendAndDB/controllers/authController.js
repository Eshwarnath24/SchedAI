const User = require('../DB_models/User');
const Student = require('../DB_models/Student');
const Course = require('../DB_models/Course');
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
        sectionName: `${branch}-${sectionLetter}`,
        studentNumber: uniqueCode,
    };
};

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

// ==========================================
// POST /api/auth/login — Faculty/Admin login
// ==========================================
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

module.exports = { loginUser, loginStudent, getMe, registerUser, parseStudentRollNumber };
