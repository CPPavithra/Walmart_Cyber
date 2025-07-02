// src/components/dashboard/OverviewCards.jsx
import React, { useState, useEffect } from 'react';
import FraudDetectionMini from './FraudDetectionMini';
import BotTrapMini from './BotTrapMini';
import './OverviewCards.css';

function OverviewCards() {
  return (
    <div className="overview-cards">
      <div className="card fraud-card">
        <h3>AI Fraud Detection</h3>
        <FraudDetectionMini />
      </div>
      <div className="card bot-trap-card">
        <h3>Bot Trap Monitor</h3>
        <BotTrapMini />
      </div>
    </div>
  );
}

export default OverviewCards;
