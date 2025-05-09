import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const ProductFilter = ({ onFilterChange, onResetFilters }) => {
  const [tempPriceRange, setTempPriceRange] = useState([0, 1000000]);
  const [tempCategories, setTempCategories] = useState([]);
  const [tempRatings, setTempRatings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDragging, setIsDragging] = useState(null);
  const sliderRef = useRef(null);

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/products');
        const products = response.data;
        // Lấy danh sách categories không trùng lặp
        const uniqueCategories = [...new Set(products.map(product => product.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const calculateValueFromPosition = (position) => {
    const slider = sliderRef.current;
    const rect = slider.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (position - rect.left) / rect.width));
    return Math.round(percentage * 1000) * 1000;
  };

  const handleMouseDown = (e, index) => {
    setIsDragging(index);
    const value = calculateValueFromPosition(e.clientX);
    const newRange = [...tempPriceRange];
    
    if (index === 0) {
      newRange[0] = Math.min(value, newRange[1]);
    } else {
      newRange[1] = Math.max(value, newRange[0]);
    }
    
    setTempPriceRange(newRange);
    onFilterChange({
      priceRange: newRange,
      categories: tempCategories,
      ratings: tempRatings,
      ratingRanges: tempRatings.map(rating => ({
        min: rating,
        max: rating + 1
      }))
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging === null) return;
    const value = calculateValueFromPosition(e.clientX);
    const newRange = [...tempPriceRange];
    
    if (isDragging === 0) {
      newRange[0] = Math.min(value, newRange[1]);
    } else {
      newRange[1] = Math.max(value, newRange[0]);
    }
    
    setTempPriceRange(newRange);
    onFilterChange({
      priceRange: newRange,
      categories: tempCategories,
      ratings: tempRatings,
      ratingRanges: tempRatings.map(rating => ({
        min: rating,
        max: rating + 1
      }))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handlePriceChange = (e, index) => {
    const value = e.target.value;
    // Xóa số 0 ở đầu nếu có
    const cleanValue = value.replace(/^0+/, '') || '0';
    
    // Cập nhật giá trị input
    e.target.value = cleanValue;
    
    const numericValue = Number(cleanValue) * 1000;
    const newRange = [...tempPriceRange];
    newRange[index] = numericValue;
    setTempPriceRange(newRange);
  };

  const handlePriceKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      const newRange = [...tempPriceRange];
      onFilterChange({
        priceRange: newRange,
        categories: tempCategories,
        ratings: tempRatings,
        ratingRanges: tempRatings.map(rating => ({
          min: rating,
          max: rating + 1
        }))
      });
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    const updatedCategories = checked
      ? [...tempCategories, value]
      : tempCategories.filter((category) => category !== value);
    setTempCategories(updatedCategories);
    onFilterChange({
      priceRange: tempPriceRange,
      categories: updatedCategories,
      ratings: tempRatings,
      ratingRanges: tempRatings.map(rating => ({
        min: rating,
        max: rating + 1
      }))
    });
  };

  const handleRatingChange = (e) => {
    const value = Number(e.target.value);
    const checked = e.target.checked;
    const updatedRatings = checked
      ? [...tempRatings, value]
      : tempRatings.filter((rating) => rating !== value);
    setTempRatings(updatedRatings);
    onFilterChange({
      priceRange: tempPriceRange,
      categories: tempCategories,
      ratings: updatedRatings,
      ratingRanges: updatedRatings.map(rating => ({
        min: rating,
        max: rating + 1
      }))
    });
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Bộ lọc sản phẩm</h3>

      {/* Lọc theo giá */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Khoảng giá (nghìn VND)</h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="number"
              className="w-20 p-2 border border-gray-300 rounded"
              value={tempPriceRange[0] / 1000} // Hiển thị giá trị theo đơn vị nghìn
              onChange={(e) => handlePriceChange(e, 0)}
              onKeyDown={(e) => handlePriceKeyDown(e, 0)}
              min="0"
            />
            <span>-</span>
            <input
              type="number"
              className="w-20 p-2 border border-gray-300 rounded"
              value={tempPriceRange[1] / 1000} // Hiển thị giá trị theo đơn vị nghìn
              onChange={(e) => handlePriceChange(e, 1)}
              onKeyDown={(e) => handlePriceKeyDown(e, 1)}
              min="0"
            />
          </div>
          <div 
            ref={sliderRef}
            className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
            onMouseDown={(e) => {
              const value = calculateValueFromPosition(e.clientX);
              if (Math.abs(value - tempPriceRange[0]) < Math.abs(value - tempPriceRange[1])) {
                handleMouseDown(e, 0);
              } else {
                handleMouseDown(e, 1);
              }
            }}
          >
            <div 
              className="absolute h-full bg-blue-500 rounded-full"
              style={{
                left: `${(tempPriceRange[0] / 1000) / 10}%`,
                right: `${100 - (tempPriceRange[1] / 1000) / 10}%`
              }}
            />
            <div 
              className="absolute h-4 w-4 bg-white border-2 border-blue-500 rounded-full top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
              style={{
                left: `${(tempPriceRange[0] / 1000) / 10}%`
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 0);
              }}
            />
            <div 
              className="absolute h-4 w-4 bg-white border-2 border-blue-500 rounded-full top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
              style={{
                left: `${(tempPriceRange[1] / 1000) / 10}%`
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Lọc theo danh mục */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Danh mục</h4>
        <div className="flex flex-col space-y-2">
          {categories.map((category) => (
            <label key={category}>
              <input
                type="checkbox"
                value={category}
                onChange={handleCategoryChange}
                checked={tempCategories.includes(category)}
                className="mr-2"
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      {/* Lọc theo đánh giá */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Đánh giá</h4>
        <div className="flex flex-col space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating}>
              <input
                type="checkbox"
                value={rating}
                onChange={handleRatingChange}
                checked={tempRatings.includes(rating)}
                className="mr-2"
              />
              {rating} sao
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;