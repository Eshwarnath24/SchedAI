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
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);

    // The student's section name derived from their roll number
    const studentSectionName = studentProfile?.sectionName || '';

    // Load sections and auto-select the student's own section
    useEffect(() => {
        const loadSections = async () => {
            try {
                const data = await fetchSections();
                setSections(data);

                // Match the student's section from their roll number profile
                const matched = data.find(s => s.name === studentSectionName);

                if (matched) {
                    setSelectedSectionId(matched._id);
                    setSelectedSectionName(matched.name);
                } else if (data.length > 0) {
                    // Fallback: if no exact match, try partial match
                    const partialMatch = data.find(s =>
                        s.name.includes(studentProfile?.sectionLetter || '') &&
                        s.name.includes(studentProfile?.branch || '')
                    );
                    if (partialMatch) {
                        setSelectedSectionId(partialMatch._id);
                        setSelectedSectionName(partialMatch.name);
                    } else {
                        // Ultimate fallback: first section
                        setSelectedSectionId(data[0]._id);
                        setSelectedSectionName(data[0].name);
                    }
                }
            } catch (err) {
                console.warn('⚠️ Could not load sections from API, using mock data:', err.message);
                // Fallback: use mock sections
                setSections(SECTIONS.map((name, i) => ({ _id: `mock-${i}`, name })));
                setSelectedSectionName(studentSectionName || SECTIONS[0]);
            }
        };
        loadSections();
    }, [studentProfile, studentSectionName]);

    // Load the section's schedule when selected section changes
    useEffect(() => {
        if (!selectedSectionId) return;

        const loadSchedule = async () => {
            setLoading(true);
            try {
                const data = await fetchSectionSchedule(selectedSectionId);
                setSchedule(data.schedule || {});
                setMentor(data.mentor || null);
            } catch (err) {
                console.warn('⚠️ Could not load section schedule:', err.message);
                setSchedule({});
                setMentor(null);
            } finally {
                setLoading(false);
            }
        };
        loadSchedule();
    }, [selectedSectionId]);

    return (
        <StudentLayout>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500 text-lg font-medium animate-pulse">Loading timetable...</div>
                </div>
            ) : (
                <>
                    <TimetableGrid
                        title="Class Timetable"
                        schedule={schedule}
                        selectedEntity={selectedSectionName}
                        onEntityChange={() => { }}
                        entityList={[selectedSectionName]}
                        entityLabel="Section"
                        selectorLocked={true}
                        mentorInfo={sections.find(s => s.name === selectedSectionName)?.mentor?.name || null}
                    />
                </>
            )}
            <AcademicInventoryTable />
        </StudentLayout>
    );
};

export default SectionTimeTable;
