// Đồng bộ chiều cao hộp Chú giải loài cây và cửa sổ thông tin cây (nằm ngang cạnh nhau dưới đáy bản đồ):
// mỗi khối báo chiều cao NỘI DUNG của mình, chiều cao chung = khối cao hơn -> hai khối bằng nhau, vừa đủ nội dung.
// Cửa sổ đóng (hoặc đang sửa cây: cửa sổ tự cao theo biểu mẫu) thì chú giải về chiều cao của chính nó.
// Mỗi nội dung cửa sổ báo kèm mã riêng: nội dung cũ được gỡ SAU khi nội dung mới đã báo, nên chỉ chủ hiện tại mới xóa được.
const cao = { chuGiai: 0, cuaSo: 0, chu: null };

function cap() {
  document.documentElement.style.setProperty('--chieu-cao-chung', `${Math.max(cao.chuGiai, cao.cuaSo)}px`);
}

/** Hộp chú giải báo chiều cao tự nhiên (nội dung + lề trong + viền). */
export function baoChuGiai(h) { cao.chuGiai = h; cap(); }
/** Nội dung cửa sổ thông tin (mã `chu`) báo chiều cao cần (nội dung + lề trong khung ArcGIS); 0 khi đang sửa. */
export function baoCuaSo(chu, h) { cao.chu = chu; cao.cuaSo = h; cap(); }
/** Gỡ báo cáo: chỉ khi `chu` vẫn là nội dung hiện tại (hoặc chu = null: cửa sổ đã đóng). */
export function xoaCuaSo(chu = null) { if (chu === null || cao.chu === chu) { cao.chu = null; cao.cuaSo = 0; cap(); } }
