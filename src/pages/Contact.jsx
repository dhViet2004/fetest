import React, { useState } from 'react';
import { Form, Input, Button, message, Typography, Row, Col, Card, Space } from 'antd';
import { 
  EnvironmentOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  ClockCircleOutlined,
  SendOutlined,
  UserOutlined,
  MessageOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const Contact = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Here you would typically send the form data to your backend
      console.log('Form values:', values);
      message.success('Thank you for your message! We will get back to you soon.');
      form.resetFields();
    } catch {
      message.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <Title level={1} className="text-4xl font-bold mb-4">
            Contact Us
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          {/* Contact Form */}
          <Col xs={24} lg={14}>
            <Card className="shadow-md">
              <Title level={3} className="mb-6">Send us a Message</Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
              >
                <Form.Item
                  name="name"
                  label="Your Name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Enter your name"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="Enter your email"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message: 'Please enter a subject' }]}
                >
                  <Input 
                    placeholder="Enter subject"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Message"
                  rules={[{ required: true, message: 'Please enter your message' }]}
                >
                  <TextArea 
                    prefix={<MessageOutlined />}
                    placeholder="Enter your message"
                    rows={6}
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    icon={<SendOutlined />}
                    loading={loading}
                    className="w-full"
                  >
                    Send Message
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size="large" className="w-full">
              <Card className="shadow-md">
                <Title level={3} className="mb-6">Contact Information</Title>
                <Space direction="vertical" size="large" className="w-full">
                  <div className="flex items-start space-x-4">
                    <EnvironmentOutlined className="text-2xl text-blue-500 mt-1" />
                    <div>
                      <Title level={5}>Our Location</Title>
                      <Paragraph>
                        Trường Đại học Công nghiệp TP.HCM<br />
                        12 Nguyễn Văn Bảo, Phường 4<br />
                        Quận Gò Vấp, TP.HCM
                      </Paragraph>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <PhoneOutlined className="text-2xl text-green-500 mt-1" />
                    <div>
                      <Title level={5}>Phone Number</Title>
                      <Paragraph>+84 123 456 789</Paragraph>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <MailOutlined className="text-2xl text-red-500 mt-1" />
                    <div>
                      <Title level={5}>Email Address</Title>
                      <Paragraph>contact@fashionstore.com</Paragraph>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <ClockCircleOutlined className="text-2xl text-yellow-500 mt-1" />
                    <div>
                      <Title level={5}>Business Hours</Title>
                      <Paragraph>
                        Monday - Friday: 9:00 AM - 10:00 PM<br />
                        Saturday - Sunday: 10:00 AM - 8:00 PM
                      </Paragraph>
                    </div>
                  </div>
                </Space>
              </Card>

              {/* Map Section */}
              <Card className="shadow-md">
                <Title level={3} className="mb-6">Find Us</Title>
                <div className="w-full h-64 bg-gray-200 rounded-lg">
                  {/* Replace with your actual map component or iframe */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241779446617!2d106.6842705!3d10.8221589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174deb3ef536f31%3A0x8b7bb8b7c956157b!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBUUC5IQ00!5e0!3m2!1svi!2s!4v1710830000000!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Contact; 