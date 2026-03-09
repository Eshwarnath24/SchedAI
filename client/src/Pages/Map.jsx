import React, { useState, useContext, useCallback } from 'react';
import { Search, MapPin, Monitor, BookOpen, Coffee, Wind, Users, Info, DoorOpen, Trees, Archive, X, Menu, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildingData } from '../utils/mapData';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import StudentSidebar from '../components/StudentSidebar';
import { fetchCurrentAvailability } from '../utils/api';

const getCardStyles = (type) => {
    let bgClass, textClass, iconClass, StatusIcon;
    if (type === 'class' || type === 'lab') {
        bgClass = 'bg-[#FAECE4]';
        textClass = 'text-[#8B5A44]';
        iconClass = 'text-[#A0705A]';
        StatusIcon = type === 'lab' ? Monitor : BookOpen;
    } else if (type === 'tag') {
        bgClass = 'bg-[#F3E8FF]';
        textClass = 'text-[#7E22CE]';
        iconClass = 'text-[#9333EA]';
        StatusIcon = Users;
    } else if (type === 'faculty') {
        bgClass = 'bg-[#FFF6D5]';
        textClass = 'text-[#926524]';
        iconClass = 'text-[#B48530]';
        StatusIcon = MapPin;
    } else if (type === 'enquiry') {
        bgClass = 'bg-slate-200 border-2 border-slate-300';
        textClass = 'text-slate-700';
        iconClass = 'text-slate-500';
        StatusIcon = Info;
    } else if (type === 'store') {
        bgClass = 'bg-stone-100 border-2 border-dashed border-stone-300';
        textClass = 'text-stone-600';
        iconClass = 'text-stone-500';
        StatusIcon = Archive;
    } else if (type === 'restroom') {
        bgClass = 'bg-[#FCE7F3]';
        textClass = 'text-[#BE185D]';
        iconClass = 'text-[#DB2777]';
        StatusIcon = Wind;
    } else if (type === 'stairs') {
        bgClass = 'bg-slate-800';
        textClass = 'text-white';
        iconClass = 'text-white';
        StatusIcon = Users;
    } else {
        bgClass = 'bg-slate-100';
        textClass = 'text-slate-700';
        iconClass = 'text-slate-500';
        StatusIcon = Users;
    }
    return { bgClass, textClass, iconClass, StatusIcon };
};

const getStatusDisplay = (type, status) => {
    if (['restroom', 'stairs', 'enquiry', 'store'].includes(type)) return { text: '', dot: 'hidden' };
    if (type === 'faculty') return {
        text: status === 'present' ? 'OCCUPIED' : 'AWAY',
        dot: status === 'present' ? 'bg-[#34D399]' : 'bg-[#FB7185]'
    };
    return {
        text: status === 'free' ? 'AVAILABLE' : 'OCCUPIED',
        dot: status === 'free' ? 'bg-[#34D399]' : 'bg-[#FB7185]'
    };
};

const FacultyDoor = ({ side }) => {
    let styles = "absolute bg-[#A0705A] border-[3px] border-[#784A32] shadow-sm z-20 ";
    if (side === 'top') styles += "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-4 rounded-md";
    if (side === 'bottom') styles += "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-4 rounded-md";
    if (side === 'left') styles += "top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-4 h-16 rounded-md";
    if (side === 'right') styles += "top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-4 h-16 rounded-md";
    return <div className={styles} />;
};

const EntranceBox = ({ type, label, position }) => {
    const isMain = type === 'main';
    return (
        <div
            className={`absolute flex flex-col items-center justify-center p-2.5 rounded-2xl shadow-2xl border-2 transition-all hover:scale-110 group cursor-default z-[100] w-[140px] h-[100px]
        ${isMain ? 'bg-[#1E293B] border-indigo-400 text-white animate-entrance-glow' : 'bg-white border-slate-200 text-slate-800'}`}
            style={position}
        >
            <div className={`mb-1.5 p-1.5 rounded-xl ${isMain ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                <DoorOpen className={`w-5 h-5 ${isMain ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div className="text-center">
                <span className={`text-[7px] font-black uppercase tracking-[0.2em] block mb-1 ${isMain ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {type === 'main' ? 'Gate 01' : 'Gate 02'}
                </span>
                <span className="text-[11px] font-bold block leading-tight">{label}</span>
            </div>
        </div>
    );
};

const BalconyBox = ({ label = "Balcony", className = "", style = {} }) => (
    <div
        style={style}
        className={`rounded-xl border-2 border-solid bg-cyan-50 border-cyan-200 flex flex-col items-center justify-center p-2 text-center transition-all hover:bg-cyan-100 shadow-sm ${className}`}
    >
        <div className="bg-cyan-200/50 p-1 rounded-lg mb-1">
            <Trees className="w-4 h-4 text-cyan-600" />
        </div>
        <span className="text-[9px] font-black tracking-widest text-cyan-700 uppercase leading-tight">{label}</span>
        <div className="flex gap-1 mt-1">
            {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-cyan-300/50 rounded-full" />)}
        </div>
    </div>
);

export default function Map() {
    const { userRole, logout } = useContext(AppContext);
    const isStudent = userRole === 'student';
    const navigate = useNavigate();

    const [currentFloor, setCurrentFloor] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All View');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Availability toggle state
    const [showFreeRooms, setShowFreeRooms] = useState(false);
    const [showFreeFaculty, setShowFreeFaculty] = useState(false);
    const [availabilityData, setAvailabilityData] = useState(null);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const loadAvailability = useCallback(async () => {
        setAvailabilityLoading(true);
        try {
            const data = await fetchCurrentAvailability();
            setAvailabilityData(data);
        } catch (err) {
            console.warn('⚠️ Could not fetch availability:', err.message);
            setAvailabilityData(null);
        } finally {
            setAvailabilityLoading(false);
        }
    }, []);

    const toggleFreeRooms = () => {
        const next = !showFreeRooms;
        setShowFreeRooms(next);
        if (next && !availabilityData) loadAvailability();
    };

    const toggleFreeFaculty = () => {
        const next = !showFreeFaculty;
        setShowFreeFaculty(next);
        if (next && !availabilityData) loadAvailability();
    };

    // Check if a room name is free based on availability data
    const isRoomFree = (roomTitle) => {
        if (!availabilityData) return null; // unknown
        const freeNames = (availabilityData.freeRooms || []).map(r => r.name);
        return freeNames.includes(roomTitle);
    };

    // Check if a faculty name is free based on availability data
    const isFacultyFree = (facultyName) => {
        if (!availabilityData) return null; // unknown
        const freeNames = (availabilityData.freeFaculty || []).map(f => f.name);
        return freeNames.includes(facultyName);
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const activeFloorData = buildingData[currentFloor];

    const isCardActive = (type, text) => {
        if (searchQuery && !text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (activeFilter === 'All View') return true;
        if (activeFilter === 'Faculty' && (type !== 'faculty' && type !== 'enquiry')) return false;
        if (activeFilter === 'Labs/Classes' && type !== 'class' && type !== 'lab') return false;
        if (activeFilter === 'TAG Rooms' && type !== 'tag') return false;
        if (activeFilter === 'Restrooms' && type !== 'restroom') return false;
        if (activeFilter === 'Cafe Area' && type !== 'cafe') return false;
        if (activeFilter === 'Balcony' && (type === 'balcony' || text.toLowerCase().includes('balcony'))) return true;
        if (activeFilter === 'Store' && type !== 'store') return false;
        return true;
    };

    const handleCardClick = (item) => {
        if (['class', 'lab', 'tag', 'faculty'].includes(item.type)) {
            setSelectedItem(item);
        }
    };

    const DirectoryCard = ({ itemData, className = '', style = {} }) => {
        const { type, title, subtitle, status, detail } = itemData;
        const isActive = isCardActive(type, `${title} ${subtitle} ${detail || ''}`);
        if (!isActive && searchQuery) return null;
        const isDimmed = !isActive;
        const isInteractive = ['class', 'lab', 'tag', 'faculty'].includes(type);
        const { bgClass, textClass, iconClass, StatusIcon } = getCardStyles(type);
        const { dot } = getStatusDisplay(type, status);

        // Availability highlighting — full card visual override
        let availOverrideBg = '';
        let availOverrideText = '';
        let availOverrideIcon = '';
        let availBadge = null;
        const isAfterHours = availabilityData?.afterHours === true;

        if (showFreeRooms && (type === 'class' || type === 'lab') && availabilityData) {
            if (isAfterHours) {
                availOverrideBg = 'bg-slate-200 border-2 border-slate-300';
                availOverrideText = 'text-slate-400';
                availOverrideIcon = 'text-slate-300';
                availBadge = <span className="absolute top-0.5 right-0.5 text-[6px] md:text-[7px] font-black tracking-wider bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded-md uppercase z-20">Closed</span>;
            } else {
                const free = isRoomFree(title);
                if (free === true) {
                    availOverrideBg = 'bg-emerald-100 border-2 border-emerald-400 shadow-lg';
                    availOverrideText = 'text-emerald-800';
                    availOverrideIcon = 'text-emerald-500';
                    availBadge = <span className="absolute top-0.5 right-0.5 text-[6px] md:text-[7px] font-black tracking-wider bg-emerald-500 text-white px-1.5 py-0.5 rounded-md uppercase z-20 animate-pulse">Free</span>;
                } else if (free === false) {
                    availOverrideBg = 'bg-rose-100 border-2 border-rose-300';
                    availOverrideText = 'text-rose-700';
                    availOverrideIcon = 'text-rose-400';
                    availBadge = <span className="absolute top-0.5 right-0.5 text-[6px] md:text-[7px] font-black tracking-wider bg-rose-500 text-white px-1.5 py-0.5 rounded-md uppercase z-20">In Use</span>;
                }
            }
        }
        if (showFreeFaculty && type === 'faculty' && availabilityData) {
            if (isAfterHours) {
                availOverrideBg = 'bg-slate-200 border-2 border-slate-300';
                availOverrideText = 'text-slate-400';
                availOverrideIcon = 'text-slate-300';
                availBadge = <span className="absolute top-0.5 right-0.5 text-[6px] md:text-[7px] font-black tracking-wider bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded-md uppercase z-20">Closed</span>;
            } else {
                const free = isFacultyFree(title);
                if (free === true) {
                    availOverrideBg = 'bg-emerald-100 border-2 border-emerald-400 shadow-lg';
                    availOverrideText = 'text-emerald-800';
                    availOverrideIcon = 'text-emerald-500';
                    availBadge = <span className="absolute top-0.5 right-0.5 text-[6px] md:text-[7px] font-black tracking-wider bg-emerald-500 text-white px-1.5 py-0.5 rounded-md uppercase z-20 animate-pulse">Free</span>;
                } else if (free === false) {
                    availOverrideBg = 'bg-rose-100 border-2 border-rose-300';
                    availOverrideText = 'text-rose-700';
                    availOverrideIcon = 'text-rose-400';
                    availBadge = <span className="absolute top-0.5 right-0.5 text-[6px] md:text-[7px] font-black tracking-wider bg-rose-500 text-white px-1.5 py-0.5 rounded-md uppercase z-20">In Use</span>;
                }
            }
        }

        const finalBg = availOverrideBg || bgClass;
        const finalText = availOverrideText || textClass;
        const finalIcon = availOverrideIcon || iconClass;

        return (
            <div
                style={style}
                onClick={() => handleCardClick(itemData)}
                className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl shadow-sm transition-all duration-300 w-full h-full min-h-[60px]
        ${finalBg} ${isDimmed ? 'opacity-20 grayscale-[0.5]' : 'opacity-100 z-10'} 
        ${isInteractive ? 'hover:scale-[1.05] cursor-pointer hover:shadow-md' : 'cursor-default'} ${className}`}
            >
                {availBadge}
                {!availBadge && dot !== 'hidden' && <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${dot}`} />}
                <StatusIcon className={`w-3.5 h-3.5 mb-1 md:w-4 md:h-4 ${finalIcon} stroke-[1.5]`} />
                <h3 className={`font-bold text-[8px] md:text-[11px] text-center leading-tight px-1 ${finalText}`}>{title}</h3>
                <p className={`text-[6.5px] md:text-[7.5px] font-bold tracking-wider uppercase mt-0.5 opacity-70 ${finalText}`}>
                    {subtitle}
                </p>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-[#F4F6F9] font-sans text-slate-800 overflow-hidden">

            {/* Mobile overlay for faculty sidebar */}
            {!isStudent && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[1000] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            {isStudent ? (
                <StudentSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onLogout={handleLogout} />
            ) : (
                <aside className={`
                    fixed lg:relative inset-y-0 left-0 w-72 md:w-[312px] bg-white border-r border-slate-200 flex flex-col z-[1001] transition-transform duration-300 transform
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <Sidebar onClose={() => setIsSidebarOpen(false)} />
                </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#F4F6F9]">

                {/* Mobile header toggle */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shrink-0 sticky left-0 w-full z-[110]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#8B0000] rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="font-bold text-slate-800">Building Map</span>
                    </div>
                    <button
                        onClick={() => isStudent ? setMobileOpen(true) : setIsSidebarOpen(true)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <div className="flex flex-col">
                    <div className="sticky left-0 z-[110] w-[calc(100vw-2rem)] md:w-[calc(100vw-340px)] lg:w-[calc(100vw-360px)]">
                        <div className="bg-white px-6 py-4 shadow-sm rounded-b-3xl mx-4 mt-4 border-b border-slate-100">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text" placeholder="Search room..." value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-11 pr-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-sm outline-none w-full text-slate-700 font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 tracking-widest uppercase text-right flex-1 justify-end">
                                    Floor Selection:
                                    <div className="flex bg-[#F1F5F9] p-1 rounded-xl ml-4">
                                        {[0, 1, 2, 3].map((floor) => (
                                            <button
                                                key={floor} onClick={() => { setCurrentFloor(floor); setSelectedItem(null); }}
                                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${currentFloor === floor ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                {floor}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col xl:flex-row gap-4 xl:gap-8 items-start xl:items-center">
                                <div className="flex-1 w-full">
                                    <span className="text-[10px] font-bold tracking-widest text-slate-400 mb-2 block">Quick Filters:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {['All View', 'Faculty', 'Labs/Classes', 'TAG Rooms', 'Restrooms', 'Cafe Area', 'Balcony', 'Store'].map((filter) => (
                                            <button
                                                key={filter} onClick={() => { setActiveFilter(filter); setSelectedItem(null); }}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all
                    ${activeFilter === filter ? 'bg-[#111827] text-white border-[#111827] ring-2 ring-indigo-500 ring-offset-2' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                {filter}
                                            </button>
                                        ))}

                                        {/* Availability Toggle Buttons */}
                                        <div className="w-px bg-slate-200 mx-1 self-stretch" />
                                        <button
                                            onClick={toggleFreeRooms}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5
                                                ${showFreeRooms
                                                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400 ring-offset-2'
                                                    : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'}`}
                                        >
                                            {availabilityLoading && showFreeRooms ? <Loader2 size={12} className="animate-spin" /> : <DoorOpen size={12} />}
                                            Free Rooms
                                        </button>
                                        <button
                                            onClick={toggleFreeFaculty}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5
                                                ${showFreeFaculty
                                                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400 ring-offset-2'
                                                    : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'}`}
                                        >
                                            {availabilityLoading && showFreeFaculty ? <Loader2 size={12} className="animate-spin" /> : <Users size={12} />}
                                            Free Faculty
                                        </button>
                                    </div>
                                </div>

                                {/* Availability Status Banner */}
                                {(showFreeRooms || showFreeFaculty) && availabilityData && (
                                    availabilityData.afterHours ? (
                                        <div className="flex items-center gap-3 bg-slate-100 border border-slate-300 px-5 py-2.5 rounded-xl">
                                            <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></div>
                                            <span className="text-xs font-bold text-slate-600">
                                                No classes in session — {availabilityData.currentDay} {availabilityData.currentTime}. All rooms and faculty are unavailable.
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-5 py-2.5 rounded-xl">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-xs font-bold text-emerald-700">
                                                Live — Slot {availabilityData.currentSlot?.startTime}–{availabilityData.currentSlot?.endTime}
                                                {showFreeRooms && ` • ${availabilityData.freeRooms.length} free rooms`}
                                                {showFreeFaculty && ` • ${availabilityData.freeFaculty.length} free faculty`}
                                            </span>
                                        </div>
                                    )
                                )}

                                {/* LEGEND */}
                                <div className="flex items-center gap-6 bg-slate-50/80 px-5 py-3 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Available</span>
                                    </div>
                                    <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FB7185] shadow-[0_0_8px_rgba(251,113,133,0.5)]"></div>
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Occupied / Away</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAP CANVAS */}
                    <div className="p-6 relative">
                        <div className="mx-auto w-[2250px]">
                            <div className="relative w-[2200px] h-[780px] bg-white border-[12px] border-slate-100 rounded-[3rem] shadow-sm p-4 overflow-visible">

                                {/* TOP ROOMS (D-Wing & C-Wing) */}
                                <div className="absolute top-[3%] left-[5.5%] w-[35%] h-[15%] grid grid-cols-5 gap-3">
                                    {activeFloorData.rooms.topLeft.map(room => (
                                        <DirectoryCard key={room.id} itemData={{ ...room, title: room.title || room.id }} className={room.colClass} />
                                    ))}
                                </div>
                                <div className="absolute top-[3%] right-[5.5%] w-[35%] h-[15%] grid grid-cols-5 gap-3">
                                    {activeFloorData.rooms.topRight.map(room => (
                                        <DirectoryCard key={room.id} itemData={{ ...room, title: room.title || room.id }} className={room.colClass} />
                                    ))}
                                </div>

                                <div className="absolute top-[3%] left-[44%] w-[12%] h-[15%] z-50">
                                    <BalconyBox label="North Balcony" className="w-full h-full" />
                                </div>

                                {/* FACULTY LEFT BLOCK */}
                                <div className="absolute top-[26%] left-[8.5%] w-[32%] h-[48%] border-[3px] border-slate-50 rounded-3xl p-4 bg-slate-50/50 flex flex-row shadow-inner gap-4">
                                    <div className="flex-[3.5] flex flex-col">
                                        <h4 className="text-center text-[10px] font-bold text-slate-400 tracking-widest mb-2 uppercase">Faculty Left Cabins</h4>
                                        <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-3">
                                            {activeFloorData.faculty.leftBlock.map(fac => (
                                                <DirectoryCard key={`${currentFloor}-L-${fac.room}`} itemData={{ type: 'faculty', title: fac.name, subtitle: fac.room, status: fac.status, detail: fac.detail }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <DirectoryCard itemData={{ type: 'enquiry', title: 'Enquiry', subtitle: 'Main Desk' }} className="h-full" />
                                    </div>
                                    <FacultyDoor side="top" /> <FacultyDoor side="bottom" /> <FacultyDoor side="left" /> <FacultyDoor side="right" />
                                </div>

                                {/* CENTRAL AMENITIES */}
                                <div className="absolute top-[26%] left-[44%] w-[12%] h-[48%] flex flex-col gap-4">
                                    <DirectoryCard itemData={{ type: 'stairs', title: 'Stairs', subtitle: 'North' }} className="flex-[0.8]" />
                                    <div className={`flex-[1.5] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all ${isCardActive('tag', 'plain area') ? 'bg-[#FFEDD5] border-orange-100 text-[#9A3412]' : 'border-slate-100 bg-slate-50 opacity-40'}`}>
                                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Plain Area</span>
                                    </div>
                                    {currentFloor === 0 ? (
                                        <div className="flex-1 flex flex-row gap-3">
                                            <DirectoryCard itemData={{ type: 'stairs', title: 'Stairs', subtitle: 'South' }} className="flex-1" />
                                            <DirectoryCard itemData={{ type: 'cafe', title: 'Cafe', subtitle: 'Area' }} className="flex-1" />
                                        </div>
                                    ) : (
                                        <div className="flex-1">
                                            <DirectoryCard itemData={{ type: 'stairs', title: 'Stairs', subtitle: 'Expanded' }} className="h-full" />
                                        </div>
                                    )}
                                </div>

                                {/* FACULTY RIGHT BLOCK */}
                                <div className="absolute top-[26%] right-[8.5%] w-[32%] h-[48%] border-[3px] border-slate-50 rounded-3xl p-4 bg-slate-50/50 flex flex-col shadow-inner">
                                    <h4 className="text-center text-[10px] font-bold text-slate-400 tracking-widest mb-2 uppercase">Faculty Right Cabins</h4>
                                    <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-3">
                                        {activeFloorData.faculty.rightBlock.map(fac => (
                                            <DirectoryCard key={`${currentFloor}-R-${fac.room}`} itemData={{ type: 'faculty', title: fac.name, subtitle: fac.room, status: fac.status, detail: fac.detail }} />
                                        ))}
                                    </div>
                                    <FacultyDoor side="top" /> <FacultyDoor side="bottom" /> <FacultyDoor side="left" /> <FacultyDoor side="right" />
                                </div>

                                {/* BOTTOM ROOMS (B-Wing & A-Wing) */}
                                <div className="absolute bottom-[3%] left-[5.5%] w-[35%] h-[15%] grid grid-cols-5 gap-3">
                                    {activeFloorData.rooms.bottomLeft.map(room => (
                                        <DirectoryCard key={room.id} itemData={{ ...room, title: room.title || room.id }} className={room.colClass} />
                                    ))}
                                </div>
                                {/* Dynamic Grid: 3 columns for Seminar Halls (F2 index), 5 columns for Classes/Labs (F0, F1, F3) */}
                                <div className={`absolute bottom-[3%] right-[5.5%] w-[35%] h-[15%] grid gap-3 ${currentFloor === 2 ? 'grid-cols-3' : 'grid-cols-5'}`}>
                                    {activeFloorData.rooms.bottomRight.map(room => (
                                        <DirectoryCard key={room.id} itemData={{ ...room, title: room.title || room.id }} className={room.colClass} />
                                    ))}
                                </div>

                                {/* CORNERS */}
                                <div className="absolute top-0 left-0 w-[5.5%] h-[18%] p-2.5"><DirectoryCard itemData={{ type: 'restroom', title: 'Ladies', subtitle: 'Wash' }} /></div>
                                <div className="absolute top-0 right-0 w-[5.5%] h-[18%] p-2.5"><DirectoryCard itemData={{ type: 'restroom', title: 'Gents', subtitle: 'Wash' }} /></div>
                                <div className="absolute bottom-0 left-0 w-[5.5%] h-[18%] p-2.5"><DirectoryCard itemData={{ type: 'restroom', title: 'Gents', subtitle: 'Wash' }} /></div>
                                <div className="absolute bottom-0 right-0 w-[5.5%] h-[18%] p-2.5"><DirectoryCard itemData={{ type: 'restroom', title: 'Ladies', subtitle: 'Wash' }} /></div>

                                {/* SIDE STAIRS */}
                                <div className="absolute top-[38%] right-[-5px] w-[3.2%] h-[24%] bg-slate-800 rounded-l-2xl flex items-center justify-center shadow-xl z-50">
                                    <span className="text-white text-lg font-black rotate-90 uppercase tracking-[0.2em]">Stairs</span>
                                </div>
                                <div className="absolute top-[38%] left-[-5px] w-[3.2%] h-[24%] bg-slate-800 rounded-r-2xl flex items-center justify-center shadow-xl z-50">
                                    <span className="text-white text-lg font-black -rotate-90 uppercase tracking-[0.2em]">Stairs</span>
                                </div>

                                {/* ENTRANCE VS TAG ROOM / STORE ROOM LOGIC */}
                                {currentFloor === 0 ? (
                                    <>
                                        {/* Entrances moved to left by 20px (right offset changed from -80px to -60px) */}
                                        <EntranceBox type="side" label="Side Entrance" position={{ top: '19.8%', right: '-60px' }} />
                                        <EntranceBox type="main" label="Main Entrance" position={{ bottom: '21.2%', right: '-60px' }} />

                                        <div className="absolute w-[96px] h-[96px] z-[80]" style={{ top: 'calc(23% - 15px)', left: '10px' }}>
                                            <DirectoryCard itemData={{ type: 'store', title: `0-S01`, subtitle: 'Store' }} />
                                        </div>
                                        <div className="absolute w-[96px] h-[96px] z-[80]" style={{ bottom: 'calc(23% - 15px)', left: '10px' }}>
                                            <DirectoryCard itemData={{ type: 'store', title: `0-S02`, subtitle: 'Store' }} />
                                        </div>
                                    </>
                                ) : (
                                    activeFloorData.extraRooms.map((room) => (
                                        <div key={room.id} className="absolute w-[96px] h-[96px] z-[80]" style={room.pos}>
                                            <DirectoryCard itemData={{ ...room, title: room.id, type: 'tag', subtitle: 'TAG Room' }} />
                                        </div>
                                    ))
                                )}

                                <div className="absolute bottom-[2%] left-[43.5%] w-[5%] h-[12%]">
                                    <DirectoryCard itemData={{ type: 'stairs', title: 'Lift', subtitle: 'Main' }} />
                                </div>
                                <div className="absolute bottom-[2%] left-[49%] w-[9%] h-[12%] z-50">
                                    <BalconyBox label={"South Balcony"} className="w-full h-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* OVERLAY WIDGET */}
                    {selectedItem && (
                        <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-[200] w-full max-w-[540px] px-4 transition-all animate-in slide-in-from-bottom-8 fade-in duration-200">
                            <div className="bg-white p-5 md:p-6 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] border border-slate-100 flex items-center gap-4 md:gap-5 relative w-full">
                                <button className="absolute top-4 right-4 w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-colors" onClick={() => setSelectedItem(null)}>
                                    <X className="w-4 h-4" />
                                </button>
                                {(() => {
                                    const { bgClass, iconClass, StatusIcon } = getCardStyles(selectedItem.type);
                                    const { text, dot } = getStatusDisplay(selectedItem.type, selectedItem.status);
                                    let displayTitle, displaySubtitle;
                                    if (selectedItem.type === 'faculty') {
                                        displayTitle = selectedItem.title;
                                        displaySubtitle = `${selectedItem.detail} • Room ${selectedItem.subtitle}`;
                                    } else {
                                        displayTitle = selectedItem.title.includes('-') ? `Room ${selectedItem.title}` : selectedItem.title;
                                        displaySubtitle = selectedItem.detail || selectedItem.subtitle;
                                    }
                                    return (
                                        <>
                                            <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl flex items-center justify-center ${bgClass}`}>
                                                <StatusIcon className={`w-8 h-8 md:w-10 md:h-10 ${iconClass} stroke-[1.5]`} />
                                            </div>
                                            <div className="flex flex-col pr-6">
                                                <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight mb-1">{displayTitle}</h2>
                                                <p className="text-[11px] md:text-[13px] font-bold text-slate-500 leading-snug mb-3 line-clamp-2">{displaySubtitle}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${dot}`}></div>
                                                    <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-slate-700">{text}</span>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    <style dangerouslySetInnerHTML={{
                        __html: `
        @keyframes entrance-glow {
          0%, 100% { border-color: rgb(129 140 248 / 0.4); box-shadow: 0 0 15px -5px rgb(129 140(248 / 0.2); }
          50% { border-color: rgb(129 140 248 / 0.8); box-shadow: 0 0 25px 2px rgb(129 140 248 / 0.4); }
        }
        .animate-entrance-glow {
          animation: entrance-glow 3s ease-in-out infinite;
        }
      `}} />
                </div>
            </main>
        </div>
    );
}