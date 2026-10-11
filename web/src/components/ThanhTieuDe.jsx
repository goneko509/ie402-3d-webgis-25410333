// Thanh tiêu đề: thương hiệu, ô tìm kiếm cây (thành phần 2, UC02; kết quả hiện ngay trong ô), hộp bối cảnh bản đồ (BoiCanhBanDo),
// bên phải: nhóm Thêm/Sửa/Xóa (thành phần 7), thẻ tài khoản và nút đăng nhập / đăng xuất (thành phần 8, UC06 - bước 4).
import { useState } from 'react';

export default function ThanhTieuDe({ onTim, ketQuaTim, boiCanh, children }) {
  const [q, setQ] = useState('');
  return (
    <header>
      <div className="thuong-hieu"><div className="la" /><div>WebGIS 3D Cây xanh<small>Làng Đại học ĐHQG-HCM</small></div></div>
      <form className={'tim' + (ketQuaTim ? ' co-kq' : '')} onSubmit={(e) => { e.preventDefault(); onTim(q.trim()); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo mã cây hoặc loài cây…" aria-label="Tìm cây" />
        <button type="submit" aria-label="Tìm">⌕</button>
        {ketQuaTim && <span className="kq-tim" title={ketQuaTim}>{ketQuaTim}</span>}
      </form>
      {boiCanh}
      <div className="tai-khoan">{children}</div>
    </header>
  );
}
