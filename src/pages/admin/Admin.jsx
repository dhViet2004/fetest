import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Avatar, Badge, Button, Table, Tag, Space, Tooltip, Progress, Spin, message, Modal, Form, Input, Select } from 'antd';
import { Column, Line } from '@ant-design/plots';
import { 
  ShoppingOutlined, 
  UserOutlined, 
  ShoppingCartOutlined, 
  TagsOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  DashboardOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RiseOutlined,
  FallOutlined,
  SyncOutlined,
  EditOutlined,
  DeleteOutlined,
  EditFilled
} from '@ant-design/icons';
import { FaShoppingBag, FaUsers, FaChartLine, FaCog, FaBox, FaTags, FaClipboardList } from 'react-icons/fa';
import ProductManager from '../../components/admin/ProductManager';
import OrderManagement from '../../components/admin/OrderManagement';
import PromotionManagement from '../../components/admin/PromotionManagement';

const { Title, Text } = Typography;

// Helper function to parse date
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  
  try {
    // Handle Vietnamese format (e.g., "08:35 06/05/2025")
    if (typeof dateStr === 'string') {
      if (dateStr.includes('/')) {
        const [time, datePart] = dateStr.split(' ');
        if (time && datePart) {
          const [day, month, year] = datePart.split('/');
          const [hours, minutes] = time.split(':');
          return new Date(year, month - 1, day, hours || 0, minutes || 0);
        }
      }
      // Handle ISO format
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    // Handle Date object
    if (dateStr instanceof Date) {
      return dateStr;
    }
    // Return current date as fallback
    return new Date();
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
};

// Memoized Order Table component
const OrderTable = React.memo(({ dataSource, columns }) => (
  <Table 
    dataSource={dataSource} 
    columns={columns} 
    rowKey="id"
    pagination={{ pageSize: 5 }}
    size="small"
  />
));

// Memoized Overview Card component
const OverviewCard = React.memo(({ title, value, change, trend, icon, iconColor }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <Text className="text-gray-500">{title}</Text>
        <div className="flex items-center mt-1">
          <Title level={4} className="m-0 mr-2">{value}</Title>
          <Tag color={trend === 'up' ? 'success' : 'error'} className="flex items-center">
            {trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {change}%
          </Tag>
        </div>
      </div>
      <div className={`bg-${iconColor}-50 rounded-full p-2`}>
        {icon}
      </div>
    </div>
  </Card>
));

const Admin = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedCard, setSelectedCard] = useState(null);
  const [overviewData, setOverviewData] = useState({
    turnover: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'up'
    },
    profit: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'up'
    },
    orders: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'up'
    },
    customers: {
      current: 0,
      previous: 0,
      change: 0,
      trend: 'up'
    }
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState([]);
  const [currentMonthOrders, setCurrentMonthOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      const [ordersResponse, usersResponse] = await Promise.all([
        fetch('http://localhost:3001/orders'),
        fetch('http://localhost:3001/users')
      ]);

      const ordersData = await ordersResponse.json();
      const usersData = await usersResponse.json();
      setUsers(usersData);
      setAllOrders(ordersData);

      // Calculate overview data
      const currentMonthOrdersData = ordersData.filter(order => {
        const orderDate = parseDate(order.createdAt);
        const currentDate = new Date();
        const isCurrentMonth = orderDate.getMonth() === currentDate.getMonth() && 
                             orderDate.getFullYear() === currentDate.getFullYear();
        const isDelivered = order.status === 'delivered';
        return isCurrentMonth && isDelivered;
      });
      setCurrentMonthOrders(currentMonthOrdersData);

      const previousMonthOrdersData = ordersData.filter(order => {
        const orderDate = parseDate(order.createdAt);
        const currentDate = new Date();
        const previousMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
        const previousYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
        const isPreviousMonth = orderDate.getMonth() === previousMonth && 
                              orderDate.getFullYear() === previousYear;
        const isDelivered = order.status === 'delivered';
        return isPreviousMonth && isDelivered;
      });

      const currentTurnover = currentMonthOrdersData.reduce((sum, order) => {
        return sum + (Number(order.total) || 0);
      }, 0);
      
      const previousTurnover = previousMonthOrdersData.reduce((sum, order) => {
        return sum + (Number(order.total) || 0);
      }, 0);

      const turnoverChange = previousTurnover === 0 ? 100 : 
        ((currentTurnover - previousTurnover) / previousTurnover) * 100;

      // Update overview data
      setOverviewData({
        turnover: {
          current: currentTurnover.toLocaleString('vi-VN') + '₫',
          previous: previousTurnover.toLocaleString('vi-VN') + '₫',
          change: Math.round(turnoverChange),
          trend: turnoverChange >= 0 ? 'up' : 'down'
        },
        profit: {
          current: Math.round(currentTurnover * 0.3).toLocaleString('vi-VN') + '₫',
          previous: Math.round(previousTurnover * 0.3).toLocaleString('vi-VN') + '₫',
          change: Math.round(turnoverChange),
          trend: turnoverChange >= 0 ? 'up' : 'down'
        },
        orders: {
          current: currentMonthOrdersData.length,
          previous: previousMonthOrdersData.length,
          change: previousMonthOrdersData.length === 0 ? 100 : 
            Math.round(((currentMonthOrdersData.length - previousMonthOrdersData.length) / previousMonthOrdersData.length) * 100),
          trend: currentMonthOrdersData.length >= previousMonthOrdersData.length ? 'up' : 'down'
        },
        customers: {
          current: usersData.length,
          previous: Math.round(usersData.length * 0.9),
          change: 10,
          trend: 'up'
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleCardClick = (cardType) => {
    switch (cardType) {
      case 'products':
        setActiveSection('products');
        break;
      case 'promotions':
        setActiveSection('promotions');
        break;
      case 'orders':
        setActiveSection('orders');
        break;
      default:
        setSelectedCard(selectedCard === cardType ? null : cardType);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      address: user.address
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedUser = {
        ...editingUser,
        ...values
      };

      const response = await fetch(`http://localhost:3001/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });
      
      if (response.ok) {
        message.success('User updated successfully');
        setIsEditModalVisible(false);
        fetchData(); // Refresh data
      } else {
        message.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Error updating user');
    }
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    form.resetFields();
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <OrderManagement />;
      case 'promotions':
        return <PromotionManagement />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button type="primary" onClick={handleRefresh} icon={<SyncOutlined />}>
              Refresh Data
            </Button>
          </div>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div onClick={() => handleCardClick('turnover')}>
              <OverviewCard
                title="Total Turnover"
                value={overviewData.turnover.current}
                change={overviewData.turnover.change}
                trend={overviewData.turnover.trend}
                icon={<DollarOutlined className="text-blue-500 text-lg" />}
                iconColor="blue"
              />
            </div>
            <div onClick={() => handleCardClick('profit')}>
              <OverviewCard
                title="Total Profit"
                value={overviewData.profit.current}
                change={overviewData.profit.change}
                trend={overviewData.profit.trend}
                icon={<RiseOutlined className="text-green-500 text-lg" />}
                iconColor="green"
              />
            </div>
            <div onClick={() => handleCardClick('orders')}>
              <OverviewCard
                title="Total Orders"
                value={overviewData.orders.current}
                change={overviewData.orders.change}
                trend={overviewData.orders.trend}
                icon={<ShoppingCartOutlined className="text-purple-500 text-lg" />}
                iconColor="purple"
              />
            </div>
            <div onClick={() => handleCardClick('customers')}>
              <OverviewCard
                title="Total Customers"
                value={overviewData.customers.current}
                change={overviewData.customers.change}
                trend={overviewData.customers.trend}
                icon={<TeamOutlined className="text-red-500 text-lg" />}
                iconColor="red"
              />
            </div>
          </div>

          {/* Detailed Tables */}
          {selectedCard === 'turnover' && (
            <Card title="Turnover Details" className="shadow-sm">
              <div style={{ width: '80%', margin: '0 auto' }}>
                <Column
                  data={Array.from({ length: 12 }, (_, i) => {
                    const month = new Date();
                    month.setMonth(month.getMonth() + i);
                    const monthName = month.toLocaleString('vi-VN', { month: 'long' });
                    const year = month.getFullYear();
                    
                    const monthOrders = allOrders.filter(order => {
                      const orderDate = parseDate(order.createdAt);
                      return orderDate.getMonth() === month.getMonth() && 
                             orderDate.getFullYear() === year &&
                             order.status === 'delivered';
                    });
                    
                    const turnover = monthOrders.reduce((sum, order) => 
                      sum + (Number(order.total) || 0), 0);
                    
                    return {
                      month: `${monthName} ${year}`,
                      turnover: turnover,
                      orderCount: monthOrders.length
                    };
                  }).filter(item => item.orderCount > 0)}
                  xField="month"
                  yField="turnover"
                  label={{
                    position: 'middle',
                    style: {
                      fill: '#FFFFFF',
                      opacity: 0.6,
                    },
                  }}
                  meta={{
                    turnover: {
                      alias: 'Doanh thu (VNĐ)',
                    },
                  }}
                  color="#1890ff"
                  height={400}
                  autoFit={true}
                  columnWidth={20}
                />
              </div>
            </Card>
          )}

          {selectedCard === 'profit' && (
            <Card title="Profit Details" className="shadow-sm">
              <div style={{ width: '80%', margin: '0 auto' }}>
                <Column
                  data={Array.from({ length: 12 }, (_, i) => {
                    const month = new Date();
                    month.setMonth(month.getMonth() + i);
                    const monthName = month.toLocaleString('vi-VN', { month: 'long' });
                    const year = month.getFullYear();
                    
                    const monthOrders = allOrders.filter(order => {
                      const orderDate = parseDate(order.createdAt);
                      return orderDate.getMonth() === month.getMonth() && 
                             orderDate.getFullYear() === year &&
                             order.status === 'delivered';
                    });
                    
                    const turnover = monthOrders.reduce((sum, order) => 
                      sum + (Number(order.total) || 0), 0);
                    
                    const profit = Math.round(turnover * 0.3);
                    
                    return {
                      month: `${monthName} ${year}`,
                      profit: profit,
                      orderCount: monthOrders.length
                    };
                  }).filter(item => item.orderCount > 0)}
                  xField="month"
                  yField="profit"
                  label={{
                    position: 'middle',
                    style: {
                      fill: '#FFFFFF',
                      opacity: 0.6,
                    },
                  }}
                  meta={{
                    profit: {
                      alias: 'Lợi nhuận (VNĐ)',
                    },
                  }}
                  color="#52c41a"
                  height={400}
                  autoFit={true}
                  columnWidth={20}
                />
              </div>
            </Card>
          )}

          {selectedCard === 'orders' && (
            <Card title="Order Details" className="shadow-sm">
              <Table 
                dataSource={currentMonthOrders}
                columns={[
                  {
                    title: 'Order ID',
                    dataIndex: 'id',
                    key: 'id',
                  },
                  {
                    title: 'Customer',
                    dataIndex: 'userId',
                    key: 'userId',
                    render: (userId) => {
                      const user = users.find(u => u.id === userId);
                      return user ? user.name : 'Unknown';
                    }
                  },
                  {
                    title: 'Amount',
                    dataIndex: 'total',
                    key: 'total',
                    render: (total) => `${Number(total).toLocaleString('vi-VN')}₫`,
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => {
                      const statusValue = status || 'pending';
                      let color = 'green';
                      let icon = <CheckCircleOutlined />;
                      
                      if (statusValue === 'pending') {
                        color = 'gold';
                        icon = <ClockCircleOutlined />;
                      } else if (statusValue === 'processing') {
                        color = 'blue';
                        icon = <ClockCircleOutlined />;
                      } else if (statusValue === 'cancelled') {
                        color = 'red';
                        icon = <ExclamationCircleOutlined />;
                      }
                      
                      return (
                        <Tag color={color} icon={icon}>
                          {statusValue.toUpperCase()}
                        </Tag>
                      );
                    },
                  },
                  {
                    title: 'Date',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (date) => {
                      const parsedDate = parseDate(date);
                      return parsedDate.toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      });
                    },
                  }
                ]}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          )}

          {selectedCard === 'customers' && (
            <Card title="Customer Management" className="shadow-sm">
              <Table 
                dataSource={users}
                columns={[
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    key: 'id',
                    width: 80,
                  },
                  {
                    title: 'Avatar',
                    dataIndex: 'imageUrl',
                    key: 'imageUrl',
                    width: 80,
                    render: (imageUrl) => (
                      <Avatar 
                        src={imageUrl || 'https://joeschmoe.io/api/v1/random'} 
                        size="large"
                      />
                    ),
                  },
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name',
                    render: (name) => name || 'Not provided',
                  },
                  {
                    title: 'Username',
                    dataIndex: 'username',
                    key: 'username',
                  },
                  {
                    title: 'Email',
                    dataIndex: 'email',
                    key: 'email',
                    render: (email) => email || 'Not provided',
                  },
                  {
                    title: 'Role',
                    dataIndex: 'role',
                    key: 'role',
                    width: 100,
                    render: (role) => (
                      <Tag color={role === 'admin' ? 'blue' : 'green'}>
                        {role.toUpperCase()}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Join Date',
                    dataIndex: 'dateCreate',
                    key: 'dateCreate',
                    render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Not provided',
                  },
                  {
                    title: 'Phone',
                    dataIndex: 'phoneNumber',
                    key: 'phoneNumber',
                    render: (phone) => phone || 'Not provided',
                  },
                  {
                    title: 'Address',
                    dataIndex: 'address',
                    key: 'address',
                    render: (address) => address || 'Not provided',
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: 120,
                    render: (_, record) => (
                      <Space>
                        <Button 
                          type="primary" 
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditUser(record)}
                        >
                          Edit
                        </Button>
                      </Space>
                    ),
                  }
                ]}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div 
              className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${activeSection === 'overview' ? 'ring-1 ring-blue-500' : ''}`}
              onClick={() => handleSectionClick('overview')}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 rounded-full p-2">
                  <DashboardOutlined className="text-blue-500 text-lg" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Overview</h2>
                  <p className="text-sm text-gray-500">Dashboard</p>
                </div>
              </div>
            </div>

            <div 
              className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${activeSection === 'products' ? 'ring-1 ring-blue-500' : ''}`}
              onClick={() => handleCardClick('products')}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 rounded-full p-2">
                  <FaBox className="text-blue-500 text-lg" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Products</h2>
                  <p className="text-sm text-gray-500">Manage products</p>
                </div>
              </div>
            </div>

            <div 
              className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${activeSection === 'orders' ? 'ring-1 ring-blue-500' : ''}`}
              onClick={() => handleCardClick('orders')}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-purple-50 rounded-full p-2">
                  <FaClipboardList className="text-purple-500 text-lg" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Orders</h2>
                  <p className="text-sm text-gray-500">Manage orders</p>
                </div>
              </div>
            </div>

            <div 
              className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${activeSection === 'promotions' ? 'ring-1 ring-blue-500' : ''}`}
              onClick={() => handleCardClick('promotions')}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-red-50 rounded-full p-2">
                  <TagsOutlined className="text-red-500 text-lg" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Promotions</h2>
                  <p className="text-sm text-gray-500">Manage promotions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Section Content */}
          <div className="mt-6 mb-24">
            {renderActiveSection()}
          </div>
        </div>
      </div>

      <Modal
        title="Edit User"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input the username!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please input a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select the role!' }]}
          >
            <Select>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin; 