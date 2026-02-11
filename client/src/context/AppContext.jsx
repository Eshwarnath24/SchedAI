import { createContext, useState, useEffect } from "react";
import { getInitialTimetable, autoMarkCompletedClasses } from "../utils/timetableData";
import { announcements } from "../utils/announcements";
import { CURRENT_TEACHER } from "../utils/database";
import { parseStudentRollNumber } from "../utils/rollNumber";
import { loginApi, fetchActiveSchedule, fetchTeacherSchedule } from "../utils/api";

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
                            status: 'scheduled',
                            faculty: courseObj.faculty || '',
                            facultyId: courseObj.facultyId || null,
                            sectionId: courseObj.sectionId || null,
                        });
                    });
                });
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
                            status: 'scheduled',
                            faculty: courseObj.faculty || '',
                            facultyId: courseObj.facultyId || null,
                            sectionId: courseObj.sectionId || null,
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
        // For students, skip DB auth (they aren't in the User collection)
        if (role === 'student') {
            const parsedDetails = studentDetails || parseStudentRollNumber(rollNo);
            if (!parsedDetails) {
                return {
                    success: false,
                    error: 'Invalid student roll number format. Expected format similar to CB.SC.U4CSE23XXX.',
                };
            }
            setIsAuthenticated(true);
            setUserRole(role);
            setStudentRollNo(parsedDetails.normalized);
            setStudentProfile(parsedDetails);
            setLoggedInUser(null);
            return { success: true };
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
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
