import React, { useState, useRef, useEffect } from 'react';
import { Button, Avatar, Popover, Input, List, Tooltip } from 'antd';
import { 
  MessageOutlined, 
  RobotOutlined, 
  SendOutlined,
  SmileOutlined,
  SoundOutlined,
  FileImageOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import { FaRobot, FaUser, FaRegSmile, FaMicrophone, FaImage, FaTimes } from 'react-icons/fa';

const AIChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);

  // Các từ khóa và câu trả lời mẫu
  const keywordResponses = {
    // Chào hỏi
    'chào': 'Xin chào! Tôi là trợ lý AI của FashionStore. Tôi có thể giúp gì cho bạn?',
    'hi': 'Xin chào! Tôi là trợ lý AI của FashionStore. Tôi có thể giúp gì cho bạn?',
    'hello': 'Xin chào! Tôi là trợ lý AI của FashionStore. Tôi có thể giúp gì cho bạn?',
    'xin chào': 'Xin chào! Tôi là trợ lý AI của FashionStore. Tôi có thể giúp gì cho bạn?',
    'chào bạn': 'Xin chào! Tôi là trợ lý AI của FashionStore. Tôi có thể giúp gì cho bạn?',

    // Tạm biệt
    'tạm biệt': 'Cảm ơn bạn đã chat với tôi. Nếu cần hỗ trợ thêm, bạn có thể liên hệ với chúng tôi qua Zalo hoặc Facebook. Chúc bạn một ngày tốt lành!',
    'bye': 'Cảm ơn bạn đã chat với tôi. Nếu cần hỗ trợ thêm, bạn có thể liên hệ với chúng tôi qua Zalo hoặc Facebook. Chúc bạn một ngày tốt lành!',
    'goodbye': 'Cảm ơn bạn đã chat với tôi. Nếu cần hỗ trợ thêm, bạn có thể liên hệ với chúng tôi qua Zalo hoặc Facebook. Chúc bạn một ngày tốt lành!',

    // Câu hỏi chung
    'tư vấn': 'Tôi có thể tư vấn cho bạn về: \n- Thông tin sản phẩm\n- Size và cách chọn size\n- Phương thức thanh toán\n- Chính sách vận chuyển\n- Chính sách đổi trả\n\nBạn cần tư vấn về vấn đề gì?',
    'giúp': 'Tôi có thể giúp bạn với các vấn đề: \n- Tìm kiếm sản phẩm\n- Hướng dẫn đặt hàng\n- Theo dõi đơn hàng\n- Giải đáp thắc mắc\n\nBạn cần giúp đỡ gì?',
    'hỗ trợ': 'Tôi có thể hỗ trợ bạn với các vấn đề: \n- Tìm kiếm sản phẩm\n- Hướng dẫn đặt hàng\n- Theo dõi đơn hàng\n- Giải đáp thắc mắc\n\nBạn cần hỗ trợ gì?',

    // Thông tin cơ bản
    'giá': 'Bạn có thể xem giá sản phẩm tại trang chi tiết sản phẩm. Nếu cần hỗ trợ thêm, vui lòng liên hệ với chúng tôi qua Zalo hoặc Facebook.',
    'size': 'Chúng tôi có các size từ XS đến XXL. Bạn có thể tham khảo bảng size tại trang chi tiết sản phẩm.',
    'ship': 'Chúng tôi giao hàng toàn quốc với phí ship từ 20.000đ - 50.000đ tùy khu vực.',
    'đổi trả': 'Chính sách đổi trả trong vòng 7 ngày với điều kiện sản phẩm còn nguyên tem, mác.',
    'thanh toán': 'Chúng tôi chấp nhận thanh toán qua chuyển khoản, COD, và các ví điện tử.',
    'mã giảm giá': 'Bạn có thể nhận mã giảm giá khi đăng ký thành viên hoặc theo dõi fanpage của chúng tôi.',

    // Câu hỏi phức tạp - yêu cầu hỗ trợ trực tiếp
    'khiếu nại': 'Để được hỗ trợ tốt nhất về khiếu nại, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook. Đội ngũ hỗ trợ sẽ phản hồi bạn trong thời gian sớm nhất.',
    'thiếu nại': 'Để được hỗ trợ tốt nhất về khiếu nại, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook. Đội ngũ hỗ trợ sẽ phản hồi bạn trong thời gian sớm nhất.',
    'khiếu': 'Để được hỗ trợ tốt nhất về khiếu nại, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook. Đội ngũ hỗ trợ sẽ phản hồi bạn trong thời gian sớm nhất.',
    'nại': 'Để được hỗ trợ tốt nhất về khiếu nại, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook. Đội ngũ hỗ trợ sẽ phản hồi bạn trong thời gian sớm nhất.',
    'bảo hành': 'Để được tư vấn chi tiết về chính sách bảo hành, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook.',
    'bảo': 'Để được tư vấn chi tiết về chính sách bảo hành, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook.',
    'hành': 'Để được tư vấn chi tiết về chính sách bảo hành, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook.',
    'sai size': 'Nếu bạn gặp vấn đề về size sản phẩm, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook để được hỗ trợ đổi trả.',
    'sai': 'Nếu bạn gặp vấn đề về sản phẩm, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook để được hỗ trợ.',
    'hỏng': 'Nếu sản phẩm bị hỏng, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook để được hỗ trợ xử lý.',
    'lỗi': 'Để được hỗ trợ tốt nhất về vấn đề lỗi, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook.',
    'phức tạp': 'Để được hỗ trợ tốt nhất, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook. Đội ngũ hỗ trợ sẽ phản hồi bạn trong thời gian sớm nhất.',
  };

  // Hàm kiểm tra từ khóa tương tự
  const findSimilarKeyword = (input) => {
    const inputLower = input.toLowerCase();
    
    // Danh sách các từ khóa tương tự và câu trả lời tương ứng
    const similarKeywords = {
      'khiếu nại': {
        keywords: ['khiếu nại', 'thiếu nại', 'khiếu', 'nại'],
        response: 'Để được hỗ trợ tốt nhất về khiếu nại, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook. Đội ngũ hỗ trợ sẽ phản hồi bạn trong thời gian sớm nhất.'
      },
      'bảo hành': {
        keywords: ['bảo hành', 'bảo', 'hành'],
        response: 'Để được tư vấn chi tiết về chính sách bảo hành, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook.'
      },
      'sai size': {
        keywords: ['sai size', 'sai', 'size'],
        response: 'Nếu bạn gặp vấn đề về size sản phẩm, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook để được hỗ trợ đổi trả.'
      },
      'hỏng': {
        keywords: ['hỏng', 'hư', 'vỡ', 'gãy'],
        response: 'Nếu sản phẩm bị hỏng, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook để được hỗ trợ xử lý.'
      },
      'lỗi': {
        keywords: ['lỗi', 'sai', 'không đúng'],
        response: 'Để được hỗ trợ tốt nhất về vấn đề lỗi, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook.'
      },
      'phức tạp': {
        keywords: ['phức tạp', 'khó', 'phức', 'tạp'],
        response: 'Để được hỗ trợ tốt nhất, vui lòng liên hệ trực tiếp với chúng tôi qua Zalo hoặc Facebook. Đội ngũ hỗ trợ sẽ phản hồi bạn trong thời gian sớm nhất.'
      }
    };

    // Kiểm tra từng nhóm từ khóa tương tự
    for (const [, data] of Object.entries(similarKeywords)) {
      if (data.keywords.some(keyword => inputLower.includes(keyword))) {
        return data.response;
      }
    }

    return null;
  };

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Thêm tin nhắn của người dùng
    const userMessage = {
      type: 'user',
      content: inputValue,
      time: new Date().toLocaleTimeString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Hiển thị trạng thái đang soạn tin
    setIsTyping(true);

    // Tìm câu trả lời phù hợp
    let response = 'Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng liên hệ với chúng tôi qua Zalo hoặc Facebook để được hỗ trợ trực tiếp.';
    
    // Kiểm tra từ khóa tương tự trước
    const similarResponse = findSimilarKeyword(inputValue);
    if (similarResponse) {
      response = similarResponse;
    } else {
      // Nếu không tìm thấy từ khóa tương tự, kiểm tra từ khóa chính xác
      const inputLower = inputValue.toLowerCase();
      for (const [keyword, answer] of Object.entries(keywordResponses)) {
        if (inputLower.includes(keyword.toLowerCase())) {
          response = answer;
          break;
        }
      }
    }

    // Thêm tin nhắn trả lời sau 1 giây
    setTimeout(() => {
      setIsTyping(false);
      const botMessage = {
        type: 'bot',
        content: response,
        time: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const renderContent = () => (
    <div className="min-w-[250px]">
      {/* Store Info */}
      <div className="bg-gray-100 p-2 rounded-lg mb-2">
        <div className="flex items-start space-x-2">
          <Avatar 
            icon={<FaRobot className="text-white" />} 
            className="bg-blue-500 flex items-center justify-center"
          />
          <div>
            <p className="font-medium ms-2">AI Assistant</p>
            <p className="text-gray-600 ms-2 text-xs">Hỗ trợ tự động 24/7</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatBoxRef}
        className="h-[250px] overflow-y-auto mb-2 bg-white rounded-lg p-2 border scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item className="!px-0">
              <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`max-w-[85%] ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-2`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.type === 'bot' ? (
                      <Avatar 
                        size="small" 
                        icon={<FaRobot className="text-blue-500" />} 
                        className="bg-white"
                      />
                    ) : (
                      <Avatar 
                        size="small" 
                        icon={<FaUser className="text-white" />} 
                        className="bg-blue-400"
                      />
                    )}
                    <span className="text-xs opacity-70">{msg.time}</span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            </List.Item>
          )}
        />
        {isTyping && (
          <div className="flex items-center gap-2 mt-2">
            <Avatar 
              size="small" 
              icon={<FaRobot className="text-blue-500" />} 
              className="bg-white"
            />
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          <Tooltip title="Emoji">
            <Button 
              type="text" 
              icon={<FaRegSmile className="text-gray-500 hover:text-blue-500" />} 
              size="small"
            />
          </Tooltip>
          <Tooltip title="Voice">
            <Button 
              type="text" 
              icon={<FaMicrophone className="text-gray-500 hover:text-blue-500" />} 
              size="small"
            />
          </Tooltip>
          <Tooltip title="Image">
            <Button 
              type="text" 
              icon={<FaImage className="text-gray-500 hover:text-blue-500" />} 
              size="small"
            />
          </Tooltip>
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1"
            size="small"
            prefix={<CustomerServiceOutlined className="text-gray-400" />}
            suffix={
              inputValue && (
                <CloseCircleOutlined
                  className="text-gray-400 hover:text-red-500 cursor-pointer"
                  onClick={() => setInputValue('')}
                />
              )
            }
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            className="bg-blue-500 hover:bg-blue-600"
            size="small"
          />
        </div>
      </div>

      {/* Support Info */}
      <div className="text-center text-xs text-gray-500 mt-2">
        <p>Thời gian hỗ trợ:</p>
        <p className="font-medium">24/7</p>
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <Popover
        content={renderContent()}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaRobot className="text-blue-500 text-xl" />
              <span>Chat với AI</span>
            </div>
            <Tooltip title="Thu nhỏ">
              <Button 
                type="text" 
                icon={<MinusCircleOutlined />} 
                size="small"
                onClick={() => setIsOpen(false)}
              />
            </Tooltip>
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
          icon={<FaRobot />}
          className="bg-blue-500 hover:bg-blue-600 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Open AI Chat"
        />
      </Popover>
    </div>
  );
};

export default AIChatBox; 