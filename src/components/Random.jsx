import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, Tooltip, message } from 'antd';
import { 
  GiftOutlined,
  LoadingOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { FaGift } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://betest-s7wl.onrender.com';

const prizes = [
  { id: 1, name: 'Giảm 10K', value: 10000, probability: 0.2, color: '#FF5733', voucherCode: 'LUCKY10K' },
  { id: 2, name: 'Giảm 10%', percent: 10, probability: 0.15, color: '#FFC300', voucherCode: 'LUCKY10PERCENT' },
  { id: 3, name: 'Giảm 50K', value: 50000, probability: 0.1, color: '#28A745', voucherCode: 'LUCKY50K' },
  { id: 4, name: 'Giảm 200k', value: 200000, probability: 0.00000005, color: '#17A2B8', voucherCode: 'LUCKY200K' },
  { id: 5, name: 'Tiếc quá', value: 0, probability: 0.5, color: '#6610F2' },
];

const Random = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [voucherList, setVoucherList] = useState([]);

  // Load voucher từ localStorage khi component mount
  useEffect(() => {
    const savedVouchers = JSON.parse(localStorage.getItem("voucherList")) || [];
    setVoucherList(savedVouchers);
  }, []);

  // Lưu voucher vào ví voucher của người dùng
  const saveVoucher = async (prize) => {
    if (prize.name === "Tiếc quá") {
      message.info("Chúc bạn may mắn lần sau!");
      return;
    }

    try {
      // Lấy thông tin user hiện tại từ localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        message.error('Vui lòng đăng nhập để nhận voucher');
        navigate('/login');
        return;
      }

      // Lấy thông tin voucher từ server
      const response = await fetch(`${API_URL}/vouchers`);
      if (!response.ok) {
        throw new Error('Failed to fetch vouchers');
      }
      
      const vouchers = await response.json();
      console.log('Available vouchers:', vouchers); // Debug log
      console.log('Looking for voucher code:', prize.voucherCode); // Debug log
      
      // Tìm voucher và kiểm tra điều kiện
      const voucher = vouchers.find(v => v.code === prize.voucherCode);
      console.log('Found voucher:', voucher); // Debug log

      if (!voucher) {
        console.error('Voucher not found. Available codes:', vouchers.map(v => v.code)); // Debug log
        throw new Error(`Voucher not found with code: ${prize.voucherCode}`);
      }

      // Kiểm tra voucher đã hết hạn chưa
      const currentDate = new Date();
      const endDate = new Date(voucher.endDate);
      if (currentDate > endDate) {
        message.error('Voucher đã hết hạn');
        return;
      }

      // Kiểm tra user đã được cấp voucher này chưa
      if (voucher.userIds && voucher.userIds.includes(user.id)) {
        message.error('Bạn đã được cấp voucher này rồi');
        return;
      }

      // Thêm user vào danh sách userIds
      const updatedVoucher = {
        ...voucher,
        userIds: [...(voucher.userIds || []), user.id]
      };

      // Cập nhật voucher trên server
      const updateResponse = await fetch(`${API_URL}/vouchers/${voucher.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: updatedVoucher.userIds })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update voucher');
      }

      message.success(`Chúc mừng! Bạn đã nhận được voucher ${prize.name}`);
    } catch (error) {
      console.error('Error saving voucher:', error);
      message.error("Có lỗi xảy ra khi lưu voucher!");
    }
  };

  const spinWheel = () => {
    if (isSpinning || hasSpun) return;
    setIsSpinning(true);
    setResult(null);
    setHasSpun(true);

    // Chọn phần thưởng dựa trên xác suất
    let selectedPrize;
    const random = Math.random();
    let cumulativeProbability = 0;
    selectedPrize = prizes[prizes.length - 1];
    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        selectedPrize = prize;
        break;
      }
    }

    // Tính toán góc quay
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    const sectorAngle = 360 / prizes.length;
    const targetAngle = 180 - (prizeIndex * sectorAngle + sectorAngle / 2);
    const jitter = (Math.random() - 0.5) * 10;
    const finalRotation = 360 * 3 + targetAngle + jitter;

    setRotation(0);
    setTimeout(() => {
      setRotation(finalRotation);
      const spinDuration = 6000;
      setTimeout(() => {
        setIsSpinning(false);
        setResult(selectedPrize);
        saveVoucher(selectedPrize);
      }, spinDuration);
    }, 50);
  };

  // Nội dung vòng quay trong modal
  const renderWheel = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-[500px] h-[500px] mx-auto mb-8">
        <div
          ref={wheelRef}
          className="w-full h-full rounded-full border-[12px] border-gray-200 shadow-2xl relative"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(${prizes.map((prize, index) =>
              `${prize.color} ${(index * 100) / prizes.length}% ${((index + 1) * 100) / prizes.length}%`
            ).join(', ')})`,
            transition: 'transform 6s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
            transformOrigin: 'center',
            willChange: 'transform'
          }}
        >
          {prizes.map((prize, index) => {
            const angle = (360 / prizes.length) * (index + 0.5);
            return (
              <div
                key={prize.id}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `rotate(${angle}deg) translateY(-175px) rotate(${-angle}deg)`,
                  width: '120px',
                  marginLeft: '-60px',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span
                  className="font-bold text-3xl px-2"
                  style={{
                    color: '#ffffff',
                    textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                    display: 'inline-block',
                  }}
                >
                  {prize.name}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[24px] border-r-[24px] border-t-[48px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg"></div>
      </div>
      {result && (
        <div className="mt-8 text-4xl font-extrabold text-green-700 drop-shadow-lg animate-bounce bg-gradient-to-r from-yellow-200 to-yellow-100 px-8 py-4 rounded-xl border-4 border-yellow-500 prize-result relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-200 opacity-50"></div>
          <div className="relative z-10">
            🎉
            {result.name === "Tiếc quá" ? (
              <span className="text-red-500 block mt-3 text-2xl">
                Hẹn gặp lại lần sau!
              </span>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl text-gray-700">Chúc mừng!</span>
                <span className="text-3xl text-green-600 mt-2">Bạn nhận được: {result.name}</span>
              </div>
            )}
          </div>
        </div>
      )}
      <button
        onClick={spinWheel}
        className={`mt-10 px-12 py-5 font-extrabold text-3xl rounded-full shadow-lg transform transition-all duration-300 relative overflow-hidden ${
          hasSpun
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-red-500 text-white hover:scale-110 hover:shadow-xl"
        }`}
        disabled={hasSpun}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative z-10 flex items-center gap-2">
          🎡 Quay ngay!
        </span>
      </button>
    </div>
  );

  return (
    <div className="fixed bottom-5 left-6 z-50">
      <div className="relative">
        <Tooltip title="Vòng quay may mắn" placement="right">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<FaGift className="text-2xl" />}
            className="bg-white hover:bg-gray-50 border-2 border-red-500 text-red-500 hover:text-red-600 hover:border-red-600 shadow-lg transition-all duration-300 hover:scale-105 w-16 h-16"
            aria-label="Open Lucky Wheel"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
          </Button>
        </Tooltip>
      </div>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={700}
        closeIcon={<CloseOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />}
        styles={{
          body: {
            padding: 0,
            background: 'linear-gradient(135deg, #222 60%, #ffe600 100%)',
            borderRadius: 24,
            animation: 'modalFadeIn 0.5s ease-out'
          },
          mask: {
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)'
          }
        }}
        className="lucky-wheel-modal"
      >
        <div className="p-10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div
            className="absolute top-4 left-6 flex items-center gap-2 text-white text-lg font-semibold cursor-pointer hover:scale-110 transition-transform"
            onClick={() => setIsModalOpen(false)}
          >
            <IoArrowBack className="text-4xl" />
            <span className="text-2xl">Trở về</span>
          </div>
          <h1 className="text-6xl font-extrabold text-white mb-12 drop-shadow-lg animate-pulse relative">
            <span className="relative z-10">Vòng quay may mắn 🎉</span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-500 blur-xl opacity-50"></div>
          </h1>
          {renderWheel()}
        </div>
      </Modal>
      <style>{`
        .lucky-wheel-modal .ant-modal-content {
          border-radius: 24px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.25);
          animation: modalSlideIn 0.5s ease-out;
        }
        .lucky-wheel-modal .ant-modal-close {
          top: 24px;
          right: 24px;
          transition: transform 0.3s ease;
        }
        .lucky-wheel-modal .ant-modal-close:hover {
          transform: rotate(90deg);
        }
        @keyframes modalSlideIn {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .prize-result {
          animation: prizePop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes prizePop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes subtle-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-subtle-float {
          animation: subtle-float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Random;
