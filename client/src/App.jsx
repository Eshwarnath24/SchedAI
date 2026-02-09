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

const App = () => {
  const { isAuthenticated } = useContext(AppContext);

  return (
    <Routes>
      <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />} />
      <Route path="/" element={!isAuthenticated ? <Navigate to="/auth" /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
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
