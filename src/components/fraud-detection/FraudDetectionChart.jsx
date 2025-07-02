// src/components/fraud-detection/FraudDetectionChart.jsx
import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './FraudDetectionChart.css';

const COLORS = ['#4CAF50', '#F44336'];

function FraudDetectionChart({ stats }) {
  const data = [
    { name: 'Human', value: stats.human },
    { name: 'Bot', value: stats.bot }
  ];

  return (
    <div className="fraud-chart">
      <h3>Activity Distribution</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default FraudDetectionChart;
