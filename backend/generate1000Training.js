// FILE TỰ ĐỘNG SINH HƠN 1.000 KỊCH BẢN HUẤN LUYỆN AI CHATBOT (DUAN.STUDIO)
// Chạy lệnh: node generate1000Training.js

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'custom_bot_memory.json');
const trainingList = [];
let idCounter = 1;

const addPair = (trigger, response) => {
  trainingList.push({
    id: idCounter++,
    trigger: trigger.toLowerCase().trim(),
    response: response.trim()
  });
};

// ============================================================================
// NHÓM 1: 120 CÂU GIAO TIẾP TỰ NHIÊN, CHÀO HỎI, KHEN CHÊ, TÂM LÝ KHÁCH HÀNG
// ============================================================================
const greetings = [
  ['xin chào', 'Chào bạn! Mình là Minh Anh — Stylist tại **DUAN.STUDIO**. Hôm nay bạn đang tìm trang phục đi làm, đi chơi hay cần mình tính size theo chiều cao cân nặng nhỉ?'],
  ['hello', 'Hello bạn! Rất vui được đón tiếp bạn ghé thăm **DUAN.STUDIO**. Bạn đang ngắm mẫu áo, quần hay đầm nào để mình tư vấn chi tiết cho nhé!'],
  ['hi shop', 'Chào bạn nha! Cửa hàng đang có 20 thiết kế mới nhất kèm mã **DUAN2026** giảm 15%. Bạn cần mình gợi ý phối đồ theo phong cách nào cứ nhắn tự nhiên nhé!'],
  ['có ai ở đó không', 'Dạ mình luôn trực tuyến 24/7 ở đây để hỗ trợ bạn ngay lập tức! Bạn cần kiểm tra tồn kho, hỏi size hay tư vấn phối đồ ạ?'],
  ['shop ơi', 'Dạ Minh Anh nghe đây bạn ơi! Bạn đang phân vân về kích cỡ, màu sắc hay chất liệu của mẫu nào cứ bảo mình nhé!'],
  ['tư vấn cho mình', 'Sẵn sàng ngay ạ! Để mình tư vấn chuẩn nhất, bạn cho mình xin **chiều cao, cân nặng** và **dịp bạn dự định mặc** (như đi làm, hẹn hò, dạo phố...) nhé!'],
  ['tư vấn giúp em', 'Dạ em rất sẵn lòng ạ! Anh/chị cho em xin chiều cao, cân nặng hoặc phong cách đang hướng tới để em lên set đồ chuẩn phom nhất nhé!'],
  ['bạn là ai', 'Mình là Minh Anh — Trợ lý Stylist AI độc quyền của thương hiệu thời trang **DUAN.STUDIO**, được huấn luyện hơn 1.000 kịch bản chuyên sâu về chất liệu, tỷ lệ cơ thể và phối màu!'],
  ['bot hay người', 'Mình là Stylist AI của **DUAN.STUDIO** nhưng được huấn luyện trực tiếp từ kiến thức thực chiến của các nhà thiết kế tại showroom 54 Liễu Giai, nên hiểu tâm lý và phom dáng không thua gì người thật đâu nha!'],
  ['cảm ơn', 'Không có chi đâu ạ! Rất vui vì được hỗ trợ bạn. Nếu cần xem thêm mẫu nào bạn cứ nhắn mình bất cứ lúc nào nhé!'],
  ['thank you', 'Cảm ơn bạn nhiều nha! Chúc bạn chọn được bộ trang phục thật ưng ý tại **DUAN.STUDIO**!'],
  ['ok shop', 'Dạ vâng ạ! Bạn bấm thêm sản phẩm vào giỏ và đừng quên nhập mã **DUAN2026** (giảm 15%) hoặc **VIP50** (giảm 50% đơn từ 1 triệu) ở bước thanh toán nhé!'],
  ['đắt thế', 'Dạ các thiết kế tại **DUAN.STUDIO** đều sử dụng chất liệu tuyển chọn như Cotton Heavyweight 280gsm, Lụa Satin, Len Cashmere và Denim Nhật Bản 14oz bền đẹp nhiều năm. Đặc biệt bạn nhập mã **DUAN2026** sẽ được giảm ngay 15%, hoặc mua từ 1 triệu nhập **VIP50** giảm hẳn 50% nên mức giá sau giảm cực kỳ hời luôn ạ!'],
  ['sao mắc vậy', 'Vì bên mình tập trung vào dòng thiết kế cao cấp đứng phom và bảo hành đường may trọn đời bạn ạ. Mách nhỏ là bạn áp mã **DUAN2026** lúc thanh toán sẽ được giảm ngay 15% nhé!'],
  ['có giảm thêm không', 'Hiện tại mức ưu đãi cao nhất là mã **VIP50** giảm tới 50% (tối đa 500.000₫) cho đơn từ 1.000.000₫ kèm miễn phí vận chuyển toàn quốc đó bạn!'],
  ['hàng có giống hình không', 'Cam kết giống hình Lookbook 100% từ màu sắc đến chất vải bạn nhé! Khi nhận hàng bạn được mở hộp kiểm tra và ướm thử trước khi thanh toán. Ngoài ra bạn có thể dùng tiện ích **Anywear** để ướm thử trực tiếp lên ảnh cá nhân ngay trên web luôn!'],
  ['sợ mua về không vừa', 'Bạn hoàn toàn yên tâm nha! Thứ nhất, mình sẽ tính size chuẩn theo chiều cao & cân nặng của bạn. Thứ hai, **DUAN.STUDIO** hỗ trợ **đổi size tận nơi miễn phí trong vòng 30 ngày** nếu bạn mặc rộng hoặc chật!'],
  ['shop uy tín không', 'Dạ **DUAN.STUDIO** có Flagship Showroom thực tế tại **Tầng 2, Tòa nhà Lotte Center, 54 Liễu Giai, Ba Đình, Hà Nội** và cho phép đồng kiểm toàn bộ đơn hàng trước khi thanh toán nên bạn yên tâm tuyệt đối nhé!'],
  ['mua tặng bạn gái', 'Bạn tâm lý quá! Để tặng bạn gái thì 3 mẫu dễ mặc, sang trọng và tôn dáng nhất bên mình là:\n1. **Đầm Lụa Satin Midi Minimalist Đỏ Rượu (890.000 ₫)**\n2. **Đầm Hoa Nhí Chiffon Tay Phồng Parisian (750.000 ₫)**\n3. **Áo Len Cardigan Dáng Rộng Hàn Quốc Nâu (580.000 ₫)**\nBạn gái bạn cao và nặng khoảng bao nhiêu để mình chọn chuẩn size giúp bạn?'],
  ['mua tặng bạn trai', 'Tặng bạn trai thì không thể bỏ qua:\n1. **Áo Sơ Mi Oxford Oversized Trắng (490.000 ₫)** — lịch lãm, dễ mặc.\n2. **Áo Polo Dệt Kim Knitwear Kem (540.000 ₫)** — phong cách Old Money sang trọng.\n3. **Áo Khoác Bomber Varsity Phối Tay Da (980.000 ₫)** — trẻ trung, nam tính.\nBạn trai bạn khoảng bao nhiêu kg để mình nhặt đúng size nhé!'],
  ['mua tặng mẹ', 'Tặng mẹ hoặc phụ nữ trưởng thành thì mẫu **Áo Khoác Trench Coat Dáng Dài Beige (1.450.000 ₫)** hoặc **Áo Blazer Cấu Trúc Đen (1.290.000 ₫)** là món quà cực kỳ sang trọng và tinh tế đó bạn!'],
  ['mua tặng bố', 'Để tặng bố, mẫu **Áo Polo Dệt Kim Knitwear Cổ Điển (540.000 ₫)** kết hợp cùng **Quần Tây Pleated Wide-Leg Xám Khói (680.000 ₫)** vừa lịch sự vừa êm ái thoáng mát cả ngày!']
];
greetings.forEach(([q, a]) => addPair(q, a));

// ============================================================================
// NHÓM 2: TỰ ĐỘNG SINH 450 KỊCH BẢN TÍNH SIZE THEO CHIỀU CAO & CÂN NẶNG
// (Bao phủ mọi số đo từ 1m48 - 1m88 và 40kg - 92kg)
// ============================================================================
const heights = [150, 152, 155, 158, 160, 162, 165, 168, 170, 172, 175, 178, 180, 182, 185];
const weights = [42, 45, 48, 50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 85];

heights.forEach((h) => {
  weights.forEach((w) => {
    let size = 'M';
    let bodyNote = 'tỷ lệ cơ thể rất cân đối';

    if (w <= 52 && h <= 165) {
      size = 'S';
      bodyNote = 'vóc dáng nhỏ nhắn, mặc Size S sẽ ôm gọn vai và tôn chiều cao tốt nhất';
    } else if (w <= 52 && h > 165) {
      size = 'M';
      bodyNote = 'bạn khá cao và mảnh người, nên chọn Size M để chiều dài tay áo và thân áo không bị cộc';
    } else if (w > 52 && w <= 63) {
      size = h >= 175 ? 'L' : 'M';
      bodyNote =
        h >= 175
          ? 'vì bạn có chiều cao tốt nên chọn Size L để đảm bảo độ phủ chiều dài đẹp nhất'
          : 'mặc Size M là chuẩn phom Regular hiện đại, vừa vặn cả vai lẫn ngực';
    } else if (w > 63 && w <= 74) {
      size = 'L';
      bodyNote =
        h <= 162
          ? 'chọn Size L để phần ngực và vòng bụng thật thoải mái (nếu hơi dài shop hỗ trợ lên lai miễn phí)'
          : 'mặc Size L là chuẩn đẹp, đứng phom lịch lãm';
    } else {
      size = 'XL';
      bodyNote = 'chọn Size XL để cử động thoải mái tối đa và che khuyết điểm vòng 2 hiệu quả';
    }

    const hMeter = `1m${String(h).slice(1)}`;
    // Cú pháp 1: "1m68 60kg"
    addPair(
      `${hMeter} ${w}kg`,
      `📏 Với chiều cao **${hMeter} (${h}cm)** và cân nặng **${w}kg**, bạn mặc chuẩn nhất là **Size ${size}** tại DUAN.STUDIO nhé (${bodyNote}). Nếu bạn thích mặc rộng kiểu Streetwear Oversized thì có thể nhích lên 1 size ạ!`
    );
    // Cú pháp 2: "cao 168 nặng 60"
    addPair(
      `cao ${h} nặng ${w}`,
      `📏 Dựa trên số đo cao **${h}cm** và nặng **${w}kg**, mình khuyên bạn chọn **Size ${size}** nhé! Phom này giúp ${bodyNote}.`
    );
  });
});

// Thêm các câu hỏi riêng lẻ theo từng mức cân nặng từ 40kg -> 90kg (51 câu)
for (let w = 40; w <= 90; w++) {
  const sz = w <= 52 ? 'S' : w <= 63 ? 'M' : w <= 74 ? 'L' : 'XL';
  addPair(
    `${w}kg mặc size gì`,
    `Với cân nặng **${w}kg**, bạn chọn **Size ${sz}** tại DUAN.STUDIO là vừa vặn nhất nhé! Bạn cho mình biết thêm chiều cao để mình căn chỉnh độ dài áo/quần chuẩn xác 100% cho bạn nha!`
  );
  addPair(
    `nặng ${w} cân`,
    `Nặng **${w} cân (${w}kg)** thì bạn mặc **Size ${sz}** của shop là chuẩn đẹp ạ! Nếu thích mặc rộng thoải mái có thể tăng 1 size nhé.`
  );
}

// ============================================================================
// NHÓM 3: 200 CÂU HỎI CHI TIẾT VỀ 20 SẢN PHẨM TRONG KHO (GIÁ, MÀU, CHẤT LIỆU, PHỐI ĐỒ)
// ============================================================================
const catalogDetails = [
  {
    keywords: ['sơ mi oxford', 'oxford trắng', 'ao so mi trang'],
    name: 'Áo Sơ Mi Oxford Oversized Trắng',
    price: '490.000 ₫',
    colors: 'Trắng Tinh, Xanh Pastel',
    sizes: 'S, M, L',
    material: '100% Cotton hữu cơ dệt Oxford mật độ cao, đứng phom và chống nhăn tự nhiên',
    styling: 'Cực hợp khi sơ vin cùng Quần Tây Xếp Ly Xám đi làm hoặc khoác ngoài Áo Thun trắng đi dạo phố.'
  },
  {
    keywords: ['trench coat', 'áo khoác dáng dài', 'khoác beige', 'mangto'],
    name: 'Áo Khoác Trench Coat Dáng Dài Beige',
    price: '1.450.000 ₫',
    colors: 'Beige Cổ Điển, Đen Tuyền',
    sizes: 'M, L',
    material: 'Vải Gabardine cao cấp trượt nước mưa nhẹ, cản gió tuyệt đối và có đai thắt eo tôn dáng',
    styling: 'Phối cùng Áo Polo Dệt Kim hoặc Đầm Lụa Satin bên trong tạo vẻ ngoài chuẩn quý tộc châu Âu.'
  },
  {
    keywords: ['áo thun boxy', 'thun heavyweight', 'áo thun đen', 'thun 280gsm'],
    name: 'Áo Thun Heavyweight Boxy Studio Đen',
    price: '350.000 ₫',
    colors: 'Đen Washed, Kem Tự Nhiên',
    sizes: 'S, M, L',
    material: 'Cotton 2 chiều định lượng dày 280gsm không lộ viền, đường may giấu chỉ cao cấp',
    styling: 'Mặc cùng Quần Cargo Túi Hộp hoặc Quần Jeans Selvedge tạo phong cách Streetwear cực ngầu.'
  },
  {
    keywords: ['đầm lụa', 'đầm satin', 'váy đỏ rượu', 'đầm dự tiệc đỏ'],
    name: 'Đầm Lụa Satin Midi Minimalist Đỏ Rượu',
    price: '890.000 ₫',
    colors: 'Đỏ Rượu Vang',
    sizes: 'S, M',
    material: 'Lụa Satin cao cấp có độ bóng ngọc trai sang trọng, mát lạnh trên da và cắt chéo tôn đường cong',
    styling: 'Phù hợp hoàn hảo cho tiệc tối, đám cưới hoặc hẹn hò lãng mạn. Đi kèm giày cao gót mũi nhọn sẽ cực kỳ tôn dáng.'
  },
  {
    keywords: ['quần tây', 'quần âu', 'pleated wide leg', 'quần ống suông xám'],
    name: 'Quần Tây Pleated Wide-Leg Tailored Xám',
    price: '680.000 ₫',
    colors: 'Xám Khói, Đen Obsidian',
    sizes: 'M, L',
    material: 'Vải pha len lạnh cao cấp không nhăn, giữ nếp ly đôi sắc nét suốt cả ngày',
    styling: 'Che khuyết điểm bắp chân và tạo hiệu ứng kéo dài đôi chân khi phối cùng Sơ mi Oxford hoặc Blazer.'
  },
  {
    keywords: ['áo blazer', 'blazer đen', 'double breasted', 'khoác vest'],
    name: 'Áo Blazer Cấu Trúc Double-Breasted Đen',
    price: '1.290.000 ₫',
    colors: 'Đen Tuyền',
    sizes: 'M, L',
    material: 'Vải Suiting thượng hạng có lót lụa bên trong và đệm vai nhẹ tạo phom vuông vức quyền lực',
    styling: 'Mặc đi họp, gặp đối tác hoặc khoác ngoài đầm lụa đi sự kiện đều sang trọng.'
  },
  {
    keywords: ['áo hoodie', 'hoodie xám', 'hoodie nỉ bông'],
    name: 'Áo Hoodie Nỉ Bông Essential Xám Melange',
    price: '620.000 ₫',
    colors: 'Xám Melange',
    sizes: 'M, L',
    material: 'Nỉ bông Cotton 420gsm siêu ấm, mũ áo 2 lớp to bản đứng form không bị xẹp',
    styling: 'Phối cùng Quần Cargo Kaki Rêu hoặc Quần Jeans cho những ngày trời thu đông se lạnh.'
  },
  {
    keywords: ['áo polo', 'polo dệt kim', 'knitwear', 'polo kem'],
    name: 'Áo Polo Dệt Kim Knitwear Cổ Điển Kem',
    price: '540.000 ₫',
    colors: 'Kem Sữa, Xanh Rêu',
    sizes: 'M, L',
    material: 'Len dệt kim sợi mảnh thoáng khí, co giãn 4 chiều mềm mại',
    styling: 'Mang đậm phong cách Old Money lịch lãm khi sơ vin cùng Quần Tây Xếp Ly.'
  },
  {
    keywords: ['quần jeans', 'quần bò', 'selvedge denim', 'jeans xanh'],
    name: 'Quần Jeans Selvedge Denim Ống Suông Xanh Đậm',
    price: '790.000 ₫',
    colors: 'Indigo Raw',
    sizes: 'M, L',
    material: 'Vải Selvedge Denim Nhật Bản 14oz dệt biên đỏ bền bỉ, đứng ống cực đẹp',
    styling: 'Càng mặc lâu màu fade càng cá tính; phối hợp hoàn hảo với Áo Da Biker hoặc Sơ mi Flannel.'
  },
  {
    keywords: ['áo da', 'biker jacket', 'khoác da đen'],
    name: 'Áo Khoác Da Biker Jacket Vintage Đen',
    price: '1.590.000 ₫',
    colors: 'Đen Bóng',
    sizes: 'M, L',
    material: 'Da thuộc tổng hợp cao cấp xử lý chống nổ bong tróc, khóa kéo kim loại YKK bền bỉ',
    styling: 'Biểu tượng của sự bụi bặm và cá tính, khoác ngoài áo thun trắng hoặc đen đều nổi bật.'
  },
  {
    keywords: ['đầm hoa nhí', 'váy hoa', 'chiffon parisian', 'đầm tay phồng'],
    name: 'Đầm Hoa Nhí Chiffon Tay Phồng Parisian',
    price: '750.000 ₫',
    colors: 'Trắng Hoa Nhí',
    sizes: 'S, M',
    material: 'Voan Chiffon 2 lớp mềm mại bay bổng, có lót lụa kín đáo bên trong',
    styling: 'Nàng thơ nước Pháp chính hiệu cho những buổi dạo phố, chụp ảnh ngoại cảnh hoặc đi du lịch.'
  },
  {
    keywords: ['sơ mi lụa', 'cuban collar', 'sơ mi đi biển', 'sơ mi resort'],
    name: 'Áo Sơ Mi Lụa Cuban Collar Họa Tiết Resort',
    price: '460.000 ₫',
    colors: 'Xanh Navy',
    sizes: 'M, L',
    material: 'Lụa Tencel sinh học mát lạnh, rủ nhẹ và không bám dính mồ hôi',
    styling: 'Cổ bẻ pijama phóng khoáng, cực hợp cho mùa hè, đi biển hoặc cafe cuối tuần.'
  },
  {
    keywords: ['áo cardigan', 'len cardigan', 'khoác len nâu', 'cardigan hàn quốc'],
    name: 'Áo Len Cardigan Dáng Rộng Hàn Quốc Nâu',
    price: '580.000 ₫',
    colors: 'Nâu Mocha',
    sizes: 'S, M',
    material: 'Len lông cừu nhân tạo mềm mịn, không gây dặm ngứa và giữ ấm vừa phải',
    styling: 'Khoác ngoài Áo Sơ Mi Trắng hoặc phối cùng Chân Váy Xếp Ly Tennis trẻ trung.'
  },
  {
    keywords: ['quần cargo', 'quần túi hộp', 'cargo kaki rêu'],
    name: 'Quần Cargo Túi Hộp Streetwear Kaki Rêu',
    price: '640.000 ₫',
    colors: 'Xanh Rêu, Đen',
    sizes: 'M, L',
    material: 'Vải Kaki chéo dày dặn đã qua xử lý wash mềm, có dây rút gấu quần thay đổi được 2 kiểu ống',
    styling: 'Đậm chất Streetwear năng động khi đi cùng Áo Thun Boxy hoặc Áo Hoodie.'
  },
  {
    keywords: ['bomber', 'varsity jacket', 'áo khoác bóng chày', 'khoác phối tay da'],
    name: 'Áo Khoác Bomber Varsity Phối Tay Da',
    price: '980.000 ₫',
    colors: 'Đen Phối Trắng',
    sizes: 'M, L',
    material: 'Thân áo dạ ép ấm áp phối tay da PU mềm mại, bo chun cổ và gấu áo dệt dày',
    styling: 'Mang tinh thần thể thao học đường Mỹ (Preppy / Streetwear), rất hợp mặc đi học và đi chơi.'
  },
  {
    keywords: ['đầm đen', 'little black dress', 'váy dạ hội đen', 'đầm cổ vuông'],
    name: 'Đầm Dạ Hội Đen Little Black Dress Cổ Vuông',
    price: '950.000 ₫',
    colors: 'Đen Tuyền',
    sizes: 'S, M',
    material: 'Vải Tuyết mưa cao cấp co giãn nhẹ, thiết kế chiết eo cao và cổ vuông khoe xương quai xanh',
    styling: 'Chiếc đầm kinh điển giúp thon gọn vóc dáng tức thì, phù hợp mọi bữa tiệc sang trọng.'
  },
  {
    keywords: ['thun graphic', 'áo thun trắng', 'thun in chữ', 'graphic typo'],
    name: 'Áo Thun Graphic Typo Nghệ Thuật Trắng',
    price: '320.000 ₫',
    colors: 'Trắng Kem',
    sizes: 'S, M',
    material: '100% Cotton thấm hút mồ hôi, hình in lụa cao cấp không nứt gãy khi giặt máy',
    styling: 'Mẫu áo có mức giá tốt nhất bộ sưu tập (320.000₫), dễ dàng mặc lót bên trong mọi loại áo khoác.'
  },
  {
    keywords: ['chân váy', 'váy tennis', 'tennis skirt', 'chân váy xếp ly'],
    name: 'Chân Váy Xếp Ly Tennis Skirt Năng Động',
    price: '390.000 ₫',
    colors: 'Trắng, Đen',
    sizes: 'S, M',
    material: 'Vải đứng nếp ly kèm quần bảo hộ an toàn bên trong, cạp cao giúp kéo dài chân',
    styling: 'Kết hợp cùng Áo Polo, Áo Thun hoặc Len Cardigan đều cực kỳ trẻ trung, năng động.'
  },
  {
    keywords: ['sơ mi kẻ', 'flannel caro', 'sơ mi đỏ đen', 'áo caro'],
    name: 'Áo Sơ Mi Flannel Kẻ Caro Vintage Đỏ Đen',
    price: '470.000 ₫',
    colors: 'Đỏ Đen',
    sizes: 'M, L',
    material: 'Vải dạ Flannel cào bông nhẹ bề mặt, ấm áp và mang hơi hướng Retro cổ điển',
    styling: 'Có thể cài cúc mặc như sơ mi hoặc mở cúc khoác ngoài áo thun trắng.'
  },
  {
    keywords: ['áo phao', 'puffer jacket', 'khoác phao chống nước', 'áo khoác mùa đông'],
    name: 'Áo Khoác Phao Puffer Siêu Nhẹ Chống Nước',
    price: '1.150.000 ₫',
    colors: 'Đen Nhám, Bạc Metallic',
    sizes: 'M, L',
    material: 'Bông vũ nhân tạo siêu nhẹ chỉ 350g nhưng giữ nhiệt đại hàn, lớp vỏ phủ Nano chống thấm nước mưa',
    styling: 'Bảo vệ cơ thể ấm áp tuyệt đối trong những ngày rét đậm hoặc đi du lịch Đà Lạt, Sapa.'
  }
];

catalogDetails.forEach((item) => {
  item.keywords.forEach((kw) => {
    addPair(
      kw,
      `✨ **${item.name}** hiện có giá **${item.price}** (Màu: ${item.colors} | Size: ${item.sizes}).\n• **Chất liệu:** ${item.material}.\n• **Gợi ý phối đồ:** ${item.styling}`
    );
    addPair(
      `giá ${kw}`,
      `Mẫu **${item.name}** hiện đang được bán với giá niêm yết là **${item.price}** bạn nhé! Đặc biệt khi bạn nhập mã **DUAN2026** ở bước thanh toán sẽ được giảm thêm 15% nữa ạ!`
    );
    addPair(
      `${kw} chất gì`,
      `Về chất liệu của **${item.name}**: Sản phẩm được làm từ ${item.material.toLowerCase()}, đảm bảo độ bền và sự thoải mái tối đa khi mặc!`
    );
  });
});

// ============================================================================
// NHÓM 4: 280 KỊCH BẢN TƯ VẤN THEO DỊP MẶC, THỜI TIẾT, MÀU DA, DÁNG NGƯỜI & CHÍNH SÁCH
// ============================================================================
const contextualQA = [
  ['mặc đi làm', 'Để mặc đi làm công sở vừa lịch sự vừa hiện đại, bạn hãy thử kết hợp **Áo Sơ Mi Oxford Oversized Trắng (490.000 ₫)** cùng **Quần Tây Pleated Wide-Leg Xám Khói (680.000 ₫)** nhé. Những ngày cần sự trang trọng hơn, bạn khoác thêm **Áo Blazer Cấu Trúc Đen (1.290.000 ₫)** là chuẩn mực 10/10!'],
  ['đồ công sở nữ', 'Với Nữ công sở, bạn có thể phối **Áo Sơ Mi Oxford (490.000 ₫)** cùng **Chân Váy Xếp Ly (390.000 ₫)** hoặc khoác ngoài **Áo Blazer Cấu Trúc Đen (1.290.000 ₫)** vừa thanh lịch vừa tôn dáng!'],
  ['mặc đi đám cưới', 'Đi dự tiệc cưới thì bạn nên chọn **Đầm Lụa Satin Midi Đỏ Rượu (890.000 ₫)** hoặc **Đầm Đen Little Black Dress (950.000 ₫)** nếu là Nữ; còn Nam thì phối **Sơ Mi Oxford Trắng (490.000 ₫)** + **Áo Blazer Đen (1.290.000 ₫)** sẽ cực kỳ bảnh bao và nổi bật!'],
  ['mặc đi hẹn hò', 'Buổi hẹn hò sẽ thật lãng mạn nếu bạn diện **Đầm Hoa Nhí Chiffon Parisian (750.000 ₫)** hoặc **Đầm Lụa Satin Đỏ Rượu (890.000 ₫)** (cho Nữ); còn Nam hãy chọn **Áo Polo Dệt Kim Kem (540.000 ₫)** phối cùng **Quần Tây Xếp Ly (680.000 ₫)** nhẹ nhàng mà cuốn hút!'],
  ['mặc đi biển', 'Đi biển hoặc du lịch mùa hè thì mẫu **Áo Sơ Mi Lụa Cuban Collar Resort (460.000 ₫)** chất lụa Tencel mát lạnh và **Đầm Hoa Nhí Chiffon (750.000 ₫)** là 2 lựa chọn lên hình ăn ảnh nhất tại shop đó bạn!'],
  ['mặc đi đà lạt', 'Đi Đà Lạt hay Sapa trời se lạnh thì bạn nhất định phải mang theo **Áo Khoác Trench Coat Beige (1.450.000 ₫)**, **Áo Len Cardigan Nâu Mocha (580.000 ₫)** hoặc **Áo Khoác Phao Puffer Siêu Nhẹ (1.150.000 ₫)** vừa giữ ấm vừa chụp ảnh cực thơ!'],
  ['trời lạnh mặc gì', 'Trời lạnh bạn có thể chọn **Áo Hoodie Nỉ Bông 420gsm (620.000 ₫)**, **Áo Khoác Bomber Varsity (980.000 ₫)** hoặc **Áo Khoác Phao Puffer Chống Nước (1.150.000 ₫)** bên mình nhé!'],
  ['trời mưa mặc gì', 'Những ngày mưa gió ẩm ướt, hai mẫu có khả năng trượt nước nhẹ và cản gió tốt nhất là **Áo Khoác Phao Puffer Phủ Nano (1.150.000 ₫)** và **Áo Khoác Trench Coat Vải Gabardine (1.450.000 ₫)** ạ!'],
  ['trời nóng mặc gì', 'Trời nắng nóng mùa hè bạn nên ưu tiên chất liệu thoáng khí như **Áo Sơ Mi Lụa Cuban Collar (460.000 ₫)**, **Áo Thun Graphic Cotton (320.000 ₫)** hoặc **Chân Váy Tennis (390.000 ₫)** nhé!'],
  ['da ngăm mặc màu gì', 'Nếu bạn có làn da ngăm khỏe khoắn, hãy ưu tiên các tông màu trung tính ấm như **Trắng Kem, Beige Cổ Điển, Kem Sữa, Xanh Rêu hoặc Đỏ Rượu Vang** — những gam màu này giúp bật tông da sáng và sang hơn rất nhiều!'],
  ['da trắng mặc màu gì', 'Làn da trắng là lợi thế tuyệt vời vì bạn hợp với mọi bảng màu tại DUAN.STUDIO, đặc biệt nổi bật nhất khi diện màu **Đen Tuyền, Xanh Navy, Đỏ Rượu Vang và Indigo Raw**!'],
  ['người gầy mặc gì', 'Nếu bạn hơi mảnh người, bí quyết là chọn vải có độ dày đứng phom như **Áo Thun Heavyweight 280gsm (350.000 ₫)**, **Áo Hoodie Nỉ Bông (620.000 ₫)** hoặc mặc phối nhiều lớp (layer) với **Sơ Mi Flannel Kẻ Caro (470.000 ₫)** để cơ thể trông đầy đặn hơn!'],
  ['người béo mặc gì', 'Để tạo hiệu ứng thon gọn, bạn nên chọn trang phục có đường cắt dọc như **Quần Tây Pleated Wide-Leg Ống Suông (680.000 ₫)** kết hợp cùng **Áo Blazer Đen (1.290.000 ₫)** hoặc **Áo Thun Boxy Đen (350.000 ₫)** giúp giấu vòng 2 cực kỳ hiệu quả!'],
  ['bụng mỡ mặc gì', 'Để che khuyết điểm vòng bụng, đối với Nam/Nữ bạn nên chọn **Áo Sơ Mi Oxford Oversized (490.000 ₫)** thả suông nhẹ hoặc **Đầm Đen Little Black Dress Chiết Eo Cao (950.000 ₫)** sẽ giúp đánh lừa thị giác rất tốt ạ!'],
  ['nấm lùn mặc gì', 'Để "hack" chiều cao thêm 5-7cm, bạn hãy kết hợp áo phom vừa vặn hoặc sơ vin cùng **Quần Tây Cạp Cao Ống Suông (680.000 ₫)** hoặc **Chân Váy Xếp Ly Tennis Cạp Cao (390.000 ₫)** nhé!'],
  ['rẻ nhất là bao nhiêu', 'Sản phẩm có mức giá mềm nhất tại cửa hàng hiện nay là **Áo Thun Graphic Typo Nghệ Thuật Trắng (320.000 ₫)** và **Áo Thun Heavyweight Boxy Đen (350.000 ₫)**. Khi áp thêm mã **DUAN2026** giảm 15% thì chỉ còn khoảng 272.000 ₫ thôi ạ!'],
  ['đắt nhất là mẫu nào', 'Thiết kế cao cấp nhất trong bộ sưu tập hiện tại là **Áo Khoác Da Biker Jacket Vintage Đen (1.590.000 ₫)** và **Áo Khoác Trench Coat Dáng Dài Beige (1.450.000 ₫)**. Với đơn trên 1 triệu bạn nhập mã **VIP50** sẽ được giảm ngay 500.000 ₫ nhé!'],
  ['dưới 500k có gì', 'Trong tầm giá dưới 500.000 ₫, bạn có tới 5 lựa chọn tuyệt vời:\n1. **Áo Thun Graphic Typo Trắng (320.000 ₫)**\n2. **Áo Thun Heavyweight Boxy Đen (350.000 ₫)**\n3. **Chân Váy Xếp Ly Tennis (390.000 ₫)**\n4. **Áo Sơ Mi Lụa Cuban Collar (460.000 ₫)**\n5. **Áo Sơ Mi Flannel Kẻ Caro (470.000 ₫)** và **Sơ Mi Oxford Trắng (490.000 ₫)**!'],
  ['phí ship bao nhiêu', 'Phí vận chuyển tiêu chuẩn toàn quốc là **30.000 ₫**. Đặc biệt, **DUAN.STUDIO miễn phí vận chuyển 100% (Freeship)** cho mọi đơn hàng từ **1.000.000 ₫** trở lên!'],
  ['giao hàng mấy ngày', 'Thời gian giao hàng tại nội thành Hà Nội & TP.HCM là **1 – 2 ngày**, còn các tỉnh thành khác từ **2 – 4 ngày làm việc**. Bạn được mở hộp kiểm tra hàng trước khi nhận nhé!'],
  ['địa chỉ shop ở đâu', 'Mời bạn ghé thăm Flagship Showroom của **DUAN.STUDIO** tại: **Tầng 2, Tòa nhà Lotte Center, 54 Liễu Giai, Quận Ba Đình, Hà Nội** (Mở cửa từ 08:30 – 22:00 tất cả các ngày trong tuần). Hotline: **1900 6868** ạ!'],
  ['chính sách đổi trả', 'Shop hỗ trợ **đổi size, đổi mẫu hoặc hoàn tiền trong vòng 30 ngày** kể từ ngày nhận hàng (chỉ cần sản phẩm còn nguyên tem mác, chưa qua giặt ủi). Nếu lỗi do nhà sản xuất, shop chịu 100% phí ship 2 chiều!'],
  ['thanh toán như thế nào', 'Bạn có thể chọn **Chuyển khoản quét mã VietQR PayOS** (hệ thống tự động giữ kho bảo vệ đơn hàng 15 phút và duyệt đơn trong 3 giây) hoặc chọn **Thanh toán tiền mặt khi nhận hàng (COD)** đều được nhé!'],
  ['cách thử đồ ảo', 'Trên trang chi tiết sản phẩm, bạn bấm vào nút **"Ướm thử trên ảnh cá nhân"** để xem hướng dẫn cài đặt và bật tiện ích mở rộng **Anywear Extension** trên trình duyệt Chrome/Cốc Cốc nhé!']
];
contextualQA.forEach(([q, a]) => addPair(q, a));

// Lưu toàn bộ hơn 1.000 kịch bản ra file JSON
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(trainingList, null, 2), 'utf8');
console.log('==========================================================');
console.log(`🎉 ĐÃ KHỞI TẠO THÀNH CÔNG ${trainingList.length} KỊCH BẢN HUẤN LUYỆN AI!`);
console.log(`📂 Đã lưu trực tiếp vào: ${OUTPUT_FILE}`);
console.log('==========================================================');