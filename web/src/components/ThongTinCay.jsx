// Thành phần 5 + 9 (UC02, UC05): nội dung cửa sổ thông tin cây. Xem thuộc tính; khi đã đăng nhập có nút Sửa / Xóa / Nhân bản
// (Sửa, Xóa chỉ bật với cây thuộc khu mình phụ trách). Sửa mở BIỂU MẪU Ở SIDEBAR PHẢI (App.batSua, mục 224) như Thêm cây;
// xóa có bước xác nhận ngay trong cửa sổ.
// Cửa sổ do ArcGIS dựng (có thể trong shadow DOM) nên kiểu CSS được nhúng ngay trong nội dung. Cửa sổ là thanh ngang thấp
// dưới đáy bản đồ (cao bằng Chú giải loài cây): tiêu đề một dòng tự vẽ, chỉ số dạng lưới, không cần cuộn khi xem.
import { useState, useSyncExternalStore } from 'react';
import { useDoCaoCuaSo } from '../dungDoCao.js';
import { vn2000SangWgs84, lienKetGoogleMaps } from '../scene/vn2000.js';
import { timTinhTrang } from '../tinhTrang.js';
import { tenNgan } from './BangThongKe.jsx';

const so = (v, d) => (v === null || v === undefined || v === '' ? '' : Number(v).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d }));

const CSS = `
.ttc-loi-vi-tri { color: #b3261e; }
.ttc { font: 13px "Segoe UI", Arial, sans-serif; color: #1f2a1f; }
/* Dòng tiêu đề tự vẽ (thanh tiêu đề ArcGIS bị ẩn để tiết kiệm chiều cao): mã cây, loài, tình trạng, khu | nút */
.ttc-dau { display: flex; align-items: center; gap: 6px 10px; flex-wrap: wrap; margin-bottom: 6px; }
.ttc-ten { font-weight: 700; font-size: 15px; color: #1b5e20; }
.ttc-phu { color: #5f6b5f; font-size: 12.5px; }
.ttc-phu i { font-size: 12px; }
.ttc-dau-nut { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.ttc-dong { all: unset; cursor: pointer; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; font-size: 18px; color: #5f6b5f; }
.ttc-dong:hover:not(:disabled), .ttc-dong:focus-visible { background: rgba(0,0,0,.08); color: #1f2a1f; }
.ttc-tt { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; padding: 1px 8px; border-radius: 10px; background: rgba(255,255,255,.7); border: 1px solid #e0e4e0; }
.ttc-tt b { width: 10px; text-align: center; }
/* Đối tượng trong tầm đổ: một dòng ngang */
.ttc-pt { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 14px; margin-bottom: 6px; padding: 4px 9px; border-radius: 6px;
  border: 1px solid #ffcc80; background: rgba(255,248,238,.92); font-size: 12.5px; }
.ttc-pt-td { font-weight: 700; color: #b34700; text-transform: uppercase; font-size: 11.5px; letter-spacing: .3px; }
.ttc-pt b { color: #b71c1c; }
.ttc-muc { font-weight: 700; padding: 0 7px; border-radius: 8px; }
.ttc-muc.cao { background: #d03b3b; color: #fff; } .ttc-muc.tb { background: #f57c00; color: #fff; } .ttc-muc.thap { background: #fff3cd; color: #7a5300; }
/* Chỉ số kích thước: lưới nhãn trên - giá trị dưới */
.ttc-chi-so { display: flex; flex-wrap: wrap; gap: 4px 18px; margin-bottom: 6px; }   /* 5 chỉ số một hàng; mỗi giá trị không xuống dòng */
.ttc-chi-so div { display: flex; flex-direction: column; white-space: nowrap; }
.ttc-chi-so span { color: #5f6b5f; font-size: 11px; }
.ttc-chi-so b { font-weight: 600; font-size: 13.5px; }
.ttc-toa-do { font-size: 12.5px; color: #3a463a; line-height: 1.45; }
.ttc-toa-do span { color: #5f6b5f; }
.ttc-gmap { color: #1a73e8; text-decoration: none; font-weight: 600; white-space: nowrap; }
.ttc-gmap:hover { text-decoration: underline; }
.ttc-ghi { font-size: 12px; color: #5f6b5f; margin: 4px 0 0; }
.ttc-nut { white-space: nowrap; height: 28px; padding: 0 12px; border-radius: 6px; border: 1px solid #d5dbd5; background: #fff; font: 600 13px "Segoe UI", Arial; cursor: pointer; color: #1f2a1f; }
.ttc-nut:disabled { opacity: .45; cursor: not-allowed; }
.ttc-nut.chinh { background: #2e7d32; border-color: #2e7d32; color: #fff; }
.ttc-nut.nguy { color: #c62828; border-color: #e57373; }
.ttc-nut.nguy-dac { background: #c62828; border-color: #c62828; color: #fff; }
.ttc-hang-nut { display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
.ttc-loi { background: #ffebee; color: #b71c1c; border: 1px solid #ef9a9a; border-radius: 6px; padding: 5px 9px; font-size: 12.5px; margin: 4px 0; }
/* Biểu mẫu sửa: lưới nhiều cột */
.ttc form { display: grid; grid-template-columns: repeat(auto-fill, minmax(105px, 1fr)); gap: 0 10px; }   /* H, R, DBH một hàng */
.ttc form > .ttc-vi-tri, .ttc form > .ttc-loi, .ttc form > .ttc-hang-nut { grid-column: 1 / -1; }
.ttc form > .ttc-loai { grid-column: 1 / -1; }
.ttc form > .ttc-ngay { grid-column: span 2; }   /* ô chọn ngày cần rộng hơn một cột */
.ttc-truong { display: block; font-size: 11.5px; color: #5f6b5f; margin-bottom: 4px; }
.ttc-truong input, .ttc-truong select { display: block; width: 100%; box-sizing: border-box; margin-top: 2px; height: 28px; border: 1px solid #c8cfc8;
  border-radius: 5px; padding: 0 8px; font: 13.5px "Segoe UI", Arial; color: #1f2a1f; background: #fff; }
.ttc-vi-tri { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12.5px; color: #5f6b5f;
  background: rgba(246,247,245,.9); border-radius: 6px; padding: 4px 8px; margin-bottom: 6px; }
.ttc-vi-tri b { color: #8a4b08; }
.ttc-xac-nhan { background: #fff3e0; border-radius: 6px; padding: 7px 10px; font-size: 13px; }
`;

// Tình trạng kèm biểu tượng (dùng chung với Thống kê cây xanh)
function TinhTrang({ ten }) {
  const t = timTinhTrang(ten);
  return <span className="ttc-tt" id="ttc-tinh-trang" style={t ? { borderColor: t.mau } : undefined}>{t && <b style={{ color: t.mau }} aria-hidden="true">{t.bieuTuong}</b>}{ten}</span>;
}

export default function ThongTinCay({ a, kho }) {
  const k = useSyncExternalStore(kho.subscribe, kho.get);
  const [cheDo, setCheDo] = useState('xem');      // 'xem' | 'xoa' (sửa: biểu mẫu ở sidebar phải)
  const [loi, setLoi] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const coQuyen = !!k.tk && (k.kyThuat || k.dsKhu.includes(a.ma_khu_vuc));
  const che = coQuyen ? cheDo : 'xem';             // đăng xuất / mất quyền giữa chừng -> chỉ xem
  const veXem = () => { setCheDo('xem'); setLoi(''); };
  const gui = async (viec) => {
    setDangGui(true); setLoi('');
    try { await viec(); } catch (e) { setLoi(e.message); } finally { setDangGui(false); }
  };
  const wgs = Number.isFinite(a.x) ? vn2000SangWgs84(a.x, a.y) : null;
  // Đo chiều cao nội dung -> cửa sổ và Chú giải cao bằng nhau (dungDoCao.js)
  const gocRef = useDoCaoCuaSo(false);
  const pt = k.ptCay?.[a.ma_cay];                   // có trong kết quả Phân tích nguy cơ hiện tại

  return (
    <div className="ttc" id={`ttc-${a.ma_cay}`} ref={gocRef}>
      <style>{CSS}</style>
      <div className="ttc-dau">
        {/* Tên khoa học để ở tooltip của tên loài (đã có ở Chú giải bên cạnh) cho dòng tiêu đề gọn một dòng */}
        <span className="ttc-ten">Cây #{a.ma_cay}</span>
        <span className="ttc-phu" title={a.ten_khoa_hoc}>{a.ten_loai}</span>
        <TinhTrang ten={a.tinh_trang} />
        <span className="ttc-phu" title={a.ten_khu_vuc}>{tenNgan(a.ten_khu_vuc ?? '')}</span>
        <span className="ttc-dau-nut">
          {che === 'xem' && k.tk && <>
            <button type="button" className="ttc-nut" id="ttc-nut-sua" disabled={!coQuyen} onClick={() => k.hd.batSua?.(a)}>✎ Sửa</button>
            <button type="button" className="ttc-nut nguy" id="ttc-nut-xoa" disabled={!coQuyen} onClick={() => { setLoi(''); setCheDo('xoa'); }}>✕ Xóa</button>
            {/* Nhân bản: mẫu từ BẤT KỲ cây nào; chỉ cần tài khoản có quyền thêm ở ít nhất một khu (vùng đặt do App quyết định) */}
            <button type="button" className="ttc-nut" id="ttc-nut-nhan-ban" disabled={!(k.kyThuat || k.dsKhu.length)} onClick={() => k.hd.nhanBan?.(a)}
              title="Tạo cây mới với thuộc tính của cây này (trừ tình trạng); chọn vị trí mới và kiểm tra lại thuộc tính trước khi lưu">⧉ Nhân bản</button>
          </>}
          <button type="button" className="ttc-dong" id="ttc-dong" aria-label="Đóng" title="Đóng" onClick={() => k.hd.dongCuaSo?.()}>×</button>
        </span>
      </div>
      {che === 'xem' && (<>
        {pt && <div className="ttc-pt" id="ttc-pt">
          <span className="ttc-pt-td">Đối tượng trong vùng ngã đổ 1,5 × H ({so(pt.tam_do, 1)} m)</span>
          {pt.kc_nha !== null && <span>Tòa nhà {pt.ten_toa_nha || `#${pt.ma_toa_nha}`}: <b>{so(pt.kc_nha, 1)} m</b></span>}
          {pt.kc_duong !== null && <span>Đường {pt.ten_duong || `#${pt.ma_duong}`} ({pt.cap_duong}): <b>{so(pt.kc_duong, 1)} m</b></span>}
          <span className={'ttc-muc ' + (pt.muc_nguy_hiem === 'Cao' ? 'cao' : pt.muc_nguy_hiem === 'Trung bình' ? 'tb' : 'thap')}
            title="Theo vùng mục tiêu ISA của đối tượng gần nhất: trong tán / 1 × H / 1,5 × H">Mức nguy hiểm: {pt.muc_nguy_hiem} ({pt.vung_muc_tieu?.toLowerCase()})</span>
          <span>Ảnh hưởng: {pt.so_toa_nha} tòa nhà, {pt.so_doan_duong} đoạn đường · xa nhất {so(pt.kc_xa_nhat, 1)} m</span>
        </div>}
        <div className="ttc-chi-so">
          <div><span>Chiều cao</span><b>{so(a.chieu_cao, 1)} m</b></div>
          <div><span>Bán kính tán</span><b>{so(a.ban_kinh_tan, 1)} m</b></div>
          <div><span>DBH</span><b>{so(a.dbh, 1)} cm</b></div>
          <div><span>Ngày trồng</span><b>{a.ngay_trong}</b></div>
          <div><span>Tuổi</span><b>{so(a.tuoi, 0)} năm</b></div>
        </div>
        {wgs && <div className="ttc-toa-do" id="ttc-toa-do">
          <span>VN-2000:</span> {so(a.x, 1)}; {so(a.y, 1)} · <span>WGS84:</span> {wgs.lat.toFixed(6)}, {wgs.lon.toFixed(6)}{' '}
          <a className="ttc-gmap" id="ttc-gmap" href={lienKetGoogleMaps(wgs)} target="_blank" rel="noopener noreferrer">Google Maps ↗</a>
        </div>}
        {k.tk && !coQuyen && <p className="ttc-ghi" id="ttc-ngoai-khu">Cây thuộc {a.ten_khu_vuc}, Người phụ trách: {k.nqlKhu[a.ma_khu_vuc] ?? 'chưa phân công'}.</p>}
      </>)}

      {che === 'xoa' && (<>
        <div className="ttc-xac-nhan">Xóa vĩnh viễn <b>cây #{a.ma_cay}</b> ({a.ten_loai}, {a.ten_khu_vuc}) khỏi CSDL?</div>
        {loi && <div className="ttc-loi" id="ttc-loi">{loi}</div>}
        <div className="ttc-hang-nut">
          <button type="button" className="ttc-nut nguy-dac" disabled={dangGui} id="ttc-nut-xac-nhan-xoa"
            onClick={() => gui(() => k.hd.xoa(a.ma_cay))}>{dangGui ? 'Đang xóa…' : `Xác nhận xóa cây #${a.ma_cay}`}</button>
          <button type="button" className="ttc-nut" onClick={veXem}>Hủy</button>
        </div>
      </>)}
    </div>
  );
}
