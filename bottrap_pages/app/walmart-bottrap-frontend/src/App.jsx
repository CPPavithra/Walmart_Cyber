import React, { useState, useEffect } from 'react';
import { Chart } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [products, setProducts] = useState([]);
  const [attacks, setAttacks] = useState([]);
  const [stats, setStats] = useState({
    totalAttacks: 0,
    attacksToday: 0,
    countries: new Set()
  });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    const connectWebSocket = () => {
      ws.onopen = () => {
        console.log('WebSocket Connected');
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'attack_blocked') {
            setAttacks(prev => [data, ...prev.slice(0, 9)]);
            setStats(prev => ({
              totalAttacks: prev.totalAttacks + 1,
              attacksToday: prev.attacksToday + 1,
              countries: prev.countries.add(data.metadata?.country || 'Unknown')
            }));
            playAlertSound();
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    // Fetch products
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch products:', err));

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const playAlertSound = () => {
    const audio = new Audio('/alert.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const attackChartData = {
    labels: attacks.map((_, i) => `Attack ${i + 1}`),
    datasets: [{
      label: 'Attack Severity',
      data: attacks.map(() => Math.floor(Math.random() * 100) + 20),
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
    }]
  };

  return (
    <div className="app">
      <header className="walmart-header">
        <div className="logo">Walmart</div>
        <div className="search">
          <input type="text" placeholder="Search millions of items..." />
          <button>Search</button>
        </div>
        <div className="cart">Cart (0)</div>
      </header>

      <div className="container">
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img 
                src={`/static/${product.image}`} 
                alt={product.name} 
                onError={(e) => {
                  e.target.src = '/static/placeholder.jpg';
                }}
              />
              <h3>{product.name}</h3>
              <p>${product.price.toFixed(2)}</p>
              <button>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      <div className="security-dashboard">
        <h2>🚨 LIVE BOT ATTACKS BLOCKED</h2>
        
        <div className="stats">
          <div className="stat-card">
            <h3>Total Attacks</h3>
            <p>{stats.totalAttacks}</p>
          </div>
          <div className="stat-card">
            <h3>Today</h3>
            <p>{stats.attacksToday}</p>
          </div>
          <div className="stat-card">
            <h3>Countries</h3>
            <p>{stats.countries.size}</p>
          </div>
        </div>

        <div className="chart-container">
          <Chart 
            type="bar" 
            data={attackChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Recent Attack Severity',
                },
              },
            }}
          />
        </div>

        <div className="attack-log">
          <h3>Recent Attack Attempts</h3>
          <ul>
            {attacks.map((attack, i) => (
              <li key={i}>
                <span className="ip">{attack.ip}</span>
                <span className="type">{attack.attack_type}</span>
                <span className="country">
                  {attack.metadata?.country || 'Unknown'}
                </span>
                <span className="time">
                  {new Date(attack.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
