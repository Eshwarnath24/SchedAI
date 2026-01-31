import React, { useState } from "react";
import Dashboard from "./Pages/dashboard";
import TimeTable from "./Pages/TimeTable";

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div>
      {activeTab === "dashboard" && <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />}
      {activeTab === "time-table" && <TimeTable activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
};

export default App;
