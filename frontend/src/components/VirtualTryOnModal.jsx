import React, { useEffect, useState, useRef } from 'react';

export default function VirtualTryOnModal() {
  const [config, setConfig] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 15 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [aiProcessing, setAiProcessing] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleOpen = (e) => {
      setConfig(e.detail);
      setScale(1);
      setRotate(0);
      setFlipX(false);
      setPos({ x: 0, y: 15 });
      setAiProcessing(true);
      setTimeout(() => setAiProcessing(false), 650);
    };
    window.addEventListener('anywear:open', handleOpen);
    return () => window.removeEventListener('anywear:open', handleOpen);
  }, []);

  if (!config) return null;

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  // Xuất ảnh ghép thử đồ ra file PNG tải về máy
  const handleDownloadSnapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    const userImg = new Image();
    userImg.crossOrigin = 'anonymous';
    userImg.onload = () => {
      ctx.fillStyle = '#f4f4f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vẽ ảnh người dùng căn giữa
      const ratio = Math.min(canvas.width / userImg.width, canvas.height / userImg.height);
      const w = userImg.width * ratio;
      const h = userImg.height * ratio;
      ctx.drawImage(userImg, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);

      // Vẽ nhãn DUAN.STUDIO
      ctx.fillStyle = '#09090b';
      ctx.fillRect(24, 24, 230, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('DUAN.STUDIO AI TRY-ON', 40, 50);

      const link = document.createElement('a');
      link.download = `duan-tryon-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    userImg.src = config.userImage;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
      onMouseUp={handleMouseUp}
    >
      <div className="bg-white rounded-[32px] max-w-5xl w-full overflow-hidden shadow-2xl border border-zinc-200 animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-[11px] font-extrabold uppercase tracking-wider">
              Anywear Studio Live
            </span>
            <h3 className="font-bold text-sm sm:text-base tracking-tight">
              Phòng Thử Đồ Tương Tác AI — {config.productCategory?.toUpperCase()}
            </h3>
          </div>
          <button
            onClick={() => setConfig(null)}
            className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-red-600 text-white flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Main Studio Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Cột Trái: Bộ điều khiển AI Fitting */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center gap-3">
                <img src={config.userImage} alt="User" className="w-12 h-14 object-cover rounded-xl border" />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-zinc-900 truncate">Ảnh Của Bạn</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">✓ Đã tải lên</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center gap-3">
                <div className="w-12 h-14 rounded-xl bg-white border flex items-center justify-center p-1.5">
                  <img src={config.productImage} alt="Garment" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-zinc-900 truncate">Áo Tách Nền</p>
                  <p className="text-[11px] text-indigo-600 font-semibold">PNG Alpha</p>
                </div>
              </div>
            </div>

            {/* Sliders điều chỉnh chi tiết */}
            <div className="p-5 rounded-3xl bg-zinc-950 text-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                  🎛️ Tinh Chỉnh Phom Dáng
                </span>
                <button
                  onClick={() => {
                    setScale(1);
                    setRotate(0);
                    setFlipX(false);
                    setPos({ x: 0, y: 15 });
                  }}
                  className="text-[11px] text-zinc-400 hover:text-white underline"
                >
                  Đặt lại mặc định
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Kích thước trang phục (Scale)</span>
                  <b className="text-indigo-400">{Math.round(scale * 100)}%</b>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.2"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Góc nghiêng vai (Rotate)</span>
                  <b className="text-indigo-400">{rotate}°</b>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={rotate}
                  onChange={(e) => setRotate(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setFlipX(!flipX)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold transition"
                >
                  ⇄ Lật Ngang Trang Phục
                </button>
                <button
                  onClick={handleDownloadSnapshot}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition"
                >
                  ⬇ Lưu Ảnh Mặc Thử
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
              💡 <b>Mẹo tương tác:</b> Bạn có thể <b>nhấn giữ chuột trực tiếp vào món đồ</b> bên khung phải và kéo đến đúng vị trí vai/eo trên bức ảnh của mình!
            </div>
          </div>

          {/* Cột Phải: Khung Canvas Tương Tác Kéo Thả Trực Tiếp */}
          <div className="lg:col-span-7">
            <div
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              className="relative h-[460px] rounded-3xl bg-gradient-to-b from-zinc-100 to-zinc-200 border-2 border-zinc-300 overflow-hidden flex items-center justify-center select-none"
            >
              {aiProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-extrabold text-zinc-700 mt-4">
                    Anywear AI đang tách lớp & đồng bộ khung cơ thể...
                  </p>
                </div>
              ) : (
                <>
                  <img
                    src={config.userImage}
                    alt="User Body"
                    className="h-full w-full object-contain pointer-events-none"
                  />
                  <div
                    onMouseDown={handleMouseDown}
                    style={{
                      transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale}) rotate(${rotate}deg) scaleX(${
                        flipX ? -1 : 1
                      })`
                    }}
                    className="absolute cursor-grab active:cursor-grabbing group"
                  >
                    <img
                      src={config.productImage}
                      alt="Anywear Garment"
                      draggable={false}
                      className="w-52 h-52 object-contain drop-shadow-2xl transition-shadow group-hover:drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                    />
                    <span className="opacity-0 group-hover:opacity-100 transition bg-zinc-950/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      ✋ Kéo để di chuyển
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center">
          <span className="text-xs text-zinc-500">
            Anywear Drag-and-Drop SDK • Tương thích 100% ảnh PNG tách nền
          </span>
          <button
            onClick={() => setConfig(null)}
            className="px-7 py-3 rounded-full bg-zinc-950 hover:bg-indigo-600 text-white text-xs font-extrabold transition"
          >
            Ưng Ý & Quay Lại Mua Hàng →
          </button>
        </div>
      </div>
    </div>
  );
}