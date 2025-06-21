// src/BotnetCluster.jsx
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function BotnetCluster({ logs }) {
  const data = logs
    .filter(log => log.prediction === 'bot')
    .map((log, index) => ({
      x: log.click_rate,
      y: log.session_duration,
      id: log.session_id,
    }));

  return (
    <div className="cluster-panel">
      <h2>🧠 Botnet Fingerprint Clusters</h2>
      <ScatterChart width={600} height={300}>
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="Click Rate" />
        <YAxis type="number" dataKey="y" name="Duration (s)" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Bots" data={data} fill="#ffc220" />
      </ScatterChart>
    </div>
  );
}
