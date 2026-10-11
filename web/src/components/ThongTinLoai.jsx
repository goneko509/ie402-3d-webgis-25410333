// Cửa sổ thông tin LOÀI CÂY (mở khi bấm một loài trong Chú giải loài cây): toàn bộ thông tin bảng loai_cay
// + số liệu tổng hợp từ dữ liệu cây (số cây, theo tình trạng, H và DBH trung bình). Chọn loài đồng bộ ở 4 nơi (App.chonNhom):
// bản đồ tập trung loài, cửa sổ này, Chú giải tô đậm, thanh Thống kê; đóng cửa sổ (×) = bỏ chọn loài.
// Hàng tình trạng: tô tình trạng đang chọn (nếu có). Nhãn đầu: đang xem toàn vùng -> khu có nhiều cây loài này nhất (bản đồ căn tới cụm cây đó).
// Dùng chung khung cửa sổ thông tin (thanh ngang dưới đáy, cao bằng Chú giải). CSS nhúng sẵn (cửa sổ dựng trong shadow DOM).
import { MAU_LOAI } from '../scene/taoCanh.js';
import { TINH_TRANG } from '../tinhTrang.js';
import { useDoCaoCuaSo } from '../dungDoCao.js';

const so = (v, d = 1) => (v === null || v === undefined || Number.isNaN(v) ? '–' : Number(v).toLocaleString('vi-VN', { maximumFractionDigits: d }));
const tb = (ds, k) => (ds.length ? ds.reduce((t, c) => t + Number(c[k] ?? 0), 0) / ds.length : null);

const CSS = `
.ttl { font: 13px "Segoe UI", Arial, sans-serif; color: #1f2a1f; }
.ttl-dau { display: flex; align-items: center; gap: 6px 10px; flex-wrap: wrap; margin-bottom: 6px; }
.ttl-cham { width: 14px; height: 14px; border-radius: 50%; flex: none; }
.ttl-ten { font-weight: 700; font-size: 15px; color: #1b5e20; }
.ttl-kh { color: #5f6b5f; font-style: italic; font-size: 12.5px; }
.ttl-dau-nut { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.ttl-nhan { font-size: 12px; font-weight: 600; color: #1b5e20; background: #e8f5e9; border-radius: 10px; padding: 2px 9px; }
.ttl-dong { all: unset; cursor: pointer; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; font-size: 18px; color: #5f6b5f; }
.ttl-dong:hover, .ttl-dong:focus-visible { background: rgba(0,0,0,.08); color: #1f2a1f; }
.ttl-dac-tinh { margin-bottom: 6px; line-height: 1.45; }
.ttl-luoi { display: flex; flex-wrap: wrap; gap: 4px 18px; margin-bottom: 6px; }
.ttl-luoi div { display: flex; flex-direction: column; white-space: nowrap; }
.ttl-luoi span { color: #5f6b5f; font-size: 11px; }
.ttl-luoi b { font-weight: 600; font-size: 13.5px; }
.ttl-tt { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 12.5px; }
.ttl-tt span b { margin-right: 3px; }
.ttl-tt .chon { font-weight: 700; background: #e8f5e9; border-radius: 10px; padding: 0 8px; }
`;

export default function ThongTinLoai({ loai, dsCay, khuNhieu, tinhTrang, onDong }) {
  const gocRef = useDoCaoCuaSo(false);
  const cay = dsCay.filter((c) => c.ma_loai === loai.ma_loai);
  return (
    <div className="ttl" id={`ttl-${loai.ma_loai}`} ref={gocRef}>
      <style>{CSS}</style>
      <div className="ttl-dau">
        <span className="ttl-cham" style={{ background: MAU_LOAI[loai.ma_loai] }} />
        <span className="ttl-ten">{loai.ten_loai}</span>
        <span className="ttl-kh">{loai.ten_khoa_hoc}</span>
        <span className="ttl-dau-nut">
          <span className="ttl-nhan" id="ttl-nhan">{khuNhieu ? `◎ Nhiều nhất: ${khuNhieu.ten_khu_vuc} (${khuNhieu.n} cây)` : '◎ Đang tập trung trên bản đồ'}</span>
          <button type="button" className="ttl-dong" aria-label="Đóng" title="Đóng" onClick={onDong}>×</button>
        </span>
      </div>
      <div className="ttl-dac-tinh" id="ttl-dac-tinh"><b>Đặc tính sinh học:</b> {loai.dac_tinh_sinh_hoc ?? '–'}</div>
      <div className="ttl-luoi">
        <div><span>Rụng lá</span><b>{loai.thoidiem_rungla ?? '–'}</b></div>
        <div><span>Ra hoa</span><b>{loai.thoidiem_rahoa ?? '–'}</b></div>
        <div><span>Tuổi thọ TB</span><b>{so(loai.tuoi_tho_tb, 0)} năm</b></div>
        <div><span>Số cây</span><b>{cay.length}</b></div>
        <div><span>H trung bình</span><b>{so(tb(cay, 'chieu_cao'))} m</b></div>
        <div><span>DBH trung bình</span><b>{so(tb(cay, 'dbh'))} cm</b></div>
      </div>
      <div className="ttl-tt" id="ttl-tinh-trang">
        {TINH_TRANG.map((t) => <span key={t.ten} className={tinhTrang === t.ten ? 'chon' : undefined}><b style={{ color: t.mau }}>{t.bieuTuong}</b>{t.ten}: {cay.filter((c) => c.tinh_trang === t.ten).length}</span>)}
      </div>
    </div>
  );
}
