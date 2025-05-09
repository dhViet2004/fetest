import React from 'react';
import ProductCard from '../../components/ProductCard';

const CategoryProducts = ({ title, products, onBack }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={onBack}
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{title}</h1>
          <span className="text-gray-600">{products.length} sản phẩm</span>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            Không tìm thấy sản phẩm nào
          </h2>
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;
