import React, { useState, useEffect } from 'react';
import TimetableGrid from '../../components/TimetableGrid';
import { TEACHERS } from '../../utils/mockData';
import StudentLayout from './Layout';
import { fetchTeacherSchedule, fetchTeachers } from '../../utils/api';

const TeachersTimeTable = () => {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const [selectedTeacherName, setSelectedTeacherName] = useState('');
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(true);

    // Load all teachers for the dropdown
    useEffect(() => {
        const loadTeachers = async () => {
            try {
                const data = await fetchTeachers();
                setTeachers(data);
                if (data.length > 0) {
                    setSelectedTeacherId(data[0]._id);
                    setSelectedTeacherName(data[0].name);
                }
            } catch (err) {
                console.warn('⚠️ Could not load teachers from API, using mock data:', err.message);
                // Fallback to mock teachers
                setTeachers(TEACHERS.map((name, i) => ({ _id: `mock-${i}`, name })));
                setSelectedTeacherName(TEACHERS[0]);
            }
        };
        loadTeachers();
    }, []);

    // Load the teacher's schedule when selection changes
    useEffect(() => {
        if (!selectedTeacherId) return;

        const loadSchedule = async () => {
            setLoading(true);
            try {
                const data = await fetchTeacherSchedule(selectedTeacherId);
                setSchedule(data.schedule || {});
            } catch (err) {
                console.warn('⚠️ Could not load teacher schedule:', err.message);
                setSchedule({});
            } finally {
                setLoading(false);
            }
        };
        loadSchedule();
    }, [selectedTeacherId]);

    const handleTeacherChange = (name) => {
        const teacher = teachers.find(t => t.name === name);
        if (teacher) {
            setSelectedTeacherId(teacher._id);
            setSelectedTeacherName(teacher.name);
        }
    };

    return (
        <StudentLayout>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500 text-lg font-medium animate-pulse">Loading timetable...</div>
                </div>
            ) : (
                <TimetableGrid
                    title="Faculty Timetable"
                    schedule={schedule}
                    selectedEntity={selectedTeacherName}
                    onEntityChange={handleTeacherChange}
                    entityList={teachers.map(t => t.name)}
                    entityLabel="Select Faculty"
                />
            )}
        </StudentLayout>
    );
};

export default TeachersTimeTable;
