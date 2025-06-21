import React, { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function ClusterPlot() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/clusters")
      .then(res => res.json())
      .then(clusters => {
        const dataset = Object.entries(clusters).map(([label, items], i) => ({
          label: `Cluster ${label}`,
          data: items.map((_, idx) => ({ x: idx, y: i })),
          backgroundColor: `hsl(${i * 60}, 70%, 60%)`
        }));
        setData({ datasets: dataset || [] });
      });
  }, []);

  return (
    <div className="scatter-container">
      <h2>Botnet Clusters</h2>
      {data && data.datasets && data.datasets.length > 0 ? (
        <Scatter data={data} />
      ) : (
        <p>No cluster data available</p>
      )}
    </div>
  );
}
