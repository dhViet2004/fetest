import React, { useState, useEffect } from "react";
import BannerHeader from "../../components/BannerHeader";
import ProductsList from "../../components/ProductsList";
import { Modal } from 'antd';
import { useLocation } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [isAdModalVisible, setIsAdModalVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Fetch sản phẩm từ API
    const fetchProducts = async () => {
      const response = await fetch("http://localhost:3001/products");
      const data = await response.json();
      setProducts(data.slice(0, 8)); // Lấy 8 sản phẩm đầu tiên
    };
    fetchProducts();

    // Kiểm tra xem đã hiển thị quảng cáo trong phiên này chưa
    const hasShownAd = sessionStorage.getItem('hasShownAd');
    if (!hasShownAd && location.pathname === '/') {
      setIsAdModalVisible(true);
      sessionStorage.setItem('hasShownAd', 'true');
    }
  }, [location]);

  const handleCloseAd = () => {
    setIsAdModalVisible(false);
  };

  return (
    <div>
      <Modal
        open={isAdModalVisible}
        footer={null}
        closable={true}
        onCancel={handleCloseAd}
        width={500}
        centered
        className="ad-modal"
        
        mask={{
          backgroundColor: 'rgba(0, 0, 0, 0.45)'
        }}
        styles={{
          body: {
            padding: 0,
            background: 'transparent',
            boxShadow: 'none'
          }
        }}
        style={{ 
          background: 'transparent',
          boxShadow: 'none'
        }}
        wrapClassName="transparent-modal"
      >
        <div className="simple-banner relative">
          <img 
            src="https://res.cloudinary.com/dh1o42tjk/image/upload/v1746456354/vn-11134258-7ra0g-m97h7gapqx6q98_dalukg.png" 
            alt="Advertisement Banner"
            className="w-full h-auto"
          />
        </div>
      </Modal>
      <BannerHeader />
      <ProductsList data={products} itemsPerPage={8} />
    </div>
  );
};

export default Home;