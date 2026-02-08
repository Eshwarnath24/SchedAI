import React, { useState } from 'react';
import { TrendingUp, Zap } from 'lucide-react';

const EngagementCurveChart = ({ chartTimeline, todayXCoordinate, reportMetrics, engagementData, actualPath, predictedPath, todayPoint }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    // Generate gradient fill path for area under curve (only for actual data)
    const generateAreaPath = () => {
        if (!engagementData || engagementData.length === 0 || !actualPath) return '';
        
        const chartHeight = 200;
        const todayIndex = engagementData.findIndex(d => d.isToday);
        
        if (todayIndex === -1) return '';
        
        const actualData = engagementData.slice(0, todayIndex + 1);
        if (actualData.length === 0) return '';
        
        const lastPoint = actualData[actualData.length - 1];
        const firstPoint = actualData[0];
        
        // Create path that includes the curve and closes at the bottom
        return `${actualPath} L${lastPoint.x},${chartHeight} L${firstPoint.x},${chartHeight} Z`;
    };

    return (
        <div className="flex-1 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
                <div>
                    {/* lg → xl */}
                    <h3 className="font-black text-slate-800 text-xl tracking-tight">Academic Engagement Curve</h3>
                    {/* xs → sm */}
                    <p className="text-sm text-slate-400 font-medium mt-1">Measuring workload distribution across the academic week</p>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-1.5 flex items-center gap-2 group cursor-help">
                    <TrendingUp size={14} className="text-emerald-500" />
                    {/* 10px → 12px */}
                    <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">Live Data</span>
                </div>
            </div>

            <div className="relative h-64 w-full px-2">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-right pr-2 text-[10px] font-bold text-slate-300">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                </div>
                
                <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible" style={{ marginLeft: '48px' }}>
                    <defs>
                        <linearGradient id="academicGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{stopColor:'#8B0000', stopOpacity: 0.1}} />
                            <stop offset="100%" style={{stopColor:'#8B0000', stopOpacity: 0}} />
                        </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[0, 50, 100, 150].map(y => (
                        <line key={`grid-${y}`} x1="0" y1={y} x2="700" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    ))}
                    
                    {/* Area fill under curve */}
                    {actualPath && (
                        <path d={generateAreaPath()} fill="url(#academicGrad)" />
                    )}
                    
                    {/* Actual data line (past + today) */}
                    {actualPath && (
                        <path 
                            d={actualPath} 
                            fill="none" 
                            stroke="#8B0000" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        />
                    )}
                    
                    {/* Predicted data line (future) */}
                    {predictedPath && (
                        <path 
                            d={predictedPath} 
                            fill="none" 
                            stroke="#8B0000" 
                            strokeWidth="3" 
                            strokeDasharray="8,6" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            opacity="0.5"
                        />
                    )}
                    
                    {/* Data points - dots for all points */}
                    {engagementData && engagementData.map((point, idx) => (
                        <g key={`point-group-${idx}`}>
                            <circle 
                                cx={point.x} 
                                cy={point.y} 
                                r={point.isToday ? "10" : "5"} 
                                fill={point.isToday ? "#8B0000" : point.isFuture ? "#8B000080" : "#8B0000"}
                                stroke={point.isToday ? "#FFD700" : "white"}
                                strokeWidth={point.isToday ? "4" : "2"}
                                className={`transition-all cursor-pointer ${point.isToday ? 'drop-shadow-[0_4px_8px_rgba(139,0,0,0.6)]' : 'hover:r-6'}`}
                                onMouseEnter={() => setHoveredPoint(point)}
                                onMouseLeave={() => setHoveredPoint(null)}
                                style={{ filter: point.isToday ? 'drop-shadow(0 0 8px rgba(139, 0, 0, 0.8))' : 'none' }}
                            />
                            {/* Pulse animation ring for today */}
                            {point.isToday && (
                                <circle 
                                    cx={point.x} 
                                    cy={point.y} 
                                    r="10" 
                                    fill="none"
                                    stroke="#8B0000"
                                    strokeWidth="2"
                                    opacity="0.3"
                                    className="animate-ping"
                                />
                            )}
                        </g>
                    ))}
                </svg>
                
                {/* Hover tooltip for data points */}
                {hoveredPoint && (
                    <div 
                        className="absolute bg-slate-900 text-white px-3 py-2 rounded-lg shadow-2xl border border-white/10 z-20 pointer-events-none"
                        style={{ 
                            left: `calc(48px + ${(hoveredPoint.x / 700) * 100}%)`, 
                            top: `${(hoveredPoint.y / 200) * 100}%`,
                            transform: 'translate(-50%, -130%)' 
                        }}
                    >
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider mb-0.5">
                            {hoveredPoint.isFuture ? 'Predicted' : hoveredPoint.isToday ? 'Today' : 'Actual'}
                        </p>
                        <p className="text-xs font-black mb-1">{hoveredPoint.label}</p>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-emerald-400 font-bold">{hoveredPoint.hours}h</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-blue-400 font-bold">{hoveredPoint.loadPercent}%</span>
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                )}

                {/* Today tooltip - only shown when not hovering on any point */}
                {todayPoint && !hoveredPoint && (
                    <div 
                        className="absolute bg-slate-900 text-white px-4 py-2 rounded-xl shadow-2xl border border-white/10 z-10"
                        style={{ 
                            left: `calc(48px + ${(todayPoint.x / 700) * 100}%)`, 
                            top: `${(todayPoint.y / 200) * 100}%`,
                            transform: 'translate(-50%, -120%)' 
                        }}
                    >
                        <p className="text-[10px] font-black opacity-60 mb-0.5 uppercase tracking-widest text-center">Today</p>
                        <p className="text-xs font-bold whitespace-nowrap text-center">{reportMetrics.shortMonth} {reportMetrics.day}</p>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-[#8B0000]"></div>
                    <span className="text-slate-600 font-medium">Actual Load</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg width="32" height="2" className="opacity-40">
                        <line x1="0" y1="1" x2="32" y2="1" stroke="#8B0000" strokeWidth="2" strokeDasharray="4,4" />
                    </svg>
                    <span className="text-slate-600 font-medium">Predicted Load</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#8B0000] border-2 border-amber-400 shadow-lg shadow-[#8B0000]/50"></div>
                    <span className="text-slate-600 font-medium">Today</span>
                </div>
            </div>

            <div className="flex justify-between mt-8 px-4">
                {chartTimeline && chartTimeline.map((item, i) => (
                    <div key={`timeline-${item.day}-${i}`} className="flex flex-col items-center">
                        <span className={`text-[13px] font-black transition-all ${
                            item.isToday 
                                ? 'text-[#8B0000] scale-110' 
                                : 'text-slate-300'
                        }`}>
                            {item.day}
                        </span>
                        {item.isToday && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#8B0000] mt-1"></div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#8B0000] shrink-0">
                    <Zap size={20} />
                </div>
                <div>
                    {/* 11px → 13px */}
                    <p className="text-[13px] font-bold text-slate-800 mb-1">Teaching Load Distribution</p>
                    {/* 10px → 12px */}
                    <p className="text-[12px] text-slate-500 leading-relaxed">
                        The curve represents your instructional workload pattern across the week relative to maximum capacity. 
                        The <strong>solid line</strong> shows actual scheduled hours, while the <strong>dotted line</strong> forecasts expected load for upcoming days.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EngagementCurveChart;
