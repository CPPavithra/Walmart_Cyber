// src/pages/FraudDetectionPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import FraudDetection from '../components/fraud-detection/FraudDetection';
import './FraudDetectionPage.css';

function FraudDetectionPage() {
  return (
    <div className="fraud-detection-page">
      <FraudDetection />
    </div>
  );
}

export default FraudDetectionPage;
