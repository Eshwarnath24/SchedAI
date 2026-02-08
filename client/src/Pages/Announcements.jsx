import React, { useState, useContext } from 'react';
import { 
  Search, 
  Filter,
  Clock,
  Pin,
  ChevronDown,
  Eye,
  AlertTriangle,
  BookOpen,
  Megaphone,
  Users,
  Image,
  FileText,
  Link,
  Menu
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AnnouncementModal from '../components/AnnouncementModal';
import { AppContext } from '../context/AppContext';
import { 
  filterTypes,
  getTypeIconName,
  getTypeColor,
  getContentTypeIconName,
  getPriorityColor,
  statsConfig,
  formatDate
} from '../utils/announcements';

const Announcements = () => {
  const { announcementsList } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Icon component mapping
  const iconComponents = {
    AlertTriangle,
    BookOpen,
    Megaphone,
    Users,
    Image,
    FileText,
    Link
  };

  const getTypeIcon = (type) => {
    const IconName = getTypeIconName(type);
    const IconComponent = iconComponents[IconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />;
  };

  const getContentTypeIcon = (contentType) => {
    const IconName = getContentTypeIconName(contentType);
    if (!IconName) return null;
    const IconComponent = iconComponents[IconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const filteredAnnouncements = announcementsList.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || announcement.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAnnouncementClick = (announcement) => {
    if (announcement.contentType !== 'text') {
      setSelectedAnnouncement(announcement);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 w-72 md:w-[312px] bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative">
        {/* Mobile Header Toggle */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#8B0000] rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <span className="font-bold text-slate-800">Amrita</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
        </header>

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Announcements</h1>
            <p className="text-slate-600 text-lg">Stay updated with the latest news and important notices</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 bg-white rounded-[2.5rem] p-6 shadow-lg border border-slate-100">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#8B0000]/10 transition-all"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-4 bg-slate-50 rounded-2xl text-slate-700 hover:bg-slate-100 transition-all"
              >
                <Filter className="w-5 h-5" />
                Filter
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex flex-wrap gap-2">
                  {filterTypes.map((filter) => (
                    <button
                      key={filter.type}
                      onClick={() => setFilterType(filter.type)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        filterType === filter.type ? filter.activeColor : filter.inactiveColor
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Announcements List */}
          <div className="space-y-6">
            {filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                {getTypeIcon('general') && <div className="w-16 h-16 text-slate-300 mx-auto mb-4 flex items-center justify-center">{getTypeIcon('general')}</div>}
                <h3 className="text-xl font-bold text-slate-600 mb-2">No announcements found</h3>
                <p className="text-slate-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`bg-white rounded-[2.5rem] p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 group ${
                    announcement.contentType !== 'text' ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handleAnnouncementClick(announcement)}
                >
                  <div className="flex items-start gap-6">
                    {/* Type Icon */}
                    <div className={`p-4 rounded-2xl border-2 ${getTypeColor(announcement.type)}`}>
                      {getTypeIcon(announcement.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-[#8B0000] transition-colors">
                              {announcement.title}
                            </h3>
                            {announcement.contentType !== 'text' && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                                {getContentTypeIcon(announcement.contentType)}
                                <span className="uppercase">{announcement.contentType}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(announcement.date)} at {announcement.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {announcement.author}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {announcement.priority === 'high' && (
                            <Pin className="w-5 h-5 text-red-500" />
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getPriorityColor(announcement.priority)}`}>
                            {announcement.priority}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-700 leading-relaxed text-lg mb-4">
                        {announcement.content}
                      </p>

                      {announcement.contentType !== 'text' && (
                        <div className="flex items-center gap-2 text-[#8B0000] font-semibold">
                          <Eye className="w-4 h-4" />
                          <span>Click to view {announcement.contentType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stats Footer */}
          <div className="mt-12 bg-white rounded-[2.5rem] p-8 shadow-lg border border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {statsConfig.map((stat) => (
                <div key={stat.type}>
                  <div className={`text-3xl font-black ${stat.color} mb-2`}>
                    {announcementsList.filter(a => a.type === stat.type).length}
                  </div>
                  <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        announcement={selectedAnnouncement}
      />
    </div>
  );
};

export default Announcements;