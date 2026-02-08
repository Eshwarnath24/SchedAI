import { createContext, useState, useEffect } from "react";
import { getInitialTimetable, autoMarkCompletedClasses } from "../utils/timetableData";
import { announcements } from "../utils/announcements";
import { CURRENT_TEACHER } from "../utils/database";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const [events, setEvents] = useState(getInitialTimetable);
    const [announcementsList, setAnnouncementsList] = useState(announcements);
    const [currentTeacher, setCurrentTeacher] = useState(CURRENT_TEACHER);

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

    const value = {
        events,
        setEvents,
        announcementsList,
        setAnnouncementsList,
        currentTeacher,
        setCurrentTeacher,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

