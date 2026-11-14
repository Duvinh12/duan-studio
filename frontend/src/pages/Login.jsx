import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Tự động lấy Client ID từ .env hoặc từ bộ nhớ trình duyệt đã lưu lúc trước
const getGoogleClientId = () => {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    localStorage.getItem('duan_google_client_id') ||
    ''
  ).trim();
};

// ============================================================================
// 1. GIỮ NGUYÊN CƠ CHẾ ĐĂNG NHẬP GOOGLE CHÍNH THỐNG NHƯ BAN ĐẦU (KHÔNG SỬA ĐỔI)
// ============================================================================
export const triggerGooglePopupLogin = async (setUser, navigate, setError) => {
  const clientId = getGoogleClientId();

  // Nếu đã có Client ID chuẩn -> Mở trực tiếp trang chọn tài khoản Google OAuth2 chính thống
  if (clientId && !clientId.includes('your_')) {
    // Ưu tiên 1: Nếu đã nạp SDK Google Identity Services thì bật Popup giữa màn hình
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const { data } = await axios.post(
                `${API_URL}/auth/google`,
                { accessToken: tokenResponse.access_token },
                { withCredentials: true }
              );
              localStorage.setItem('duan_user', JSON.stringify(data));
              if (typeof setUser === 'function') setUser(data);
              if (typeof navigate === 'function') {
                navigate(data.role === 'admin' ? '/admin' : '/');
              }
            } catch (err) {
              if (typeof setError === 'function') {
                setError(err.response?.data?.message || 'Lỗi xác thực Google');
              }
            }
          }
        }
      });
      tokenClient.requestAccessToken();
      return;
    }

    // Ưu tiên 2: Chuyển hướng sang cổng OAuth2 chính thức của Google (Giống hệt lúc đầu của bạn)
    const redirectUri = window.location.origin;
    const scope = encodeURIComponent('openid email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${scope}&prompt=select_account`;
    window.location.href = authUrl;
    return;
  }

  // Nếu máy chưa nạp kịp VITE_GOOGLE_CLIENT_ID từ .env -> Mở cửa sổ OAuth Google ở chế độ Popup
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    'https://accounts.google.com/AccountChooser',
    'GoogleAuthPopup',
    `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
  );

  if (!popup && typeof setError === 'function') {
    setError('Trình duyệt đã chặn cửa sổ bật lên (Popup). Vui lòng cho phép Popup!');
  }
};

// ============================================================================
// 2. HÀM KIỂM TRA 3 ĐIỀU KIỆN MẬT KHẨU & THANH TRẠNG THÁI MẠNH / YẾU
// ============================================================================
export const evaluatePasswordRules = (password = '') => {
  const rule1 = password.length >= 8;
  const rule2 = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const rule3 = /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
  const passedCount = [rule1, rule2, rule3].filter(Boolean).length;
  return {
    rule1,
    rule2,
    rule3,
    passedCount,
    isAllValid: passedCount === 3
  };
};

export function PasswordStrengthMeter({ password = '' }) {
  const { rule1, rule2, rule3, passedCount } = evaluatePasswordRules(password);

  const rulesList = [
    { id: 1, label: 'Độ dài tối thiểu từ 8 ký tự trở lên', passed: rule1 },
    { id: 2, label: 'Kết hợp cả chữ HOA (A-Z) và chữ thường (a-z)', passed: rule2 },
    { id: 3, label: 'Bao gồm chữ số (0-9) và ký tự đặc biệt (@, #, !, $...)', passed: rule3 }
  ];

  const getStrengthMeta = () => {
    if (!password) {
      return { text: 'Chưa nhập mật khẩu', color: 'bg-zinc-200', textColor: 'text-zinc-400', width: 'w-0' };
    }
    if (passedCount === 1) {
      return { text: 'Mật khẩu Yếu (1/3 điều kiện)', color: 'bg-red-500', textColor: 'text-red-600', width: 'w-1/3' };
    }
    if (passedCount === 2) {
      return { text: 'Mật khẩu Trung bình (2/3 điều kiện)', color: 'bg-amber-500', textColor: 'text-amber-600', width: 'w-2/3' };
    }
    if (passedCount === 3) {
      return { text: 'Mật khẩu Mạnh • Đã đạt chuẩn (3/3)', color: 'bg-emerald-500', textColor: 'text-emerald-600', width: 'w-full' };
    }
    return { text: 'Mật khẩu Rất yếu (0/3 điều kiện)', color: 'bg-red-400', textColor: 'text-red-500', width: 'w-[12%]' };
  };

  const strength = getStrengthMeta();

  return (
    <div className="mt-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
      {/* 3 hướng dẫn ở phía trên thanh trạng thái: Tự động chuyển chữ xanh khi đạt */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 mb-2">
          Yêu cầu bảo mật mật khẩu:
        </p>
        {rulesList.map((r) => (
          <div
            key={r.id}
            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
              r.passed ? 'text-emerald-600 font-extrabold' : 'text-zinc-400 font-medium'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 transition-colors duration-200 ${
                r.passed
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-zinc-200 text-zinc-500'
              }`}
            >
              {r.passed ? '✓' : r.id}
            </span>
            <span>{r.label}</span>
          </div>
        ))}
      </div>

      {/* Thanh trạng thái độ mạnh mật khẩu ở dưới */}
      <div className="pt-2 border-t border-zinc-200/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-extrabold">
          <span className="text-zinc-500">Mức độ bảo mật:</span>
          <span className={strength.textColor}>{strength.text}</span>
        </div>
        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. COMPONENT TRANG ĐĂNG NHẬP & QUÊN MẬT KHẨU
// ============================================================================
export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotForm, setForgotForm] = useState({
    email: '',
    otpInput: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();

  // Đăng nhập thường (Giữ nguyên 100%)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, form, {
        withCredentials: true
      });
      localStorage.setItem('duan_user', JSON.stringify(data));
      setUser(data);
      navigate(data.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại, vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  // Gửi OTP thật qua Email
  const handleSendRealOtpEmail = async (e) => {
    if (e) e.preventDefault();
    setForgotMsg({ type: '', text: '' });
    setForgotLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/forgot-password/verify`, {
        email: forgotForm.email
      });
      setForgotStep(2);
      setForgotMsg({
        type: 'success',
        text: `✓ ${data.message}`
      });
    } catch (err) {
      setForgotMsg({
        type: 'error',
        text: err.response?.data?.message || 'Không thể gửi mã OTP tới Email này!'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  // Xác nhận OTP & Đổi mật khẩu mới
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg({ type: '', text: '' });

    const { isAllValid } = evaluatePasswordRules(forgotForm.newPassword);
    if (!isAllValid) {
      return setForgotMsg({
        type: 'error',
        text: 'Mật khẩu mới của bạn chưa đáp ứng đủ 3 điều kiện màu xanh bên dưới!'
      });
    }

    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      return setForgotMsg({ type: 'error', text: 'Mật khẩu xác nhận nhập lại không khớp!' });
    }

    setForgotLoading(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/auth/forgot-password/reset`,
        {
          email: forgotForm.email,
          otp: forgotForm.otpInput.trim(),
          newPassword: forgotForm.newPassword
        },
        { withCredentials: true }
      );

      setForgotMsg({ type: 'success', text: data.message });
      if (data.user) {
        localStorage.setItem('duan_user', JSON.stringify(data.user));
        setUser(data.user);
        setTimeout(() => {
          navigate(data.user.role === 'admin' ? '/admin' : '/');
        }, 1000);
      }
    } catch (err) {
      setForgotMsg({
        type: 'error',
        text: err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const resetPwdCheck = evaluatePasswordRules(forgotForm.newPassword);

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-zinc-200 shadow-xl space-y-6">
        {!forgotMode ? (
          <>
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white font-black text-xl flex items-center justify-center mx-auto">
                D
              </div>
              <h1 className="font-display text-2xl font-extrabold text-zinc-950 pt-2">
                Đăng Nhập Tài Khoản
              </h1>
              <p className="text-xs text-zinc-500">
                Chào mừng bạn quay trở lại với DUAN.STUDIO
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-center">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Địa chỉ Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@duan.vn hoặc email của bạn"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Mật khẩu *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setForgotStep(1);
                      setForgotForm({
                        email: form.email,
                        otpInput: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setForgotMsg({ type: '', text: '' });
                    }}
                    className="text-xs font-extrabold text-indigo-600 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-zinc-950 hover:bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg"
              >
                {loading ? 'Đang xác thực...' : 'Đăng Nhập Ngay →'}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-200" />
              <span className="shrink mx-3 text-[11px] font-bold uppercase text-zinc-400">
                Hoặc tiếp tục với
              </span>
              <div className="flex-grow border-t border-zinc-200" />
            </div>

            <button
              type="button"
              onClick={() => triggerGooglePopupLogin(setUser, navigate, setError)}
              className="w-full py-3 px-4 rounded-full border border-zinc-300 hover:border-zinc-950 bg-white text-zinc-800 text-xs font-extrabold flex items-center justify-center gap-2.5 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 .1 11.2.1 13.5s.5 4.5 1.5 6.5l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5L1.6 17c1.9 3.9 5.8 7 10.4 7z"
                />
              </svg>
              <span>Đăng nhập bằng Google</span>
            </button>

            <p className="text-center text-xs text-zinc-500 pt-2">
              Chưa có tài khoản thành viên?{' '}
              <Link to="/register" className="font-extrabold text-zinc-950 underline">
                Đăng ký ngay
              </Link>
            </p>
          </>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                  Real Email OTP Verification
                </span>
                <h2 className="font-display text-xl font-extrabold text-zinc-950">
                  Khôi Phục Mật Khẩu
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-950"
              >
                ← Quay lại
              </button>
            </div>

            {forgotMsg.text && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold leading-relaxed ${
                  forgotMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}
              >
                {forgotMsg.text}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendRealOtpEmail} className="space-y-4">
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Nhập địa chỉ Email tài khoản của bạn. Hệ thống sẽ gửi một <b>mã xác thực OTP gồm 6 chữ số</b> trực tiếp vào hộp thư Gmail của bạn.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Email nhận mã OTP *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={forgotForm.email}
                    onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                    className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 rounded-full bg-zinc-950 hover:bg-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg"
                >
                  {forgotLoading ? 'Đang gửi mã OTP tới Email...' : 'Gửi Mã OTP Qua Email →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Nhập mã OTP (6 số trong Email) *
                    </label>
                    <button
                      type="button"
                      disabled={forgotLoading}
                      onClick={handleSendRealOtpEmail}
                      className="text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      Gửi lại mã OTP
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Nhập 6 chữ số nhận được..."
                    value={forgotForm.otpInput}
                    onChange={(e) =>
                      setForgotForm({ ...forgotForm, otpInput: e.target.value.replace(/\D/g, '') })
                    }
                    className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-center text-base font-mono font-black tracking-[0.4em] text-indigo-600 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu mới..."
                    value={forgotForm.newPassword}
                    onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                    className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                  />

                  <PasswordStrengthMeter password={forgotForm.newPassword} />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu mới..."
                    value={forgotForm.confirmPassword}
                    onChange={(e) =>
                      setForgotForm({ ...forgotForm, confirmPassword: e.target.value })
                    }
                    className="w-full border border-zinc-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || !resetPwdCheck.isAllValid || forgotForm.otpInput.length < 6}
                  className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg"
                >
                  {forgotLoading ? 'Đang xác thực & Lưu...' : 'Xác Nhận Đổi Mật Khẩu Mới →'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}