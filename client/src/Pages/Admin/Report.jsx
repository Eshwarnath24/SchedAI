import React, { useState } from 'react';
import { 
  BookOpen, 
  FlaskConical, 
  GraduationCap, 
  CalendarDays, 
  Award, 
  TrendingUp,
  FileText,
  Clock,
  Briefcase,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  UserCheck,
  Printer,
  X,
  Download,
  Menu,
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import AdminSidebar from '../../components/AdminSidebar';

// --- MOCK DATA ---
const departmentMetrics = {
  department: "Computer Science and Engineering",
  period: "Academic Year 2025-2026",
  totalFaculty: 44,
  avgFeedback: 4.4,
  overallPassRate: 91,
  totalEventsOrganized: 156,
  avgAttendanceRate: 95.5
};

// Added 'hex' colors to leaves for the charts
const facultyList = [
  {
    id: 'f1',
    facultyName: "Dr. Arvind Krishnan",
    designation: "Associate Professor",
    overallMetrics: {
      avgStudentFeedback: 4.6,
      totalClassesConducted: 142,
      researchPapers: 3,
      overallPassPercentage: 94,
      attendanceRate: 96 
    },
    classes: [
      { id: 1, name: "Design and Analysis of Algorithms", type: "Theory", semester: "Fall", students: 65, avgPerformance: 78, passRate: 92, feedback: 4.5 },
      { id: 2, name: "Database Management Systems", type: "Theory", semester: "Fall", students: 62, avgPerformance: 82, passRate: 95, feedback: 4.7 },
    ],
    labs: [
      { id: 3, name: "Algorithms Lab", type: "Lab", semester: "Fall", students: 32, labExamAvg: 88, passRate: 100, feedback: 4.8 },
      { id: 4, name: "DBMS Lab", type: "Lab", semester: "Fall", students: 30, labExamAvg: 85, passRate: 98, feedback: 4.6 },
    ],
    leaves: [
      { type: "Casual Leave (CL)", taken: 4, total: 12, color: "bg-[#8A1538]", hex: "#8A1538" },
      { type: "Sick Leave (SL)", taken: 2, total: 10, color: "bg-red-500", hex: "#ef4444" },
      { type: "On Duty (OD)", taken: 8, total: 15, color: "bg-blue-600", hex: "#2563eb" },
    ],
    events: [
      { id: 1, title: "Intl Conference on Machine Learning", role: "Paper Presenter", date: "Nov 12-14, 2025", type: "Conference" },
      { id: 2, title: "Advanced React Workshop", role: "Coordinator", date: "Sep 05, 2025", type: "Workshop" },
    ]
  },
  {
    id: 'f2',
    facultyName: "Dr. Priya Sharma",
    designation: "Assistant Professor",
    overallMetrics: {
      avgStudentFeedback: 4.8,
      totalClassesConducted: 120,
      researchPapers: 5,
      overallPassPercentage: 97,
      attendanceRate: 98 
    },
    classes: [
      { id: 1, name: "Artificial Intelligence", type: "Theory", semester: "Fall", students: 55, avgPerformance: 85, passRate: 98, feedback: 4.9 },
    ],
    labs: [
      { id: 2, name: "AI & ML Lab", type: "Lab", semester: "Fall", students: 55, labExamAvg: 90, passRate: 100, feedback: 4.8 },
    ],
    leaves: [
      { type: "Casual Leave (CL)", taken: 1, total: 12, color: "bg-[#8A1538]", hex: "#8A1538" },
      { type: "Sick Leave (SL)", taken: 0, total: 10, color: "bg-red-500", hex: "#ef4444" },
      { type: "On Duty (OD)", taken: 12, total: 15, color: "bg-blue-600", hex: "#2563eb" },
    ],
    events: [
      { id: 1, title: "AI in Healthcare Summit", role: "Keynote Speaker", date: "Oct 20, 2025", type: "Conference" },
    ]
  },
  {
    id: 'f3',
    facultyName: "Dr. Rajesh Kumar",
    designation: "Professor",
    overallMetrics: {
      avgStudentFeedback: 4.3,
      totalClassesConducted: 110,
      researchPapers: 8,
      overallPassPercentage: 89,
      attendanceRate: 92
    },
    classes: [
      { id: 1, name: "Operating Systems", type: "Theory", semester: "Fall", students: 70, avgPerformance: 72, passRate: 85, feedback: 4.1 },
      { id: 2, name: "Computer Networks", type: "Theory", semester: "Fall", students: 68, avgPerformance: 75, passRate: 88, feedback: 4.4 },
    ],
    labs: [
      { id: 3, name: "OS & Networks Lab", type: "Lab", semester: "Fall", students: 35, labExamAvg: 80, passRate: 95, feedback: 4.5 },
    ],
    leaves: [
      { type: "Casual Leave (CL)", taken: 8, total: 12, color: "bg-[#8A1538]", hex: "#8A1538" },
      { type: "Sick Leave (SL)", taken: 4, total: 10, color: "bg-red-500", hex: "#ef4444" },
      { type: "On Duty (OD)", taken: 5, total: 15, color: "bg-blue-600", hex: "#2563eb" },
    ],
    events: [
      { id: 1, title: "Cybersecurity Symposium", role: "Panelist", date: "Jan 15, 2026", type: "Symposium" },
    ]
  },
  {
    id: 'f4',
    facultyName: "Dr. Sunitha V",
    designation: "Assistant Professor",
    overallMetrics: {
      avgStudentFeedback: 4.7,
      totalClassesConducted: 135,
      researchPapers: 2,
      overallPassPercentage: 96,
      attendanceRate: 99
    },
    classes: [
      { id: 1, name: "Cloud Computing", type: "Theory", semester: "Fall", students: 60, avgPerformance: 84, passRate: 97, feedback: 4.8 },
    ],
    labs: [
      { id: 2, name: "Cloud Tech Lab", type: "Lab", semester: "Fall", students: 60, labExamAvg: 89, passRate: 100, feedback: 4.6 },
    ],
    leaves: [
      { type: "Casual Leave (CL)", taken: 2, total: 12, color: "bg-[#8A1538]", hex: "#8A1538" },
      { type: "Sick Leave (SL)", taken: 1, total: 10, color: "bg-red-500", hex: "#ef4444" },
      { type: "On Duty (OD)", taken: 3, total: 15, color: "bg-blue-600", hex: "#2563eb" },
    ],
    events: [
      { id: 1, title: "AWS Cloud Practitioner Workshop", role: "Attendee", date: "Feb 10, 2026", type: "Workshop" },
      { id: 2, title: "Amrita Tech Fest", role: "Organizer", date: "Mar 01, 2026", type: "Event" },
    ]
  }
];

// --- COMPONENTS ---

const ProgressBar = ({ percentage, color = "bg-[#8A1538]" }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 mt-1.5">
    <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
  </div>
);

const MetricCard = ({ icon: Icon, title, value, subtitle, customBg, customText }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow print:shadow-none print:border-gray-300">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${customBg} ${customText} print:border print:border-gray-200`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

// --- MODAL COMPONENT ---
const ReportPreviewModal = ({ faculty, onClose }) => {
  if (!faculty) return null;

  // Prepare chart data
  const performanceData = [
    ...faculty.classes.map(c => ({
      name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
      fullName: c.name,
      PassRate: c.passRate,
      AvgScore: c.avgPerformance,
      Type: 'Theory'
    })),
    ...faculty.labs.map(l => ({
      name: l.name.length > 15 ? l.name.substring(0, 15) + '...' : l.name,
      fullName: l.name,
      PassRate: l.passRate,
      AvgScore: l.labExamAvg,
      Type: 'Lab'
    }))
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 md:p-6 print:p-0 print:bg-white">
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden print:shadow-none print:h-auto print:max-h-none print:w-full">
        
        {/* Header (Non-printable actions) */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 print:hidden">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#8A1538]" />
            Report Preview: {faculty.facultyName}
          </h2>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-[#8A1538] text-white text-sm font-semibold rounded-lg hover:bg-[#6e102c] transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Save as PDF / Print
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Content area */}
        <div className="overflow-y-auto p-8 print:p-0 print:overflow-visible custom-scrollbar print:text-black">
          
          {/* Print Header (Amrita Branded) */}
          <div className="border-b-4 border-[#8A1538] pb-6 mb-8 text-center print:pt-4">
            <h1 className="text-3xl font-black text-[#8A1538] uppercase tracking-wide">Amrita Vishwa Vidyapeetham</h1>
            <h2 className="text-xl font-semibold text-gray-700 mt-2">Faculty Performance & Appraisal Report</h2>
            <p className="text-gray-500 mt-1">{departmentMetrics.period}</p>
          </div>

          {/* Section 1: Faculty Profile */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 print:bg-white print:border-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Faculty Name</p>
                <p className="font-bold text-gray-900 text-lg">{faculty.facultyName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Designation</p>
                <p className="font-bold text-gray-900 text-lg">{faculty.designation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Department</p>
                <p className="font-bold text-gray-900 text-lg">{departmentMetrics.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Overall Feedback</p>
                <p className="font-bold text-[#8A1538] text-lg">{faculty.overallMetrics.avgStudentFeedback} / 5.0</p>
              </div>
            </div>
          </div>

          {/* Section 2: Core Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard icon={BookOpen} title="Classes Taken" value={faculty.overallMetrics.totalClassesConducted} customBg="bg-blue-50" customText="text-blue-700" />
            <MetricCard icon={TrendingUp} title="Overall Pass %" value={`${faculty.overallMetrics.overallPassPercentage}%`} customBg="bg-green-50" customText="text-green-700" />
            <MetricCard icon={UserCheck} title="Attendance Rate" value={`${faculty.overallMetrics.attendanceRate}%`} customBg="bg-rose-50" customText="text-[#8A1538]" />
            <MetricCard icon={FileText} title="Research Papers" value={faculty.overallMetrics.researchPapers} customBg="bg-amber-50" customText="text-amber-700" />
          </div>

          {/* Section 3: Graphical Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Performance Bar Chart */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 print:border-2 print:break-inside-avoid">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Course-wise Performance Breakdown</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#6B7280'}} />
                    <YAxis tick={{fontSize: 12, fill: '#6B7280'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                    <Bar dataKey="PassRate" name="Pass Rate (%)" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="AvgScore" name="Avg Score (%)" fill="#8A1538" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leaves Pie Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 print:border-2 print:break-inside-avoid">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Leave Utilization</h3>
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={faculty.leaves}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="taken"
                    >
                      {faculty.leaves.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.hex} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {faculty.leaves.map((l, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: l.hex }}></span>
                      <span className="text-gray-600">{l.type.split(' ')[0]}</span>
                    </div>
                    <span className="font-bold">{l.taken} <span className="text-gray-400 font-normal">/ {l.total}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Tabular Data (Events) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 print:border-2 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Professional Development (Events & Workshops)</h3>
            {faculty.events.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Event Name</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {faculty.events.map((event) => (
                    <tr key={event.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{event.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{event.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{event.role}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{event.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 italic">No events or workshops recorded for this period.</p>
            )}
          </div>
          
          {/* Print Footer */}
          <div className="hidden print:block mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">System Generated Report • Amrita Academic Management System</p>
            <p className="text-sm text-gray-500 mt-1">Date Generated: {new Date().toLocaleDateString()}</p>
          </div>

        </div>
      </div>
    </div>
  );
};


const FacultyCard = ({ faculty }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={`bg-white rounded-xl border ${isExpanded ? 'border-[#8A1538] shadow-md' : 'border-gray-200 shadow-sm'} overflow-hidden transition-all duration-300 print:hidden`}>
        {/* Faculty Summary Header (Clickable) */}
        <div 
          className="p-5 cursor-pointer hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-[#8A1538] flex items-center justify-center font-bold text-lg">
              {faculty.facultyName.split(' ').map(n => n[0]).join('').substring(0,2)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{faculty.facultyName}</h3>
              <p className="text-sm text-gray-500">{faculty.designation}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="text-center hidden sm:block">
              <p className="text-xs text-gray-500">Feedback</p>
              <p className="font-semibold text-gray-900">{faculty.overallMetrics.avgStudentFeedback} <span className="text-xs text-gray-400">/ 5</span></p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-xs text-gray-500">Pass Rate</p>
              <p className="font-semibold text-gray-900">{faculty.overallMetrics.overallPassPercentage}%</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-xs text-gray-500">Classes</p>
              <p className="font-semibold text-gray-900">{faculty.overallMetrics.totalClassesConducted}</p>
            </div>
            <div className="text-center border-l border-gray-200 pl-4 md:pl-8">
              <p className="text-xs text-gray-500">Attendance</p>
              <p className="font-semibold text-[#8A1538]">{faculty.overallMetrics.attendanceRate}%</p>
            </div>
            
            {/* Action Buttons (Expand) */}
            <div className="flex items-center gap-1 border-l border-gray-200 pl-2 md:pl-4">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Detailed View */}
        {isExpanded && (
          <div className="border-t border-gray-100 bg-slate-50 p-6">
            
            {/* ACTION BAR IN EXPANDED VIEW */}
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => setShowModal(true)}
                className="bg-white border-2 border-[#8A1538] text-[#8A1538] hover:bg-[#8A1538] hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center shadow-sm"
              >
                <Printer className="w-4 h-4 mr-2" />
                Generate Report
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Academic Performance */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Theory Classes */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-[#8A1538]" />
                      Theory Courses Performance
                    </h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {faculty.classes.map((cls) => (
                      <div key={cls.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">{cls.name}</h5>
                            <p className="text-xs text-gray-500">{cls.semester} • {cls.students} Students</p>
                          </div>
                          <span className="bg-rose-50 text-[#8A1538] text-xs px-2 py-1 rounded-full font-medium border border-rose-100">
                            Feedback: {cls.feedback}/5
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Avg Score</span>
                              <span className="font-medium">{cls.avgPerformance}%</span>
                            </div>
                            <ProgressBar percentage={cls.avgPerformance} color="bg-[#8A1538]" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Pass Rate</span>
                              <span className="font-medium text-green-600">{cls.passRate}%</span>
                            </div>
                            <ProgressBar percentage={cls.passRate} color="bg-green-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Labs */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center">
                      <FlaskConical className="w-4 h-4 mr-2 text-blue-800" />
                      Laboratory Performance
                    </h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {faculty.labs.map((lab) => (
                      <div key={lab.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">{lab.name}</h5>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Lab Exam Avg</span>
                              <span className="font-medium">{lab.labExamAvg}%</span>
                            </div>
                            <ProgressBar percentage={lab.labExamAvg} color="bg-blue-700" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">Clearance Rate</span>
                              <span className="font-medium text-green-600">{lab.passRate}%</span>
                            </div>
                            <ProgressBar percentage={lab.passRate} color="bg-green-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Leaves & Events */}
              <div className="space-y-6">
                
                {/* Leaves */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-600" />
                      Leave Utilization
                    </h4>
                  </div>
                  <div className="p-4 space-y-4">
                    {faculty.leaves.map((leave, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-medium text-gray-700">{leave.type}</span>
                          <span className="text-gray-500">
                            <strong className="text-gray-900">{leave.taken}</strong>/{leave.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`${leave.color} h-1.5 rounded-full`} 
                            style={{ width: `${(leave.taken / leave.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-amber-600" />
                      Events & Workshops
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {faculty.events.map((event) => (
                      <div key={event.id} className="border-l-2 border-amber-400 pl-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700">
                            {event.type}
                          </span>
                        </div>
                        <h5 className="font-medium text-gray-900 text-xs leading-tight mb-1">{event.title}</h5>
                        <p className="text-[11px] text-gray-500">{event.role} • {event.date}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* Render the Modal separately from the main card structure to avoid layout shifts */}
      {showModal && (
        <ReportPreviewModal faculty={faculty} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default function FacultyReviewReport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredFaculty = facultyList.filter(f => 
    f.facultyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden print:block print:h-auto">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden print:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:relative inset-y-0 left-0 w-72 md:w-[312px] bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 transform print:hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      <main className="flex-1 overflow-y-auto w-full relative print:overflow-visible print:h-auto">
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#8B0000] rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="font-bold text-slate-800">Admin Reports</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
        </header>

        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen print:bg-white print:p-0 print:min-h-0">
      
      {/* 1. DEPARTMENT OVERVIEW HEADER */}
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {/* Decorative block for Amrita Theme */}
              <div className="w-2 h-8 bg-[#8A1538] rounded-sm"></div>
              <h1 className="text-3xl font-extrabold text-[#8A1538] tracking-tight">Department Review Report</h1>
            </div>
            <p className="text-gray-500 mt-2 flex items-center text-sm md:text-base ml-5">
              {departmentMetrics.department} 
              <span className="mx-2">•</span> 
              <CalendarDays className="w-4 h-4 mr-1.5" /> {departmentMetrics.period}
            </p>
          </div>
          {/* Global Print button has been removed as requested */}
        </div>

        {/* Aggregate Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard 
            icon={Users} title="Total Faculty Evaluated" value={departmentMetrics.totalFaculty} 
            subtitle="Active members this year" customBg="bg-blue-50" customText="text-blue-700" 
          />
          <MetricCard 
            icon={GraduationCap} title="Avg Dept Feedback" value={`${departmentMetrics.avgFeedback}/5.0`} 
            subtitle="Aggregated rating" customBg="bg-green-50" customText="text-green-700" 
          />
          <MetricCard 
            icon={TrendingUp} title="Overall Dept Pass Rate" value={`${departmentMetrics.overallPassRate}%`} 
            subtitle="Across courses & labs" customBg="bg-blue-50" customText="text-blue-600" 
          />
          <MetricCard 
            icon={UserCheck} title="Avg Attendance Rate" value={`${departmentMetrics.avgAttendanceRate}%`} 
            subtitle="Department average" customBg="bg-rose-50" customText="text-[#8A1538]" 
          />
          <MetricCard 
            icon={Award} title="Events & Workshops" value={departmentMetrics.totalEventsOrganized} 
            subtitle="Cumulative count" customBg="bg-amber-50" customText="text-amber-700" 
          />
        </div>
      </div>

      <hr className="border-gray-200 print:hidden" />

      {/* 2. INDIVIDUAL FACULTY SECTION */}
      <div className="print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            Individual Faculty Appraisals
          </h2>
          
          {/* Search/Filter Box */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8A1538] focus:border-[#8A1538] sm:text-sm transition-all shadow-sm"
              placeholder="Search faculty by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Faculty List (Expandable Cards) */}
        <div className="space-y-4">
          {filteredFaculty.map((faculty) => (
            <FacultyCard key={faculty.id} faculty={faculty} />
          ))}
          
          {filteredFaculty.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No faculty found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

        </div>
      </main>
    </div>
  );
}