import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Pages/Faculty/Dashboard";
import TimeTable from "./Pages/Faculty/TimeTable";
import Workload from "./Pages/Faculty/Workload";
import LeaveForm from "./Pages/Faculty/LeaveForm";
import Allocations from "./Pages/Faculty/Allocations";
import Announcements from "./Pages/Faculty/Announcements";
import Reports from "./Pages/Faculty/Reports";
import AuthPage from "./Pages/AuthPage";
import { AppContext } from "./context/AppContext";

import StudentDashboard from "./Pages/Student/Dashboard";
import StudentAnnouncements from "./Pages/Student/Announcements";
import SectionTimeTable from "./Pages/Student/SectionTimeTable";
import TeachersTimeTable from "./Pages/Student/TeachersTimeTable";

const App = () => {
  const { isAuthenticated, userRole } = useContext(AppContext);

  return (
    <Routes>
      <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />} />
      <Route path="/" element={!isAuthenticated ? <Navigate to="/auth" /> : <Navigate to="/dashboard" />} />
      
      {/* Universal Dashboard Route - Redirects based on role */}
      <Route path="/dashboard" element={
        isAuthenticated 
          ? (userRole === 'student' ? <Navigate to="/student/dashboard" /> : <Dashboard />) 
          : <Navigate to="/auth" />
      } />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={isAuthenticated && userRole === 'student' ? <StudentDashboard /> : <Navigate to="/auth" />} />
      <Route path="/student/announcements" element={isAuthenticated && userRole === 'student' ? <StudentAnnouncements /> : <Navigate to="/auth" />} />
      <Route path="/student/section-timetable" element={isAuthenticated && userRole === 'student' ? <SectionTimeTable /> : <Navigate to="/auth" />} />
      <Route path="/student/teachers-timetable" element={isAuthenticated && userRole === 'student' ? <TeachersTimeTable /> : <Navigate to="/auth" />} />

      {/* Faculty Routes */}
      <Route path="/time-table" element={isAuthenticated ? <TimeTable /> : <Navigate to="/auth" />} />
      <Route path="/workload" element={isAuthenticated ? <Workload /> : <Navigate to="/auth" />} />
      <Route path="/reports" element={isAuthenticated ? <Reports /> : <Navigate to="/auth" />} />
      <Route path="/leave-form" element={isAuthenticated ? <LeaveForm /> : <Navigate to="/auth" />} />
      <Route path="/allocations" element={isAuthenticated ? <Allocations /> : <Navigate to="/auth" />} />
      <Route path="/announcements" element={isAuthenticated ? <Announcements /> : <Navigate to="/auth" />} />
    </Routes>
  );
};

export default App;
