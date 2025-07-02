import React from 'react';
import { Layout, Row, Col } from 'antd';
import MerkelClusters from '../components/merkel-logging/MerkelClusters';
import MerkelLogTable from '../components/merkel-logging/MerkelLogTable';

const { Content } = Layout;

const MerkelLoggingPage = () => {
  return (
    <Content style={{ margin: '24px 16px 0' }}>
      <div style={{ padding: 24, minHeight: 360 }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <MerkelClusters />
          </Col>
          <Col span={24}>
            <MerkelLogTable />
          </Col>
        </Row>
      </div>
    </Content>
  );
};

export default MerkelLoggingPage;
