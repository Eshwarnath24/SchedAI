import React, { useState } from 'react';
import { Info, X, FileText } from 'lucide-react';

const EfficiencyGauge = ({ reportMetrics }) => {
    const [showCreditInfo, setShowCreditInfo] = useState(false);

    return (
        <div className="w-full xl:w-[380px] bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-10">
                <span className="text-[12px] font-black text-slate-300 uppercase tracking-widest">
                    Instructional Efficiency
                </span>
                <button 
                    onClick={() => setShowCreditInfo(true)}
                    className="p-2 bg-white border border-slate-100 text-[#8B0000] rounded-xl cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                    <Info size={16} />
                </button>
            </div>

            {showCreditInfo ? (
                <div className="w-full flex flex-col animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-[#8B0000] rounded-full"></div>
                            <h4 className="font-black text-slate-800 text-xs uppercase tracking-tight">
                                Teaching Credit Guide
                            </h4>
                        </div>
                        <button onClick={() => setShowCreditInfo(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                            <X size={16}/>
                        </button>
                    </div>

                    <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                        <p>Academic point systems balance workload effort across different class types.</p>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                            <div className="flex justify-between">
                                <span className="font-bold text-slate-800">Theory Lecture</span>
                                <span className="text-[#8B0000] font-black">1.0 / hr</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-slate-800">Lab Session</span>
                                <span className="text-blue-500 font-black">0.75 / hr</span>
                            </div>
                        </div>
                        <p className="italic text-[11px]">
                            Result: 4 hours in Lab = 3 hours Theory. This ensures prep time is fairly credited.
                        </p>
                    </div>

                    <button 
                        onClick={() => setShowCreditInfo(false)} 
                        className="mt-4 w-full bg-[#8B0000] text-white py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95 transition-all"
                    >
                        I Understand
                    </button>
                </div>
            ) : (
                <>
                    <div className="relative h-32 w-48 mb-10 text-center">
                        <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
                            <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
                            <path 
                                d="M10,50 A40,40 0 0,1 75,18" 
                                fill="none" 
                                stroke="#8B0000" 
                                strokeWidth="12" 
                                strokeLinecap="round" 
                                strokeDasharray="126" 
                                strokeDashoffset={126 - (126 * (reportMetrics.efficiencyPercentage || 0) / 100)}
                                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col justify-end">
                            <h4 className="text-4xl font-black text-slate-900 leading-none">
                                {(reportMetrics.efficiencyScore || 0).toFixed(2)}
                            </h4>
                        </div>
                    </div>

                    <button className="w-full bg-[#8B0000] text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-red-900/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <FileText size={16} />
                        <span>View Detailed Log</span>
                    </button>

                    <div className="flex justify-between w-full mt-10 pt-8 border-t border-slate-50">
                        <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-black text-slate-800">{reportMetrics.weeklyLoad}h</span>
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Completed</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[13px] font-black text-emerald-500">
                                {(reportMetrics.efficiencyPercentage || 0).toFixed(1)}%
                            </span>
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Efficiency</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default EfficiencyGauge;
