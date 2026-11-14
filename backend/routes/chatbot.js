const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

const CUSTOM_MEMORY_FILE = path.join(__dirname, '../custom_bot_memory.json');

const getCustomRules = () => {
  try {
    if (!fs.existsSync(CUSTOM_MEMORY_FILE)) return [];
    const data = JSON.parse(fs.readFileSync(CUSTOM_MEMORY_FILE, 'utf8'));
    return Array.isArray(data) ? data.filter((x) => x.isCustomRule) : [];
  } catch {
    return [];
  }
};

// ============================================================================
// GIÁO TRÌNH NGHIỆP VỤ GỐC ĐỂ TRAIN CHO GEMINI
// ============================================================================
const buildStylistSystemPrompt = (products, coupons, customRules, trackedOrder) => {
  const productCatalog = products
    .map((p) => {
      const price = (p.variants?.[0]?.price || 0).toLocaleString('vi-VN');
      const colors = [...new Set((p.variants || []).map((v) => v.color))].join(', ');
      const sizes = [...new Set((p.variants || []).map((v) => v.size))].join(', ');
      const stock = (p.variants || []).reduce(
        (sum, v) => sum + Math.max(0, Number(v.stock || 0) - Number(v.reservedStock || 0)),
        0
      );
      return `- [ID: ${p._id}] Tên: "${p.name}" | Danh mục: ${p.category} | Giá: ${price}₫ | Màu: ${colors} | Size: ${sizes} | Tồn kho: ${stock} chiếc | Mô tả: ${p.description}`;
    })
    .join('\n');

  const couponList = coupons
    .map(
      (c) =>
        `- Mã ${c.code}: Giảm ${c.discountPercent}% (tối đa ${c.maxDiscountAmount?.toLocaleString('vi-VN')}₫) cho đơn từ ${c.minOrderValue?.toLocaleString('vi-VN')}₫`
    )
    .join('\n');

  const adminTrainedRules =
    customRules.length > 0
      ? '\nCÁC NGHIỆP VỤ ĐẶC BIỆT DO CHỦ SHOP DẠY THÊM (BẮT BUỘC TUÂN THỦ):\n' +
        customRules.map((r) => `- Khi gặp tình huống "${r.trigger}": ${r.response}`).join('\n')
      : '';

  return `Bạn là Minh Anh — Chuyên viên Tư vấn Thời trang (Personal Stylist) làm việc tại thương hiệu thời trang DUAN.STUDIO.
Bạn đang trực tiếp nhắn tin trò chuyện với khách hàng qua cửa sổ chat kiểu Messenger.

1. PHONG CÁCH TRÒ CHUYỆN & TÍNH CÁCH:
- Bạn là một trí tuệ nhân tạo Gemini thông minh, linh hoạt, thấu hiểu tâm lý và trò chuyện tự nhiên 100% như một người bạn sành sỏi thời trang ngoài đời thực.
- Xưng "mình" - gọi "bạn" (hoặc xưng "em" - gọi "anh/chị" nếu khách xưng anh/chị trước).
- Tuyệt đối KHÔNG trả lời kiểu liệt kê máy móc, không lặp lại các câu khuôn mẫu.
- Khi cần tách ý để nhắn giống người thật trên Messenger, hãy chèn ký hiệu "|||" ở giữa các đoạn ngắn (tối đa 2-3 đoạn ngắn mỗi lần trả lời).

2. NGHIỆP VỤ PHÂN BIỆT ĐỒ NAM & ĐỒ NỮ (BẮT BUỘC):
- Nếu khách là NAM (hoặc mua cho bạn trai, chồng, bố, anh/em trai):
  + CHỈ ĐƯỢC ĐỀ XUẤT ĐỒ NAM / UNISEX: Áo Sơ Mi Oxford, Áo Polo Dệt Kim, Áo Sơ Mi Cuban Collar, Áo Sơ Mi Flannel, Quần Tây Pleated Wide-Leg, Quần Jeans Selvedge, Quần Cargo Túi Hộp, Áo Blazer Đen, Áo Khoác Trench Coat, Áo Khoác Da Biker, Áo Bomber Varsity, Áo Khoác Phao Puffer, Áo Hoodie, Áo Thun Boxy/Graphic.
  + TUYỆT ĐỐI KHÔNG BAO GIỜ gợi ý Đầm lụa, Đầm hoa nhí, Đầm đen hay Chân váy xếp ly cho khách Nam.
- Nếu khách là NỮ (hoặc mua cho bạn gái, vợ, mẹ, chị/em gái):
  + Ưu tiên gợi ý: Đầm Lụa Satin Midi Đỏ Rượu, Đầm Hoa Nhí Chiffon Parisian, Đầm Dạ Hội Little Black Dress, Chân Váy Xếp Ly Tennis, Áo Len Cardigan Hàn Quốc Nâu, Áo Khoác Trench Coat Beige, Áo Blazer hoặc Áo Sơ Mi/Áo Thun.

3. NGHIỆP VỤ TÍNH SIZE THEO SỐ ĐO CƠ THỂ:
- Size S: Cao 1m50 – 1m62 | Nặng 42kg – 52kg.
- Size M: Cao 1m60 – 1m70 | Nặng 53kg – 63kg.
- Size L: Cao 1m68 – 1m77 | Nặng 64kg – 74kg.
- Size XL: Cao trên 1m75 | Nặng 75kg – 88kg.

4. DỮ LIỆU KHO HÀNG THỰC TẾ TẠI DUAN.STUDIO (CHỈ TƯ VẤN CÁC SẢN PHẨM NÀY):
${productCatalog}

5. CHÍNH SÁCH BÁN HÀNG, VẬN CHUYỂN & MÃ GIẢM GIÁ:
- Địa chỉ Showroom: Tầng 2, Tòa nhà Lotte Center, 54 Liễu Giai, Quận Ba Đình, Hà Nội (08:30 – 22:00). Hotline: 1900 6868.
- Phí vận chuyển: Freeship cho đơn từ 1.000.000₫ (dưới 1 triệu phí ship 30.000₫). Giao nội thành 1-2 ngày, ngoại tỉnh 2-4 ngày. Được đồng kiểm trước khi thanh toán.
- Đổi trả: Đổi size / trả hàng miễn phí trong 30 ngày.
- Mã ưu đãi: DUAN2026 (giảm 15% mọi đơn) và VIP50 (giảm 50% đơn từ 1.000.000₫).
${couponList}
${adminTrainedRules}
${
  trackedOrder
    ? `\n6. ĐƠN HÀNG KHÁCH VỪA NHẮC TỚI (#${trackedOrder.orderCode}): Người nhận ${trackedOrder.customerInfo?.name} (${trackedOrder.customerInfo?.phone}), Tổng tiền: ${trackedOrder.totalAmount?.toLocaleString('vi-VN')}₫, Thanh toán: ${trackedOrder.paymentStatus}, Giao hàng: ${trackedOrder.orderStatus}.`
    : ''
}

7. CÚ PHÁP HIỂN THỊ THẺ SẢN PHẨM ĐÍNH KÈM:
- Ở cuối cùng câu trả lời của bạn, nếu bạn vừa nhắc tới sản phẩm nào trong kho, hãy viết thêm 1 dòng ẩn theo đúng định dạng:
  [PRODUCTS: id_sản_phẩm_1, id_sản_phẩm_2]
  (Lấy đúng mã ID trong ngoặc vuông [ID: ...] ở danh mục trên, tối đa 4 sản phẩm).`;
};

let cachedValidModels = null;

// Tự động lấy danh sách Model hợp lệ từ chính tài khoản Google AI Studio của bạn
const getAvailableGeminiModels = async (apiKey) => {
  if (cachedValidModels && cachedValidModels.length > 0) {
    return cachedValidModels;
  }
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await res.json();
    if (res.ok && Array.isArray(data.models)) {
      const supported = data.models
        .filter(
          (m) =>
            Array.isArray(m.supportedGenerationMethods) &&
            m.supportedGenerationMethods.includes('generateContent') &&
            m.name.includes('gemini') &&
            !m.name.includes('vision') &&
            !m.name.includes('embedding') &&
            !m.name.includes('imagen') &&
            !m.name.includes('tts')
        )
        .map((m) => m.name.replace('models/', ''));

      supported.sort((a, b) => {
        const score = (name) => {
          if (name.includes('2.5-flash')) return 100;
          if (name.includes('2.0-flash')) return 90;
          if (name.includes('flash-latest')) return 85;
          if (name.includes('flash')) return 70;
          if (name.includes('pro')) return 60;
          return 10;
        };
        return score(b) - score(a);
      });

      if (supported.length > 0) {
        cachedValidModels = supported;
        return supported;
      }
    }
  } catch {
    // Bỏ qua
  }
  return ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
};

// Gọi Gemini Multi-Turn Chat API
const callGeminiConversation = async (apiKey, systemInstruction, history, currentMessage) => {
  const models = await getAvailableGeminiModels(apiKey);

  const formattedContents = [
    {
      role: 'user',
      parts: [
        {
          text: `HƯỚNG DẪN HỆ THỐNG & NGHIỆP VỤ BẮT BUỘC:\n${systemInstruction}\n\nHãy ghi nhớ toàn bộ dữ liệu trên và bắt đầu đóng vai Minh Anh (Stylist tại DUAN.STUDIO) để trò chuyện với khách hàng.`
        }
      ]
    },
    {
      role: 'model',
      parts: [
        {
          text: 'Mình đã nắm rõ toàn bộ danh mục 20 sản phẩm, bảng size, quy tắc phân biệt đồ Nam/Nữ và chính sách của DUAN.STUDIO. Mình sẵn sàng tư vấn tự nhiên như trên Messenger!'
        }
      ]
    }
  ];

  const recentHistory = (Array.isArray(history) ? history : []).slice(-10);

  for (const msg of recentHistory) {
    if (!msg?.text || !String(msg.text).trim()) continue;
    const role = msg.sender === 'user' ? 'user' : 'model';
    const cleanText = String(msg.text).trim();

    const prev = formattedContents[formattedContents.length - 1];
    if (prev.role === role) {
      prev.parts[0].text += '\n' + cleanText;
    } else {
      formattedContents.push({ role, parts: [{ text: cleanText }] });
    }
  }

  const lastTurn = formattedContents[formattedContents.length - 1];
  if (lastTurn.role !== 'user') {
    formattedContents.push({ role: 'user', parts: [{ text: currentMessage }] });
  } else if (!lastTurn.parts[0].text.includes(currentMessage)) {
    lastTurn.parts[0].text += '\n' + currentMessage;
  }

  let lastError = '';

  for (const modelName of models.slice(0, 5)) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: formattedContents,
          generationConfig: {
            temperature: 0.85,
            topP: 0.95,
            maxOutputTokens: 1000
          }
        })
      });

      const data = await response.json();
      if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          success: true,
          model: modelName,
          rawText: data.candidates[0].content.parts[0].text
        };
      } else {
        lastError = `${modelName}: ${data?.error?.message || response.status}`;
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  return { success: false, error: lastError };
};

// POST /api/chatbot
router.post('/', async (req, res) => {
  try {
    const { message = '', history = [], clientApiKey = '' } = req.body;
    const cleanMsg = String(message).trim();

    if (cleanMsg.toLowerCase().startsWith('/train ')) {
      const parts = cleanMsg.slice(7).split('|');
      if (parts.length < 2) {
        const guide =
          'Để huấn luyện thêm nghiệp vụ mới cho Gemini, bạn hãy gõ:\n`/train [Tình huống / Câu hỏi] | [Cách xử lý hoặc câu trả lời]`';
        return res.json({ reply: guide, messages: [guide], suggestedProducts: [] });
      }
      const rules = getCustomRules();
      rules.unshift({
        id: Date.now(),
        isCustomRule: true,
        trigger: parts[0].trim(),
        response: parts[1].trim()
      });
      fs.writeFileSync(CUSTOM_MEMORY_FILE, JSON.stringify(rules, null, 2), 'utf8');
      const okMsg = `🧠 Đã nạp trực tiếp vào bộ não của Gemini! Khi gặp tình huống **"${parts[0].trim()}"**, Gemini sẽ áp dụng nghiệp vụ: *"${parts[1].trim()}"*`;
      return res.json({ reply: okMsg, messages: [okMsg], suggestedProducts: [] });
    }

    const [products, coupons] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).catch(() => []),
      Coupon.find({ isActive: true }).catch(() => [])
    ]);
    const customRules = getCustomRules();

    let trackedOrder = null;
    const orderMatch = cleanMsg.match(/\b(\d{6,10})\b/);
    if (orderMatch) {
      trackedOrder = await Order.findOne({ orderCode: Number(orderMatch[1]) }).catch(() => null);
    }

    // Tự động đọc trực tiếp từ giao diện HOẶC đọc nóng lại file backend/.env
    let envFileKey = '';
    try {
      const envPath = path.join(__dirname, '../.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY\s*=\s*([^\r\n#]+)/);
        if (match && match[1]) {
          envFileKey = match[1].trim();
        }
      }
    } catch {
      // Bỏ qua
    }

    const rawKey = clientApiKey || process.env.GEMINI_API_KEY || envFileKey || '';
    const activeKey = String(rawKey).replace(/['"\s]/g, '').trim();

    if (!activeKey || activeKey.length < 15 || activeKey.includes('your_') || activeKey.includes('dán_')) {
      const needKeyMsg =
        '⚠️ **Chưa tìm thấy khóa API Key hợp lệ!**\nBạn hãy kiểm tra lại file `duan/backend/.env` hoặc bấm nút **"⚙️ AI Key"** ở góc trên khung chat để dán trực tiếp vào nhé!';
      return res.json({
        reply: needKeyMsg,
        messages: [needKeyMsg],
        suggestedProducts: [],
        aiMode: 'Chờ gắn API Key'
      });
    }

    const systemPrompt = buildStylistSystemPrompt(products, coupons, customRules, trackedOrder);
    const geminiResult = await callGeminiConversation(
      activeKey,
      systemPrompt,
      history,
      cleanMsg
    );

    if (!geminiResult.success) {
      const errMsg = `⚠️ Kết nối Gemini API báo lỗi: **${geminiResult.error}**. Vui lòng kiểm tra lại mã \`AIzaSy...\` của bạn nhé!`;
      return res.json({
        reply: errMsg,
        messages: [errMsg],
        suggestedProducts: [],
        aiMode: 'Lỗi API Key'
      });
    }

    let cleanReplyText = geminiResult.rawText;
    let selectedProducts = [];

    const prodTagMatch = cleanReplyText.match(/\[PRODUCTS:\s*([^\]]+)\]/i);
    if (prodTagMatch) {
      const rawIds = prodTagMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      selectedProducts = products
        .filter((p) => rawIds.includes(String(p._id)))
        .slice(0, 4)
        .map((p) => ({
          _id: p._id,
          name: p.name,
          category: p.category,
          image: p.images?.[0] || '',
          price: p.variants?.[0]?.price || 0,
          sizes: [...new Set((p.variants || []).map((v) => v.size))].join(', ')
        }));

      cleanReplyText = cleanReplyText.replace(/\[PRODUCTS:\s*([^\]]+)\]/gi, '').trim();
    }

    const bubbles = cleanReplyText
      .split(/\|\|\||\n\n+/)
      .map((b) => b.trim())
      .filter(Boolean);

    return res.json({
      reply: bubbles.join('\n\n'),
      messages: bubbles.length > 0 ? bubbles : [cleanReplyText],
      suggestedProducts: selectedProducts,
      trackedOrder,
      aiMode: `Gemini (${geminiResult.model})`
    });
  } catch (error) {
    console.error('Gemini Chatbot Error:', error);
    return res.status(500).json({
      reply: 'Hệ thống đang xử lý, bạn nhắn lại giúp mình nhé!',
      messages: ['Hệ thống đang xử lý, bạn nhắn lại giúp mình nhé!']
    });
  }
});

module.exports = router;