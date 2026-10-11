// Hộp xác nhận khôi phục dữ liệu cây mặc định (tài khoản kỹ thuật admin). Hiện bản xem trước từ CSDL
// (sp_khoi_phuc_mac_dinh @thuc_hien = 0): thay đổi nào của người quản lý sẽ bị hoàn tác; admin xác nhận mới thực hiện.
// Thẻ thứ hai: Nhật ký thay đổi (giá trị cũ -> mới, hoàn tác từng thay đổi).
import { useState } from 'react';
import NhatKyThayDoi from './NhatKyThayDoi.jsx';
const HANH_DONG = {
  xoa_cay_them: 'Xóa cây do người quản lý thêm',
  hoan_tac_sua: 'Đưa về giá trị mặc định',
  phuc_hoi_cay_xoa: 'Phục hồi cây bị xóa',
};
// Giờ địa phương lưu trong CSDL, driver trả như UTC -> định dạng theo UTC (xem NhatKyThayDoi)
const gio = (t) => (t ? new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone: 'UTC' }) : '');

export default function HopKhoiPhuc({ xemTruoc, dangTai, dangChay, loi, onXacNhan, onDong, onLamMoi, nhatKy }) {
  const [the, setThe] = useState('mac_dinh');
  const ds = the === 'mac_dinh' ? xemTruoc?.chi_tiet ?? [] : [];
  const doiThe = (t) => { setThe(t); if (t === 'mac_dinh') onLamMoi(); };   // nhật ký có thể đã hoàn tác -> xem trước lại
  return (
    <div className="nen-modal" onMouseDown={(e) => { if (e.target === e.currentTarget && !dangChay) onDong(); }}>
      <div className="modal modal-rong" id="hop-khoi-phuc" role="dialog" aria-labelledby="kp-tieu-de">
        <h2 id="kp-tieu-de">Khôi phục dữ liệu mặc định</h2>
        <div className="kp-the" role="tablist">
          <button type="button" role="tab" aria-selected={the === 'mac_dinh'} className={the === 'mac_dinh' ? 'chon' : ''} onClick={() => doiThe('mac_dinh')} id="the-mac-dinh">Khôi phục mặc định</button>
          <button type="button" role="tab" aria-selected={the === 'nhat_ky'} className={the === 'nhat_ky' ? 'chon' : ''} onClick={() => doiThe('nhat_ky')} id="the-nhat-ky">Nhật ký thay đổi</button>
        </div>
        {the === 'nhat_ky' ? <NhatKyThayDoi {...nhatKy} /> : (<>
        <p>Hoàn tác các thay đổi cây do người quản lý thực hiện; thay đổi của admin được giữ nguyên.</p>
        {dangTai && <p className="ghi-chu">Đang kiểm tra thay đổi…</p>}
        {loi && <div className="canh-bao"><b>Không thực hiện được</b>{loi}</div>}
        {xemTruoc && (ds.length === 0
          ? <div className="thanh-cong" id="kp-khong-co"><b>Dữ liệu đang ở trạng thái mặc định</b>Không có thay đổi nào của người quản lý cần khôi phục.</div>
          : (<>
            <div className="kp-tom-tat" id="kp-tom-tat">
              <span><b>{xemTruoc.so_xoa_cay_them}</b> cây thêm mới sẽ bị xóa</span>
              <span><b>{xemTruoc.so_hoan_tac_sua}</b> cây bị sửa sẽ về mặc định</span>
              <span><b>{xemTruoc.so_phuc_hoi_cay_xoa}</b> cây bị xóa sẽ được phục hồi</span>
            </div>
            <ol className="kp-ds">
              {ds.map((r) => (
                <li key={`${r.hanh_dong}-${r.ma_cay}`}><b>#{r.ma_cay}</b> {HANH_DONG[r.hanh_dong]}
                  <span className="kp-ai">{r.ten_dang_nhap} · {gio(r.thoi_diem)}</span></li>
              ))}
            </ol>
          </>))}
        </>)}
        <div className="hang-nut">
          {ds.length > 0 && <button className="nut nguy-hiem-dac" type="button" disabled={dangChay} onClick={onXacNhan} id="nut-xac-nhan-khoi-phuc">
            {dangChay ? 'Đang khôi phục…' : `Khôi phục ${ds.length} thay đổi`}</button>}
          <button className="nut vien" type="button" disabled={dangChay} onClick={onDong}>{ds.length > 0 ? 'Hủy' : 'Đóng'}</button>
        </div>
      </div>
    </div>
  );
}
