const API_URL = (import.meta.env.VITE_API_URL || 'https://duan-studio.onrender.com/api').replace(/\/$/, '');
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Tá»± Ä‘á»™ng chuáº©n hÃ³a API_URL
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const RAW_API_URL = isLocalhost
  ? 'http://localhost:5000/api'
  : import.meta.env.VITE_API_URL || 'https://duan-studio.onrender.com/api';

// Cáº¤U HÃŒNH Sá» ÄIá»†N THOáº I & LINK ZALO Cá»¦A Báº N Táº I ÄÃ‚Y
const ZALO_PHONE = '0978240104'; 
const ZALO_LINK = `https://zalo.me/${ZALO_PHONE}`;

const STYLIST_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

const QUICK_PROMPTS = [
  'MÃ¬nh lÃ  Nam, 1m72 68kg tÆ° váº¥n Ä‘á»“ Ä‘i lÃ m',
  'MÃ¬nh lÃ  Ná»¯, 1m58 48kg tÃ¬m Ä‘áº§m Ä‘i tiá»‡c',
  'Shop cÃ³ mÃ£ giáº£m giÃ¡ nÃ o khÃ´ng?',
  'Cho mÃ¬nh liÃªn há»‡ nhÃ¢n viÃªn qua Zalo'
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Danh sÃ¡ch sáº£n pháº©m dá»± phÃ²ng trÃªn trÃ¬nh duyá»‡t
const FALLBACK_PRODUCTS = [
  { _id: 'p1', name: 'Ão SÆ¡ Mi Oxford Oversized Tráº¯ng', category: 'Ão SÆ¡ Mi', price: 490000, colors: 'Tráº¯ng, Xanh Pastel', sizes: 'S, M, L', desc: '100% cotton há»¯u cÆ¡ chá»‘ng nhÄƒn, phom rá»™ng lá»‹ch lÃ£m', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p2', name: 'Ão KhoÃ¡c Trench Coat DÃ¡ng DÃ i Beige', category: 'Ão KhoÃ¡c', price: 1450000, colors: 'Beige', sizes: 'M, L', desc: 'Váº£i Gabardine trÆ°á»£t nÆ°á»›c nháº¹, Ä‘ai tháº¯t eo cá»• Ä‘iá»ƒn', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p3', name: 'Ão Thun Heavyweight Boxy Studio Äen', category: 'Ão Thun', price: 350000, colors: 'Äen Washed', sizes: 'M, L', desc: 'Cotton 280gsm dÃ y dáº·n, phom Boxy tÃ´n chiá»u cao', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p4', name: 'Äáº§m Lá»¥a Satin Midi Minimalist Äá» RÆ°á»£u', category: 'Äáº§m Ná»¯', price: 890000, colors: 'Äá» RÆ°á»£u', sizes: 'S, M', desc: 'Lá»¥a Satin bÃ³ng nháº¹ sang trá»ng, cáº¯t chÃ©o tÃ´n dÃ¡ng', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p5', name: 'Quáº§n TÃ¢y Pleated Wide-Leg Tailored XÃ¡m', category: 'Quáº§n', price: 680000, colors: 'XÃ¡m KhÃ³i, Äen', sizes: 'M, L', desc: 'Quáº§n Ã¢u xáº¿p ly Ä‘Ã´i á»‘ng suÃ´ng rá»™ng Sartorial', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p6', name: 'Ão Blazer Cáº¥u TrÃºc Double-Breasted Äen', category: 'Ão KhoÃ¡c', price: 1290000, colors: 'Äen Tuyá»n', sizes: 'M, L', desc: 'Blazer 2 hÃ ng khuy Ä‘á»™n vai vá»«a pháº£i thanh lá»‹ch', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p7', name: 'Ão Hoodie Ná»‰ BÃ´ng Essential XÃ¡m Melange', category: 'Ão KhoÃ¡c', price: 620000, colors: 'XÃ¡m Melange', sizes: 'M, L', desc: 'Ná»‰ cotton 420gsm dÃ y áº¥m, mÅ© 2 lá»›p Ä‘á»©ng form', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p8', name: 'Ão Polo Dá»‡t Kim Knitwear Cá»• Äiá»ƒn Kem', category: 'Ão Thun', price: 540000, colors: 'Kem Sá»¯a, Xanh RÃªu', sizes: 'M, L', desc: 'Len dá»‡t kim sá»£i máº£nh phong cÃ¡ch Old Money', image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p9', name: 'Quáº§n Jeans Selvedge Denim á»ng SuÃ´ng Xanh', category: 'Quáº§n', price: 790000, colors: 'Indigo Raw', sizes: 'M, L', desc: 'Denim Nháº­t Báº£n 14oz bá»n bá»‰, Ä‘á»©ng á»‘ng', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p10', name: 'Ão KhoÃ¡c Da Biker Jacket Vintage Äen', category: 'Ão KhoÃ¡c', price: 1590000, colors: 'Äen BÃ³ng', sizes: 'M, L', desc: 'Da tá»•ng há»£p cao cáº¥p chá»‘ng bong trÃ³c, khÃ³a YKK', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p11', name: 'Äáº§m Hoa NhÃ­ Chiffon Tay Phá»“ng Parisian', category: 'Äáº§m Ná»¯', price: 750000, colors: 'Tráº¯ng Hoa NhÃ­', sizes: 'S, M', desc: 'Voan Chiffon 2 lá»›p má»m máº¡i phong cÃ¡ch PhÃ¡p', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p12', name: 'ChÃ¢n VÃ¡y Xáº¿p Ly Tennis Skirt NÄƒng Äá»™ng', category: 'Quáº§n', price: 390000, colors: 'Tráº¯ng, Äen', sizes: 'S, M', desc: 'Cáº¡p cao tÃ´n chÃ¢n dÃ i kÃ¨m quáº§n báº£o há»™ bÃªn trong', image: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=600&q=80' }
];

// 1. Nháº­n diá»‡n yÃªu cáº§u liÃªn há»‡ nhÃ¢n viÃªn / Zalo
const isHumanHandoffRequest = (text) => {
  const lower = String(text).toLowerCase();
  const keywords = [
    'gáº·p nhÃ¢n viÃªn',
    'liÃªn há»‡ nhÃ¢n viÃªn',
    'nhÃ¢n viÃªn tÆ° váº¥n',
    'gáº·p ngÆ°á»i tháº­t',
    'tÆ° váº¥n viÃªn',
    'gáº·p chá»§ shop',
    'gáº·p admin',
    'gáº·p quáº£n lÃ½',
    'nÃ³i chuyá»‡n vá»›i ngÆ°á»i',
    'chat vá»›i ngÆ°á»i',
    'xin zalo',
    'káº¿t báº¡n zalo',
    'liÃªn há»‡ zalo',
    'sá»‘ zalo',
    'link zalo',
    'qua zalo',
    'zalo shop',
    'sá»‘ Ä‘iá»‡n thoáº¡i shop',
    'hotline'
  ];
  return keywords.some((kw) => lower.includes(kw));
};

// 2. Nháº­n diá»‡n cÃ¢u há»i ngoÃ i pháº¡m vi tÆ° váº¥n thá»i trang
const isOutOfScopeQuestion = (text) => {
  const lower = String(text).toLowerCase();
  // Náº¿u cÃ³ tá»« khÃ³a liÃªn quan tá»›i quáº§n Ã¡o/shop thÃ¬ khÃ´ng cháº·n
  if (
    /Ã¡o|quáº§n|Ä‘áº§m|vÃ¡y|size|mÃ u|giÃ¡|ship|giao hÃ ng|Ä‘á»•i tráº£|voucher|mÃ£ giáº£m|khuyáº¿n mÃ£i|Ä‘Æ¡n hÃ ng|shop|máº·c|phá»‘i|tÆ° váº¥n|nam|ná»¯|cao|náº·ng|kg|m\d/i.test(
      lower
    )
  ) {
    return false;
  }

  const outOfScopePatterns = [
    /\d+\s*[\+\-\*\/]\s*\d+/, // phÃ©p toÃ¡n 1+1, 5*6...
    /báº±ng máº¥y|tÃ­nh tÃ­ch phÃ¢n|giáº£i phÆ°Æ¡ng trÃ¬nh|Ä‘áº¡o hÃ m|hÃ¬nh há»c/,
    /viáº¿t code|láº­p trÃ¬nh|javascript|python|react|html|css|c\+\+|java|sql|thuáº­t toÃ¡n/,
    /thá»i tiáº¿t|mÆ°a khÃ´ng|náº¯ng khÃ´ng|nhiá»‡t Ä‘á»™ hÃ´m nay/,
    /tá»•ng thá»‘ng|chÃ­nh trá»‹|chiáº¿n tranh|á»§n|biden|trump|chá»©ng khoÃ¡n|bitcoin|crypto|cá»• phiáº¿u|giÃ¡ vÃ ng|tá»· giÃ¡/,
    /náº¥u Äƒn|cÃ¡ch náº¥u|cÃ´ng thá»©c mÃ³n|phá»Ÿ|bÃºn bÃ²/,
    /bÃ³ng Ä‘Ã¡|ngoáº¡i háº¡ng anh|world cup|tá»· sá»‘|mu vs|real madrid/,
    /viáº¿t vÄƒn|lÃ m thÆ¡|ká»ƒ chuyá»‡n|á»‹ch sá»­|Ä‘á»‹a lÃ½|thá»§ Ä‘Ã´ cá»§a|ai phÃ¡t minh/,
    /thuá»‘c trá»‹|bá»‡nh viá»‡n|Ä‘au bá»¥ng|Ä‘au Ä‘áº§u|triá»‡u chá»©ng/
  ];

  return outOfScopePatterns.some((regex) => regex.test(lower));
};

// XÃ¢y dá»±ng giÃ¡o trÃ¬nh nghiá»‡p vá»¥ Stylist Ä‘áº§y Ä‘á»§ cho AI
const createStylistInstruction = (products) => {
  const listToUse = Array.isArray(products) && products.length > 0 ? products : FALLBACK_PRODUCTS;
  const catalog = listToUse
    .map((p) => {
      const price = (p.variants?.[0]?.price || p.price || 0).toLocaleString('vi-VN');
      const colors = p.variants
        ? [...new Set(p.variants.map((v) => v.color))].join(', ')
        : p.colors || 'TiÃªu chuáº©n';
      const sizes = p.variants
        ? [...new Set(p.variants.map((v) => v.size))].join(', ')
        : p.sizes || 'S, M, L';
      return `- [ID: ${p._id}] "${p.name}" (${p.category}) | GiÃ¡: ${price}â‚« | MÃ u: ${colors} | Size: ${sizes} | MÃ´ táº£: ${p.description || p.desc}`;
    })
    .join('\n');

  return `Báº¡n lÃ  Minh Anh â€” ChuyÃªn viÃªn TÆ° váº¥n Thá»i trang (Personal Stylist) Ä‘á»™c quyá»n táº¡i thÆ°Æ¡ng hiá»‡u DUAN.STUDIO.

I. QUY Táº®C PHáº M VI TRáº¢ Lá»œI (GUARDRAILS - Báº®T BUá»˜C):
1. Báº¡n CHá»ˆ tráº£ lá»i cÃ¡c cÃ¢u há»i vá»: tÆ° váº¥n trang phá»¥c, phá»‘i Ä‘á»“, chá»n size, cháº¥t liá»‡u, giÃ¡ cáº£, tá»“n kho, mÃ£ giáº£m giÃ¡, váº­n chuyá»ƒn, Ä‘á»•i tráº£, Ä‘á»‹a chá»‰ vÃ  Ä‘Æ¡n hÃ ng táº¡i DUAN.STUDIO.
2. Náº¾U khÃ¡ch há»i Báº¤T Ká»² chá»§ Ä‘á» nÃ o NGOÃ€I PHáº M VI trÃªn (vÃ­ dá»¥: giáº£i toÃ¡n, láº­p trÃ¬nh, thá»i tiáº¿t, chÃ­nh trá»‹, lá»‹ch sá»­, náº¥u Äƒn, bÃ³ng Ä‘Ã¡, y táº¿, dá»‹ch thuáº­t, hoáº·c sáº£n pháº©m khÃ´ng pháº£i thá»i trang):
   - TUYá»†T Äá»I KHÃ”NG tráº£ lá»i cÃ¢u há»i Ä‘Ã³.
   - HÃ£y tá»« chá»‘i lá»‹ch sá»±: "Dáº¡ cÃ¢u há»i nÃ y náº±m ngoÃ i pháº¡m vi tÆ° váº¥n cá»§a DUAN.STUDIO máº¥t rá»“i áº¡ ðŸ˜… MÃ¬nh chá»‰ chuyÃªn há»— trá»£ tÆ° váº¥n thá»i trang, chá»n size, phá»‘i Ä‘á»“ vÃ  kiá»ƒm tra Ä‘Æ¡n hÃ ng táº¡i shop thÃ´i. Báº¡n Ä‘ang tÃ¬m máº«u Ã¡o, quáº§n hay Ä‘áº§m nÃ o Ä‘á»ƒ mÃ¬nh gá»£i Ã½ nhÃ©!"

II. QUY Táº®C CHUYá»‚N TIáº¾P ZALO NHÃ‚N VIÃŠN:
- Khi khÃ¡ch muá»‘n gáº·p nhÃ¢n viÃªn tháº­t, gáº·p chá»§ shop, khiáº¿u náº¡i hoáº·c xin Zalo/Hotline: má»i khÃ¡ch báº¥m vÃ o Zalo ${ZALO_LINK} (SÄT: ${ZALO_PHONE}) vÃ  ghi tháº» [HANDOFF_ZALO] á»Ÿ cuá»‘i cÃ¢u.

III. KHáº¢ NÄ‚NG GHI NHá»š NGá»® Cáº¢NH & TÆ¯ Váº¤N Há»¢P LÃ:
- Äá»c ká»¹ lá»‹ch sá»­ chat Ä‘á»ƒ nhá»› giá»›i tÃ­nh, chiá»u cao, cÃ¢n náº·ng, dá»‹p máº·c vÃ  ngÃ¢n sÃ¡ch khÃ¡ch Ä‘Ã£ nÃ³i á»Ÿ cÃ¡c cÃ¢u trÆ°á»›c. KhÃ´ng há»i láº¡i thÃ´ng tin khÃ¡ch Ä‘Ã£ cho.
- Giáº£i thÃ­ch ngáº¯n gá»n vÃ¬ sao sáº£n pháº©m Ä‘Ã³ há»£p vá»›i khÃ¡ch vÃ  bÃ¡o luÃ´n size chuáº©n.
- DÃ¹ng kÃ½ hiá»‡u "|||" Ä‘á»ƒ tÃ¡ch tá»‘i Ä‘a 2 bong bÃ³ng tin nháº¯n ngáº¯n giá»‘ng Messenger.

IV. PHÃ‚N BIá»†T Äá»’ NAM & Ná»®:
- KhÃ¡ch NAM: Chá»‰ gá»£i Ã½ Ão SÆ¡ Mi Oxford/Cuban/Flannel, Polo, Quáº§n TÃ¢y/Jeans/Cargo, Blazer, Trench Coat, Biker, Bomber, Puffer, Hoodie, Ão Thun. Tuyá»‡t Ä‘á»‘i KHÃ”NG gá»£i Ã½ Äáº§m/ChÃ¢n vÃ¡y cho Nam.
- KhÃ¡ch Ná»®: Æ¯u tiÃªn Äáº§m Lá»¥a Satin Äá» RÆ°á»£u, Äáº§m Hoa NhÃ­ Parisian, Äáº§m Little Black Dress, ChÃ¢n VÃ¡y Tennis, Cardigan, Trench Coat, Blazer.

V. Báº¢NG SIZE:
- Size S: 1m50-1m62, 42-52kg | Size M: 1m60-1m70, 53-63kg | Size L: 1m68-1m77, 64-74kg | Size XL: >1m75, 75-88kg.

VI. CHÃNH SÃCH & KHO HÃ€NG:
- Showroom: Táº§ng 2 Lotte Center, 54 Liá»…u Giai, HÃ  Ná»™i. Hotline: 1900 6868 | Zalo: ${ZALO_LINK}
- MÃ£ giáº£m giÃ¡: DUAN2026 (giáº£m 15%) vÃ  VIP50 (giáº£m 50% Ä‘Æ¡n tá»« 1.000.000â‚«). Freeship Ä‘Æ¡n tá»« 1.000.000â‚«. Äá»•i tráº£ 30 ngÃ y.
- Danh sÃ¡ch sáº£n pháº©m:
${catalog}

VII. THáºº Sáº¢N PHáº¨M: á»ž cuá»‘i cÃ¢u tráº£ lá»i, náº¿u cÃ³ gá»£i Ã½ sáº£n pháº©m, báº¯t buá»™c ghi:
[PRODUCTS: id_1, id_2]`;
};

// Gá»i trá»±c tiáº¿p Google Gemini API tá»« trÃ¬nh duyá»‡t (náº¿u ngÆ°á»i dÃ¹ng nháº­p Key trÃªn giao diá»‡n)
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
      // Thá»­ model káº¿ tiáº¿p
    }
  }
  return { success: false };
};

// Trá»£ lÃ½ thÃ´ng minh cÃ³ hiá»ƒu ngá»¯ cáº£nh lá»‹ch sá»­ (Dá»± phÃ²ng khi chÆ°a gáº¯n API Key)
const generateContextAwareFallback = (userMsg, history, products) => {
  const lower = userMsg.toLowerCase();

  // 1. Kiá»ƒm tra náº¿u cÃ¢u há»i náº±m ngoÃ i pháº¡m vi thá»i trang
  if (isOutOfScopeQuestion(userMsg)) {
    return {
      bubbles: [
        'Dáº¡ cÃ¢u há»i nÃ y náº±m ngoÃ i pháº¡m vi tÆ° váº¥n cá»§a **DUAN.STUDIO** máº¥t rá»“i áº¡ ðŸ˜…',
        'MÃ¬nh chá»‰ chuyÃªn há»— trá»£ tÆ° váº¥n thá»i trang, phá»‘i Ä‘á»“, chá»n size vÃ  kiá»ƒm tra Ä‘Æ¡n hÃ ng táº¡i shop thÃ´i. Báº¡n Ä‘ang tÃ¬m trang phá»¥c cho **Nam** hay **Ná»¯** Ä‘á»ƒ mÃ¬nh gá»£i Ã½ nhÃ©!'
      ],
      cards: [],
      zaloLink: null
    };
  }

  // 2. Há»i vá» mÃ£ giáº£m giÃ¡ / voucher / khuyáº¿n mÃ£i
  if (/mÃ£ giáº£m|voucher|khuyáº¿n mÃ£i|sale|Æ°u Ä‘Ã£i|giáº£m giÃ¡/.test(lower)) {
    return {
      bubbles: [
        'Hiá»‡n táº¡i **DUAN.STUDIO** Ä‘ang táº·ng 2 mÃ£ Æ°u Ä‘Ã£i cá»±c há»i cho báº¡n Ä‘Ã¢y áº¡:\nâ€¢ Nháº­p mÃ£ **DUAN2026**: Giáº£m ngay **15%** (tá»‘i Ä‘a 200K) cho má»i Ä‘Æ¡n hÃ ng.\nâ€¢ Nháº­p mÃ£ **VIP50**: Giáº£m tá»›i **50%** (tá»‘i Ä‘a 500K) cho Ä‘Æ¡n hÃ ng tá»« 1.000.000â‚«.',
        'Äáº·c biá»‡t Ä‘Æ¡n tá»« 1.000.000â‚« cÃ²n Ä‘Æ°á»£c **Freeship toÃ n quá»‘c** vÃ  Ä‘á»•i tráº£ miá»…n phÃ­ trong 30 ngÃ y ná»¯a nha!'
      ],
      cards: [],
      zaloLink: null
    };
  }

  // 3. Há»i vá» phÃ­ ship / Ä‘á»‹a chá»‰ / Ä‘á»•i tráº£
  if (/Ä‘á»‹a chá»‰|á»Ÿ Ä‘Ã¢u|cá»­a hÃ ng|showroom|Ä‘á»•i tráº£|ship|váº­n chuyá»ƒn/.test(lower)) {
    return {
      bubbles: [
        'Showroom cá»§a **DUAN.STUDIO** náº±m táº¡i **Táº§ng 2, TÃ²a nhÃ  Lotte Center, 54 Liá»…u Giai, Ba ÄÃ¬nh, HÃ  Ná»™i** (má»Ÿ cá»­a 08:30 â€“ 22:00) áº¡.',
        'BÃªn mÃ¬nh há»— trá»£ **Freeship cho Ä‘Æ¡n tá»« 1.000.000â‚«** (dÆ°á»›i 1 triá»‡u phÃ­ ship 30K), nháº­n hÃ ng Ä‘Æ°á»£c kiá»ƒm tra thoáº£i mÃ¡i vÃ  há»— trá»£ Ä‘á»•i size miá»…n phÃ­ trong 30 ngÃ y nhÃ©!'
      ],
      cards: [],
      zaloLink: null
    };
  }

  // 4. Káº¿t há»£p ngá»¯ cáº£nh tá»« cÃ¡c cÃ¢u chat trÆ°á»›c Ä‘Ã³ cá»§a khÃ¡ch
  const userHistoryText = (history || [])
    .filter((m) => m.sender === 'user')
    .map((m) => m.text)
    .join(' ')
    .toLowerCase();
  const combinedContext = `${userHistoryText} ${lower}`;

  const isFemale = /ná»¯|con gÃ¡i|báº¡n gÃ¡i|vá»£|chá»‹|em gÃ¡i|Ä‘áº§m|vÃ¡y/.test(combinedContext);
  const isMale =
    !isFemale && /nam|con trai|báº¡n trai|chá»“ng|anh|bá»‘|lá»‹ch lÃ£m|sÆ¡ mi|quáº§n tÃ¢y|blazer/.test(combinedContext);

  const wMatch =
    lower.match(/(\d{2,3})\s*(?:kg|kÃ­|kÃ½|cÃ¢n)/) ||
    combinedContext.match(/(\d{2,3})\s*(?:kg|kÃ­|kÃ½|cÃ¢n)/);
  const hMatch =
    lower.match(/1\s*[m\.,]\s*(\d{1,2})\b/) ||
    combinedContext.match(/1\s*[m\.,]\s*(\d{1,2})\b/);

  const bubbles = [];
  if (wMatch || hMatch) {
    const w = wMatch ? parseInt(wMatch[1], 10) : 60;
    const sz = w <= 52 ? 'S' : w <= 63 ? 'M' : w <= 74 ? 'L' : 'XL';
    bubbles.push(
      `Dá»±a trÃªn sá»‘ Ä‘o cá»§a báº¡n thÃ¬ máº·c **Size ${sz}** táº¡i DUAN.STUDIO lÃ  chuáº©n phom vÃ  tÃ´n dÃ¡ng nháº¥t nha! ${
        isMale
          ? 'Phom nÃ y giÃºp pháº§n vai vÃ  ngá»±c Ä‘á»©ng dÃ¡ng ráº¥t lá»‹ch lÃ£m.'
          : isFemale
          ? 'Phom nÃ y sáº½ Ã´m nháº¹ tinh táº¿ giÃºp tÃ´n vÃ²ng eo vÃ  Äƒn gian chiá»u cao cá»±c tá»‘t.'
          : 'Náº¿u báº¡n thÃ­ch máº·c rá»™ng rÃ£i thoáº£i mÃ¡i thÃ¬ cÃ³ thá»ƒ nhÃ­ch lÃªn 1 size nhÃ©.'
      }`
    );
  }

  const list = Array.isArray(products) && products.length > 0 ? products : FALLBACK_PRODUCTS;
  let filtered = list;

  // Lá»c theo dá»‹p máº·c hoáº·c loáº¡i trang phá»¥c khÃ¡ch Ä‘ang tÃ¬m trong tin nháº¯n hiá»‡n táº¡i
  if (/Ä‘i tiá»‡c|dá»± tiá»‡c|háº¹n hÃ²|sang trá»ng/.test(lower)) {
    filtered = isMale
      ? list.filter((p) => /blazer|sÆ¡ mi|quáº§n tÃ¢y|trench/i.test(p.name))
      : list.filter((p) => /Ä‘áº§m|lá»¥a|satin|blazer/i.test(p.name));
  } else if (/Ä‘i chÆ¡i|dáº¡o phá»‘|cÃ¡ tÃ­nh|nÄƒng Ä‘á»™ng/.test(lower)) {
    filtered = isMale
      ? list.filter((p) => /biker|hoodie|thun|jeans|polo/i.test(p.name))
      : list.filter((p) => /hoa nhÃ­|chÃ¢n vÃ¡y|thun|jeans/i.test(p.name));
  } else if (isMale) {
    filtered = list.filter((p) => !/Ä‘áº§m|chÃ¢n vÃ¡y|hoa nhÃ­/i.test(p.name));
  } else if (isFemale) {
    filtered = list.filter((p) => /Ä‘áº§m|vÃ¡y|cardigan|trench|blazer/i.test(p.name));
  }

  if (isMale) {
    bubbles.push(
      `MÃ¬nh chá»n ra nhá»¯ng thiáº¿t káº¿ Nam há»£p nháº¥t vá»›i nhu cáº§u cá»§a báº¡n dÆ°á»›i Ä‘Ã¢y, phom cáº¯t may ráº¥t Ä‘á»©ng dÃ¡ng vÃ  dá»… phá»‘i Ä‘á»“. Báº¡n báº¥m vÃ o tá»«ng máº«u Ä‘á»ƒ xem chi tiáº¿t nhÃ© ðŸ‘‡`
    );
  } else if (isFemale) {
    bubbles.push(
      `MÃ¬nh gá»£i Ã½ cho báº¡n cÃ¡c thiáº¿t káº¿ Ná»¯ Ä‘ang Ä‘Æ°á»£c yÃªu thÃ­ch nháº¥t táº¡i shop dÆ°á»›i Ä‘Ã¢y, cháº¥t váº£i lÃªn phom cá»±c ká»³ sang vÃ  tÃ´n dÃ¡ng. Báº¡n ngáº¯m thá»­ bÃªn dÆ°á»›i nhÃ© ðŸ‘‡`
    );
  } else {
    bubbles.push(
      `BÃªn mÃ¬nh hiá»‡n cÃ³ Ä‘á»§ cÃ¡c dÃ²ng Ão SÆ¡ Mi, Blazer, Trench Coat, Quáº§n Ã‚u cho **Nam** vÃ  cÃ¡c máº«u Äáº§m Lá»¥a Satin, ChÃ¢n VÃ¡y cho **Ná»¯**. Báº¡n Ä‘ang tÃ¬m Ä‘á»“ cho Nam hay Ná»¯ vÃ  kÃ¨m chiá»u cao/cÃ¢n náº·ng Ä‘á»ƒ mÃ¬nh tÆ° váº¥n chuáº©n xÃ¡c nháº¥t nhÃ©!`
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
  const [aiModeLabel, setAiModeLabel] = useState('AI Stylist Trá»±c Tuyáº¿n');
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'ChÃ o báº¡n nha! MÃ¬nh lÃ  Minh Anh â€” Stylist táº¡i **DUAN.STUDIO** ðŸ‘‹',
      suggestedProducts: []
    },
    {
      sender: 'bot',
      text: 'HÃ´m nay báº¡n Ä‘ang tÃ¬m Ä‘á»“ cho **Nam** hay cho **Ná»¯**, vÃ  dá»± Ä‘á»‹nh máº·c Ä‘i Ä‘Ã¢u Ä‘á»ƒ mÃ¬nh lá»±a máº«u há»£p gu nháº¥t cho báº¡n nhÃ©!',
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

    // Náº¿u ngÆ°á»i dÃ¹ng dÃ¡n tháº³ng mÃ£ AIzaSy... vÃ o Ã´ chat -> LÆ°u lÃ m API Key
    if (userMsg.startsWith('AIza') && userMsg.length > 25 && !userMsg.includes(' ')) {
      handleKeyInputChange(userMsg);
      setInput('');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'ðŸŽ‰ **ÄÃ£ nháº­n vÃ  kÃ­ch hoáº¡t trá»±c tiáº¿p mÃ£ Gemini API Key cá»§a báº¡n!** BÃ¢y giá» báº¡n hÃ£y nháº¯n báº¥t ká»³ cÃ¢u há»i nÃ o Ä‘á»ƒ trÃ² chuyá»‡n nhÃ©!',
          suggestedProducts: []
        }
      ]);
      return;
    }

    const updatedHistory = [...messages, { sender: 'user', text: userMsg }];
    setMessages(updatedHistory);
    if (!customText) setInput('');
    setIsTyping(true);

    // 1. KIá»‚M TRA NHANH: Náº¿u khÃ¡ch yÃªu cáº§u liÃªn há»‡ nhÃ¢n viÃªn / Zalo -> Nháº£y ra nÃºt Zalo ngay láº­p tá»©c
    if (isHumanHandoffRequest(userMsg)) {
      await sleep(100);
      setAiModeLabel('Há»— Trá»£ Trá»±c Tiáº¿p Zalo');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Dáº¡ mÃ¬nh gá»­i báº¡n cá»•ng káº¿t ná»‘i trá»±c tiáº¿p vá»›i chuyÃªn viÃªn tÆ° váº¥n vÃ  quáº£n lÃ½ cá»§a **DUAN.STUDIO** qua Zalo (**${ZALO_PHONE}**) nhÃ© áº¡! Báº¡n báº¥m vÃ o nÃºt mÃ u xanh bÃªn dÆ°á»›i Ä‘á»ƒ má»Ÿ Zalo chat ngay nha ðŸ‘‡`,
          suggestedProducts: [],
          zaloLink: ZALO_LINK
        }
      ]);
      setIsTyping(false);
      return;
    }

    const activeKey = (clientApiKey || localStorage.getItem('duan_ai_api_key') || '').trim();

    // 2. Táº¦NG 1: Gá»ŒI BACKEND API (/api/chatbot) Äá»‚ CHáº Y FILE backend/routes/chatbot.js
    try {
      const res = await axios.post(`${API_URL}/chatbot`, {
        message: userMsg,
        history: updatedHistory,
        clientApiKey: activeKey
      });

      const data = res.data;
      // Náº¿u Backend tráº£ vá» cÃ¢u tráº£ lá»i há»£p lá»‡ (khÃ´ng pháº£i thÃ´ng bÃ¡o thiáº¿u API key)
      if (
        data &&
        Array.isArray(data.messages) &&
        data.messages.length > 0 &&
        !String(data.reply).includes('ChÆ°a tÃ¬m tháº¥y khÃ³a') &&
        !String(data.reply).includes('bÃ¡o lá»—i:')
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
      // Náº¿u Backend táº¯t hoáº·c lá»—i thÃ¬ chuyá»ƒn sang Táº§ng 2
    }

    // 3. Táº¦NG 2: Gá»ŒI TRá»°C TIáº¾P GEMINI Tá»ª TRÃŒNH DUYá»†T (Náº¾U CÃ“ KEY AIza...)
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

    // 4. Táº¦NG 3: TRá»¢ LÃ NGá»® Cáº¢NH Ná»˜I Bá»˜ (Khi chÆ°a nháº­p Gemini API Key)
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
          {/* Header chuáº©n Messenger */}
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
                <h4 className="font-extrabold text-sm leading-tight">Minh Anh â€¢ DUAN Stylist</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {isTyping ? (
                    <span className="text-emerald-400 font-semibold animate-pulse">
                      Äang nháº­p tin nháº¯n...
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
                title="Chat Zalo trá»±c tiáº¿p vá»›i nhÃ¢n viÃªn"
              >
                 Zalo
              </a>
            
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold transition"
              >
                âœ•
              </button>
            </div>
          </div>

          {/* Há»™p nháº­p Gemini Key */}
          {showKeyConfig && (
            <div className="p-3.5 bg-indigo-950 text-white border-b border-indigo-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-indigo-200">
                  DÃ¡n Gemini Key (Tá»± Ä‘á»™ng lÆ°u ngay khi dÃ¡n):
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(false)}
                  className="text-[10px] text-emerald-300 font-bold underline"
                >
                  ÄÃ³ng khung nÃ y âœ“
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

          {/* Danh sÃ¡ch tin nháº¯n */}
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

                {/* NÃºt báº¥m chuyá»ƒn tiáº¿p sang Zalo khi khÃ¡ch cáº§n gáº·p nhÃ¢n viÃªn */}
                {m.sender === 'bot' && m.zaloLink && (
                  <div className="pl-9 pt-1">
                    <a
                      href={m.zaloLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0068ff] hover:bg-[#0052cc] text-white text-xs font-extrabold shadow-md transition transform hover:scale-[1.02]"
                    >
                      <span> Nháº¥n Ä‘á»ƒ Chat Zalo vá»›i NhÃ¢n viÃªn ({ZALO_PHONE})</span>
                      <span>â†’</span>
                    </a>
                  </div>
                )}

                {/* Tháº» sáº£n pháº©m gá»£i Ã½ */}
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
                                {prod.price?.toLocaleString('vi-VN')} â‚«
                              </span>
                              <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-950">
                                Xem â†’
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

            {/* Bong bÃ³ng 3 cháº¥m Ä‘ang nháº­p */}
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
              placeholder="Nháº¯n tin nhÆ° trÃªn Messenger..."
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-zinc-100 rounded-full focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white rounded-full text-xs font-extrabold transition shrink-0"
            >
              Gá»­i
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
              Stylist Ä‘ang trá»±c tuyáº¿n
            </span>
            <span className="text-xs font-extrabold tracking-wide">Chat TÆ° Váº¥n Äá»“ Nam / Ná»¯</span>
          </div>
        </button>
      )}
    </div>
  );
}
