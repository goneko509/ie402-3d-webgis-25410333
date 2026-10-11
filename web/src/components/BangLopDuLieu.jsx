// Thành phần 3 (UC04): bật/tắt lớp dữ liệu và lọc cây theo thuộc tính; mỗi mục bung xổ / thu gọn được.
// Chú giải loài cây nằm nổi trên bản đồ (ChuGiaiLoai).
import MucThuGon from './MucThuGon.jsx';
import BoLocCay from './BoLocCay.jsx';

export const DS_LOP = [
  { khoa: 'toaNha', ten: 'Tòa nhà', mau: '#cfd3d8' },
  { khoa: 'duong', ten: 'Đường giao thông', mau: '#9e9e9e' },
  { khoa: 'cayXanh', ten: 'Cây xanh', mau: '#4caf50' },
  { khoa: 'chePhu', ten: 'Vùng che phủ (tán)', mau: 'rgba(56,142,60,.45)' },
  { khoa: 'ranhGioi', ten: 'Ranh giới khu vực', vien: true },
  { khoa: 'veTinh', ten: 'Ảnh vệ tinh (Esri)', mau: 'linear-gradient(135deg,#55633f,#8a8f6a 50%,#3f4a35)' },
  // Vùng ngã đổ (UC07): vòng 1 x H và 1,5 x H quanh cây có nguy cơ; dữ liệu nạp sẵn một lần, dùng chung với mục Phân tích nguy cơ
  { khoa: 'nguyCo', ten: 'Vùng ngã đổ', vong: true },
];

export default function BangLopDuLieu({ hienThi, onDoi, loaiCay, phamVi, ketQuaLoc, dkLoc, onDoiDkLoc, khoaLoc }) {
  return (
    <aside className="panel trai">
      <MucThuGon id="muc-lop" tieuDe="Lớp dữ liệu">
        {DS_LOP.map((l) => (
          <label className="lop" key={l.khoa}>
            <input type="checkbox" checked={hienThi[l.khoa]} onChange={(e) => onDoi(l.khoa, e.target.checked)} />
            <span>{l.ten}</span>
            <span className={'mau' + (l.vien ? ' vien' : '') + (l.vong ? ' vong' : '')} style={l.vien || l.vong ? undefined : { background: l.mau }} />
          </label>
        ))}
      </MucThuGon>
      <MucThuGon id="muc-loc" tieuDe="Lọc cây">
        <BoLocCay loaiCay={loaiCay} phamVi={phamVi} ketQua={ketQuaLoc} dk={dkLoc} onDoiDk={onDoiDkLoc} khoa={khoaLoc} />
      </MucThuGon>
    </aside>
  );
}
