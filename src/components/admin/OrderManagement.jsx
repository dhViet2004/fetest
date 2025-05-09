import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Form, Select, Input, Space, message, Descriptions, Card, Timeline, Typography, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  SyncOutlined, 
  CarOutlined, 
  ShoppingOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';

const { Option } = Select;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      // Sort orders by date in descending order (newest first)
      const sortedOrders = data.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date);
        const dateB = new Date(b.createdAt || b.date);
        return dateB - dateA;
      });
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <CheckCircleOutlined />;
      case 'confirmed':
        return <CheckCircleOutlined />;
      case 'processing':
        return <SyncOutlined />;
      case 'shipped':
        return <CarOutlined />;
      case 'delivered':
        return <ShoppingOutlined />;
      default:
        return null;
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Format current date to Vietnamese format
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear();
      const formattedDate = `${hours}:${minutes} ${day}/${month}/${year}`;

      const updatedOrder = {
        ...order,
        status: newStatus,
        statusHistory: Array.isArray(order.statusHistory) 
          ? [...order.statusHistory, {
              status: newStatus,
              timestamp: formattedDate,
              note: `Status changed to ${newStatus}`
            }]
          : [{
              status: newStatus,
              timestamp: formattedDate,
              note: `Status changed to ${newStatus}`
            }]
      };

      // If order has a voucher and payment is completed, update voucher usage
      if (order.voucher && order.payment?.status === 'completed') {
        try {
          const voucherResponse = await fetch(`http://localhost:3001/vouchers/${order.voucher.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...order.voucher,
              usedBy: [...(order.voucher.usedBy || []), order.userId]
            })
          });

          if (!voucherResponse.ok) {
            console.error('Failed to update voucher usage');
          }
        } catch (error) {
          console.error('Error updating voucher usage:', error);
        }
      }

      const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOrder),
      });

      if (response.ok) {
        message.success(`Order status updated to ${newStatus}`);
        loadOrders();
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Failed to update order status');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        try {
          if (!date) return 'N/A';
          
          // Handle different date formats
          let dateObj;
          if (typeof date === 'string') {
            // Check if date is in Vietnamese format (e.g., "08:35 06/05/2025")
            if (date.includes('/')) {
              const [time, datePart] = date.split(' ');
              const [day, month, year] = datePart.split('/');
              const [hours, minutes] = time.split(':');
              dateObj = new Date(year, month - 1, day, hours, minutes);
            } else {
              dateObj = new Date(date);
            }
          } else {
            dateObj = new Date(date);
          }

          if (isNaN(dateObj.getTime())) return 'Invalid Date';
          
          // Format date to Vietnamese format
          const hours = dateObj.getHours().toString().padStart(2, '0');
          const minutes = dateObj.getMinutes().toString().padStart(2, '0');
          const day = dateObj.getDate().toString().padStart(2, '0');
          const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
          const year = dateObj.getFullYear();
          
          return `${hours}:${minutes} ${day}/${month}/${year}`;
        } catch (error) {
          console.error('Error formatting date:', error);
          return 'Invalid Date';
        }
      },
      sorter: (a, b) => {
        try {
          const getDateValue = (dateStr) => {
            if (!dateStr) return 0;
            
            // Handle different date formats
            if (typeof dateStr === 'string') {
              if (dateStr.includes('/')) {
                const [time, datePart] = dateStr.split(' ');
                const [day, month, year] = datePart.split('/');
                const [hours, minutes] = time.split(':');
                return new Date(year, month - 1, day, hours, minutes).getTime();
              }
            }
            return new Date(dateStr).getTime();
          };

          const dateA = getDateValue(a.createdAt);
          const dateB = getDateValue(b.createdAt);
          
          if (isNaN(dateA) || isNaN(dateB)) return 0;
          return dateA - dateB;
        } catch {
          return 0;
        }
      },
    },
    {
      title: 'Customer',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId) => `User #${userId}`,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items.length,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => formatCurrency(total),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status || 'pending')} icon={getStatusIcon(status || 'pending')}>
          {(status || 'pending').toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Confirmed', value: 'confirmed' },
        { text: 'Processing', value: 'processing' },
        { text: 'Shipped', value: 'shipped' },
        { text: 'Delivered', value: 'delivered' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleViewDetails(record)}>
            View Details
          </Button>
          <Select
            value={record.status || 'pending'}
            style={{ width: 120 }}
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="processing">Processing</Option>
            <Option value="shipped">Shipped</Option>
            <Option value="delivered">Delivered</Option>
          </Select>
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter(order => {
    if (!order) return false;

    const matchesSearch = 
      (order.id?.toString() || '').includes(searchText) ||
      (order.userId?.toString() || '').includes(searchText) ||
      (order.items || []).some(item => 
        (item?.name || '').toLowerCase().includes(searchText.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold text-center md:text-left">Order Management</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Input
              placeholder="Search orders..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full md:w-[200px]"
            />
            <Select
              defaultValue="all"
              className="w-full md:w-[200px]"
              onChange={setStatusFilter}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="processing">Processing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200 }}
          size="middle"
          bordered
        />
      </div>

      <Modal
        title={
          <div className="flex items-center space-x-2">
            <ShoppingCartOutlined className="text-blue-500" />
            <span>Order Details #{selectedOrder?.id}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="95%"
        style={{ maxWidth: '800px' }}
        className="order-details-modal"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <Card>
              <Descriptions title="Order Information" bordered column={{ xs: 1, sm: 2, md: 3 }}>
                <Descriptions.Item label="Order ID" span={3}>
                  <Space>
                    <BarcodeOutlined />
                    {selectedOrder.id}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Order Date" span={3}>
                  <Space>
                    <ClockCircleOutlined />
                    {format(new Date(selectedOrder.createdAt), 'PPP')}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={3}>
                  <Tag color={getStatusColor(selectedOrder.status)} icon={getStatusIcon(selectedOrder.status)}>
                    {selectedOrder.status.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                {selectedOrder.trackingNumber && (
                  <Descriptions.Item label="Tracking Number" span={3}>
                    <Space>
                      <CarOutlined />
                      {selectedOrder.trackingNumber}
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            <Card title={
              <div className="flex items-center space-x-2">
                <UserOutlined className="text-blue-500" />
                <span>Customer Information</span>
              </div>
            }>
              <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                <Descriptions.Item label="Customer ID" span={3}>
                  User #{selectedOrder.userId}
                </Descriptions.Item>
                {selectedOrder.shippingInfo && (
                  <>
                    <Descriptions.Item label="Address" span={3}>
                      <Space>
                        <EnvironmentOutlined />
                        {selectedOrder.shippingInfo.address}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="City" span={3}>
                      {selectedOrder.shippingInfo.city}
                    </Descriptions.Item>
                    <Descriptions.Item label="State" span={3}>
                      {selectedOrder.shippingInfo.state}
                    </Descriptions.Item>
                    <Descriptions.Item label="ZIP Code" span={3}>
                      {selectedOrder.shippingInfo.zipCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone" span={3}>
                      <Space>
                        <PhoneOutlined />
                        {selectedOrder.shippingInfo.phone}
                      </Space>
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>

            <Card title={
              <div className="flex items-center space-x-2">
                <ShoppingCartOutlined className="text-blue-500" />
                <span>Order Items</span>
              </div>
            }>
              <div className="overflow-x-auto">
                <Table
                  dataSource={selectedOrder.items}
                  columns={[
                    {
                      title: 'Product',
                      dataIndex: 'name',
                      key: 'name',
                      render: (text, record) => (
                        <Space>
                          <img src={record.imageUrl} alt={text} className="w-10 h-10 object-cover rounded" />
                          <span>{text}</span>
                        </Space>
                      ),
                    },
                    {
                      title: 'Price',
                      dataIndex: 'price',
                      key: 'price',
                      render: (price) => formatCurrency(price),
                    },
                    {
                      title: 'Quantity',
                      dataIndex: 'quantity',
                      key: 'quantity',
                    },
                    {
                      title: 'Total',
                      key: 'total',
                      render: (_, record) => formatCurrency(record.price * record.quantity),
                    },
                  ]}
                  pagination={false}
                  scroll={{ x: 600 }}
                  size="middle"
                  bordered
                />
              </div>
              <Divider />
              <div className="text-right">
                <Typography.Title level={4}>
                  <Space>
                    <span>Total Amount:</span>
                    {formatCurrency(selectedOrder.total)}
                  </Space>
                </Typography.Title>
              </div>
            </Card>

            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <Card title={
                <div className="flex items-center space-x-2">
                  <ClockCircleOutlined className="text-blue-500" />
                  <span>Status History</span>
                </div>
              }>
                <Timeline
                  items={selectedOrder.statusHistory.map((history) => {
                    try {
                      const date = new Date(history.timestamp);
                      if (isNaN(date.getTime())) {
                        return {
                          key: history.timestamp,
                          color: getStatusColor(history.status),
                          children: (
                            <div className="space-y-1" key={history.timestamp}>
                              <div className="flex items-center space-x-2">
                                <Tag color={getStatusColor(history.status)} icon={getStatusIcon(history.status)}>
                                  {history.status.toUpperCase()}
                                </Tag>
                                <span className="text-gray-500">Invalid Date</span>
                              </div>
                              <p className="text-gray-600 ml-8">{history.note}</p>
                            </div>
                          ),
                        };
                      }
                      
                      // Format date to Vietnamese format
                      const hours = date.getHours().toString().padStart(2, '0');
                      const minutes = date.getMinutes().toString().padStart(2, '0');
                      const day = date.getDate().toString().padStart(2, '0');
                      const month = (date.getMonth() + 1).toString().padStart(2, '0');
                      const year = date.getFullYear();
                      
                      return {
                        key: history.timestamp,
                        color: getStatusColor(history.status),
                        children: (
                          <div className="space-y-1" key={history.timestamp}>
                            <div className="flex items-center space-x-2">
                              <Tag color={getStatusColor(history.status)} icon={getStatusIcon(history.status)}>
                                {history.status.toUpperCase()}
                              </Tag>
                              <span className="text-gray-500">
                                {`${hours}:${minutes} ${day}/${month}/${year}`}
                              </span>
                            </div>
                            <p className="text-gray-600 ml-8">{history.note}</p>
                          </div>
                        ),
                      };
                    } catch (error) {
                      console.error('Error formatting status history date:', error);
                      return {
                        key: history.timestamp,
                        color: getStatusColor(history.status),
                        children: (
                          <div className="space-y-1" key={history.timestamp}>
                            <div className="flex items-center space-x-2">
                              <Tag color={getStatusColor(history.status)} icon={getStatusIcon(history.status)}>
                                {history.status.toUpperCase()}
                              </Tag>
                              <span className="text-gray-500">Invalid Date</span>
                            </div>
                            <p className="text-gray-600 ml-8">{history.note}</p>
                          </div>
                        ),
                      };
                    }
                  })}
                />
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement; 