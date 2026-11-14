require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderModule = require('./routes/orders');
const payosRoutes = require('./routes/payos');
const chatbotRoutes = require('./routes/chatbot');
const User = require('./models/User');

// Tương thích cả 2 kiểu export của routes/orders.js
const orderRoutes = orderModule.router || orderModule;

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, origin || true);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payos', payosRoutes);
app.use('/api/chatbot', chatbotRoutes);

const path = require('path');

// ... Các dòng app.use('/api/products', ...), app.use('/api/chatbot', ...) giữ nguyên ở trên ...

// Phục vụ giao diện React đã build từ thư mục frontend/dist
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Mọi đường dẫn không phải /api đều trả về index.html để React Router tự điều hướng (tránh lỗi 404 khi F5)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/duan_fashion';

const startServer = async () => {
  console.log('⏳ Đang kiểm tra kết nối tới MongoDB...');
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('====================================================');
    console.log('✅ TRẠNG THÁI DATABASE : ĐÃ BẬT & KẾT NỐI MONGODB THÀNH CÔNG!');
    console.log(`📂 Tên Database        : ${mongoose.connection.name}`);

    // Tự động tạo sẵn tài khoản Admin & Khách hàng nếu chưa có
    const adminExists = await User.findOne({ email: 'admin@duan.vn' });
    if (!adminExists) {
      await User.create({
        name: 'Quản Trị Viên DUAN',
        email: 'admin@duan.vn',
        password: 'password123',
        role: 'admin',
        authProvider: 'local'
      });
      console.log('🛡️ Tài khoản Admin     : admin@duan.vn / password123 (Vừa tạo mới)');
    } else {
      console.log('🛡️ Tài khoản Admin     : admin@duan.vn / password123 (Đã sẵn sàng)');
    }

    const cusExists = await User.findOne({ email: 'khachhang@duan.vn' });
    if (!cusExists) {
      await User.create({
        name: 'Nguyễn Minh Anh',
        email: 'khachhang@duan.vn',
        password: 'password123',
        role: 'customer',
        authProvider: 'local'
      });
    }
    console.log('====================================================');
  } catch (err) {
    console.log('====================================================');
    console.error('❌ TRẠNG THÁI DATABASE : CHƯA KẾT NỐI ĐƯỢC MONGODB!');
    console.error('👉 Chi tiết lỗi        :', err.message);
    console.log('====================================================');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server Backend đang hoạt động tại: http://localhost:${PORT}`);
  });
};

startServer();