import React from "react";

const InfoBlock = ({ icon, label, value, className = "", iconColor = "text-slate-400" }) => (
    <div className={`p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-slate-50/50 group ${className}`}>
        <div className={`mb-3 p-2 rounded-lg bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform ${iconColor}`}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
            {label}
        </p>
        <span className="text-base font-black text-slate-900">{value}</span>
    </div>
);

export default InfoBlock;
