const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Hàm tìm sản phẩm an toàn
const findProductSafely = async (item) => {
  if (item.product && mongoose.Types.ObjectId.isValid(String(item.product))) {
    const byId = await Product.findById(item.product);
    if (byId) return byId;
  }
  if (item.sku) {
    const bySku = await Product.findOne({ 'variants.sku': item.sku });
    if (bySku) return bySku;
  }
  if (item.name) {
    const byName = await Product.findOne({
      name: { $regex: item.name.trim().split(' ').slice(0, 4).join(' '),$options: 'i' }
    });
    if (byName) return byName;
  }
  return null;
};

// Giải phóng kho tạm giữ
const releaseReservedStock = async (order) => {
  if (order.stockReleased) return;
  for (const item of order.items) {
    const product = await findProductSafely(item);
    if (product) {
      const variant = product.variants.find((v) => v.sku === item.sku) || product.variants[0];
      if (variant) {
        variant.reservedStock = Math.max(0, (variant.reservedStock || 0) - item.quantity);
      }
      await product.save();
    }
  }
  order.stockReleased = true;
  await order.save();
};

// 1. POST /api/orders/coupons/validate - Kiểm tra mã giảm giá
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) {
      if (code.toUpperCase() === 'DUAN2026') {
        const disc = Math.min(Math.round(orderTotal * 0.15), 200000);
        return res.json({
          code: 'DUAN2026',
          discountPercent: 15,
          discountAmount: disc,
          finalTotal: Math.max(0, orderTotal - disc),
          message: `Áp dụng mã DUAN2026 giảm 15% (-${disc.toLocaleString('vi-VN')}₫)`
        });
      }
      if (code.toUpperCase() === 'VIP50' && orderTotal >= 1000000) {
        const disc = Math.min(Math.round(orderTotal * 0.5), 500000);
        return res.json({
          code: 'VIP50',
          discountPercent: 50,
          discountAmount: disc,
          finalTotal: Math.max(0, orderTotal - disc),
          message: `Áp dụng mã VIP50 giảm 50% (-${disc.toLocaleString('vi-VN')}₫)`
        });
      }
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc chưa đủ điều kiện!' });
    }

    if (orderTotal < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}₫ mới áp dụng được mã này!`
      });
    }

    const discountAmount = Math.min(
      Math.round((orderTotal * coupon.discountPercent) / 100),
      coupon.maxDiscountAmount
    );

    res.json({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
      finalTotal: Math.max(0, orderTotal - discountAmount),
      message: `Áp dụng mã ${coupon.code} thành công (-${discountAmount.toLocaleString('vi-VN')}₫)`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET /api/orders/track/:orderCode - Tra cứu đơn hàng
router.get('/track/:orderCode', async (req, res) => {
  try {
    const order = await Order.findOne({ orderCode: Number(req.params.orderCode) });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng với mã này!' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. POST /api/orders/:orderCode/simulate-pay - Giả lập thanh toán QR thành công
router.post('/:orderCode/simulate-pay', async (req, res) => {
  try {
    const order = await Order.findOne({ orderCode: Number(req.params.orderCode) });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    if (order.paymentStatus === 'PAID') return res.json(order);

    order.paymentStatus = 'PAID';
    for (const item of order.items) {
      const product = await findProductSafely(item);
      if (product) {
        const variant = product.variants.find((v) => v.sku === item.sku) || product.variants[0];
        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
          if (!order.stockReleased) {
            variant.reservedStock = Math.max(0, (variant.reservedStock || 0) - item.quantity);
          }
        }
        await product.save();
      }
    }
    order.stockReleased = true;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. POST /api/orders - Tạo đơn hàng mới (Đã sửa lỗi savedUser is not defined)
router.post('/', async (req, res) => {
  try {
    const { customerInfo, items, paymentMethod, couponCode, isAdmin } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống!' });
    }

    let totalAmount = 0;
    const normalizedItems = [];

    for (const item of items) {
      const product = await findProductSafely(item);

      if (product) {
        const variant = product.variants.find((v) => v.sku === item.sku) || product.variants[0];
        const availableStock = variant ? variant.stock - (variant.reservedStock || 0) : 99;

        if (variant && availableStock < item.quantity) {
          return res.status(400).json({
            message: `Sản phẩm "${product.name}" chỉ còn ${availableStock} chiếc trong kho!`
          });
        }

        if (variant) {
          variant.reservedStock = (variant.reservedStock || 0) + Number(item.quantity);
          await product.save();
        }

        const unitPrice = variant?.price || Number(item.price) || 0;
        totalAmount += unitPrice * Number(item.quantity);

        normalizedItems.push({
          product: product._id,
          name: product.name,
          sku: variant?.sku || item.sku || 'SKU-DEFAULT',
          color: variant?.color || item.color || 'Mặc định',
          size: variant?.size || item.size || 'M',
          price: unitPrice,
          quantity: Number(item.quantity)
        });
      } else {
        const unitPrice = Number(item.price) || 390000;
        totalAmount += unitPrice * Number(item.quantity);
        normalizedItems.push({
          product: null,
          name: item.name || 'Sản phẩm thời trang DUAN',
          sku: item.sku || 'DEMO-SKU',
          color: item.color || 'Tiêu chuẩn',
          size: item.size || 'M',
          price: unitPrice,
          quantity: Number(item.quantity)
        });
      }
    }

    // Tính giảm giá Voucher
    let discountAmount = 0;
    if (couponCode) {
      const cleanCode = couponCode.toUpperCase().trim();
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      if (coupon && totalAmount >= coupon.minOrderValue) {
        discountAmount = Math.min(
          Math.round((totalAmount * coupon.discountPercent) / 100),
          coupon.maxDiscountAmount
        );
        coupon.usedCount += 1;
        await coupon.save();
      } else if (cleanCode === 'DUAN2026') {
        discountAmount = Math.min(Math.round(totalAmount * 0.15), 200000);
      } else if (cleanCode === 'VIP50' && totalAmount >= 1000000) {
        discountAmount = Math.min(Math.round(totalAmount * 0.5), 500000);
      }
    }

    // Kiểm tra quyền Admin từ req.body.isAdmin (Không dùng biến savedUser ở Backend)
    const isAdminOrder =
      Boolean(isAdmin) ||
      Boolean(customerInfo?.name && customerInfo.name.toLowerCase().includes('quản trị'));

    const shippingFee = isAdminOrder || totalAmount >= 1000000 ? 0 : 30000;
    const finalAmount = Math.max(0, totalAmount - discountAmount + shippingFee);
    const orderCode = Number(String(Date.now()).slice(-9));
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const order = await Order.create({
      orderCode,
      customerInfo,
      items: normalizedItems,
      totalAmount: finalAmount,
      discountAmount,
      paymentMethod: paymentMethod === 'CARD' ? 'PAYOS' : paymentMethod,
      reservationExpiresAt
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Create Order Error:', err);
    res.status(500).json({ message: 'Lỗi tạo đơn hàng: ' + err.message });
  }
});

// 5. GET /api/orders - Lấy toàn bộ đơn hàng (Admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. PUT /api/orders/:id/status - Admin cập nhật đơn
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    if (orderStatus === 'CANCELLED' && order.paymentStatus !== 'PAID') {
      await releaseReservedStock(order);
      order.paymentStatus = 'FAILED';
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. Quản lý Coupons
router.get('/coupons/all', protect, adminOnly, async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

router.post('/coupons', protect, adminOnly, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/coupons/:id', protect, adminOnly, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa mã giảm giá' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { router, releaseReservedStock };