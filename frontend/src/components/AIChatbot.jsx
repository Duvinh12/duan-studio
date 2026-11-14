import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STYLIST_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

const QUICK_PROMPTS = [
  'Mình là Nam, 1m72 68kg tư vấn đồ đi làm',
  'Mình là Nữ, 1m58 48kg tìm đầm đi tiệc',
  'Mình là Nam muốn tìm đồ đi chơi cá tính',
  'Shop có mã giảm giá nào không?'
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Danh sách 20 sản phẩm dự phòng ngay trên trình duyệt (đề phòng trường hợp Backend tắt)
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

// Xây dựng giáo trình nghiệp vụ Stylist đầy đủ cho AI
const createStylistInstruction = (products) => {
  const listToUse = products && products.length > 0 ? products : FALLBACK_PRODUCTS;
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

  return `Bạn là Minh Anh — Chuyên viên Tư vấn Thời trang (Personal Stylist) tại thương hiệu DUAN.STUDIO.
Bạn đang trực tiếp nhắn tin với khách hàng trên Messenger.

QUY TẮC TRÒ CHUYỆN & NGHIỆP VỤ BẮT BUỘC:
1. Trò chuyện tự nhiên, thông minh, linh hoạt 100% như một người thật. Xưng "mình" - gọi "bạn" (hoặc "em - anh/chị"). Tuyệt đối KHÔNG liệt kê gạch đầu dòng cứng nhắc kiểu robot.
2. Để tin nhắn hiển thị thành từng bong bóng ngắn giống Messenger, hãy dùng ký hiệu "|||" để ngắt giữa 2 đoạn ngắn (mỗi lần trả lời từ 1 đến 2 bong bóng ngắn).
3. Nghiệp vụ Giới tính (Cực kỳ quan trọng):
   - Nếu khách là NAM (hoặc mua cho bạn trai, chồng, bố): Chỉ tư vấn đồ Nam/Unisex (Áo Sơ Mi Oxford, Áo Polo dệt kim, Sơ mi Cuban, Sơ mi Flannel, Quần Tây xếp ly, Quần Jeans, Quần Cargo, Blazer, Trench Coat, Áo da Biker, Bomber Varsity, Áo Phao Puffer, Hoodie, Áo Thun). TUYỆT ĐỐI KHÔNG BAO GIỜ gợi ý Đầm hay Chân váy cho khách Nam.
   - Nếu khách là NỮ (hoặc mua cho bạn gái, vợ, mẹ): Ưu tiên gợi ý Đầm Lụa Satin Đỏ Rượu, Đầm Hoa Nhí Parisian, Đầm Đen Little Black Dress, Chân Váy Xếp Ly Tennis, Áo Len Cardigan Nâu, Trench Coat, Blazer.
4. Nghiệp vụ Bảng Size:
   - Size S: 1m50-1m62, 42-52kg | Size M: 1m60-1m70, 53-63kg | Size L: 1m68-1m77, 64-74kg | Size XL: >1m75, 75-88kg.
   - Nếu khách thấp nhưng nặng cân / có bụng: Khuyên lấy theo cân nặng để vừa bụng và báo shop hỗ trợ cắt ngắn lai miễn phí.
5. Chính sách & Ưu đãi của DUAN.STUDIO:
   - Showroom: Tầng 2 Lotte Center, 54 Liễu Giai, Hà Nội. Hotline: 1900 6868.
   - Mã giảm giá: DUAN2026 (giảm 15% mọi đơn) và VIP50 (giảm 50% đơn từ 1.000.000₫). Freeship toàn quốc đơn từ 1.000.000₫. Đổi trả miễn phí 30 ngày.
6. Danh sách sản phẩm trong kho:
${catalog}

7. HIỂN THỊ THẺ SẢN PHẨM: Ở cuối cùng câu trả lời, nếu bạn có gợi ý sản phẩm cụ thể trong kho, hãy ghi thêm dòng ẩn:
[PRODUCTS: id_1, id_2] (lấy đúng mã ID trong ngoặc vuông [ID: ...] ở trên, tối đa 3 mã).`;
};

// TẦNG 1: Gọi trực tiếp Google Gemini API (nếu có mã AIzaSy...)
let browserCachedModels = null;
const tryCallGeminiDirect = async (rawKey, systemText, history, userMessage) => {
  const cleanKey = String(rawKey || '').replace(/['"\s]/g, '').trim();
  if (!cleanKey.startsWith('AIza')) return { success: false };

  let models = browserCachedModels || ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
  if (!browserCachedModels) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.models)) {
        const valid = data.models
          .filter(
            (m) =>
              Array.isArray(m.supportedGenerationMethods) &&
              m.supportedGenerationMethods.includes('generateContent') &&
              m.name.includes('gemini') &&
              !m.name.includes('vision') &&
              !m.name.includes('embedding') &&
              !m.name.includes('imagen') &&
              !m.name.includes('1.5')
          )
          .map((m) => m.name.replace('models/', ''));
        if (valid.length > 0) {
          browserCachedModels = valid;
          models = valid;
        }
      }
    } catch {
      // Dùng danh sách mặc định
    }
  }

  const contents = [
    { role: 'user', parts: [{ text: `HƯỚNG DẪN HỆ THỐNG:\n${systemText}\n\nHãy bắt đầu đóng vai Minh Anh.` }] },
    { role: 'model', parts: [{ text: 'Mình đã nắm rõ nghiệp vụ của DUAN.STUDIO!' }] }
  ];

  (history || []).slice(-8).forEach((m) => {
    if (!m?.text || !String(m.text).trim()) return;
    const role = m.sender === 'user' ? 'user' : 'model';
    const prev = contents[contents.length - 1];
    if (prev.role === role) prev.parts[0].text += '\n' + m.text;
    else contents.push({ role, parts: [{ text: m.text }] });
  });

  const last = contents[contents.length - 1];
  if (last.role !== 'user') contents.push({ role: 'user', parts: [{ text: userMessage }] });
  else if (!last.parts[0].text.includes(userMessage)) last.parts[0].text += '\n' + userMessage;

  for (const modelName of models.slice(0, 4)) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cleanKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.85, maxOutputTokens: 900 }
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

// TẦNG 2: Gọi cổng AI LLM Miễn Phí Không Cần API Key (Hoạt động 100% ngay lập tức như Gemini/ChatGPT)
const tryCallZeroKeyCloudLLM = async (systemText, history, userMessage) => {
  try {
    const messages = [{ role: 'system', content: systemText }];
    (history || []).slice(-8).forEach((m) => {
      if (m?.text && String(m.text).trim()) {
        messages.push({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: String(m.text).trim()
        });
      }
    });
    messages.push({ role: 'user', content: userMessage });

    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages,
        temperature: 0.8
      })
    });

    const data = await res.json();
    const replyContent = data?.choices?.[0]?.message?.content;
    if (res.ok && replyContent && replyContent.trim().length > 5) {
      return {
        success: true,
        mode: 'AI Stylist LLM (Live)',
        rawText: replyContent.trim()
      };
    }
  } catch {
    // Bỏ qua nếu mạng chặn
  }
  return { success: false };
};

// TẦNG 3: Trợ lý hội thoại thông minh theo Giới tính & Số đo (Dự phòng khi mất mạng Internet)
const generateLocalStylistBubbles = (userMsg, products) => {
  const lower = userMsg.toLowerCase();
  const isFemale = /nữ|con gái|bạn gái|vợ|chị|em gái|đầm|váy/.test(lower);
  const isMale = !isFemale && /nam|con trai|bạn trai|chồng|anh|bố|lịch lãm|sơ mi|quần tây|blazer/.test(lower);

  const wMatch = lower.match(/(\d{2,3})\s*(?:kg|kí|ký|cân)/) || lower.match(/nặng\s*(\d{2,3})/);
  const hMatch = lower.match(/1\s*[m\.,]\s*(\d{1,2})\b/) || lower.match(/(1\d{2})\s*cm/);

  const bubbles = [];
  if (wMatch || hMatch) {
    const w = wMatch ? parseInt(wMatch[1], 10) : 60;
    const sz = w <= 52 ? 'S' : w <= 63 ? 'M' : w <= 74 ? 'L' : 'XL';
    bubbles.push(
      `Với số đo bạn vừa nhắn thì mặc **Size ${sz}** bên mình là vừa vặn và tôn dáng nhất nha! ${
        isMale
          ? 'Phom này giúp phần vai và ngực đứng dáng cực kỳ nam tính.'
          : isFemale
          ? 'Phom này sẽ ôm nhẹ vòng eo giúp cơ thể trông thanh thoát hơn.'
          : 'Nếu bạn thích mặc rộng rãi thoải mái thì có thể nhích lên 1 size nhé.'
      }`
    );
  }

  const list = products && products.length > 0 ? products : FALLBACK_PRODUCTS;
  let filtered = list;
  if (isMale) {
    filtered = list.filter((p) => !/đầm|chân váy|hoa nhí/i.test(p.name));
    bubbles.push(
      `Với Nam thì mình gợi ý bạn phối **Áo Sơ Mi Oxford Oversized Trắng (490.000 ₫)** cùng **Quần Tây Pleated Wide-Leg Xám (680.000 ₫)** hoặc khoác thêm **Áo Blazer Đen (1.290.000 ₫)** nhé, vừa lịch lãm đi làm vừa bảnh bao khi đi tiệc luôn! Mình gửi hình ở dưới cho bạn xem thử nha 👇`
    );
  } else if (isFemale) {
    filtered = list.filter((p) => /đầm|váy|cardigan|trench|blazer/i.test(p.name));
    bubbles.push(
      `Với Nữ thì mẫu **Đầm Lụa Satin Midi Đỏ Rượu (890.000 ₫)** và **Đầm Hoa Nhí Chiffon Parisian (750.000 ₫)** đang được các chị em mê nhất tuần này đó ạ! Chất vải lên phom cực kỳ sang và tôn da, nàng ngắm thử hình bên dưới nhé 👇`
    );
  } else {
    bubbles.push(
      `Bên mình hiện có đủ các dòng Áo Sơ Mi, Áo Khoác Blazer, Trench Coat, Quần Âu cho Nam và các mẫu Đầm Lụa Satin, Chân Váy cho Nữ. Bạn đang nhắm đồ cho **Nam** hay **Nữ** và mặc đi dịp nào để mình lên set chuẩn gu cho bạn nhé!`
    );
  }

  const cards = filtered.slice(0, 3).map((p) => ({
    _id: p._id,
    name: p.name,
    category: p.category,
    image: p.images?.[0] || p.image || '',
    price: p.variants?.[0]?.price || p.price || 0
  }));

  return { bubbles, cards };
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
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
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

  // Tự động lưu Key ngay khi gõ hoặc dán vào ô mà không cần phải bấm nút Lưu
  const handleKeyInputChange = (val) => {
    const cleaned = val.replace(/['"\s]/g, '').trim();
    setClientApiKey(cleaned);
    localStorage.setItem('duan_ai_api_key', cleaned);
    browserCachedModels = null;
  };

  // Bóc tách thẻ [PRODUCTS: id1, id2] từ câu trả lời của AI
  const extractBubblesAndCards = (rawText) => {
    let cleanReply = String(rawText || '');
    let matchedCards = [];

    const tagMatch = cleanReply.match(/\[PRODUCTS:\s*([^\]]+)\]/i);
    if (tagMatch) {
      const ids = tagMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      matchedCards = products
        .filter((p) => ids.includes(String(p._id)))
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

    // Nếu AI nhắc tên sản phẩm trong văn bản mà quên gắn tag [PRODUCTS:...] thì tự động tìm thẻ ảnh tương ứng
    if (matchedCards.length === 0) {
      const lowerReply = cleanReply.toLowerCase();
      matchedCards = products
        .filter((p) => lowerReply.includes(p.name.toLowerCase().slice(0, 15)))
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
      cards: matchedCards
    };
  };

  const handleSend = async (customText) => {
    const userMsg = (customText ?? input).trim();
    if (!userMsg || isTyping) return;

    // Nếu người dùng dán thẳng mã AIzaSy... vào ô chat dưới cùng -> Tự động nhận làm API Key luôn!
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

    const systemText = createStylistInstruction(products);
    const activeKey = (clientApiKey || localStorage.getItem('duan_ai_api_key') || '').trim();

    let aiResult = { success: false };

    // 1. Thử gọi trực tiếp Google Gemini nếu có Key AIza...
    if (activeKey.startsWith('AIza')) {
      const [geminiRes] = await Promise.all([
        tryCallGeminiDirect(activeKey, systemText, updatedHistory, userMsg),
        sleep(650)
      ]);
      if (geminiRes.success) aiResult = geminiRes;
    }

    // 2. Nếu chưa có Key hoặc Key Gemini lỗi -> Tự động gọi cổng AI LLM Miễn Phí Không Cần Key (Trả lời thông minh như Gemini 100%)
    if (!aiResult.success) {
      const [cloudRes] = await Promise.all([
        tryCallZeroKeyCloudLLM(systemText, updatedHistory, userMsg),
        sleep(650)
      ]);
      if (cloudRes.success) aiResult = cloudRes;
    }

    // 3. Hiển thị từng bong bóng tin nhắn kiểu Messenger
    if (aiResult.success) {
      setAiModeLabel(aiResult.mode);
      const { bubbles, cards } = extractBubblesAndCards(aiResult.rawText);

      for (let i = 0; i < bubbles.length; i++) {
        const isLast = i === bubbles.length - 1;
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: bubbles[i],
            suggestedProducts: isLast ? cards : []
          }
        ]);
        if (!isLast) {
          setIsTyping(true);
          await sleep(650);
        }
      }
    } else {
      // 4. Dự phòng cuối cùng khi máy tính đứt cáp Internet hoàn toàn
      const { bubbles, cards } = generateLocalStylistBubbles(userMsg, products);
      for (let i = 0; i < bubbles.length; i++) {
        const isLast = i === bubbles.length - 1;
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: bubbles[i],
            suggestedProducts: isLast ? cards : []
          }
        ]);
        if (!isLast) {
          setIsTyping(true);
          await sleep(600);
        }
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
              <button
                type="button"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-[10px] font-bold text-zinc-200 transition"
              >
                ⚙️ AI Key
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Hộp nhập Gemini Key (Tùy chọn - Tự lưu ngay khi dán) */}
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
                placeholder="AIzaSy... (Không bắt buộc vì đã có sẵn Cloud AI)"
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

            {/* Bong bóng 3 chấm đang nhập giống Messenger */}
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