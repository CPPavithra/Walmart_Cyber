import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Spin, Alert } from 'antd';
import { useWebSocket } from '../../hooks/useWebSocket';

const MerkelClusters = () => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await fetch('http://localhost:8000/merkel-logging/clusters');
        const data = await response.json();
        setClusters(Object.entries(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, []);

  // WebSocket for real-time updates
  useWebSocket('ws://localhost:8000/merkel-logging/ws-merkel', (message) => {
    fetchClusters(); // Refresh clusters on new log
  });

  const columns = [
    {
      title: 'Cluster ID',
      dataIndex: '0',
      key: 'cluster_id',
    },
    {
      title: 'Members',
      dataIndex: '1',
      key: 'members',
      render: members => (
        <Tag color={members.length > 2 ? 'red' : 'orange'}>
          {members.length} fingerprints
        </Tag>
      ),
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => (
        <div>
          <p>First seen: {record[1][0].timestamp}</p>
          <p>Latest: {record[1][record[1].length - 1].timestamp}</p>
        </div>
      ),
    },
  ];

  if (loading) return <Spin tip="Loading clusters..." />;
  if (error) return <Alert message={error} type="error" />;

  return (
    <Card title="Bot Fingerprint Clusters">
      <Table
        columns={columns}
        dataSource={clusters}
        rowKey="0"
        pagination={false}
      />
    </Card>
  );
};

export default MerkelClusters;
