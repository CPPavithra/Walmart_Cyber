import React, { useState, useEffect, useRef } from 'react';
import FraudDetectionChart from './FraudDetectionChart';
import FraudDetectionTable from './FraudDetectionTable';
import './FraudDetection.css';

function FraudDetection() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ bot: 0, human: 0 });
  const [wsConnected, setWsConnected] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const ws = useRef(null);
  const autoGenerateInterval = useRef(null);
  const processedSessionIds = useRef(new Set());

  // WebSocket connection
  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 5000;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:8000/fraud/ws-fraud`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        reconnectAttempts = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.prediction && !processedSessionIds.current.has(data.session_id)) {
            processedSessionIds.current.add(data.session_id);
            addLog(data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`Reconnecting attempt ${reconnectAttempts}/${maxReconnectAttempts}...`);
          setTimeout(connectWebSocket, reconnectDelay);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
      stopAutoGeneration();
      processedSessionIds.current.clear();
    };
  }, []);

  const addLog = (logEntry) => {
    setLogs((prev) => {
      // Filter out duplicates by session_id
      if (prev.some(log => log.session_id === logEntry.session_id)) {
        return prev;
      }
      
      const updated = [logEntry, ...prev.slice(0, 9)];
      const bot = updated.filter((x) => x.prediction === 'bot').length;
      const human = updated.length - bot;
      setStats({ bot, human });
      return updated;
    });
  };

  const generateRandomData = (isBot) => {
    const sessionId = 'guest_' + Math.floor(Math.random() * 100000);
    processedSessionIds.current.add(sessionId);
    return {
      session_id: sessionId,
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
      repeated_paths_ratio: isBot ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3,
      prediction: isBot ? 'bot' : 'human'
    };
  };

  const sendRequest = async (isBot) => {
    const data = generateRandomData(isBot);
    try {
      const response = await fetch('/fraud/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      addLog(result);
      return result;
    } catch (error) {
      console.error('Error submitting data:', error);
      addLog({ ...data, prediction: isBot ? 'bot' : 'human' });
      return data;
    }
  };

  // Manual simulation
  const simulateRequest = async (isBot) => {
    await sendRequest(isBot);
  };

  // Auto-generation functions
  const startAutoGeneration = () => {
    if (isAutoGenerating) return;
    
    setIsAutoGenerating(true);
    autoGenerateInterval.current = setInterval(() => {
      const isBot = Math.random() > 0.7; // 30% chance of being a bot
      sendRequest(isBot);
    }, 3000); // Generate every 3 seconds
  };

  const stopAutoGeneration = () => {
    setIsAutoGenerating(false);
    clearInterval(autoGenerateInterval.current);
  };

  return (
    <div className="fraud-detection">
      <div className="connection-status">
        Status: {wsConnected ? (
          <span style={{color: 'green'}}>Connected</span>
        ) : (
          <span style={{color: 'red'}}>Disconnected</span>
        )}
      </div>
      <div className="fraud-header">
        <h2>AI Fraud Detection</h2>
        <div className="controls-container">
          <div className="fraud-controls">
            <button 
              className="simulate-btn human-btn"
              onClick={() => simulateRequest(false)}
            >
              Simulate Human
            </button>
            <button 
              className="simulate-btn bot-btn"
              onClick={() => simulateRequest(true)}
            >
              Simulate Bot
            </button>
          </div>
          <div className="auto-controls">
            <button 
              onClick={isAutoGenerating ? stopAutoGeneration : startAutoGeneration}
              className={`toggle-btn ${isAutoGenerating ? 'stop' : 'start'}`}
            >
              {isAutoGenerating ? '🛑 Stop Auto' : '▶️ Start Auto'}
            </button>
          </div>
        </div>
      </div>
      <FraudDetectionChart stats={stats} />
      <FraudDetectionTable logs={logs} />
    </div>
  );
}

export default FraudDetection;
