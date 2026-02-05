import { createContext, useState } from "react";
import { getInitialTimetable } from "../utils/timetableData";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const [events, setEvents] = useState(getInitialTimetable);

    const value = {
        events,
        setEvents,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

