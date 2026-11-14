import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Profile({ user, setUser, cartCount }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setForm((prev) => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      avatar: user.avatar || ''
    }));

    // Tải lịch sử đơn hàng của riêng tài khoản này
    axios
      .get(`${API_URL}/auth/my-orders`, {
        params: { phone: user.phone, name: user.name }
      })
      .then((res) => setMyOrders(res.data || []))
      .catch(() => {});
  }, [user, navigate]);

  if (!user) return null;

  // Chọn file ảnh đại diện từ máy tính -> Chuyển sang Base64 hiển thị ngay & lưu vào MongoDB
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return setMessage({ type: 'error', text: 'Vui lòng chọn định dạng file hình ảnh (JPG, PNG, WEBP)!' });
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, avatar: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (form.newPassword && form.newPassword.length < 6) {
      return setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
    }

    setSaving(true);
    try {
      const { data } = await axios.put(
        `${API_URL}/auth/profile`,
        {
          userId: user._id,
          email: user.email,
          name: form.name,
          phone: form.phone,
          address: form.address,
          avatar: form.avatar,
          newPassword: form.newPassword || undefined
        },
        { withCredentials: true }
      );

      // Cập nhật lại state user toàn cục & localStorage
      const updatedUser = { ...user, ...data };
      localStorage.setItem('duan_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setForm((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
      setMessage({
        type: 'success',
        text: 'Đã lưu thông tin hồ sơ và ảnh đại diện vào cơ sở dữ liệu thành công!'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Không thể cập nhật hồ sơ, vui lòng thử lại!'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Account Settings
          </span>
          <h1 className="font-display text-3xl font-extrabold text-zinc-950 mt-1">
            Hồ Sơ Cá Nhân Của Bạn
          </h1>
        </div>
        <Link
          to="/cart"
          className="text-xs font-bold text-zinc-700 hover:text-zinc-950 border border-zinc-300 px-4 py-2 rounded-full"
        >
          Giỏ hàng riêng của tài khoản ({cartCount} sản phẩm) →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cột Trái: Thẻ Ảnh Đại Diện (Avatar) */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 text-center space-y-5 shadow-sm">
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={
                form.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || 'U')}&background=09090b&color=fff&bold=true`
              }
              alt={form.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-zinc-100 shadow-md"
            />
            <label
              title="Tải ảnh đại diện mới"
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-zinc-950 hover:bg-indigo-600 text-white flex items-center justify-center cursor-pointer shadow-lg transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                user.role === 'admin'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {user.role === 'admin' ? 'Quản trị viên (Admin)' : 'Thành viên DUAN.STUDIO'}
            </span>
            <h2 className="text-xl font-extrabold text-zinc-950 mt-2">{form.name}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{form.email}</p>
          </div>

          <div className="pt-4 border-t border-zinc-100 space-y-2 text-left">
            <label className="block text-[11px] font-bold text-zinc-500">
              Hoặc dán đường dẫn URL ảnh đại diện:
            </label>
            <input
              type="text"
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              placeholder="https://..."
              className="w-full border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-950"
            />
          </div>

          <label className="block w-full py-2.5 rounded-xl border border-zinc-300 hover:border-zinc-950 text-xs font-bold text-zinc-800 cursor-pointer transition">
            Chọn ảnh từ máy tính
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Cột Phải: Form Chỉnh Sửa Hồ Sơ & Lịch Sử Đơn Hàng */}
        <div className="lg:col-span-8 space-y-8">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 space-y-5 shadow-sm"
          >
            <h3 className="text-lg font-extrabold text-zinc-950 border-b border-zinc-100 pb-3">
              Chỉnh Sửa Thông Tin Cá Nhân & Địa Chỉ Giao Hàng
            </h3>

            {message.text && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold ${
                  message.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Họ và tên hiển thị *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Địa chỉ Email (Cố định)
                </label>
                <input
                  type="email"
                  disabled
                  value={form.email}
                  className="w-full border border-zinc-200 bg-zinc-100 text-zinc-500 rounded-2xl px-4 py-3 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Số điện thoại nhận hàng
                </label>
                <input
                  type="tel"
                  placeholder="0901234567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Địa chỉ giao hàng mặc định
                </label>
                <input
                  type="text"
                  placeholder="Số nhà, Đường, Quận/Huyện, Tỉnh/Thành phố"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-3">
                Đổi mật khẩu mới (Để trống nếu không muốn đổi)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Mật khẩu mới (Tối thiểu 6 ký tự)"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                />
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-full bg-zinc-950 hover:bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg"
            >
              {saving ? 'Đang lưu hồ sơ...' : 'Lưu Thay Đổi Hồ Sơ Cá Nhân'}
            </button>
          </form>

          {/* Lịch sử đơn hàng của tài khoản */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 space-y-4 shadow-sm">
            <h3 className="text-lg font-extrabold text-zinc-950">
              Đơn Hàng Gần Đây Của Bạn ({myOrders.length})
            </h3>
            {myOrders.length === 0 ? (
              <p className="text-xs text-zinc-500">
                Bạn chưa có đơn hàng nào khớp với số điện thoại/tên hiện tại.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 text-xs">
                {myOrders.map((ord) => (
                  <div key={ord._id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-mono font-bold text-indigo-600">
                        Đơn #{ord.orderCode}
                      </span>
                      <p className="text-zinc-600 mt-0.5">
                        {ord.items?.length || 1} sản phẩm • Giao tới: {ord.customerInfo?.address}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-zinc-950 text-sm">
                        {ord.totalAmount?.toLocaleString('vi-VN')} ₫
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {ord.paymentStatus} • {ord.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}