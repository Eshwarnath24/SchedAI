/**
 * dashboardController.js
 * 
 * Dynamic data aggregation service for Faculty Dashboard.
 * Provides real-time KPI metrics and visualizations from MongoDB.
 * 
 * Features:
 *  - Workload visualization (Theory/Lab/CIR hours)
 *  - Class completion tracking
 *  - Real-time schedule overview
 *  - Leave & request status
 *  - Advanced efficiency metrics & engagement curves
 * 
 * Constraint: Read-only operations - does not trigger scheduling algorithms.
 * 
 * Updated: Uses optimized FacultyDataAggregationService for performance
 */

const mongoose = require('mongoose');
const FacultyDataAggregationService = require('../services/facultyDataAggregationService');
const Schedule = require('../DB_models/schedule');
const Workload = require('../DB_models/workload');
const Course = require('../DB_models/Course');
const LeaveRequest = require('../DB_models/leaveRequest');
const User = require('../DB_models/User');
const Section = require('../DB_models/Section');

/**
 * Get comprehensive dashboard data for a faculty member
 * 
 * @route GET /api/dashboard/:facultyId
 * @access Protected (Faculty only)
 */
exports.getFacultyDashboard = async (req, res) => {
    try {
        const { facultyId } = req.params;

        // Validate faculty ID
        if (!mongoose.Types.ObjectId.isValid(facultyId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid faculty ID format' 
            });
        }

        // Use optimized aggregation service for maximum performance
        const dashboardData = await FacultyDataAggregationService.getFacultyAnalytics(facultyId);

        res.json(dashboardData);

    } catch (error) {
        console.error('[dashboardController] Error in getFacultyDashboard:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to retrieve dashboard data',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY AGGREGATION FUNCTIONS (Kept for backward compatibility)
// ═══════════════════════════════════════════════════════════════════════════
// Note: New implementations should use FacultyDataAggregationService directly

/**
 * Aggregate workload visualization data
 * Calculates Theory/Lab/Admin hours from Workload and Course models
 */
async function aggregateWorkloadVisualization(facultyId) {
    try {
        // Get active schedule
        const activeSchedule = await Schedule.findOne({ isActive: true })
            .populate({
                path: 'classes.course',
                select: 'code name type duration credits'
            })
            .populate({
                path: 'classes.section',
                select: 'name'
            });

        if (!activeSchedule) {
            return {
                totalCourses: 0,
                totalWeeklyHours: 0,
                hoursByType: { Theory: 0, Lab: 0, Admin: 0 },
                courseBreakdown: []
            };
        }

        // Filter classes assigned to this faculty
        const facultyClasses = activeSchedule.classes.filter(
            cls => cls.faculty && cls.faculty.toString() === facultyId
        );

        // Aggregate hours by course type
        const hoursByType = { Theory: 0, Lab: 0, Admin: 0 };
        const coursesMap = new Map();

        facultyClasses.forEach(cls => {
            if (!cls.course) return;

            const courseType = cls.course.type || 'Theory';
            const duration = cls.course.duration || 1;

            // Add to type totals
            hoursByType[courseType] = (hoursByType[courseType] || 0) + duration;

            // Track unique courses
            const courseKey = cls.course._id.toString();
            if (!coursesMap.has(courseKey)) {
                coursesMap.set(courseKey, {
                    courseId: cls.course._id,
                    code: cls.course.code,
                    name: cls.course.name,
                    type: courseType,
                    credits: cls.course.credits,
                    weeklyHours: 0,
                    sections: new Set()
                });
            }

            const courseData = coursesMap.get(courseKey);
            courseData.weeklyHours += duration;
            if (cls.section) {
                courseData.sections.add(cls.section.name);
            }
        });

        // Convert map to array and format sections
        const courseBreakdown = Array.from(coursesMap.values()).map(course => ({
            ...course,
            sections: Array.from(course.sections)
        }));

        const totalWeeklyHours = Object.values(hoursByType).reduce((sum, h) => sum + h, 0);

        return {
            totalCourses: coursesMap.size,
            totalWeeklyHours,
            hoursByType,
            courseBreakdown
        };

    } catch (error) {
        console.error('[aggregateWorkloadVisualization] Error:', error);
        throw error;
    }
}

/**
 * Aggregate today's schedule and upcoming classes
 */
async function aggregateScheduleOverview(facultyId) {
    try {
        const activeSchedule = await Schedule.findOne({ isActive: true })
            .populate({
                path: 'classes.course',
                select: 'code name type'
            })
            .populate({
                path: 'classes.room',
                select: 'name building capacity'
            })
            .populate({
                path: 'classes.section',
                select: 'name studentCount'
            });

        if (!activeSchedule) {
            return {
                todayClasses: [],
                upcomingClasses: [],
                todayClassesCount: 0,
                currentDay: getCurrentDayName()
            };
        }

        const currentDay = getCurrentDayName();
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        // Filter today's classes for this faculty
        const todayClasses = activeSchedule.classes
            .filter(cls => 
                cls.faculty && 
                cls.faculty.toString() === facultyId &&
                cls.day === currentDay
            )
            .map(cls => {
                const startTimeParts = cls.startTime.split(':');
                const startMinutes = parseInt(startTimeParts[0]) * 60 + parseInt(startTimeParts[1]);
                const isUpcoming = startMinutes > currentTimeInMinutes;
                const isPast = startMinutes <= currentTimeInMinutes;

                return {
                    slotIndex: cls.slotIndex,
                    day: cls.day,
                    startTime: cls.startTime,
                    endTime: cls.endTime,
                    courseCode: cls.course?.code || 'N/A',
                    courseName: cls.course?.name || 'Unknown Course',
                    courseType: cls.course?.type || 'Theory',
                    room: cls.room?.name || 'TBA',
                    building: cls.room?.building || '',
                    section: cls.section?.name || 'N/A',
                    studentCount: cls.section?.studentCount || 0,
                    isUpcoming,
                    isPast
                };
            })
            .sort((a, b) => {
                const timeA = a.startTime.split(':').map(Number);
                const timeB = b.startTime.split(':').map(Number);
                return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
            });

        // Get upcoming classes (not yet started)
        const upcomingClasses = todayClasses.filter(cls => cls.isUpcoming);

        return {
            todayClasses,
            upcomingClasses,
            todayClassesCount: todayClasses.length,
            currentDay
        };

    } catch (error) {
        console.error('[aggregateScheduleOverview] Error:', error);
        throw error;
    }
}

/**
 * Aggregate leave request status
 */
async function aggregateLeaveStatus(facultyId) {
    try {
        // Get all leave requests for this faculty
        const leaveRequests = await LeaveRequest.find({ faculty: facultyId })
            .sort({ createdAt: -1 })
            .limit(10);

        // Count by status
        const statusCounts = leaveRequests.reduce((acc, leave) => {
            acc[leave.status.toLowerCase()] = (acc[leave.status.toLowerCase()] || 0) + 1;
            return acc;
        }, { pending: 0, approved: 0, rejected: 0 });

        // Format recent leaves
        const recentLeaves = leaveRequests.slice(0, 5).map(leave => ({
            id: leave._id,
            fromDate: leave.fromDate,
            toDate: leave.toDate,
            type: leave.type,
            status: leave.status,
            reason: leave.reason,
            createdAt: leave.createdAt
        }));

        return {
            pendingCount: statusCounts.pending,
            approvedCount: statusCounts.approved,
            rejectedCount: statusCounts.rejected,
            totalRequests: leaveRequests.length,
            recentLeaves
        };

    } catch (error) {
        console.error('[aggregateLeaveStatus] Error:', error);
        throw error;
    }
}

/**
 * Aggregate completion tracking data
 * Compares target hours vs completed hours
 */
async function aggregateCompletionTracking(facultyId) {
    try {
        // Get workload entries for this faculty
        const workloadEntries = await Workload.find({ faculty: facultyId })
            .populate('course', 'code name credits minWeeklyHours')
            .populate('section', 'name');

        if (workloadEntries.length === 0) {
            return {
                overallCompletionRate: 0,
                courseCompletionRates: [],
                targetVsActual: { target: 0, actual: 0 }
            };
        }

        // Calculate completion rates per course
        const courseCompletionRates = workloadEntries.map(entry => {
            const targetHours = entry.totalClassesScheduled || 1; // Avoid division by zero
            const completedHours = entry.classesCompleted || 0;
            const completionRate = Math.round((completedHours / targetHours) * 100);

            return {
                courseId: entry.course._id,
                courseCode: entry.course.code,
                courseName: entry.course.name,
                section: entry.section?.name || 'N/A',
                targetHours,
                completedHours,
                completionRate,
                syllabusProgress: entry.syllabusProgress || 0,
                attendanceAvg: entry.studentAttendanceAvg || 0
            };
        });

        // Calculate overall metrics
        const totalTarget = workloadEntries.reduce((sum, e) => sum + (e.totalClassesScheduled || 0), 0);
        const totalCompleted = workloadEntries.reduce((sum, e) => sum + (e.classesCompleted || 0), 0);
        const overallCompletionRate = totalTarget > 0 
            ? Math.round((totalCompleted / totalTarget) * 100) 
            : 0;

        return {
            overallCompletionRate,
            courseCompletionRates,
            targetVsActual: {
                target: totalTarget,
                actual: totalCompleted
            }
        };

    } catch (error) {
        console.error('[aggregateCompletionTracking] Error:', error);
        throw error;
    }
}

/**
 * Aggregate efficiency metrics
 * Calculates engagement curves and efficiency gauges
 */
async function aggregateEfficiencyMetrics(facultyId) {
    try {
        const activeSchedule = await Schedule.findOne({ isActive: true })
            .populate('classes.course', 'type duration');

        if (!activeSchedule) {
            return {
                classDistribution: [],
                engagementScore: 0,
                utilizationRate: 0,
                consecutiveHoursMetric: 0,
                weeklyDistribution: []
            };
        }

        // Filter faculty classes
        const facultyClasses = activeSchedule.classes.filter(
            cls => cls.faculty && cls.faculty.toString() === facultyId
        );

        // Calculate class distribution by day
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const distributionMap = new Map();
        
        daysOfWeek.forEach(day => {
            distributionMap.set(day, { day, classes: 0, hours: 0 });
        });

        facultyClasses.forEach(cls => {
            if (distributionMap.has(cls.day)) {
                const dayData = distributionMap.get(cls.day);
                dayData.classes += 1;
                dayData.hours += cls.course?.duration || 1;
            }
        });

        const classDistribution = Array.from(distributionMap.values());

        // Calculate engagement score (0-100)
        // Higher score = more evenly distributed workload across week
        const dailyHours = classDistribution.map(d => d.hours);
        const avgHours = dailyHours.reduce((sum, h) => sum + h, 0) / dailyHours.length;
        const variance = dailyHours.reduce((sum, h) => sum + Math.pow(h - avgHours, 2), 0) / dailyHours.length;
        const standardDeviation = Math.sqrt(variance);
        const engagementScore = Math.max(0, Math.min(100, 100 - (standardDeviation * 10)));

        // Calculate utilization rate (percentage of available slots used)
        const totalAvailableSlots = 5 * 8; // 5 days * 8 slots per day
        const utilizationRate = Math.round((facultyClasses.length / totalAvailableSlots) * 100);

        // Calculate consecutive hours metric
        // Measures how well classes are grouped together (higher = better)
        let consecutiveGroups = 0;
        const classesByDay = new Map();
        
        facultyClasses.forEach(cls => {
            if (!classesByDay.has(cls.day)) {
                classesByDay.set(cls.day, []);
            }
            classesByDay.get(cls.day).push(cls.slotIndex);
        });

        classesByDay.forEach(slots => {
            slots.sort((a, b) => a - b);
            let currentGroup = 1;
            for (let i = 1; i < slots.length; i++) {
                if (slots[i] === slots[i - 1] + 1) {
                    currentGroup++;
                } else {
                    consecutiveGroups++;
                    currentGroup = 1;
                }
            }
            if (currentGroup > 1) consecutiveGroups++;
        });

        const consecutiveHoursMetric = facultyClasses.length > 0 
            ? Math.round((consecutiveGroups / facultyClasses.length) * 100)
            : 0;

        // Weekly distribution for chart
        const weeklyDistribution = classDistribution.map(d => ({
            day: d.day.substring(0, 3),
            classes: d.classes,
            hours: d.hours
        }));

        return {
            classDistribution,
            engagementScore: Math.round(engagementScore),
            utilizationRate,
            consecutiveHoursMetric,
            weeklyDistribution
        };

    } catch (error) {
        console.error('[aggregateEfficiencyMetrics] Error:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current day name
 */
function getCurrentDayName() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
}

module.exports = exports;
