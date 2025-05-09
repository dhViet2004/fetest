import React, { useState, useEffect } from "react";
import { FaShoppingBag } from "react-icons/fa";
import ProductCard from "./ProductCard";
import axios from "axios";

const ProductsList = ({ data, itemsPerPage = 20 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [productsWithRating, setProductsWithRating] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get('http://localhost:3001/comments');
        const comments = response.data;

        // Tính toán rating và số lượng reviewer cho từng sản phẩm
        const productRatings = {};
        comments.forEach(comment => {
          if (!productRatings[comment.productId]) {
            productRatings[comment.productId] = {
              totalRating: 0,
              reviewCount: 0
            };
          }
          productRatings[comment.productId].totalRating += comment.rating;
          productRatings[comment.productId].reviewCount += 1;
        });

        // Cập nhật dữ liệu sản phẩm với rating và reviewer
        const updatedProducts = data.map(product => {
          const ratingData = productRatings[product.id] || { totalRating: 0, reviewCount: 0 };
          return {
            ...product,
            rating: ratingData.reviewCount > 0 ? (ratingData.totalRating / ratingData.reviewCount).toFixed(1) : 0,
            reviews: ratingData.reviewCount
          };
        });

        setProductsWithRating(updatedProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setLoading(false);
      }
    };

    fetchComments();
  }, [data]);

  // Tính toán phân trang
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = productsWithRating.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(productsWithRating.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center mb-4 sm:mb-6 md:mb-8">
          <FaShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Products List</h2>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                rating={parseFloat(product.rating)}
                reviews={product.reviews}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No products found
            </div>
          )}
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 sm:mt-6">
            <nav>
              <ul className="flex space-x-1 sm:space-x-2">
                <li>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 text-sm sm:text-base`}
                  >
                    &lt;
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, index) => (
                  <li key={index}>
                    <button
                      onClick={() => paginate(index + 1)}
                      className={`px-3 sm:px-4 py-1 sm:py-2 ${
                        currentPage === index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      } rounded-md text-sm sm:text-base`}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 text-sm sm:text-base`}
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
  );
};

export default ProductsList;
