import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  triggerGooglePopupLogin,
  PasswordStrengthMeter,
  evaluatePasswordRules
} from './Login';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Register({ setUser }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pwdValidation = evaluatePasswordRules(form.password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!pwdValidation.isAllValid) {
      return setError('Vui lòng nhập mật khẩu đáp ứng đủ 3 điều kiện màu xanh bên dưới!');
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, form, {
        withCredentials: true
      });
      localStorage.setItem('duan_user', JSON.stringify(data));
      setUser(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký không thành công!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-zinc-200 shadow-xl space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white font-black text-xl flex items-center justify-center mx-auto">
            D
          </div>
          <h1 className="font-display text-2xl font-extrabold text-zinc-950 pt-2">
            Tạo Tài Khoản Mới
          </h1>
          <p className="text-xs text-zinc-500">
            Trở thành thành viên của DUAN.STUDIO để nhận ưu đãi riêng
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Họ và tên *
            </label>
            <input
              type="text"
              required
              placeholder="Dư Hà Vinh"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Địa chỉ Email *
            </label>
            <input
              type="email"
              required
              placeholder="example@gmail.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Số điện thoại
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
              Mật khẩu bảo mật *
            </label>
            <input
              type="password"
              required
              placeholder="Nhập mật khẩu..."
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
            />

            {/* 3 HƯỚNG DẪN CHUYỂN XANH + THANH TRẠNG THÁI ĐỘ MẠNH MẬT KHẨU */}
            <PasswordStrengthMeter password={form.password} />
          </div>

          <button
            type="submit"
            disabled={loading || !pwdValidation.isAllValid}
            className="w-full py-3.5 rounded-full bg-zinc-950 hover:bg-indigo-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg"
          >
            {loading ? 'Đang khởi tạo...' : 'Đăng Ký Thành Viên →'}
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-zinc-200" />
          <span className="shrink mx-3 text-[11px] font-bold uppercase text-zinc-400">
            Hoặc đăng ký nhanh
          </span>
          <div className="flex-grow border-t border-zinc-200" />
        </div>

        <button
          type="button"
          onClick={() => triggerGooglePopupLogin(setUser, navigate, setError)}
          className="w-full py-3 px-4 rounded-full border border-zinc-300 hover:border-zinc-950 bg-white text-zinc-800 text-xs font-extrabold flex items-center justify-center gap-2.5 transition"
        >
          <span>Tiếp tục bằng tài khoản Google</span>
        </button>

        <p className="text-center text-xs text-zinc-500 pt-2">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-extrabold text-zinc-950 underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}