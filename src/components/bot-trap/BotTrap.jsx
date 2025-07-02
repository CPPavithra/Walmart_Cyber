import React,{ useEffect, useState, useRef } from 'react';
import { Card, Alert, Typography, Spin, Empty, notification } from 'antd';
import BotTrapStats from './BotTrapStats';
import BotTrapChart from './BotTrapChart';
import BotTrapLog from './BotTrapLog';

const { Title, Text } = Typography;

const BotTrap = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const ws = useRef(null);
  const processedEventIds = useRef(new Set());
  const [api, contextHolder] = notification.useNotification();

  // Show error notification
  const showError = (message) => {
    notification.error({
      message: 'Bot Trap Error',
      description: message,
      placement: 'bottomRight',
      duration: 4.5,
    });
  };  // Validate event structure
  const isValidEvent = (event) => {
    return event && 
           typeof event === 'object' && 
           event.ip && 
           event.event_type && 
           event.timestamp;
  };

  // Function to add new event with deduplication and validation
  const addEvent = (newEvent) => {
    try {
      if (!isValidEvent(newEvent)) {
        throw new Error(`Invalid event format: ${JSON.stringify(newEvent)}`);
      }

      const eventKey = `${newEvent.timestamp}_${newEvent.ip}_${newEvent.event_type}`;
      if (!processedEventIds.current.has(eventKey)) {
        processedEventIds.current.add(eventKey);
        setEvents(prev => [{
          ...newEvent,
          id: eventKey // Add unique id for React keys
        }, ...prev]);
      }
    } catch (err) {
      console.error('Error adding event:', err);
      showError(`Failed to process bot event: ${err.message}`);
    }
  };

  // WebSocket connection with reconnection logic
  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 5000;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:8000/bot-trap/ws-bot`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Bot Trap WebSocket connected');
        setWsConnected(true);
        reconnectAttempts = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!isValidEvent(data)) {
            throw new Error('Invalid WebSocket message format');
          }
          addEvent(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          showError('Failed to parse bot event data');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
        showError('WebSocket connection error');
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`Reconnecting attempt ${reconnectAttempts}/${maxReconnectAttempts}...`);
          setTimeout(connectWebSocket, reconnectDelay);
        } else {
          showError('Max reconnection attempts reached');
        }
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
      processedEventIds.current.clear();
    };
  }, []);

  // Initial data load with error handling
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/bot-trap/events');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }

        const validEvents = data.filter(isValidEvent);
        setEvents(validEvents);
        
        // Add existing events to processed IDs
        validEvents.forEach(event => {
          processedEventIds.current.add(`${event.timestamp}_${event.ip}_${event.event_type}`);
        });

      } catch (err) {
        console.error('Error fetching bot events:', err);
        setError(err.message);
        showError(`Failed to load bot events: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Render loading state
  if (loading && events.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Spin size="large" tip="Loading Bot Trap Data..." />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        {contextHolder}
        <Alert
          message="Error Loading Bot Trap"
          description={error}
          type="error"
          showIcon
        />
        <div style={{ marginTop: '16px' }}>
          <Text>Try refreshing the page or check your network connection.</Text>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!loading && events.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              No bot events detected yet. Try accessing <br/>
              <a href="/bot-trap/product/1" target="_blank">/bot-trap/product/1</a> or 
              <a href="/deals/special-offer" target="_blank">/deals/special-offer</a> to test.
            </span>
          }
        />
      </div>
    );
  }

  // Main render
  return (
    <div style={{ padding: '24px' }}>
      {contextHolder}
      <Title level={2}>Bot Trap Dashboard</Title>
      
      <Alert
        style={{ marginBottom: 24 }}
        message={`Bot Trap ${wsConnected ? 'Active' : 'Disconnected'}`}
        description={
          wsConnected 
            ? "The fake product page is currently active. Any bot accessing will be logged here."
            : "Connection to real-time updates lost. Displaying cached data only."
        }
        type={wsConnected ? "success" : "warning"}
        showIcon
      />

      <Card 
        loading={loading}
        style={{ marginBottom: 24 }}
        title="Detection Overview"
      >
        <BotTrapStats events={events} />
      </Card>

      <Card 
        loading={loading}
        style={{ marginBottom: 24 }} 
        title="Bot Activity Trends"
      >
        {events.length > 0 ? (
          <BotTrapChart events={events} />
        ) : (
          <Empty description="No data available for chart" />
        )}
      </Card>

      <Card 
        loading={loading}
        title="Recent Bot Events"
        extra={
          <Text type={wsConnected ? "success" : "warning"}>
            {wsConnected ? 'Live Connected' : 'Offline Mode'}
          </Text>
        }
      >
        <BotTrapLog events={events} />
      </Card>
    </div>
  );
};

export default BotTrap;
