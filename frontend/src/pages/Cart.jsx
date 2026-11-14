import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const FREESHIP_THRESHOLD = 1000000;

export default function Cart({ cart = [], updateQuantity, removeFromCart, user }) {
  const [couponInput, setCouponInput] = useState('DUAN2026');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState('');
  const navigate = useNavigate();

  // Kiểm tra tài khoản hiện tại
  const savedUser = (() => {
    if (user) return user;
    try {
      const raw =
        localStorage.getItem('duan_user') ||
        localStorage.getItem('user') ||
        localStorage.getItem('userInfo');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const isAdminUser = savedUser?.role === 'admin';

  const safeCart = Array.isArray(cart) ? cart : [];
  const subtotal = safeCart.reduce(
    (sum, item) => sum + Number(item?.price || 0) * Number(item?.quantity || 1),
    0
  );

  // Nếu là Admin hoặc đơn >= 1.000.000₫ thì miễn phí vận chuyển (0₫)
  const isFreeShipping = isAdminUser || subtotal >= FREESHIP_THRESHOLD || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : 30000;
  const progressPercent = isAdminUser
    ? 100
    : Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100));

  // Kiểm tra bắt buộc đăng nhập trước khi sang trang Thanh toán
  const handleProceedToCheckout = () => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('duan_token');

    if (!token && !savedUser) {
      alert('Vui lòng đăng nhập tài khoản trước khi tiến hành thanh toán đơn hàng!');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    navigate('/checkout', {
      state: { prefillCoupon: appliedCoupon?.code || couponInput }
    });
  };

  const handleApplyCoupon = async () => {
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) {
      setAppliedCoupon(null);
      setCouponMsg('Vui lòng nhập mã ưu đãi');
      return;
    }

    setCouponMsg('');
    try {
      const { data } = await axios.post(
        `${API_URL}/orders/coupons/validate`,
        {
          code: cleanCode,
          orderTotal: subtotal
        },
        { timeout: 3000 }
      );
      setAppliedCoupon(data);
      setCouponMsg(data.message || `Đã áp dụng mã ${cleanCode} thành công!`);
    } catch (err) {
      // Dự phòng thông minh nếu Backend đang ngủ đông vẫn áp dụng chuẩn 2 mã chính thức của shop
      if (cleanCode === 'DUAN2026') {
        const discountAmount = Math.min(200000, Math.round(subtotal * 0.15));
        setAppliedCoupon({ code: 'DUAN2026', discountAmount });
        setCouponMsg(
          `Đã áp dụng mã DUAN2026: Giảm ${discountAmount.toLocaleString('vi-VN')} ₫ (15%)`
        );
        return;
      }
      if (cleanCode === 'VIP50') {
        if (subtotal < 1000000) {
          setAppliedCoupon(null);
          setCouponMsg('Mã VIP50 chỉ áp dụng cho đơn hàng từ 1.000.000 ₫');
          return;
        }
        const discountAmount = Math.min(500000, Math.round(subtotal * 0.5));
        setAppliedCoupon({ code: 'VIP50', discountAmount });
        setCouponMsg(
          `Đã áp dụng mã VIP50: Giảm ${discountAmount.toLocaleString('vi-VN')} ₫ (50%)`
        );
        return;
      }

      setAppliedCoupon(null);
      setCouponMsg(err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }
  };

  if (safeCart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="bg-white p-12 rounded-[32px] border border-zinc-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-950">
            Giỏ Hàng Của Bạn Đang Trống
          </h2>
          <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto leading-relaxed">
            Hãy khám phá các thiết kế mới nhất và trải nghiệm tính năng kéo thả ảnh ướm thử trang phục trước khi thêm vào giỏ hàng.
          </p>
          <Link
            to="/"
            className="inline-block mt-6 px-8 py-4 bg-zinc-950 hover:bg-indigo-600 text-white rounded-full text-xs font-extrabold uppercase tracking-wider transition"
          >
            Khám Phá Bộ Sưu Tập →
          </Link>
        </div>
      </div>
    );
  }

  const discount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
  const finalTotal = Math.max(0, subtotal - discount + shippingFee);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
            Shopping Bag
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-zinc-950 mt-1">
            Giỏ Hàng Của Bạn ({safeCart.reduce((s, i) => s + Number(i?.quantity || 1), 0)} sản phẩm)
          </h1>
        </div>
        <Link to="/" className="text-xs font-extrabold text-zinc-600 hover:text-zinc-950 underline">
          ← Tiếp tục mua sắm
        </Link>
      </div>

      {/* Thanh trạng thái Miễn phí vận chuyển */}
      <div className="mb-8 p-5 rounded-3xl bg-white border border-zinc-200 shadow-sm">
        <div className="flex justify-between items-center text-xs font-bold mb-2">
          {isAdminUser ? (
            <span className="text-indigo-600">
              Đặc quyền Quản trị viên (Admin): Đơn hàng của bạn được Miễn phí vận chuyển (0 ₫).
            </span>
          ) : subtotal >= FREESHIP_THRESHOLD ? (
            <span className="text-emerald-600">
              Đơn hàng của bạn đã đủ điều kiện hưởng ưu đãi Miễn phí vận chuyển toàn quốc.
            </span>
          ) : (
            <span className="text-zinc-700">
              Mua thêm{' '}
              <b className="text-indigo-600">
                {(FREESHIP_THRESHOLD - subtotal).toLocaleString('vi-VN')} ₫
              </b>{' '}
              để được <b>Miễn phí vận chuyển tiêu chuẩn</b>
            </span>
          )}
          <span className="text-zinc-900">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-zinc-950 transition-all duration-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Danh sách sản phẩm trong giỏ */}
        <div className="lg:col-span-8 space-y-4">
          {safeCart.map((item) => (
            <div
              key={item.sku}
              className="bg-white p-5 rounded-3xl border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-32 object-cover rounded-2xl border border-zinc-100"
                />
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                    SKU: {item.sku}
                  </span>
                  <h3 className="font-extrabold text-base text-zinc-950 mt-1.5">{item.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Màu sắc: <b className="text-zinc-800">{item.color}</b> • Kích cỡ:{' '}
                    <b className="text-zinc-800">Size {item.size}</b>
                  </p>
                  <p className="text-base font-black text-indigo-600 mt-2">
                    {Number(item.price || 0).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex items-center border border-zinc-300 rounded-full bg-zinc-50">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.sku, Number(item.quantity || 1) - 1)}
                    className="w-9 h-9 font-bold text-zinc-700 hover:text-zinc-950"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-xs font-extrabold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.sku, Number(item.quantity || 1) + 1)}
                    className="w-9 h-9 font-bold text-zinc-700 hover:text-zinc-950"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.sku)}
                  className="text-xs font-bold text-zinc-400 hover:text-red-600 transition"
                >
                  Xóa sản phẩm
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cột Tổng Kết Đơn Hàng */}
        <div className="lg:col-span-4 bg-zinc-950 text-white p-7 rounded-[32px] sticky top-28 space-y-6 shadow-2xl">
          <h3 className="font-display text-xl font-extrabold">Tóm Tắt Đơn Hàng</h3>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Mã ưu đãi (DUAN2026 hoặc VIP50)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã ưu đãi..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-2.5 text-xs font-bold uppercase text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold transition"
              >
                Áp dụng
              </button>
            </div>
            {couponMsg && (
              <p className={`text-xs font-semibold ${appliedCoupon ? 'text-emerald-400' : 'text-amber-400'}`}>
                {couponMsg}
              </p>
            )}
          </div>

          <div className="space-y-3 text-sm border-t border-zinc-800 pt-4">
            <div className="flex justify-between text-zinc-400">
              <span>Tạm tính:</span>
              <b className="text-white">{subtotal.toLocaleString('vi-VN')} ₫</b>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Giảm giá:</span>
              <b className="text-emerald-400">− {discount.toLocaleString('vi-VN')} ₫</b>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Phí vận chuyển:</span>
              <b className="text-white">
                {isAdminUser
                  ? '0 ₫ (Miễn phí Admin)'
                  : shippingFee === 0
                  ? 'Miễn phí'
                  : `${shippingFee.toLocaleString('vi-VN')} ₫`}
              </b>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 flex justify-between items-baseline">
            <span className="text-sm text-zinc-300 font-bold">Tổng thanh toán:</span>
            <span className="text-2xl font-black text-indigo-400">
              {finalTotal.toLocaleString('vi-VN')} ₫
            </span>
          </div>

          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="block text-center w-full py-4 rounded-full bg-white text-zinc-950 hover:bg-indigo-500 hover:text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg"
          >
            Tiến Hành Thanh Toán →
          </button>

          <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
            Hỗ trợ thanh toán VietQR, thẻ ngân hàng và kiểm tra hàng trước khi nhận (COD).
          </p>
        </div>
      </div>
    </div>
  );
}