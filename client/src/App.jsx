import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Pages/dashboard";
import Calender from "./Pages/TimeTable";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/calendar" element={<Calender />} />
    </Routes>
  );
};

export default App;
