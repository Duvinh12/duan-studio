const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Order = require('../models/Order');

const sendTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'duan_secret_2026', {
    expiresIn: '7d'
  });
  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  return token;
};

const formatUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || 'customer',
  avatar:
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=09090b&color=fff&bold=true`,
  phone: user.phone || '',
  address: user.address || '',
  authProvider: user.authProvider || 'local',
  cart: Array.isArray(user.cart) ? user.cart : [],
  createdAt: user.createdAt,
  token
});

// Hàm kiểm tra 3 điều kiện mật khẩu mạnh chuẩn xác
const isStrongPassword = (pwd = '') => {
  const hasMinLength = pwd.length >= 8;
  const hasUpperAndLower = /[A-Z]/.test(pwd) && /[a-z]/.test(pwd);
  const hasNumberAndSpecial = /\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);
  return hasMinLength && hasUpperAndLower && hasNumberAndSpecial;
};

// Đọc nóng cấu hình EMAIL_USER và EMAIL_PASS từ file .env (Không cần khởi động lại Server)
const getMailCredentials = () => {
  let user = process.env.EMAIL_USER || '';
  let pass = process.env.EMAIL_PASS || '';
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const uMatch = content.match(/EMAIL_USER\s*=\s*([^\r\n#]+)/);
      const pMatch = content.match(/EMAIL_PASS\s*=\s*([^\r\n#]+)/);
      if (!user && uMatch?.[1]) user = uMatch[1].trim().replace(/['"]/g, '');
      if (!pass && pMatch?.[1]) pass = pMatch[1].trim().replace(/['"\s]/g, '');
    }
  } catch {
    // Bỏ qua
  }
  return { user, pass };
};

// 1. ĐĂNG KÝ (/api/auth/register)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu!' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Mật khẩu chưa đạt đủ 3 điều kiện bảo mật (Tối thiểu 8 ký tự, có chữ Hoa/thường, số và ký tự đặc biệt)!'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: 'Email này đã tồn tại! Vui lòng chuyển sang Đăng nhập.' });
    }

    const role = normalizedEmail === 'admin@duan.vn' ? 'admin' : 'customer';
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=4f46e5&color=fff&bold=true`;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone || '',
      role,
      authProvider: 'local',
      avatar,
      cart: []
    });

    const token = sendTokenCookie(res, user._id);
    return res.status(201).json(formatUser(user, token));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký: ' + err.message });
  }
});

// 2. ĐĂNG NHẬP (/api/auth/login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập Email và Mật khẩu!' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Email chưa được đăng ký trong hệ thống!' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu không chính xác!' });
    }

    const token = sendTokenCookie(res, user._id);
    return res.json(formatUser(user, token));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi đăng nhập: ' + err.message });
  }
});

// 3. QUÊN MẬT KHẨU - BƯỚC 1: TẠO & GỬI MÃ OTP THẬT QUA EMAIL (/api/auth/forgot-password/verify)
router.post('/forgot-password/verify', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập địa chỉ Email đã đăng ký!' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản nào gắn với Email này!' });
    }

    // Tạo mã OTP ngẫu nhiên 6 chữ số và lưu vào MongoDB (Hết hạn sau 5 phút)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otpCode;
    user.resetOtpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const { user: mailUser, pass: mailPass } = getMailCredentials();

    if (!mailUser || !mailPass || mailUser.includes('your_')) {
      return res.status(500).json({
        message:
          'Chưa cấu hình EMAIL_USER và EMAIL_PASS (App Password 16 ký tự của Gmail) trong file backend/.env để gửi thư OTP thật!'
      });
    }

    // Khởi tạo SMTP Gmail gửi thư thật tới hòm thư của người dùng
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPass
      }
    });

    await transporter.sendMail({
      from: `"DUAN.STUDIO Security" <${mailUser}>`,
      to: user.email,
      subject: `[DUAN.STUDIO] Mã xác thực OTP khôi phục mật khẩu: ${otpCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; border: 1px solid #e4e4e7; border-radius: 20px; background: #ffffff; color: #18181b;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f4f4f5;">
            <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">DUAN<span style="color: #4f46e5;">.STUDIO</span></span>
          </div>
          <h2 style="font-size: 18px; margin-top: 24px;">Xin chào ${user.name},</h2>
          <p style="font-size: 14px; color: #52525b; line-height: 1.6;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản gắn với địa chỉ <b>${user.email}</b>. Vui lòng nhập mã OTP gồm 6 chữ số bên dưới vào màn hình khôi phục:
          </p>
          <div style="margin: 28px 0; padding: 20px; background: #09090b; color: #ffffff; text-align: center; border-radius: 16px; letter-spacing: 10px; font-size: 30px; font-weight: 900;">
            ${otpCode}
          </div>
          <p style="font-size: 12px; color: #71717a; line-height: 1.5;">
            • Mã xác thực này có hiệu lực trong vòng <b>05 phút</b>.<br/>
            • Tuyệt đối không chia sẻ mã này cho bất kỳ ai.
          </p>
        </div>
      `
    });

    // Tuyệt đối KHÔNG trả otpCode về response JSON để đảm bảo bảo mật thật 100%
    return res.json({
      verified: true,
      email: user.email,
      message: `Mã xác thực OTP gồm 6 chữ số đã được gửi tới hòm thư ${user.email}. Vui lòng kiểm tra Hộp thư đến (hoặc mục Thư rác/Spam)!`
    });
  } catch (err) {
    res.status(500).json({
      message: 'Không thể gửi email OTP: ' + err.message
    });
  }
});

// 4. QUÊN MẬT KHẨU - BƯỚC 2: KIỂM TRA MÃ OTP TỪ DATABASE & ĐẶT LẠI MẬT KHẨU MỚI (/api/auth/forgot-password/reset)
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mã OTP và mật khẩu mới!' });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message: 'Mật khẩu mới chưa đáp ứng đủ 3 điều kiện bảo mật bắt buộc!'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });
    }

    if (!user.resetOtp || !user.resetOtpExpire) {
      return res.status(400).json({ message: 'Yêu cầu đặt lại mật khẩu không tồn tại, vui lòng gửi lại OTP!' });
    }

    if (new Date() > new Date(user.resetOtpExpire)) {
      user.resetOtp = null;
      user.resetOtpExpire = null;
      await user.save();
      return res.status(400).json({ message: 'Mã OTP đã hết hạn (quá 5 phút). Vui lòng bấm gửi lại mã mới!' });
    }

    if (String(user.resetOtp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: 'Mã xác thực OTP không chính xác! Vui lòng kiểm tra lại email.' });
    }

    // OTP hợp lệ -> Cập nhật mật khẩu mới và xóa OTP đã dùng
    user.password = newPassword.trim();
    user.authProvider = 'local';
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save();

    const token = sendTokenCookie(res, user._id);
    return res.json({
      message: 'Đặt lại mật khẩu thành công! Hệ thống đang tự động đăng nhập...',
      user: formatUser(user, token)
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi đặt lại mật khẩu: ' + err.message });
  }
});

// 5. ĐĂNG NHẬP GOOGLE (/api/auth/google)
router.post('/google', async (req, res) => {
  try {
    const { accessToken, credential, googleProfile } = req.body;
    let payload = null;

    if (accessToken) {
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userData = await googleRes.json();
      if (!userData || !userData.email) {
        return res.status(400).json({ message: 'Không thể lấy thông tin từ Google!' });
      }
      payload = {
        googleId: userData.sub,
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        avatar: userData.picture
      };
    } else if (credential) {
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
      payload = {
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.picture
      };
    } else if (googleProfile && googleProfile.email) {
      payload = {
        googleId: googleProfile.googleId || `google_${Date.now()}`,
        email: googleProfile.email,
        name: googleProfile.name || googleProfile.email.split('@')[0],
        avatar:
          googleProfile.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            googleProfile.name || googleProfile.email.split('@')[0]
          )}&background=ea4335&color=fff&bold=true`
      };
    } else {
      return res.status(400).json({ message: 'Không nhận được dữ liệu xác thực từ Google!' });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    const role = normalizedEmail === 'admin@duan.vn' ? 'admin' : 'customer';

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: normalizedEmail,
        googleId: payload.googleId,
        avatar: payload.avatar,
        authProvider: 'google',
        role,
        cart: []
      });
    } else {
      user.googleId = payload.googleId || user.googleId;
      if (payload.avatar && !user.avatar.startsWith('data:image')) {
        user.avatar = payload.avatar;
      }
      await user.save();
    }

    const token = sendTokenCookie(res, user._id);
    return res.json(formatUser(user, token));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xác thực Google: ' + err.message });
  }
});

// 6. CẬP NHẬT HỒ SƠ CÁ NHÂN (/api/auth/profile)
router.put('/profile', async (req, res) => {
  try {
    const { email, userId, name, phone, address, avatar, newPassword } = req.body;
    let user = null;

    if (userId) user = await User.findById(userId).catch(() => null);
    if (!user && email) user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản để cập nhật!' });
    }

    if (name !== undefined && name.trim() !== '') user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (avatar !== undefined && avatar !== '') user.avatar = avatar;

    if (newPassword && newPassword.trim() !== '') {
      if (!isStrongPassword(newPassword)) {
        return res.status(400).json({
          message: 'Mật khẩu mới phải có tối thiểu 8 ký tự, bao gồm chữ Hoa/thường, chữ số và ký tự đặc biệt!'
        });
      }
      user.password = newPassword.trim();
    }

    await user.save();
    const token = sendTokenCookie(res, user._id);
    return res.json(formatUser(user, token));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật hồ sơ: ' + err.message });
  }
});

// 7. ĐỒNG BỘ GIỎ HÀNG RIÊNG (/api/auth/cart)
router.put('/cart', async (req, res) => {
  try {
    const { email, userId, cart } = req.body;
    let user = null;
    if (userId) user = await User.findById(userId).catch(() => null);
    if (!user && email) user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json({ cart: cart || [] });

    user.cart = Array.isArray(cart) ? cart : [];
    await user.save();
    return res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. LẤY ĐƠN HÀNG CỦA TÀI KHOẢN (/api/auth/my-orders)
router.get('/my-orders', async (req, res) => {
  try {
    const { phone, name } = req.query;
    let query = {};
    if (phone) query['customerInfo.phone'] = phone;
    else if (name) query['customerInfo.name'] = { $regex: name, $options: 'i' };
    else return res.json([]);

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(10);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 9. QUẢN LÝ TÀI KHOẢN DÀNH CHO ADMIN (/api/auth/users)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tải danh sách tài khoản: ' + err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, phone, address, role, avatar } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ Họ tên, Email và Mật khẩu!' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: 'Email này đã tồn tại trong hệ thống!' });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim(),
      phone: phone || '',
      address: address || '',
      role: role === 'admin' ? 'admin' : 'customer',
      avatar:
        avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=09090b&color=fff&bold=true`,
      authProvider: 'local',
      cart: []
    });

    res.status(201).json(formatUser(newUser));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo tài khoản: ' + err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, address, role, password, avatar } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });
    }

    if (name !== undefined && name.trim()) user.name = name.trim();
    if (email !== undefined && email.trim()) user.email = email.toLowerCase().trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (role === 'admin' || role === 'customer') user.role = role;
    if (avatar !== undefined && avatar.trim()) user.avatar = avatar.trim();
    if (password && password.trim().length >= 6) {
      user.password = password.trim();
    }

    await user.save();
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật tài khoản: ' + err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản cần xóa!' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: `Đã xóa tài khoản ${user.email} thành công!` });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa tài khoản: ' + err.message });
  }
});

// 10. ĐĂNG XUẤT
router.post('/logout', (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Đã đăng xuất' });
});

module.exports = router;