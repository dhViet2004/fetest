import React, { useState, useCallback, Suspense } from 'react';
import { Button, Avatar, Collapse, Popover } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { FaHeadset, FaQuestionCircle, FaFacebook } from 'react-icons/fa';

// Lazy load Zalo SDK
const ZaloChatWidget = React.lazy(() => import('./ZaloChatWidget'));

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('zalo');

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const faqItems = [
    {
      key: '1',
      label: 'Làm thế nào để đặt hàng?',
      children: 'Bạn có thể đặt hàng bằng cách: \n1. Chọn sản phẩm và thêm vào giỏ hàng\n2. Kiểm tra giỏ hàng và chọn phương thức thanh toán\n3. Điền thông tin giao hàng\n4. Xác nhận đơn hàng',
    },
    {
      key: '2',
      label: 'Thời gian giao hàng là bao lâu?',
      children: 'Thời gian giao hàng thông thường từ 2-5 ngày làm việc, tùy thuộc vào địa điểm giao hàng và phương thức vận chuyển bạn chọn.',
    },
    {
      key: '3',
      label: 'Chính sách đổi trả như thế nào?',
      children: 'Chúng tôi chấp nhận đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên tem, mác và chưa qua sử dụng.',
    },
    {
      key: '4',
      label: 'Có những phương thức thanh toán nào?',
      children: 'Chúng tôi chấp nhận các phương thức thanh toán: \n- Chuyển khoản ngân hàng\n- Thanh toán khi nhận hàng (COD)\n- Ví điện tử (Momo, ZaloPay, VNPay)',
    },
    {
      key: '5',
      label: 'Làm sao để theo dõi đơn hàng?',
      children: 'Bạn có thể theo dõi đơn hàng bằng cách: \n1. Đăng nhập vào tài khoản\n2. Vào mục "Đơn hàng của tôi"\n3. Chọn đơn hàng cần theo dõi',
    },
  ];

  const renderContent = () => {
    if (activeTab === 'zalo') {
      return (
        <div className="w-[300px] h-[450px] flex flex-col">
          {/* Store Info */}
          <div className="bg-gray-100 p-3 rounded-lg mb-3">
            <div className="flex items-start space-x-3">
              <Avatar src="https://res.cloudinary.com/dh1o42tjk/image/upload/v1744696489/293856112_700167161082539_6334980016010373075_n_po8xll.jpg" />
              <div>
                <p className="font-medium ms-2">FashionStore Support</p>
                <p className="text-gray-600 ms-2">Liên hệ với chúng tôi qua Zalo</p>
              </div>
            </div>
          </div>

          {/* Zalo Web Chat Widget */}
          <div className="flex-1 overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            }>
              <ZaloChatWidget />
            </Suspense>
          </div>

          {/* Support Info */}
          <div className="text-center text-sm text-gray-500 mt-3">
            <p>Thời gian hỗ trợ:</p>
            <p className="font-medium">8:00 - 22:00 (Thứ 2 - Chủ Nhật)</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'facebook') {
      return (
        <div className="w-[300px] h-[450px] flex flex-col">
          {/* Store Info */}
          <div className="bg-gray-100 p-3 rounded-lg mb-3">
            <div className="flex items-start space-x-3">
              <Avatar src="https://res.cloudinary.com/dh1o42tjk/image/upload/v1744696489/293856112_700167161082539_6334980016010373075_n_po8xll.jpg" />
              <div>
                <p className="font-medium ms-2">FashionStore Support</p>
                <p className="text-gray-600 ms-2">Liên hệ với chúng tôi qua Facebook</p>
              </div>
            </div>
          </div>

          {/* Facebook Messenger */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-sm w-full">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#1877F2] flex items-center justify-center mb-3">
                  <FaFacebook className="text-white text-3xl" />
                </div>
                <p className="text-center text-gray-700 mb-4">
                  Nhắn tin với chúng tôi qua Facebook Messenger
                </p>
                <Button
                  type="primary"
                  className="bg-[#1877F2] hover:bg-[#1877F2]/90"
                  onClick={() => window.open('https://www.facebook.com/messages/t/100081343767849', '_blank')}
                >
                  Mở Messenger
                </Button>
              </div>
            </div>
          </div>

          {/* Support Info */}
          <div className="text-center text-sm text-gray-500 mt-3">
            <p>Thời gian hỗ trợ:</p>
            <p className="font-medium">8:00 - 22:00 (Thứ 2 - Chủ Nhật)</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-[300px] h-[450px] flex flex-col">
        <div className="bg-gray-100 p-3 rounded-lg mb-3">
          <div className="flex items-start space-x-3">
            <FaQuestionCircle className="text-blue-500 text-xl mt-1" />
            <div>
              <p className="font-medium">Câu hỏi thường gặp</p>
              <p className="text-gray-600">Tìm câu trả lời cho các thắc mắc phổ biến</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Collapse
            items={faqItems}
            className="bg-white"
            expandIconPosition="end"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover
        content={
          <div className="min-w-[300px]">
            {/* Tab Navigation */}
            <div className="flex border-b mb-3">
              <button
                className={`flex-1 py-2 text-center ${
                  activeTab === 'zalo'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-blue-500'
                }`}
                onClick={() => handleTabChange('zalo')}
              >
                Zalo
              </button>
              <button
                className={`flex-1 py-2 text-center ${
                  activeTab === 'facebook'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-blue-500'
                }`}
                onClick={() => handleTabChange('facebook')}
              >
                Facebook
              </button>
              <button
                className={`flex-1 py-2 text-center ${
                  activeTab === 'faq'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-blue-500'
                }`}
                onClick={() => handleTabChange('faq')}
              >
                FAQ
              </button>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        }
        title={
          <div className="flex items-center space-x-2">
            <FaHeadset className="text-blue-500 text-xl" />
            <span>Hỗ trợ khách hàng</span>
          </div>
        }
        trigger="click"
        open={isOpen}
        onOpenChange={setIsOpen}
        placement="topRight"
        className="chat-popover"
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          className="bg-blue-500 hover:bg-blue-600 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Open Chat"
        />
      </Popover>
    </div>
  );
};

export default ChatWidget; 