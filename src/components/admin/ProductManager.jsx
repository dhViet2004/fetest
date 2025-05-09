import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Upload, 
  Popconfirm, 
  Tag, 
  Card, 
  Typography, 
  Tooltip, 
  Spin,
  Select,
  App,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditFilled
} from '@ant-design/icons';
import { FaSpinner, FaTrash } from 'react-icons/fa';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteForm] = Form.useForm();
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch {
      setError('Failed to fetch products. Please try again later.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      setProducts(products.filter(product => product.id !== id));
      messageApi.success({
        content: 'Product deleted successfully',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 3,
      });
      setDeleteModalVisible(false);
      setProductToDelete(null);
      deleteForm.resetFields();
    } catch {
      setError('Failed to delete product. Please try again later.');
      messageApi.error({
        content: 'Failed to delete product',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 3,
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description,
      rating: product.rating,
      reviews: product.reviews,
      imageUrl: product.imageUrl,
      sizes: product.sizes || []
    });
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setError('');

    try {
      const totalStock = calculateTotalStock(values.sizes);
      const productPayload = {
        ...values,
        price: parseFloat(values.price),
        stock: totalStock,
        rating: 0,
        reviews: 0,
        sizes: values.sizes.map(size => ({
          size: size.size,
          stock: parseInt(size.stock)
        }))
      };

      let response;
      if (editingProduct?.id) {
        response = await fetch(`http://localhost:3001/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productPayload),
        });
      } else {
        response = await fetch('http://localhost:3001/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productPayload),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      setEditingProduct(null);
      form.resetFields();
      await fetchProducts();
      
      messageApi.success({
        content: editingProduct?.id ? 'Product updated successfully' : 'Product added successfully',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 3,
      });
    } catch {
      setError('Failed to save product. Please try again later.');
      messageApi.error({
        content: 'Failed to save product',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
        duration: 3,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    form.resetFields();
  };

  const handleAddProduct = () => {
    setEditingProduct({});
    form.resetFields();
  };

  const showDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    deleteForm.validateFields().then(values => {
      if (values.confirmName === productToDelete.name) {
        handleDelete(productToDelete.id);
      } else {
        messageApi.error({
          content: 'Product name does not match',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 3,
        });
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotalStock = (sizes) => {
    if (!sizes || !Array.isArray(sizes)) return 0;
    return sizes.reduce((total, size) => total + (parseInt(size.stock) || 0), 0);
  };

  const handleSizeChange = () => {
    const sizes = form.getFieldValue('sizes');
    const totalStock = calculateTotalStock(sizes);
    form.setFieldValue('stock', totalStock);
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      fixed: 'left',
      render: (text, record) => (
        <div className="flex items-center">
          <img 
            src={record.imageUrl} 
            alt={text} 
            className="w-10 h-10 rounded-md object-cover mr-3 flex-shrink-0"
          />
          <div className="overflow-x-auto whitespace-nowrap">
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.category}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price) => <span className="font-medium">{formatCurrency(price)}</span>,
    },
    {
      title: 'Sizes & Stock',
      dataIndex: 'sizes',
      key: 'sizes',
      width: 250,
      render: (sizes) => (
        <div className="flex flex-wrap gap-1">
          {sizes?.map((size, index) => (
            <Tag key={index} color={size.stock > 10 ? 'green' : size.stock > 0 ? 'orange' : 'red'}>
              {size.size}: {size.stock}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 200,
      render: (rating) => (
        <div className="flex items-center">
          <span className="text-yellow-500 mr-1">★</span>
          <span>{rating.toFixed(1)}</span>
          <span className="text-gray-400 text-xs ml-1">({rating >= 4 ? 'Excellent' : rating >= 3 ? 'Good' : 'Fair'})</span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button 
              icon={<EditFilled style={{ color: '#1890ff' }} />} 
              onClick={() => handleEdit(record)}
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => showDeleteModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6 shadow-md">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <Title level={3} className="m-0 text-center md:text-left">Product Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
            className="bg-blue-500 hover:bg-blue-600 border-none w-full md:w-auto"
          >
            Add Product
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <ExclamationCircleOutlined className="text-red-500 text-xl mr-2" />
              <div>
                <Text strong className="text-red-700">Error</Text>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <Table 
            dataSource={products} 
            columns={columns} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="shadow-sm"
            scroll={{ x: 1200 }}
            size="middle"
            bordered
          />
        </div>
      </Card>

      <Modal
        title={editingProduct?.id ? "Edit Product" : "Add New Product"}
        open={!!editingProduct}
        onCancel={handleCancel}
        footer={null}
        width="95%"
        style={{ maxWidth: '800px' }}
        destroyOnClose={false}
        className="product-form-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            sizes: [{ size: 'S', stock: 0 }]
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              form.submit();
            }
          }}
          preserve={true}
          className="w-full"
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
            className="mb-2"
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
              className="mb-2"
            >
              <Select placeholder="Select category">
                <Option value="T-Shirts">T-Shirts</Option>
                <Option value="Jeans">Jeans</Option>
                <Option value="Dresses">Dresses</Option>
                <Option value="Shoes">Shoes</Option>
                <Option value="Accessories">Accessories</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: 'Please enter price' }]}
              className="mb-2"
            >
              <InputNumber 
                min={0} 
                step={1000} 
                style={{ width: '100%' }} 
                placeholder="Enter price" 
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                addonAfter="₫"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="imageUrl"
            label="Image URL"
            rules={[{ required: true, message: 'Please enter image URL' }]}
            className="mb-2"
          >
            <Input placeholder="Enter image URL" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
            className="mb-2"
          >
            <TextArea rows={3} placeholder="Enter product description" />
          </Form.Item>

          <Form.List name="sizes">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-2">
                  <Text strong>Sizes & Stock</Text>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Size
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={[8, 8]} className="mb-2">
                    <Col xs={8} sm={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'size']}
                        rules={[{ required: true, message: 'Missing size' }]}
                      >
                        <Select placeholder="Select size">
                          {['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'].map(size => {
                            const currentSizes = form.getFieldValue('sizes') || [];
                            const isSizeExists = currentSizes.some((s, index) => 
                              s && s.size === size && index !== name
                            );
                            return (
                              <Option key={size} value={size} disabled={isSizeExists}>
                                {size}
                              </Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={12}>
                      <Form.Item
                        {...restField}
                        name={[name, 'stock']}
                        rules={[{ required: true, message: 'Missing stock' }]}
                      >
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          placeholder="Stock quantity"
                          onChange={handleSizeChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={4} sm={4}>
                      <Button
                        type="text"
                        danger
                        icon={<FaTrash className="text-red-500" />}
                        onClick={() => {
                          remove(name);
                          handleSizeChange();
                        }}
                        className="mt-1 flex items-center justify-center w-full"
                      />
                    </Col>
                  </Row>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item className="flex justify-end space-x-3 mb-0 mt-4">
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button 
                onClick={handleCancel} 
                className="w-full"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 border-none w-full"
              >
                {editingProduct?.id ? 'Update' : 'Add'} Product
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Delete Product"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setProductToDelete(null);
          deleteForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <div className="mb-4">
          <p className="text-gray-600">To confirm deletion, please type the product name:</p>
          <p className="font-medium text-red-500 mt-2">{productToDelete?.name}</p>
        </div>
        <Form
          form={deleteForm}
          onFinish={handleDeleteConfirm}
        >
          <Form.Item
            name="confirmName"
            rules={[
              { required: true, message: 'Please enter the product name' },
              {
                validator: (_, value) => {
                  if (value === productToDelete?.name) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Product name does not match'));
                }
              }
            ]}
          >
            <Input placeholder="Type product name to confirm" />
          </Form.Item>
          <div className="flex justify-end space-x-3">
            <Button 
              onClick={() => {
                setDeleteModalVisible(false);
                setProductToDelete(null);
                deleteForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button 
              danger 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Product
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

const ProductManagerWithApp = () => {
  return (
    <App>
      <ProductManager />
    </App>
  );
};

export default ProductManagerWithApp;