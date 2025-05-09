import React from 'react';
import { Timeline, Card, Tag, Typography, Space } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  SyncOutlined, 
  CarOutlined, 
  ShoppingOutlined 
} from '@ant-design/icons';
import { format } from 'date-fns';

const { Text, Title } = Typography;

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    case 'confirmed':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'processing':
      return <SyncOutlined spin style={{ color: '#1890ff' }} />;
    case 'shipped':
      return <CarOutlined style={{ color: '#722ed1' }} />;
    case 'delivered':
      return <ShoppingOutlined style={{ color: '#52c41a' }} />;
    default:
      return <ClockCircleOutlined />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'success';
    case 'processing':
      return 'processing';
    case 'shipped':
      return 'purple';
    case 'delivered':
      return 'success';
    default:
      return 'default';
  }
};

const OrderStatus = ({ order }) => {
  if (!order) return null;

  return (
    <Card className="mb-4">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>Order #{order.id}</Title>
          <Text type="secondary">
            Placed on {format(new Date(order.createdAt), 'PPP')}
          </Text>
        </div>

        <div>
          <Tag color={getStatusColor(order.status)} icon={getStatusIcon(order.status)}>
            {order.status.toUpperCase()}
          </Tag>
          {order.trackingNumber && (
            <Tag color="blue">
              Tracking: {order.trackingNumber}
            </Tag>
          )}
        </div>

        <Timeline
          items={order.statusHistory.map((status) => ({
            color: getStatusColor(status.status),
            children: (
              <div>
                <Text strong>{status.note}</Text>
                <br />
                <Text type="secondary">
                  {format(new Date(status.timestamp), 'PPp')}
                </Text>
              </div>
            ),
          }))}
        />

        <div>
          <Title level={5}>Shipping Information</Title>
          <Text>
            {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
            <br />
            Phone: {order.shippingInfo.phone}
          </Text>
        </div>

        <div>
          <Title level={5}>Order Summary</Title>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between mb-2">
              <Text>
                {item.name} x {item.quantity}
              </Text>
              <Text strong>${(item.price * item.quantity).toFixed(2)}</Text>
            </div>
          ))}
          <div className="flex justify-between mt-2 pt-2 border-t">
            <Text strong>Total</Text>
            <Text strong>${order.total.toFixed(2)}</Text>
          </div>
        </div>
      </Space>
    </Card>
  );
};

export default OrderStatus; 