import React from 'react';

const ReportLoadingScreen = () => {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-white font-sans">
            <div className="relative flex flex-col items-center">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-50"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-[#8B0000] border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 40 40" className="text-[#FFC107]">
                            <path d="M0 20 L8 20 L12 10 L18 30 L24 15 L28 25 L32 20 L40 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">Synthesizing Reports</h2>
                <div className="bg-red-50/50 border border-red-100 px-5 py-1.5 rounded-full">
                    <p className="text-[9px] font-black tracking-[0.2em] text-[#8B0000] uppercase animate-pulse">PROCESSING ACADEMIC RECORDS...</p>
                </div>
            </div>
        </div>
    );
};

export default ReportLoadingScreen;
