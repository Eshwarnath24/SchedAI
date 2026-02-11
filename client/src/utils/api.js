// Centralized API service for fetching timetable data from the backend
const API_BASE = '/api';

// Authentication
export const loginApi = async (email, password, role) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
};

export const fetchActiveSchedule = async () => {
    const res = await fetch(`${API_BASE}/schedule/active`);
    if (!res.ok) throw new Error(`Failed to fetch active schedule: ${res.statusText}`);
    return res.json();
};

export const fetchTeacherSchedule = async (teacherId) => {
    const res = await fetch(`${API_BASE}/schedule/teacher/${teacherId}`);
    if (!res.ok) throw new Error(`Failed to fetch teacher schedule: ${res.statusText}`);
    return res.json();
};

export const fetchSectionSchedule = async (sectionId) => {
    const res = await fetch(`${API_BASE}/schedule/section/${sectionId}`);
    if (!res.ok) throw new Error(`Failed to fetch section schedule: ${res.statusText}`);
    return res.json();
};

export const fetchSections = async () => {
    const res = await fetch(`${API_BASE}/schedule/sections`);
    if (!res.ok) throw new Error(`Failed to fetch sections: ${res.statusText}`);
    return res.json();
};

export const fetchTeachers = async () => {
    const res = await fetch(`${API_BASE}/schedule/teachers`);
    if (!res.ok) throw new Error(`Failed to fetch teachers: ${res.statusText}`);
    return res.json();
};

export const fetchTimeSlots = async () => {
    const res = await fetch(`${API_BASE}/schedule/timeslots`);
    if (!res.ok) throw new Error(`Failed to fetch time slots: ${res.statusText}`);
    return res.json();
};
