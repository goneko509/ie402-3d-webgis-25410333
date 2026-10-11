// Mục có tiêu đề bấm để bung xổ / thu gọn (dùng cho các bảng trái, phải). luonHien: phần luôn hiện kể cả khi thu gọn.
// mo / onDoiMo (tùy chọn): điều khiển trạng thái từ bên ngoài (vd. tự thu gọn Thống kê cây xanh khi chạy phân tích).
import { useState } from 'react';

export default function MucThuGon({ id, tieuDe, macDinhMo = true, luonHien, children, mo: moNgoai, onDoiMo }) {
  const [moTrong, setMoTrong] = useState(macDinhMo);
  const mo = moNgoai ?? moTrong;
  const setMo = onDoiMo ?? setMoTrong;
  return (
    <section className={'muc' + (mo ? ' mo' : '')} id={id}>
      <h3><button type="button" className="muc-tieu-de" aria-expanded={mo} onClick={() => setMo(!mo)}>
        <span>{tieuDe}</span><span className="muc-mui" aria-hidden="true">▾</span>
      </button></h3>
      {luonHien}
      {mo && <div className="muc-noi-dung">{children}</div>}
    </section>
  );
}
