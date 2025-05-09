import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/home/Home';
import Products from './pages/product/Products';
import Categories from './pages/categories/Categories';
import Admin from './pages/admin/Admin';
import DetailProduct from './components/DetailProduct';
import Profile from './components/Profile';
import Cart from './components/Cart';
import LoginModal from './components/LoginModal';
import Checkout from './components/Checkout';
import ZaloChat from './components/ZaloChat';
import AIChatBox from './components/AIChatBox';
import Favourite from './pages/favorites/Favourite';
import Random from './components/Random';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId" element={<DetailProduct />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<LoginModal onClose={() => window.history.back()} onLogin={() => window.location.reload()} />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/favorites" element={<Favourite />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
        <AIChatBox />
        <ZaloChat />
        <Random />

      </div>
    </Router>
  );
}

export default App;
