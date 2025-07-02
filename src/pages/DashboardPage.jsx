// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import OverviewCards from '../components/dashboard/OverviewCards';
import './DashboardPage.css';

function DashboardPage() {
  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Security Dashboard</h1>
      <OverviewCards />
    </div>
  );
}

export default DashboardPage;
