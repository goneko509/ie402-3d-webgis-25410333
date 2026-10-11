// Lọc cây trên cảnh 3D theo điều kiện thuộc tính (loài, H, R, DBH, ngày trồng, tình trạng).
// Tạo biểu thức SQL cho definitionExpression của các lớp cây phía client; không đổi dữ liệu và không ảnh hưởng thống kê CSDL.
// Điều kiện do App giữ (dk / onDoiDk). Đang chọn loài / tình trạng (luồng ưu tiên) -> bị KHÓA (khoa) đến khi bấm Đặt lại.
import { MAU_LOAI } from '../scene/taoCanh.js';

const TINH_TRANG = ['Bình thường', 'Suy yếu', 'Nguy hiểm'];
const KHOANG = [
  { khoa: 'chieu_cao', ten: 'Chiều cao H (m)', buoc: 0.5 },
  { khoa: 'ban_kinh_tan', ten: 'Bán kính tán R (m)', buoc: 0.5 },
  { khoa: 'dbh', ten: 'DBH (cm)', buoc: 1 },
];
export const LOC_RONG = { loai: null, tinhTrang: null, chieu_cao: ['', ''], ban_kinh_tan: ['', ''], dbh: ['', ''], ngay_trong: ['', ''] };
const so = (v) => (v === undefined ? '' : Number(v).toLocaleString('vi-VN', { maximumFractionDigits: 1 }));

/** Điều kiện lọc -> biểu thức SQL (null = không lọc). loai / tinhTrang: null = tất cả, mảng = chỉ các giá trị đã chọn. */
export function bieuThucLoc(dk) {
  const w = [];
  if (dk.loai) w.push(dk.loai.length ? `ma_loai IN (${dk.loai.join(',')})` : '1=0');
  if (dk.tinhTrang) w.push(dk.tinhTrang.length ? `tinh_trang IN (${dk.tinhTrang.map((t) => `'${t}'`).join(',')})` : '1=0');
  for (const { khoa } of KHOANG) {
    const [tu, den] = dk[khoa];
    if (tu !== '' && Number.isFinite(Number(tu))) w.push(`${khoa} >= ${Number(tu)}`);
    if (den !== '' && Number.isFinite(Number(den))) w.push(`${khoa} <= ${Number(den)}`);
  }
  const [nTu, nDen] = dk.ngay_trong;
  if (/^\d{4}-\d{2}-\d{2}$/.test(nTu)) w.push(`ngay_trong >= '${nTu}'`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(nDen)) w.push(`ngay_trong <= '${nDen}'`);
  return w.length ? w.join(' AND ') : null;
}

export default function BoLocCay({ loaiCay, phamVi, ketQua, dk, onDoiDk: setDk, khoa }) {
  const where = bieuThucLoc(dk);

  const doiTap = (khoa, tatCa, gt) => (e) => setDk((d) => {
    const cu = d[khoa] ?? tatCa;
    const moi = e.target.checked ? [...cu, gt] : cu.filter((x) => x !== gt);
    return { ...d, [khoa]: moi.length === tatCa.length ? null : moi };
  });
  const doiKhoang = (khoa, i) => (e) => setDk((d) => {
    const k = [...d[khoa]]; k[i] = e.target.value; return { ...d, [khoa]: k };
  });
  const maLoai = loaiCay.map((l) => l.ma_loai);

  return (
    <fieldset className="bo-loc" id="bo-loc-cay" disabled={khoa} title={khoa ? 'Đang chọn theo loài / tình trạng: bấm Đặt lại để dùng Lọc cây' : undefined}>
      <div className="nhom-loc">
        <div className="nhan-loc nhan-co-tat-ca">Loài cây
          {/* Chọn / bỏ tất cả: dấu gạch (indeterminate) khi chỉ chọn một phần */}
          <label className="o-chon tat-ca"><input type="checkbox" id="loc-loai-tat-ca" checked={!dk.loai}
            ref={(el) => { if (el) el.indeterminate = !!dk.loai && dk.loai.length > 0; }}
            onChange={(e) => setDk((d) => ({ ...d, loai: e.target.checked ? null : [] }))} />Tất cả</label>
        </div>
        {loaiCay.map((l) => (
          <label className="o-chon" key={l.ma_loai}>
            <input type="checkbox" checked={!dk.loai || dk.loai.includes(l.ma_loai)} onChange={doiTap('loai', maLoai, l.ma_loai)} data-loai={l.ma_loai} />
            <span className="cham nho" style={{ background: MAU_LOAI[l.ma_loai] }} />{l.ten_loai}
          </label>
        ))}
      </div>
      {KHOANG.map(({ khoa, ten, buoc }) => (
        <div className="nhom-loc" key={khoa}>
          <div className="nhan-loc">{ten}</div>
          <div className="khoang">
            <input type="number" step={buoc} placeholder={`từ ${so(phamVi[khoa]?.[0])}`} value={dk[khoa][0]} onChange={doiKhoang(khoa, 0)} name={`${khoa}_tu`} aria-label={`${ten} từ`} />
            <span>–</span>
            <input type="number" step={buoc} placeholder={`đến ${so(phamVi[khoa]?.[1])}`} value={dk[khoa][1]} onChange={doiKhoang(khoa, 1)} name={`${khoa}_den`} aria-label={`${ten} đến`} />
          </div>
        </div>
      ))}
      <div className="nhom-loc">
        <div className="nhan-loc">Ngày trồng</div>
        <div className="khoang">
          <input type="date" value={dk.ngay_trong[0]} min={phamVi.ngay_trong?.[0]} max={phamVi.ngay_trong?.[1]} onChange={doiKhoang('ngay_trong', 0)} name="ngay_trong_tu" aria-label="Ngày trồng từ" />
          <span>–</span>
          <input type="date" value={dk.ngay_trong[1]} min={phamVi.ngay_trong?.[0]} max={phamVi.ngay_trong?.[1]} onChange={doiKhoang('ngay_trong', 1)} name="ngay_trong_den" aria-label="Ngày trồng đến" />
        </div>
      </div>
      <div className="nhom-loc">
        <div className="nhan-loc">Tình trạng</div>
        {TINH_TRANG.map((t) => (
          <label className="o-chon" key={t}>
            <input type="checkbox" checked={!dk.tinhTrang || dk.tinhTrang.includes(t)} onChange={doiTap('tinhTrang', TINH_TRANG, t)} data-tinh-trang={t} />{t}
          </label>
        ))}
      </div>
      <div className="ket-qua-loc" id="ket-qua-loc">
        <span>Hiển thị <b>{ketQua.hien ?? '…'}</b> / {ketQua.tong ?? '…'} cây</span>
        <button type="button" className="nut nho" onClick={() => setDk(LOC_RONG)} disabled={!where} id="nut-xoa-loc">Xóa lọc</button>
      </div>
      <p className="ghi-chu">Bộ lọc chỉ ẩn/hiện cây trên cảnh 3D; bảng Thống kê vẫn tính trên toàn bộ cây trong CSDL.</p>
    </fieldset>
  );
}
