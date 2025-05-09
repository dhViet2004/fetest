import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001';

export const useCart = () => {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      const items = Array.isArray(data) ? data : data.cart || [];
      setCartCount(items.length);
      localStorage.setItem('cartCount', items.length);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
      localStorage.setItem('cartCount', '0');
    }
  };

  useEffect(() => {
    updateCartCount();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cartCount') {
        setCartCount(parseInt(e.newValue) || 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateCountImmediately = (newCount) => {
    setCartCount(newCount);
    localStorage.setItem('cartCount', newCount);
    window.dispatchEvent(new Event('storage'));
  };

  return { cartCount, updateCartCount, updateCountImmediately };
}; 