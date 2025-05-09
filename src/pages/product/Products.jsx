import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductsList from "../../components/ProductsList";
import ProductFilter from "../../components/ProductFilter";

const Products = () => {
  const [products, setProducts] = useState([]); // Danh sách sản phẩm gốc
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm đã lọc
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [cart, setCart] = useState([]); // Danh sách sản phẩm trong giỏ hàng
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 20; // Số sản phẩm trên mỗi trang
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch sản phẩm từ API
    const fetchProducts = async () => {
      const response = await fetch("http://localhost:3001/products");
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data); // Khởi tạo danh sách sản phẩm đã lọc
    };

    // Fetch đơn hàng từ API
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        const response = await fetch(`http://localhost:3001/orders?userId=${user.id}`);
        const data = await response.json();
        setOrders(data);
      }
    };

    fetchProducts();
    fetchOrders();
  }, []);

  useEffect(() => {
    // Lấy query string từ URL
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("q") || "";
    const categoryParam = queryParams.get("category") || "";
    const minPrice = parseInt(queryParams.get("minPrice") || "0", 10);
    const maxPrice = parseInt(queryParams.get("maxPrice") || "1000000", 10);
    const ratingsParam = queryParams.get("ratings") || "";

    // Lọc sản phẩm dựa trên query string
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryParam) {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase() === categoryParam.toLowerCase()
      );
    }

    filtered = filtered.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );

    if (ratingsParam) {
      const ratingsArray = ratingsParam.split(",").map(Number);
      filtered = filtered.filter((product) =>
        ratingsArray.includes(Math.floor(product.rating))
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset về trang đầu tiên khi lọc
  }, [location.search, products]);

  const handleFilterChange = (filters) => {
    const { priceRange, categories, ratings } = filters;

    // Cập nhật URL với các tiêu chí lọc
    const queryParams = new URLSearchParams(location.search);

    if (priceRange) {
      queryParams.set("minPrice", priceRange[0]);
      queryParams.set("maxPrice", priceRange[1]);
    }

    if (categories.length > 0) {
      queryParams.set("category", categories.join(","));
    } else {
      queryParams.delete("category");
    }

    if (ratings.length > 0) {
      queryParams.set("ratings", ratings.join(","));
    } else {
      queryParams.delete("ratings");
    }

    navigate(`?${queryParams.toString()}`);
  };

  const handleResetFilters = () => {
    navigate("?"); // Xóa toàn bộ query string
  };

  // Kiểm tra xem người dùng đã mua sản phẩm hay chưa
  const hasPurchasedProduct = (productId) => {
    return orders.some((order) =>
      order.items.some((item) => item.productId === productId)
    );
  };

  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    alert(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  // Tính toán phân trang
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="mx-auto px-4 py-8">
      <div className="flex">
        {/* Thanh filter */}
        <div className="w-1/5 pr-4">
          <ProductFilter
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Danh sách sản phẩm */}
        <div className="flex-1">
          <ProductsList
            data={currentProducts}
            itemsPerPage={itemsPerPage}
            hasPurchasedProduct={hasPurchasedProduct} // Truyền hàm kiểm tra quyền
            onAddToCart={handleAddToCart} // Truyền hàm thêm vào giỏ hàng
          />

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav>
                <ul className="flex space-x-2">
                  <li>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 ${currentPage === 1 ? "" : "cursor-pointer"}
                        select-none`}
                    >
                      &lt;
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li key={index}>
                      <button
                        onClick={() => paginate(index + 1)}
                        className={`px-4 py-2 ${
                          currentPage === index + 1
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        } rounded-md cursor-pointer select-none`}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 bg-blue-500 text-white rounded-md  disabled:opacity-50 ${currentPage < totalPages ? "cursor-pointer" : ""} select-none`}
                    >
                      &gt;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;