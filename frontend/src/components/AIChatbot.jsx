import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Tự động chuẩn hóa API_URL
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const RAW_API_URL = isLocalhost
  ? 'http://localhost:5000/api'
  : import.meta.env.VITE_API_URL || 'https://duan-studio.onrender.com/api';

// CẤU HÌNH SỐ ĐIỆN THOẠI & LINK ZALO CỦA BẠN TẠI ĐÂY
const ZALO_PHONE = '0978240104'; 
const ZALO_LINK = `https://zalo.me/${ZALO_PHONE}`;

const STYLIST_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

const QUICK_PROMPTS = [
  'Mình là Nam, 1m72 68kg tư vấn đồ đi làm',
  'Mình là Nữ, 1m58 48kg tìm đầm đi tiệc',
  'Shop có mã giảm giá nào không?',
  'Cho mình liên hệ nhân viên qua Zalo'
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Danh sách sản phẩm dự phòng trên trình duyệt
const FALLBACK_PRODUCTS = [
  { _id: 'p1', name: 'Áo Sơ Mi Oxford Oversized Trắng', category: 'Áo Sơ Mi', price: 490000, colors: 'Trắng, Xanh Pastel', sizes: 'S, M, L', desc: '100% cotton hữu cơ chống nhăn, phom rộng lịch lãm', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p2', name: 'Áo Khoác Trench Coat Dáng Dài Beige', category: 'Áo Khoác', price: 1450000, colors: 'Beige', sizes: 'M, L', desc: 'Vải Gabardine trượt nước nhẹ, đai thắt eo cổ điển', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p3', name: 'Áo Thun Heavyweight Boxy Studio Đen', category: 'Áo Thun', price: 350000, colors: 'Đen Washed', sizes: 'M, L', desc: 'Cotton 280gsm dày dặn, phom Boxy tôn chiều cao', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p4', name: 'Đầm Lụa Satin Midi Minimalist Đỏ Rượu', category: 'Đầm Nữ', price: 890000, colors: 'Đỏ Rượu', sizes: 'S, M', desc: 'Lụa Satin bóng nhẹ sang trọng, cắt chéo tôn dáng', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p5', name: 'Quần Tây Pleated Wide-Leg Tailored Xám', category: 'Quần', price: 680000, colors: 'Xám Khói, Đen', sizes: 'M, L', desc: 'Quần âu xếp ly đôi ống suông rộng Sartorial', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p6', name: 'Áo Blazer Cấu Trúc Double-Breasted Đen', category: 'Áo Khoác', price: 1290000, colors: 'Đen Tuyền', sizes: 'M, L', desc: 'Blazer 2 hàng khuy độn vai vừa phải thanh lịch', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p7', name: 'Áo Hoodie Nỉ Bông Essential Xám Melange', category: 'Áo Khoác', price: 620000, colors: 'Xám Melange', sizes: 'M, L', desc: 'Nỉ cotton 420gsm dày ấm, mũ 2 lớp đứng form', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p8', name: 'Áo Polo Dệt Kim Knitwear Cổ Điển Kem', category: 'Áo Thun', price: 540000, colors: 'Kem Sữa, Xanh Rêu', sizes: 'M, L', desc: 'Len dệt kim sợi mảnh phong cách Old Money', image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p9', name: 'Quần Jeans Selvedge Denim Ống Suông Xanh', category: 'Quần', price: 790000, colors: 'Indigo Raw', sizes: 'M, L', desc: 'Denim Nhật Bản 14oz bền bỉ, đứng ống', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p10', name: 'Áo Khoác Da Biker Jacket Vintage Đen', category: 'Áo Khoác', price: 1590000, colors: 'Đen Bóng', sizes: 'M, L', desc: 'Da tổng hợp cao cấp chống bong tróc, khóa YKK', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p11', name: 'Đầm Hoa Nhí Chiffon Tay Phồng Parisian', category: 'Đầm Nữ', price: 750000, colors: 'Trắng Hoa Nhí', sizes: 'S, M', desc: 'Voan Chiffon 2 lớp mềm mại phong cách Pháp', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p12', name: 'Chân Váy Xếp Ly Tennis Skirt Năng Động', category: 'Quần', price: 390000, colors: 'Trắng, Đen', sizes: 'S, M', desc: 'Cạp cao tôn chân dài kèm quần bảo hộ bên trong', image: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=600&q=80' }
];

// 1. Nhận diện yêu cầu liên hệ nhân viên / Zalo
const isHumanHandoffRequest = (text) => {
  const lower = String(text).toLowerCase();
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
    'qua zalo',
    'zalo shop',
    'số điện thoại shop',
    'hotline'
  ];
  return keywords.some((kw) => lower.includes(kw));
};

// 2. Nhận diện câu hỏi ngoài phạm vi tư vấn thời trang
const isOutOfScopeQuestion = (text) => {
  const lower = String(text).toLowerCase();
  // Nếu có từ khóa liên quan tới quần áo/shop thì không chặn
  if (
    /áo|quần|đầm|váy|size|màu|giá|ship|giao hàng|đổi trả|voucher|mã giảm|khuyến mãi|đơn hàng|shop|mặc|phối|tư vấn|nam|nữ|cao|nặng|kg|m\d/i.test(
      lower
    )
  ) {
    return false;
  }

  const outOfScopePatterns = [
    /\d+\s*[\+\-\*\/]\s*\d+/, // phép toán 1+1, 5*6...
    /bằng mấy|tính tích phân|giải phương trình|đạo hàm|hình học/,
    /viết code|lập trình|javascript|python|react|html|css|c\+\+|java|sql|thuật toán/,
    /thời tiết|mưa không|nắng không|nhiệt độ hôm nay/,
    /tổng thống|chính trị|chiến tranh|ủn|biden|trump|chứng khoán|bitcoin|crypto|cổ phiếu|giá vàng|tỷ giá/,
    /nấu ăn|cách nấu|công thức món|phở|bún bò/,
    /bóng đá|ngoại hạng anh|world cup|tỷ số|mu vs|real madrid/,
    /viết văn|làm thơ|kể chuyện|ịch sử|địa lý|thủ đô của|ai phát minh/,
    /thuốc trị|bệnh viện|đau bụng|đau đầu|triệu chứng/
  ];

  return outOfScopePatterns.some((regex) => regex.test(lower));
};

// Xây dựng giáo trình nghiệp vụ Stylist đầy đủ cho AI
const createStylistInstruction = (products) => {
  const listToUse = Array.isArray(products) && products.length > 0 ? products : FALLBACK_PRODUCTS;
  const catalog = listToUse
    .map((p) => {
      const price = (p.variants?.[0]?.price || p.price || 0).toLocaleString('vi-VN');
      const colors = p.variants
        ? [...new Set(p.variants.map((v) => v.color))].join(', ')
        : p.colors || 'Tiêu chuẩn';
      const sizes = p.variants
        ? [...new Set(p.variants.map((v) => v.size))].join(', ')
        : p.sizes || 'S, M, L';
      return `- [ID: ${p._id}] "${p.name}" (${p.category}) | Giá: ${price}₫ | Màu: ${colors} | Size: ${sizes} | Mô tả: ${p.description || p.desc}`;
    })
    .join('\n');

  return `Bạn là Minh Anh — Chuyên viên Tư vấn Thời trang (Personal Stylist) độc quyền tại thương hiệu DUAN.STUDIO.

I. QUY TẮC PHẠM VI TRẢ LỜI (GUARDRAILS - BẮT BUỘC):
1. Bạn CHỈ trả lời các câu hỏi về: tư vấn trang phục, phối đồ, chọn size, chất liệu, giá cả, tồn kho, mã giảm giá, vận chuyển, đổi trả, địa chỉ và đơn hàng tại DUAN.STUDIO.
2. NẾU khách hỏi BẤT KỲ chủ đề nào NGOÀI PHẠM VI trên (ví dụ: giải toán, lập trình, thời tiết, chính trị, lịch sử, nấu ăn, bóng đá, y tế, dịch thuật, hoặc sản phẩm không phải thời trang):
   - TUYỆT ĐỐI KHÔNG trả lời câu hỏi đó.
   - Hãy từ chối lịch sự: "Dạ câu hỏi này nằm ngoài phạm vi tư vấn của DUAN.STUDIO mất rồi ạ 😅 Mình chỉ chuyên hỗ trợ tư vấn thời trang, chọn size, phối đồ và kiểm tra đơn hàng tại shop thôi. Bạn đang tìm mẫu áo, quần hay đầm nào để mình gợi ý nhé!"

II. QUY TẮC CHUYỂN TIẾP ZALO NHÂN VIÊN:
- Khi khách muốn gặp nhân viên thật, gặp chủ shop, khiếu nại hoặc xin Zalo/Hotline: mời khách bấm vào Zalo ${ZALO_LINK} (SĐT: ${ZALO_PHONE}) và ghi thẻ [HANDOFF_ZALO] ở cuối câu.

III. KHẢ NĂNG GHI NHỚ NGỮ CẢNH & TƯ VẤN HỢP LÝ:
- Đọc kỹ lịch sử chat để nhớ giới tính, chiều cao, cân nặng, dịp mặc và ngân sách khách đã nói ở các câu trước. Không hỏi lại thông tin khách đã cho.
- Giải thích ngắn gọn vì sao sản phẩm đó hợp với khách và báo luôn size chuẩn.
- Dùng ký hiệu "|||" để tách tối đa 2 bong bóng tin nhắn ngắn giống Messenger.

IV. PHÂN BIỆT ĐỒ NAM & NỮ:
- Khách NAM: Chỉ gợi ý Áo Sơ Mi Oxford/Cuban/Flannel, Polo, Quần Tây/Jeans/Cargo, Blazer, Trench Coat, Biker, Bomber, Puffer, Hoodie, Áo Thun. Tuyệt đối KHÔNG gợi ý Đầm/Chân váy cho Nam.
- Khách NỮ: Ưu tiên Đầm Lụa Satin Đỏ Rượu, Đầm Hoa Nhí Parisian, Đầm Little Black Dress, Chân Váy Tennis, Cardigan, Trench Coat, Blazer.

V. BẢNG SIZE:
- Size S: 1m50-1m62, 42-52kg | Size M: 1m60-1m70, 53-63kg | Size L: 1m68-1m77, 64-74kg | Size XL: >1m75, 75-88kg.

VI. CHÍNH SÁCH & KHO HÀNG:
- Showroom: Tầng 2 Lotte Center, 54 Liễu Giai, Hà Nội. Hotline: 1900 6868 | Zalo: ${ZALO_LINK}
- Mã giảm giá: DUAN2026 (giảm 15%) và VIP50 (giảm 50% đơn từ 1.000.000₫). Freeship đơn từ 1.000.000₫. Đổi trả 30 ngày.
- Danh sách sản phẩm:
${catalog}

VII. THẺ SẢN PHẨM: Ở cuối câu trả lời, nếu có gợi ý sản phẩm, bắt buộc ghi:
[PRODUCTS: id_1, id_2]`;
};

// Gọi trực tiếp Google Gemini API từ trình duyệt (nếu người dùng nhập Key trên giao diện)
const tryCallGeminiDirect = async (rawKey, systemText, history, userMessage) => {
  const cleanKey = String(rawKey || '').replace(/['"\s]/g, '').trim();
  if (!cleanKey.startsWith('AIza')) return { success: false };

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  const contents = [];

  (history || []).slice(-14).forEach((m) => {
    if (!m?.text || !String(m.text).trim()) return;
    const role = m.sender === 'user' ? 'user' : 'model';
    const prev = contents[contents.length - 1];
    if (prev && prev.role === role) prev.parts[0].text += '\n' + m.text;
    else contents.push({ role, parts: [{ text: m.text }] });
  });

  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  const last = contents[contents.length - 1];
  if (!last || last.role !== 'user') contents.push({ role: 'user', parts: [{ text: userMessage }] });
  else if (!last.parts[0].text.includes(userMessage)) last.parts[0].text += '\n' + userMessage;

  for (const modelName of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cleanKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemText }] },
            contents,
            generationConfig: { temperature: 0.35, topP: 0.9, maxOutputTokens: 900 }
          })
        }
      );
      const data = await res.json();
      if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          success: true,
          mode: `Gemini (${modelName})`,
          rawText: data.candidates[0].content.parts[0].text
        };
      }
    } catch {
      // Thử model kế tiếp
    }
  }
  return { success: false };
};

// Trợ lý thông minh có hiểu ngữ cảnh lịch sử (Dự phòng khi chưa gắn API Key)
const generateContextAwareFallback = (userMsg, history, products) => {
  const lower = userMsg.toLowerCase();

  // 1. Kiểm tra nếu câu hỏi nằm ngoài phạm vi thời trang
  if (isOutOfScopeQuestion(userMsg)) {
    return {
      bubbles: [
        'Dạ câu hỏi này nằm ngoài phạm vi tư vấn của **DUAN.STUDIO** mất rồi ạ 😅',
        'Mình chỉ chuyên hỗ trợ tư vấn thời trang, phối đồ, chọn size và kiểm tra đơn hàng tại shop thôi. Bạn đang tìm trang phục cho **Nam** hay **Nữ** để mình gợi ý nhé!'
      ],
      cards: [],
      zaloLink: null
    };
  }

  // 2. Hỏi về mã giảm giá / voucher / khuyến mãi
  if (/mã giảm|voucher|khuyến mãi|sale|ưu đãi|giảm giá/.test(lower)) {
    return {
      bubbles: [
        'Hiện tại **DUAN.STUDIO** đang tặng 2 mã ưu đãi cực hời cho bạn đây ạ:\n• Nhập mã **DUAN2026**: Giảm ngay **15%** (tối đa 200K) cho mọi đơn hàng.\n• Nhập mã **VIP50**: Giảm tới **50%** (tối đa 500K) cho đơn hàng từ 1.000.000₫.',
        'Đặc biệt đơn từ 1.000.000₫ còn được **Freeship toàn quốc** và đổi trả miễn phí trong 30 ngày nữa nha!'
      ],
      cards: [],
      zaloLink: null
    };
  }

  // 3. Hỏi về phí ship / địa chỉ / đổi trả
  if (/địa chỉ|ở đâu|cửa hàng|showroom|đổi trả|ship|vận chuyển/.test(lower)) {
    return {
      bubbles: [
        'Showroom của **DUAN.STUDIO** nằm tại **Tầng 2, Tòa nhà Lotte Center, 54 Liễu Giai, Ba Đình, Hà Nội** (mở cửa 08:30 – 22:00) ạ.',
        'Bên mình hỗ trợ **Freeship cho đơn từ 1.000.000₫** (dưới 1 triệu phí ship 30K), nhận hàng được kiểm tra thoải mái và hỗ trợ đổi size miễn phí trong 30 ngày nhé!'
      ],
      cards: [],
      zaloLink: null
    };
  }

  // 4. Kết hợp ngữ cảnh từ các câu chat trước đó của khách
  const userHistoryText = (history || [])
    .filter((m) => m.sender === 'user')
    .map((m) => m.text)
    .join(' ')
    .toLowerCase();
  const combinedContext = `${userHistoryText} ${lower}`;

  const isFemale = /nữ|con gái|bạn gái|vợ|chị|em gái|đầm|váy/.test(combinedContext);
  const isMale =
    !isFemale && /nam|con trai|bạn trai|chồng|anh|bố|lịch lãm|sơ mi|quần tây|blazer/.test(combinedContext);

  const wMatch =
    lower.match(/(\d{2,3})\s*(?:kg|kí|ký|cân)/) ||
    combinedContext.match(/(\d{2,3})\s*(?:kg|kí|ký|cân)/);
  const hMatch =
    lower.match(/1\s*[m\.,]\s*(\d{1,2})\b/) ||
    combinedContext.match(/1\s*[m\.,]\s*(\d{1,2})\b/);

  const bubbles = [];
  if (wMatch || hMatch) {
    const w = wMatch ? parseInt(wMatch[1], 10) : 60;
    const sz = w <= 52 ? 'S' : w <= 63 ? 'M' : w <= 74 ? 'L' : 'XL';
    bubbles.push(
      `Dựa trên số đo của bạn thì mặc **Size ${sz}** tại DUAN.STUDIO là chuẩn phom và tôn dáng nhất nha! ${
        isMale
          ? 'Phom này giúp phần vai và ngực đứng dáng rất lịch lãm.'
          : isFemale
          ? 'Phom này sẽ ôm nhẹ tinh tế giúp tôn vòng eo và ăn gian chiều cao cực tốt.'
          : 'Nếu bạn thích mặc rộng rãi thoải mái thì có thể nhích lên 1 size nhé.'
      }`
    );
  }

  const list = Array.isArray(products) && products.length > 0 ? products : FALLBACK_PRODUCTS;
  let filtered = list;

  // Lọc theo dịp mặc hoặc loại trang phục khách đang tìm trong tin nhắn hiện tại
  if (/đi tiệc|dự tiệc|hẹn hò|sang trọng/.test(lower)) {
    filtered = isMale
      ? list.filter((p) => /blazer|sơ mi|quần tây|trench/i.test(p.name))
      : list.filter((p) => /đầm|lụa|satin|blazer/i.test(p.name));
  } else if (/đi chơi|dạo phố|cá tính|năng động/.test(lower)) {
    filtered = isMale
      ? list.filter((p) => /biker|hoodie|thun|jeans|polo/i.test(p.name))
      : list.filter((p) => /hoa nhí|chân váy|thun|jeans/i.test(p.name));
  } else if (isMale) {
    filtered = list.filter((p) => !/đầm|chân váy|hoa nhí/i.test(p.name));
  } else if (isFemale) {
    filtered = list.filter((p) => /đầm|váy|cardigan|trench|blazer/i.test(p.name));
  }

  if (isMale) {
    bubbles.push(
      `Mình chọn ra những thiết kế Nam hợp nhất với nhu cầu của bạn dưới đây, phom cắt may rất đứng dáng và dễ phối đồ. Bạn bấm vào từng mẫu để xem chi tiết nhé 👇`
    );
  } else if (isFemale) {
    bubbles.push(
      `Mình gợi ý cho bạn các thiết kế Nữ đang được yêu thích nhất tại shop dưới đây, chất vải lên phom cực kỳ sang và tôn dáng. Bạn ngắm thử bên dưới nhé 👇`
    );
  } else {
    bubbles.push(
      `Bên mình hiện có đủ các dòng Áo Sơ Mi, Blazer, Trench Coat, Quần Âu cho **Nam** và các mẫu Đầm Lụa Satin, Chân Váy cho **Nữ**. Bạn đang tìm đồ cho Nam hay Nữ và kèm chiều cao/cân nặng để mình tư vấn chuẩn xác nhất nhé!`
    );
  }

  const cards = filtered.slice(0, 3).map((p) => ({
    _id: p._id,
    name: p.name,
    category: p.category,
    image: p.images?.[0] || p.image || '',
    price: p.variants?.[0]?.price || p.price || 0
  }));

  return { bubbles, cards, zaloLink: null };
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [clientApiKey, setClientApiKey] = useState(
    () => localStorage.getItem('duan_ai_api_key') || import.meta.env.VITE_GEMINI_API_KEY || ''
  );
  const [aiModeLabel, setAiModeLabel] = useState('AI Stylist Trực Tuyến');
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Chào bạn nha! Mình là Minh Anh — Stylist tại **DUAN.STUDIO** 👋',
      suggestedProducts: []
    },
    {
      sender: 'bot',
      text: 'Hôm nay bạn đang tìm đồ cho **Nam** hay cho **Nữ**, và dự định mặc đi đâu để mình lựa mẫu hợp gu nhất cho bạn nhé!',
      suggestedProducts: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/products`)
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.products)
          ? res.data.products
          : [];
        if (list.length > 0) {
          setProducts(list);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-extrabold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const handleKeyInputChange = (val) => {
    const cleaned = val.replace(/['"\s]/g, '').trim();
    setClientApiKey(cleaned);
    localStorage.setItem('duan_ai_api_key', cleaned);
  };

  const extractBubblesAndCards = (rawText) => {
    let cleanReply = String(rawText || '');
    let matchedCards = [];
    let hasZalo = false;

    if (/\[HANDOFF_ZALO\]/i.test(cleanReply)) {
      hasZalo = true;
      cleanReply = cleanReply.replace(/\[HANDOFF_ZALO\]/gi, '').trim();
    }

    const tagMatch = cleanReply.match(/\[PRODUCTS:\s*([^\]]+)\]/i);
    if (tagMatch) {
      const ids = tagMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      matchedCards = products
        .filter((p) => ids.some((id) => id.includes(String(p._id)) || String(p._id).includes(id)))
        .slice(0, 4)
        .map((p) => ({
          _id: p._id,
          name: p.name,
          category: p.category,
          image: p.images?.[0] || p.image || '',
          price: p.variants?.[0]?.price || p.price || 0
        }));
      cleanReply = cleanReply.replace(/\[PRODUCTS:\s*([^\]]+)\]/gi, '').trim();
    }

    if (matchedCards.length === 0) {
      const lowerReply = cleanReply.toLowerCase();
      matchedCards = products
        .filter((p) => p.name && lowerReply.includes(p.name.toLowerCase().slice(0, 16)))
        .slice(0, 3)
        .map((p) => ({
          _id: p._id,
          name: p.name,
          category: p.category,
          image: p.images?.[0] || p.image || '',
          price: p.variants?.[0]?.price || p.price || 0
        }));
    }

    const bubbles = cleanReply
      .split(/\|\|\||\n\n+/)
      .map((b) => b.trim())
      .filter(Boolean);

    return {
      bubbles: bubbles.length > 0 ? bubbles : [cleanReply],
      cards: matchedCards,
      zaloLink: hasZalo || cleanReply.includes('zalo.me') ? ZALO_LINK : null
    };
  };

  const handleSend = async (customText) => {
    const userMsg = (customText ?? input).trim();
    if (!userMsg || isTyping) return;

    // Nếu người dùng dán thẳng mã AIzaSy... vào ô chat -> Lưu làm API Key
    if (userMsg.startsWith('AIza') && userMsg.length > 25 && !userMsg.includes(' ')) {
      handleKeyInputChange(userMsg);
      setInput('');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: '🎉 **Đã nhận và kích hoạt trực tiếp mã Gemini API Key của bạn!** Bây giờ bạn hãy nhắn bất kỳ câu hỏi nào để trò chuyện nhé!',
          suggestedProducts: []
        }
      ]);
      return;
    }

    const updatedHistory = [...messages, { sender: 'user', text: userMsg }];
    setMessages(updatedHistory);
    if (!customText) setInput('');
    setIsTyping(true);

    // 1. KIỂM TRA NHANH: Nếu khách yêu cầu liên hệ nhân viên / Zalo -> Nhảy ra nút Zalo ngay lập tức
    if (isHumanHandoffRequest(userMsg)) {
      await sleep(100);
      setAiModeLabel('Hỗ Trợ Trực Tiếp Zalo');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Dạ mình gửi bạn cổng kết nối trực tiếp với chuyên viên tư vấn và quản lý của **DUAN.STUDIO** qua Zalo (**${ZALO_PHONE}**) nhé ạ! Bạn bấm vào nút màu xanh bên dưới để mở Zalo chat ngay nha 👇`,
          suggestedProducts: [],
          zaloLink: ZALO_LINK
        }
      ]);
      setIsTyping(false);
      return;
    }

    const activeKey = (clientApiKey || localStorage.getItem('duan_ai_api_key') || '').trim();

    // 2. TẦNG 1: GỌI BACKEND API (/api/chatbot) ĐỂ CHẠY FILE backend/routes/chatbot.js
    try {
      const res = await axios.post(`${API_URL}/chatbot`, {
        message: userMsg,
        history: updatedHistory,
        clientApiKey: activeKey
      });

      const data = res.data;
      // Nếu Backend trả về câu trả lời hợp lệ (không phải thông báo thiếu API key)
      if (
        data &&
        Array.isArray(data.messages) &&
        data.messages.length > 0 &&
        !String(data.reply).includes('Chưa tìm thấy khóa') &&
        !String(data.reply).includes('báo lỗi:')
      ) {
        if (data.aiMode) setAiModeLabel(data.aiMode);
        const bubbles = data.messages;
        const cards = Array.isArray(data.suggestedProducts) ? data.suggestedProducts : [];
        const zaloUrl = data.zaloLink || (String(data.reply).includes('zalo.me') ? ZALO_LINK : null);

        for (let i = 0; i < bubbles.length; i++) {
          const isLast = i === bubbles.length - 1;
          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: bubbles[i],
              suggestedProducts: isLast ? cards : [],
              zaloLink: isLast ? zaloUrl : null
            }
          ]);
          if (!isLast) {
            setIsTyping(true);
            await sleep(100);
          }
        }
        setIsTyping(false);
        return;
      }
    } catch {
      // Nếu Backend tắt hoặc lỗi thì chuyển sang Tầng 2
    }

    // 3. TẦNG 2: GỌI TRỰC TIẾP GEMINI TỪ TRÌNH DUYỆT (NẾU CÓ KEY AIza...)
    if (activeKey.startsWith('AIza')) {
      const systemText = createStylistInstruction(products);
      const geminiRes = await tryCallGeminiDirect(activeKey, systemText, updatedHistory, userMsg);
      if (geminiRes.success) {
        setAiModeLabel(geminiRes.mode);
        const { bubbles, cards, zaloLink } = extractBubblesAndCards(geminiRes.rawText);

        for (let i = 0; i < bubbles.length; i++) {
          const isLast = i === bubbles.length - 1;
          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: bubbles[i],
              suggestedProducts: isLast ? cards : [],
              zaloLink: isLast ? zaloLink : null
            }
          ]);
          if (!isLast) {
            setIsTyping(true);
            await sleep(100);
          }
        }
        setIsTyping(false);
        return;
      }
    }

    // 4. TẦNG 3: TRỢ LÝ NGỮ CẢNH NỘI BỘ (Khi chưa nhập Gemini API Key)
    await sleep(100);
    const { bubbles, cards, zaloLink } = generateContextAwareFallback(
      userMsg,
      updatedHistory,
      products
    );
    for (let i = 0; i < bubbles.length; i++) {
      const isLast = i === bubbles.length - 1;
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: bubbles[i],
          suggestedProducts: isLast ? cards : [],
          zaloLink: isLast ? zaloLink : null
        }
      ]);
      if (!isLast) {
        setIsTyping(true);
        await sleep(110);
      }
    }
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[360px] sm:w-[410px] h-[590px] bg-white rounded-3xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header chuẩn Messenger */}
          <div className="bg-zinc-950 text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={STYLIST_AVATAR}
                  alt="Minh Anh Stylist"
                  className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700"
                />
                <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950 absolute bottom-0 right-0" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight">Minh Anh • DUAN Stylist</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {isTyping ? (
                    <span className="text-emerald-400 font-semibold animate-pulse">
                      Đang nhập tin nhắn...
                    </span>
                  ) : (
                    aiModeLabel
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={ZALO_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white transition"
                title="Chat Zalo trực tiếp với nhân viên"
              >
                 Zalo
              </a>
            
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Hộp nhập Gemini Key */}
          {showKeyConfig && (
            <div className="p-3.5 bg-indigo-950 text-white border-b border-indigo-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-indigo-200">
                  Dán Gemini Key (Tự động lưu ngay khi dán):
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(false)}
                  className="text-[10px] text-emerald-300 font-bold underline"
                >
                  Đóng khung này ✓
                </button>
              </div>
              <input
                type="text"
                value={clientApiKey}
                onChange={(e) => handleKeyInputChange(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-zinc-900 border border-indigo-400 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
              />
            </div>
          )}

          {/* Danh sách tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f5f5f7] text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className="space-y-2 animate-fadeIn">
                <div
                  className={`flex items-end gap-2 ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.sender === 'bot' && (
                    <img
                      src={STYLIST_AVATAR}
                      alt="Bot"
                      className="w-7 h-7 rounded-full object-cover border border-zinc-300 shrink-0 mb-0.5"
                    />
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl leading-relaxed whitespace-pre-line text-xs sm:text-[13px] ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white border border-zinc-200/80 text-zinc-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {renderFormattedText(m.text)}
                  </div>
                </div>

                {/* Nút bấm chuyển tiếp sang Zalo khi khách cần gặp nhân viên */}
                {m.sender === 'bot' && m.zaloLink && (
                  <div className="pl-9 pt-1">
                    <a
                      href={m.zaloLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0068ff] hover:bg-[#0052cc] text-white text-xs font-extrabold shadow-md transition transform hover:scale-[1.02]"
                    >
                      <span> Nhấn để Chat Zalo với Nhân viên ({ZALO_PHONE})</span>
                      <span>→</span>
                    </a>
                  </div>
                )}

                {/* Thẻ sản phẩm gợi ý */}
                {m.sender === 'bot' && m.suggestedProducts?.length > 0 && (
                  <div className="pl-9 space-y-1.5 pt-1">
                    <div className="flex gap-2.5 overflow-x-auto pb-1.5">
                      {m.suggestedProducts.map((prod) => (
                        <div
                          key={prod._id}
                          onClick={() => navigate(`/product/${prod._id}`)}
                          className="shrink-0 w-44 bg-white rounded-2xl border border-zinc-200 hover:border-zinc-950 overflow-hidden cursor-pointer transition shadow-sm group"
                        >
                          <div className="aspect-[4/4] bg-zinc-100 overflow-hidden">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                          <div className="p-2.5">
                            <p className="text-[11px] font-bold text-zinc-900 truncate">
                              {prod.name}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-black text-indigo-600">
                                {prod.price?.toLocaleString('vi-VN')} ₫
                              </span>
                              <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-950">
                                Xem →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Bong bóng 3 chấm đang nhập */}
            {isTyping && (
              <div className="flex items-end gap-2 justify-start animate-fadeIn">
                <img
                  src={STYLIST_AVATAR}
                  alt="Typing"
                  className="w-7 h-7 rounded-full object-cover border border-zinc-300 shrink-0"
                />
                <div className="bg-white border border-zinc-200/80 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                    style={{ animationDelay: '160ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                    style={{ animationDelay: '320ms' }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 bg-white border-t border-zinc-100 flex gap-1.5 overflow-x-auto">
            {QUICK_PROMPTS.map((q, i) => (
              <button
                key={i}
                type="button"
                disabled={isTyping}
                onClick={() => handleSend(q)}
                className="shrink-0 text-[11px] font-medium bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-700 px-3 py-1.5 rounded-full transition disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhắn tin như trên Messenger..."
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-zinc-100 rounded-full focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white rounded-full text-xs font-extrabold transition shrink-0"
            >
              Gửi
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-zinc-950 hover:bg-zinc-800 text-white pl-3 pr-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <img
              src={STYLIST_AVATAR}
              alt="Stylist"
              className="w-9 h-9 rounded-full object-cover border border-white/30"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-zinc-950 absolute bottom-0 right-0" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-emerald-400 font-bold block leading-none">
              Stylist đang trực tuyến
            </span>
            <span className="text-xs font-extrabold tracking-wide">Chat Tư Vấn Đồ Nam / Nữ</span>
          </div>
        </button>
      )}
    </div>
  );
}