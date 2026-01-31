import React, { useState } from "react";
import Dashboard from "./Pages/Dashboard";
import TimeTable from "./Pages/TimeTable";
import Workload from "./Pages/Workload";
import LeaveForm from "./Pages/LeaveForm";
import Allocations from "./Pages/Allocations";
import Announcements from "./Pages/Announcements";

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div>
      {activeTab === "dashboard" && <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />}
      {activeTab === "time-table" && <TimeTable activeTab={activeTab} setActiveTab={setActiveTab} />}
      {activeTab === "workload" && <Workload activeTab={activeTab} setActiveTab={setActiveTab} />}
      {activeTab === "leave-form" && <LeaveForm activeTab={activeTab} setActiveTab={setActiveTab} />}
      {activeTab === "allocations" && <Allocations activeTab={activeTab} setActiveTab={setActiveTab} />}
      {activeTab === "announcements" && <Announcements activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
};

export default App;
