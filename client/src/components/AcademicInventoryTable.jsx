import React from 'react';
import { BookOpen, Monitor, Beaker } from 'lucide-react';

const COURSES_DATA = {
    theory: [
        { code: '23CSE311', name: 'Software Engineering', faculty: 'Ms. P. Malathi' },
        { code: '23CSE312', name: 'Distributed Systems', faculty: 'Dr. B A Sabarish' },
        { code: '23CSE313', name: 'Foundations of Cyber Security', faculty: 'Dr. Lalithamani N' },
        { code: '23CSE314', name: 'Compiler Design', faculty: 'Dr. Deepika T' },
        { code: '23CSE399', name: 'Project Phase-1', faculty: 'Multiple Faculty' },
        { code: '23LSE311', name: 'Life Skills for Engineers IV', faculty: 'Mr. Bhaskaran Venkatraman, Mr. Krishnan T E, Ms. M Anitha' }
    ],
    electives: [
        { code: '23CSE475', name: 'Generative AI', faculty: 'Dr. C. Shunmuga Velayutham' },
        { code: '23CSE461', name: 'Full Stack Frameworks', faculty: 'Dr. T.Senthil Kumar' },
        { code: '23CSE465', name: 'Mobile Application Development', faculty: 'Ms. Radhika G' },
        { code: '23CSE363', name: 'Cloud Computing', faculty: 'Dr. Uma J' },
        { code: '23CSE473', name: 'Neural Networks and Deep Learning', faculty: 'Dr. Aarthi. R' },
        { code: '23CSE452', name: 'Business Analytics', faculty: 'Mr. Vedaj J Padman' },
        { code: '23CSE334', name: 'Cyber Forensics and Malware', faculty: 'Mr. Arjun.P.K' },
        { code: '23CSE365', name: 'Internet of Things', faculty: 'Dr. Vishnu S' }
    ],
    labs: [
        { code: '23CSE311', name: 'Software Engineering', incharge: 'Ms. P. Malathi', assisting: 'Dr. Jeyakumar G, Ms. Nasiya.PM' },
        { code: '23CSE312', name: 'Distributed Systems', incharge: 'Dr. B A Sabarish', assisting: 'Dr. C Shunmuga Velayutham, Mr. Arjun' }
    ]
};

const SectionHeader = ({ title, icon: Icon }) => (
    <div className="py-4 px-6 bg-[#A41034] rounded-t-xl border-b border-[#8a0d2b] flex items-center gap-3">
        {Icon && <Icon className="text-white/90 w-5 h-5" />}
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">{title}</h3>
    </div>
);

const AcademicInventoryTable = () => {
    return (
        <div className="space-y-8 animate-fade-in mt-6">
            <h2 className="text-xl font-bold text-gray-800">Course Details</h2>
            
            {/* Theory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <SectionHeader title="Theory Courses" icon={BookOpen} />
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-xs font-bold text-gray-800 uppercase border-b border-gray-100">
                                <th className="p-4 w-32 text-[#A41034]">Course Code</th>
                                <th className="p-4">Course Name</th>
                                <th className="p-4">Faculty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {COURSES_DATA.theory.map((course, idx) => (
                                <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                                    <td className="p-4 text-sm font-bold text-[#A41034]">{course.code}</td>
                                    <td className="p-4 text-sm font-medium text-gray-900">{course.name}</td>
                                    <td className="p-4 text-sm text-gray-600">{course.faculty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Professional Elective Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <SectionHeader title="Professional Elective (PE III)" icon={Monitor} />
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-xs font-bold text-gray-800 uppercase border-b border-gray-100">
                                <th className="p-4 w-32 text-[#A41034]">Course Code</th>
                                <th className="p-4">Course Name</th>
                                <th className="p-4">Faculty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {COURSES_DATA.electives.map((course, idx) => (
                                <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                                    <td className="p-4 text-sm font-bold text-[#A41034]">{course.code}</td>
                                    <td className="p-4 text-sm font-medium text-gray-900">{course.name}</td>
                                    <td className="p-4 text-sm text-gray-600">{course.faculty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             {/* Component Lab Table */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <SectionHeader title="Component Lab" icon={Beaker} />
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-xs font-bold text-gray-800 uppercase border-b border-gray-100">
                                <th className="p-4 w-32 text-[#A41034]">Course Code</th>
                                <th className="p-4">Course Name</th>
                                <th className="p-4">Incharge Lab</th>
                                <th className="p-4">Assisting Faculty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {COURSES_DATA.labs.map((course, idx) => (
                                <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                                    <td className="p-4 text-sm font-bold text-[#A41034]">{course.code}</td>
                                    <td className="p-4 text-sm font-medium text-gray-900">{course.name}</td>
                                    <td className="p-4 text-sm text-gray-600">{course.incharge}</td>
                                    <td className="p-4 text-sm text-gray-600">{course.assisting}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AcademicInventoryTable;
