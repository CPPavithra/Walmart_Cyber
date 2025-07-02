import React,{ useEffect, useState } from 'react';
import { Line } from '@ant-design/charts';

const BotTrapChart = ({ events }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (events && events.length > 0) {
      const dailyCounts = events.reduce((acc, event) => {
        const date = event.timestamp.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(dailyCounts).map(([date, count]) => ({
        date,
        count,
        name: 'Bot Detections'
      }));

      setData(chartData);
    }
  }, [events]);

  const config = {
    data,
    xField: 'date',
    yField: 'count',
    seriesField: 'name',
    point: {
      size: 5,
      shape: 'diamond',
    },
    legend: {
      position: 'top',
    },
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 5000,
      },
    },
  };

  return <Line {...config} />;
};

export default BotTrapChart;
