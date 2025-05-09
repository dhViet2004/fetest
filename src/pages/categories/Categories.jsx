import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryProducts from '../category/CategoryProducts';

const Categories = () => {
  const [favoriteImage, setFavoriteImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    let imageUrl = "https://res.cloudinary.com/dzljgccna/image/upload/v1746520409/fashsionStore/fashsion%20store/mbgwxhld6p5ft1psmqeq.webp";

    if (user && user.favorite && user.favorite.length > 0) {
      // Tìm sản phẩm đầu tiên có đầy đủ thông tin (không phải chỉ là ID)
      const firstFullProduct = user.favorite.find(item => typeof item === 'object' && item.imageUrl);
      if (firstFullProduct) {
        imageUrl = firstFullProduct.imageUrl;
      }
      // Đếm số sản phẩm yêu thích có đầy đủ thông tin
      const fullProducts = user.favorite.filter(item => typeof item === 'object' && item.imageUrl);
      setFavoriteCount(fullProducts.length);
    } else {
      setFavoriteCount(0);
    }

    setFavoriteImage(imageUrl);

    // Fetch dữ liệu sản phẩm từ API
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/products');
        const products = await response.json();

        // Lấy danh sách category không trùng lặp
        const uniqueCategories = [...new Set(products.map(product => product.category))];
        
        // Tạo mảng categories với ảnh đầu tiên của mỗi category
        const categoriesWithImages = uniqueCategories.map(category => {
          const firstProduct = products.find(product => product.category === category);
          return {
            id: category.toLowerCase(),
            name: category,
            image: firstProduct?.imageUrl || imageUrl,
            description: `Khám phá các sản phẩm ${category.toLowerCase()} thời trang`
          };
        });

        // Thêm mục Favorite vào đầu danh sách
        const allCategories = [
          {
            id: "favorites",
            name: "Yêu thích",
            image: imageUrl,
            description: "Xem các sản phẩm bạn đã yêu thích"
          },
          ...categoriesWithImages
        ];

        setCategories(allCategories);
      } catch (error) {
        console.error('Lỗi khi fetch dữ liệu sản phẩm:', error);
        // Nếu có lỗi, chỉ hiển thị mục Favorite
        setCategories([
          {
            id: "favorites",
            name: "Yêu thích",
            image: imageUrl,
            description: "Xem các sản phẩm bạn đã yêu thích"
          }
        ]);
      }
    };

    fetchProducts();
  }, [favoriteImage]);

  const handleCategoryClick = async (category) => {
    if (category.id === "favorites") {
      navigate('/favorites');
      return;
    }

    try {
      // Fetch tất cả sản phẩm
      const response = await fetch('http://localhost:3001/products');
      const allProducts = await response.json();
      
      // Lọc sản phẩm theo category
      const filteredProducts = allProducts.filter(
        product => product.category.toLowerCase() === category.name.toLowerCase()
      );

      setCategoryProducts(filteredProducts);
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error loading category products:', error);
    }
  };

  // Nếu đã chọn category, hiển thị CategoryProducts
  if (selectedCategory) {
    return (
      <CategoryProducts 
        title={selectedCategory.name}
        products={categoryProducts}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  // Hiển thị danh sách categories
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Khám phá</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className="group relative cursor-pointer"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:transform group-hover:scale-105">
              {category.id === "favorites" && favoriteCount > 0 && (
                <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full px-3 py-1 text-sm font-semibold z-10">
                  {favoriteCount}
                </div>
              )}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://res.cloudinary.com/dzljgccna/image/upload/v1746520409/fashsionStore/fashsion%20store/mbgwxhld6p5ft1psmqeq.webp";
                  }}
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;