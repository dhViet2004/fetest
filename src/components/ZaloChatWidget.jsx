import React from 'react';
import { Card, Typography } from 'antd';
import { QrcodeOutlined, MessageOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ZaloChatWidget = () => {
  return (
    <Card 
      className="w-[100%] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden"
      styles={{
        body: {
          padding: '20px',
          background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
        }
      }}
    >
      {/* Zalo QR Code */}
      <div className="flex flex-col items-center">
        <div className="relative w-52 h-52 mb-4 group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0068ff]/10 to-transparent rounded-2xl"></div>
          <img 
            src="https://res.cloudinary.com/dh1o42tjk/image/upload/v1746364787/z6567990933854_98e965dec06bfd587dbf5609007228f9_y9f0ge.jpg"
            alt="Zalo QR Code"
            className="w-full h-full object-contain rounded-2xl transition-all duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/80 rounded-2xl backdrop-blur-sm">
            <QrcodeOutlined className="text-5xl text-[#0068ff]" />
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0068ff]/5 rounded-full">
          <MessageOutlined className="text-[#0068ff] text-lg" />
          <Text className="text-sm text-gray-700">
            Quét mã QR để chat trực tiếp
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ZaloChatWidget; 