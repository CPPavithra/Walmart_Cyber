import React from "react";

export default function LogTable({ logs }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Fingerprint</th>
            <th>Prediction</th>
            <th>Hash</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{log.timestamp}</td>
              <td>{log.fingerprint.slice(0, 10)}...</td>
              <td>{log.prediction}</td>
              <td>{log.current_hash.slice(0, 10)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
