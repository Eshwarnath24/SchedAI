import { SLOTS } from './constants';

// Centralized API service for fetching timetable data from the backend
const API_BASE = (
    import.meta.env.MODE === 'test'
        ? '/api'
        : (import.meta.env.VITE_API_BASE || '/api')
).replace(/\/+$/, '');

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

// --- Availability API ---

export const fetchCurrentAvailability = async () => {
    const res = await fetch(`${API_BASE}/schedule/availability`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch availability: ${res.statusText}`);
    return res.json();
};

// --- Schedule Override APIs ---

export const createScheduleOverride = async (data) => {
    const res = await fetch(`${API_BASE}/schedule/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create schedule override');
    return result;
};

export const deleteScheduleOverride = async (overrideId) => {
    const res = await fetch(`${API_BASE}/schedule/override/${overrideId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete schedule override');
    return result;
};

export const fetchScheduleOverrides = async (sectionId) => {
    const res = await fetch(`${API_BASE}/schedule/overrides/section/${sectionId}`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch overrides: ${res.statusText}`);
    return res.json();
};

// --- Dashboard APIs ---

/**
 * Fetch comprehensive dashboard data for a faculty member
 * Uses the optimized aggregation service endpoint
 * @param {string} facultyId - MongoDB ObjectId of the faculty
 * @returns {Promise<Object>} Dashboard data including KPIs, workload, schedule, leaves, efficiency
 */
export const fetchFacultyDashboard = async (facultyId) => {
    try {
        const headers = { ...getAuthHeaders() };
        
        // Call the unified dashboard API endpoint
        const response = await fetch(`${API_BASE}/dashboard/${facultyId}`, { headers });
        
        if (!response.ok) {
            throw new Error(`Dashboard API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load dashboard data');
        }
        
        return data;
        
    } catch (error) {
        console.error('[fetchFacultyDashboard] Error:', error);
        
        // Fallback: try legacy endpoints if new endpoint fails
        return await fetchFacultyDashboardLegacy(facultyId);
    }
};

/**
 * Legacy dashboard data fetcher (fallback)
 * Combines data from multiple endpoints for backward compatibility
 */
const fetchFacultyDashboardLegacy = async (facultyId) => {
    const headers = { ...getAuthHeaders() };

    const [reportResult, teacherScheduleResult] = await Promise.allSettled([
        fetch(`${API_BASE}/reports/${facultyId}`, { headers }),
        fetch(`${API_BASE}/schedule/teacher/${facultyId}`, { headers }),
    ]);

    if (reportResult.status === 'rejected' && teacherScheduleResult.status === 'rejected') {
        throw new Error('Failed to load dashboard data');
    }

    let reportData = null;
    if (reportResult.status === 'fulfilled' && reportResult.value.ok) {
        reportData = await reportResult.value.json();
    }

    let teacherScheduleGrid = {};
    if (teacherScheduleResult.status === 'fulfilled' && teacherScheduleResult.value.ok) {
        const scheduleData = await teacherScheduleResult.value.json();
        teacherScheduleGrid = scheduleData?.schedule || {};
    }

    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySlots = teacherScheduleGrid?.[todayName] || teacherScheduleGrid?.[todayName.toUpperCase()] || {};

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todayClasses = Object.entries(todaySlots)
        .map(([slotId, cls]) => {
            const slotNum = Number(slotId);
            const slotMeta = SLOTS.find((s) => s.id === slotNum);
            const startTime = slotMeta?.start || '00:00';
            const [h, m] = startTime.split(':').map(Number);
            const slotMinutes = h * 60 + m;

            return {
                slotIndex: slotNum,
                startTime,
                courseCode: cls?.code || 'N/A',
                courseName: cls?.name || 'Unknown',
                room: cls?.room || 'TBA',
                studentCount: cls?.studentCount || 0,
                isCancelled: false,
                isUpcoming: slotMinutes > currentMinutes,
            };
        })
        .sort((a, b) => a.slotIndex - b.slotIndex);

    const allCodes = new Set();
    Object.values(teacherScheduleGrid || {}).forEach((daySlots) => {
        Object.values(daySlots || {}).forEach((cls) => {
            if (cls?.code) allCodes.add(cls.code);
        });
    });

    const upcomingTodayClasses = todayClasses.filter((item) => item.isUpcoming && !item.isCancelled);

    return {
        success: true,
        kpis: {
            totalCourses: allCodes.size || reportData?.inventory?.length || 0,
            weeklyHours: Number(reportData?.workloadStats?.totalWorkingHours || 0),
            activeClasses: upcomingTodayClasses.length,
        },
        facultyDetails: reportData?.facultyDetails || null,
        workloadStats: reportData?.workloadStats || null,
        inventory: reportData?.inventory || [],
        engagementCurve: reportData?.engagementCurve || { labels: [], data: [] },
        schedule: {
            today: todayClasses,
            upcoming: upcomingTodayClasses,
        },
    };
};

/**
 * Fetch detailed workload report for faculty
 * @param {string} facultyId - MongoDB ObjectId of the faculty
 * @returns {Promise<Object>} Workload breakdown by course type and day
 */
export const fetchFacultyWorkloadReport = async (facultyId) => {
    try {
        const headers = { ...getAuthHeaders() };
        const response = await fetch(`${API_BASE}/dashboard/${facultyId}`, { headers });
        
        if (!response.ok) {
            throw new Error(`Workload API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to load workload data');
        }
        
        // Extract and format workload-specific data
        return {
            success: true,
            totalHours: data.workload?.totalWeeklyHours || 0,
            hoursByType: data.workload?.hoursByType || {},
            courseBreakdown: data.workload?.courseBreakdown || [],
            weeklyDistribution: data.workload?.weeklyDistribution || [],
            efficiency: data.efficiency || {}
        };
        
    } catch (error) {
        console.error('[fetchFacultyWorkloadReport] Error:', error);
        throw error;
    }
};

