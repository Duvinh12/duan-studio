const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  orderCode: { type: Number, required: true, unique: true }, // Mã số nguyên dùng cho PayOS
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  items: [{
    // ĐÃ SỬA Ở ĐÂY: Dùng Mixed để không bao giờ bị lỗi Cast to ObjectId với "demo1", "demo2"
    product: { type: mongoose.Schema.Types.Mixed, required: false },
    name: String,
    sku: String,
    color: String,
    size: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 }
  }],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['PAYOS', 'COD'], default: 'PAYOS' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'EXPIRED', 'FAILED'], default: 'PENDING' },
  orderStatus: { type: String, enum: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], default: 'PROCESSING' },
  trackingNumber: { type: String, default: '' },
  reservationExpiresAt: { type: Date },
  stockReleased: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);