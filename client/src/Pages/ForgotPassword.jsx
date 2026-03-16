import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, MemoryRouter, useInRouterContext } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Send,
    CheckCircle2,
    X,
    AlertTriangle,
    Loader2,
    Key,
    Lock,
    Eye,
    EyeOff,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';

import amritaLogo from '../assets/amrita_logo.png';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    // Multi-step Flow State
    const [currentStep, setCurrentStep] = useState(1);

    // Form Data State
    const [identifier, setIdentifier] = useState('');
    const [detectedRole, setDetectedRole] = useState(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ title: '', message: '' });
    const [toastType, setToastType] = useState('success');

    // OTP Input Refs
    const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    const showToastNotification = (title, message, type = 'success') => {
        setToastMessage({ title, message });
        setToastType(type);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    const hideToast = () => setShowToast(false);

    // Step 1: Verify Email & Detect Role
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const trimmedId = identifier.trim();
        if (!trimmedId) {
            showToastNotification('Missing Details', 'Please enter your Email or Roll Number.', 'error');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call to check user existence and find role
        try {

            const response = await fetch("http://localhost:619/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: trimmedId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send OTP");
            }

            // Detect role from email
            let role = trimmedId.includes("@cb.students.amrita.edu") ? "Student" : "Faculty/Admin";

            setDetectedRole(role);
            setCurrentStep(2);

            showToastNotification(
                "OTP Sent",
                "A 6-digit code has been generated. Check server console.",
                "success"
            );

        } catch (error) {
            showToastNotification("Error", error.message, "error");
        }

        setIsSubmitting(false);
    };

    // Step 2: OTP Verification
    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value !== '' && index < 5) {
            otpRefs[index + 1].current.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        // Auto-focus previous input on backspace if current is empty
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            otpRefs[index - 1].current.focus();
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const otpString = otp.join('');
        if (otpString.length < 6) {
            showToastNotification('Invalid OTP', 'Please enter the complete 6-digit verification code.', 'error');
            return;
        }

        setIsSubmitting(true);

        // Simulate OTP Verification API
        try {

            const response = await fetch("http://localhost:619/api/auth/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: identifier,
                    otp: otpString
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "OTP verification failed");
            }

            setCurrentStep(3);

            showToastNotification(
                "Verified",
                "OTP verified successfully.",
                "success"
            );

        } catch (error) {
            showToastNotification("Verification Failed", error.message, "error");
        }

        setIsSubmitting(false);
    };

    // Step 3: Create New Password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (newPassword.length < 8) {
            showToastNotification('Weak Password', 'Password must be at least 8 characters long.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToastNotification('Mismatch', 'The passwords you entered do not match.', 'error');
            return;
        }

        setIsSubmitting(true);

        // Simulate Password Reset API
        try {

            const response = await fetch("http://localhost:619/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: identifier,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Password reset failed");
            }

            showToastNotification(
                "Success!",
                "Password updated successfully. Redirecting...",
                "success"
            );

            setTimeout(() => {
                navigate("/auth");
            }, 2000);

        } catch (error) {
            showToastNotification("Error", error.message, "error");
        }

        setIsSubmitting(false);
    };

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
                    <div className="flex items-center gap-4">
                        <img
                            src={amritaLogo}
                            alt="Amrita Logo"
                            className="min-w-[80px] w-20 md:w-40 h-auto object-contain"
                            style={{ maxWidth: '140px', height: 'auto' }}
                        />
                        <span className="font-bold text-2xl md:text-3xl tracking-wide"><span className="text-[#8B0000]">Sched</span><span className="text-amber-500">AI</span></span>
                    </div>

                    {/* Middle: Content */}
                    <div className="relative z-10 animate-fadeInUp">
                        <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-8 tracking-tight">
                            Secure your <br />
                            <span className="text-yellow-400 relative inline-block">
                                Account
                                <svg className="absolute w-full h-3 bottom-0 left-0 text-yellow-500/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                                </svg>
                            </span>
                        </h1>

                        {/* Dynamic Quote Box */}
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl max-w-md">
                            <div className="flex gap-5 items-start">
                                <div className="p-3 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-xl shadow-inner">
                                    <Key className="w-7 h-7 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-yellow-400 mb-2 tracking-widest uppercase opacity-90">Account Recovery</p>
                                    <p className="text-base text-white/95 leading-relaxed font-light">"Like resetting a bank vault code, we securely verify your identity before handing over the keys to your academic portal."</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Footer */}
                    <div className="relative z-10 text-xs text-white/50 flex justify-between items-center pt-8 border-t border-white/10 animate-fadeInUp">
                        <span className="font-light tracking-wide">© 2026 <span className="font-medium"><span className="text-[#8B0000]">Sched</span><span className="text-amber-500">AI</span></span> for Amrita University</span>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-white transition-colors duration-200">Terms of Use</Link>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Auth Forms */}
                <div className="w-full md:w-7/12 lg:w-1/2 bg-white flex flex-col relative h-full">

                    {/* Mobile Header */}
                    <div className="md:hidden px-6 py-5 text-white flex justify-between items-center shadow-lg z-20 shrink-0 sticky top-0" style={{
                        background: 'linear-gradient(135deg, #a50034 0%, #7a0026 100%)'
                    }}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-sm">
                                <span className="font-bold text-2xl font-serif">A</span>
                            </div>
                            <span className="font-bold text-lg tracking-wide"><span className="text-[#8B0000]">Sched</span><span className="text-amber-500">AI</span></span>
                        </div>
                        <div className="text-[10px] bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                            <span>Recovery</span>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col pt-6 md:pt-10 px-6 md:px-14 lg:px-20 overflow-y-auto">

                        {/* Top Navigation & Stepper */}
                        <div className="flex flex-col gap-6 mb-8 shrink-0">
                            {/* Back Button */}
                            <button
                                onClick={() => {
                                    if (currentStep > 1) setCurrentStep(prev => prev - 1);
                                    else navigate(-1);
                                }}
                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#a50034] hover:bg-red-50 hover:border-red-100 transition-all duration-300"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            {/* Progress Stepper Indicator */}
                            <div className="flex items-center justify-between w-full max-w-sm">
                                {[
                                    { step: 1, label: 'Email' },
                                    { step: 2, label: 'OTP' },
                                    { step: 3, label: 'Reset' }
                                ].map((item, index) => (
                                    <React.Fragment key={item.step}>
                                        <div className="flex flex-col items-center gap-2 relative">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-sm ${currentStep >= item.step
                                                ? 'bg-[#a50034] text-white ring-4 ring-red-50'
                                                : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                {currentStep > item.step ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                                            </div>
                                            <span className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider absolute -bottom-5 w-20 text-center ${currentStep >= item.step ? 'text-[#a50034]' : 'text-gray-400'
                                                }`}>
                                                {item.label}
                                            </span>
                                        </div>
                                        {index < 2 && (
                                            <div className="flex-1 h-0.5 mx-2 bg-gray-100 rounded-full overflow-hidden relative">
                                                <div className={`absolute top-0 left-0 h-full bg-[#a50034] transition-all duration-500 ease-out`} style={{
                                                    width: currentStep > item.step ? '100%' : '0%'
                                                }}></div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Forms Container */}
                        <div className="flex-1 flex flex-col justify-center pb-12 mt-4">

                            {/* --- STEP 1: IDENTIFIER --- */}
                            {currentStep === 1 && (
                                <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Account</h2>
                                        <p className="text-gray-500 leading-relaxed">
                                            Enter your registered Roll Number or institutional Email. We'll find your profile and send a recovery code.
                                        </p>
                                    </div>
                                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                className="peer w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-base text-gray-900 outline-none focus:border-[#a50034] focus:ring-1 focus:ring-[#a50034]/20 transition-all placeholder-transparent"
                                                placeholder="Roll Number or Email"
                                                required
                                            />
                                            <label className="absolute left-5 top-4 text-gray-400 text-sm transition-all pointer-events-none peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-[#a50034] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 bg-white px-1 peer-[:not(:placeholder-shown)]:text-[#a50034]">
                                                Roll Number or Email
                                            </label>
                                            <Mail className="absolute right-5 top-4 w-5 h-5 text-gray-400 pointer-events-none" />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-[#a50034] text-white py-4 rounded-xl font-semibold text-base shadow-xl shadow-red-900/10 hover:shadow-red-900/25 active:scale-[0.98] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2 group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            {isSubmitting ? (
                                                <><Loader2 className="w-5 h-5 animate-spin relative" /><span className="relative">Searching...</span></>
                                            ) : (
                                                <><span className="relative">Continue</span><ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" /></>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* --- STEP 2: OTP VERIFICATION --- */}
                            {currentStep === 2 && (
                                <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                    <div className="mb-8">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#a50034] text-xs font-bold uppercase tracking-wider mb-4 border border-red-100">
                                            <ShieldCheck className="w-4 h-4" />
                                            {detectedRole} Account Found
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify it's you</h2>
                                        <p className="text-gray-500 leading-relaxed">
                                            We've sent a 6-digit secure code to your email. Enter it below to verify your identity.
                                        </p>
                                    </div>
                                    <form onSubmit={handleOtpSubmit} className="space-y-8">
                                        {/* 6-Digit OTP Boxes */}
                                        <div className="flex justify-between gap-2 md:gap-3">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={otpRefs[index]}
                                                    type="text"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#a50034] focus:ring-2 focus:ring-[#a50034]/20 focus:bg-white transition-all text-gray-900"
                                                    required
                                                />
                                            ))}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || otp.join('').length !== 6}
                                            className="w-full bg-[#a50034] text-white py-4 rounded-xl font-semibold text-base shadow-xl shadow-red-900/10 hover:shadow-red-900/25 active:scale-[0.98] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2 group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <><Loader2 className="w-5 h-5 animate-spin relative" /><span className="relative">Verifying...</span></>
                                            ) : (
                                                <><span className="relative">Verify Code</span><CheckCircle2 className="w-5 h-5 relative" /></>
                                            )}
                                        </button>
                                        <p className="text-center text-sm text-gray-500">
                                            Didn't receive a code? <button type="button" className="text-[#a50034] font-semibold hover:underline">Resend Email</button>
                                        </p>
                                    </form>
                                </div>
                            )}

                            {/* --- STEP 3: NEW PASSWORD --- */}
                            {currentStep === 3 && (
                                <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h2>
                                        <p className="text-gray-500 leading-relaxed">
                                            Your identity has been verified. Please create a strong and secure password for your account.
                                        </p>
                                    </div>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-6">

                                        {/* New Password */}
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="peer w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-base text-gray-900 outline-none focus:border-[#a50034] focus:ring-1 focus:ring-[#a50034]/20 transition-all placeholder-transparent pr-12"
                                                placeholder="New Password"
                                                required
                                            />
                                            <label className="absolute left-5 top-4 text-gray-400 text-sm transition-all pointer-events-none peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-[#a50034] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 bg-white px-1 peer-[:not(:placeholder-shown)]:text-[#a50034]">
                                                New Password
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-4 text-gray-400 hover:text-[#a50034] transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="peer w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-base text-gray-900 outline-none focus:border-[#a50034] focus:ring-1 focus:ring-[#a50034]/20 transition-all placeholder-transparent pr-12"
                                                placeholder="Confirm Password"
                                                required
                                            />
                                            <label className="absolute left-5 top-4 text-gray-400 text-sm transition-all pointer-events-none peer-placeholder-shown:text-base peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-[#a50034] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 bg-white px-1 peer-[:not(:placeholder-shown)]:text-[#a50034]">
                                                Confirm Password
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-5 top-4 text-gray-400 hover:text-[#a50034] transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !newPassword || !confirmPassword}
                                            className="w-full bg-[#a50034] text-white py-4 rounded-xl font-semibold text-base shadow-xl shadow-red-900/10 hover:shadow-red-900/25 active:scale-[0.98] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2 group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <><Loader2 className="w-5 h-5 animate-spin relative" /><span className="relative">Updating...</span></>
                                            ) : (
                                                <><span className="relative">Reset Password</span><Lock className="w-5 h-5 relative" /></>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification (Auto-closes) */}
            {showToast && (
                <div className={`fixed bottom-6 left-6 right-6 md:left-auto md:bottom-8 md:right-8 transform transition-all duration-400 z-50 bg-white border-l-4 ${toastType === 'error' ? 'border-red-500' : 'border-green-500'} shadow-2xl rounded-xl p-4 md:p-5 flex items-center gap-4 md:min-w-[360px] pr-8 ring-1 ring-black/5 animate-fadeInUp`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${toastType === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} flex items-center justify-center shrink-0`}>
                        <ToastIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base">{toastMessage.title}</h4>
                        <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">{toastMessage.message}</p>
                    </div>
                    <button onClick={hideToast} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

// Wrapping the export to safely provide a Router context if the preview environment does not have one
export default function ForgotPasswordPageWrapper() {
    const inRouter = useInRouterContext();
    if (!inRouter) {
        return (
            <MemoryRouter>
                <ForgotPasswordPage />
            </MemoryRouter>
        );
    }
    return <ForgotPasswordPage />;
}