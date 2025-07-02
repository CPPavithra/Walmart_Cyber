import { Table, Tag, Tooltip } from 'antd';
import React,{ useEffect, useState } from 'react';
import { format } from 'date-fns';

const BotTrapLog = ({ events }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (events) {
      const formattedData = events.map(event => ({
        key: event._id,
        ip: event.ip,
        type: event.event_type,
        userAgent: event.user_agent,
        country: event.metadata?.country || 'Unknown',
        city: event.metadata?.city || 'Unknown',
        timestamp: format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm:ss'),
        product: event.product_id ? `Product ${event.product_id}` : 'N/A'
      }));
      setData(formattedData);
    }
  }, [events]);

  const columns = [
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Event Type',
      dataIndex: 'type',
      key: 'type',
      render: type => (
        <Tag color={type.includes('attack') ? 'red' : 'orange'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => `${record.city}, ${record.country}`,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'Target',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'User Agent',
      dataIndex: 'userAgent',
      key: 'userAgent',
      render: agent => (
        <Tooltip title={agent}>
          <span style={{ display: 'inline-block', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {agent}
          </span>
        </Tooltip>
      ),
    },
  ];

  return <Table 
    columns={columns} 
    dataSource={data} 
    pagination={{ pageSize: 10 }}
    scroll={{ x: true }}
  />;
};

export default BotTrapLog;
