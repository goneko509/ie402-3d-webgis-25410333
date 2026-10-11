// Thành phần 8 (UC06 - bước 4): thẻ tài khoản cạnh nút Đăng xuất, cho biết loại tài khoản và khu được phân công.
// Tài khoản không gắn người quản lý (ma_nql trống) là tài khoản kỹ thuật, không bị giới hạn khu (trigger trg_cay_xanh_phan_quyen).
import { tenNgan } from './BangThongKe.jsx';

export default function TheTaiKhoan({ tk }) {
  const kyThuat = tk.ma_nql === null || tk.ma_nql === undefined;
  const ten = tk.ten_nql ?? tk.ten_dang_nhap;
  const khu = Array.isArray(tk.khu_phu_trach) ? tk.khu_phu_trach : [];
  // Dòng hiển thị dùng tên gọn như bảng Thống kê; tên đầy đủ ở chú thích khi rê chuột
  const ds = (f) => khu.map((k) => `${f(k.ten_khu_vuc)} (${k.ma_khu_vuc})`).join(', ');
  const moTaKhu = kyThuat ? 'Tất cả các khu' : khu.length ? ds(tenNgan) : 'Chưa được phân công';
  const moTaDayDu = kyThuat ? 'Tất cả các khu (không giới hạn)' : khu.length ? ds((t) => t) : 'Chưa được phân công';
  return (
    <div className={'the-tk' + (kyThuat ? ' ky-thuat' : '')} id="the-tai-khoan" title={`${ten} (${tk.ten_dang_nhap})\nKhu phụ trách: ${moTaDayDu}`}>
      <span className="anh-dai-dien">{ten.trim().split(/\s+/).pop()[0].toUpperCase()}</span>
      <div className="tk-chu">
        <div className="tk-dong1">
          <b>{ten}</b>{ten !== tk.ten_dang_nhap && <span className="tk-ten">({tk.ten_dang_nhap})</span>}
          <span className="nhan-vai-tro" data-loai={kyThuat ? 'ky-thuat' : 'quan-ly'}>{kyThuat ? 'Quản trị hệ thống' : 'Người quản lý khu'}</span>
        </div>
        <div className="tk-dong2" id="khu-phu-trach">Phụ trách: {moTaKhu}</div>
      </div>
    </div>
  );
}
