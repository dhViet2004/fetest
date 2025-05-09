import { useState, useEffect } from 'react';

const useProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3001/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        // Only update if the data has changed
        if (JSON.stringify(data) !== JSON.stringify(products)) {
          setProducts(data);
          setLastUpdate(new Date());
        }
      } catch (err) {
        console.error('Error polling for updates:', err);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [products]);

  const refreshProducts = () => {
    setLoading(true);
    fetchProducts();
  };

  return {
    products,
    loading,
    error,
    lastUpdate,
    refreshProducts
  };
};

export default useProduct; 