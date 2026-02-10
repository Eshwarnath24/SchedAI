import { createContext, useState, useEffect } from "react";
import { getInitialTimetable, autoMarkCompletedClasses } from "../utils/timetableData";
import { announcements } from "../utils/announcements";
import { CURRENT_TEACHER } from "../utils/database";
import { parseStudentRollNumber } from "../utils/rollNumber";

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

    // Automatically mark classes as completed when their time passes
    useEffect(() => {
        const checkAndUpdateClasses = () => {
            setEvents(prevEvents => {
                const updatedEvents = autoMarkCompletedClasses(prevEvents);
                // Only update state if there were actual changes
                return updatedEvents !== prevEvents ? updatedEvents : prevEvents;
            });
        };

        // Check immediately on mount
        checkAndUpdateClasses();

        // Then check every minute
        const interval = setInterval(checkAndUpdateClasses, 60000);

        return () => clearInterval(interval);
    }, []);

    const login = (email, password, role, rollNo = '', studentDetails = null) => {
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

            return { success: true };
        }

        setIsAuthenticated(true);
        setUserRole(role);
        setStudentRollNo('');
        setStudentProfile(null);

        return { success: true };
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserRole('');
        setStudentRollNo('');
        setStudentProfile(null);
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
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

