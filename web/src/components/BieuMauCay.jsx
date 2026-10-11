// Thành phần 9 (UC05 - thêm): biểu mẫu thêm cây trong bảng bên phải. Sửa / xóa nằm trong cửa sổ thông tin cây (ThongTinCay).
// Vị trí chỉ chọn được trong vùng làm việc (khu đang chọn; phần ngoài bị làm mờ, nhấp vào không có tác dụng).
// Khu vực KHÔNG nhập: CSDL tự gán theo vị trí và kiểm tra khu phụ trách (trigger); lỗi từ API hiện ngay trong biểu mẫu.
// NHÂN BẢN (nguon, mục 216): thuộc tính cây nguồn điền sẵn (trừ tình trạng); trường còn giữ giá trị nguồn ghi "giống cây #…";
// bắt buộc chọn vị trí cách mọi cây >= kcMin m và tích "Đã kiểm tra thuộc tính" mới lưu được; lưu xong đặt tiếp cây kế.
// SỬA (sua, mục 224): biểu mẫu điền giá trị hiện tại; vị trí giữ nguyên cho tới khi nhấp bản đồ (nhấp bao nhiêu lần tùy ý,
// lấy lần cuối), "Về vị trí cũ" bỏ vị trí mới; vị trí mới cũng phải cách cây khác >= kcMin m. Lưu / Hủy -> mở lại cửa sổ cây.
const TINH_TRANG = ['Bình thường', 'Suy yếu', 'Nguy hiểm'];
const so = (v, d = 1) => (v === '' || v === undefined || v === null ? '' : Number(v).toLocaleString('vi-VN', { maximumFractionDigits: d }));

export default function BieuMauCay({ du, loaiCay, onDoi, onLuu, onHuy, dangGui, thongBao, khuLamViec, nguon, sua: cay, kcMin = 1, onVeViTriCu }) {
  const sua = (k) => (e) => onDoi({ ...du, [k]: e.target.value });
  const tenVung = cay ? cay.tenVung : nguon ? nguon.tenVung : khuLamViec ? `${khuLamViec.ten_khu_vuc} (${khuLamViec.ma_khu_vuc})` : 'Toàn vùng (tài khoản kỹ thuật)';
  // Nhân bản: trường còn giữ nguyên giá trị cây nguồn
  const giong = (k) => nguon && du[k] !== undefined && String(du[k]) === String(nguon.mau[k])
    ? <span className="giong-nguon" data-giong={k}> · giống cây #{nguon.ma_cay}</span> : null;
  const quaGan = (nguon || cay) && du.cayGan && du.cayGan.kc < kcMin;
  const daDoi = cay && du.x !== undefined;
  const loaiNguon = nguon && loaiCay.find((l) => l.ma_loai === Number(nguon.mau.ma_loai));
  return (
    <aside className="panel phai" id="bieu-mau-cay">
      <h3>{cay ? `Sửa cây #${cay.ma_cay}` : nguon ? `Nhân bản từ cây #${nguon.ma_cay}` : 'Thêm cây xanh'}</h3>
      {cay && <p className="ghi-chu" id="sua-mo-ta">{cay.ten_loai} · {cay.ten_khu_vuc}. Nhấp bản đồ (vùng sáng) để dời vị trí, nhấp lại bao nhiêu lần tùy ý.</p>}
      {nguon && <p className="ghi-chu" id="nb-mau">Mẫu: <b>{loaiNguon?.ten_loai}</b>, H {so(nguon.mau.chieu_cao)} m, R {so(nguon.mau.ban_kinh_tan)} m, DBH {so(nguon.mau.dbh)} cm, trồng {nguon.mau.ngay_trong || '–'}. Tình trạng không sao chép.</p>}
      <p className="khu-lam-viec" id="khu-lam-viec">Khu làm việc: <b>{tenVung}</b></p>
      {thongBao && <div className={thongBao.loai === 'loi' ? 'canh-bao' : 'thanh-cong'} id="thong-bao-ghi">
        <b>{thongBao.loai === 'loi' ? 'Không thực hiện được' : 'Thành công'}</b>{thongBao.text}</div>}
      {!cay && du.x === undefined ? (
        <p className="ghi-chu huong-dan-chon">Nhấp lên <b>vùng sáng</b> của bản đồ (khu làm việc) để chọn vị trí cây mới{nguon ? ` (cách mọi cây ít nhất ${so(kcMin)} m)` : ''}. Phần bị làm mờ không chọn được.</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); onLuu(); }}>
          <label className="truong">{cay ? 'Vị trí (EPSG:3405)' : 'Vị trí (EPSG:3405, nhấp lại để đổi)'}
            <input readOnly value={cay && !daDoi ? `Giữ nguyên: X = ${so(cay.x, 1)}   Y = ${so(cay.y, 1)}` : `X = ${so(du.x, 1)}   Y = ${so(du.y, 1)}`} /></label>
          {daDoi && <div className="hang-ve-vi-tri" id="hang-ve-vi-tri"><span>Cách vị trí cũ <b>{so(Math.hypot(du.x - cay.x, du.y - cay.y), 1)} m</b></span>
            <button type="button" className="nut vien nho-hon" id="nut-ve-vi-tri-cu" onClick={onVeViTriCu}>Về vị trí cũ</button></div>}
          {quaGan && <div className="canh-bao" id="nb-qua-gan"><b>Quá gần cây #{du.cayGan.ma_cay}</b>Cách {so(du.cayGan.kc, 2)} m (tối thiểu {so(kcMin)} m). Nhấp vị trí khác.</div>}
          {du.ten_khu_vuc && <label className="truong">Khu vực (theo vị trí, hệ thống tự gán)<input readOnly value={du.ten_khu_vuc} name="khu_vuc" /></label>}
          <label className="truong">Loài cây{giong('ma_loai')}
            <select value={du.ma_loai ?? ''} onChange={sua('ma_loai')} required name="ma_loai">
              <option value="" disabled>Chọn loài</option>
              {loaiCay.map((l) => <option key={l.ma_loai} value={l.ma_loai}>{l.ten_loai} ({l.ten_khoa_hoc})</option>)}
            </select></label>
          <div className="hai-cot">
            <label className="truong"><span>Chiều cao H (m){giong('chieu_cao')}</span><input type="number" step="0.1" value={du.chieu_cao ?? ''} onChange={sua('chieu_cao')} required name="chieu_cao" /></label>
            <label className="truong"><span>Bán kính tán R (m){giong('ban_kinh_tan')}</span><input type="number" step="0.1" value={du.ban_kinh_tan ?? ''} onChange={sua('ban_kinh_tan')} required name="ban_kinh_tan" /></label>
          </div>
          <div className="hai-cot">
            <label className="truong"><span>DBH (cm){giong('dbh')}</span><input type="number" step="0.1" value={du.dbh ?? ''} onChange={sua('dbh')} required name="dbh" /></label>
            <label className="truong"><span>Ngày trồng{giong('ngay_trong')}</span><input type="date" value={du.ngay_trong ?? ''} onChange={sua('ngay_trong')} required name="ngay_trong" /></label>
          </div>
          <label className="truong">Tình trạng
            <select value={du.tinh_trang ?? 'Bình thường'} onChange={sua('tinh_trang')} name="tinh_trang">
              {TINH_TRANG.map((t) => <option key={t}>{t}</option>)}
            </select></label>
          {nguon && <label className="o-chon nb-kiem-tra"><input type="checkbox" id="nb-da-kiem-tra" checked={!!du.da_kiem_tra}
            onChange={(e) => onDoi({ ...du, da_kiem_tra: e.target.checked })} />Đã kiểm tra thuộc tính cây mới</label>}
          <div className="hang-nut">
            <button className="nut chinh" type="submit" disabled={dangGui || quaGan || (nguon && !du.da_kiem_tra)} id="nut-luu">{dangGui ? 'Đang lưu…' : 'Lưu'}</button>
            <button className="nut vien" type="button" onClick={onHuy} id="nut-huy-bieu-mau">{cay ? 'Hủy' : 'Đóng'}</button>
          </div>
        </form>
      )}
      {!cay && du.x === undefined && <div className="hang-nut"><button className="nut vien" type="button" onClick={onHuy}>Đóng</button></div>}
      {!cay && <p className="ghi-chu">Sửa hoặc xóa cây: nhấp vào cây trên bản đồ, dùng nút Sửa / Xóa trong cửa sổ thông tin.</p>}
    </aside>
  );
}
