// Nhật ký thay đổi cây (admin, script db/22): mỗi mục ghi tài khoản, thao tác, giá trị cũ -> mới; hoàn tác từng mục
// (chỉ mục mới nhất của mỗi cây và có lưu giá trị cũ). Dùng trong hộp Khôi phục DL mặc định.
import { useCallback, useEffect, useState } from 'react';
import { timTinhTrang } from '../tinhTrang.js';

const THAO_TAC = { them: 'Thêm', sua: 'Sửa', xoa: 'Xóa' };
const so = (v, d = 1) => (v === null || v === undefined ? '–' : Number(v).toLocaleString('vi-VN', { maximumFractionDigits: d }));
// CSDL lưu giờ địa phương (SYSDATETIME, không múi giờ); driver mssql trả về như giờ UTC -> định dạng theo UTC để giữ nguyên giá trị
const gio = (t) => new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', timeZone: 'UTC' });

/** Các dòng mô tả thay đổi: sửa -> trường khác nhau (cũ -> mới); thêm / xóa -> tóm tắt cây. */
function moTa(r, tenLoai, tenKhu) {
  const truong = (g) => ({
    'Loài': tenLoai(g.ma_loai), 'H (m)': so(g.chieu_cao), 'R (m)': so(g.ban_kinh_tan), 'DBH (cm)': so(g.dbh),
    'Ngày trồng': g.ngay_trong ?? '–', 'Tình trạng': g.tinh_trang ?? '–', 'Khu': tenKhu(g.ma_khu_vuc),
  });
  if (r.thao_tac === 'sua' && r.gia_tri_cu && r.gia_tri_moi) {
    const [a, b] = [truong(r.gia_tri_cu), truong(r.gia_tri_moi)];
    const dong = Object.keys(a).filter((k) => a[k] !== b[k]).map((k) => `${k}: ${a[k]} → ${b[k]}`);
    const doi = Math.hypot(r.gia_tri_moi.x - r.gia_tri_cu.x, r.gia_tri_moi.y - r.gia_tri_cu.y);
    if (doi > 0.05) dong.push(`Vị trí: dời ${so(doi)} m`);
    return dong.length ? dong : ['Không đổi giá trị'];
  }
  const g = r.gia_tri_moi ?? r.gia_tri_cu;
  if (!g) return ['(không lưu giá trị: ghi trước khi có nhật ký chi tiết)'];
  return [`${tenLoai(g.ma_loai)} · H ${so(g.chieu_cao)} m · R ${so(g.ban_kinh_tan)} m · ${g.tinh_trang} · ${tenKhu(g.ma_khu_vuc)}`];
}

export default function NhatKyThayDoi({ onTai, onHoanTac, loaiCay, khuVuc }) {
  const [ds, setDs] = useState(null);
  const [loi, setLoi] = useState('');
  const [dangHt, setDangHt] = useState(null);
  const tai = useCallback(async () => { setLoi(''); try { setDs(await onTai()); } catch (e) { setLoi(e.message); } }, [onTai]);
  useEffect(() => { tai(); }, [tai]);
  const tenLoai = (m) => loaiCay.find((l) => l.ma_loai === m)?.ten_loai ?? `loài ${m}`;
  const tenKhu = (m) => khuVuc.find((k) => k.ma_khu_vuc === m)?.ten_khu_vuc?.replace(/^Khu /, '') ?? '–';
  const hoanTac = async (r) => {
    setDangHt(r.ma_nk); setLoi('');
    try { await onHoanTac(r); await tai(); } catch (e) { setLoi(e.message); } finally { setDangHt(null); }
  };
  if (!ds) return <p className="ghi-chu">{loi || 'Đang tải nhật ký…'}</p>;
  return (<>
    {loi && <div className="canh-bao"><b>Không thực hiện được</b>{loi}</div>}
    {ds.length === 0 ? <p className="ghi-chu">Chưa có thay đổi nào.</p> : (
      <ol className="nk-ds" id="nk-ds">
        {ds.map((r) => (
          <li key={r.ma_nk} className={'nk-muc ' + r.thao_tac} data-ma-nk={r.ma_nk}>
            <div className="nk-dau">
              <span className={'nk-tt ' + r.thao_tac}>{THAO_TAC[r.thao_tac]}</span>
              <b>Cây #{r.ma_cay}</b>
              <span className={'nk-ai' + (r.la_admin ? ' admin' : '')}>{r.ten_dang_nhap ?? 'CSDL trực tiếp'}</span>
              <span className="nk-gio">{gio(r.thoi_diem)}</span>
              {r.co_the_hoan_tac && <button type="button" className="nut vien nk-nut" disabled={dangHt !== null} onClick={() => hoanTac(r)}>
                {dangHt === r.ma_nk ? 'Đang hoàn tác…' : '↶ Hoàn tác'}</button>}
            </div>
            <ul className="nk-chi-tiet">
              {moTa(r, tenLoai, tenKhu).map((d) => {
                const tt = d.startsWith('Tình trạng') ? timTinhTrang(d.split('→').pop().trim()) : null;
                return <li key={d}>{d}{tt && <b style={{ color: tt.mau, marginLeft: 4 }}>{tt.bieuTuong}</b>}</li>;
              })}
            </ul>
          </li>
        ))}
      </ol>)}
    <p className="ghi-chu">Hiện 100 thay đổi gần nhất. Chỉ hoàn tác được thay đổi mới nhất của mỗi cây; thao tác hoàn tác cũng được ghi nhật ký.</p>
  </>);
}
