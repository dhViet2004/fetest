import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaUserCircle, FaArrowLeft, FaHeart, FaRegHeart } from 'react-icons/fa'; // Import icon mặc định
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { useNotify } from '../context/notifyContext';
import ProductCard from './ProductCard'; // Make sure this path is correct
import useComment from "../hooks/useComment"; // Import hook useComment

const DetailProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('M');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { showNotification } = useNotify();
  const { comments, isSubmitting, fetchComments, addComment } = useComment();
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [hasPurchased, setHasPurchased] = useState(false); // Kiểm tra quyền bình luận
  const [calculatedRating, setCalculatedRating] = useState(0);
  const [calculatedReviews, setCalculatedReviews] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/products/${productId}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch product details');
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Fetch 5 products excluding the current one
        const response = await fetch(`http://localhost:3001/products?_limit=6`);
        const data = await response.json();
        setRelatedProducts(data.filter(p => p.id !== product.id));
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };
    
    if (product) {
      fetchRelatedProducts();
    }
  }, [product, productId]);

  useEffect(() => {
    if (product) {
      fetchComments(product.id); // Fetch comments for the current product
    }
  }, [product]);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setHasPurchased(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/orders?userId=${user.id}`);
        const orders = await response.json();

        // Kiểm tra xem user đã mua productId hay chưa
        const purchased = orders.some((order) =>
          order.items.some((item) => item.productId === parseInt(productId))
        );
        setHasPurchased(purchased);
      } catch (error) {
        console.error("Error checking purchase status:", error);
        setHasPurchased(false);
      }
    };

    checkPurchaseStatus();
  }, [productId]);

  useEffect(() => {
    if (comments && comments.length > 0) {
      const totalRating = comments.reduce((sum, c) => sum + (c.rating || 0), 0);
      setCalculatedRating((totalRating / comments.length).toFixed(1));
      setCalculatedReviews(comments.length);
    } else {
      setCalculatedRating(0);
      setCalculatedReviews(0);
    }
  }, [comments]);

  useEffect(() => {
    if (product) {
      setProduct(prev => ({
        ...prev,
        rating: calculatedRating,
        reviews: calculatedReviews
      }));
    }
  }, [calculatedRating, calculatedReviews]);

  useEffect(() => {
    const checkFavoriteStatus = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.favorite) {
        const isFav = user.favorite.some(item => 
          typeof item === 'object' && item.id === parseInt(productId)
        );
        setIsFavorite(isFav);
      }
    };

    if (product) {
      checkFavoriteStatus();
    }
  }, [product, productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    const selectedSize = product.sizes.find(sizeOption => sizeOption.size === size);
    if (!selectedSize || quantity > selectedSize.stock) {
      showNotification(`Số lượng vượt quá tồn kho (Còn ${selectedSize?.stock || 0} sản phẩm)`, 'warning');
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: size,
      imageUrl: product.imageUrl,
      stock: selectedSize.stock,
      sizes: {
        size: selectedSize.size,
        stock: selectedSize.stock - quantity,
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
              {product.name} (Size: {size}) × {quantity}
            </p>
          </div>
        </div>,
        'success'
      );
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    const selectedSize = product.sizes.find(sizeOption => sizeOption.size === size);
    if (!selectedSize || quantity > selectedSize.stock) {
      showNotification(`Số lượng vượt quá tồn kho (Còn ${selectedSize?.stock || 0} sản phẩm)`, 'warning');
      return;
    }

    const newCartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: size,
      imageUrl: product.imageUrl,
      stock: selectedSize.stock,
      sizes: {
        size: selectedSize.size,
        stock: selectedSize.stock - quantity,
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
          total: product.price * quantity,
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
        const cartItemToDelete = cartItems.find(item => item.productId === product.id && item.size === size);
        
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
              total: product.price * quantity,
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
      console.error('Error in handleBuyNow:', error);
      toast.error('Có lỗi xảy ra khi đặt hàng');
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      alert("Vui lòng nhập nội dung bình luận!");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Vui lòng đăng nhập để gửi bình luận!");
      return;
    }

    const commentData = {
      productId: product.id,
      user: user.username || "Anonymous",
      comment: newComment,
      rating: newRating,
      date: new Date().toISOString().split("T")[0],
    };

    const success = await addComment(commentData);
    if (success) {
      setNewComment(""); // Reset nội dung bình luận
      setNewRating(5); // Reset đánh giá sao
      alert("Gửi bình luận thành công!");
    } else {
      alert("Gửi bình luận thất bại. Vui lòng thử lại!");
    }
  };

  const toggleFavorite = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/users/${user.id}`);
      const userData = await response.json();
      
      let updatedFavorites = [...(userData.favorite || [])];
      
      if (isFavorite) {
        // Xóa sản phẩm khỏi danh sách yêu thích
        updatedFavorites = updatedFavorites.filter(item => 
          typeof item === 'object' ? item.id !== parseInt(productId) : true
        );
      } else {
        // Thêm sản phẩm vào danh sách yêu thích
        updatedFavorites.push({
          id: parseInt(productId),
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category
        });
      }

      // Cập nhật danh sách yêu thích trên server
      const updateResponse = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ favorite: updatedFavorites }),
      });

      if (updateResponse.ok) {
        // Cập nhật localStorage
        const updatedUser = { ...user, favorite: updatedFavorites };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsFavorite(!isFavorite);
        
        showNotification(
          isFavorite ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích',
          'success'
        );
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      showNotification('Có lỗi xảy ra khi cập nhật danh sách yêu thích', 'error');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-xl text-blue-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <span>{error}</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <span>Product not found</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      {/* Nút trở về */}
      <button 
        onClick={() => navigate(-1)} 
        className="ml-2 pl-4 pr-4 pt-2 pb-2 rounded hover:bg-gray-100 transition-all duration-300"
      >
        <FaArrowLeft className="text-xl text-gray-600 hover:text-gray-800" />
      </button>

      <div className="flex flex-col md:flex-row items-center bg-white p-6 pt-2 rounded-lg shadow-lg mb-8 relative">
      <button
            onClick={toggleFavorite}
            className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-all duration-300"
          >
            {isFavorite ? (
              <FaHeart className="text-pink-500 text-xl" />
            ) : (
              <FaRegHeart className="text-gray-500 text-xl" />
            )}
          </button>
        <div className="md:w-1/4 mb-6 md:mb-0 relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105"
          />
        </div>

        <div className="md:w-1/2 ml-0 md:ml-12">
          <h2 className="text-3xl font-semibold text-gray-800">{product.name}</h2>
          <span className="text-gray-600">{product.description}</span>

          <div className="flex flex-col mb-2">
            <div className="flex items-center">
              <div className="flex mr-2">{renderStars(calculatedRating)}</div>
              <span className="text-sm text-gray-600">({calculatedRating})</span>
            </div>
            <span className="text-sm text-gray-500">({calculatedReviews} reviews)</span>
          </div>

          <p className="text-2xl text-blue-600 my-4">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
          </p>

          <div className="flex items-center mb-4">
            <span className="text-gray-600">Size: </span>
            <select 
              className="ml-11 border border-gray-300 rounded-md p-2 hover:cursor-pointer"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {product.sizes.map((sizeOption, index) => (
                <option key={index} value={sizeOption.size}>
                  {sizeOption.size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center mb-4">
            <span>Số lượng: </span>
            <div className="ml-2">
              <button
                className="border p-2 border-gray-300 hover:cursor-pointer"
                onClick={() => {
                  if (quantity > 1) setQuantity(quantity - 1);
                }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.sizes.find(sizeOption => sizeOption.size === size)?.stock}
                className="w-12 p-2 border border-gray-300"
                value={quantity}
                onChange={(e) => {
                  const value = Math.min(
                    Math.max(1, Number(e.target.value)),
                    product.sizes.find(sizeOption => sizeOption.size === size)?.stock
                  );
                  setQuantity(value);
                }}
              />
              <button
                className="border p-2 border-gray-300 hover:cursor-pointer"
                onClick={() => {
                  if (quantity < product.sizes.find(sizeOption => sizeOption.size === size)?.stock)
                    setQuantity(quantity + 1);
                }}
              >
                +
              </button>
            </div>
            <span
              className={`${
                product.sizes.find(sizeOption => sizeOption.size === size)?.stock <= 10
                  ? "text-red-600"
                  : "text-gray-600"
              } ml-2 text-sm`}
            >
              ({product.sizes.find(sizeOption => sizeOption.size === size)?.stock} in stock)
            </span>
          </div>

          <div className="flex space-x-4">
            <button 
              className="w-full md:w-1/2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200 hover:cursor-pointer"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>
            <button 
              className="w-full md:w-1/2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-200 hover:cursor-pointer"
              onClick={handleBuyNow}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Phần hiển thị bình luận */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Đánh giá sản phẩm</h3>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="flex items-start mb-6">
              {/* Avatar người dùng */}
              {comment.avatar ? (
                <img
                  src={comment.avatar}
                  alt={comment.user}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
              ) : (
                <FaUserCircle className="text-4xl text-gray-400 mr-4" />
              )}

              {/* Nội dung bình luận */}
              <div>
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-gray-800">{comment.user}</span>
                  <span className="ml-2 text-sm text-gray-500">{comment.date}</span>
                </div>
                <p className="text-gray-600">{comment.comment}</p>
                <div className="flex items-center mt-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < comment.rating ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">Chưa có đánh giá nào cho sản phẩm này.</p>
        )}

        {/* Form gửi bình luận */}
        {hasPurchased ? (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Viết đánh giá của bạn</h4>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows="4"
              placeholder="Nhập bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
            <div className="flex items-center mb-4">
              <span className="text-gray-600 mr-2">Đánh giá:</span>
              <select
                className="border border-gray-300 rounded-md p-2"
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} sao
                  </option>
                ))}
              </select>
            </div>
            <button
              className={`px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleCommentSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
            </button>
          </div>
        ) : (
          <p className="text-gray-600 mt-4">
            Bạn cần mua sản phẩm này để có thể viết đánh giá.
          </p>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Các sản phẩm khác</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailProduct;