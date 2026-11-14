const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// DANH SÁCH 20 SẢN PHẨM THỜI TRANG KHÁC NHAU (CHUẨN ANYWEAR AI)
const TWENTY_SAMPLE_PRODUCTS = [
  {
    name: 'Áo Sơ Mi Oxford Oversized Trắng',
    slug: 'ao-so-mi-oxford-oversized-trang',
    category: 'Áo Sơ Mi',
    description: 'Thiết kế phom rộng từ 100% cotton hữu cơ dệt mật độ cao, thoáng khí và chống nhăn.',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/2503/2503380.png',
    anywearCategory: 'top',
    variants: [
      { color: 'Trắng', size: 'S', sku: 'SM-01-S', price: 490000, stock: 25 },
      { color: 'Trắng', size: 'M', sku: 'SM-01-M', price: 490000, stock: 30 },
      { color: 'Xanh Pastel', size: 'L', sku: 'SM-01-L', price: 510000, stock: 20 }
    ]
  },
  {
    name: 'Áo Khoác Trench Coat Dáng Dài Beige',
    slug: 'ao-khoac-trench-coat-dang-dai-beige',
    category: 'Áo Khoác',
    description: 'Lớp vải Gabardine trượt nước nhẹ, cổ bẻ ve lớn cổ điển và đai thắt eo tôn dáng.',
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/3531/3531744.png',
    anywearCategory: 'outerwear',
    variants: [
      { color: 'Beige', size: 'M', sku: 'AK-02-M', price: 1450000, stock: 15 },
      { color: 'Beige', size: 'L', sku: 'AK-02-L', price: 1450000, stock: 12 }
    ]
  },
  {
    name: 'Áo Thun Heavyweight Boxy Studio Đen',
    slug: 'ao-thun-heavyweight-boxy-studio-den',
    category: 'Áo Thun',
    description: 'Định lượng vải 280gsm dày dặn, đường may giấu chỉ tinh tế, phom Boxy tôn chiều cao.',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/892/892458.png',
    anywearCategory: 'top',
    variants: [
      { color: 'Đen Washed', size: 'M', sku: 'AT-03-M', price: 350000, stock: 45 },
      { color: 'Đen Washed', size: 'L', sku: 'AT-03-L', price: 350000, stock: 40 }
    ]
  },
  {
    name: 'Đầm Lụa Satin Midi Minimalist Đỏ Rượu',
    slug: 'dam-lua-satin-midi-minimalist-do-ruou',
    category: 'Đầm Nữ',
    description: 'Chất liệu lụa Satin cao cấp có độ bóng nhẹ sang trọng, cắt chéo tôn đường cong.',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/3531/3531818.png',
    anywearCategory: 'dress',
    variants: [
      { color: 'Đỏ Rượu', size: 'S', sku: 'DM-04-S', price: 890000, stock: 18 },
      { color: 'Đỏ Rượu', size: 'M', sku: 'DM-04-M', price: 890000, stock: 22 }
    ]
  },
  {
    name: 'Quần Tây Pleated Wide-Leg Tailored Xám',
    slug: 'quan-tay-pleated-wide-leg-tailored-xam',
    category: 'Quần',
    description: 'Quần âu xếp ly đôi ống suông rộng mang hơi hướng Sartorial đương đại.',
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/2589/2589903.png',
    anywearCategory: 'bottom',
    variants: [
      { color: 'Xám Khói', size: 'M', sku: 'QT-05-M', price: 680000, stock: 25 },
      { color: 'Đen', size: 'L', sku: 'QT-05-L', price: 680000, stock: 20 }
    ]
  },
  {
    name: 'Áo Blazer Cấu Trúc Double-Breasted Đen',
    slug: 'ao-blazer-cau-truc-double-breasted-den',
    category: 'Áo Khoác',
    description: 'Blazer 2 hàng khuy độn vai vừa phải, tạo vẻ ngoài quyền lực và thanh lịch.',
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/2806/2806175.png',
    anywearCategory: 'outerwear',
    variants: [
      { color: 'Đen Tuyền', size: 'M', sku: 'BZ-06-M', price: 1290000, stock: 14 },
      { color: 'Đen Tuyền', size: 'L', sku: 'BZ-06-L', price: 1290000, stock: 16 }
    ]
  },
  {
    name: 'Áo Hoodie Nỉ Bông Essential Xám Melange',
    slug: 'ao-hoodie-ni-bong-essential-xam-melange',
    category: 'Áo Khoác',
    description: 'Chất nỉ cotton 420gsm dày dặn, mũ 2 lớp đứng form cực đẹp cho mùa thu đông.',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/5258/5258076.png',
    anywearCategory: 'outerwear',
    variants: [
      { color: 'Xám Melange', size: 'M', sku: 'HD-07-M', price: 620000, stock: 30 },
      { color: 'Xám Melange', size: 'L', sku: 'HD-07-L', price: 620000, stock: 28 }
    ]
  },
  {
    name: 'Áo Polo Dệt Kim Knitwear Cổ Điển Kem',
    slug: 'ao-polo-det-kim-knitwear-co-dien-kem',
    category: 'Áo Thun',
    description: 'Len dệt kim sợi mảnh thoáng mát, mang phong cách Old Money lịch lãm.',
    images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/2503/2503380.png',
    anywearCategory: 'top',
    variants: [
      { color: 'Kem Sữa', size: 'M', sku: 'PL-08-M', price: 540000, stock: 22 },
      { color: 'Xanh Rêu', size: 'L', sku: 'PL-08-L', price: 540000, stock: 19 }
    ]
  },
  {
    name: 'Quần Jeans Selvedge Denim Ống Suông Xanh Đậm',
    slug: 'quan-jeans-selvedge-denim-ong-suong-xanh',
    category: 'Quần',
    description: 'Vải Denim Nhật Bản 14oz bền bỉ, lên màu fade tự nhiên theo thời gian sử dụng.',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/2589/2589903.png',
    anywearCategory: 'bottom',
    variants: [
      { color: 'Indigo Raw', size: 'M', sku: 'JN-09-M', price: 790000, stock: 35 },
      { color: 'Indigo Raw', size: 'L', sku: 'JN-09-L', price: 790000, stock: 30 }
    ]
  },
  {
    name: 'Áo Khoác Da Biker Jacket Vintage Đen',
    slug: 'ao-khoac-da-biker-jacket-vintage-den',
    category: 'Áo Khoác',
    description: 'Da thuộc tổng hợp cao cấp chống bong tróc, khóa kéo kim loại YKK sáng bóng.',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/2806/2806175.png',
    anywearCategory: 'outerwear',
    variants: [
      { color: 'Đen Bóng', size: 'M', sku: 'BK-10-M', price: 1590000, stock: 10 },
      { color: 'Đen Bóng', size: 'L', sku: 'BK-10-L', price: 1590000, stock: 12 }
    ]
  },
  {
    name: 'Đầm Hoa Nhí Chiffon Tay Phồng Parisian',
    slug: 'dam-hoa-nhi-chiffon-tay-phong-parisian',
    category: 'Đầm Nữ',
    description: 'Vải voan Chiffon 2 lớp mềm mại bay bổng, họa tiết hoa nhí phong cách Pháp.',
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/3531/3531818.png',
    anywearCategory: 'dress',
    variants: [
      { color: 'Trắng Hoa Nhí', size: 'S', sku: 'DM-11-S', price: 750000, stock: 20 },
      { color: 'Trắng Hoa Nhí', size: 'M', sku: 'DM-11-M', price: 750000, stock: 24 }
    ]
  },
  {
    name: 'Áo Sơ Mi Lụa Cuban Collar Họa Tiết Resort',
    slug: 'ao-so-mi-lua-cuban-collar-resort',
    category: 'Áo Sơ Mi',
    description: 'Sơ mi cổ pijama phóng khoáng, chất lụa Tencel mát lạnh cho những chuyến du lịch.',
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/2503/2503380.png',
    anywearCategory: 'top',
    variants: [
      { color: 'Xanh Navy', size: 'M', sku: 'CB-12-M', price: 460000, stock: 28 },
      { color: 'Xanh Navy', size: 'L', sku: 'CB-12-L', price: 460000, stock: 22 }
    ]
  },
  {
    name: 'Áo Len Cardigan Dáng Rộng Hàn Quốc Nâu',
    slug: 'ao-len-cardigan-dang-rong-han-quoc-nau',
    category: 'Áo Khoác',
    description: 'Len lông cừu nhân tạo mềm mịn không dặm ngứa, dễ dàng phối layer với sơ mi.',
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/3531/3531744.png',
    anywearCategory: 'outerwear',
    variants: [
      { color: 'Nâu Mocha', size: 'S', sku: 'CD-13-S', price: 580000, stock: 18 },
      { color: 'Nâu Mocha', size: 'M', sku: 'CD-13-M', price: 580000, stock: 25 }
    ]
  },
  {
    name: 'Quần Cargo Túi Hộp Streetwear Kaki Rêu',
    slug: 'quan-cargo-tui-hop-streetwear-kaki-reu',
    category: 'Quần',
    description: 'Thiết kế 6 túi hộp năng động, ống quần có dây rút điều chỉnh linh hoạt.',
    images: ['https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/2589/2589903.png',
    anywearCategory: 'bottom',
    variants: [
      { color: 'Xanh Rêu', size: 'M', sku: 'CG-14-M', price: 640000, stock: 32 },
      { color: 'Đen', size: 'L', sku: 'CG-14-L', price: 640000, stock: 29 }
    ]
  },
  {
    name: 'Áo Khoác Bomber Varsity Phối Tay Da',
    slug: 'ao-khoac-bomber-varsity-phoi-tay-da',
    category: 'Áo Khoác',
    description: 'Thân áo dạ ép cao cấp kết hợp tay da PU mềm, thêu logo nổi sắc nét.',
    images: ['https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/2806/2806175.png',
    anywearCategory: 'outerwear',
    variants: [
      { color: 'Đen Phối Trắng', size: 'M', sku: 'VS-15-M', price: 980000, stock: 15 },
      { color: 'Đen Phối Trắng', size: 'L', sku: 'VS-15-L', price: 980000, stock: 17 }
    ]
  },
  {
    name: 'Đầm Dạ Hội Đen Little Black Dress Cổ Vuông',
    slug: 'dam-da-hoi-den-little-black-dress-co-vuong',
    category: 'Đầm Nữ',
    description: 'Thiết kế kinh điển tôn vòng eo thon gọn, phù hợp cho mọi sự kiện sang trọng.',
    images: ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/3531/3531818.png',
    anywearCategory: 'dress',
    variants: [
      { color: 'Đen Tuyền', size: 'S', sku: 'LB-16-S', price: 950000, stock: 16 },
      { color: 'Đen Tuyền', size: 'M', sku: 'LB-16-M', price: 950000, stock: 14 }
    ]
  },
  {
    name: 'Áo Thun Graphic Typo Nghệ Thuật Trắng',
    slug: 'ao-thun-graphic-typo-nghe-thuat-trang',
    category: 'Áo Thun',
    description: 'Công nghệ in lụa cao cấp không bong tróc khi giặt máy, cotton 2 chiều thấm hút mồ hôi.',
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/892/892458.png',
    anywearCategory: 'top',
    variants: [
      { color: 'Trắng Kem', size: 'S', sku: 'GT-17-S', price: 320000, stock: 40 },
      { color: 'Trắng Kem', size: 'M', sku: 'GT-17-M', price: 320000, stock: 50 }
    ]
  },
  {
    name: 'Chân Váy Xếp Ly Tennis Skirt Năng Động',
    slug: 'chan-vay-xep-ly-tennis-skirt-nang-dong',
    category: 'Quần',
    description: 'Chân váy cạp cao tích hợp quần bảo hộ bên trong, giữ nếp ly chuẩn sau nhiều lần giặt.',
    images: ['https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/2589/2589903.png',
    anywearCategory: 'bottom',
    variants: [
      { color: 'Trắng', size: 'S', sku: 'CV-18-S', price: 390000, stock: 26 },
      { color: 'Đen', size: 'M', sku: 'CV-18-M', price: 390000, stock: 30 }
    ]
  },
  {
    name: 'Áo Sơ Mi Flannel Kẻ Caro Vintage Đỏ Đen',
    slug: 'ao-so-mi-flannel-ke-caro-vintage-do-den',
    category: 'Áo Sơ Mi',
    description: 'Vải dạ Flannel bề mặt bông nhẹ ấm áp, vừa mặc riêng vừa làm áo khoác ngoài cá tính.',
    images: ['https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/2503/2503380.png',
    anywearCategory: 'top',
    variants: [
      { color: 'Đỏ Đen', size: 'M', sku: 'FL-19-M', price: 470000, stock: 22 },
      { color: 'Đỏ Đen', size: 'L', sku: 'FL-19-L', price: 470000, stock: 20 }
    ]
  },
  {
    name: 'Áo Khoác Phao Puffer Siêu Nhẹ Chống Nước',
    slug: 'ao-khoac-phao-puffer-sieu-nhe-chong-nuoc',
    category: 'Áo Khoác',
    description: 'Trọng lượng siêu nhẹ chỉ 350g nhưng giữ nhiệt tối đa, bề mặt phủ Nano trượt nước mưa.',
    images: ['https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=900&q=80'],
    anywearImage: 'https://cdn-icons-png.flaticon.com/512/5258/5258076.png',
    anywearCategory: 'outerwear',
    variants: [
      { color: 'Đen Nhám', size: 'M', sku: 'PF-20-M', price: 1150000, stock: 18 },
      { color: 'Bạc Metallic', size: 'L', sku: 'PF-20-L', price: 1190000, stock: 15 }
    ]
  }
];

// Hàm tự động đảm bảo trong MongoDB luôn có đủ 20 sản phẩm
const ensureTwentyProducts = async () => {
  const count = await Product.countDocuments();
  if (count < 20) {
    for (const item of TWENTY_SAMPLE_PRODUCTS) {
      const exists = await Product.findOne({ slug: item.slug });
      if (!exists) {
        await Product.create(item);
      }
    }
  }
};

// GET /api/products - Lấy danh sách sản phẩm (Tự động nạp đủ 20 sản phẩm nếu kho đang ít hơn 20)
router.get('/', async (req, res) => {
  try {
    await ensureTwentyProducts();
    const { category, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products/seed-20 - Nút bấm nạp nhanh 20 sản phẩm từ Admin Dashboard
router.post('/seed-20', async (req, res) => {
  try {
    await Product.deleteMany({});
    const created = await Product.insertMany(TWENTY_SAMPLE_PRODUCTS);
    res.json({
      message: `Đã nạp mới toàn bộ ${created.length} sản phẩm vào MongoDB!`,
      products: created
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi nạp 20 sản phẩm: ' + err.message });
  }
});

// GET /api/products/:id - Lấy chi tiết 1 sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const product = isObjectId
      ? await Product.findById(req.params.id)
      : await Product.findOne({ slug: req.params.id });

    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products - Thêm sản phẩm mới (Admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:id - Cập nhật sản phẩm (Admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/products/:id - Xóa sản phẩm (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;