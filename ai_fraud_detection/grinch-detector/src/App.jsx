// BEST Frontend UI for Bot Detection using React + Vite
// Sends 12 features to FastAPI backend and displays results live

import React, { useState } from 'react';
import './App.css'; // Optional for extra styling

function App() {
  const [logs, setLogs] = useState([]);

  const generateRandomData = (isBot) => {
    return {
      session_id: 'session_' + Math.floor(Math.random() * 100000),
      clicks_per_session: isBot ? Math.floor(Math.random() * 40 + 20) : Math.floor(Math.random() * 10 + 1),
      session_duration: isBot ? Math.random() * 60 : Math.random() * 300 + 60,
      time_between_requests: isBot ? Math.random() * 0.5 : Math.random() * 2 + 1,
      ua_entropy: isBot ? Math.random() * 0.3 : Math.random() * 1.2 + 0.8,
      referer_entropy: isBot ? Math.random() * 0.3 : Math.random() * 1.2 + 0.8,
      click_rate: isBot ? Math.random() * 10 + 10 : Math.random() * 2,
      suspicious_ua: isBot ? 1 : 0,
      cookies_enabled: isBot ? 0 : 1,
      time_of_day: Math.floor(Math.random() * 24),
      request_path_depth: isBot ? Math.random() * 1 + 5 : Math.random() * 2 + 1,
      num_unique_pages: isBot ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 10 + 5),
      repeated_paths_ratio: isBot ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3
    };
  };

  const simulateRequest = async (isBot) => {
    const data = generateRandomData(isBot);
    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      const logEntry = { ...data, ...result };
      setLogs((prev) => [logEntry, ...prev.slice(0, 9)]); // Keep last 10
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">🛡️ Grinch Bot Detector - Walmart Edition</h1>
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => simulateRequest(false)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-lg"
        >
          Simulate Human
        </button>
        <button
          onClick={() => simulateRequest(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded text-lg"
        >
          Simulate Bot
        </button>
      </div>

      <table className="w-full text-sm text-left border border-gray-300 shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Session</th>
            <th className="p-2">Clicks</th>
            <th className="p-2">Dur (s)</th>
            <th className="p-2">TBR</th>
            <th className="p-2">UA Ent</th>
            <th className="p-2">Ref Ent</th>
            <th className="p-2">ClickRate</th>
            <th className="p-2">Susp UA</th>
            <th className="p-2">Cookies</th>
            <th className="p-2">Time</th>
            <th className="p-2">PathDepth</th>
            <th className="p-2">Pages</th>
            <th className="p-2">Rep Ratio</th>
            <th className="p-2">XGB</th>
            <th className="p-2">RF</th>
            <th className="p-2">Final</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className="border-t">
              <td className="p-1">{log.session_id}</td>
              <td className="p-1">{log.clicks_per_session}</td>
              <td className="p-1">{log.session_duration.toFixed(1)}</td>
              <td className="p-1">{log.time_between_requests.toFixed(2)}</td>
              <td className="p-1">{log.ua_entropy.toFixed(2)}</td>
              <td className="p-1">{log.referer_entropy.toFixed(2)}</td>
              <td className="p-1">{log.click_rate.toFixed(1)}</td>
              <td className="p-1">{log.suspicious_ua}</td>
              <td className="p-1">{log.cookies_enabled}</td>
              <td className="p-1">{log.time_of_day}</td>
              <td className="p-1">{log.request_path_depth.toFixed(1)}</td>
              <td className="p-1">{log.num_unique_pages}</td>
              <td className="p-1">{log.repeated_paths_ratio.toFixed(2)}</td>
              <td className="p-1">{log.xgb_pred}</td>
              <td className="p-1">{log.rf_pred}</td>
              <td className={`p-1 font-bold ${log.prediction === 'bot' ? 'text-red-600' : 'text-green-600'}`}>
                {log.prediction}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
