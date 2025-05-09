import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  message, 
  Card, 
  Typography,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditFilled, 
  DeleteOutlined,
  TagsOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [isPromotionModalVisible, setIsPromotionModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [promotionForm] = Form.useForm();
  const [discountType, setDiscountType] = useState('percentage');

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await fetch('http://localhost:3001/vouchers');
      if (response.ok) {
        const data = await response.json();
        setPromotions(data);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      message.error('Failed to load vouchers');
    }
  };

  const handlePromotionSubmit = async () => {
    try {
      const values = await promotionForm.validateFields();
      const voucherData = {
        ...values,
        id: editingPromotion?.id || Date.now().toString(),
        usedBy: editingPromotion?.usedBy || []
      };

      if (editingPromotion) {
        // Update existing voucher
        const response = await fetch(`http://localhost:3001/vouchers/${editingPromotion.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(voucherData),
        });
        
        if (response.ok) {
          message.success('Voucher updated successfully');
          setPromotions(promotions.map(p => p.id === editingPromotion.id ? voucherData : p));
        }
      } else {
        // Create new voucher
        const response = await fetch('http://localhost:3001/vouchers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(voucherData),
        });
        
        if (response.ok) {
          message.success('Voucher created successfully');
          setPromotions([...promotions, voucherData]);
        }
      }
      
      setIsPromotionModalVisible(false);
      promotionForm.resetFields();
      setEditingPromotion(null);
      setDiscountType('percentage');
    } catch (error) {
      console.error('Error saving voucher:', error);
      message.error('Error saving voucher');
    }
  };

  const handleDeletePromotion = async (id) => {
    confirm({
      title: 'Are you sure you want to delete this voucher?',
      icon: <ExclamationCircleFilled />,
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'No, cancel',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3001/vouchers/${id}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            message.success('Voucher deleted successfully');
            setPromotions(promotions.filter(p => p.id !== id));
          }
        } catch (error) {
          console.error('Error deleting voucher:', error);
          message.error('Error deleting voucher');
        }
      },
    });
  };

  const handleEditPromotion = (promotion) => {
    setEditingPromotion(promotion);
    promotionForm.setFieldsValue({
      code: promotion.code,
      discount: promotion.discount,
      type: promotion.type,
      minOrder: promotion.minOrder,
      startDate: promotion.startDate,
      endDate: promotion.endDate
    });
    setIsPromotionModalVisible(true);
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
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      width: 150,
      render: (discount, record) => 
        record.type === 'percentage' ? `${discount}%` : formatCurrency(discount),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color={type === 'percentage' ? 'blue' : 'green'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Min Order',
      dataIndex: 'minOrder',
      key: 'minOrder',
      width: 150,
      render: (minOrder) => formatCurrency(minOrder),
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditFilled style={{ color: '#1890ff' }} />} 
            onClick={() => handleEditPromotion(record)}
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
          />
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePromotion(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <Card className="shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <Title level={3} className="m-0 text-center md:text-left">Promotion Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingPromotion(null);
              promotionForm.resetFields();
              setIsPromotionModalVisible(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 border-none w-full md:w-auto"
          >
            Add New Voucher
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table 
            dataSource={promotions}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
            size="middle"
            bordered
          />
        </div>
      </Card>

      <Modal
        title={editingPromotion ? "Edit Voucher" : "Add New Voucher"}
        open={isPromotionModalVisible}
        onOk={handlePromotionSubmit}
        onCancel={() => {
          setIsPromotionModalVisible(false);
          promotionForm.resetFields();
          setEditingPromotion(null);
          setDiscountType('percentage');
        }}
        width="95%"
        style={{ maxWidth: '600px' }}
      >
        <Form
          form={promotionForm}
          layout="vertical"
        >
          <Form.Item
            name="code"
            label="Voucher Code"
            rules={[{ required: true, message: 'Please input the voucher code!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Discount Type"
            rules={[{ required: true, message: 'Please select the discount type!' }]}
            initialValue="percentage"
          >
            <Select onChange={(value) => setDiscountType(value)}>
              <Option value="percentage">Percentage</Option>
              <Option value="fixed">Fixed Amount</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="discount"
            label="Discount Value"
            rules={[
              { required: true, message: 'Please input the discount value!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const type = getFieldValue('type');
                  const numValue = Number(value);
                  if (type === 'percentage') {
                    if (numValue < 0 || numValue > 100) {
                      return Promise.reject(new Error('Percentage must be between 0 and 100!'));
                    }
                  } else {
                    if (numValue <= 0) {
                      return Promise.reject(new Error('Fixed amount must be greater than 0!'));
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            getValueFromEvent={(e) => Number(e.target.value)}
          >
            <Input 
              type="number" 
              addonAfter={discountType === 'percentage' ? '%' : 'VNĐ'}
            />
          </Form.Item>
          
          <Form.Item
            name="minOrder"
            label="Minimum Order Amount (VNĐ)"
            rules={[
              { required: true, message: 'Please input the minimum order amount!' },
              {
                validator(_, value) {
                  const numValue = Number(value);
                  if (isNaN(numValue) || numValue < 0) {
                    return Promise.reject(new Error('Minimum order must be greater than or equal to 0!'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            getValueFromEvent={(e) => Number(e.target.value)}
          >
            <Input 
              type="number" 
              min={0} 
              addonAfter="VNĐ"
            />
          </Form.Item>
          
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: 'Please select the start date!' }]}
          >
            <Input type="date" />
          </Form.Item>
          
          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: 'Please select the end date!' }]}
          >
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionManagement; 