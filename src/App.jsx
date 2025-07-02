// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import FraudDetectionPage from './pages/FraudDetectionPage';
import BotTrapPage from './pages/BotTrapPage';
import MerkelLoggingPage from './pages/MerkelLoggingPage';
import './App.css';

function App() {
  return (
    <AntdApp>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="fraud-detection" element={<FraudDetectionPage />} />
            <Route path="bot-trap" element={<BotTrapPage />} />
            <Route path="merkel-logging" element={<MerkelLoggingPage />} />
          </Route>
        </Routes>
      </Router>
    </AntdApp>
  );
}

export default App;

