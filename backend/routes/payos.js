const express = require('express');
const router = express.Router();
const PayOS = require('@payos/node');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { releaseReservedStock } = require('./orders');

// Hàm khởi tạo PayOS động theo biến môi trường mới nhất
const getPayOSInstance = () => {
  const clientId = process.env.PAYOS_CLIENT_ID?.trim();
  const apiKey = process.env.PAYOS_API_KEY?.trim();
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY?.trim();

  if (
    !clientId ||
    !apiKey ||
    !checksumKey ||
    clientId.includes('your_payos') ||
    clientId.includes('dán_')
  ) {
    return null;
  }

  return new PayOS(clientId, apiKey, checksumKey);
};

// Hàm cập nhật đơn hàng sang PAID và trừ tồn kho thật trong MongoDB
const markOrderAsPaid = async (order) => {
  if (order.paymentStatus === 'PAID') return order;

  order.paymentStatus = 'PAID';
  for (const item of order.items) {
    if (item.product) {
      const product = await Product.findById(item.product).catch(() => null);
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
  }
  order.stockReleased = true;
  await order.save();
  return order;
};

// 1. POST /api/payos/create-payment-link - Tạo đơn hàng thật trên hệ thống PayOS
router.post('/create-payment-link', async (req, res) => {
  try {
    const { orderCode } = req.body;
    const order = await Order.findOne({ orderCode: Number(orderCode) });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng trong DB' });

    const payos = getPayOSInstance();
    if (!payos) {
      return res.status(400).json({
        message: 'Chưa cấu hình PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY trong backend/.env!'
      });
    }

    // PayOS yêu cầu amount là số nguyên >= 2000 VNĐ và description tối đa 25 ký tự
    const amount = Math.max(2000, Math.round(Number(order.totalAmount)));
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const paymentBody = {
      orderCode: Number(order.orderCode),
      amount: amount,
      description: `DUAN ${order.orderCode}`.slice(0, 25),
      items: order.items.map((i) => ({
        name: String(i.name || 'San pham').slice(0, 50),
        quantity: Number(i.quantity || 1),
        price: Math.round(Number(i.price || 0))
      })),
      cancelUrl: `${clientUrl}/checkout?status=cancelled&orderCode=${order.orderCode}`,
      returnUrl: `${clientUrl}/checkout?status=success&orderCode=${order.orderCode}`
    };

    const paymentLinkData = await payos.createPaymentLink(paymentBody);

    res.json({
      checkoutUrl: paymentLinkData.checkoutUrl,
      qrCode: paymentLinkData.qrCode,
      accountName: paymentLinkData.accountName,
      accountNumber: paymentLinkData.accountNumber,
      amount: paymentLinkData.amount,
      description: paymentLinkData.description
    });
  } catch (error) {
    console.error('Lỗi PayOS createPaymentLink:', error);
    res.status(500).json({ message: 'Lỗi tạo link PayOS: ' + error.message });
  }
});

// 2. GET /api/payos/check-status/:orderCode - Tự động hỏi PayOS xem khách đã quét QR chưa (Hoạt động trên cả Localhost!)
router.get('/check-status/:orderCode', async (req, res) => {
  try {
    const orderCode = Number(req.params.orderCode);
    const order = await Order.findOne({ orderCode });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    if (order.paymentStatus === 'PAID') {
      return res.json({ status: 'PAID', order });
    }

    const payos = getPayOSInstance();
    if (!payos) {
      return res.json({ status: order.paymentStatus, order });
    }

    // Gọi trực tiếp lên Server PayOS để lấy trạng thái mới nhất của mã đơn này
    const paymentInfo = await payos.getPaymentLinkInformation(orderCode);

    if (paymentInfo && paymentInfo.status === 'PAID') {
      const updatedOrder = await markOrderAsPaid(order);
      return res.json({ status: 'PAID', order: updatedOrder, payosInfo: paymentInfo });
    }

    if (paymentInfo && (paymentInfo.status === 'CANCELLED' || paymentInfo.status === 'EXPIRED')) {
      order.paymentStatus = 'FAILED';
      await releaseReservedStock(order);
      return res.json({ status: paymentInfo.status, order });
    }

    res.json({ status: paymentInfo?.status || 'PENDING', order });
  } catch (error) {
    res.status(200).json({ status: 'PENDING', error: error.message });
  }
});

// 3. POST /api/payos/webhook - Nhận Webhook (nếu chạy trên domain public hoặc ngrok)
router.post('/webhook', async (req, res) => {
  try {
    const payos = getPayOSInstance();
    if (!payos) return res.json({ success: true });

    const webhookData = payos.verifyPaymentWebhookData(req.body);
    const order = await Order.findOne({ orderCode: Number(webhookData.orderCode) });
    if (!order) return res.json({ success: true });

    if (webhookData.code === '00' && order.paymentStatus !== 'PAID') {
      await markOrderAsPaid(order);
    } else if (webhookData.code !== '00') {
      order.paymentStatus = 'FAILED';
      await releaseReservedStock(order);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;