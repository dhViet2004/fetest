import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { Dropdown } from 'antd';
import LoginModal from './LoginModal';
import { useCart } from '../hooks/useCart';

const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const { cartCount, updateCartCount } = useCart();

  // Cập nhật số lượng giỏ hàng khi component mount và khi có thay đổi trong localStorage
  useEffect(() => {
    updateCartCount();
    
    // Lắng nghe sự thay đổi trong localStorage
    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateCartCount]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Điều hướng đến trang Products và truyền query qua URL
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSearchClick = () => {
    // Điều hướng đến trang Products khi nhấn vào icon search
    navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">FashionStore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8 flex-1 justify-center">
            <Link to="/" className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors">
              Products
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors">
              Categories
            </Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors">
                Admin Panel
              </Link>
            )}

            {/* Search Bar */}
            <div className="relative ml-4 lg:ml-8">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-40 sm:w-48 md:w-64 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <FaSearch
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 hover:cursor-pointer"
                onClick={handleSearchClick}
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <Link
                    to="/cart"
                    className="text-gray-600 hover:text-blue-500 flex items-center relative"
                    title="Cart"
                  >
                    <FaShoppingCart className="text-lg sm:text-xl" />
                    <span className="hidden sm:inline ml-1">Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'profile',
                        label: (
                          <Link to="/profile" className="flex items-center">
                            <FaUser className="mr-2" />
                            Profile
                          </Link>
                        ),
                      },
                      {
                        key: 'logout',
                        label: (
                          <button onClick={handleLogout} className="flex items-center w-full">
                            <FaSignOutAlt className="mr-2" />
                            Logout
                          </button>
                        ),
                      },
                    ],
                  }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <div className="flex items-center cursor-pointer hover:text-blue-500">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt="Profile"
                        className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full mr-1 sm:mr-2 object-cover"
                      />
                    ) : (
                      <FaUser className="text-lg sm:text-xl" />
                    )}
                    <span className="hidden sm:inline ml-1">{user.name || 'User'}</span>
                  </div>
                </Dropdown>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-gray-600 hover:text-blue-500 px-2 py-1 rounded transition-colors text-sm sm:text-base"
              >
                Login
              </button>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-600 hover:text-blue-500 p-2"
            >
              {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Categories
              </Link>
              {user && user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-500 hover:bg-gray-50"
                  onClick={toggleMenu}
                >
                  Admin Panel
                </Link>
              )}
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <FaSearch
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 hover:cursor-pointer"
                    onClick={handleSearchClick}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </nav>
  );
};

export default Navigation;
