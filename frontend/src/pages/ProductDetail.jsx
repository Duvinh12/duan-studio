import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Tự động chuẩn hóa API_URL cho cả Local và Vercel
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const RAW_API_URL = isLocalhost
  ? 'http://localhost:5000/api'
  : import.meta.env.VITE_API_URL || 'https://duan-studio.onrender.com/api';

const API_URL = RAW_API_URL.endsWith('/api')
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/$/, '')}/api`;

export default function ProductDetail({ addToCart, user }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('details');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);

    if (location.state?.product && String(location.state.product._id) === String(id)) {
      const p = location.state.product;
      setProduct(p);
      setSelectedVariant(
        p.variants?.[0] || {
          color: 'Tiêu chuẩn',
          size: 'M',
          sku: `SKU-${p._id}`,
          price: 450000,
          stock: 20
        }
      );
      setLoading(false);
    }

    axios
      .get(`${API_URL}/products/${id}`)
      .then((res) => {
        if (!isMounted || !res.data) return;
        const p = res.data;
        setProduct(p);
        setSelectedVariant(
          p.variants?.[0] || {
            color: 'Tiêu chuẩn',
            size: 'M',
            sku: `SKU-${p._id}`,
            price: 450000,
            stock: 20
          }
        );
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, location.state]);

  // Khi khách chọn ảnh để ướm thử -> Gọi thẳng Drawer thử đồ nội bộ của DUAN.STUDIO
  const handleQuickTryOnFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (window.Anywear && typeof window.Anywear.open === 'function') {
        window.Anywear.open({
          productId: product._id,
          productName: product.name,
          productImage: product.anywearImage || product.images?.[0],
          lookbookImage: product.images?.[0],
          productCategory: product.anywearCategory || 'top',
          userImage: ev.target.result
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (loading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-7 h-7 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-widest text-zinc-500 mt-4">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-8 border border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-900">Không tìm thấy sản phẩm</h2>
          <Link
            to="/"
            className="inline-block mt-4 px-6 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider"
          >
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const activeVariant = selectedVariant ||
    product.variants?.[0] || {
      color: 'Tiêu chuẩn',
      size: 'M',
      sku: `SKU-${product._id}`,
      price: 450000,
      stock: 20
    };

  const availableStock = Math.max(
    0,
    Number(activeVariant.stock || 20) - Number(activeVariant.reservedStock || 0)
  );

  // Tách danh sách Màu sắc và Kích cỡ riêng biệt như các web thời trang lớn
  const uniqueColors = [...new Set((product.variants || []).map((v) => v.color))];

  // KIỂM TRA BẮT BUỘC ĐĂNG NHẬP TRƯỚC KHI THÊM GIỎ HÀNG HOẶC MUA NGAY
  const requireAuthentication = () => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('duan_token');
    const savedUser =
      user ||
      localStorage.getItem('user') ||
      localStorage.getItem('userInfo') ||
      localStorage.getItem('duan_user');

    let isValidUser = Boolean(token);
    if (!isValidUser && savedUser) {
      if (typeof savedUser === 'object') {
        isValidUser = true;
      } else if (typeof savedUser === 'string') {
        const trimmed = savedUser.trim();
        isValidUser = trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined';
      }
    }

    if (!isValidUser) {
      alert('Vui lòng đăng nhập tài khoản trước khi thêm vào giỏ hàng hoặc mua sản phẩm!');
      navigate('/login', { state: { from: location.pathname } });
      return false;
    }
    return true;
  };

  const createCartItem = () => ({
    product: product._id,
    name: product.name,
    image: product.images?.[0] || '',
    sku: activeVariant.sku || `SKU-${product._id}`,
    color: activeVariant.color || 'Mặc định',
    size: activeVariant.size || 'M',
    price: Number(activeVariant.price || 0),
    quantity: Number(quantity || 1)
  });

  const handleAddToCartOnly = () => {
    if (!requireAuthentication()) return;

    addToCart(createCartItem());
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNowRedirect = () => {
    if (!requireAuthentication()) return;

    const item = createCartItem();
    addToCart(item);
    navigate('/checkout', { state: { buyNowItem: item } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb tối giản */}
      <nav className="text-xs text-zinc-400 mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-zinc-900 transition">Trang chủ</Link>
        <span>/</span>
        <Link to={`/?cat=${encodeURIComponent(product.category)}`} className="hover:text-zinc-900 transition">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-zinc-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Cột Trái: Hình ảnh Lookbook (7 cột) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {Array.isArray(product.images) && product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 overflow-hidden border transition ${
                    activeImage === idx ? 'border-zinc-950' : 'border-zinc-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 aspect-[3/4] bg-zinc-100 border border-zinc-200 overflow-hidden">
            <img
              src={product.images?.[activeImage] || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Cột Phải: Thông tin & Mua hàng chuẩn E-commerce thực tế (5 cột) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between text-xs text-zinc-500 uppercase tracking-widest">
            <span>{product.category}</span>
            <span>Mã SP: {activeVariant.sku}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-2 leading-snug">
            {product.name}
          </h1>

          <div className="mt-4 pb-6 border-b border-zinc-200 flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-950">
              {Number(activeVariant.price || 0).toLocaleString('vi-VN')} ₫
            </span>
            <span className="text-xs text-zinc-500">
              {availableStock > 0 ? `Còn hàng (${availableStock} sản phẩm)` : 'Tạm hết hàng'}
            </span>
          </div>

          {/* 1. CHỌN MÀU SẮC */}
          <div className="mt-6">
            <div className="flex justify-between items-center text-xs mb-2.5">
              <span className="text-zinc-500 uppercase tracking-wider font-semibold">
                Màu sắc: <strong className="text-zinc-950">{activeVariant.color}</strong>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map((colorName) => {
                const isSelectedColor = activeVariant.color === colorName;
                return (
                  <button
                    key={colorName}
                    type="button"
                    onClick={() => {
                      const match = product.variants.find((v) => v.color === colorName);
                      if (match) setSelectedVariant(match);
                    }}
                    className={`px-4 py-2 text-xs font-semibold border transition ${
                      isSelectedColor
                        ? 'border-zinc-950 bg-zinc-950 text-white'
                        : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-950'
                    }`}
                  >
                    {colorName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CHỌN KÍCH CỠ (SIZE) CHUẨN ZARA / UNIQLO */}
          <div className="mt-6">
            <div className="flex justify-between items-center text-xs mb-2.5">
              <span className="text-zinc-500 uppercase tracking-wider font-semibold">
                Kích cỡ: <strong className="text-zinc-950">Size {activeVariant.size}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="text-zinc-600 hover:text-zinc-950 underline font-medium"
              >
                Bảng quy đổi kích cỡ
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {(product.variants || []).map((v) => {
                const stockLeft = Math.max(0, Number(v.stock || 0) - Number(v.reservedStock || 0));
                const isSelected = activeVariant.sku === v.sku;
                return (
                  <button
                    key={v.sku}
                    type="button"
                    disabled={stockLeft <= 0}
                    onClick={() => setSelectedVariant(v)}
                    className={`py-3 px-2 border text-center transition ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white font-bold'
                        : stockLeft <= 0
                        ? 'border-zinc-200 bg-zinc-100 text-zinc-400 line-through cursor-not-allowed'
                        : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-950 font-medium'
                    }`}
                  >
                    <span className="text-xs block">{v.size}</span>
                    {uniqueColors.length > 1 && (
                      <span className={`text-[10px] block truncate mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                        {v.color}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {showSizeGuide && (
              <div className="mt-3 p-4 bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1.5">
                <p className="font-bold text-zinc-900">Hướng dẫn chọn size chuẩn DUAN.STUDIO:</p>
                <p>• Size S: Cao 1m50 – 1m62 | Nặng 42kg – 52kg</p>
                <p>• Size M: Cao 1m60 – 1m70 | Nặng 53kg – 63kg</p>
                <p>• Size L: Cao 1m68 – 1m77 | Nặng 64kg – 74kg</p>
                <p>• Size XL: Cao trên 1m75 | Nặng 75kg – 85kg</p>
              </div>
            )}
          </div>

          {/* 3. SỐ LƯỢNG & NÚT ƯỚM THỬ TỐI GIẢN */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-zinc-300 bg-white h-11">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-full text-zinc-600 hover:text-zinc-950 font-bold"
              >
                −
              </button>
              <span className="w-10 text-center text-xs font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                className="w-10 h-full text-zinc-600 hover:text-zinc-950 font-bold"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate('/anywear-guide', { state: { product } })}
              className="flex-1 h-11 border border-zinc-300 hover:border-zinc-950 bg-zinc-50 hover:bg-white px-4 flex items-center justify-center gap-2 cursor-pointer transition text-xs font-semibold text-zinc-800"
            >
              <svg
                className="w-4 h-4 text-zinc-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                />
              </svg>
              <span>Ướm thử trên ảnh cá nhân</span>
            </button>
          </div>

          {addedToast && (
            <div className="mt-4 p-3 bg-zinc-900 text-white text-xs font-medium text-center">
              Đã thêm "{product.name}" vào giỏ hàng.
            </div>
          )}

          {/* 4. NÚT THÊM GIỎ HÀNG & MUA NGAY */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={availableStock <= 0}
              onClick={handleAddToCartOnly}
              className="py-4 px-6 border border-zinc-950 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 disabled:opacity-40 transition"
            >
              Thêm Vào Giỏ
            </button>
            <button
              type="button"
              disabled={availableStock <= 0}
              onClick={handleBuyNowRedirect}
              className="py-4 px-6 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest disabled:opacity-40 transition"
            >
              Mua Ngay
            </button>
          </div>

          {/* 5. THÔNG TIN CHI TIẾT & CHÍNH SÁCH (Accordion chuẩn Web thời trang) */}
          <div className="mt-8 border-t border-zinc-200 divide-y divide-zinc-200 text-xs">
            <div className="py-4">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'details' ? '' : 'details')}
                className="w-full flex justify-between items-center font-bold uppercase tracking-wider text-zinc-900"
              >
                <span>Mô Tả & Chất Liệu</span>
                <span>{openAccordion === 'details' ? '−' : '+'}</span>
              </button>
              {openAccordion === 'details' && (
                <p className="mt-3 text-zinc-600 leading-relaxed">{product.description}</p>
              )}
            </div>

            <div className="py-4">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                className="w-full flex justify-between items-center font-bold uppercase tracking-wider text-zinc-900"
              >
                <span>Vận Chuyển & Đổi Trả</span>
                <span>{openAccordion === 'shipping' ? '−' : '+'}</span>
              </button>
              {openAccordion === 'shipping' && (
                <div className="mt-3 text-zinc-600 space-y-1.5 leading-relaxed">
                  <p>• Miễn phí giao hàng toàn quốc cho đơn hàng từ 1.000.000 ₫.</p>
                  <p>• Hỗ trợ đổi size hoặc hoàn trả trong vòng 30 ngày kể từ khi nhận hàng.</p>
                  <p>• Khách hàng được kiểm tra sản phẩm trước khi thanh toán.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}