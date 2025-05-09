import { FaStar, FaRegStar, FaShoppingCart, FaCreditCard, FaHeart } from 'react-icons/fa'; // Import thêm icon
import { useNavigate } from 'react-router-dom'; // Sử dụng useNavigate thay vì history.push
import { useNotify } from '../context/notifyContext';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { Button, Tooltip, message, Modal } from 'antd';
import { ShoppingCartOutlined, CreditCardOutlined } from '@ant-design/icons';
import axios from 'axios';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const ProductCard = ({ product, onPayNow }) => {
  const { addToCart } = useCart();
  const { showNotification } = useNotify();
  const navigate = useNavigate(); // Hook để điều hướng đến trang chi tiết sản phẩm
  const [isFavorite, setIsFavorite] = useState(false); // Trạng thái yêu thích
  const [selectedSize, setSelectedSize] = useState('M'); // Giá trị mặc định
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    // Kiểm tra xem sản phẩm có nằm trong danh sách yêu thích không
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.favourite) {
      const isFav = user.favourite.some((item) => item.id === product.id);
      setIsFavorite(isFav);
    }
  }, [product.id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/comments?productId=${product.id}`);
        const comments = response.data;
        
        if (comments.length > 0) {
          const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0);
          const averageRating = totalRating / comments.length;
          setRating(averageRating);
          setReviewCount(comments.length);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [product.id]);

  const handleAddToCart = async () => {
    if (!product) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      message.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: selectedSize,
      imageUrl: product.imageUrl,
      stock: product.stock,
      sizes: {
        size: selectedSize,
        stock: product.stock - 1,
      }
    };

    const success = await addToCart(cartItem);
    if (success) {
      showNotification(
        <div className="flex items-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-8 h-8 rounded mr-2 object-cover"
          />
          <div>
            <p className="font-medium">Đã thêm vào giỏ hàng</p>
            <p className="text-sm">
              {product.name} (Size: {selectedSize})
            </p>
          </div>
        </div>,
        'success'
      );
      setIsModalVisible(false);
    }
  };

  const showSizeModal = (e) => {
    e.stopPropagation();
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    handleAddToCart();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleToggleFavorite = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      message.error('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    const updatedFavorites = user.favourite || [];
    const isFav = updatedFavorites.some((item) => item.id === product.id);

    if (isFav) {
      // Nếu sản phẩm đã có trong danh sách yêu thích, xóa nó
      const newFavorites = updatedFavorites.filter((item) => item.id !== product.id);
      user.favourite = newFavorites;
      setIsFavorite(false);
      showNotification(
        <div className="flex items-center">
          <FaHeart className="text-gray-400 mr-2" />
          <p className="font-medium">{product.name} đã được xóa khỏi danh sách yêu thích!</p>
        </div>,
        'info'
      );
    } else {
      // Nếu sản phẩm chưa có trong danh sách yêu thích, thêm nó
      updatedFavorites.push(product);
      user.favourite = updatedFavorites;
      setIsFavorite(true);
      showNotification(
        <div className="flex items-center">
          <FaHeart className="text-pink-500 mr-2" />
          <p className="font-medium">{product.name} đã được thêm vào danh sách yêu thích!</p>
        </div>,
        'success'
      );
    }

    // Cập nhật localStorage
    localStorage.setItem('user', JSON.stringify(user));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  const handleProductClick = () => {
    navigate(`/products/${product.id}`); // Điều hướng tới trang chi tiết sản phẩm
  };

  const handlePayNow = async () => {
    if (!product) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      message.error('Vui lòng đăng nhập để mua hàng');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    const newCartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: selectedSize,
      imageUrl: product.imageUrl,
      stock: product.stock,
      sizes: {
        size: selectedSize,
        stock: product.stock - 1,
      }
    };

    try {
      // Thêm vào giỏ hàng
      const success = await addToCart(newCartItem);
      if (success) {
        // Tạo đơn hàng ngay lập tức
        const orderData = {
          userId: user.id,
          items: [{
            ...newCartItem,
            id: product.id
          }],
          total: product.price,
          createdAt: new Date().toISOString()
        };

        // Gửi đơn hàng lên server
        const response = await fetch('http://localhost:3001/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Đặt hàng thất bại');

        // Xóa sản phẩm khỏi giỏ hàng sau khi tạo đơn hàng thành công
        const cartResponse = await fetch(`http://localhost:3001/cart?userId=${user.id}`);
        const cartData = await cartResponse.json();
        const cartItems = Array.isArray(cartData) ? cartData : cartData.cart || [];
        const cartItemToDelete = cartItems.find(item => item.productId === product.id && item.size === selectedSize);
        
        if (cartItemToDelete) {
          await fetch(`http://localhost:3001/cart/${cartItemToDelete.id}?userId=${user.id}`, {
            method: 'DELETE',
          });
        }

        // Chuyển đến trang thanh toán với định dạng dữ liệu giống Cart.jsx
        navigate('/checkout', {
          state: {
            order: {
              userId: user.id,
              items: [{
                ...newCartItem,
                id: product.id
              }],
              total: product.price,
              createdAt: new Date().toISOString()
            },
            cartItems: [{
              ...newCartItem,
              id: product.id
            }]
          }
        });
      }
    } catch (error) {
      console.error('Error in handlePayNow:', error);
      message.error('Có lỗi xảy ra khi đặt hàng');
    }
  };

  return (
    <>
      <div
        className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:translate-y-2 cursor-pointer"
        onClick={handleProductClick}
      >
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 sm:h-48 md:h-56 lg:h-64 object-cover"
          />
          {product.stock < 10 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Low Stock
            </span>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex flex-col space-y-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
            <p className="text-sm sm:text-base text-blue-600 font-bold">{formatCurrency(product.price)}</p>
            <span
              className={`absolute right-2 top-2 text-xl sm:text-2xl cursor-pointer ${
                isFavorite ? 'text-pink-500' : 'text-gray-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
            >
              <FaHeart />
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="flex items-center">
                <div className="flex mr-2">{renderStars(rating)}</div>
              </div>
              <span className="text-[10px] text-gray-500 mt-1 sm:mt-0">({reviewCount} reviews)</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[10px]">
              <span className="text-gray-600 truncate mr-2">Category: {product.category}</span>
              <span
                className={`font-medium mt-1 sm:mt-0 ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}
              >
                Stock: {product.stock}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-2 justify-center mt-2">
            <Tooltip title="Thêm vào giỏ hàng">
              <Button
                type="default"
                onClick={showSizeModal}
                className="flex items-center justify-center w-full sm:w-1/2 h-7 sm:h-7 bg-white text-blue-600 border border-blue-600 rounded-lg transition-all duration-300 hover:bg-blue-50 hover:scale-105 mb-2 sm:mb-0"
              >
                <ShoppingCartOutlined className="text-[10px]" />
                <span className="text-[10px] font-medium ml-1">Giỏ hàng</span>
              </Button>
            </Tooltip>
            <Tooltip title="Thanh toán nhanh">
              <Button
                type="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayNow();
                }}
                className="flex items-center justify-center w-full sm:w-1/2 h-7 sm:h-7 bg-gradient-to-r from-blue-600 via-indigo-700 to-indigo-800 hover:from-blue-700 hover:via-indigo-800 hover:to-indigo-900 text-white border-none rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <CreditCardOutlined className="text-[10px]" />
                <span className="text-[10px] font-medium ml-1">Mua ngay</span>
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <Modal
        title="Chọn size"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk}>
            Thêm vào giỏ
          </Button>,
        ]}
      >
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Size:</span>
            <select 
              className="border border-gray-300 rounded-md p-2 hover:cursor-pointer"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {product.sizes.map((sizeOption, index) => (
                <option key={index} value={sizeOption.size}>
                  {sizeOption.size}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Số lượng còn lại: {product.sizes.find(s => s.size === selectedSize)?.stock || 0}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductCard;