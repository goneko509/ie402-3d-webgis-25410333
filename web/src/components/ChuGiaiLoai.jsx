// Chú giải loài cây (thành phần 3, UC04): hộp nổi góc dưới trái bản đồ, nền bán trong suốt để không che cảnh 3D;
// bấm tiêu đề để thu gọn / mở. Đường phân cách dưới tiêu đề. Bấm một loài -> cửa sổ thông tin hiện thông tin loài (loai_cay).
// Cửa sổ thông tin cây ghim ngay bên phải, hai hộp cao bằng nhau và vừa đủ nội dung (chieuCaoChung.js):
// hộp báo bề rộng (--cg-rong) và chiều cao TỰ NHIÊN (đo khung nội dung bên trong, không đo hộp - tránh vòng phản hồi
// vì chiều cao hộp lại được đặt theo chiều cao chung).
import { useEffect, useRef, useState } from 'react';
import { MAU_LOAI } from '../scene/taoCanh.js';
import { baoChuGiai } from '../chieuCaoChung.js';

export default function ChuGiaiLoai({ loaiCay, loaiDangXem, onChonLoai }) {
  const [mo, setMo] = useState(true);
  const hopRef = useRef(null);
  const trongRef = useRef(null);
  useEffect(() => {
    const hop = hopRef.current, trong = trongRef.current;
    if (!hop || !trong) return undefined;
    const dat = () => {
      const cs = getComputedStyle(hop);
      const le = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((t, k) => t + parseFloat(cs[k]), 0);
      document.documentElement.style.setProperty('--cg-rong', `${hop.offsetWidth}px`);
      baoChuGiai(mo ? Math.ceil(trong.offsetHeight + le) : 0);     // thu gọn: không kéo cửa sổ thông tin theo
    };
    dat();
    const ro = new ResizeObserver(dat); ro.observe(trong); ro.observe(hop);
    return () => ro.disconnect();
  }, [loaiCay.length, mo]);
  if (!loaiCay.length) return null;
  return (
    <div className={'chu-giai-noi' + (mo ? ' mo' : '')} id="chu-giai-loai" ref={hopRef}>
      <div ref={trongRef}>
        <button type="button" className="chu-giai-tieu-de" aria-expanded={mo} onClick={() => setMo(!mo)}>
          <span>Chú giải loài cây</span><span className="muc-mui" aria-hidden="true">▾</span>
        </button>
        {mo && loaiCay.map((l) => (
          <button type="button" className={'chu-giai' + (loaiDangXem === l.ma_loai ? ' dang-xem' : '')} key={l.ma_loai}
            onClick={() => onChonLoai?.(l.ma_loai)} data-loai={l.ma_loai} title="Xem thông tin loài">
            <span className="cham" style={{ background: MAU_LOAI[l.ma_loai] }} />
            <div>{l.ten_loai} <i>{l.ten_khoa_hoc}</i></div>
          </button>
        ))}
      </div>
    </div>
  );
}
