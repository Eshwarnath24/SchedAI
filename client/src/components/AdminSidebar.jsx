import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
    LayoutDashboard,
    Calendar,
    BarChart,
    Activity,
    FileText,
    Users,
    Megaphone,
    MapPin,
    X,
    LogOut,
} from "lucide-react";
import Logo from './Logo';

const AdminSidebar = ({ onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AppContext);

    const activeTab = (() => {
        if (location.pathname.includes('/admin/reports')) return 'reports';
        if (location.pathname.includes('/admin/timetable')) return 'timetable';
        if (location.pathname.includes('/admin/workload')) return 'workload';
        if (location.pathname.includes('/admin/announcements')) return 'announcements';
        if (location.pathname.includes('/map')) return 'map';
        if (location.state?.tab) return location.state.tab;
        if (location.pathname.includes('leave')) return 'leave-form';
        return 'dashboard';
    })();

    const handleLogout = () => {
        logout();
        navigate('/auth');
        if (onClose) onClose();
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/admin/dashboard', { state: { tab: 'dashboard' } }) },
        { id: 'timetable', label: 'Timetable', icon: Calendar, action: () => navigate('/admin/timetable') },
        { id: 'workload', label: 'Workload', icon: BarChart, action: () => navigate('/admin/workload') },
        { id: 'reports', label: 'Reports', icon: Activity, action: () => navigate('/admin/reports') },
        { id: 'leave-form', label: 'Leave Form', icon: FileText, action: () => navigate('/admin/dashboard', { state: { tab: 'leave-form' } }) },
        { id: 'allocations', label: 'Allocations', icon: Users, action: () => navigate('/admin/dashboard', { state: { tab: 'allocations' } }) },
        { id: 'announcements', label: 'Announcements', icon: Megaphone, action: () => navigate('/admin/announcements') },
        { id: 'map', label: 'Map', icon: MapPin, action: () => navigate('/map') }
    ];

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-white border-r border-slate-100 shadow-xl lg:shadow-none font-sans [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <div className="flex items-center gap-3">
                        <Logo className="w-10 h-10 md:w-16 md:h-16 lg:w-16 lg:h-16 object-contain" showText={true} />
                    </div>
                    <button className="lg:hidden p-2 text-slate-500" onClick={onClose}><X size={24} /></button>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                item.action();
                                if (onClose) onClose();
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-left transition-all ${activeTab === item.id ? "bg-[#F1F5F9] text-[#8B0000]" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                            <item.icon size={20} /> {item.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-6 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 mb-4 rounded-[20px] bg-slate-50 border border-slate-100 overflow-hidden shadow-sm">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white">
                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150" alt="Profile" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">Srinivasan</span>
                        <span className="text-[10px] font-bold text-[#9b1c31] uppercase tracking-wider">Professor</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 px-4 text-[#9b1c31] hover:bg-rose-50 rounded-xl text-sm font-bold transition-colors">
                    <span className="text-md flex items-center gap-2 tracking-tight"><LogOut size={16} strokeWidth={2.5} /> Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;

