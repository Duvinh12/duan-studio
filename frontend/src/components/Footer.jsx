import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const POLICY_DETAILS = {
  return: {
    title: 'Chính Sách Đổi Trả Trong 30 Ngày',
    content: [
      '1. Hỗ trợ đổi size, đổi mẫu hoặc hoàn tiền trong vòng 30 ngày kể từ ngày nhận hàng.',
      '2. Sản phẩm đổi trả còn nguyên tem mác, chưa qua sử dụng hoặc giặt ủi.',
      '3. Miễn phí 100% phí vận chuyển đổi hàng nếu sản phẩm có lỗi từ nhà sản xuất.',
      '4. Thời gian xử lý hoàn tiền về tài khoản ngân hàng trong vòng 24 giờ làm việc.'
    ]
  },
  shipping: {
    title: 'Chính Sách Giao Hàng & Đồng Kiểm',
    content: [
      '1. Miễn phí vận chuyển tiêu chuẩn toàn quốc cho đơn hàng từ 1.000.000 ₫ (Và miễn phí 100% cho tài khoản Quản trị viên).',
      '2. Khu vực nội thành Hà Nội & TP.HCM: Giao nhanh từ 1 - 2 ngày làm việc.',
      '3. Các tỉnh thành khác: Giao hàng từ 2 - 4 ngày làm việc.',
      '4. Khách hàng được quyền kiểm tra sản phẩm trước khi nhận hàng.'
    ]
  },
  privacy: {
    title: 'Chính Sách Bảo Mật Thông Tin Khách Hàng',
    content: [
      '1. Hình ảnh khách hàng sử dụng trong tính năng ướm thử đồ được xử lý trực tiếp trên trình duyệt cá nhân, không lưu trữ công khai.',
      '2. Thông tin cá nhân (Họ tên, Số điện thoại, Địa chỉ) chỉ sử dụng cho mục đích giao nhận đơn hàng.',
      '3. Mọi giao dịch chuyển khoản đều được đối soát tự động và bảo mật.'
    ]
  },
  warranty: {
    title: 'Chính Sách Bảo Hành Trang Phục',
    content: [
      '1. Bảo hành miễn phí đường chỉ may, khuy cài và khóa kéo trong suốt quá trình sử dụng.',
      '2. Hỗ trợ chỉnh sửa chiều dài ống quần/tay áo cơ bản miễn phí tại cửa hàng.',
      '3. Hướng dẫn bảo quản chất liệu vải chi tiết đi kèm trên từng tem mác sản phẩm.'
    ]
  }
};

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-[#111111] text-zinc-400 border-t border-zinc-800/80 mt-20">
      {/* Thanh cam kết dịch vụ chuẩn thiết kế thương hiệu thời trang thực tế (Minimalist Line SVG Icons) */}
      <div className="border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-zinc-800/80">
          {/* Mục 1 */}
          <div className="flex items-start gap-4 lg:pr-6">
            <svg
              className="w-6 h-6 text-zinc-200 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
            <div>
              <h4 className="text-zinc-100 text-xs font-bold uppercase tracking-wider">
                Phòng Thử Đồ Trực Tuyến
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Ướm thử kiểu dáng trang phục trên ảnh cá nhân trước khi đặt mua
              </p>
            </div>
          </div>

          {/* Mục 2 */}
          <div className="flex items-start gap-4 lg:px-6">
            <svg
              className="w-6 h-6 text-zinc-200 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
            <div>
              <h4 className="text-zinc-100 text-xs font-bold uppercase tracking-wider">
                Miễn Phí Giao Hàng
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Áp dụng cho mọi đơn hàng từ 1.000.000₫ trên toàn quốc
              </p>
            </div>
          </div>

          {/* Mục 3 */}
          <div className="flex items-start gap-4 lg:px-6">
            <svg
              className="w-6 h-6 text-zinc-200 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <div>
              <h4 className="text-zinc-100 text-xs font-bold uppercase tracking-wider">
                Đổi Trả Trong 30 Ngày
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Hỗ trợ đổi size tận nơi nhanh chóng nếu trang phục chưa vừa vặn
              </p>
            </div>
          </div>

          {/* Mục 4 */}
          <div className="flex items-start gap-4 lg:pl-6">
            <svg
              className="w-6 h-6 text-zinc-200 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <div>
              <h4 className="text-zinc-100 text-xs font-bold uppercase tracking-wider">
                Thanh Toán Đảm Bảo
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Hỗ trợ quét mã VietQR, thẻ ngân hàng và kiểm tra hàng trước khi nhận
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung chính của Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Cột 1 */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-black tracking-tight text-white">
                DUAN<span className="text-zinc-500">.STUDIO</span>
              </span>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Thương hiệu thời trang đương đại tập trung vào chất liệu bền vững, phom dáng chuẩn mực và trải nghiệm mua sắm trực tuyến tiện lợi.
            </p>

            <div className="space-y-2 pt-2 text-xs text-zinc-400">
              <p>
                <strong className="text-zinc-200">Cửa hàng chính:</strong> Tầng 2, Lotte Center, 54 Liễu Giai, Quận Ba Đình, Hà Nội
              </p>
              <p>
                <strong className="text-zinc-200">Điện thoại:</strong>{' '}
                <a href="tel:19006868" className="text-white font-semibold hover:underline">
                  1900 6868
                </a>{' '}
                (08:30 – 22:00)
              </p>
              <p>
                <strong className="text-zinc-200">Email:</strong> cskh@duanstudio.vn
              </p>
            </div>
          </div>

          {/* Cột 2 */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white border-b border-zinc-800 pb-2.5">
              Dịch Vụ Khách Hàng
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy(POLICY_DETAILS.return)}
                  className="hover:text-white transition text-left"
                >
                  Chính sách đổi trả & hoàn tiền
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy(POLICY_DETAILS.shipping)}
                  className="hover:text-white transition text-left"
                >
                  Chính sách giao hàng & kiểm hàng
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy(POLICY_DETAILS.warranty)}
                  className="hover:text-white transition text-left"
                >
                  Chính sách bảo hành trang phục
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy(POLICY_DETAILS.privacy)}
                  className="hover:text-white transition text-left"
                >
                  Chính sách bảo mật thông tin
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <p className="text-[11px] font-semibold text-zinc-300 mb-2">
                Đăng ký nhận thông tin bộ sưu tập mới:
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-1.5">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Địa chỉ email của bạn..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg text-xs font-bold transition"
                >
                  Đăng ký
                </button>
              </form>
              {subscribed && (
                <p className="text-[11px] text-emerald-400 mt-1.5">
                  Đã đăng ký nhận bản tin thành công.
                </p>
              )}
            </div>
          </div>

          {/* Cột 3: Google Maps */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                Vị Trí Cửa Hàng
              </h4>
              <a
                href="https://maps.google.com/?q=Lotte+Center+Hanoi"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-400 hover:text-white underline"
              >
                Xem trên Google Maps ↗
              </a>
            </div>

            <div className="rounded-xl overflow-hidden border border-zinc-800 h-52 bg-zinc-900">
              <iframe
                title="DUAN.STUDIO Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.0969490732515!2d105.85017607596973!3d21.02880648777581!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953357c995%3A0x1babf6bb4f9a20e!2zSOG7kyBIb8OgbiBLaeG6v20!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} DUAN.STUDIO. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span>VietQR</span>
            <span>•</span>
            <span>Visa / Mastercard</span>
            <span>•</span>
            <span>COD</span>
          </div>
        </div>
      </div>

      {activePolicy && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-zinc-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <h3 className="font-bold text-base sm:text-lg text-zinc-950">
                {activePolicy.title}
              </h3>
              <button
                onClick={() => setActivePolicy(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 font-bold text-xs"
              >
                ✕
              </button>
            </div>
            <div className="py-5 space-y-3 text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {activePolicy.content.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            <div className="flex justify-end pt-3 border-t border-zinc-100">
              <button
                onClick={() => setActivePolicy(null)}
                className="px-6 py-2 rounded-lg bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}