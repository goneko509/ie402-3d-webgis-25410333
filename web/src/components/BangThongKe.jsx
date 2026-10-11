// Thành phần 4 (UC03): thống kê che phủ theo khu (sp_thong_ke_che_phu qua /api/thong-ke).
// Khi đã đăng nhập: khu tài khoản phụ trách có ngôi sao vàng.
// Bung xổ / thu gọn: khi thu gọn vẫn giữ ô chọn khu (khu đang chọn quyết định nút Thêm cây).
import { useEffect, useState } from 'react';
import MucThuGon from './MucThuGon.jsx';
import ThongKeCay from './ThongKeCay.jsx';
import PhanTichNguyCo from './PhanTichNguyCo.jsx';

const so = (v, d = 2) => Number(v).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });
export const tenNgan = (t) => t.replace('Khu phía Tây', 'Phía Tây').replace('Khu ', '')
  .replace('Trung tâm Marie Curie - Isaac Newton', 'Trung tâm MC – IN').replace('Quảng trường Sáng tạo', 'QT Sáng tạo');

export default function BangThongKe({ thongKe, khuChon, onChonKhu, khuPhuTrach = [], dsCay = [], loaiCay = [], phanTich, tapTrung, onTapTrung }) {
  const sao = (ma) => khuPhuTrach.includes(ma);
  const [moTkCay, setMoTkCay] = useState(true);
  // Chạy phân tích: thu gọn Thống kê cây xanh; khi có kết quả thì cuộn bảng tới mục Phân tích nguy cơ
  const chayPhanTich = () => { setMoTkCay(false); phanTich.onPhanTich(); };
  // Chọn một khu (ô chọn hoặc bấm thanh Tỷ lệ che phủ) -> mở Thống kê cây xanh; chạy phân tích thì thu gọn (như trên)
  useEffect(() => { if (khuChon !== null) setMoTkCay(true); }, [khuChon]);
  // Kết quả vừa hiện (lớp Vùng ngã đổ vừa bật) -> cuộn tới mục Phân tích nguy cơ; đổi khu khi đang bật thì không cuộn
  const coKetQuaPt = !!phanTich?.ketQua;
  useEffect(() => {
    if (coKetQuaPt) document.getElementById('muc-phan-tich')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [coKetQuaPt]);
  if (!thongKe.length) return <aside className="panel phai"><h3>Thống kê che phủ</h3><p className="ghi-chu">Đang tải...</p></aside>;
  const theoKhu = thongKe.filter((r) => r.ma_khu_vuc !== null);
  const dong = thongKe.find((r) => (khuChon === null ? r.ma_khu_vuc === null : r.ma_khu_vuc === khuChon));
  const max = Math.max(...theoKhu.map((r) => r.ty_le_che_phu));
  return (
    <aside className="panel phai">
      <MucThuGon id="muc-thong-ke" tieuDe="Thống kê che phủ" luonHien={<>
      <select value={khuChon ?? ''} onChange={(e) => onChonKhu(e.target.value === '' ? null : Number(e.target.value))}>
        <option value="">Toàn vùng nghiên cứu</option>
        {theoKhu.map((r) => <option key={r.ma_khu_vuc} value={r.ma_khu_vuc}>{sao(r.ma_khu_vuc) ? '★ ' : ''}{r.ten_khu_vuc}</option>)}
      </select>
      </>}>
      <div className="kpis">
        <div className="kpi"><b>{dong.so_cay}</b><span>Số cây</span></div>
        <div className="kpi"><b>{so(dong.mat_do)}</b><span>Mật độ (cây/ha)</span></div>
        <div className="kpi"><b>{so(dong.ty_le_che_phu)} %</b><span>Tỷ lệ che phủ</span></div>
        <div className="kpi"><b>{so(dong.the_tich_m3, 0)}</b><span>Thể tích tán (m³)</span></div>
      </div>
      <div className="tieu-de-bd">Tỷ lệ che phủ theo khu vực (%)</div>
      {theoKhu.map((r) => (
        <button className={'thanh' + (r.ma_khu_vuc === khuChon ? ' chon' : '')} key={r.ma_khu_vuc} onClick={() => onChonKhu(r.ma_khu_vuc)} data-khu={r.ma_khu_vuc}>
          <span className="ten-thanh">{tenNgan(r.ten_khu_vuc)}{sao(r.ma_khu_vuc) && <span className="sao-phu-trach" title="Khu bạn phụ trách">★</span>}</span>
          <span className="ray"><span className="dac" style={{ width: `${(r.ty_le_che_phu / max) * 100}%` }} /></span>
          <span>{so(r.ty_le_che_phu)}</span>
        </button>
      ))}
      <p className="ghi-chu">Diện tích: {so(dong.dien_tich_ha)} ha · Diện tích tán (đã hợp): {so(dong.dien_tich_tan_m2, 0)} m².<br />
        Tính trực tiếp trong CSDL từ dữ liệu cây mẫu (thuộc tính giả định), chỉ minh họa.</p>
      </MucThuGon>
      <ThongKeCay dsCay={dsCay} loaiCay={loaiCay} khuChon={khuChon} tenKhu={khuChon === null ? null : dong.ten_khu_vuc} mo={moTkCay} onDoiMo={setMoTkCay} tapTrung={tapTrung} onTapTrung={onTapTrung} />
      {phanTich && <PhanTichNguyCo {...phanTich} onPhanTich={chayPhanTich} tenPhamVi={khuChon === null ? 'Toàn vùng' : dong.ten_khu_vuc} khuPhuTrach={khuPhuTrach} />}
    </aside>
  );
}
