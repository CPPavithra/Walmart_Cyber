import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Spin, Alert } from 'antd';
import { useWebSocket } from '../../hooks/useWebSocket';

const MerkelLogTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://localhost:8000/merkel-logging/logs?limit=100');
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // WebSocket for real-time updates
  useWebSocket('ws://localhost:8000/merkel-logging/ws-merkel', (message) => {
    setLogs(prev => [JSON.parse(message), ...prev]);
  });

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 200,
    },
    {
      title: 'Fingerprint',
      dataIndex: 'fingerprint',
      key: 'fingerprint',
      render: fp => <code>{fp.slice(0, 8)}...</code>,
    },
    {
      title: 'Prediction',
      dataIndex: 'prediction',
      key: 'prediction',
      render: pred => (
        <Tag color={pred === 'bot' ? 'red' : 'green'}>
          {pred.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Request Path',
      dataIndex: 'request_path',
      key: 'request_path',
    },
    {
      title: 'Chain Hash',
      dataIndex: 'current_hash',
      key: 'hash',
      render: hash => <code>{hash.slice(0, 8)}...</code>,
    },
  ];

  if (loading) return <Spin tip="Loading logs..." />;
  if (error) return <Alert message={error} type="error" />;

  return (
    <Card title="Immutable Request Logs">
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="current_hash"
        pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />
    </Card>
  );
};

export default MerkelLogTable;
