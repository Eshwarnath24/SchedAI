import React, { useState } from 'react';
import TimetableGrid from '../../components/TimetableGrid';
import { generateSchedule, TEACHERS } from '../../utils/mockData';
import StudentLayout from './Layout';

const TeachersTimeTable = () => {
    const [teacher, setTeacher] = useState(TEACHERS[0]);
    const teacherSchedule = generateSchedule(teacher);

    return (
        <StudentLayout>
            <TimetableGrid 
                title="Faculty Timetable" 
                schedule={teacherSchedule} 
                selectedEntity={teacher} 
                onEntityChange={setTeacher}
                entityList={TEACHERS}
                entityLabel="Select Faculty"
            />
        </StudentLayout>
    );
};

export default TeachersTimeTable;
