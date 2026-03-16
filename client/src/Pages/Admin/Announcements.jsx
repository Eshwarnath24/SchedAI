import React, { useState } from 'react';
import {
    Megaphone, Menu, Search, Plus, Trash2, Edit3, Clock, Eye, Send,
    Filter, Globe, ShieldAlert, Zap, Bell, CheckCircle2, File, Image, Paperclip, X
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import Logo from '../../components/Logo';

const AdminAnnouncements = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');

    // Mock Announcements Data enhanced for US 13 (Automated Notifications)
    const [announcements, setAnnouncements] = useState([
        {
            id: 4,
            title: 'Institutional Update: Semester Schedule Published',
            desc: 'The master timetable for the upcoming semester is now official. Faculty can review their finalized teaching loads and report any minor conflicts via the dashboard.',
            date: 'Just Now',
            author: 'System Auto-Publish',
            priority: 'Critical',
            target: 'Faculty & Students',
            isSystem: true
        },
        {
            id: 1,
            title: 'End Semester Exam Schedule Released',
            desc: 'The exam dates for all branches of Semester 5 and 7 have been updated in the portal. Please verify your slots.',
            date: 'Today, 09:15 AM',
            author: 'Dean Office',
            priority: 'High',
            target: 'Everyone'
        },
        {
            id: 2,
            title: 'Faculty Meeting: GA Optimization',
            desc: 'Discussing the new constraints for the upcoming elective selection. All HODs must attend.',
            date: 'Today, 04:00 PM',
            author: 'Principal',
            priority: 'Medium',
            target: 'Faculty'
        },
        {
            id: 3,
            title: 'Server Maintenance Window',
            desc: 'The portal will be down for 2 hours tonight (11 PM - 1 AM) for database migration.',
            date: 'Yesterday',
            author: 'IT Support',
            priority: 'Critical',
            target: 'Everyone'
        },
    ]);

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'Critical': return 'bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-100/50';
            case 'High': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    const [newTitle, setNewTitle] = useState('');
    const [newPriority, setNewPriority] = useState('Normal (Blue)');
    const [newTarget, setNewTarget] = useState('Everyone');
    const [newContent, setNewContent] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);

    const fileInputRef = React.useRef(null);
    const imageInputRef = React.useRef(null);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setAttachedFiles((prev) => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const [editingId, setEditingId] = useState(null);

    const handleToggleComposer = () => {
        if (isPosting) {
            setNewTitle('');
            setNewContent('');
            setNewPriority('Normal (Blue)');
            setNewTarget('Everyone');
            setAttachedFiles([]);
            setEditingId(null);
        }
        setIsPosting(!isPosting);
    };

    const handleEdit = (id) => {
        const item = announcements.find(a => a.id === id);
        if (item) {
            setNewTitle(item.title);
            setNewContent(item.desc);
            if (item.priority === 'Critical') setNewPriority('Critical (Red)');
            else if (item.priority === 'High') setNewPriority('High (Amber)');
            else setNewPriority('Normal (Blue)');
            setNewTarget(item.target);
            setAttachedFiles([]);
            setEditingId(id);
            setIsPosting(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePostAnnouncement = () => {
        if (!newTitle.trim() || !newContent.trim()) return;

        if (editingId) {
            setAnnouncements(announcements.map(a =>
                a.id === editingId
                    ? { ...a, title: newTitle, desc: newContent, priority: newPriority.split(' ')[0], target: newTarget }
                    : a
            ));
        } else {
            const newPost = {
                id: Date.now(),
                title: newTitle,
                desc: newContent,
                date: 'Just Now',
                author: 'Admin',
                priority: newPriority.split(' ')[0],
                target: newTarget,
                isSystem: false
            };
            setAnnouncements([newPost, ...announcements]);
        }

        // Reset form
        setNewTitle('');
        setNewContent('');
        setNewPriority('Normal (Blue)');
        setNewTarget('Everyone');
        setAttachedFiles([]);
        setEditingId(null);
        setIsPosting(false);
    };

    const handleDelete = (id) => {
        setAnnouncements(announcements.filter(a => a.id !== id));
    };

    const filteredAnnouncements = announcements.filter(item => {
        if (activeCategory === 'All') return true;
        if (activeCategory === 'System') return item.isSystem;
        if (activeCategory === 'Official') return item.author === 'Dean Office' || item.author === 'Principal';
        if (activeCategory === 'Priority') return item.priority === 'Critical' || item.priority === 'High';
        return true;
    });

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed lg:relative inset-y-0 left-0 w-72 md:w-[312px] bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 transform
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
            </aside>

            <main className="flex-1 overflow-y-auto w-full relative">
                <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
                    <Logo type="scheduler" className="w-8 h-8" showText={false} textClassName="text-xl" />
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                                <Megaphone size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Institutional Feed</h1>
                                <p className="text-left text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">Global Broadcasts & Automated Notifications</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsPosting(!isPosting)}
                            className="bg-[#8B0000] text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3 w-fit text-[10px]"
                        >
                            {isPosting ? <X size={20} className="text-white" /> : <Plus size={20} className="text-white" />} {isPosting ? 'Close Composer' : 'New Broadcast'}
                        </button>
                    </div>

                    {/* New Post Form */}
                    {isPosting && (
                        <div className="bg-white rounded-[2.5rem] border-2 border-slate-900 shadow-2xl p-10 mb-12 animate-in slide-in-from-top duration-500 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Globe size={120} className="text-slate-900" />
                            </div>
                            <div className="flex items-center gap-4 mb-10 relative z-10">
                                <div className="w-12 h-12 bg-[#8B0000] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
                                    <Send size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-2xl text-slate-800 tracking-tight">Compose Announcement</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instituional Communication Mode</p>
                                </div>
                            </div>
                            <div className="space-y-8 relative z-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Announcement Title</label>
                                            <input
                                                type="text"
                                                placeholder="Enter title..."
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5 focus:bg-white transition-all outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Priority Level</label>
                                                <select
                                                    value={newPriority}
                                                    onChange={(e) => setNewPriority(e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer hover:bg-white transition-all"
                                                >
                                                    <option>Normal (Blue)</option>
                                                    <option>High (Amber)</option>
                                                    <option>Critical (Red)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Target Audience</label>
                                                <select
                                                    value={newTarget}
                                                    onChange={(e) => setNewTarget(e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer hover:bg-white transition-all"
                                                >
                                                    <option>Everyone</option>
                                                    <option>Faculty Only</option>
                                                    <option>Students Only</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col h-full">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Detailed Message Content</label>
                                        <textarea
                                            rows="6"
                                            placeholder="Provide full context, links, and deadlines..."
                                            value={newContent}
                                            onChange={(e) => setNewContent(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5 focus:bg-white transition-all outline-none resize-none flex-1"
                                        ></textarea>
                                    </div>
                                </div>

                                {/* US: File/Image Upload Section */}
                                <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    ref={imageInputRef}
                                                    onChange={handleFileUpload}
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => imageInputRef.current.click()}
                                                    className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-[#8B0000] hover:text-[#8B0000] transition-all shadow-sm"
                                                >
                                                    <Image size={16} /> Upload Image
                                                </button>

                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    accept=".pdf"
                                                    multiple
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-[#8B0000] hover:text-[#8B0000] transition-all shadow-sm"
                                                >
                                                    <File size={16} /> Upload PDF
                                                </button>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden md:block">Max size: 10MB • PNG, JPG, PDF</span>
                                        </div>
                                        {/* Upload List */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {attachedFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-100 rounded-lg shadow-sm">
                                                    {file.type.startsWith('image') ? <Image size={12} className="text-[#8B0000]" /> : <Paperclip size={12} className="text-[#8B0000]" />}
                                                    <span className="text-[9px] font-black text-slate-600 max-w-[100px] truncate">{file.name}</span>
                                                    <button onClick={() => removeFile(idx)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={12} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[10px] font-black uppercase text-slate-400">Ready to broadcast institution-wide</p>
                                    </div>
                                    <button
                                        onClick={handlePostAnnouncement}
                                        disabled={!newTitle.trim() || !newContent.trim()}
                                        className={`px-12 py-4 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] shadow-2xl transition-all ${!newTitle.trim() || !newContent.trim() ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-[#8B0000] text-white hover:bg-red-800 hover:translate-x-1"
                                            }`}
                                    >
                                        {editingId ? "Save Changes" : "Confirm & Post"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter Navigation */}
                    <div className="flex items-center gap-8 mb-10 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100">
                        {['All', 'System', 'Official', 'Priority'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeCategory === cat ? 'text-slate-900 active' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {cat}
                                {activeCategory === cat && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8B0000] rounded-full" />}
                            </button>
                        ))}
                    </div>

                    {/* Announcements List */}
                    <div className="space-y-6">
                        {filteredAnnouncements.map((item) => (
                            <div key={item.id} className={`bg-white rounded-[2.5rem] border transition-all hover:shadow-2xl group overflow-hidden flex flex-col md:flex-row relative ${item.isSystem ? 'border-emerald-200' : 'border-slate-200'}`}>
                                <div className={`w-2 md:w-3 md:self-stretch ${item.priority === 'Critical' ? 'bg-red-500' :
                                    item.priority === 'High' ? 'bg-amber-400' : 'bg-blue-500'
                                    }`} />

                                <div className="flex-1 p-8 md:p-10">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                                <span className={`px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${getPriorityStyle(item.priority)}`}>
                                                    {item.priority}
                                                </span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                                    <Globe size={10} /> {item.target}
                                                </span>
                                                {item.isSystem && (
                                                    <span className="px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5">
                                                        <Zap size={10} /> US 13: Push Notification
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-3 group-hover:text-[#8B0000] transition-colors">{item.title}</h4>
                                            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-4xl">{item.desc}</p>
                                        </div>
                                        <div className="flex md:flex-col items-end gap-2 shrink-0 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 self-start">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                                <Clock size={12} className="text-[#8B0000]" /> {item.date}
                                            </div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 border-t border-slate-200 pt-2 w-full text-right">
                                                {item.author}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-8">
                                            {/* US: Multimedia Attachment Indicators */}
                                            <div className="flex items-center gap-4 border-r border-slate-100 pr-8">
                                                <div className="flex items-center gap-1.5 text-[#8B0000] bg-red-50 px-2 py-1 rounded-lg border border-red-100" title="Image Attached">
                                                    <Image size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Image</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100" title="PDF Attached">
                                                    <File size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">PDF</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-slate-400">
                                                <Eye size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">1,248 Impressions</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-slate-400">
                                                <Bell size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Global Reach</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-emerald-500">
                                                <CheckCircle2 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button
                                                onClick={() => handleEdit(item.id)}
                                                className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100"
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 p-10 bg-[#8B0000] rounded-[3rem] text-white overflow-hidden relative group shadow-2xl shadow-red-900/40">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="max-w-xl text-center md:text-left">
                                <h3 className="text-3xl font-black mb-4 tracking-tight">Institutional Sync</h3>
                                <p className="text-white/80 text-sm font-medium leading-relaxed">
                                    Ready to publish the final semester schedule? Triggering the institutional sync will notify all students and faculty across all branches instantly.
                                </p>
                            </div>
                            <button onClick={() => alert("Executing Master Sync across all branches...")} className="bg-white text-[#8B0000] px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.25em] text-xs shadow-2xl hover:bg-slate-100 transition-all shrink-0">
                                Execute Master Sync
                            </button>
                        </div>
                    </div>

                </div>

                <footer className="px-12 py-12 text-center border-t border-slate-200/50 bg-white/30 backdrop-blur-sm mt-12">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.6em]">
                        <span className="font-bold"><span className="text-[#8B0000]">Sched</span><span className="text-amber-500">AI</span></span> for Amrita University
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default AdminAnnouncements;
