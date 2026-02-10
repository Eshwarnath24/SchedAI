import React, { useContext, useMemo } from 'react';
import TimetableGrid from '../../components/TimetableGrid';
import { generateSchedule, SECTIONS } from '../../utils/mockData';
import StudentLayout from './Layout';
import { AppContext } from '../../context/AppContext';
import { getUpdatesForSection, getEffectedSchedule } from '../../utils/scheduleUpdates';
import AcademicInventoryTable from '../../components/AcademicInventoryTable';

const SectionTimeTable = () => {
    const { studentProfile } = useContext(AppContext);
    const derivedSection = studentProfile?.sectionName || SECTIONS[0];
    
    const sectionSchedule = useMemo(() => {
        const baseSchedule = generateSchedule(derivedSection);
        const updates = getUpdatesForSection(derivedSection);
        return getEffectedSchedule(baseSchedule, updates);
    }, [derivedSection]);

    return (
        <StudentLayout>
            <TimetableGrid 
                title="Class Timetable" 
                schedule={sectionSchedule} 
                selectedEntity={derivedSection}
                onEntityChange={() => {}}
                entityList={[derivedSection]}
                entityLabel="Your Section"
                selectorLocked
            />
            <AcademicInventoryTable />
        </StudentLayout>
    );
};

export default SectionTimeTable;
