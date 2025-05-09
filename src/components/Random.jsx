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

const API_URL = 'http://localhost:3001';

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
        <div className="mt-8 text-4xl font-extrabold text-green-700 drop-shadow-lg animate-bounce bg-yellow-200 px-6 py-3 rounded-xl border-4 border-yellow-500">
          🎉
          {result.name === "Tiếc quá" ? (
            <span className="text-red-500 block mt-3 text-2xl">
              Hẹn gặp lại lần sau!
            </span>
          ) : (
            "Bạn nhận được: " + result.name
          )}
        </div>
      )}
      <button
        onClick={spinWheel}
        className={`mt-10 px-12 py-5 font-extrabold text-3xl rounded-full shadow-lg transform transition-all duration-300 ${
          hasSpun
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-red-500 text-white hover:scale-125"
        }`}
        disabled={hasSpun}
      >
        🎡 Quay ngay!
      </button>
    </div>
  );

  return (
    <div className="fixed bottom-5 left-6 z-50">
      <Tooltip title="Vòng quay may mắn">
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<FaGift className="text-3xl" />}
          className="bg-red-500 hover:bg-red-600 shadow-lg transition-all duration-300 hover:scale-110 w-24 h-24"
          aria-label="Open Lucky Wheel"
          onClick={() => setIsModalOpen(true)}
        />
      </Tooltip>
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
            borderRadius: 24
          },
          mask: {
            background: 'rgba(0,0,0,0.5)'
          }
        }}
        className="lucky-wheel-modal"
      >
        <div className="p-10 flex flex-col items-center justify-center">
          <div
            className="absolute top-4 left-6 flex items-center gap-2 text-white text-lg font-semibold cursor-pointer hover:scale-110 transition-transform"
            onClick={() => setIsModalOpen(false)}
          >
            <IoArrowBack className="text-4xl" />
            <span className="text-2xl">Trở về</span>
          </div>
          <h1 className="text-6xl font-extrabold text-white mb-12 drop-shadow-lg animate-pulse">
            Vòng quay may mắn 🎉
          </h1>
          {renderWheel()}
        </div>
      </Modal>
      <style>{`
        .lucky-wheel-modal .ant-modal-content {
          border-radius: 24px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.25);
        }
        .lucky-wheel-modal .ant-modal-close {
          top: 24px;
          right: 24px;
        }
      `}</style>
    </div>
  );
};

export default Random;
