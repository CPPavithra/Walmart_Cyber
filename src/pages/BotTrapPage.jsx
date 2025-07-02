import React from 'react';
import { Layout, Button, notification } from 'antd';
import BotTrap from '../components/bot-trap/BotTrap';

const { Content } = Layout;

const BotTrapPage = () => {
  return (
    <Content style={{ margin: '24px 16px 0' }}>
      <div style={{ padding: 24, minHeight: 360 }}>
        <BotTrap />
        <Button onClick={() => notification.success({ message: 'Test', description: 'Notification system working!' })}>
          Test Notifications
        </Button>
      </div>
    </Content>
  );
};

export default BotTrapPage;

