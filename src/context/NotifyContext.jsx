// src/context/NotifyContext.jsx
import { createContext, useContext, useState, useRef, useEffect } from 'react';

// Tạo context
const NotifyContext = createContext({
  showNotification: () => {},
});

// Provider component
export const NotifyProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const timers = useRef({});

  const showNotification = (text, type) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { id, text, type, visible: true };

    setNotifications(prev => [newNotification, ...prev]); // Thêm mới vào đầu mảng

    // Tự động ẩn sau 3 giây
    timers.current[id] = setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  };

  // Cleanup timers khi unmount
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <NotifyContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Notification container - xếp từ trên xuống */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-md shadow-lg text-white w-64
            transform transition-all duration-300 ease-in-out
            ${notification.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
            ${notification.type === 'success' ? 'bg-green-500' : 
              notification.type === 'warning' ? 'bg-yellow-500' : 
              'bg-red-500'}`}
          >
            <div className="flex items-center">
              {notification.type === 'success' && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {notification.type === 'warning' && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {notification.type === 'error' && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span>{notification.text}</span>
            </div>
          </div>
        ))}
      </div>
    </NotifyContext.Provider>
  );
};

// Custom hook
export const useNotify = () => {
  const context = useContext(NotifyContext);
  if (!context) {
    throw new Error('useNotify must be used within a NotifyProvider');
  }
  return context;
};