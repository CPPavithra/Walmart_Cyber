// src/components/dashboard/BotTrapMini.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Spin, Statistic, Alert } from 'antd';

function BotTrapMini() {
  const [botCount, setBotCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBotData = async () => {
      try {
        const response = await fetch('http://localhost:8000/bot-trap/events');
        const data = await response.json();
        setBotCount(data.length);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBotData();
  }, []);

  if (loading) return <Spin />;
  if (error) return <Alert message={error} type="error" />;

  return (
    <div className="bot-trap-mini">
      <Statistic title="Bots Caught" value={botCount} />
      <div style={{ marginTop: 16 }}>
        <Link to="/bot-trap">View Details</Link>
      </div>
    </div>
  );
}

export default BotTrapMini;
