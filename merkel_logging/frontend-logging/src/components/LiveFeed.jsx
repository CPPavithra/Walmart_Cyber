import React, { useEffect, useState } from 'react';

export default function LiveFeed() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setEntries(prev => [data, ...prev]);
    };
    return () => ws.close();
  }, []);

  return (
    <div>
      <h2>Live Log Feed</h2>
      <ul>
        {entries.map((entry, i) => (
          <li key={i}>{entry.timestamp} - {entry.prediction} - {entry.fingerprint.slice(0, 10)}</li>
        ))}
      </ul>
    </div>
  );
}
