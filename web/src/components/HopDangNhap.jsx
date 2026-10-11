// Thành phần 8 (UC06): hộp đăng nhập quản trị.
import { useState } from 'react';
import { api } from '../api.js';

export default function HopDangNhap({ onThanhCong, onDong }) {
  const [ten, setTen] = useState('');
  const [mk, setMk] = useState('');
  const [loi, setLoi] = useState('');
  const [dang, setDang] = useState(false);

  async function gui(e) {
    e.preventDefault();
    setDang(true); setLoi('');
    try {
      onThanhCong(await api.dangNhap(ten.trim(), mk));
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDang(false);
    }
  }

  return (
    <div className="nen-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onDong(); }}>
      <form className="modal" onSubmit={gui} id="hop-dang-nhap">
        <h2>Đăng nhập quản trị</h2>
        <p>Dành cho cán bộ quản lý cây xanh được phân công khu vực.</p>
        <label className="truong">Tên đăng nhập<input value={ten} onChange={(e) => setTen(e.target.value)} autoFocus required name="ten_dang_nhap" /></label>
        <label className="truong">Mật khẩu<input type="password" value={mk} onChange={(e) => setMk(e.target.value)} required name="mat_khau" /></label>
        {loi && <div className="canh-bao"><b>Đăng nhập thất bại</b>{loi}</div>}
        <div className="hang-nut">
          <button className="nut chinh" type="submit" disabled={dang}>{dang ? 'Đang kiểm tra…' : 'Đăng nhập'}</button>
          <button className="nut vien" type="button" onClick={onDong}>Hủy</button>
        </div>
      </form>
    </div>
  );
}
