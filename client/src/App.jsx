import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import TimeTable from "./Pages/TimeTable";
import Workload from "./Pages/Workload";
import LeaveForm from "./Pages/LeaveForm";
import Allocations from "./Pages/Allocations";
import Announcements from "./Pages/Announcements";
import Reports from "./Pages/Reports";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/time-table" element={<TimeTable />} />
      <Route path="/workload" element={<Workload />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/leave-form" element={<LeaveForm />} />
      <Route path="/allocations" element={<Allocations />} />
      <Route path="/announcements" element={<Announcements />} />
    </Routes>
  );
};

export default App;
