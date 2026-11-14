const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

// CẤU HÌNH LIÊN KẾT ZALO 

const ZALO_PHONE = '0978240104'; // 
const ZALO_LINK = `https://zalo.me/${ZALO_PHONE}`;

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

// Nhận diện nhanh khi khách muốn gặp nhân viên thật / chủ shop / kết nối Zalo
const isHumanHandoffRequest = (text) => {
  const normalized = String(text).toLowerCase();
  const keywords = [
    'gặp nhân viên',
    'liên hệ nhân viên',
    'nhân viên tư vấn',
    'gặp người thật',
    'tư vấn viên',
    'gặp chủ shop',
    'gặp admin',
    'gặp quản lý',
    'nói chuyện với người',
    'chat với người',
    'xin zalo',
    'kết bạn zalo',
    'liên hệ zalo',
    'số zalo',
    'link zalo',
    'gọi điện',
    'số điện thoại shop',
    'hotline'
  ];
  return keywords.some((kw) => normalized.includes(kw));
};

// ============================================================================
// GIÁO TRÌNH NGHIỆP VỤ NÂNG CẤP (CÓ SUY LUẬN NGỮ CẢNH & CHẶN NGOÀI PHẠM VI)
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

  return `Bạn là Minh Anh — Chuyên viên Tư vấn Thời trang (Personal Stylist) độc quyền tại thương hiệu DUAN.STUDIO.
Bạn đang trò chuyện trực tiếp với khách hàng qua khung chat trên website DUAN.STUDIO.

I. QUY TẮC PHẠM VI TRẢ LỜI (GUARDRAILS - QUAN TRỌNG NHẤT):
1. Bạn CHỈ trả lời các câu hỏi liên quan đến:
   - Tư vấn sản phẩm thời trang, phối đồ (mix & match), chọn size, màu sắc, chất liệu, giá cả, tồn kho tại DUAN.STUDIO.
   - Chính sách vận chuyển, đổi trả, thanh toán, mã giảm giá, địa chỉ cửa hàng, tra cứu đơn hàng của DUAN.STUDIO.
   - Chào hỏi xã giao cơ bản để dẫn dắt vào việc tư vấn mua sắm.
2. NẾU khách hỏi BẤT KỲ chủ đề nào NGOÀI PHẠM VI trên (ví dụ: giải toán, viết code lập trình, hỏi bài tập, lịch sử, địa lý, chính trị, tin tức, thời tiết, nấu ăn, y tế, dịch thuật, hoặc hỏi mua sản phẩm không phải quần áo như điện thoại, xe máy...):
   - TUYỆT ĐỐI KHÔNG trả lời nội dung câu hỏi đó.
   - Hãy từ chối lịch sự và ngắn gọn theo đúng ý sau: "Dạ câu hỏi này nằm ngoài phạm vi tư vấn của DUAN.STUDIO mất rồi ạ 😅 Mình chỉ chuyên hỗ trợ tư vấn thời trang, chọn size, phối đồ và kiểm tra đơn hàng tại shop thôi. Bạn đang tìm mẫu áo, quần hay đầm nào để mình gợi ý nhé!"

II. QUY TẮC CHUYỂN TIẾP NHÂN VIÊN / ZALO (HUMAN HANDOFF):
- Khi khách yêu cầu gặp nhân viên tư vấn trực tiếp, gặp người thật, gặp chủ shop, khiếu nại phức tạp, hoặc xin Zalo / Hotline:
  + Hãy mời khách bấm vào liên kết Zalo chính thức của shop: ${ZALO_LINK} (Zalo: ${ZALO_PHONE} - Hotline: 1900 6868) để nhân viên hỗ trợ trực tiếp ngay lập tức, đồng thời gắn thẻ ẩn [HANDOFF_ZALO] ở cuối câu trả lời.

III. KHẢ NĂNG GHI NHỚ & SUY LUẬN NGỮ CẢNH THÔNG MINH:
1. Đọc kỹ toàn bộ lịch sử trò chuyện trước khi trả lời:
   - Ghi nhớ giới tính, chiều cao, cân nặng, dịp mặc (đi làm, đi tiệc, hẹn hò, đi chơi, mùa đông/hè) và ngân sách mà khách đã nhắc tới ở các tin nhắn trước. KHÔNG hỏi lại thông tin khách đã cung cấp.
   - Nếu khách nói "mẫu đầu tiên", "cái màu đen", "còn size M không", "phối với quần gì hợp" -> phải đối chiếu ngay với sản phẩm vừa tư vấn ở tin nhắn liền trước để trả lời chính xác.
2. Tư vấn có chiều sâu như Stylist thực thụ:
   - Khi gợi ý sản phẩm, không chỉ đọc tên và giá mà phải giải thích NGẮN GỌN vì sao mẫu đó hợp với nhu cầu của khách (ví dụ: chất liệu đứng phom che khuyết điểm, phối cùng quần âu/jeans ra sao) và báo luôn size phù hợp nếu khách đã cho chiều cao/cân nặng.
   - Nếu khách chưa rõ nhu cầu, hãy gợi ý 2-3 mẫu tiêu biểu kèm 1 câu hỏi mở ngắn gọn (ví dụ: "Bạn tìm đồ mặc đi làm hay đi chơi cuối tuần để mình chọn phom chuẩn nhất nhé?").

IV. PHONG CÁCH TRÒ CHUYỆN:
- Xưng "mình" - gọi "bạn" (hoặc xưng "em" - gọi "anh/chị" nếu khách xưng anh/chị trước).
- Ngắn gọn, súc tích, tự nhiên như nhắn tin Messenger.
- Dùng ký hiệu "|||" để ngắt thành 2 đoạn tin nhắn ngắn khi cần tách ý giữa phần tư vấn và câu hỏi gợi mở (tối đa 2-3 đoạn mỗi lần trả lời).

V. NGHIỆP VỤ PHÂN BIỆT ĐỒ NAM & ĐỒ NỮ (BẮT BUỘC):
- Nếu khách là NAM (hoặc mua cho bạn trai, chồng, bố, anh/em trai):
  + CHỈ ĐƯỢC ĐỀ XUẤT ĐỒ NAM / UNISEX: Áo Sơ Mi Oxford, Áo Polo Dệt Kim, Áo Sơ Mi Cuban Collar, Áo Sơ Mi Flannel, Quần Tây Pleated Wide-Leg, Quần Jeans Selvedge, Quần Cargo Túi Hộp, Áo Blazer Đen, Áo Khoác Trench Coat, Áo Khoác Da Biker, Áo Bomber Varsity, Áo Khoác Phao Puffer, Áo Hoodie, Áo Thun Boxy/Graphic.
  + TUYỆT ĐỐI KHÔNG gợi ý Đầm lụa, Đầm hoa nhí, Đầm đen hay Chân váy xếp ly cho khách Nam.
- Nếu khách là NỮ (hoặc mua cho bạn gái, vợ, mẹ, chị/em gái):
  + Ưu tiên gợi ý: Đầm Lụa Satin Midi Đỏ Rượu, Đầm Hoa Nhí Chiffon Parisian, Đầm Dạ Hội Little Black Dress, Chân Váy Xếp Ly Tennis, Áo Len Cardigan Hàn Quốc Nâu, Áo Khoác Trench Coat Beige, Áo Blazer hoặc Áo Sơ Mi/Áo Thun.

VI. BẢNG TÍNH SIZE CHUẨN:
- Size S: Cao 1m50 – 1m62 | Nặng 42kg – 52kg.
- Size M: Cao 1m60 – 1m70 | Nặng 53kg – 63kg.
- Size L: Cao 1m68 – 1m77 | Nặng 64kg – 74kg.
- Size XL: Cao trên 1m75 | Nặng 75kg – 88kg.
(Nếu chiều cao và cân nặng lệch nhau, ưu tiên chọn size theo cân nặng hoặc nhích lên 1 size nếu khách thích mặc thoải mái).

VII. DỮ LIỆU KHO HÀNG THỰC TẾ TẠI DUAN.STUDIO (TUYỆT ĐỐI CHỈ TƯ VẤN SẢN PHẨM TRONG DANH SÁCH NÀY, KHÔNG BỊA SẢN PHẨM NGOÀI):
${productCatalog}

VIII. CHÍNH SÁCH BÁN HÀNG, VẬN CHUYỂN & MÃ GIẢM GIÁ:
- Địa chỉ Showroom: Tầng 2, Tòa nhà Lotte Center, 54 Liễu Giai, Quận Ba Đình, Hà Nội (08:30 – 22:00).
- Hotline: 1900 6868 | Zalo hỗ trợ trực tiếp: ${ZALO_LINK}
- Phí vận chuyển: Freeship cho đơn từ 1.000.000₫ (dưới 1 triệu phí ship 30.000₫). Giao nội thành 1-2 ngày, ngoại tỉnh 2-4 ngày. Được kiểm tra hàng trước khi thanh toán.
- Đổi trả: Đổi size / trả hàng miễn phí trong 30 ngày.
- Mã ưu đãi: DUAN2026 (giảm 15% mọi đơn) và VIP50 (giảm 50% đơn từ 1.000.000₫).
${couponList}
${adminTrainedRules}
${
  trackedOrder
    ? `\nIX. ĐƠN HÀNG KHÁCH VỪA TRA CỨU (#${trackedOrder.orderCode}): Người nhận ${trackedOrder.customerInfo?.name} (${trackedOrder.customerInfo?.phone}), Tổng tiền: ${trackedOrder.totalAmount?.toLocaleString('vi-VN')}₫, Thanh toán: ${trackedOrder.paymentStatus}, Giao hàng: ${trackedOrder.orderStatus}.`
    : ''
}

X. CÚ PHÁP ĐÍNH KÈM THẺ SẢN PHẨM (BẮT BUỘC KHI CÓ NHẮC TỚI SẢN PHẨM):
- Mỗi khi bạn đề xuất hoặc nhắc tới bất kỳ sản phẩm nào trong kho, BẮT BUỘC phải ghi ở dòng cuối cùng của câu trả lời theo đúng định dạng:
  [PRODUCTS: id_sản_phẩm_1, id_sản_phẩm_2]
  (Chỉ copy đúng chuỗi ID trong ngoặc vuông [ID: ...] ở mục VII, tối đa 4 sản phẩm).`;
};

let cachedValidModels = null;

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

// Gọi Gemini Multi-Turn Chat API với native systemInstruction
const callGeminiConversation = async (apiKey, systemInstruction, history, currentMessage) => {
  const models = await getAvailableGeminiModels(apiKey);
  const formattedContents = [];

  // Giữ 16 lượt hội thoại gần nhất để hiểu trọn vẹn ngữ cảnh cuộc trò chuyện
  const recentHistory = (Array.isArray(history) ? history : []).slice(-16);

  for (const msg of recentHistory) {
    if (!msg?.text || !String(msg.text).trim()) continue;
    const role = msg.sender === 'user' ? 'user' : 'model';
    const cleanText = String(msg.text).trim();

    const prev = formattedContents[formattedContents.length - 1];
    if (prev && prev.role === role) {
      prev.parts[0].text += '\n' + cleanText;
    } else {
      formattedContents.push({ role, parts: [{ text: cleanText }] });
    }
  }

  // Gemini API bắt buộc phần tử đầu tiên trong contents phải có role là 'user'
  while (formattedContents.length > 0 && formattedContents[0].role !== 'user') {
    formattedContents.shift();
  }

  const lastTurn = formattedContents[formattedContents.length - 1];
  if (!lastTurn || lastTurn.role !== 'user') {
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
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: formattedContents,
          generationConfig: {
            temperature: 0.35, // Hạ nhiệt độ để bot suy luận chuẩn xác và tuân thủ phạm vi 100%
            topP: 0.9,
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

    // 1. Lệnh huấn luyện nóng (/train)
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

    // 2. Bắt nhanh yêu cầu gặp nhân viên / liên hệ Zalo ngay lập tức
    if (isHumanHandoffRequest(cleanMsg)) {
      const handoffMessages = [
        'Dạ mình gửi bạn thông tin kết nối trực tiếp với chuyên viên tư vấn và quản lý của DUAN.STUDIO nhé ạ!',
        `👉 **Chat Zalo trực tiếp:** ${ZALO_LINK}\n📞 **Zalo / Hotline:** ${ZALO_PHONE} (08:30 – 22:00)\nBạn bấm thẳng vào đường link Zalo phía trên để nhân viên bên mình hỗ trợ bạn ngay lập tức nha!`
      ];
      return res.json({
        reply: handoffMessages.join('\n\n'),
        messages: handoffMessages,
        suggestedProducts: [],
        zaloLink: ZALO_LINK,
        zaloPhone: ZALO_PHONE,
        aiMode: 'Chuyển tiếp Zalo'
      });
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
    let hasZaloHandoff = false;

    // Kiểm tra nếu Gemini tự kích hoạt cờ chuyển tiếp Zalo
    if (/\[HANDOFF_ZALO\]/i.test(cleanReplyText)) {
      hasZaloHandoff = true;
      cleanReplyText = cleanReplyText.replace(/\[HANDOFF_ZALO\]/gi, '').trim();
    }

    // Trích xuất thẻ [PRODUCTS: ...] hoặc tự động khớp tên sản phẩm nếu AI nhắc tới
    const prodTagMatch = cleanReplyText.match(/\[PRODUCTS:\s*([^\]]+)\]/i);
    if (prodTagMatch) {
      const rawIds = prodTagMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      selectedProducts = products
        .filter((p) => rawIds.some((id) => id.includes(String(p._id)) || String(p._id).includes(id)))
        .slice(0, 4);

      cleanReplyText = cleanReplyText.replace(/\[PRODUCTS:\s*([^\]]+)\]/gi, '').trim();
    }

    // Fallback thông minh: Nếu Gemini nhắc chính xác tên sản phẩm trong câu trả lời mà quên gắn tag [PRODUCTS], tự động đính kèm thẻ sản phẩm đó
    if (selectedProducts.length === 0) {
      const lowerReply = cleanReplyText.toLowerCase();
      selectedProducts = products
        .filter((p) => p.name && lowerReply.includes(p.name.toLowerCase()))
        .slice(0, 4);
    }

    const formattedSuggestedProducts = selectedProducts.map((p) => ({
      _id: p._id,
      name: p.name,
      category: p.category,
      image: p.images?.[0] || '',
      price: p.variants?.[0]?.price || 0,
      sizes: [...new Set((p.variants || []).map((v) => v.size))].join(', ')
    }));

    const bubbles = cleanReplyText
      .split(/\|\|\||\n\n+/)
      .map((b) => b.trim())
      .filter(Boolean);

    if (hasZaloHandoff && !cleanReplyText.includes(ZALO_LINK)) {
      bubbles.push(`👉 Kết nối Zalo trực tiếp với nhân viên hỗ trợ tại đây: ${ZALO_LINK}`);
    }

    return res.json({
      reply: bubbles.join('\n\n'),
      messages: bubbles.length > 0 ? bubbles : [cleanReplyText],
      suggestedProducts: formattedSuggestedProducts,
      trackedOrder,
      zaloLink: hasZaloHandoff ? ZALO_LINK : null,
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