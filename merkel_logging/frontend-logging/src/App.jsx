import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import LogTable from "./components/LogTable";
import ClusterPlot from "./components/ClusterPlot";
import LiveFeed from "./components/LiveFeed";
import "./styles.css";

function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/logs")
      .then(res => res.json())
      .then(setLogs);
  }, []);

  return (
    <div className="app-container">
      <Header />
      <div className="dashboard">
        <div className="column">
          <LiveFeed />
          <LogTable logs={logs} />
        </div>
        <div className="column">
          <ClusterPlot />
        </div>
      </div>
    </div>
  );
}

export default App;
