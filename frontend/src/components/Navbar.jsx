import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CATEGORY_LIST = [
  { name: 'Tất cả', desc: 'Toàn bộ thiết kế trong bộ sưu tập' },
  { name: 'Áo Khoác', desc: 'Trench Coat, Blazer, Bomber & Hoodie' },
  { name: 'Áo Sơ Mi', desc: 'Sơ mi Oxford, Cuban Collar & Flannel' },
  { name: 'Áo Thun', desc: 'Áo thun Boxy 280gsm & Polo dệt kim' },
  { name: 'Đầm Nữ', desc: 'Đầm lụa Satin, Chiffon & Dạ hội' },
  { name: 'Quần', desc: 'Quần âu xếp ly, Jeans, Cargo & Chân váy' }
];

export default function Navbar({ user, setUser, cartCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/products`)
      .then((res) => setAllProducts(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const instantResults = navSearch.trim()
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(navSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(navSearch.toLowerCase())
      )
    : [];

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch {
      // Bỏ qua
    }
    localStorage.removeItem('duan_user');
    setUser(null);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSearchDropdown(false);
    navigate(`/?q=${encodeURIComponent(navSearch.trim())}`);
  };

  const handleSelectCategory = (catName) => {
    if (catName === 'Tất cả') {
      navigate('/');
    } else {
      navigate(`/?cat=${encodeURIComponent(catName)}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar tối giản */}
      <div className="bg-zinc-950 text-zinc-300 text-[11px] font-medium tracking-widest uppercase py-2 px-4 text-center">
        Ưu đãi mở bán: Nhập mã <span className="text-white font-bold underline">DUAN2026</span> giảm 15% • Mã{' '}
        <span className="text-white font-bold underline">VIP50</span> giảm 50% cho đơn từ 1.000.000₫
      </div>

      {/* Main Header: Thiết kế giãn rộng max-w-[1440px] thoáng đãng */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-zinc-200 transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-6 lg:gap-10">
          {/* 1. Logo Thương Hiệu */}
          <Link to="/" onClick={() => setNavSearch('')} className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-black text-lg">
              D
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-zinc-950 leading-none">
                DUAN<span className="text-indigo-600">.STUDIO</span>
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 font-semibold mt-1">
                Fashion House
              </span>
            </div>
          </Link>

          {/* 2. Menu Danh Mục Sản Phẩm (Di chuột vào tự động xổ xuống) */}
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            <div className="relative group py-6">
              <button
                type="button"
                className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-zinc-900 hover:text-indigo-600 transition"
              >
                <span>Danh Mục Sản Phẩm</span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Bảng Dropdown Xổ Xuống Khi Di Chuột Vào (Hover) */}
              <div className="absolute left-0 top-[72px] w-80 bg-white rounded-2xl border border-zinc-200 shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50">
                <div className="px-3 py-2 border-b border-zinc-100 flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                    Chọn danh mục
                  </span>
                  <span className="text-[11px] font-bold text-indigo-600">
                    {allProducts.length} mẫu
                  </span>
                </div>
                <div className="mt-1 space-y-1">
                  {CATEGORY_LIST.map((cat) => {
                    const count =
                      cat.name === 'Tất cả'
                        ? allProducts.length
                        : allProducts.filter((p) => p.category === cat.name).length;

                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => handleSelectCategory(cat.name)}
                        className="w-full p-2.5 rounded-xl hover:bg-zinc-100 flex items-center justify-between text-left transition group/item"
                      >
                        <div>
                          <p className="text-xs font-extrabold text-zinc-900 group-hover/item:text-indigo-600">
                            {cat.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{cat.desc}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 group-hover/item:bg-zinc-950 group-hover/item:text-white text-[11px] font-bold text-zinc-700 transition">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-full border text-xs font-extrabold uppercase tracking-wider transition ${
                  location.pathname === '/admin'
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                Quản Trị Kho (Admin)
              </Link>
            )}
          </div>

          {/* 3. Thanh Tìm Kiếm Dài Rộng (Kéo giãn tối đa ở trung tâm) */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={navSearch}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setNavSearch(e.target.value);
                  setShowSearchDropdown(true);
                  navigate(`/?q=${encodeURIComponent(e.target.value)}`, { replace: true });
                }}
                placeholder="Tìm kiếm trang phục: áo sơ mi oxford, áo khoác blazer, đầm lụa, quần âu..."
                className="w-full pl-5 pr-20 py-3 text-xs sm:text-sm font-medium bg-zinc-100/90 hover:bg-zinc-100 focus:bg-white border border-zinc-300 rounded-full focus:outline-none focus:border-zinc-950 transition"
              />
              {navSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setNavSearch('');
                    setShowSearchDropdown(false);
                    navigate('/');
                  }}
                  className="absolute right-11 top-3 text-xs font-bold text-zinc-400 hover:text-zinc-900 px-1"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-4 top-2.5 text-zinc-600 hover:text-zinc-950 p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </button>
            </form>

            {/* Kết quả tìm kiếm xổ xuống ngay lập tức */}
            {showSearchDropdown && navSearch.trim() !== '' && (
              <div className="absolute left-0 right-0 top-14 bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden z-50 animate-fadeIn">
                <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-500">
                  <span>Kết quả tìm kiếm cho "{navSearch}"</span>
                  <span className="text-indigo-600">{instantResults.length} sản phẩm</span>
                </div>

                {instantResults.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    Không tìm thấy sản phẩm nào khớp với từ khóa "<b>{navSearch}</b>"
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100">
                    {instantResults.slice(0, 6).map((item) => {
                      const price = item.variants?.[0]?.price || 0;
                      return (
                        <div
                          key={item._id}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate(`/product/${item._id}`, { state: { product: item } });
                          }}
                          className="p-3.5 hover:bg-zinc-50 flex items-center justify-between gap-4 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={item.images?.[0]}
                              alt={item.name}
                              className="w-12 h-16 object-cover rounded-lg border shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                {item.category}
                              </span>
                              <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 truncate">
                                {item.name}
                              </h4>
                              <p className="text-xs font-black text-indigo-600 mt-0.5">
                                {price.toLocaleString('vi-VN')} ₫
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-zinc-600 hover:text-zinc-950 shrink-0">
                            Xem chi tiết →
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Giỏ Hàng & Tài Khoản */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/cart"
              className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-indigo-600 text-white transition shadow-sm"
            >
              <span className="text-xs font-bold">Giỏ hàng</span>
              <span className="w-5 h-5 rounded-full bg-white text-zinc-950 text-[11px] font-extrabold flex items-center justify-center">
                {cartCount}
              </span>
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-zinc-200">
                <Link to="/profile" title="Bấm để sửa hồ sơ & đổi ảnh đại diện" className="shrink-0">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=09090b&color=fff`
                    }
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-zinc-300 hover:border-indigo-600 transition"
                  />
                </Link>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/profile"
                      className="text-xs font-extrabold text-zinc-900 hover:text-indigo-600 leading-none transition"
                    >
                      {user.name}
                    </Link>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        user.role === 'admin'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Link
                      to="/profile"
                      className="text-[11px] text-indigo-600 hover:underline font-bold"
                    >
                      Hồ sơ cá nhân
                    </Link>
                    <span className="text-zinc-300">•</span>
                    <button
                      onClick={handleLogout}
                      className="text-[11px] text-zinc-500 hover:text-red-600 font-semibold transition"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-extrabold text-zinc-700 hover:text-zinc-950 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-extrabold border-2 border-zinc-950 text-zinc-950 rounded-full hover:bg-zinc-950 hover:text-white transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-zinc-200 text-zinc-700"
            >
              ☰
            </button>
          </div>
        </div>
      </header>
    </>
  );
}