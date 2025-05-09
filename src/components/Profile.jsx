import React, { useState, useEffect, useRef } from 'react';
import { Card, Avatar, Button, Modal, Form, Input, DatePicker, message, Tabs, Table, Tag, Badge, Upload, Steps, Descriptions, Space, Divider, Typography } from 'antd';
import { UserOutlined, EditOutlined, ShoppingCartOutlined, HistoryOutlined, TruckOutlined, MenuOutlined, CameraOutlined, UploadOutlined, CheckCircleOutlined, SyncOutlined, CarOutlined, ShoppingOutlined, ClockCircleOutlined, CloseCircleOutlined, EyeOutlined, InfoCircleOutlined, DollarOutlined, CreditCardOutlined, EnvironmentOutlined, PhoneOutlined, GiftOutlined } from '@ant-design/icons';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaIdCard } from 'react-icons/fa';
import { format as formatDate, isValid, parseISO } from 'date-fns';
import dayjs from 'dayjs';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [orderHistory, setOrderHistory] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [userVouchers, setUserVouchers] = useState([]);
  const [voucherFilter, setVoucherFilter] = useState('all'); // 'all', 'unused', 'used'

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
    } else {
      setError('No user data found');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Error loading user data');
      } finally {
      setLoading(false);
    }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (user && user.role === 'user') {
      // Fetch orders
      fetch(`http://localhost:3001/orders?userId=${user.id}`)
        .then(response => response.json())
        .then(data => {
          // Sort orders by date (newest first)
          const sortedOrders = data.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );

          // Separate orders into active and history
          const active = sortedOrders.filter(order => 
            ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
          );
          const history = sortedOrders.filter(order => 
            ['delivered', 'cancelled'].includes(order.status)
          );

          // Add estimated delivery dates for active orders
          const activeWithDelivery = active.map(order => ({
            ...order,
            estimatedDelivery: order.status === 'processing' 
              ? new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from order date
              : new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from order date
          }));

          // Update payment status for delivered orders
          const updatedHistory = history.map(order => ({
            ...order,
            paymentStatus: order.status === 'delivered' ? 'delivered' : order.paymentStatus
          }));

          setActiveOrders(activeWithDelivery);
          setOrderHistory(updatedHistory);
        })
        .catch(error => {
          console.error('Error fetching orders:', error);
          message.error('Failed to load orders');
        });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Fetch vouchers
      fetch(`http://localhost:3001/vouchers`)
        .then(response => response.json())
        .then(data => {
          // Filter vouchers for this user
          const userSpecificVouchers = data.filter(voucher => {
            // Check if voucher has userIds and user is in the list
            if (voucher.userIds && voucher.userIds.length > 0) {
              return voucher.userIds.includes(user.id);
            }
            // Include vouchers without userIds that haven't been used by this user
            return !voucher.usedBy || !voucher.usedBy.includes(user.id);
          });
          setUserVouchers(userSpecificVouchers);
        })
        .catch(error => {
          console.error('Error fetching vouchers:', error);
          message.error('Failed to load vouchers');
        });
    }
  }, [user]);

  // Filter vouchers based on status
  const filteredVouchers = userVouchers.filter(voucher => {
    const isUsed = voucher.usedBy && voucher.usedBy.includes(user.id);
    if (voucherFilter === 'all') return true;
    if (voucherFilter === 'used') return isUsed;
    if (voucherFilter === 'unused') return !isUsed;
    return true;
  });

  const formatDateSafely = (dateString, format) => {
    if (!dateString || dateString === "Not provided") return "Not provided";
    try {
      // Handle the specific format "HH:mm DD/MM/YYYY"
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const [time, date] = dateString.split(' ');
        const [hours, minutes] = time.split(':');
        const [day, month, year] = date.split('/');
        const dateObj = new Date(year, month - 1, day, hours, minutes);
        return formatDate(dateObj, format);
      }
      
      // Handle ISO date strings
      const date = parseISO(dateString);
      return isValid(date) ? formatDate(date, format) : "Not provided";
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Not provided";
    }
  };

  const handleEditProfile = () => {
    editForm.setFieldsValue({
      name: user.name || user.full_name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      birthday: user.birthday ? dayjs(user.birthday) : null
    });
    setIsEditModalVisible(true);
  };

  const handleEditProfileSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      const updatedUser = {
        ...user,
        name: values.name,
        full_name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null
      };

      const response = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditModalVisible(false);
        message.success('Profile updated successfully');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
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

  const getOrderStatusSteps = (status) => {
    const steps = [
      {
        title: 'Order Placed',
        icon: <CheckCircleOutlined />,
        status: 'finish'
      },
      {
        title: 'Confirmed',
        icon: <CheckCircleOutlined />,
        status: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status) ? 'finish' : 'wait'
      },
      {
        title: 'Processing',
        icon: <SyncOutlined />,
        status: status === 'processing' ? 'process' : 
                ['shipped', 'delivered'].includes(status) ? 'finish' : 'wait'
      },
      {
        title: 'Shipped',
        icon: <CarOutlined />,
        status: status === 'shipped' ? 'process' : 
                status === 'delivered' ? 'finish' : 'wait'
      },
      {
        title: 'Delivered',
        icon: <ShoppingOutlined />,
        status: status === 'delivered' ? 'finish' : 'wait'
      }
    ];

    if (status === 'cancelled') {
      steps.forEach(step => {
        if (step.status === 'process') {
          step.status = 'error';
          step.icon = <CloseCircleOutlined />;
        }
      });
    }

    return steps;
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderModalVisible(true);
  };

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => formatDateSafely(date, 'HH:mm dd/MM/yyyy'),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 80,
      render: (items) => items.length,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total) => `${total.toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewOrder(record)}
          className="text-blue-500 hover:text-blue-700"
        />
      ),
    },
  ];

  const activeOrderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => formatDateSafely(date, 'HH:mm dd/MM/yyyy'),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 80,
      render: (items) => items.length,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total) => `${total.toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewOrder(record)}
          className="text-blue-500 hover:text-blue-700"
        />
      ),
    },
  ];

  // Mobile-optimized columns
  const mobileOrderColumns = [
    {
      title: 'Order',
      dataIndex: 'id',
      key: 'id',
      render: (id, record) => (
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">{id}</div>
              <div className="text-xs text-gray-500">{formatDateSafely(record.createdAt, 'HH:mm dd/MM/yyyy')}</div>
            </div>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewOrder(record)}
              className="text-blue-500 hover:text-blue-700"
            />
          </div>
          <div className="text-xs">Items: {record.items.length} | {record.total.toLocaleString('vi-VN')}₫</div>
          <div>
            <Tag color={getStatusColor(record.status)} icon={getStatusIcon(record.status)}>
              {record.status.toUpperCase()}
            </Tag>
          </div>
        </div>
      ),
    },
  ];

  const mobileActiveOrderColumns = [
    {
      title: 'Order',
      dataIndex: 'id',
      key: 'id',
      render: (id, record) => (
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">{id}</div>
              <div className="text-xs text-gray-500">{formatDateSafely(record.createdAt, 'HH:mm dd/MM/yyyy')}</div>
            </div>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewOrder(record)}
              className="text-blue-500 hover:text-blue-700"
            />
          </div>
          <div className="text-xs">Items: {record.items.length} | {record.total.toLocaleString('vi-VN')}₫</div>
          <div>
            <Tag color={getStatusColor(record.status)} icon={getStatusIcon(record.status)}>
              {record.status.toUpperCase()}
            </Tag>
          </div>
        </div>
      ),
    },
  ];

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        
        // Create a local URL for immediate preview
        const localImageUrl = URL.createObjectURL(file);
        setAvatarUrl(localImageUrl);
        
        // Convert the file to base64 for storage
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result;
          
          // Update user with new avatar
          const updatedUser = {
            ...user,
            imageUrl: base64String
          };
          
          // Update in localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update in db.json via JsonServer
          try {
            const response = await fetch(`http://localhost:3001/users/${user.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedUser),
            });
            
            if (response.ok) {
              setUser(updatedUser);
              message.success('Avatar updated successfully');
              setIsAvatarModalVisible(false);
            } else {
              throw new Error('Failed to update avatar in database');
            }
          } catch (error) {
            console.error('Error updating avatar in database:', error);
            message.error('Failed to save avatar to database');
          } finally {
            setIsUploading(false);
          }
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error processing avatar:', error);
        message.error('Failed to process avatar');
        setIsUploading(false);
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return <CheckCircleOutlined />;
      case 'pending':
        return <ClockCircleOutlined />;
      case 'failed':
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cod':
        return <DollarOutlined className="text-green-500" />;
      case 'bank':
        return <CreditCardOutlined className="text-blue-500" />;
      case 'e-wallet':
        return <CreditCardOutlined className="text-purple-500" />;
      case 'card':
        return <CreditCardOutlined className="text-red-500" />;
      case 'qr':
        return <CreditCardOutlined className="text-yellow-500" />;
      default:
        return <CreditCardOutlined className="text-gray-500" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'bank':
        return 'Chuyển khoản ngân hàng';
      case 'e-wallet':
        return 'Ví điện tử';
      case 'card':
        return 'Thẻ tín dụng/Ghi nợ';
      case 'qr':
        return 'QR code thanh toán';
      default:
        return method || 'Chưa xác định';
    }
  };

  // Update the payment information card in the order details modal
  const PaymentInformationCard = ({ order }) => (
    <Card size="small" title={
      <div className="flex items-center space-x-2">
        <DollarOutlined className="text-blue-500" />
        <span>Payment Information</span>
      </div>
    }>
      <div className="space-y-3">
       
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Payment Method:</span>
          <div className="flex items-center space-x-2">
            {getPaymentMethodIcon(order.payment?.method)}
            <span className="font-medium">{getPaymentMethodLabel(order.payment?.method)}</span>
          </div>
        </div>
        {order.payment?.status && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Payment Status:</span>
            <Tag color={getPaymentStatusColor(order.payment.status)}>
              {order.payment.status.toUpperCase()}
            </Tag>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount:</span>
          <span className="font-medium text-lg">
            {order.total.toLocaleString('vi-VN')}₫
          </span>
        </div>
        {order.voucher && (
          <div className="flex justify-between items-center text-green-600">
            <span>Voucher Applied:</span>
            <span>{order.voucher.code} (-{order.voucher.discount.toLocaleString('vi-VN')}₫)</span>
          </div>
        )}
      </div>
    </Card>
  );

  // Update the order details modal to use the new PaymentInformationCard
  const OrderDetailsModal = () => (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <InfoCircleOutlined className="text-blue-500" />
          <span>Order Details #{selectedOrder?.id}</span>
        </div>
      }
      open={isOrderModalVisible}
      onCancel={() => setIsOrderModalVisible(false)}
      footer={null}
      width={isMobile ? "95%" : 600}
    >
      {selectedOrder && (
        <div className="mt-4 space-y-4">
          {/* Order Status and Progress */}
          <Card size="small" title={
            <div className="flex items-center space-x-2">
              <ClockCircleOutlined className="text-blue-500" />
              <span>Order Status</span>
            </div>
          }>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <Tag color={getStatusColor(selectedOrder.status)} icon={getStatusIcon(selectedOrder.status)}>
                  {selectedOrder.status.toUpperCase()}
                </Tag>
              </div>
              <div className="text-sm text-gray-500">
                Order Date: {formatDateSafely(selectedOrder.createdAt, 'HH:mm dd/MM/yyyy')}
              </div>
              <Steps
                items={getOrderStatusSteps(selectedOrder.status)}
                size="small"
                className="mt-2"
              />
            </div>
          </Card>

          {/* Shipping Information */}
          <Card size="small" title={
            <div className="flex items-center space-x-2">
              <EnvironmentOutlined className="text-blue-500" />
              <span>Shipping Information</span>
            </div>
          }>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <EnvironmentOutlined className="text-gray-400 mt-1" />
                <div>
                  <div className="font-medium">Delivery Address</div>
                  <div className="text-gray-600">
                    {selectedOrder.shipping?.address?.address}, {selectedOrder.shipping?.address?.ward}, {selectedOrder.shipping?.address?.district}, {selectedOrder.shipping?.address?.province}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneOutlined className="text-gray-400" />
                <div>
                  <div className="font-medium">Contact Number</div>
                  <div className="text-gray-600">{selectedOrder.shipping?.address?.phone || 'Not provided'}</div>
                </div>
              </div>
              {selectedOrder.trackingNumber && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CarOutlined className="text-blue-500" />
                    <span className="font-medium">Tracking Number:</span>
                    <span>{selectedOrder.trackingNumber}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Order Items */}
          <Card size="small" title={
            <div className="flex items-center space-x-2">
              <ShoppingCartOutlined className="text-blue-500" />
              <span>Order Items</span>
            </div>
          }>
            <Table
              dataSource={selectedOrder.items}
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => (
                    <Space>
                      <img src={record.imageUrl} alt={text} className="w-8 h-8 object-cover rounded" />
                      <span className="text-sm">{text}</span>
                    </Space>
                  ),
                },
                {
                  title: 'Price',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price) => `${price.toLocaleString('vi-VN')}₫`,
                  width: 100,
                },
                {
                  title: 'Qty',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 60,
                },
                {
                  title: 'Total',
                  key: 'total',
                  render: (_, record) => `${(record.price * record.quantity).toLocaleString('vi-VN')}₫`,
                  width: 100,
                },
              ]}
              pagination={false}
              size="small"
              scroll={{ y: 200 }}
            />
          </Card>

          {/* Replace the old payment information card with the new one */}
          <PaymentInformationCard order={selectedOrder} />
        </div>
      )}
    </Modal>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const items = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          <span className="hidden sm:inline ml-1">Profile</span>
        </span>
      ),
      children: (
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-navy-600 rounded-t-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="mb-4 sm:mb-0 sm:mr-6 relative">
                <Avatar
                  size={isMobile ? 80 : 120}
            src={user.imageUrl}
                  icon={<UserOutlined />}
                  className="border-4 border-white shadow-lg"
          />
                <div 
                  className="absolute bottom-0 right-0 bg-navy-600 rounded-full p-1 cursor-pointer border-2 border-white"
                  onClick={() => setIsAvatarModalVisible(true)}
                >
                  <CameraOutlined className="text-white text-sm sm:text-base" />
        </div>
            </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold">{user.name || user.full_name}</h1>
                <p className="text-lg sm:text-xl opacity-90">@{user.username}</p>
            </div>
            </div>
            </div>
            
          {/* Profile Content */}
          <div className="bg-white rounded-b-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">Profile Information</h2>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEditProfile}
                className="bg-navy-600 hover:bg-navy-700 w-full sm:w-auto"
                >
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaUser className="text-navy-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{user.username}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaEnvelope className="text-navy-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaCalendarAlt className="text-navy-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Birthday</p>
                    <p className="font-medium">{formatDateSafely(user.birthday, 'MMMM d, yyyy')}</p>
          </div>
        </div>
      </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaPhone className="text-navy-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{user.phoneNumber || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaMapMarkerAlt className="text-navy-600 text-lg sm:text-xl" />
                  </div>
            <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{user.address || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-navy-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <FaIdCard className="text-navy-600 text-lg sm:text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{formatDateSafely(user.dateCreate, 'MMMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Add shopping cart tab for users
  if (user && user.role === 'user') {
    // Add order history tab
    items.push({
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          <span className="hidden sm:inline ml-1">History</span>
        </span>
      ),
      children: (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Order History</h2>
          <div className="overflow-x-auto">
            <Table 
              columns={isMobile ? mobileOrderColumns : orderColumns} 
              dataSource={orderHistory} 
              rowKey="id"
              className="border border-gray-200"
              size={isMobile ? "small" : "default"}
            />
          </div>
        </div>
      ),
    });

    // Add active orders tab
    items.push({
      key: 'orders',
      label: (
        <span>
          <TruckOutlined />
          <span className="hidden sm:inline ml-1">Orders</span>
          <Badge count={activeOrders.length} style={{ marginLeft: '8px' }} />
        </span>
      ),
      children: (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Active Orders</h2>
          {activeOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table 
                columns={isMobile ? mobileActiveOrderColumns : activeOrderColumns} 
                dataSource={activeOrders} 
                rowKey="id"
                pagination={false}
                className="border border-gray-200"
                size={isMobile ? "small" : "default"}
              />
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <TruckOutlined className="text-4xl sm:text-5xl text-gray-300 mb-3 sm:mb-4" />
              <p className="text-lg sm:text-xl text-gray-500">No active orders</p>
            </div>
          )}
        </div>
      ),
    });

    // Add voucher tab
    items.push({
      key: 'vouchers',
      label: (
        <span>
          <GiftOutlined />
          <span className="hidden sm:inline ml-1">Vouchers</span>
          <Badge count={userVouchers.length} style={{ marginLeft: '8px' }} />
        </span>
      ),
      children: (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">My Vouchers</h2>
            <div className="flex gap-2">
              <Button 
                type={voucherFilter === 'all' ? 'primary' : 'default'}
                onClick={() => setVoucherFilter('all')}
              >
                Tất cả
              </Button>
              <Button 
                type={voucherFilter === 'unused' ? 'primary' : 'default'}
                onClick={() => setVoucherFilter('unused')}
              >
                Chưa sử dụng
              </Button>
              <Button 
                type={voucherFilter === 'used' ? 'primary' : 'default'}
                onClick={() => setVoucherFilter('used')}
              >
                Đã sử dụng
              </Button>
            </div>
          </div>

          {filteredVouchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVouchers.map((voucher) => {
                const isUsed = voucher.usedBy && voucher.usedBy.includes(user.id);
                const isExpired = new Date(voucher.endDate) < new Date();
                
                return (
                  <Card
                    key={voucher.id}
                    className={`voucher-card hover:shadow-lg transition-shadow duration-300 ${
                      isUsed ? 'opacity-75' : ''
                    }`}
                    style={{
                      background: isUsed 
                        ? 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
                        : isExpired
                        ? 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
                      border: `1px solid ${
                        isUsed 
                          ? '#d9d9d9' 
                          : isExpired
                          ? '#ffccc7'
                          : '#e6f0ff'
                      }`
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-blue-600">{voucher.code}</h3>
                          <p className="text-sm text-gray-500">
                            {voucher.type === 'percentage' 
                              ? `Giảm ${voucher.discount}%` 
                              : `Giảm ${voucher.discount.toLocaleString('vi-VN')}₫`}
                          </p>
                        </div>
                        <Tag color={isUsed ? 'red' : isExpired ? 'orange' : 'green'}>
                          {isUsed ? 'Đã dùng' : isExpired ? 'Hết hạn' : 'Còn hạn'}
                        </Tag>
                      </div>
                      
                      <div className="flex-grow">
                        <p className="text-sm text-gray-600 mb-2">
                          Đơn tối thiểu: {voucher.minOrder.toLocaleString('vi-VN')}₫
                        </p>
                        <p className="text-sm text-gray-600">
                          HSD: {formatDateSafely(voucher.endDate, 'dd/MM/yyyy')}
                        </p>
                      </div>

                      {!isUsed && !isExpired && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Button 
                            type="primary" 
                            block
                            onClick={() => {
                              // Copy voucher code to clipboard
                              navigator.clipboard.writeText(voucher.code);
                              message.success('Đã sao chép mã voucher!');
                            }}
                          >
                            Sao chép mã
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <GiftOutlined className="text-4xl sm:text-5xl text-gray-300 mb-3 sm:mb-4" />
              <p className="text-lg sm:text-xl text-gray-500">
                {voucherFilter === 'all' 
                  ? 'Bạn chưa có voucher nào'
                  : voucherFilter === 'unused'
                  ? 'Bạn chưa có voucher chưa sử dụng nào'
                  : 'Bạn chưa có voucher đã sử dụng nào'}
              </p>
            </div>
          )}
        </div>
      ),
    });
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 min-h-screen flex flex-col">
      <style>
        {`
          .bg-navy-100 {
            background-color: #e6f0ff;
          }
          .bg-navy-600 {
            background-color: #1a365d;
          }
          .bg-navy-700 {
            background-color: #153e75;
          }
          .text-navy-600 {
            color: #1a365d;
          }
        `}
      </style>
      
      <div className="flex-grow">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={items}
          className="mb-4 sm:mb-6"
          tabPosition={isMobile ? "top" : "top"}
          centered={isMobile}
        />
      </div>

      <div className="mb-24">
        <Modal
          title="Edit Profile Information"
          open={isEditModalVisible}
          onOk={() => handleEditProfileSubmit()}
          onCancel={() => setIsEditModalVisible(false)}
          okText="Save Changes"
          cancelText="Cancel"
          width={isMobile ? "95%" : 600}
        >
          <Form
            form={editForm}
            layout="vertical"
            className="mt-4"
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: 'Please enter your full name' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input prefix={<FaEnvelope className="text-gray-400" />} placeholder="Enter your email" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please enter your phone number' },
                { pattern: /^[0-9]{10,11}$/, message: 'Please enter a valid phone number' }
              ]}
            >
              <Input prefix={<FaPhone className="text-gray-400" />} placeholder="Enter your phone number" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Please enter your address' }]}
            >
              <Input.TextArea 
                prefix={<FaMapMarkerAlt className="text-gray-400" />} 
                placeholder="Enter your address"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              name="birthday"
              label="Birthday"
              rules={[{ required: true, message: 'Please select your birthday' }]}
            >
              <DatePicker 
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Select your birthday"
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Change Profile Picture"
          open={isAvatarModalVisible}
          onCancel={() => setIsAvatarModalVisible(false)}
          footer={null}
          width={isMobile ? "95%" : 400}
        >
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <Avatar
                size={120}
                src={avatarUrl || user.imageUrl}
                icon={<UserOutlined />}
                className="border-4 border-navy-600 shadow-lg"
              />
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Button 
              icon={<UploadOutlined />} 
              className="bg-navy-600 hover:bg-navy-700 text-white"
              onClick={handleAvatarClick}
              loading={isUploading}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload New Picture'}
            </Button>
            <p className="text-gray-500 text-sm mt-2">
              Recommended: Square image, at least 200x200 pixels
            </p>
          </div>
        </Modal>

        {/* Order Details Modal */}
        <OrderDetailsModal />
      </div>
    </div>
  );
};

export default Profile;
