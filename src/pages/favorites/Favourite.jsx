import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard'; // Đường dẫn tới ProductCard

const Favourite = () => {
  const [favourites, setFavourites] = useState([]); // Danh sách yêu thích
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.favorite) {
      // Lọc ra các sản phẩm có đầy đủ thông tin (không phải chỉ là ID)
      const fullProducts = user.favorite.filter(item => typeof item === 'object' && item.imageUrl);
      setFavourites(fullProducts);
    }
  }, []);

  // Phân loại sản phẩm theo danh mục
  const categorizedFavourites = favourites.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mb-4"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Quay lại
        </button>
        <h1 className="text-3xl font-bold">Sản phẩm yêu thích</h1>
      </div>

      {favourites.length > 0 ? (
        Object.entries(categorizedFavourites).map(([category, products]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item} // Truyền sản phẩm vào ProductCard
                  onAddToCart={() => console.log(`Thêm vào giỏ hàng: ${item.name}`)} // Hàm xử lý thêm vào giỏ hàng
                  onPayNow={() => console.log(`Thanh toán ngay: ${item.name}`)} // Hàm xử lý thanh toán
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600">Bạn chưa có sản phẩm yêu thích nào.</p>
      )}
    </div>
  );
};

export default Favourite;