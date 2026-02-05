import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';

const EngagementCurveChart = ({ chartTimeline, todayXCoordinate, reportMetrics }) => {
    return (
        <div className="flex-1 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
                <div>
                    {/* lg → xl */}
                    <h3 className="font-black text-slate-800 text-xl tracking-tight">Academic Engagement Curve</h3>
                    {/* xs → sm */}
                    <p className="text-sm text-slate-400 font-medium mt-1">Measuring student digital interaction density vs instruction hours</p>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-1.5 flex items-center gap-2 group cursor-help">
                    <TrendingUp size={14} className="text-emerald-500" />
                    {/* 10px → 12px */}
                    <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">Live Prediction</span>
                </div>
            </div>

            <div className="relative h-64 w-full px-2">
                <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="academicGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{stopColor:'#8B0000', stopOpacity: 0.1}} />
                            <stop offset="100%" style={{stopColor:'#8B0000', stopOpacity: 0}} />
                        </linearGradient>
                    </defs>
                    {[0, 50, 100, 150].map(y => (
                        <line key={`grid-${y}`} x1="0" y1={y} x2="700" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    ))}
                    
                    <path d="M0,160 Q100,160 200,150 T400,120 T500,90 T600,100 T700,110 V200 H0 Z" fill="url(#academicGrad)" />
                    
                    <path d={`M0,160 Q100,160 200,150 T400,120 T${todayXCoordinate},90`} fill="none" stroke="#8B0000" strokeWidth="3" strokeLinecap="round" />
                    <path d={`M${todayXCoordinate},90 T600,100 T700,110`} fill="none" stroke="#8B0000" strokeWidth="3" strokeDasharray="6,4" strokeLinecap="round" className="opacity-40" />
                    
                    <circle cx={todayXCoordinate} cy="90" r="6" fill="#8B0000" stroke="white" strokeWidth="3" />
                </svg>

                <div 
                    className="absolute top-10 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl scale-95 border border-white/10"
                    style={{ left: `${(todayXCoordinate / 700) * 100}%`, transform: 'translateX(-50%)' }}
                >
                    {/* 9px → 11px */}
                    <p className="text-[11px] font-black opacity-40 mb-1 uppercase tracking-widest text-center">Today</p>
                    {/* xs → sm */}
                    <p className="text-sm font-bold whitespace-nowrap">{reportMetrics.shortMonth} {reportMetrics.day}</p>
                </div>
            </div>

            <div className="flex justify-between mt-8 px-4">
                {chartTimeline.map((item, i) => (
                    /* 10px → 12px */
                    <span key={`timeline-${item.day}-${i}`} className={`text-[12px] font-black uppercase tracking-widest transition-colors ${item.isToday ? 'text-[#8B0000]' : 'text-slate-300'}`}>
                       {item.day}
                    </span>
                ))}
            </div>

            <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#8B0000] shrink-0">
                    <Zap size={20} />
                </div>
                <div>
                    {/* 11px → 13px */}
                    <p className="text-[13px] font-bold text-slate-800 mb-1">Pedagogical Engagement Breakdown</p>
                    {/* 10px → 12px */}
                    <p className="text-[12px] text-slate-500 leading-relaxed">
                        The curve represents student digital activity against your instructional hours. 
                        The <strong>solid line</strong> shows verified interactions over the last week, while the <strong>dotted line</strong> forecasts upcoming engagement needs.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EngagementCurveChart;
