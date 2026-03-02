const User = require('../DB_models/User');
const Workload = require('../DB_models/workload');
const Schedule = require('../DB_models/schedule');
const Course = require('../DB_models/Course');
const Section = require('../DB_models/Section');

// Helper to calculate duration in hours between two "HH:MM" strings
const calculateDuration = (start, end) => {
    if (!start || !end) return 1; // Default to 1 hour if missing
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startDate = new Date(0, 0, 0, startH, startM);
    const endDate = new Date(0, 0, 0, endH, endM);
    const diffMs = endDate - startDate;
    return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert ms to hours
};

exports.getFacultyReport = async (req, res) => {
    try {
        const { facultyId } = req.params;

        // 1. Fetch Faculty Details
        const faculty = await User.findById(facultyId).select('name department rank role');
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // 2. Fetch Workload Data
        // Use .lean() to bypass Mongoose strict mode filtering so we can access inputs not in the strict schema (like hoursConducted)
        const workloads = await Workload.find({ faculty: facultyId }).populate('course').lean();

        let totalWorkingHours = 0;
        let totalSyllabusProgress = 0;
        let totalAttendance = 0;
        let validWorkloadCount = 0;

        const inventory = [];

        // Processing workloads - Using Promise.all for parallel async operations
        await Promise.all(workloads.map(async (workload) => {
            // Stats Calculation
            // Priority: hoursConducted (from DB) > classesCompleted (proxy) > 0
            const hours = (workload.hoursConducted !== undefined && workload.hoursConducted !== null)
                ? workload.hoursConducted
                : (workload.classesCompleted || 0);

            totalWorkingHours += hours;

            if (workload.syllabusProgress !== undefined) {
                totalSyllabusProgress += workload.syllabusProgress;
            }

            if (workload.studentAttendanceAvg !== undefined) {
                totalAttendance += workload.studentAttendanceAvg;
            }
            validWorkloadCount++;

            // Inventory List Construction
            if (workload.course) {
                let sectionName = 'N/A';
                // Manual Section Lookup
                if (workload.section) {
                    try {
                        const sectionDoc = await Section.findById(workload.section);
                        if (sectionDoc) {
                            sectionName = sectionDoc.name;
                        } else {
                            // Fallback if section not found but ID exists
                            sectionName = workload.section.toString();
                        }
                    } catch (err) {
                        console.error(`Error fetching section ${workload.section}:`, err);
                        sectionName = 'Error';
                    }
                }

                inventory.push({
                    code: workload.course.code,
                    name: workload.course.name,
                    section: sectionName,
                    credits: workload.course.credits
                });
            }
        }));

        const averageSyllabusProgress = validWorkloadCount > 0 ? (totalSyllabusProgress / validWorkloadCount).toFixed(2) : 0;
        const averageStudentAttendance = validWorkloadCount > 0 ? (totalAttendance / validWorkloadCount).toFixed(2) : 0;

        // 3. Graph Data (Engagement Curve) from Schedule
        const activeSchedule = await Schedule.findOne({ isActive: true });

        const daysMap = {
            'Monday': 0,
            'Tuesday': 0,
            'Wednesday': 0,
            'Thursday': 0,
            'Friday': 0,
            'Saturday': 0
        };

        if (activeSchedule && activeSchedule.classes) {
            // Filter classes for strict faculty ID match
            const facultyClasses = activeSchedule.classes.filter(cls =>
                cls.faculty && cls.faculty.toString() === facultyId
            );

            facultyClasses.forEach(cls => {
                if (daysMap.hasOwnProperty(cls.day)) {
                    // Calculate actual duration instead of assuming 1 hour
                    const duration = calculateDuration(cls.startTime, cls.endTime);
                    daysMap[cls.day] += duration;
                }
            });
        }

        const graphData = {
            labels: Object.keys(daysMap),
            data: Object.values(daysMap)
        };

        // 4. Construct Final Response
        const responseData = {
            facultyDetails: {
                name: faculty.name,
                department: faculty.department,
                rank: faculty.rank
            },
            workloadStats: {
                totalWorkingHours,
                averageSyllabusProgress,
                averageStudentAttendance
            },
            inventory,
            engagementCurve: graphData
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error generating faculty report:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Export helper for unit testing
exports.calculateDuration = calculateDuration;
