import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VirtualTryOnModal from './components/VirtualTryOnModal';
import AIChatbot from './components/AIChatbot';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import AnywearGuide from './pages/AnywearGuide';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Hàm tạo khóa lưu trữ Giỏ hàng riêng biệt cho từng Tài khoản
const getCartStorageKey = (userObj) => {
  if (userObj && userObj.email) {
    return `duan_cart_${userObj.email.toLowerCase().trim()}`;
  }
  return 'duan_cart_guest';
};

class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error?.message || 'Lỗi hiển thị trang' };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-lg">
            <h2 className="text-xl font-extrabold text-zinc-900">Đang đồng bộ lại giao diện...</h2>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="mt-5 px-6 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-extrabold"
            >
              Tải lại trang ngay
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function RouteChangeHandler() {
  const { pathname } = useLocation();
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // Bỏ qua
    }
  }, [pathname]);
  return null;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('duan_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Đọc giỏ hàng theo đúng tài khoản hiện tại
  const [cart, setCart] = useState(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('duan_user') || 'null');
      const key = getCartStorageKey(currentUser);
      const savedCart = localStorage.getItem(key);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) return parsed;
      }
      if (currentUser && Array.isArray(currentUser.cart)) {
        return currentUser.cart;
      }
      return [];
    } catch {
      return [];
    }
  });

  // MỖI KHI ĐỔI TÀI KHOẢN (ĐĂNG NHẬP / ĐĂNG XUẤT) -> LẬP TỨC CHUYỂN SANG GIỎ HÀNG CỦA TÀI KHOẢN ĐÓ
  useEffect(() => {
    try {
      const key = getCartStorageKey(user);
      const localSaved = localStorage.getItem(key);
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCart(parsed);
          return;
        }
      }
      if (user && Array.isArray(user.cart) && user.cart.length > 0) {
        setCart(user.cart);
        localStorage.setItem(key, JSON.stringify(user.cart));
      } else {
        setCart([]);
      }
    } catch {
      setCart([]);
    }
  }, [user?.email]);

  // Lưu giỏ hàng vào đúng khóa của tài khoản hiện tại + đồng bộ lên MongoDB
  useEffect(() => {
    try {
      const key = getCartStorageKey(user);
      localStorage.setItem(key, JSON.stringify(cart));

      if (user && user.email) {
        axios
          .put(`${API_URL}/auth/cart`, {
            userId: user._id,
            email: user.email,
            cart
          })
          .catch(() => {});
      }
    } catch {
      // Bỏ qua
    }
  }, [cart, user?.email]);

  // Bắt access_token khi Google OAuth trả về trang chủ
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('access_token=')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        window.history.replaceState(null, '', window.location.pathname);
        fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.email) {
              localStorage.setItem('duan_user', JSON.stringify(data));
              setUser(data);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  const addToCart = (newItem) => {
    if (!newItem || !newItem.sku) return;
    setCart((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const exists = safePrev.find((i) => i.sku === newItem.sku);
      if (exists) {
        return safePrev.map((i) =>
          i.sku === newItem.sku
            ? { ...i, quantity: Number(i.quantity || 1) + Number(newItem.quantity || 1) }
            : i
        );
      }
      return [...safePrev, { ...newItem, quantity: Number(newItem.quantity || 1) }];
    });
  };

  const updateQuantity = (sku, quantity) => {
    if (quantity < 1) return removeFromCart(sku);
    setCart((prev) =>
      (Array.isArray(prev) ? prev : []).map((i) =>
        i.sku === sku ? { ...i, quantity: Number(quantity) } : i
      )
    );
  };

  const removeFromCart = (sku) => {
    setCart((prev) => (Array.isArray(prev) ? prev : []).filter((i) => i.sku !== sku));
  };

  const clearCart = () => {
    setCart([]);
    const key = getCartStorageKey(user);
    localStorage.removeItem(key);
  };

  const totalCartCount = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)
    : 0;

  return (
    <Router>
      <RouteChangeHandler />
      <div className="min-h-screen flex flex-col bg-[#f8f8f6]">
        <Navbar user={user} setUser={setUser} cartCount={totalCartCount} />
        <main className="flex-1">
          <PageErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
              <Route path="/anywear-guide" element={<AnywearGuide />} />
              <Route
                path="/cart"
                element={
                  <Cart
                    cart={cart}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                  />
                }
              />
              <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register setUser={setUser} />} />
              <Route
                path="/profile"
                element={<Profile user={user} setUser={setUser} cartCount={totalCartCount} />}
              />
              <Route path="/admin" element={<AdminDashboard user={user} />} />
            </Routes>
          </PageErrorBoundary>
        </main>
        <VirtualTryOnModal />
        <AIChatbot />
        <Footer />
      </div>
    </Router>
  );
}