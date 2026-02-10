import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
    GraduationCap,
    Presentation,
    ShieldCheck,
    ArrowRight,
    Eye,
    Check,
    CheckCircle2,
    X,
    AlertTriangle
} from 'lucide-react';
import { parseStudentRollNumber, STUDENT_ROLL_FORMAT } from '../utils/rollNumber';

const AuthPage = () => {
    const navigate = useNavigate();
    const { login } = useContext(AppContext);
    const [currentRole, setCurrentRole] = useState('student');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ title: '', message: '' });
    const [toastType, setToastType] = useState('success');

    const roleData = {
        student: {
            quote: "Education for life, shaping knowledge, values, and skills that empower students to grow, adapt, and succeed in an ever-changing world.",
            icon: GraduationCap
        },
        teacher: {
            quote: "Inspiring learners by sharing knowledge, fostering curiosity, and guiding students to grow, adapt, and succeed in an ever-changing world.",
            icon: Presentation
        },
        admin: {
            quote: "Managing campus digital systems by ensuring security, reliability, and support that help the institution grow, adapt, and succeed smoothly.",
            icon: ShieldCheck
        }
    };

    const identifierLabel = currentRole === 'student' ? 'Roll Number' : 'Teacher ID';

    const showToastNotification = (title, message, type = 'success') => {
        setToastMessage({ title, message });
        setToastType(type);
        setShowToast(true);
    };



    const selectRole = (role) => {
        setCurrentRole(role);
    };

    const getEmailDomain = () => {
        switch (currentRole) {
            case 'student':
                return '@cb.students.amrita.edu';
            case 'teacher':
                return '@cb.teachers.amrita.edu';
            case 'admin':
                return '@cb.admin.amrita.edu';
            default:
                return '@cb.students.amrita.edu';
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();

        const trimmedId = userId.trim();
        if (!trimmedId) {
            showToastNotification('Missing Details', `Please enter your ${identifierLabel}.`, 'error');
            return;
        }

        if (!password.trim()) {
            showToastNotification('Missing Password', 'Please enter your password.', 'error');
            return;
        }

        let normalizedIdentifier = trimmedId;
        let studentDetails = null;

        if (currentRole === 'student') {
            const parsed = parseStudentRollNumber(trimmedId);
            if (!parsed) {
                showToastNotification('Invalid Roll Number', `Use format similar to ${STUDENT_ROLL_FORMAT}.`, 'error');
                return;
            }
            normalizedIdentifier = parsed.normalized;
            studentDetails = parsed;
        }

        const fullEmail = `${normalizedIdentifier}${getEmailDomain()}`;
        const loginResult = login(fullEmail, password, currentRole, normalizedIdentifier, studentDetails);

        if (!loginResult?.success) {
            showToastNotification('Login Failed', loginResult?.error || 'Unable to login with the provided credentials.', 'error');
            return;
        }

        const roleCapitalized = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
        showToastNotification('Welcome Back!', `Logged in successfully as ${roleCapitalized}`);

        // Navigate to dashboard after a brief delay
        setTimeout(() => {
            setShowToast(false);
            if (currentRole === 'student') {
                navigate('/student/dashboard');
            } else {
                navigate('/dashboard');
            }
        }, 1500);
    };

    const hideToast = () => {
        setShowToast(false);
    };

    const RoleIcon = roleData[currentRole].icon;
    const ToastIcon = toastType === 'error' ? AlertTriangle : CheckCircle2;

    return (
        <div className="min-h-screen w-full md:flex md:items-center md:justify-center bg-[#f0f2f5] p-0 md:p-4 text-gray-800" style={{
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '24px 24px'
        }}>
            {/* Main Container */}
            <div className="w-full min-h-screen md:min-h-0 md:h-[90vh] md:w-[95vw] lg:w-[1200px] bg-white md:rounded-[2.5rem] shadow-none md:shadow-2xl flex flex-col md:flex-row overflow-hidden relative ring-1 ring-gray-900/5">

                {/* Left Panel: Branding (Hidden on Mobile) */}
                <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative flex-col p-10 lg:p-16 text-white overflow-hidden justify-between" style={{
                    background: 'linear-gradient(135deg, #a50034 0%, #7a0026 100%)'
                }}>
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                    {/* Geometric Patterns */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }}></div>

                    {/* Top: Logo */}
                    <div className="relative z-10 flex items-center gap-5 animate-fadeInUp">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg shrink-0">
                            <span className="font-bold text-3xl font-serif">A</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-[0.15em]">AMRITA</span>
                            <span className="text-[11px] opacity-80 tracking-[0.25em] font-light uppercase">Vishwa Vidyapeetham</span>
                        </div>
                    </div>

                    {/* Middle: Content */}
                    <div className="relative z-10 animate-fadeInUp">
                        <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-8 tracking-tight">
                            Inspiring <br />
                            <span className="text-yellow-400 relative inline-block">
                                Excellence
                                <svg className="absolute w-full h-3 bottom-0 left-0 text-yellow-500/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                                </svg>
                            </span>
                        </h1>

                        {/* Dynamic Quote Box */}
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl transition-all duration-500 hover:bg-white/15 group max-w-md">
                            <div className="flex gap-5 items-start">
                                <div className="p-3 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                    <RoleIcon className="w-7 h-7 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-yellow-400 mb-2 tracking-widest uppercase opacity-90">{currentRole} Portal</p>
                                    <p className="text-base text-white/95 leading-relaxed font-light">"{roleData[currentRole].quote}"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Footer */}
                    <div className="relative z-10 text-xs text-white/50 flex justify-between items-center pt-8 border-t border-white/10 animate-fadeInUp">
                        <span className="font-light tracking-wide">© 2025 Amrita Vishwa Vidyapeetham</span>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors duration-200">Terms of Use</a>
                        </div>
                    </div>
                </div>


                {/* Right Panel: Auth Forms */}
                <div className="w-full md:w-7/12 lg:w-1/2 bg-white flex flex-col relative h-full">

                    {/* Mobile Header (Visible only on small screens) */}
                    <div className="md:hidden px-6 py-5 text-white flex justify-between items-center shadow-lg z-20 shrink-0 sticky top-0" style={{
                        background: 'linear-gradient(135deg, #a50034 0%, #7a0026 100%)'
                    }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-sm">
                                <span className="font-bold text-lg font-serif">A</span>
                            </div>
                            <span className="font-bold text-base tracking-wide">Amrita Portal</span>
                        </div>
                        {/* Simple Role Indicator for Mobile */}
                        <div className="text-[10px] bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                            <span>{currentRole}</span>
                        </div>
                    </div>

                    {/* Content Area - Scrollable Container */}
                    <div className="flex-1 flex flex-col justify-center h-full max-w-xl mx-auto w-full overflow-y-auto">

                        <div className="p-6 md:p-14 lg:p-20 flex flex-col h-full md:justify-center">

                            {/* Header */}
                            <div className="mb-8 md:mb-10 shrink-0 animate-fadeInUp">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">Welcome Back</h2>
                                <p className="text-sm md:text-base text-gray-500">Please select your role to access the dashboard.</p>
                            </div>

                            {/* Role Selection */}
                            <div className="mb-8 md:mb-10 shrink-0 animate-fadeInUp">
                                <div className="grid grid-cols-3 gap-3 md:gap-5">
                                    {/* Student */}
                                    <button
                                        onClick={() => selectRole('student')}
                                        className={`group relative p-3 md:p-4 rounded-xl md:rounded-2xl border flex flex-col items-center gap-2 md:gap-3 shadow-sm cursor-pointer outline-none transition-all duration-300 ${currentRole === 'student'
                                            ? 'border-[#a50034] bg-red-50 shadow-red-100'
                                            : 'border-gray-100 bg-white hover:-translate-y-1'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${currentRole === 'student'
                                            ? 'bg-[#a50034] text-white scale-110'
                                            : 'bg-gray-50 text-gray-400 group-hover:bg-[#a50034] group-hover:text-white'
                                            }`}>
                                            <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide transition-colors ${currentRole === 'student' ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-900'
                                            }`}>Student</span>
                                        <div className={`absolute top-2 right-2 md:top-2.5 md:right-2.5 transition-opacity duration-300 ${currentRole === 'student' ? 'opacity-100' : 'opacity-0'
                                            }`}>
                                            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#a50034] rounded-full ring-2 ring-red-50"></div>
                                        </div>
                                    </button>

                                    {/* Teacher */}
                                    <button
                                        onClick={() => selectRole('teacher')}
                                        className={`group relative p-3 md:p-4 rounded-xl md:rounded-2xl border flex flex-col items-center gap-2 md:gap-3 shadow-sm cursor-pointer outline-none transition-all duration-300 ${currentRole === 'teacher'
                                            ? 'border-[#a50034] bg-red-50 shadow-red-100'
                                            : 'border-gray-100 bg-white hover:-translate-y-1'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentRole === 'teacher'
                                            ? 'bg-[#a50034] text-white scale-110'
                                            : 'bg-gray-50 text-gray-400 group-hover:bg-[#a50034] group-hover:text-white'
                                            }`}>
                                            <Presentation className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide transition-colors ${currentRole === 'teacher' ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-900'
                                            }`}>Teacher</span>
                                        <div className={`absolute top-2 right-2 md:top-2.5 md:right-2.5 transition-opacity duration-300 ${currentRole === 'teacher' ? 'opacity-100' : 'opacity-0'
                                            }`}>
                                            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#a50034] rounded-full ring-2 ring-red-50"></div>
                                        </div>
                                    </button>

                                    {/* Admin */}
                                    <button
                                        onClick={() => selectRole('admin')}
                                        className={`group relative p-3 md:p-4 rounded-xl md:rounded-2xl border flex flex-col items-center gap-2 md:gap-3 shadow-sm cursor-pointer outline-none transition-all duration-300 ${currentRole === 'admin'
                                            ? 'border-[#a50034] bg-red-50 shadow-red-100'
                                            : 'border-gray-100 bg-white hover:-translate-y-1'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${currentRole === 'admin'
                                            ? 'bg-[#a50034] text-white scale-110'
                                            : 'bg-gray-50 text-gray-400 group-hover:bg-[#a50034] group-hover:text-white'
                                            }`}>
                                            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide transition-colors ${currentRole === 'admin' ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-900'
                                            }`}>Admin</span>
                                        <div className={`absolute top-2 right-2 md:top-2.5 md:right-2.5 transition-opacity duration-300 ${currentRole === 'admin' ? 'opacity-100' : 'opacity-0'
                                            }`}>
                                            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-[#a50034] rounded-full ring-2 ring-red-50"></div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Forms Area */}
                            <div className="relative w-full animate-fadeInUp">
                                <form onSubmit={handleLogin} className="space-y-5 md:space-y-6 flex flex-col">
                                    <div className="space-y-5 md:space-y-6">
                                        {/* Roll Number / Email Input */}
                                        <div className="relative">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="text"
                                                    value={userId}
                                                    onChange={(e) => setUserId(e.target.value)}
                                                    className="peer w-full bg-gray-50 border border-gray-200 rounded-xl pl-5 pr-[220px] py-3.5 md:py-4 text-base text-gray-900 outline-none focus:border-[#a50034] focus:ring-1 focus:ring-[#a50034]/20 transition-all placeholder-transparent"
                                                    placeholder={identifierLabel}
                                                    required
                                                />
                                                <span className="absolute right-5 top-3.5 md:top-4 text-gray-400 text-sm font-medium pointer-events-none">
                                                    {getEmailDomain()}
                                                </span>
                                                <label className="absolute left-5 top-3.5 md:top-4 text-gray-400 text-sm transition-all pointer-events-none peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-[#a50034] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 bg-white px-1 peer-[:not(:placeholder-shown)]:text-[#a50034]">
                                                    {identifierLabel}
                                                </label>
                                            </div>
                                        </div>

                                        {/* Password Input */}
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="peer w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 md:py-4 text-base text-gray-900 outline-none focus:border-[#a50034] focus:ring-1 focus:ring-[#a50034]/20 transition-all placeholder-transparent"
                                                placeholder="Password"
                                                required
                                            />
                                            <label className="absolute left-5 top-3.5 md:top-4 text-gray-400 text-sm transition-all pointer-events-none peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-[#a50034] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 bg-white px-1 peer-[:not(:placeholder-shown)]:text-[#a50034]">
                                                Password
                                            </label>
                                            <button type="button" className="absolute right-5 top-3.5 md:top-4 text-gray-400 hover:text-[#a50034] transition-colors">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-center mt-2 px-1">
                                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={rememberMe}
                                                        onChange={(e) => setRememberMe(e.target.checked)}
                                                        className="peer sr-only"
                                                    />
                                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-md transition-colors peer-checked:bg-[#a50034] peer-checked:border-[#a50034] flex items-center justify-center">
                                                        {rememberMe && <Check className="w-3.5 h-3.5 text-white" />}
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Remember me</span>
                                            </label>
                                            <a href="#" className="text-sm text-[#a50034] font-semibold hover:text-red-800 transition-colors">Forgot Password?</a>
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-[#a50034] text-white py-4 md:py-4.5 rounded-xl font-semibold text-base shadow-xl shadow-red-900/10 hover:shadow-red-900/25 active:scale-[0.98] md:hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2.5 group mt-4 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <span className="relative">Login to Dashboard</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" />
                                    </button>
                                </form>
                            </div>

                            {/* Extra Help Link */}
                            <div className="mt-8 md:mt-auto md:pt-6 text-center animate-fadeInUp pb-8 md:pb-0">
                                <p className="text-xs text-gray-400">Having trouble logging in? <a href="#" className="text-gray-600 font-semibold hover:underline">Contact Support</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className={`fixed bottom-6 left-6 right-6 md:left-auto md:bottom-8 md:right-8 transform transition-all duration-400 z-50 bg-white border-l-4 ${toastType === 'error' ? 'border-red-500' : 'border-[#a50034]'} shadow-2xl rounded-xl p-4 md:p-5 flex items-center gap-4 md:min-w-[360px] pr-8 ring-1 ring-black/5`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${toastType === 'error' ? 'bg-red-50 text-red-600' : 'bg-red-50 text-[#a50034]'} flex items-center justify-center shrink-0`}>
                        <ToastIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">{toastMessage.title}</h4>
                        <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">{toastMessage.message}</p>
                    </div>
                    <button onClick={hideToast} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AuthPage;