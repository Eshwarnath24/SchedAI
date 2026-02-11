import React, { useContext, useState, useEffect } from 'react';
import TimetableGrid from '../../components/TimetableGrid';
import { SECTIONS } from '../../utils/mockData';
import StudentLayout from './Layout';
import { AppContext } from '../../context/AppContext';
import { fetchSectionSchedule, fetchSections } from '../../utils/api';
import AcademicInventoryTable from '../../components/AcademicInventoryTable';

const SectionTimeTable = () => {
    const { studentProfile } = useContext(AppContext);
    const [sections, setSections] = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [selectedSectionName, setSelectedSectionName] = useState('');
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(true);

    // Load all sections for the dropdown
    useEffect(() => {
        const loadSections = async () => {
            try {
                const data = await fetchSections();
                setSections(data);

                // Try to match student's section from profile
                const derivedName = studentProfile?.sectionName || '';
                const matched = data.find(s => s.name === derivedName);

                if (matched) {
                    setSelectedSectionId(matched._id);
                    setSelectedSectionName(matched.name);
                } else if (data.length > 0) {
                    setSelectedSectionId(data[0]._id);
                    setSelectedSectionName(data[0].name);
                }
            } catch (err) {
                console.warn('⚠️ Could not load sections from API, using mock data:', err.message);
                // Fallback: use mock sections
                setSections(SECTIONS.map((name, i) => ({ _id: `mock-${i}`, name })));
                setSelectedSectionName(studentProfile?.sectionName || SECTIONS[0]);
            }
        };
        loadSections();
    }, [studentProfile]);

    // Load the section's schedule when selected section changes
    useEffect(() => {
        if (!selectedSectionId) return;

        const loadSchedule = async () => {
            setLoading(true);
            try {
                const data = await fetchSectionSchedule(selectedSectionId);
                setSchedule(data.schedule || {});
            } catch (err) {
                console.warn('⚠️ Could not load section schedule:', err.message);
                setSchedule({});
            } finally {
                setLoading(false);
            }
        };
        loadSchedule();
    }, [selectedSectionId]);

    const handleSectionChange = (name) => {
        const section = sections.find(s => s.name === name);
        if (section) {
            setSelectedSectionId(section._id);
            setSelectedSectionName(section.name);
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
                    title="Class Timetable"
                    schedule={schedule}
                    selectedEntity={selectedSectionName}
                    onEntityChange={handleSectionChange}
                    entityList={sections.map(s => s.name)}
                    entityLabel="Section"
                />
            )}
            <AcademicInventoryTable />
        </StudentLayout>
    );
};

export default SectionTimeTable;
