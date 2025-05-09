import React from 'react';
import { Typography, Row, Col, Card, Space, Divider } from 'antd';
import { 
  TeamOutlined, 
  HeartOutlined, 
  GlobalOutlined, 
  TrophyOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Title level={1} className="text-4xl font-bold mb-4">
            About Fashion Store
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
            We are passionate about bringing you the latest fashion trends and high-quality clothing at affordable prices.
            Our mission is to make everyone feel confident and beautiful in their own style.
          </Paragraph>
        </div>

        {/* Values Section */}
        <Row gutter={[32, 32]} className="mb-16">
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full text-center hover:shadow-lg transition-shadow">
              <TeamOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={4}>Our Team</Title>
              <Paragraph className="text-gray-600">
                A dedicated team of fashion experts working to bring you the best shopping experience.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full text-center hover:shadow-lg transition-shadow">
              <HeartOutlined className="text-4xl text-red-500 mb-4" />
              <Title level={4}>Our Passion</Title>
              <Paragraph className="text-gray-600">
                We love fashion and are committed to providing the best quality products.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full text-center hover:shadow-lg transition-shadow">
              <GlobalOutlined className="text-4xl text-green-500 mb-4" />
              <Title level={4}>Global Reach</Title>
              <Paragraph className="text-gray-600">
                Serving customers worldwide with fast and reliable shipping.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="h-full text-center hover:shadow-lg transition-shadow">
              <TrophyOutlined className="text-4xl text-yellow-500 mb-4" />
              <Title level={4}>Quality</Title>
              <Paragraph className="text-gray-600">
                Committed to providing high-quality products and excellent service.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <Title level={2} className="text-center mb-8">Our Story</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <img 
                src="https://res.cloudinary.com/dh1o42tjk/image/upload/v1746543240/photo-1441984904996-e0b6ba687e04_zjzrrx.avif" 
                alt="Our Store" 
                className="w-full h-64 object-cover rounded-lg"
              />
            </Col>
            <Col xs={24} md={12}>
              <Paragraph className="text-lg">
                Founded in 2024, Fashion Store started with a simple idea: to make fashion accessible to everyone.
                We believe that everyone deserves to look and feel their best, regardless of their budget.
              </Paragraph>
              <Paragraph className="text-lg">
                Over the years, we've grown from a small local store to an international fashion destination,
                serving customers worldwide with the latest trends and timeless classics.
              </Paragraph>
              <Paragraph className="text-lg">
                Our commitment to quality, customer service, and sustainable practices has made us a trusted
                name in the fashion industry.
              </Paragraph>
            </Col>
          </Row>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <Title level={2} className="text-center mb-8">Contact Us</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large" className="w-full">
                <div className="flex items-center space-x-4">
                  <EnvironmentOutlined className="text-2xl text-blue-500" />
                  <div>
                    <Title level={5}>Address</Title>
                    <Paragraph>123 Fashion Street, Style District, City</Paragraph>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <PhoneOutlined className="text-2xl text-green-500" />
                  <div>
                    <Title level={5}>Phone</Title>
                    <Paragraph>+84 123 456 789</Paragraph>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MailOutlined className="text-2xl text-red-500" />
                  <div>
                    <Title level={5}>Email</Title>
                    <Paragraph>contact@fashionstore.com</Paragraph>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <ClockCircleOutlined className="text-2xl text-yellow-500" />
                  <div>
                    <Title level={5}>Business Hours</Title>
                    <Paragraph>Monday - Sunday: 9:00 AM - 10:00 PM</Paragraph>
                  </div>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <div className="h-full flex items-center justify-center">
                <img 
                  src="https://res.cloudinary.com/dh1o42tjk/image/upload/v1746543240/photo-1522071820081-009f0129c71c_wcjri9.avif" 
                  alt="Our Team" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 