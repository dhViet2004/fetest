import { useState, useEffect, useCallback } from 'react';

const useProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [lastModified, setLastModified] = useState(null);

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    try {
      const headers = {};
      // Thêm header If-Modified-Since nếu không phải force refresh
      if (!forceRefresh && lastModified) {
        headers['If-Modified-Since'] = lastModified;
      }

      const response = await fetch('https://betest-s7wl.onrender.com/products', {
        headers
      });

      // Nếu không có thay đổi (304 Not Modified), không cần cập nhật state
      if (response.status === 304) {
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      const currentLastModified = response.headers.get('Last-Modified');

      // Chỉ cập nhật nếu dữ liệu thực sự thay đổi
      if (JSON.stringify(data) !== JSON.stringify(products)) {
        setProducts(data);
        setLastUpdate(new Date());
        if (currentLastModified) {
          setLastModified(currentLastModified);
        }
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [products, lastModified]);

  // Initial fetch
  useEffect(() => {
    fetchProducts(true); // Force refresh on initial load
  }, [fetchProducts]);

  // Poll for updates every 30 seconds, but only if the page is visible
  useEffect(() => {
    let interval;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Khi tab trở lại visible, kiểm tra cập nhật
        fetchProducts();
        // Bắt đầu interval mới
        interval = setInterval(() => fetchProducts(), 30000);
      } else {
        // Khi tab không visible, dừng interval
        clearInterval(interval);
      }
    };

    // Chỉ bắt đầu polling khi tab đang visible
    if (document.visibilityState === 'visible') {
      interval = setInterval(() => fetchProducts(), 30000);
    }

    // Lắng nghe sự kiện visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchProducts]);

  const refreshProducts = useCallback(() => {
    setLoading(true);
    fetchProducts(true); // Force refresh
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    lastUpdate,
    refreshProducts
  };
};

export default useProduct; 