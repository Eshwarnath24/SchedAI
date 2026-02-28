// Centralized API service for fetching timetable data from the backend
const API_BASE = import.meta.env.VITE_API_BASE || 'https://schedai.onrender.com/api';

// --- Token helpers ---
const TOKEN_KEY = 'schedai_jwt_token';

export const saveToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- Authentication ---

// Faculty/Admin login
export const loginApi = async (email, password, role) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    // Store JWT token
    if (data.token) {
        saveToken(data.token);
    }
    return data;
};

// Student login
export const studentLoginApi = async (rollNo, password) => {
    const res = await fetch(`${API_BASE}/auth/student-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Student login failed');

    // Store JWT token
    if (data.token) {
        saveToken(data.token);
    }
    return data;
};

// Verify stored token (for auto-login on refresh)
export const verifyTokenApi = async () => {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeaders() },
    });

    if (!res.ok) {
        removeToken(); // Token expired or invalid
        return null;
    }

    return res.json();
};

// --- Schedule APIs ---

export const fetchActiveSchedule = async () => {
    const res = await fetch(`${API_BASE}/schedule/active`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch active schedule: ${res.statusText}`);
    return res.json();
};

export const fetchTeacherSchedule = async (teacherId) => {
    const res = await fetch(`${API_BASE}/schedule/teacher/${teacherId}`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch teacher schedule: ${res.statusText}`);
    return res.json();
};

export const fetchSectionSchedule = async (sectionId) => {
    const res = await fetch(`${API_BASE}/schedule/section/${sectionId}`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch section schedule: ${res.statusText}`);
    return res.json();
};

export const fetchSections = async () => {
    const res = await fetch(`${API_BASE}/schedule/sections`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch sections: ${res.statusText}`);
    return res.json();
};

export const fetchTeachers = async () => {
    const res = await fetch(`${API_BASE}/schedule/teachers`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch teachers: ${res.statusText}`);
    return res.json();
};

export const fetchTimeSlots = async () => {
    const res = await fetch(`${API_BASE}/schedule/timeslots`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch time slots: ${res.statusText}`);
    return res.json();
};
