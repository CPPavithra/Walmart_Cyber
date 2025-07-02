import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col } from 'antd';

const BotTrapStats = ({ events }) => {
  const [stats, setStats] = useState({
    totalBots: 0,
    todayBots: 0,
    countries: 0,
    uniqueIps: 0
  });

  useEffect(() => {
    if (events && events.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = events.filter(e => e.timestamp.startsWith(today));
      const uniqueIps = new Set(events.map(e => e.ip)).size;
      const countries = new Set(events.map(e => e.metadata.country).filter(Boolean)).size;
      
      setStats({
        totalBots: events.length,
        todayBots: todayEvents.length,
        countries,
        uniqueIps
      });
    }
  }, [events]);

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic title="Total Bots Caught" value={stats.totalBots} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Bots Today" value={stats.todayBots} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Unique IPs" value={stats.uniqueIps} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="Countries" value={stats.countries} />
        </Card>
      </Col>
    </Row>
  );
};

export default BotTrapStats;
