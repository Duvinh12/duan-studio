import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

// Bạn có thể thay link Chrome Web Store chính xác của Extension Anywear tại đây
const CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/anywear-live-virtual-try/hijnklblgecbdlhjiofhlhjpndpifejh';

export default function AnywearGuide() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromProduct = location.state?.product || null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Thanh điều hướng quay lại */}
      <div className="mb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 flex items-center gap-2 transition"
        >
          <span>←</span>
          <span>
            {fromProduct ? `Quay lại: ${fromProduct.name}` : 'Quay lại trang sản phẩm'}
          </span>
        </button>

        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
          Browser Extension Setup
        </span>
      </div>

      {/* Khối tiêu đề chính */}
      <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl mb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <span className="inline-block px-3 py-1 rounded bg-white/10 text-[11px] font-bold uppercase tracking-widest text-zinc-300">
            Hướng Dẫn Tích Hợp Trình Duyệt
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight">
            Cài Đặt Tiện Ích Mở Rộng Anywear Virtual Try-On
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Tính năng ướm thử trang phục hoạt động thông qua tiện ích mở rộng (Extension) trên trình duyệt Chrome, Cốc Cốc hoặc Microsoft Edge. Chỉ cần cài đặt 1 lần duy nhất để thử mọi sản phẩm tại DUAN.STUDIO.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="px-7 py-3.5 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-extrabold uppercase tracking-wider transition shadow-lg inline-flex items-center gap-2"
            >
              <span>Tải Extension Trên Chrome Web Store</span>
              <span>↗</span>
            </a>

            {fromProduct && (
              <Link
                to={`/product/${fromProduct._id}`}
                state={{ product: fromProduct }}
                className="px-6 py-3.5 rounded-full border border-zinc-700 hover:border-white text-white text-xs font-bold uppercase tracking-wider transition"
              >
                Đã cài xong • Quay lại thử đồ
              </Link>
            )}
          </div>
        </div>

        {/* Nếu khách bấm từ 1 sản phẩm sang thì hiển thị thẻ sản phẩm đó */}
        <div className="lg:col-span-4">
          {fromProduct ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
              <img
                src={fromProduct.images?.[0]}
                alt={fromProduct.name}
                className="w-20 h-24 object-cover rounded-xl border border-zinc-700 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Sản phẩm đang chọn
                </span>
                <h4 className="text-sm font-bold text-white truncate mt-0.5">
                  {fromProduct.name}
                </h4>
                <p className="text-xs font-extrabold text-indigo-400 mt-1">
                  {Number(fromProduct.variants?.[0]?.price || 0).toLocaleString('vi-VN')} ₫
                </p>
                <span className="inline-block mt-2 text-[10px] text-emerald-400 font-semibold">
                  ● Tương thích Anywear Extension
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Hỗ trợ trình duyệt
              </p>
              <p className="text-sm font-extrabold text-white">
                Google Chrome • Cốc Cốc • Brave • Microsoft Edge
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3 BƯỚC HƯỚNG DẪN CÀI ĐẶT & BẬT LÊN CHI TIẾT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Bước 1 */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-zinc-950 text-white text-xs font-extrabold flex items-center justify-center">
                01
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Cài đặt
              </span>
            </div>
            <h3 className="font-display text-base font-extrabold text-zinc-950">
              Thêm Tiện Ích Vào Trình Duyệt
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Truy cập cửa hàng Chrome Web Store (hoặc nạp thư mục Extension vào <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-zinc-900">chrome://extensions</code> nếu bạn dùng bản Developer), sau đó bấm nút <b>"Thêm vào Chrome" (Add to Chrome)</b>.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700 font-medium">
            ✓ Xác nhận bằng cách bấm <b>"Add extension"</b> trên hộp thoại bật lên của trình duyệt.
          </div>
        </div>

        {/* Bước 2 */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-zinc-950 text-white text-xs font-extrabold flex items-center justify-center">
                02
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Kích hoạt & Ghim
              </span>
            </div>
            <h3 className="font-display text-base font-extrabold text-zinc-950">
              Bật Extension & Tải Ảnh Cá Nhân
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Nhìn lên góc trên bên phải của trình duyệt (biểu tượng mảnh ghép <b>Tiện ích / Extensions</b>), bấm biểu tượng <b>Ghim (Pin)</b> bên cạnh <b>Anywear</b> để hiện nút trên thanh công cụ.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700 font-medium">
            ✓ Mở biểu tượng Anywear trên thanh công cụ và tải sẵn 1 bức ảnh chân dung/toàn thân của bạn lên.
          </div>
        </div>

        {/* Bước 3 */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-zinc-950 text-white text-xs font-extrabold flex items-center justify-center">
                03
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Sử dụng
              </span>
            </div>
            <h3 className="font-display text-base font-extrabold text-zinc-950">
              Ướm Thử Trực Tiếp Trên Sản Phẩm
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Quay lại trang sản phẩm bất kỳ của <b>DUAN.STUDIO</b>, di chuột vào ảnh mẫu trang phục sẽ thấy nút <b>"AI Try-On"</b> của Extension hiện ở góc ảnh (hoặc bấm chuột phải vào ảnh chọn Anywear).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700 font-medium">
            ✓ Extension sẽ tự động lấy ảnh trang phục và ghép lên ảnh cá nhân của bạn trong vài giây.
          </div>
        </div>
      </div>

      {/* Hướng dẫn dành riêng cho trường hợp cài Extension từ thư mục Local (Developer Mode) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-950">
          Cách bật nhanh nếu bạn cài từ thư mục mã nguồn Extension (Chế độ Nhà phát triển):
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-600">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <strong className="text-zinc-900 block mb-1">1. Mở trang Quản lý Tiện ích:</strong>
            Nhập <code className="font-mono font-bold text-zinc-900">chrome://extensions</code> (hoặc <code className="font-mono font-bold text-zinc-900">coccoc://extensions</code>) vào thanh địa chỉ trình duyệt và nhấn Enter.
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <strong className="text-zinc-900 block mb-1">2. Bật Developer Mode:</strong>
            Gạt công tắc <b>"Chế độ dành cho nhà phát triển" (Developer mode)</b> ở góc trên cùng bên phải sang trạng thái <b>BẬT (ON)</b>.
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
            <strong className="text-zinc-900 block mb-1">3. Tải tiện ích đã giải nén:</strong>
            Bấm nút <b>"Tải tiện ích đã giải nén" (Load unpacked)</b> ở góc trái và chọn thư mục chứa Extension Anywear trong máy tính của bạn.
          </div>
        </div>
      </div>
    </div>
  );
}