import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoize cart count
  const cartCount = useMemo(() => cartItems.length, [cartItems]);

  // Memoize cart total
  const cartTotal = useMemo(() => 
    cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
    [cartItems]
  );

  const fetchCartItems = useCallback(async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/cart?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch cart items');
      const data = await response.json();
      setCartItems(data);
      localStorage.setItem('cartCount', data.length);
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      fetchCartItems(user.id);
    } else {
      setLoading(false);
    }
  }, [fetchCartItems]);

  const updateCartCount = useCallback((newCount) => {
    localStorage.setItem('cartCount', newCount);
    window.dispatchEvent(new Event('storage'));
  }, []);

  const addToCart = useCallback(async (item) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        return false;
      }

      const existingItem = cartItems.find(
        cartItem => cartItem.productId === item.productId && cartItem.size === item.size
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + item.quantity;
        if (newQuantity > item.stock) {
          toast.error('Số lượng vượt quá tồn kho');
          return false;
        }

        const response = await fetch(`http://localhost:3001/cart/${existingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQuantity }),
        });

        if (response.ok) {
          setCartItems(prevItems => {
            const newItems = prevItems.map(cartItem =>
              cartItem.id === existingItem.id
                ? { ...cartItem, quantity: newQuantity }
                : cartItem
            );
            updateCartCount(newItems.length);
            return newItems;
          });
          toast.success('Cập nhật số lượng thành công!');
        }
      } else {
        const response = await fetch('http://localhost:3001/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item, userId: user.id }),
        });

        if (response.ok) {
          const newItem = await response.json();
          setCartItems(prevItems => {
            const newItems = [...prevItems, newItem];
            updateCartCount(newItems.length);
            return newItems;
          });
          toast.success('Thêm vào giỏ hàng thành công!');
        }
      }

      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Không thể thêm vào giỏ hàng');
      return false;
    }
  }, [cartItems, updateCartCount]);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      const response = await fetch(`http://localhost:3001/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCartItems(prevItems => {
          const newItems = prevItems.filter(item => item.id !== itemId);
          updateCartCount(newItems.length);
          return newItems;
        });
        toast.success('Xóa sản phẩm thành công');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  }, [updateCartCount]);

  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    try {
      const response = await fetch(`http://localhost:3001/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        setCartItems(prevItems => {
          const newItems = prevItems.map(cartItem =>
            cartItem.id === itemId
              ? { ...cartItem, quantity: newQuantity }
              : cartItem
          );
          return newItems;
        });
        toast.success('Cập nhật số lượng thành công!');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Không thể cập nhật số lượng');
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      const response = await fetch(`http://localhost:3001/cart/clear?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCartItems([]);
        updateCartCount(0);
        toast.success('Đã xóa tất cả sản phẩm trong giỏ hàng');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Không thể xóa giỏ hàng');
    }
  }, [updateCartCount]);

  const value = useMemo(() => ({
    cartItems,
    cartCount,
    cartTotal,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }), [cartItems, cartCount, cartTotal, loading, addToCart, removeFromCart, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 