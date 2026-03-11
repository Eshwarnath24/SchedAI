import { createContext, useState, useEffect } from "react";
import { getInitialTimetable, autoMarkCompletedClasses } from "../utils/timetableData";
import { announcements } from "../utils/announcements";
import { CURRENT_TEACHER } from "../utils/database";
import { parseStudentRollNumber } from "../utils/rollNumber";
import { loginApi, studentLoginApi, verifyTokenApi, removeToken, fetchActiveSchedule, fetchTeacherSchedule } from "../utils/api";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const [events, setEvents] = useState(getInitialTimetable);
    const [announcementsList, setAnnouncementsList] = useState(announcements);
    const [currentTeacher, setCurrentTeacher] = useState(CURRENT_TEACHER);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [studentRollNo, setStudentRollNo] = useState('');
    const [studentProfile, setStudentProfile] = useState(null);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleError, setScheduleError] = useState(null);
    const [scheduleMetadata, setScheduleMetadata] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null); // Authenticated user from DB
    const [authLoading, setAuthLoading] = useState(true); // Loading state while verifying stored token

    // ---- Auto-login from stored JWT on mount ----
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const data = await verifyTokenApi();
                if (!data || !data.success) {
                    setAuthLoading(false);
                    return;
                }

                if (data.role === 'student' && data.student) {
                    setIsAuthenticated(true);
                    setUserRole('student');
                    setStudentRollNo(data.student.rollNo);
                    setStudentProfile({
                        normalized: data.student.rollNo,
                        sectionName: data.student.sectionName,
                        sectionIndex: data.student.sectionIndex,
                        sectionLetter: data.student.sectionLetter,
                        branch: data.student.branch,
                        batchYear: data.student.batchYear,
                    });
                    setLoggedInUser(null);
                } else if (data.user) {
                    const role = data.role; // 'teacher' or 'admin'
                    setIsAuthenticated(true);
                    setUserRole(role);
                    setLoggedInUser(data.user);
                    setStudentRollNo('');
                    setStudentProfile(null);

                    if (data.user.role === 'Faculty') {
                        setCurrentTeacher(prev => ({
                            ...prev,
                            name: data.user.name || prev.name,
                            department: data.user.department || prev.department,
                            designation: data.user.rank || prev.designation,
                            email: data.user.email || prev.email,
                            officeRoom: data.user.officeLocation || prev.officeRoom,
                            phone: data.user.phone || prev.phone,
                        }));
                        loadScheduleForTeacher(data.user._id);
                    } else {
                        loadFullSchedule();
                    }
                }
            } catch (err) {
                console.warn('⚠️ Could not restore session from token:', err.message);
            } finally {
                setAuthLoading(false);
            }
        };
        restoreSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch schedule for the logged-in teacher from the backend API
    const loadScheduleForTeacher = async (teacherId) => {
        setScheduleLoading(true);
        setScheduleError(null);
        try {
            const data = await fetchTeacherSchedule(teacherId);
            if (data && data.schedule) {
                const transformedEvents = {};
                Object.entries(data.schedule).forEach(([day, slots]) => {
                    // Skip uppercase duplicate keys (use proper case only)
                    if (day === day.toUpperCase()) return;
                    transformedEvents[day] = [];
                    Object.entries(slots).forEach(([slotIndex, courseObj]) => {
                        transformedEvents[day].push({
                            id: `${day}-${slotIndex}-api`,
                            slotId: parseInt(slotIndex),
                            code: courseObj.code,
                            title: courseObj.name,
                            room: courseObj.room,
                            type: courseObj.type,
                            year: courseObj.year || '',
                            section: courseObj.section || '',
                            studentCount: courseObj.studentCount || 0,
                            status: courseObj.status === 'CANCELLED' ? 'cancelled' : courseObj.status === 'RESCHEDULED' ? 'rescheduled' : 'scheduled',
                            isCancelled: courseObj.status === 'CANCELLED',
                            faculty: courseObj.faculty || '',
                            facultyId: courseObj.facultyId || null,
                            sectionId: courseObj.sectionId || null,
                            overrideId: courseObj.overrideId || null,
                            reason: courseObj.reason || null,
                        });
                    });
                });
                // Merge locally-added events (current week) back in
                try {
                    const now = new Date();
                    const d = now.getDay();
                    const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d + (d === 0 ? -6 : 1));
                    const weekKey = `schedai_added_${teacherId}_${mon.getFullYear()}-${mon.getMonth() + 1}-${mon.getDate()}`;
                    const localAdded = JSON.parse(localStorage.getItem(weekKey) || '[]');
                    if (localAdded.length > 0) {
                        localAdded.forEach(({ day, event }) => {
                            if (!transformedEvents[day]) transformedEvents[day] = [];
                            const alreadyPresent = transformedEvents[day].some(e => e.slotId === event.slotId);
                            if (!alreadyPresent) transformedEvents[day].push(event);
                        });
                    }
                    // Re-apply stored cancellations
                    const cancelKey = `schedai_cancelled_${teacherId}_${mon.getFullYear()}-${mon.getMonth() + 1}-${mon.getDate()}`;
                    const localCancelled = JSON.parse(localStorage.getItem(cancelKey) || '[]');
                    if (localCancelled.length > 0) {
                        localCancelled.forEach(({ day, slotId }) => {
                            if (transformedEvents[day]) {
                                transformedEvents[day] = transformedEvents[day].map(e =>
                                    e.slotId === slotId ? { ...e, status: 'cancelled', isCancelled: true } : e
                                );
                            }
                        });
                    }
                } catch (e) { /* ignore storage errors */ }
                setEvents(transformedEvents);
                setScheduleMetadata({
                    teacher: data.teacher,
                });
            }
        } catch (err) {
            console.warn('⚠️ Could not load teacher schedule from API, falling back to mock:', err.message);
            setScheduleError(err.message);
        } finally {
            setScheduleLoading(false);
        }
    };

    // Fetch full active schedule (for admin or fallback)
    const loadFullSchedule = async () => {
        setScheduleLoading(true);
        setScheduleError(null);
        try {
            const data = await fetchActiveSchedule();
            if (data && data.schedule) {
                const transformedEvents = {};
                Object.entries(data.schedule).forEach(([day, slots]) => {
                    if (day === day.toUpperCase()) return;
                    transformedEvents[day] = [];
                    Object.entries(slots).forEach(([slotIndex, courseObj]) => {
                        transformedEvents[day].push({
                            id: `${day}-${slotIndex}-api`,
                            slotId: parseInt(slotIndex),
                            code: courseObj.code,
                            title: courseObj.name,
                            room: courseObj.room,
                            type: courseObj.type,
                            year: courseObj.year || '',
                            section: courseObj.section || '',
                            studentCount: courseObj.studentCount || 0,
                            status: courseObj.status === 'CANCELLED' ? 'cancelled' : courseObj.status === 'RESCHEDULED' ? 'rescheduled' : 'scheduled',
                            isCancelled: courseObj.status === 'CANCELLED',
                            faculty: courseObj.faculty || '',
                            facultyId: courseObj.facultyId || null,
                            sectionId: courseObj.sectionId || null,
                            overrideId: courseObj.overrideId || null,
                            reason: courseObj.reason || null,
                        });
                    });
                });
                setEvents(transformedEvents);
                setScheduleMetadata({
                    academicYear: data.academicYear,
                    semester: data.semester,
                    fitnessScore: data.fitnessScore,
                });
            }
        } catch (err) {
            console.warn('⚠️ Could not load schedule from API, falling back to mock data:', err.message);
            setScheduleError(err.message);
        } finally {
            setScheduleLoading(false);
        }
    };

    // Automatically mark classes as completed when their time passes
    useEffect(() => {
        const checkAndUpdateClasses = () => {
            setEvents(prevEvents => {
                const updatedEvents = autoMarkCompletedClasses(prevEvents);
                return updatedEvents !== prevEvents ? updatedEvents : prevEvents;
            });
        };
        checkAndUpdateClasses();
        const interval = setInterval(checkAndUpdateClasses, 60000);
        return () => clearInterval(interval);
    }, []);

    // ----- LOGIN: authenticates against the backend -----
    const login = async (email, password, role, rollNo = '', studentDetails = null) => {
        // For students, use the new student-login API
        if (role === 'student') {
            try {
                const result = await studentLoginApi(rollNo, password);
                if (result.success && result.student) {
                    setIsAuthenticated(true);
                    setUserRole('student');
                    setStudentRollNo(result.student.rollNo);
                    setStudentProfile({
                        normalized: result.student.rollNo,
                        sectionName: result.student.sectionName,
                        sectionIndex: result.student.sectionIndex,
                        sectionLetter: result.student.sectionLetter,
                        branch: result.student.branch,
                        batchYear: result.student.batchYear,
                        campus: result.student.campus,
                        program: result.student.program,
                        yearCode: result.student.yearCode,
                        studentNumber: result.student.studentNumber,
                    });
                    setLoggedInUser(null);
                    return { success: true };
                }
                return { success: false, error: 'Unexpected response from server.' };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }

        // For teacher/admin, authenticate against MongoDB
        try {
            const result = await loginApi(email, password, role);
            if (result.success && result.user) {
                setIsAuthenticated(true);
                setUserRole(role);
                setLoggedInUser(result.user);
                setStudentRollNo('');
                setStudentProfile(null);

                // Merge real user data into currentTeacher so Dashboard/Sidebar/Reports reflect actual teacher
                if (result.user.role === 'Faculty') {
                    setCurrentTeacher(prev => ({
                        ...prev,
                        name: result.user.name || prev.name,
                        department: result.user.department || prev.department,
                        designation: result.user.rank || prev.designation,
                        email: result.user.email || prev.email,
                        officeRoom: result.user.officeLocation || prev.officeRoom,
                        phone: result.user.phone || prev.phone,
                    }));
                    loadScheduleForTeacher(result.user._id);
                } else {
                    loadFullSchedule();
                }

                return { success: true, user: result.user };
            }
            return { success: false, error: 'Unexpected response from server.' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserRole('');
        setStudentRollNo('');
        setStudentProfile(null);
        setLoggedInUser(null);
        setCurrentTeacher(CURRENT_TEACHER); // Reset to default mock data
        setEvents(getInitialTimetable());
        removeToken(); // Clear JWT from localStorage
    };

    const value = {
        events,
        setEvents,
        announcementsList,
        setAnnouncementsList,
        currentTeacher,
        setCurrentTeacher,
        isAuthenticated,
        userRole,
        login,
        logout,
        studentRollNo,
        studentProfile,
        scheduleLoading,
        scheduleError,
        scheduleMetadata,
        loggedInUser,
        loadScheduleForTeacher,
        loadFullSchedule,
        authLoading,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
