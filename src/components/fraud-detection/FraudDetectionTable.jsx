// src/components/fraud-detection/FraudDetectionTable.jsx
import React, { useState, useEffect } from 'react';
import './FraudDetectionTable.css';

function FraudDetectionTable({ logs }) {
  return (
    <div className="fraud-table">
      <h3>Recent Activity</h3>
      <table>
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Type</th>
            <th>Clicks</th>
            <th>Duration (s)</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className={log.prediction === 'bot' ? 'bot-row' : 'human-row'}>
              <td>{log.session_id}</td>
              <td>
                <span className={`prediction-tag ${log.prediction}`}>
                  {log.prediction}
                </span>
              </td>
              <td>{log.clicks_per_session}</td>
              <td>{log.session_duration.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FraudDetectionTable;
