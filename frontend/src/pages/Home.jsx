import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 4 SLIDE BANNER CHÍNH: Thiết kế Editorial tự nhiên
const HERO_SLIDES = [
  {
    id: 1,
    season: 'COLLECTION 2026 — AUTUMN / WINTER',
    titleLine1: 'THỜI TRANG ĐƯƠNG ĐẠI',
    titleHighlight: 'CHUẨN MỰC TỐI GIẢN.',
    desc: 'Khám phá 20 thiết kế mới nhất được cắt may tỉ mỉ từ chất liệu Cotton Oxford, Lụa Satin và Len Cashmere. Hỗ trợ ướm thử phom dáng trực tuyến trên ảnh cá nhân.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
    tag: 'LOOKBOOK 01'
  },
  {
    id: 2,
    season: 'SARTORIAL TAILORING — OUTERWEAR',
    titleLine1: 'TUYỆT TÁC KHOÁC NGOÀI',
    titleHighlight: 'ĐỨNG PHOM LỊCH LÃM.',
    desc: 'Bộ sưu tập Trench Coat Gabardine trượt nước, Blazer 2 hàng khuy Double-Breasted và Áo khoác da Biker cổ điển dành cho mùa thu đông.',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
    tag: 'LOOKBOOK 02'
  },
  {
    id: 3,
    season: 'EVENING EDITION — SILK & CHIFFON',
    titleLine1: 'VẺ ĐẸP LỤA SATIN',
    titleHighlight: 'THANH LỊCH TỰ NHIÊN.',
    desc: 'Những thiết kế đầm lụa Satin Midi và voan Chiffon Parisian tôn đường cong tinh tế cho các buổi tiệc tối và dạo phố cuối tuần.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
    tag: 'LOOKBOOK 03'
  },
  {
    id: 4,
    season: 'EXCLUSIVE MEMBER PERKS',
    titleLine1: 'ĐẶC QUYỀN MUA SẮM',
    titleHighlight: 'ƯU ĐÃI TỚI 50%.',
    desc: 'Áp dụng mã DUAN2026 giảm 15% cho mọi đơn hàng hoặc VIP50 giảm 50% cho đơn từ 1.000.000₫. Miễn phí giao hàng toàn quốc.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',
    tag: 'LOOKBOOK 04'
  }
];

const CATEGORY_METADATA = {
  'Áo Khoác': {
    code: 'SECTION 01',
    subtitle: 'Trench Coat, Blazer cấu trúc, Áo da Biker, Bomber và Hoodie nỉ bông.'
  },
  'Áo Sơ Mi': {
    code: 'SECTION 02',
    subtitle: 'Sơ mi Oxford Oversized, Sơ mi lụa Cuban Collar và Flannel kẻ caro.'
  },
  'Áo Thun': {
    code: 'SECTION 03',
    subtitle: 'Áo thun Heavyweight 280gsm phom Boxy và Áo Polo dệt kim cổ điển.'
  },
  'Đầm Nữ': {
    code: 'SECTION 04',
    subtitle: 'Đầm lụa Satin Midi, Đầm hoa nhí Parisian và Little Black Dress.'
  },
  'Quần': {
    code: 'SECTION 05',
    subtitle: 'Quần âu xếp ly ống suông, Quần Jeans Selvedge, Cargo và Chân váy xếp ly.'
  }
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || 'Tất cả');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [priceFilter, setPriceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [showSideBanners, setShowSideBanners] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    axios
      .get(`${API_URL}/products`)
      .then((res) => setProducts(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    const qParam = searchParams.get('q');
    const catParam = searchParams.get('cat');
    setSearchQuery(qParam || '');
    setSelectedCategory(catParam || 'Tất cả');
  }, [searchParams]);

  const filteredProducts = products
    .filter((p) => {
      const matchCategory = selectedCategory === 'Tất cả' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const price = p.variants?.[0]?.price || 0;
      let matchPrice = true;
      if (priceFilter === 'UNDER_500') matchPrice = price < 500000;
      else if (priceFilter === '500_TO_1000') matchPrice = price >= 500000 && price <= 1000000;
      else if (priceFilter === 'OVER_1000') matchPrice = price > 1000000;

      return matchCategory && matchSearch && matchPrice;
    })
    .sort((a, b) => {
      const priceA = a.variants?.[0]?.price || 0;
      const priceB = b.variants?.[0]?.price || 0;
      if (sortBy === 'PRICE_ASC') return priceA - priceB;
      if (sortBy === 'PRICE_DESC') return priceB - priceA;
      return 0;
    });

  const groupedCategories = [...new Set(filteredProducts.map((p) => p.category))];

  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  return (
    <div className="relative">
      {/* HAI BANNER DỌC 2 BÊN MÀN HÌNH ĐÃ NÂNG CẤP MÀU SẮC NỔI BẬT */}
      {showSideBanners && (
        <>
          {/* BANNER TRÁI: FITTING ROOM */}
          <div className="hidden 2xl:flex fixed left-4 top-28 z-30 w-52 rounded-[26px] overflow-hidden bg-zinc-950 text-white border border-white/15 shadow-2xl flex-col justify-between p-4 h-[580px]">
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=500&q=80"
              alt="Lookbook Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

            <div className="relative z-10 flex justify-between items-center">
              <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-semibold uppercase tracking-widest text-white">
                Fitting Room
              </span>
              <button
                onClick={() => setShowSideBanners(false)}
                className="w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-zinc-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="relative z-10 my-auto space-y-3">
              <div className="p-4 rounded-2xl bg-black/65 backdrop-blur-md border border-white/15 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300">
                  Trải Nghiệm Mới
                </p>
                <h4 className="text-base font-bold leading-snug text-white">
                  Ướm Thử Trang Phục Trực Tuyến
                </h4>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Tích hợp tiện ích Anywear giúp bạn ướm thử mọi thiết kế ngay trên ảnh cá nhân.
                </p>
              </div>
            </div>

            <Link
              to="/anywear-guide"
              className="relative z-10 w-full py-2.5 rounded-xl bg-white text-zinc-950 text-center text-xs font-bold hover:bg-zinc-200 transition shadow-lg"
            >
              Xem Hướng Dẫn →
            </Link>
          </div>

          {/* BANNER PHẢI: MEMBER VOUCHERS RỰC RỠ & NỔI BẬT */}
          <div className="hidden 2xl:flex fixed right-4 top-28 z-30 w-56 rounded-[26px] overflow-hidden text-white border border-white/15 shadow-2xl flex-col justify-between p-4 h-[580px] bg-gradient-to-b from-[#1e1b4b] via-[#3b0764] to-[#0f172a]">
            {/* Hiệu ứng ánh sáng nền tạo chiều sâu bắt mắt */}
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-amber-400/25 blur-2xl pointer-events-none" />
            <div className="absolute top-1/2 -left-12 w-36 h-36 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />

            {/* Header Banner */}
            <div className="relative z-10 flex justify-between items-center">
             
              <button
                onClick={() => setShowSideBanners(false)}
                className="w-6 h-6 rounded-full bg-white/10 text-white/80 hover:text-white text-xs flex items-center justify-center hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>

            {/* Danh sách 2 Thẻ Voucher màu sắc nổi bật */}
            <div className="relative z-10 space-y-3.5 my-auto">
              <div>
                <p className="text-[10px] text-rose-300 font-semibold uppercase tracking-widest">
                  Ưu Đãi Tháng Này
                </p>
                <h4 className="text-lg font-bold tracking-tight text-white leading-snug mt-0.5">
                  Đặc Quyền Mua Sắm
                </h4>
              </div>

              {/* Thẻ Voucher 1: Giảm 15% */}
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-200">Giảm 15% mọi đơn</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300">
                    -15%
                  </span>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl bg-black/30 border border-dashed border-white/30 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold tracking-wider text-white">
                    DUAN2026
                  </span>
                  <span className="text-[10px] text-emerald-300">Tối đa 200K</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyVoucher('DUAN2026')}
                  className={`w-full py-2 rounded-xl text-[11px] font-bold transition shadow ${
                    copiedCode === 'DUAN2026'
                      ? 'bg-emerald-400 text-zinc-950'
                      : 'bg-white hover:bg-zinc-100 text-zinc-950'
                  }`}
                >
                  {copiedCode === 'DUAN2026' ? '✓ Đã sao chép mã' : 'Sao chép mã'}
                </button>
              </div>

              {/* Thẻ Voucher 2: Giảm 50% VIP */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/25 to-rose-500/20 backdrop-blur-md border border-amber-400/40 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-amber-100">Đơn từ 1.000.000₫</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-zinc-950">
                    HOT -50%
                  </span>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl bg-black/35 border border-dashed border-amber-300/50 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold tracking-wider text-amber-300">
                    VIP50
                  </span>
                  <span className="text-[10px] text-amber-200">Tối đa 500K</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyVoucher('VIP50')}
                  className={`w-full py-2 rounded-xl text-[11px] font-bold transition shadow-md ${
                    copiedCode === 'VIP50'
                      ? 'bg-emerald-400 text-zinc-950'
                      : 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-zinc-950'
                  }`}
                >
                  {copiedCode === 'VIP50' ? '✓ Đã sao chép mã' : 'Sao chép mã VIP'}
                </button>
              </div>
            </div>

            <Link
              to="/cart"
              className="relative z-10 w-full py-2.5 rounded-xl bg-white/15 hover:bg-white hover:text-zinc-950 text-white border border-white/20 text-center text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <span>Vào Giỏ Hàng Áp Mã</span>
              <span>→</span>
            </Link>
          </div>
        </>
      )}

      {/* NỘI DUNG CHÍNH */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HERO SLIDER TRƯỢT SANG TRÁI */}
        <section className="relative rounded-[28px] overflow-hidden bg-zinc-950 text-white mb-10 shadow-xl">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {HERO_SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="w-full shrink-0 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-5 z-10">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400 border-l-2 border-white pl-3">
                    {slide.season}
                  </p>

                  <h1 className="font-display text-3xl sm:text-5xl lg:text-[52px] font-black tracking-tight leading-[1.12]">
                    {slide.titleLine1} <br />
                    <span className="text-zinc-300">{slide.titleHighlight}</span>
                  </h1>

                  <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed">
                    {slide.desc}
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href="#collection-sections"
                      className="px-7 py-3.5 rounded-full bg-white text-zinc-950 font-extrabold text-xs uppercase tracking-wider hover:bg-zinc-200 transition"
                    >
                      Xem Bộ Sưu Tập ↓
                    </a>
                    <Link
                      to="/cart"
                      className="px-6 py-3.5 rounded-full border border-zinc-700 text-xs font-bold text-zinc-200 hover:border-white transition"
                    >
                      Ưu đãi thành viên 15%
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 relative">
                  <div className="aspect-[4/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                    <img
                      src={slide.image}
                      alt={slide.titleLine1}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-4 left-4 bg-black/70 backdrop-blur px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase text-white">
                      {slide.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-white hover:text-zinc-950 text-white flex items-center justify-center font-bold transition z-20"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-white hover:text-zinc-950 text-white flex items-center justify-center font-bold transition z-20"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/35'
                }`}
              />
            ))}
          </div>
        </section>

        {/* THANH TRẠNG THÁI & BỘ LỌC NHANH TỐI GIẢN */}
        <div
          id="collection-sections"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-10 border-b border-zinc-200"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-extrabold text-zinc-900">
              Hiển thị: {selectedCategory} ({filteredProducts.length} thiết kế)
            </span>
            {(selectedCategory !== 'Tất cả' || searchQuery || priceFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedCategory('Tất cả');
                  setSearchQuery('');
                  setPriceFilter('ALL');
                  setSearchParams({});
                }}
                className="px-3 py-1 rounded-full bg-zinc-200 hover:bg-zinc-950 hover:text-white text-zinc-700 text-xs font-bold transition"
              >
                ✕ Đặt lại bộ lọc
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-2 text-xs font-bold bg-white border border-zinc-300 rounded-full focus:outline-none focus:border-zinc-950"
            >
              <option value="ALL">Mọi mức giá</option>
              <option value="UNDER_500">Dưới 500.000 ₫</option>
              <option value="500_TO_1000">500.000 ₫ – 1.000.000 ₫</option>
              <option value="OVER_1000">Trên 1.000.000 ₫</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 text-xs font-bold bg-white border border-zinc-300 rounded-full focus:outline-none focus:border-zinc-950"
            >
              <option value="NEWEST">Sắp xếp: Mới nhất</option>
              <option value="PRICE_ASC">Giá: Thấp đến Cao ↑</option>
              <option value="PRICE_DESC">Giá: Cao xuống Thấp ↓</option>
            </select>
          </div>
        </div>

        {/* DANH SÁCH SẢN PHẨM CHIA THEO TỪNG MỤC DANH MỤC RÕ RÀNG */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-14 text-center">
            <p className="text-lg font-extrabold text-zinc-900">
              Không tìm thấy sản phẩm nào khớp với tiêu chí hiện tại
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Tất cả');
                setSearchQuery('');
                setPriceFilter('ALL');
                setSearchParams({});
              }}
              className="mt-4 px-6 py-2.5 rounded-full bg-zinc-950 text-white text-xs font-extrabold"
            >
              Xem toàn bộ 20 sản phẩm
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {groupedCategories.map((categoryName) => {
              const itemsInCategory = filteredProducts.filter(
                (p) => p.category === categoryName
              );
              const meta = CATEGORY_METADATA[categoryName] || {
                code: 'COLLECTION',
                subtitle: 'Thiết kế chính hãng DUAN.STUDIO.'
              };

              return (
                <section key={categoryName} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-300 pb-4 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                        {meta.code}
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-950">
                          {categoryName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 text-zinc-800 text-xs font-bold">
                          {itemsInCategory.length} mẫu
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{meta.subtitle}</p>
                    </div>

                    {selectedCategory === 'Tất cả' && (
                      <button
                        onClick={() => setSelectedCategory(categoryName)}
                        className="text-xs font-bold text-zinc-700 hover:text-zinc-950 underline self-start sm:self-end"
                      >
                        Xem riêng mục {categoryName} →
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {itemsInCategory.map((product) => {
                      const firstPrice = product.variants?.[0]?.price || 0;
                      const totalAvailable = product.variants?.reduce(
                        (sum, v) => sum + Math.max(0, v.stock - (v.reservedStock || 0)),
                        0
                      );

                      return (
                        <Link
                          to={`/product/${product._id}`}
                          state={{ product }}
                          key={product._id}
                          className="group bg-white rounded-2xl border border-zinc-200/90 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                          <div className="aspect-[3/4] overflow-hidden bg-zinc-100 relative">
                            <img
                              src={product.images?.[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded text-[10px] font-bold text-zinc-800 shadow-sm">
                              Còn {totalAvailable} sp
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                {product.category}
                              </span>
                              <h4 className="font-bold text-zinc-900 text-sm mt-1 group-hover:text-indigo-600 transition line-clamp-2">
                                {product.name}
                              </h4>
                            </div>

                            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                              <span className="text-base font-black text-zinc-950">
                                {firstPrice.toLocaleString('vi-VN')} ₫
                              </span>
                              <span className="text-[11px] font-bold text-zinc-600 group-hover:text-zinc-950 transition">
                                Chi tiết →
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}