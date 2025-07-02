// src/components/dashboard/FraudDetectionMini.jsx
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import React, { useState, useEffect, useRef } from 'react';
import './FraudDetectionMini.css';

const COLORS = ['#4CAF50', '#F44336'];

function FraudDetectionMini() {
  const [data, setData] = useState([
    { name: 'Human', value: 70 },
    { name: 'Bot', value: 30 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData([
        { name: 'Human', value: Math.floor(Math.random() * 60) + 30 },
        { name: 'Bot', value: Math.floor(Math.random() * 40) + 10 }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mini-fraud">
      <div className="mini-chart">
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mini-stats">
        <div className="stat">
          <span className="stat-label">Human</span>
          <span className="stat-value">{data[0].value}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Bot</span>
          <span className="stat-value">{data[1].value}%</span>
        </div>
      </div>
    </div>
  );
}

export default FraudDetectionMini;
