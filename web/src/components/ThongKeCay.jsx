// Thành phần 4b (UC03): thống kê cây xanh của khu đang chọn: tỷ lệ % theo loài và theo tình trạng.
// Tính trên toàn bộ cây trong CSDL (lần tải gần nhất), không theo bộ lọc cảnh 3D.
// Màu loài trùng màu cây trên cảnh và chú giải (MAU_LOAI); tình trạng dùng màu trạng thái kèm biểu tượng + chữ.
// Bấm một thanh -> CHỌN loài / tình trạng đó (App.chonNhom): thay giá trị của nhóm đó, nhóm kia giữ nguyên (cùng áp dụng);
// bấm lại không bỏ chọn - bỏ chọn bằng Đặt lại trên hộp bối cảnh. Thanh đang chọn tô đậm ở cả hai nhóm.
import { MAU_LOAI } from '../scene/taoCanh.js';
import MucThuGon from './MucThuGon.jsx';
import { TINH_TRANG } from '../tinhTrang.js';

const pt = (n, tong) => (tong ? (n / tong) * 100 : 0);
const so1 = (v) => v.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function Thanh({ nhan, mau, n, tong, bieuTuong, khoa, chon, onChon }) {
  const p = pt(n, tong);
  return (
    <button type="button" className={'tk-thanh' + (chon ? ' chon' : '')} aria-pressed={chon} onClick={onChon}
      title={`${nhan}: ${n} cây (${so1(p)} %)${chon ? ' - đang chọn' : ' - bấm để chọn trên bản đồ'}`} data-khoa={khoa}>
      <span className="tk-nhan">{bieuTuong && <span className="tk-bieu-tuong" style={{ color: mau }}>{bieuTuong}</span>}{nhan}</span>
      <span className="ray"><span className="dac" style={{ width: `${p}%`, background: mau }} /></span>
      <span className="tk-so"><b>{so1(p)} %</b> · {n}</span>
    </button>
  );
}

export default function ThongKeCay({ dsCay, loaiCay, khuChon, tenKhu, mo, onDoiMo, tapTrung, onTapTrung }) {
  const bam = (nhom) => () => onTapTrung?.(nhom);
  const laChon = (nhom) => !!tapTrung && Object.entries(nhom).every(([k, v]) => tapTrung[k] === v);
  const cay = khuChon === null ? dsCay : dsCay.filter((c) => c.ma_khu_vuc === khuChon);
  const tong = cay.length;
  const dem = (k, v) => cay.filter((c) => c[k] === v).length;
  return (
    <MucThuGon id="muc-thong-ke-cay" tieuDe="Thống kê cây xanh" mo={mo} onDoiMo={onDoiMo}>
      <div className="tk-pham-vi">{tenKhu ?? 'Toàn vùng nghiên cứu'}: <b>{tong}</b> cây</div>
      <div className="tieu-de-bd">Theo loài (%)</div>
      {loaiCay.map((l) => <Thanh key={l.ma_loai} khoa={`loai-${l.ma_loai}`} nhan={l.ten_loai} mau={MAU_LOAI[l.ma_loai]} n={dem('ma_loai', l.ma_loai)} tong={tong}
        chon={laChon({ loai: l.ma_loai })} onChon={bam({ loai: l.ma_loai })} />)}
      <div className="tieu-de-bd cach-tren">Theo tình trạng (%)</div>
      {TINH_TRANG.map((t) => <Thanh key={t.ten} khoa={`tt-${t.ten}`} nhan={t.ten} mau={t.mau} bieuTuong={t.bieuTuong} n={dem('tinh_trang', t.ten)} tong={tong}
        chon={laChon({ tinhTrang: t.ten })} onChon={bam({ tinhTrang: t.ten })} />)}
      <p className="ghi-chu">Số cây theo khu đang chọn ở trên; thuộc tính cây là dữ liệu giả định, chỉ minh họa.</p>
    </MucThuGon>
  );
}
