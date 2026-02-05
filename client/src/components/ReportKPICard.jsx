import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const ReportKPICard = ({ label, val, unit, icon: Icon, sub }) => {
    return (
        <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:translate-y-[-2px] transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                    <Icon size={20} />
                </div>
                <MoreHorizontal size={16} className="text-slate-200" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                {label}
            </p>
            <div className="flex items-baseline gap-1">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                    {val}
                </h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    {unit}
                </span>
            </div>
        </div>
    );
};

export default ReportKPICard;
