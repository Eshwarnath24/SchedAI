import React, { useState, useContext } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { Menu, X } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const StudentLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans text-gray-900">
      
      {/* Sidebar Navigation */}
      <StudentSidebar 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[#A41034] rounded flex items-center justify-center text-white font-bold text-sm">A</div>
             <span className="font-bold text-gray-900">Amrita</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
