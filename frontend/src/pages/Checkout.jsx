import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useLocation, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const FREESHIP_THRESHOLD = 1000000;

export default function Checkout({ cart = [], clearCart }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const paymentStatusParam = searchParams.get('status');
  const returnedOrderCode = searchParams.get('orderCode');

  const currentUser = (() => {
    try {
      const raw = localStorage.getItem('duan_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const isAdminUser = currentUser?.role === 'admin';

  const effectiveCart =
    Array.isArray(cart) && cart.length > 0
      ? cart
      : location.state?.buyNowItem
      ? [location.state.buyNowItem]
      : [];

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    note: '',
    couponCode: location.state?.prefillCoupon || 'DUAN2026',
    paymentMethod: 'PAYOS'
  });

  const [discountInfo, setDiscountInfo] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [payosData, setPayosData] = useState(null);
  const [payosError, setPayosError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [simulating, setSimulating] = useState(false);

  const subtotal = effectiveCart.reduce(
    (sum, item) => sum + Number(item?.price || 0) * Number(item?.quantity || 1),
    0
  );

  const shippingFee =
    isAdminUser || subtotal >= FREESHIP_THRESHOLD || subtotal === 0 ? 0 : 30000;

  const handleCheckCoupon = async (codeToValidate) => {
    const code = (codeToValidate ?? form.couponCode).trim();
    if (!code || subtotal === 0) return;
    try {
      const { data } = await axios.post(`${API_URL}/orders/coupons/validate`, {
        code,
        orderTotal: subtotal
      });
      setDiscountInfo(data);
      setCouponMessage(`✓ ${data.message}`);
    } catch (err) {
      setDiscountInfo(null);
      setCouponMessage(`⚠️ ${err.response?.data?.message || 'Mã giảm giá không hợp lệ'}`);
    }
  };

  useEffect(() => {
    if (subtotal > 0 && form.couponCode) {
      handleCheckCoupon(form.couponCode);
    }
  }, [subtotal]);

  // Nếu người dùng vừa thanh toán trên trang PayOS và được redirect về ?status=success&orderCode=...
  useEffect(() => {
    if (returnedOrderCode) {
      axios
        .get(`${API_URL}/payos/check-status/${returnedOrderCode}`)
        .then(({ data }) => {
          if (data.order) setOrderResult(data.order);
        })
        .catch(() => {});
    }
  }, [returnedOrderCode]);

  // TỰ ĐỘNG KIỂM TRA TRẠNG THÁI THANH TOÁN PAYOS MỖI 3 GIÂY (Auto-Polling)
  useEffect(() => {
    if (!orderResult || orderResult.paymentStatus === 'PAID' || orderResult.paymentMethod === 'COD') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API_URL}/payos/check-status/${orderResult.orderCode}`);
        if (data.status === 'PAID' && data.order) {
          setOrderResult(data.order);
          clearInterval(pollInterval);
        }
      } catch {
        // Bỏ qua lỗi mạng tạm thời
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [orderResult]);

  // Đồng hồ đếm ngược 15 phút giữ kho
  useEffect(() => {
    if (!orderResult || orderResult.paymentStatus === 'PAID') return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [orderResult]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const discountAmount = discountInfo ? Number(discountInfo.discountAmount || 0) : 0;
  const finalPayable = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (effectiveCart.length === 0) {
      alert('Giỏ hàng của bạn đang trống, vui lòng chọn sản phẩm trước!');
      return;
    }
    setLoading(true);
    setPayosError('');

    try {
      // BƯỚC 1: Tạo đơn hàng & khóa tồn kho trong MongoDB
      const { data: order } = await axios.post(`${API_URL}/orders`, {
        customerInfo: {
          name: form.name,
          phone: form.phone,
          address: form.address
        },
        items: effectiveCart,
        paymentMethod: form.paymentMethod === 'CARD' ? 'PAYOS' : form.paymentMethod,
        couponCode: discountInfo ? discountInfo.code : form.couponCode,
        isAdmin: isAdminUser
      });

      if (typeof clearCart === 'function') clearCart();
      setOrderResult(order);

      // BƯỚC 2: Nếu chọn PAYOS -> Gọi API tạo đơn hàng thật trên cổng PayOS
      if (order.paymentMethod === 'PAYOS') {
        try {
          const { data: linkData } = await axios.post(`${API_URL}/payos/create-payment-link`, {
            orderCode: order.orderCode
          });
          setPayosData(linkData);
        } catch (payErr) {
          setPayosError(
            payErr.response?.data?.message ||
              'Chưa kết nối được API Key PayOS thật, đang hiển thị chế độ QR mô phỏng.'
          );
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khởi tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateWebhookPaid = async () => {
    if (!orderResult) return;
    setSimulating(true);
    try {
      const { data } = await axios.post(`${API_URL}/orders/${orderResult.orderCode}/simulate-pay`);
      setOrderResult(data);
    } catch {
      alert('Không thể xác nhận thanh toán');
    } finally {
      setSimulating(false);
    }
  };

  if (paymentStatusParam === 'success' || orderResult) {
    const code = returnedOrderCode || orderResult?.orderCode;
    const totalOrderMoney = Number(orderResult?.totalAmount ?? finalPayable);
    const isPaid = paymentStatusParam === 'success' || orderResult?.paymentStatus === 'PAID';

    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white p-8 sm:p-10 rounded-[36px] border border-zinc-200 shadow-2xl text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold ${
              isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            {isPaid ? '✓' : '⏳'}
          </div>

          <span className="inline-block mt-4 px-3.5 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-extrabold">
            MÃ ĐƠN HÀNG PAYOS: #{code}
          </span>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-2">
            {isPaid
              ? 'Đơn Hàng Đã Thanh Toán Thành Công!'
              : orderResult?.paymentMethod === 'COD'
              ? 'Đặt Hàng COD Thành Công!'
              : 'Quét Mã VietQR PayOS Để Thanh Toán'}
          </h2>

          {!isPaid && orderResult?.paymentMethod === 'PAYOS' && (
            <>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Hệ thống đang tự động kiểm tra giao dịch từ PayOS mỗi 3 giây...
              </div>

              <div className="mt-3">
                <p className="text-xs text-zinc-500">Thời gian giữ tồn kho tạm thời còn lại:</p>
                <div className="inline-block mt-1 px-5 py-1.5 rounded-full bg-zinc-950 text-white font-mono text-lg font-bold tracking-widest">
                  {formatTime(secondsLeft)}
                </div>
              </div>

              {/* HIỂN THỊ KHUNG THANH TOÁN PAYOS THẬT (NẾU ĐÃ CÓ KEY PAYOS HỢP LỆ) */}
              {payosData?.checkoutUrl ? (
                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    ✓ Đã tạo đơn hàng <b>#{code}</b> trên hệ thống <b>PayOS</b> thành công! Quét mã QR bên dưới (hoặc mở trang PayOS), ngay khi chuyển khoản xong màn hình này sẽ tự động báo Thành Công.
                  </div>

                  {/* Nhúng trực tiếp cổng thanh toán PayOS hoặc nút mở tab mới */}
                  <div className="rounded-3xl overflow-hidden border-2 border-indigo-500 shadow-lg bg-white h-[540px]">
                    <iframe
                      title="Cổng thanh toán PayOS"
                      src={payosData.checkoutUrl}
                      className="w-full h-full border-0"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <a
                      href={payosData.checkoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition"
                    >
                      ↗ Mở Trang Thanh Toán PayOS Trên Tab Mới
                    </a>
                    <button
                      type="button"
                      onClick={handleSimulateWebhookPaid}
                      disabled={simulating}
                      className="px-6 py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-extrabold transition"
                    >
                      Giả lập đã thanh toán (Nếu test không chuyển tiền thật)
                    </button>
                  </div>
                </div>
              ) : (
                /* Chế độ dự phòng nếu bạn chưa điền đúng 3 mã PAYOS trong backend/.env */
                <div className="mt-5 p-6 rounded-3xl bg-amber-50/60 border-2 border-amber-200">
                  {payosError && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold">
                      ⚠️ Lưu ý: {payosError}
                    </div>
                  )}
                  <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 mb-3">
                    Mã QR Mô Phỏng (Dành cho trường hợp chưa cấu hình Key PayOS thật)
                  </p>
                  <img
                    src={`https://img.vietqr.io/image/MB-0000123456789-compact2.png?amount=${totalOrderMoney}&addInfo=DUAN%20${code}`}
                    alt="VietQR Demo"
                    className="w-52 h-52 mx-auto rounded-2xl border shadow-sm bg-white p-2"
                  />
                  <p className="text-sm font-bold text-zinc-900 mt-3">
                    Số tiền:{' '}
                    <span className="text-lg font-black text-indigo-600">
                      {totalOrderMoney.toLocaleString('vi-VN')} ₫
                    </span>
                  </p>

                  <div className="mt-5 pt-4 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={handleSimulateWebhookPaid}
                      disabled={simulating}
                      className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider transition shadow-md"
                    >
                      {simulating
                        ? 'Đang xác nhận...'
                        : 'Bấm Vào Đây Để Xác Nhận Đã Thanh Toán Thành Công →'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {isPaid && (
            <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-2">
              <p className="font-extrabold text-base text-emerald-700">
                ✓ Giao dịch đã được xác nhận thành công!
              </p>
              <p>
                Số lượng tồn kho của sản phẩm đã được khấu trừ chính thức và đơn hàng <b>#{code}</b> đã chuyển sang trạng thái chuẩn bị giao hàng.
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/"
              className="px-8 py-3.5 rounded-full bg-zinc-950 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-indigo-600 transition"
            >
              Tiếp Tục Mua Sắm →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
          Secure Checkout
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 mt-1">
          Thanh Toán Đơn Hàng
        </h1>
      </div>

      {effectiveCart.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-zinc-200 text-center">
          <h3 className="text-lg font-extrabold text-zinc-900">
            Bạn chưa có sản phẩm nào để thanh toán
          </h3>
          <Link
            to="/"
            className="inline-block mt-4 px-6 py-3 rounded-full bg-zinc-950 text-white text-xs font-extrabold"
          >
            Quay lại chọn sản phẩm →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form
            onSubmit={handleCheckout}
            className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[32px] border border-zinc-200 space-y-6 shadow-sm"
          >
            <h2 className="text-lg font-extrabold text-zinc-900 border-b border-zinc-100 pb-3">
              1. Thông Tin Người Nhận Hàng
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Họ và tên người nhận *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Nguyễn Minh Anh"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Số điện thoại liên hệ *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="0901234567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Địa chỉ nhận hàng chi tiết *
              </label>
              <input
                required
                type="text"
                placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="pt-2">
              <h2 className="text-lg font-extrabold text-zinc-900 border-b border-zinc-100 pb-3 mb-4">
                2. Chọn Phương Thức Thanh Toán
              </h2>

              <div className="space-y-3">
                {[
                  {
                    id: 'PAYOS',
                    title: 'Chuyển khoản Quét Mã VietQR PayOS (Khuyên dùng)',
                    desc: 'Tạo đơn trực tiếp trên cổng PayOS, tự động kiểm tra và duyệt đơn trong 3 giây.',
                    badge: 'Tự động 24/7'
                  },
                  {
                    id: 'COD',
                    title: 'Thanh toán tiền mặt khi nhận hàng (COD)',
                    desc: 'Được phép kiểm tra trang phục trước khi thanh toán.',
                    badge: 'Đồng kiểm'
                  }
                ].map((method) => (
                  <label
                    key={method.id}
                    onClick={() => setForm({ ...form, paymentMethod: method.id })}
                    className={`flex items-start justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                      form.paymentMethod === method.id
                        ? 'border-indigo-600 bg-indigo-50/40'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={form.paymentMethod === method.id}
                        onChange={() => setForm({ ...form, paymentMethod: method.id })}
                        className="mt-1 accent-indigo-600"
                      />
                      <div>
                        <p className="text-sm font-extrabold text-zinc-950">{method.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{method.desc}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-zinc-900 text-white text-[10px] font-bold shrink-0">
                      {method.badge}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-zinc-950 hover:bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-xl"
            >
              {loading
                ? 'Đang tạo đơn hàng trên PayOS...'
                : `Xác Nhận Đặt Hàng (${finalPayable.toLocaleString('vi-VN')} ₫) →`}
            </button>
          </form>

          {/* Cột Phải */}
          <div className="lg:col-span-5 bg-zinc-950 text-white p-7 sm:p-8 rounded-[32px] h-fit space-y-5 shadow-2xl">
            <h2 className="font-display text-xl font-extrabold">3. Chi Tiết Đơn Hàng</h2>

            <div className="space-y-3 divide-y divide-zinc-800 max-h-72 overflow-y-auto pr-1">
              {effectiveCart.map((item) => (
                <div key={item.sku} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-16 object-cover rounded-xl border border-zinc-700"
                    />
                    <div>
                      <p className="font-bold text-xs sm:text-sm line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-zinc-400">
                        {item.color} • Size {item.size} × <b>{item.quantity}</b>
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm shrink-0">
                    {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Mã ưu đãi (DUAN2026 hoặc VIP50)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.couponCode}
                  onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                  placeholder="Nhập mã giảm giá..."
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-2.5 text-xs font-extrabold uppercase text-amber-400"
                />
                <button
                  type="button"
                  onClick={() => handleCheckCoupon(form.couponCode)}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition"
                >
                  Áp dụng
                </button>
              </div>
              {couponMessage && (
                <p className={`text-xs font-bold ${discountInfo ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {couponMessage}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Tổng tiền hàng:</span>
                <b className="text-white">{subtotal.toLocaleString('vi-VN')} ₫</b>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Giảm giá:</span>
                <b className="text-emerald-400">− {discountAmount.toLocaleString('vi-VN')} ₫</b>
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

            <div className="pt-4 border-t border-zinc-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-zinc-300">Tổng thanh toán:</span>
              <span className="text-2xl font-black text-indigo-400">
                {finalPayable.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}