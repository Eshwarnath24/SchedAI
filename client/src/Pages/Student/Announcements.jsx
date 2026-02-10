import React, { useState } from 'react';
import { Pin } from 'lucide-react';
import StudentLayout from './Layout';
import { ANNOUNCEMENTS, getAnnouncementIcon } from '../../utils/mockData';

const Announcements = () => {
    const [filter, setFilter] = useState('All');
    
    // Add icons to announcements
    const announcementsWithIcons = ANNOUNCEMENTS.map(a => ({
        ...a,
        icon: getAnnouncementIcon(a.category)
    }));
  
    const filteredAnnouncements = filter === 'All' 
      ? announcementsWithIcons 
      : announcementsWithIcons.filter(a => a.category === filter);
  
    const pinned = filteredAnnouncements.filter(a => a.isPinned);
    const others = filteredAnnouncements.filter(a => !a.isPinned);
  
    return (
      <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Announcements</h2>
            <p className="text-sm text-gray-500">Stay updated with latest news</p>
          </div>
          
          <div className="flex items-center gap-2">
             {['All', 'Academic', 'Exam', 'Event'].map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`
                   px-3 py-1.5 text-xs font-bold rounded-lg transition-colors
                   ${filter === f 
                     ? 'bg-[#A41034] text-white' 
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                 `}
               >
                 {f}
               </button>
             ))}
          </div>
        </div>
  
        <div className="grid grid-cols-1 gap-6">
          {/* Pinned Section */}
          {pinned.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Pin size={14} className="transform rotate-45"/> Pinned
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinned.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-l-4 border-l-[#A41034] border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                       <div className={`p-2 rounded-lg ${item.color}`}>
                         <item.icon size={20} />
                       </div>
                       <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                         {item.category}
                       </span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                    <div className="text-xs font-medium text-gray-400">{item.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Other Announcements */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Recent Updates</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
               {others.length > 0 ? (
                 others.map(item => (
                   <div key={item.id} className="p-5 flex gap-4 hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                         <item.icon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 text-sm md:text-base">{item.title}</h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{item.date}</span>
                        </div>
                        <span className="inline-block mt-1 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="p-8 text-center text-gray-400">
                   No announcements found for this category.
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
      </StudentLayout>
    );
  };

export default Announcements;
