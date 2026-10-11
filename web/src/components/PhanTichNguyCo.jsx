// Thành phần 4c (UC07): cây có nguy cơ ảnh hưởng công trình theo VÙNG MỤC TIÊU ISA (sp_cay_nguy_co_cong_trinh, script db/24).
// Vùng ngã đổ cố định 1,5 x H; chỉ cây Suy yếu / Nguy hiểm. Mức theo đối tượng (tòa nhà / đường) gần nhất:
// Cao = trong tán, Trung bình = trong 1 x H, Thấp = trong 1,5 x H. Kết quả toàn vùng nạp sẵn một lần (App), lọc theo khu đang xem.
// Mục này và lớp "Vùng ngã đổ" là MỘT trạng thái: Phân tích = bật lớp (và bay tới các vòng), Ẩn = tắt lớp.
// Bấm một dòng -> đưa cây vào khung nhìn và mở cửa sổ thông tin.
import MucThuGon from './MucThuGon.jsx';

const MUC = ['Cao', 'Trung bình', 'Thấp'];
const LOP_MUC = { Cao: 'cao', 'Trung bình': 'tb', Thấp: 'thap' };
const so = (v, d = 1) => Number(v).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });

export default function PhanTichNguyCo({ tenPhamVi, ketQua, dangChay, loi, onPhanTich, onXoa, onChonCay, khuPhuTrach = [] }) {
  const ganNha = ketQua?.filter((r) => r.kc_nha !== null).length ?? 0;
  const ganDuong = ketQua?.filter((r) => r.kc_duong !== null).length ?? 0;
  const theoMuc = (m) => ketQua?.filter((r) => r.muc_nguy_hiem === m).length ?? 0;
  return (
    <MucThuGon id="muc-phan-tich" tieuDe="Phân tích nguy cơ">
      <div className="pt-dieu-khien">
        <div className="pt-he-so" id="pt-he-so" title="Vùng mục tiêu theo hướng dẫn đánh giá rủi ro cây của ISA: trong tán / 1 × H / 1,5 × H">
          <span>Vùng ngã đổ = <b>1,5 × H</b> (theo ISA)</span></div>
        <p className="ghi-chu pt-pham-vi">Chỉ đánh giá cây Suy yếu / Nguy hiểm.</p>
        <div className="hang-nut">
          <button type="button" className="nut chinh nho-hon" disabled={dangChay} onClick={onPhanTich} id="nut-phan-tich"
            title="Bật lớp Vùng ngã đổ và đưa các vòng vào khung nhìn">{dangChay ? 'Đang tải…' : 'Phân tích'}</button>
          {(ketQua || dangChay) && <button type="button" className="nut vien nho-hon" onClick={onXoa} id="nut-xoa-phan-tich" title="Tắt lớp Vùng ngã đổ">Ẩn</button>}
        </div>
      </div>
      {loi && <div className="canh-bao">{loi}</div>}
      {ketQua && (<>
        <div className="pt-tom-tat" id="pt-tom-tat">
          {tenPhamVi}: <b>{ketQua.length}</b> cây có nguy cơ · {ganNha} gần nhà · {ganDuong} gần đường
          <div className="pt-muc-tom-tat">{MUC.map((m) => <span key={m} className={'pt-muc ' + LOP_MUC[m]}>{m}: {theoMuc(m)}</span>)}</div>
        </div>
        <ol className="pt-ds" id="pt-ds">
          {ketQua.map((r) => (
            <li key={r.ma_cay}>
              <button type="button" className="pt-dong" onClick={() => onChonCay(r.ma_cay)} data-ma-cay={r.ma_cay}
                title={`Cây #${r.ma_cay} · ${r.ten_khu_vuc} · H ${so(r.chieu_cao)} m, tán ${so(r.ban_kinh_tan)} m · vùng ngã đổ ${so(r.tam_do)} m · đối tượng gần nhất: ${r.vung_muc_tieu} · ảnh hưởng ${r.so_toa_nha} tòa nhà, ${r.so_doan_duong} đoạn đường, xa nhất ${so(r.kc_xa_nhat)} m`}>
                <span className="pt-dong1">
                  <b>#{r.ma_cay}</b> {r.ten_loai} · H {so(r.chieu_cao)} m
                  {khuPhuTrach.includes(r.ma_khu_vuc) && <span className="sao-phu-trach">★</span>}
                  <span className={'pt-muc ' + LOP_MUC[r.muc_nguy_hiem]} title={`Mức nguy hiểm: đối tượng gần nhất ${r.vung_muc_tieu?.toLowerCase()}`}>{r.muc_nguy_hiem}</span>
                </span>
                <span className="pt-dong2">
                  {r.kc_nha !== null && <span className="pt-ah nha">Nhà {so(r.kc_nha)} m</span>}
                  {r.kc_duong !== null && <span className="pt-ah duong">Đường {so(r.kc_duong)} m</span>}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="pt-chu-giai" id="pt-chu-giai">
          <span><i className="pt-mau vong" aria-hidden="true" />1 × H</span>
          <span><i className="pt-mau vong-ngoai" aria-hidden="true" />1,5 × H (vùng ngã đổ)</span>
          <span><i className="pt-mau nha" aria-hidden="true" />Tòa nhà bị ảnh hưởng</span>
          <span><i className="pt-mau duong" aria-hidden="true" />Đoạn đường bị ảnh hưởng</span>
          <span className="pt-giai-muc">Mức: <b className="pt-muc cao">Cao</b> trong tán · <b className="pt-muc tb">TB</b> ≤ 1 × H · <b className="pt-muc thap">Thấp</b> ≤ 1,5 × H</span>
        </div>
        <p className="ghi-chu">Tình trạng cây là dữ liệu giả lập.</p>
      </>)}
    </MucThuGon>
  );
}
