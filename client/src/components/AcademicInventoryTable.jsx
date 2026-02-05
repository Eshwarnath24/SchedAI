import React from 'react';

const AcademicInventoryTable = ({ subjects }) => {
    return (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
            <h3 className="font-black text-slate-800 text-xl mb-8 tracking-tight">Academic Inventory</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[12px] font-black text-slate-300 uppercase border-b border-slate-50 pb-6">
                            <th className="pb-6">Code</th>
                            <th className="pb-6">Descriptor</th>
                            <th className="pb-6 text-right">Progress</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {subjects && Object.entries(subjects).map(([name, data], idx) => (
                            <tr key={idx} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                <td className="py-7 text-sm font-mono font-bold text-slate-300">SUB-{idx + 1}</td>
                                <td className="py-7 font-medium text-base text-slate-800 tracking-tight">{name}</td>
                                <td className="py-7 text-right">
                                    <div className="flex flex-col items-end gap-1.5 font-black text-sm">{data.hours} Hours</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AcademicInventoryTable;