// Ứng dụng WebGIS 3D cây xanh: UC01 xem cảnh 3D, UC02 tra cứu, UC03 thống kê, UC04 bật/tắt lớp,
// UC06 đăng nhập, UC05 thêm/sửa/xóa cây (phân quyền theo khu do CSDL quyết định).
// Thêm: chọn vị trí trong khu làm việc (ngoài khu bị làm mờ, nhấp không có tác dụng).
// Sửa / Xóa: ngay trong cửa sổ thông tin cây (ThongTinCay), không dùng bảng bên phải.
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import Graphic from '@arcgis/core/Graphic.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils.js';
import { api } from './api.js';
import { taoKho } from './khoChung.js';
import { xoaCuaSo } from './chieuCaoChung.js';
import { taoLop, taoView, capNhatCay, taoVungKhu, hopVung, trongVung, taoNenNha, timNha, tenNha, taoLopMatNa, datMatNa, taoLopPhanTich, vePhanTich, taoLopChon, datVongChon, datTapTrung, PHONG_CAY, SR } from './scene/taoCanh.js';
import ThanhTieuDe from './components/ThanhTieuDe.jsx';
import BoiCanhBanDo from './components/BoiCanhBanDo.jsx';
import BangLopDuLieu, { DS_LOP } from './components/BangLopDuLieu.jsx';
import { LOC_RONG, bieuThucLoc } from './components/BoLocCay.jsx';
import BangThongKe from './components/BangThongKe.jsx';
import HopDangNhap from './components/HopDangNhap.jsx';
import ThanhQuanTri from './components/ThanhQuanTri.jsx';
import TheTaiKhoan from './components/TheTaiKhoan.jsx';
import BieuMauCay from './components/BieuMauCay.jsx';
import ThongTinCay from './components/ThongTinCay.jsx';
import ChuGiaiLoai from './components/ChuGiaiLoai.jsx';
import ThongTinLoai from './components/ThongTinLoai.jsx';
import HopKhoiPhuc from './components/HopKhoiPhuc.jsx';

// Phiên đăng nhập lưu trong sessionStorage của tab (có thể không dùng được: chế độ riêng tư, bị chặn)
const docPhien = () => { try { return JSON.parse(sessionStorage.getItem('webgis_phien')) ?? null; } catch { return null; } };
const ghiPhien = (p) => { try { p ? sessionStorage.setItem('webgis_phien', JSON.stringify(p)) : sessionStorage.removeItem('webgis_phien'); } catch { /* bỏ qua */ } };

const GHIM = { type: 'point-3d', symbolLayers: [{ type: 'icon', resource: { primitive: 'kite' }, material: { color: '#8a4b08' }, size: 22, outline: { color: 'white', size: 1.5 } }],
  verticalOffset: { screenLength: 30, maxWorldLength: 60 }, callout: { type: 'line', color: '#8a4b08', size: 1.5 } };

// Khoảng giá trị thuộc tính cây (gợi ý trong ô lọc)
function tinhPhamVi(fc) {
  const ps = fc.features.map((f) => f.properties);
  const mm = (k) => (ps.length ? [Math.min(...ps.map((p) => p[k])), Math.max(...ps.map((p) => p[k]))] : undefined);
  const ngay = ps.map((p) => p.ngay_trong).filter(Boolean).sort();
  return { chieu_cao: mm('chieu_cao'), ban_kinh_tan: mm('ban_kinh_tan'), dbh: mm('dbh'), ngay_trong: ngay.length ? [ngay[0], ngay.at(-1)] : undefined };
}

// Thuộc tính mọi cây + tọa độ gốc (x, y) để căn khung nhìn theo cụm cây của nhóm đang tập trung
const thuocTinhCay = (fc) => fc.features.map((f) => ({ ...f.properties, x: f.geometry.coordinates[0], y: f.geometry.coordinates[1] }));
// Điều kiện đang chọn { loai, tinhTrang } (cả hai cùng áp dụng): cây thỏa điều kiện
const thoaChon = (c, chon) => (chon.loai == null || c.ma_loai === chon.loai) && (chon.tinhTrang == null || c.tinh_trang === chon.tinhTrang);
// Khu có NHIỀU cây thỏa điều kiện chọn nhất (bằng nhau -> mật độ cao hơn, rồi mã khu nhỏ hơn)
function khuNhieuNhat(dsCay, nhom, thongKe) {
  const cay = dsCay.filter((c) => thoaChon(c, nhom));
  const dem = new Map();
  cay.forEach((c) => c.ma_khu_vuc !== null && dem.set(c.ma_khu_vuc, (dem.get(c.ma_khu_vuc) ?? 0) + 1));
  const khu = (ma) => thongKe.find((r) => r.ma_khu_vuc === ma);
  const [ma, n] = [...dem].sort((a, b) => b[1] - a[1] || (khu(a[0])?.dien_tich_ha ?? 0) - (khu(b[0])?.dien_tich_ha ?? 0) || a[0] - b[0])[0] ?? [];
  if (ma === undefined) return null;
  return { ma_khu_vuc: ma, ten_khu_vuc: khu(ma)?.ten_khu_vuc ?? `Khu ${ma}`, n, tong: cay.length, cay: cay.filter((c) => c.ma_khu_vuc === ma) };
}
const CANH_CUM_MIN = 120;     // cạnh tối thiểu (m) của khung cụm cây: nhóm chỉ 1-2 cây không bị phóng quá sát

const KC_CAY_MIN = 1;          // nhân bản: vị trí cây mới cách mọi cây hiện có tối thiểu (m)
// Thuộc tính được sao chép khi nhân bản (KHÔNG sao chép tình trạng: kết quả kiểm tra từng cây)
const TRUONG_NHAN_BAN = ['ma_loai', 'chieu_cao', 'ban_kinh_tan', 'dbh', 'ngay_trong'];
const LE_KHUNG = 16;          // lề đều (px) khi đưa một vùng vào khung bản đồ còn trống
// Khung đích trên màn hình = phần bản đồ trống (trái / phải / trên: mép khung bản đồ; dưới: mép trên khối Chú giải + cửa sổ)
// trừ lề LE_KHUNG: [trái, trên, phải, dưới] (px, theo khung bản đồ)
function khungTrong(v) {
  const khung = v.container.getBoundingClientRect();
  const hop = document.querySelector('#chu-giai-loai')?.getBoundingClientRect();
  const dayTrong = hop ? Math.min(v.height, hop.top - khung.top) : v.height;
  return [LE_KHUNG, LE_KHUNG, v.width - LE_KHUNG, dayTrong - LE_KHUNG];
}
// Hệ số phóng để đa giác vừa khít khung trống ở camera HIỆN TẠI: > 1 = đa giác đang hiện nhỏ hơn khung (đang nhìn xa),
// <= 1 = đang phóng to (đa giác lớn hơn / bằng khung)
function heSoVua(v, rings) {
  const A = khungTrong(v);
  const pts = rings.flat().map(([x, y]) => v.toScreen({ type: 'point', x, y, z: 0, spatialReference: SR })).filter(Boolean);
  if (!pts.length) return Infinity;
  const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
  return Math.min((A[2] - A[0]) / (Math.max(...xs) - Math.min(...xs)), (A[3] - A[1]) / (Math.max(...ys) - Math.min(...ys)));
}
const laKyThuat = (tk) => !!tk && (tk.ma_nql === null || tk.ma_nql === undefined);
const moTaLoi = (e) => e.message + (e.detail?.rang_buoc ? ` (ràng buộc ${e.detail.rang_buoc})` : '');

export default function App() {
  const khungRef = useRef(null);
  const canhRef = useRef(null);          // { view, lop, matNa, vungKhu }
  const nhanRef = useRef(null);          // highlight hiện tại
  const nhanNhomRef = useRef(null);      // tô viền khu nhiều cây nhất của nhóm đang tập trung
  const cheDoRef = useRef(null);         // 'them' | 'sua' | null: chế độ của trình xử lý nhấp bản đồ (chọn vị trí)
  const vungRef = useRef(null);          // vùng làm việc hiện tại (Polygon): chỉ nhấp chọn vị trí trong vùng này
  const phienRef = useRef(null);
  const khoRef = useRef(null);
  if (!khoRef.current) khoRef.current = taoKho({ tk: null, kyThuat: false, dsKhu: [], loaiCay: [], nqlKhu: {}, ptCay: {}, hd: {} });
  const kho = khoRef.current;
  const [loi, setLoi] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [loaiCay, setLoaiCay] = useState([]);
  const [thongKe, setThongKe] = useState([]);
  const [khuChon, setKhuChon] = useState(null);
  const [ketQuaTim, setKetQuaTim] = useState('');
  const [hienThi, setHienThi] = useState(Object.fromEntries(DS_LOP.map((l) => [l.khoa, !['veTinh', 'nguyCo'].includes(l.khoa)])));   // mặc định bật mọi lớp trừ ảnh vệ tinh, vùng ngã đổ
  const [phien, setPhien] = useState(docPhien);
  const [moDangNhap, setMoDangNhap] = useState(false);
  const [dangThem, setDangThem] = useState(false);
  const [duLieu, setDuLieu] = useState({});       // dữ liệu biểu mẫu thêm cây
  const [thongBao, setThongBao] = useState(null); // { loai: 'loi' | 'ok', text } trong biểu mẫu thêm
  const [thongBaoNoi, setThongBaoNoi] = useState(null); // thông báo nổi trên bản đồ sau khi sửa / xóa
  const [dangGui, setDangGui] = useState(false);
  // Nhân bản (mục 216): { ma_cay, mau: {thuộc tính cây nguồn}, khuLamViec, tenVung } khi biểu mẫu Thêm cây đang ở chế độ nhân bản
  const [nguonNB, setNguonNB] = useState(null);
  // Sửa cây (mục 224): thuộc tính cây đang sửa khi biểu mẫu sidebar phải ở chế độ sửa
  const [cayDangSua, setCayDangSua] = useState(null);
  const cayDangSuaRef = useRef(null);
  cayDangSuaRef.current = cayDangSua;
  const nguonNBRef = useRef(null);
  nguonNBRef.current = nguonNB;
  const dsCayRef = useRef([]);
  const locRef = useRef(null);                    // biểu thức lọc cây hiện tại (null = không lọc)
  const tongCayRef = useRef(0);                   // tổng số cây trong CSDL (lần tải gần nhất)
  const [dsCay, setDsCay] = useState([]);         // thuộc tính mọi cây (thống kê cây xanh theo khu)
  dsCayRef.current = dsCay;
  const [phamVi, setPhamVi] = useState({});       // min/max thuộc tính cây, làm gợi ý cho bộ lọc
  const [ketQuaLoc, setKetQuaLoc] = useState({});  // { hien, tong }
  // UC07: kết quả phân tích nguy cơ TOÀN VÙNG (vùng ngã đổ 1,5 x H, vùng mục tiêu ISA), nạp sẵn một lần sau khi cảnh tải xong,
  // làm mới khi dữ liệu cây đổi. Lớp "Vùng ngã đổ" và mục Phân tích nguy cơ dùng chung; khu đang xem chỉ lọc lại, không gọi API.
  const [khoNguyCo, setKhoNguyCo] = useState({ ketQua: null, dangTai: false, loi: null });
  const bayNguyCoRef = useRef(false);             // bật bằng nút Phân tích -> vẽ xong thì bay tới các vòng
  const vongNguyCoRef = useRef([]);
  const [khoiPhuc, setKhoiPhuc] = useState(null);   // { xemTruoc, dangTai, dangChay, loi } khi hộp khôi phục đang mở
  // LUỒNG (2) chọn loài / tình trạng (Chú giải, thanh Thống kê): { loai: ma | null, tinhTrang: ten | null }, hai điều kiện cùng
  // áp dụng; null = không chọn (luồng (1) Lọc cây dùng được). Đang chọn thì Lọc cây bị xóa và khóa; chỉ Đặt lại mới bỏ chọn.
  const [tapTrung, setTapTrung] = useState(null);
  const tapTrungRef = useRef(null);
  tapTrungRef.current = tapTrung;
  const [dkLoc, setDkLoc] = useState(LOC_RONG);   // LUỒNG (1) điều kiện Lọc cây (BoLocCay điều khiển qua App)
  const moLoaiRef = useRef(null);
  const [loaiDangXem, setLoaiDangXem] = useState(null);   // loài đang hiện trong cửa sổ thông tin (bấm từ Chú giải)
  const loaiDangXemRef = useRef(null);
  loaiDangXemRef.current = loaiDangXem;
  const gocLoaiRef = useRef(null);                      // gốc React của nội dung cửa sổ loài
  const divLoaiRef = useRef(null);                      // phần tử chứa nội dung cửa sổ loài (đo đã dựng xong chưa)
  const [lanMoLoai, setLanMoLoai] = useState(0);        // mỗi lần mở tạo gốc mới -> luôn vẽ lại (kể cả bấm lại cùng loài)   // nhóm Thống kê cây xanh đang tập trung: { loai } | { tinhTrang } | null
  const nhanPtRef = useRef([]);                   // tô nổi kết quả phân tích (cây, tòa nhà)
  phienRef.current = phien;

  const datGhim = useCallback((x, y) => {
    const v = canhRef.current?.view;
    if (!v) return;
    v.graphics.removeAll();
    if (x !== undefined) v.graphics.add(new Graphic({ geometry: { type: 'point', x, y, spatialReference: SR }, symbol: GHIM }));
  }, []);

  // Vùng làm việc: bật mặt nạ (làm mờ ngoài vùng) và giới hạn nhấp chọn; vung = null -> tắt
  const datVung = useCallback((vung) => {
    const canh = canhRef.current;
    vungRef.current = vung;
    if (!canh) return;
    datMatNa(canh.matNa, vung, canh.view.clippingArea);
    if (!vung && khungRef.current) khungRef.current.style.cursor = '';
  }, []);

  // Khu chứa điểm (theo đa giác khu phía client); CSDL vẫn tự gán khu khi lưu
  const khuCuaDiem = useCallback((x, y) => {
    for (const [ma, k] of Object.entries(canhRef.current.vungKhu)) if (trongVung(k.hinh, x, y)) return { ma_khu_vuc: Number(ma), ten_khu_vuc: k.ten };
    return null;
  }, []);

  // Tải dữ liệu và dựng cảnh một lần
  useEffect(() => {
    let huy = false;
    let gocTruoc = null;
    // Nội dung cửa sổ thông tin cây: component React (xem / sửa / xóa) dựng vào phần tử riêng
    const noiDungCay = ({ graphic }) => {
      const div = document.createElement('div');
      const goc = createRoot(div);
      goc.render(<ThongTinCay a={{ ...graphic.attributes, x: graphic.geometry?.x, y: graphic.geometry?.y }} kho={kho} />);
      if (gocTruoc) { const cu = gocTruoc; setTimeout(() => cu.unmount()); }
      gocTruoc = goc;
      return div;
    };
    (async () => {
      try {
        const [khuVuc, cay, toaNha, duong, ranhGioi, loai, tk] = await Promise.all([
          api.khuVuc(), api.cay(), api.lopNen('toa-nha'), api.lopNen('duong'), api.lopNen('ranh-gioi'), api.loaiCay(), api.thongKe()]);
        if (huy) return;
        setLoaiCay(loai); setThongKe(tk); setPhamVi(tinhPhamVi(cay)); setDsCay(thuocTinhCay(cay)); tongCayRef.current = cay.features.length;
        const lop = taoLop({ khuVuc, cay, toaNha, duong, ranhGioi, noiDungCay });
        const view = taoView(khungRef.current, lop, ranhGioi);
        const matNa = taoLopMatNa();
        const lopPhanTich = taoLopPhanTich();
        const lopChon = taoLopChon();
        const lopSua = taoLopChon('Cây đang sửa / nhân bản');   // vòng đánh dấu cây nguồn khi Sửa / Nhân bản (mục 225)
        view.map.addMany([lopPhanTich, lopChon, lopSua, matNa]);
        canhRef.current = { view, lop, matNa, lopPhanTich, lopSua, vungKhu: taoVungKhu(khuVuc), nenNha: taoNenNha(toaNha) };
        // Người phụ trách từng khu (cửa sổ thông tin cây hiển thị khi cây ngoài khu của tài khoản)
        kho.set({ nqlKhu: Object.fromEntries(khuVuc.features.map((f) => [f.properties.ma_khu_vuc, f.properties.ten_nql])) });
        // Vị trí trên MẶT ĐẤT: bỏ qua tán, thân, tòa nhà (nếu không, nhấp trúng tán cây khác sẽ đặt điểm lên mặt tán)
        const diemMatDat = (e) => view.toMap(e, { exclude: [lop.tan, lop.than, lop.chePhu, ...lop.layers.toaNha] }) ?? e.mapPoint;
        // Nhấp bản đồ khi đang Thêm / Nhân bản / Sửa (biểu mẫu sidebar): chọn vị trí, nhấp bao nhiêu lần tùy ý (lấy lần cuối);
        // chỉ nhận điểm trong vùng làm việc. Điểm trong NỀN TÒA NHÀ (nhấp lên mái -> điểm mặt đất dưới mái) thì không nhận và báo
        // (mục 219; CSDL cũng chặn 50103). Đang ở các chế độ này thì nhấp không mở cửa sổ cây.
        view.on('click', (e) => {
          const cd = cheDoRef.current;
          if (!cd) return;
          e.stopPropagation();
          const mp = diemMatDat(e);
          if (!mp || !vungRef.current || !trongVung(vungRef.current, mp.x, mp.y)) return;
          const nha = timNha(canhRef.current.nenNha, mp.x, mp.y);
          if (nha) { setThongBao({ loai: 'loi', text: `Vị trí nằm trong tòa nhà ${tenNha(nha)}: chọn chỗ ngoài nền nhà.` }); return; }
          datGhim(mp.x, mp.y);
          setThongBao(null);
          // Nhân bản / Sửa: cây gần nhất (sửa: không tính chính cây đang sửa) - gần hơn KC_CAY_MIN thì biểu mẫu chặn lưu
          let cayGan = null;
          const boQua = cayDangSuaRef.current?.ma_cay;
          if (nguonNBRef.current || cd === 'sua') for (const c of dsCayRef.current) {
            if (c.ma_cay === boQua) continue;
            const kc = Math.hypot(c.x - mp.x, c.y - mp.y);
            if (!cayGan || kc < cayGan.kc) cayGan = { ma_cay: c.ma_cay, kc };
          }
          setDuLieu((d) => ({ ...d, x: mp.x, y: mp.y, cayGan, ...khuCuaDiem(mp.x, mp.y) }));
        });
        // Con trỏ: chữ thập trong vùng làm việc, biểu tượng cấm ở phần bị làm mờ và trên nền tòa nhà
        let cho = false;
        view.on('pointer-move', (e) => {
          if (!cheDoRef.current || cho) return;
          cho = true;
          requestAnimationFrame(() => {
            cho = false;
            const mp = diemMatDat(e);
            const duoc = mp && vungRef.current && trongVung(vungRef.current, mp.x, mp.y) && !timNha(canhRef.current.nenNha, mp.x, mp.y);
            if (khungRef.current && cheDoRef.current) khungRef.current.style.cursor = duoc ? 'crosshair' : 'not-allowed';
          });
        });
        // Mở cửa sổ thông tin một cây (bấm bản đồ, tìm kiếm, danh sách phân tích) -> tự phóng tới cây như nút "Phóng tới";
        // không phóng khi đang chọn vị trí thêm cây / dời vị trí. Đợi cửa sổ truy vấn xong các lớp tại điểm bấm
        // (popup.viewModel.waitingForResult) rồi mới di chuyển camera: di chuyển sớm làm hủy truy vấn dở -> AbortError trong SDK.
        // Đây là NƠI DUY NHẤT phóng tới một cây (tìm kiếm / danh sách phân tích chỉ mở cửa sổ) -> camera bay một lần.
        // Kèm vòng xanh đánh dấu cây đang chọn để tách khỏi các cây xung quanh.
        reactiveUtils.watch(() => view.popup?.selectedFeature, async (f) => {
          const laCay = !!f?.geometry && [lop.tan, lop.than].includes(f.layer);
          datVongChon(lopChon, laCay && view.popup?.visible ? f.geometry : null, f?.attributes?.ban_kinh_tan ?? 3);
          if (!laCay || cheDoRef.current) return;
          await reactiveUtils.whenOnce(() => !view.popup?.viewModel?.waitingForResult);
          if (view.popup?.selectedFeature !== f) return;   // đã chọn cây khác trong lúc chờ
          view.goTo({ target: f.geometry, ...PHONG_CAY }).catch(() => {});   // cây đúng tâm canvas (cửa sổ ở dưới, không che)
        });
        // Đóng cửa sổ (chỉ khi visible chuyển true -> false; cửa sổ được tạo lười ở lần mở đầu nên có bước undefined -> false)
        reactiveUtils.watch(() => view.popup?.visible, (mo, cu) => {
          if (!(cu === true && !mo)) return;
          datVongChon(lopChon, null); xoaCuaSo();
          // Đóng cửa sổ (×, nhấp vùng trống trên bản đồ, đổi khu...) CHỈ đóng cửa sổ, không bỏ điều kiện chọn / lọc
          setLoaiDangXem(null);
        });
        // Mở cửa sổ một CÂY (đối tượng thuộc lớp) -> không còn xem loài. Cửa sổ loài chỉ có nội dung tự vẽ nhưng ArcGIS vẫn
        // tạo selectedFeature không thuộc lớp nào -> bỏ qua trường hợp đó.
        reactiveUtils.watch(() => view.popup?.selectedFeature, (f) => { if (f?.layer) setLoaiDangXem(null); });
        await view.when();
        await apLoc(lop);                   // bộ lọc có thể đã được đặt trước khi cảnh dựng xong
        setDangTai(false);
        window.__webgisView = view;         // cho kiểm thử giao diện tự động
        window.__webgisMatNa = matNa;
        window.__WEBGIS_READY = true;
      } catch (e) {
        setLoi(e.message); setDangTai(false);
      }
    })();
    return () => { huy = true; canhRef.current?.view.destroy(); };
  }, [datGhim, datVung, khuCuaDiem, kho]);

  // UC04: bật/tắt lớp
  const doiLop = useCallback((khoa, bat) => {
    setHienThi((h) => ({ ...h, [khoa]: bat }));
    canhRef.current?.lop.layers[khoa]?.forEach((l) => { l.visible = bat; });   // nguyCo: vẽ theo trạng thái (hiệu ứng bên dưới)
  }, []);

  // Lọc cây: áp biểu thức lên 3 lớp cây (thân, tán, vùng che phủ) rồi đếm số cây còn hiện
  const apLoc = useCallback(async (lop) => {
    const where = locRef.current;
    for (const l of [lop.than, lop.tan, lop.chePhu]) l.definitionExpression = where ?? '';
    setKetQuaLoc({ hien: await lop.tan.queryFeatureCount(), tong: tongCayRef.current });   // đếm đã tính definitionExpression
  }, []);
  const datLoc = useCallback((where) => {
    if (where === locRef.current) return;
    locRef.current = where;
    nhanRef.current?.remove(); setKetQuaTim('');   // kết quả tìm cũ có thể không còn đúng với bộ lọc mới
    if (canhRef.current) apLoc(canhRef.current.lop);
  }, [apLoc]);

  // UC02: tìm cây theo mã hoặc loài -> đánh dấu, đưa vào khung nhìn, mở cửa sổ thông tin nếu chỉ có một cây
  const tim = useCallback(async (q) => {
    const canh = canhRef.current;
    if (!canh || !q) return;
    nhanRef.current?.remove();
    try {
      const kq = await api.cay({ q });
      const ds = kq.features.map((f) => f.properties.ma_cay);
      if (!ds.length) { setKetQuaTim('Không tìm thấy'); canh.view.closePopup(); return; }
      // Tìm theo mã cây -> tên loài; theo loài -> "Loài X (n cây)"; khớp nhiều loài -> "n cây · k loài"
      const loai = [...new Set(kq.features.map((f) => f.properties.ten_loai))];
      const moTa = /^\d+$/.test(q) && ds.length === 1 ? loai[0] : loai.length === 1 ? `Loài ${loai[0]} (${ds.length} cây)` : `${ds.length} cây · ${loai.length} loài`;
      const lv = await canh.view.whenLayerView(canh.lop.tan);
      // Ghép điều kiện lọc: cây đang bị bộ lọc ẩn thì không đánh dấu / mở cửa sổ thông tin
      const where = `ma_cay IN (${ds.join(',')})` + (locRef.current ? ` AND (${locRef.current})` : '');
      const { features } = await canh.lop.tan.queryFeatures({ where, returnGeometry: true, outFields: ['*'] });
      if (!features.length) { setKetQuaTim(`${moTa} – bị bộ lọc ẩn`); canh.view.closePopup(); return; }
      nhanRef.current = lv.highlight(features);
      setKetQuaTim(features.length < ds.length ? `${moTa} – hiện ${features.length}` : moTa);
      // Một cây: chỉ mở cửa sổ thông tin, việc phóng tới do trình theo dõi selectedFeature đảm nhận (bay một lần).
      // Nhiều cây: đưa cả nhóm vào khung nhìn (bị ngắt thì bỏ qua).
      if (features.length === 1) canh.view.openPopup({ features, location: features[0].geometry });
      else { canh.view.closePopup(); await canh.view.goTo({ target: features, tilt: 55 }).catch(() => {}); }
    } catch (e) { setKetQuaTim(e.message); }
  }, []);

  // Đưa vùng vào GIỮA và VỪA KHÍT phần bản đồ còn trống: trái / phải / trên là mép khung bản đồ, dưới là mép trên của khối
  // Chú giải + cửa sổ thông tin; lề đều LE_KHUNG. goTo của SceneView căn theo khối cầu bao (rất rộng, không khít) và view.padding
  // đẩy cả cửa sổ ghim -> tự căn: goTo sơ bộ (không hoạt ảnh), chiếu các đỉnh vùng lên màn hình, chỉnh tỷ lệ + tâm vài vòng
  // cho hội tụ (phối cảnh nghiêng), lấy camera đích, trả camera cũ rồi bay mượt một lần tới đích.
  const vuaKhung = useCallback(async (features, tilt, hoatAnh = true) => {
    const v = canhRef.current?.view;
    if (!v || !features?.length) return;
    const A = khungTrong(v);                                                            // khung đích trên màn hình
    const dinh = features.flatMap((f) => f.geometry.rings.flat());
    const hop2 = () => {
      const pts = dinh.map(([x, y]) => v.toScreen({ type: 'point', x, y, z: 0, spatialReference: SR })).filter(Boolean);
      const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    };
    const camCu = v.camera.clone();
    try {
      await v.goTo({ target: features, tilt }, { animate: false });
      // Tính dồn trên tỷ lệ ĐÃ YÊU CẦU: tỷ lệ thực tế sau goTo (camera nghiêng) lệch vài % nên dùng nó sẽ dao động, không hội tụ
      let tyLe = v.scale;
      for (let i = 0; i < 10; i++) {
        const b = hop2();
        const f = Math.min((A[2] - A[0]) / (b[2] - b[0]), (A[3] - A[1]) / (b[3] - b[1]));
        const dx = (b[0] + b[2]) / 2 - (A[0] + A[2]) / 2, dy = (b[1] + b[3]) / 2 - (A[1] + A[3]) / 2;
        if (Math.abs(f - 1) < 0.006 && Math.hypot(dx, dy) < 2) break;
        const tam = v.toMap({ x: v.width / 2 + dx, y: v.height / 2 + dy });   // điểm mặt đất sẽ thành tâm khung nhìn mới
        if (!tam) break;
        tyLe /= f;
        await v.goTo({ target: tam, scale: tyLe, tilt: v.camera.tilt, heading: v.camera.heading }, { animate: false });
      }
      const camDich = v.camera.clone();
      if (!hoatAnh) return;                 // (vd. lúc tải trang) giữ luôn camera đích, không bay
      v.camera = camCu;
      await v.goTo(camDich);
    } catch { /* bị lệnh goTo khác ngắt -> bỏ qua */ }
  }, []);

  // Đợi khung bản đồ trống ổn định trước khi căn: cửa sổ loài (nếu đang mở) đã dựng xong và mép trên Chú giải đứng yên 3 lần đo
  // liên tiếp (mỗi 100 ms, tối đa 3 s). Dùng khi bố cục vừa đổi: mở / đóng cửa sổ, đổi panel phải sang biểu mẫu Thêm cây.
  const choKhungOn = useCallback(async (daHuy = () => false) => {
    let truoc = null, yen = 0;
    for (let i = 0; i < 30 && yen < 3 && !daHuy(); i++) {
      await new Promise((r) => setTimeout(r, 100));
      const san = loaiDangXemRef.current === null || (divLoaiRef.current?.isConnected && divLoaiRef.current.offsetHeight > 0);
      const top = document.querySelector('#chu-giai-loai')?.getBoundingClientRect().top;
      yen = san && top === truoc ? yen + 1 : 0; truoc = top;
    }
  }, []);

  // Toàn vùng nghiên cứu: căn ranh giới vùng vừa khít phần bản đồ trống (nhìn xiên 50° như tổng quan); nút Home về đúng khung này
  const vuaToanVung = useCallback(async (hoatAnh = true) => {
    const canh = canhRef.current;
    if (!canh) return;
    const lopRanh = canh.lop.layers.ranhGioi.find((l) => l.title === 'Ranh giới');
    const { features } = await lopRanh.queryFeatures({ where: '1=1', returnGeometry: true });
    await vuaKhung(features, 50, hoatAnh);
    const home = canh.view.ui.find('home');
    if (home) home.viewpoint = canh.view.viewpoint.clone();
  }, [vuaKhung]);
  // Lúc tải trang: đợi Chú giải hiển thị (đáy phần bản đồ trống) rồi căn toàn vùng, không bay
  useEffect(() => {
    if (dangTai) return;
    requestAnimationFrame(() => requestAnimationFrame(() => vuaToanVung(false)));
  }, [dangTai, vuaToanVung]);

  // UC03: chọn khu -> bảng thống kê đổi theo, khung nhìn chuyển tới khu (vừa khít phần bản đồ còn trống)
  const chonKhu = useCallback(async (ma) => {
    setKhuChon(ma);
    bayNguyCoRef.current = false;         // lệnh "bay tới các vòng" còn chờ (Phân tích) không được đè lên lần căn khu
    const canh = canhRef.current;
    if (!canh) return;
    nhanRef.current?.remove();
    canh.view.closePopup();               // đổi khu = đổi ngữ cảnh: đóng cửa sổ thông tin của cây / loài trước đó
    if (ma === null) { await vuaToanVung(); return; }   // Toàn vùng nghiên cứu: căn ranh giới vùng
    const { features } = await canh.lop.khuLop.queryFeatures({ where: `ma_khu_vuc = ${ma}`, returnGeometry: true });
    const lv = await canh.view.whenLayerView(canh.lop.khuLop);
    nhanRef.current = lv.highlight(features);
    await vuaKhung(features, 55);
  }, [vuaKhung, vuaToanVung]);

  // Thoát mọi chế độ biểu mẫu sidebar (Thêm / Nhân bản / Sửa): tắt mặt nạ, bỏ ghim, xóa biểu mẫu (thay đổi chưa lưu bị bỏ)
  const thoatBieuMau = useCallback(() => {
    cheDoRef.current = null; datVung(null); datGhim();
    if (canhRef.current) datVongChon(canhRef.current.lopSua, null);
    setDangThem(false); setNguonNB(null); setCayDangSua(null); setDuLieu({}); setThongBao(null);
  }, [datVung, datGhim]);

  // Căn khung vùng làm việc NHƯ CHỌN KHU (mục 213) CHỈ KHI vùng đang hiện NHỎ HƠN phần bản đồ trống (đang nhìn xa) hoặc tâm khung
  // nhìn nằm ngoài vùng (mục 215); đang phóng to vào trong vùng thì GIỮ camera (thao tác ngay tại chỗ đang xem). Một / vài khu ->
  // vuaKhung(55°); toàn vùng (tài khoản kỹ thuật) -> như "Toàn vùng nghiên cứu". Đợi bố cục ổn định (cửa sổ đóng, panel phải đổi
  // sang biểu mẫu) rồi mới đo / căn; chế độ đổi giữa chừng thì bỏ.
  const canVungLamViec = useCallback(async (vung, dsHinh, toanVung, cd) => {
    const canh = canhRef.current;
    const daHuy = () => cheDoRef.current !== cd;
    await choKhungOn(daHuy);
    if (daHuy()) return;
    const v = canh.view, A = khungTrong(v);
    const tam = v.toMap({ x: (A[0] + A[2]) / 2, y: (A[1] + A[3]) / 2 });
    const dangPhongTo = heSoVua(v, vung.rings) <= 1.02 && !!tam && trongVung(vung, tam.x, tam.y);
    if (dangPhongTo) return;
    if (toanVung) await vuaToanVung();
    else await vuaKhung(dsHinh.map((h) => new Graphic({ geometry: h })), 55);
  }, [choKhungOn, vuaKhung, vuaToanVung]);

  // UC05 - thêm: bật / tắt chế độ thêm. Bật: làm mờ phần ngoài khu làm việc, căn khung (canVungLamViec). Tắt: giữ camera.
  // khu: mã khu | null (toàn vùng) | mảng mã khu (nhân bản: hợp các khu phụ trách)
  const batThem = useCallback((bat, khu) => {
    const canh = canhRef.current;
    thoatBieuMau();
    if (!bat || !canh) return;
    setDangThem(true); cheDoRef.current = 'them';
    canh.view.closePopup();
    nhanRef.current?.remove();
    const dsHinh = khu === null ? Object.values(canh.vungKhu).map((k) => k.hinh) : [khu].flat().map((m) => canh.vungKhu[m].hinh);
    const vung = hopVung(dsHinh);
    datVung(vung);
    canVungLamViec(vung, dsHinh, khu === null, 'them').catch(() => {});
  }, [thoatBieuMau, datVung, canVungLamViec]);

  // UC05 - sửa (mục 224): biểu mẫu ở sidebar phải như Thêm cây, điền giá trị hiện tại; đóng cửa sổ thông tin. Vào là chọn được
  // vị trí ngay: nhấp bản đồ trong khu của cây (tài khoản kỹ thuật: toàn vùng) bao nhiêu lần tùy ý; không nhấp thì giữ vị trí.
  const batSua = useCallback((a) => {
    const canh = canhRef.current;
    if (!canh) return;
    thoatBieuMau();
    const kt = laKyThuat(phienRef.current?.tai_khoan);
    const dsHinh = kt ? Object.values(canh.vungKhu).map((k) => k.hinh) : [canh.vungKhu[a.ma_khu_vuc]?.hinh].filter(Boolean);
    if (!dsHinh.length) return;
    cheDoRef.current = 'sua';
    datVongChon(canh.lopSua, { x: a.x, y: a.y }, a.ban_kinh_tan ?? 3);   // đánh dấu cây đang sửa như cây đang chọn
    setCayDangSua({ ...a, tenVung: kt ? 'Toàn vùng (tài khoản kỹ thuật)' : `${a.ten_khu_vuc} (${a.ma_khu_vuc})` });
    setDuLieu({ ma_loai: a.ma_loai, chieu_cao: a.chieu_cao, ban_kinh_tan: a.ban_kinh_tan, dbh: a.dbh,
      ngay_trong: a.ngay_trong ? String(a.ngay_trong).slice(0, 10) : '', tinh_trang: a.tinh_trang });
    canh.view.closePopup();
    nhanRef.current?.remove();
    const vung = hopVung(dsHinh);
    datVung(vung);
    canVungLamViec(vung, dsHinh, kt, 'sua').catch(() => {});
  }, [thoatBieuMau, datVung, canVungLamViec]);

  // UC06: đăng nhập / đăng xuất
  const dangNhapXong = useCallback((p) => { setPhien(p); ghiPhien(p); setMoDangNhap(false); }, []);
  const dangXuat = useCallback(() => {
    setPhien(null); ghiPhien(null); batThem(false);
  }, [batThem]);

  // UC07: nạp (lại) kho kết quả phân tích toàn vùng - chỉ ĐỌC (API mặc định 1,5 x H), không ghi CSDL
  const taiNguyCo = useCallback(async () => {
    setKhoNguyCo((k) => ({ ...k, dangTai: true, loi: null }));
    try { setKhoNguyCo({ ketQua: await api.cayNguyCo(), dangTai: false, loi: null }); }
    catch (e) { setKhoNguyCo({ ketQua: null, dangTai: false, loi: e.message }); }
  }, []);
  useEffect(() => { if (!dangTai) taiNguyCo(); }, [dangTai, taiNguyCo]);    // nạp sẵn ngầm sau khi cảnh 3D tải xong
  // Kết quả của khu đang xem (toàn vùng hoặc khu đã chọn) = lọc kho theo khu của cây
  const ketQuaKhu = useMemo(() => (!khoNguyCo.ketQua ? null
    : khuChon === null ? khoNguyCo.ketQua : khoNguyCo.ketQua.filter((r) => r.ma_khu_vuc === khuChon)), [khoNguyCo.ketQua, khuChon]);
  // Bật / tắt lớp Vùng ngã đổ (ô Lớp dữ liệu, nút Phân tích / Ẩn). Bật: bỏ chọn loài / tình trạng để thấy đủ cây nguy cơ;
  // bay = true (nút Phân tích) -> bay tới các vòng (đang bật sẵn thì bay ngay)
  const batNguyCo = useCallback((bat, bay = false) => {
    doiLop('nguyCo', bat);
    if (!bat) { bayNguyCoRef.current = false; return; }
    setTapTrung(null);
    if (loaiDangXemRef.current !== null) canhRef.current?.view.closePopup();
    if (bay) {
      if (vongNguyCoRef.current.length) canhRef.current?.view.goTo({ target: vongNguyCoRef.current, tilt: 50 }).catch(() => {});
      else bayNguyCoRef.current = true;
    }
  }, [doiLop]);
  // Vẽ lớp Vùng ngã đổ theo khu đang xem: vòng 1H / 1,5H, đoạn đường bị ảnh hưởng, tô nổi cây và tòa nhà; tắt lớp -> xóa hết.
  // Đổi khu / dữ liệu mới -> vẽ lại từ kho (không gọi API). Lần vẽ cũ bị hủy nếu điều kiện đổi giữa chừng.
  useEffect(() => {
    const canh = canhRef.current;
    if (!canh) return undefined;
    let huy = false;
    nhanPtRef.current.forEach((h) => h.remove()); nhanPtRef.current = [];
    canh.lopPhanTich.removeAll(); vongNguyCoRef.current = [];
    kho.set({ ptCay: {} });
    if (!hienThi.nguyCo || !ketQuaKhu) return undefined;
    (async () => {
      const dsMa = (khoa) => [...new Set(ketQuaKhu.map((r) => r[khoa]).filter((v) => v !== null))];
      const [maCay, maNha, maDuong] = [dsMa('ma_cay'), dsMa('ma_toa_nha'), dsMa('ma_duong')];
      const [lopNha, lopDuong] = [canh.lop.layers.toaNha[0], canh.lop.layers.duong[0]];
      const doanDuong = maDuong.length ? (await lopDuong.queryFeatures({ where: `ma_duong IN (${maDuong.join(',')})`, returnGeometry: true })).features : [];
      if (huy) return;
      const vong = vePhanTich(canh.lopPhanTich, ketQuaKhu, doanDuong);
      vongNguyCoRef.current = vong;
      const toNoi = async (lop, khoa, ds) => {
        if (!ds.length) return;
        const lv = await canh.view.whenLayerView(lop);
        const { features } = await lop.queryFeatures({ where: `${khoa} IN (${ds.join(',')})`, returnGeometry: false, outFields: ['oid'] });
        if (!huy) nhanPtRef.current.push(lv.highlight(features, { name: 'nguy-co' }));
      };
      await Promise.all([toNoi(canh.lop.tan, 'ma_cay', maCay), toNoi(canh.lop.than, 'ma_cay', maCay), toNoi(lopNha, 'ma_toa_nha', maNha)]);
      if (huy) return;
      kho.set({ ptCay: Object.fromEntries(ketQuaKhu.map((r) => [r.ma_cay, r])) });   // cửa sổ cây hiện đối tượng trong vùng ngã đổ
      if (bayNguyCoRef.current && vong.length) { bayNguyCoRef.current = false; canh.view.goTo({ target: vong, tilt: 50 }).catch(() => {}); }
    })().catch(() => {});
    return () => { huy = true; };
  }, [hienThi.nguyCo, ketQuaKhu, kho]);
  // Đổi khu: điều kiện chọn loài / tình trạng GIỮ NGUYÊN, đang chọn loài thì mở lại cửa sổ loài (chonKhu đã đóng cửa sổ khi đổi
  // ngữ cảnh); lớp Vùng ngã đổ (nếu bật) tự vẽ lại theo khu mới từ kho
  useEffect(() => {
    if (tapTrungRef.current?.loai != null) moLoaiRef.current?.(tapTrungRef.current.loai);
  }, [khuChon]);
  // Tập trung cảnh 3D vào nhóm (loài / tình trạng) trong khu đang chọn; null -> trả cách hiển thị gốc
  useEffect(() => { if (canhRef.current) datTapTrung(canhRef.current.lop, tapTrung, khuChon); }, [tapTrung, khuChon, dangTai]);
  // Nhóm tập trung khi đang xem TOÀN VÙNG: khu có nhiều cây của nhóm nhất (đã chọn một khu -> tập trung trong khu đó, không tính)
  const khuNhieu = tapTrung && khuChon === null ? khuNhieuNhat(dsCay, tapTrung, thongKe) : null;
  const khuNhieuRef = useRef(null);
  khuNhieuRef.current = khuNhieu;
  // Chọn nhóm -> tô viền khu nhiều cây nhất và căn CỤM CÂY của nhóm trong khu đó (khung bao gốc cây + bán kính tán) vừa khít
  // phần bản đồ trống như khi chọn khu. Không đổi khu đang chọn (giữ thống kê, quyền, kết quả phân tích). Bỏ nhóm -> gỡ viền,
  // giữ camera. Không zoom khi đang thêm cây / dời vị trí. Đợi cửa sổ loài dựng xong (chiều cao Chú giải có thể đổi) rồi mới đo.
  useEffect(() => {
    nhanNhomRef.current?.remove(); nhanNhomRef.current = null;
    const canh = canhRef.current, kn = khuNhieuRef.current;
    if (!canh || !kn || cheDoRef.current) return undefined;
    let huy = false;
    // Đỉnh để căn = 4 điểm mép tán của từng cây (căn theo chính cụm cây: khung chữ nhật bao nhìn nghiêng rộng hơn cụm);
    // cụm nhỏ hơn CANH_CUM_MIN thì thêm 4 góc khung tối thiểu quanh tâm cụm
    const dinh = kn.cay.flatMap(({ x, y, ban_kinh_tan: r = 0 }) => [[x - r, y], [x + r, y], [x, y - r], [x, y + r]]);
    const xs = dinh.map((d) => d[0]), ys = dinh.map((d) => d[1]);
    const [cx, cy, h] = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, CANH_CUM_MIN / 2];
    if (Math.max(...xs) - Math.min(...xs) < CANH_CUM_MIN || Math.max(...ys) - Math.min(...ys) < CANH_CUM_MIN)
      dinh.push([cx - h, cy - h], [cx - h, cy + h], [cx + h, cy + h], [cx + h, cy - h]);
    const cum = new Graphic({ geometry: new Polygon({ rings: [[...dinh, dinh[0]]], spatialReference: SR }) });
    (async () => {
      const { features } = await canh.lop.khuLop.queryFeatures({ where: `ma_khu_vuc = ${kn.ma_khu_vuc}`, returnGeometry: false, outFields: ['*'] });
      const lv = await canh.view.whenLayerView(canh.lop.khuLop);
      if (huy) return;
      nhanNhomRef.current = lv.highlight(features, { name: 'khu-nhieu' });
      await choKhungOn(() => huy);
      if (!huy) await vuaKhung([cum], 55);
    })().catch(() => {});
    return () => { huy = true; };
  }, [tapTrung, khuChon, vuaKhung, choKhungOn]);

  // Sau mỗi thao tác ghi: tải lại lớp cây và thống kê
  const taiLai = useCallback(async () => {
    const [cay, tk] = await Promise.all([api.cay(), api.thongKe()]);
    await capNhatCay(canhRef.current.lop, cay);
    setThongKe(tk); setPhamVi(tinhPhamVi(cay)); setDsCay(thuocTinhCay(cay)); tongCayRef.current = cay.features.length;
    taiNguyCo();                                    // dữ liệu cây đổi -> nạp lại kho phân tích (chỉ đọc); lớp đang bật tự vẽ lại
    await apLoc(canhRef.current.lop);
  }, [apLoc, taiNguyCo]);

  // Thông báo nổi: mỗi lần một khóa mới để thông báo trùng nội dung (sửa cùng cây hai lần) vẫn hiện lại
  const baoNoi = useCallback((text, loai = 'ok') => {
    const tb = { text, loai, khoa: Date.now() };
    setThongBaoNoi(tb);
    setTimeout(() => setThongBaoNoi((t) => (t === tb ? null : t)), 6000);
  }, []);

  // UC05 - thêm: lưu cây mới
  const luuThem = useCallback(async () => {
    const d = duLieu;
    const body = { ma_loai: Number(d.ma_loai), chieu_cao: Number(d.chieu_cao), ban_kinh_tan: Number(d.ban_kinh_tan), dbh: Number(d.dbh),
      ngay_trong: d.ngay_trong, tinh_trang: d.tinh_trang || 'Bình thường', x: d.x, y: d.y };
    setDangGui(true); setThongBao(null);
    try {
      const f = await api.themCay(body, phien.token);
      await taiLai();
      datGhim();
      const nb = nguonNBRef.current;
      if (!nb) {
        setDuLieu({});
        setThongBao({ loai: 'ok', text: `Đã thêm cây #${f.properties.ma_cay} (${f.properties.ten_khu_vuc}).` });
      } else {
        // Nhân bản: giữ chế độ với cùng thuộc tính mẫu để đặt tiếp cây kế (hàng cây); vị trí và ô "đã kiểm tra" xóa trắng.
        // Cây mới bị Lọc cây ẩn / không thuộc loài - tình trạng đang chọn -> ghi chú để người dùng không tưởng là mất cây
        const an = (await canhRef.current.lop.tan.queryFeatureCount({ where: `ma_cay = ${f.properties.ma_cay}` })) === 0;
        const tt = tapTrungRef.current;
        const ngoaiChon = !!tt && ((tt.loai != null && tt.loai !== body.ma_loai) || (tt.tinhTrang != null && tt.tinhTrang !== body.tinh_trang));
        setDuLieu({ ...nb.mau });
        setThongBao({ loai: 'ok', text: `Đã nhân bản cây #${nb.ma_cay} → cây #${f.properties.ma_cay} (${f.properties.ten_khu_vuc})`
          + (an ? ' – đang bị Lọc cây ẩn' : ngoaiChon ? ' – không thuộc loài / tình trạng đang chọn' : '') + '. Nhấp vị trí để đặt tiếp.' });
      }
    } catch (e) {
      if (e.status === 401) dangXuat();
      setThongBao({ loai: 'loi', text: moTaLoi(e) });
    } finally { setDangGui(false); }
  }, [duLieu, phien, taiLai, datGhim, dangXuat]);   // eslint-disable-line react-hooks/exhaustive-deps

  // UC05 - sửa / xóa trong cửa sổ thông tin: các hành động gọi từ ThongTinCay qua kho; lỗi ném lại để hiện trong cửa sổ
  const moCuaSoCay = useCallback(async (ma) => {
    const canh = canhRef.current;
    const { features } = await canh.lop.tan.queryFeatures({ where: `ma_cay = ${ma}`, returnGeometry: true, outFields: ['*'] });
    if (features.length) canh.view.openPopup({ features, location: features[0].geometry });
    else canh.view.closePopup();
  }, []);
  // UC05 - sửa: Lưu (thuộc tính + vị trí mới nếu đã nhấp) -> thoát chế độ sửa, mở lại cửa sổ cây với dữ liệu mới; lỗi hiện trong
  // biểu mẫu. Hủy -> thoát, mở lại cửa sổ cây
  const luuSua = useCallback(async () => {
    const a = cayDangSua, d = duLieu;
    if (!a) return;
    const body = { ma_loai: Number(d.ma_loai), chieu_cao: Number(d.chieu_cao), ban_kinh_tan: Number(d.ban_kinh_tan), dbh: Number(d.dbh),
      ngay_trong: d.ngay_trong, tinh_trang: d.tinh_trang, ...(d.x !== undefined ? { x: d.x, y: d.y } : {}) };
    setDangGui(true); setThongBao(null);
    try {
      await api.suaCay(a.ma_cay, body, phien.token);
      await taiLai();
      thoatBieuMau();
      await moCuaSoCay(a.ma_cay);
      baoNoi(`Đã cập nhật cây #${a.ma_cay}.`);
    } catch (e) {
      if (e.status === 401) dangXuat();
      setThongBao({ loai: 'loi', text: moTaLoi(e) });
    } finally { setDangGui(false); }
  }, [cayDangSua, duLieu, phien, taiLai, thoatBieuMau, moCuaSoCay, baoNoi, dangXuat]);
  // "Về vị trí cũ": bỏ vị trí mới đã chọn và gỡ ghim trên bản đồ
  const veViTriCu = useCallback(() => {
    setDuLieu((d) => { const c = { ...d }; ['x', 'y', 'cayGan', 'ma_khu_vuc', 'ten_khu_vuc'].forEach((k) => delete c[k]); return c; });
    datGhim();
  }, [datGhim]);
  const huySua = useCallback(() => {
    const ma = cayDangSuaRef.current?.ma_cay;
    thoatBieuMau();
    if (ma) moCuaSoCay(ma);
  }, [thoatBieuMau, moCuaSoCay]);

  // UC07: bấm một dòng kết quả -> đưa cây vào khung nhìn, mở cửa sổ thông tin
  const chonCayPhanTich = useCallback(async (ma) => {
    await moCuaSoCay(ma);                 // phóng tới + vòng chọn: trình theo dõi selectedFeature (một lần bay)
  }, [moCuaSoCay]);
  useEffect(() => {
    const ghi = async (viec) => {
      try { return await viec(phienRef.current.token); } catch (e) {
        if (e.status === 401) dangXuat();
        throw new Error(moTaLoi(e), { cause: e });
      }
    };
    kho.set({ hd: {
      xoa: (ma) => ghi(async (token) => {
        await api.xoaCay(ma, token);
        await taiLai();
        if (cayDangSuaRef.current?.ma_cay === ma) thoatBieuMau();     // cây đang sửa bị xóa -> thoát chế độ sửa
        canhRef.current.view.closePopup();
        baoNoi(`Đã xóa cây #${ma}.`);
      }),
      // Nhân bản (mục 216): vào chế độ Thêm cây với thuộc tính cây nguồn điền sẵn (trừ tình trạng). Vùng đặt: khu phụ trách
      // chứa cây nguồn; cây nguồn ngoài khu phụ trách -> hợp các khu phụ trách; tài khoản kỹ thuật -> toàn vùng.
      nhanBan: (a) => {
        const tk = phienRef.current?.tai_khoan;
        if (!tk) return;
        const kt = laKyThuat(tk);
        const ds = (Array.isArray(tk.khu_phu_trach) ? tk.khu_phu_trach : []).map((k) => k.ma_khu_vuc);
        if (!kt && !ds.length) return;
        const khu = kt ? null : ds.includes(a.ma_khu_vuc) ? a.ma_khu_vuc : ds;
        batThem(true, khu);
        datVongChon(canhRef.current.lopSua, { x: a.x, y: a.y }, a.ban_kinh_tan ?? 3);   // đánh dấu cây nguồn
        const ten = (m) => canhRef.current.vungKhu[m]?.ten ?? `Khu ${m}`;
        const mau = Object.fromEntries(TRUONG_NHAN_BAN.map((k) => [k, k === 'ngay_trong' ? (a.ngay_trong ? String(a.ngay_trong).slice(0, 10) : '') : a[k]]));
        setNguonNB({ ma_cay: a.ma_cay, mau,
          tenVung: khu === null ? 'Toàn vùng (tài khoản kỹ thuật)' : Array.isArray(khu) ? `Các khu phụ trách: ${khu.map(ten).join(', ')}` : `${ten(khu)} (${khu})` });
        setDuLieu({ ...mau });
      },
      batSua,
      dongCuaSo: () => canhRef.current?.view.closePopup(),
    } });
  }, [kho, taiLai, moCuaSoCay, baoNoi, batThem, batSua, thoatBieuMau, dangXuat]);

  // Admin: khôi phục dữ liệu cây mặc định (xem trước -> xác nhận -> thực hiện -> tải lại cảnh)
  const moKhoiPhuc = useCallback(async () => {
    setKhoiPhuc({ dangTai: true });
    try { setKhoiPhuc({ xemTruoc: await api.khoiPhucXemTruoc(phien.token) }); }
    catch (e) { if (e.status === 401) dangXuat(); setKhoiPhuc({ loi: moTaLoi(e) }); }
  }, [phien, dangXuat]);
  const thucHienKhoiPhuc = useCallback(async () => {
    setKhoiPhuc((k) => ({ ...k, dangChay: true, loi: null }));
    try {
      const kq = await api.khoiPhuc(phien.token);
      if (cayDangSuaRef.current) thoatBieuMau();      // dữ liệu cây đổi hàng loạt -> thoát chế độ sửa
      canhRef.current?.view.closePopup();
      await taiLai();
      setKhoiPhuc(null);
      baoNoi(`Đã khôi phục: xóa ${kq.so_xoa_cay_them}, hoàn tác ${kq.so_hoan_tac_sua}, phục hồi ${kq.so_phuc_hoi_cay_xoa} cây.`);
    } catch (e) { if (e.status === 401) dangXuat(); setKhoiPhuc((k) => ({ ...k, dangChay: false, loi: moTaLoi(e) })); }
  }, [phien, taiLai, baoNoi, dangXuat, thoatBieuMau]);

  // Admin: nhật ký thay đổi (thẻ trong hộp khôi phục) - tải và hoàn tác từng mục
  const taiNhatKy = useCallback(() => api.nhatKy(phien.token), [phien]);
  const hoanTacNhatKy = useCallback(async (r) => {
    try { await api.hoanTacNhatKy(r.ma_nk, phien.token); }
    catch (e) { if (e.status === 401) dangXuat(); throw new Error(moTaLoi(e), { cause: e }); }
    if (cayDangSuaRef.current) thoatBieuMau();
    canhRef.current?.view.closePopup();
    await taiLai();
    baoNoi(`Đã hoàn tác thao tác ${r.thao_tac === 'them' ? 'thêm' : r.thao_tac === 'sua' ? 'sửa' : 'xóa'} cây #${r.ma_cay}.`);
  }, [phien, taiLai, baoNoi, dangXuat, thoatBieuMau]);

  // Chú giải loài cây: bấm một loài -> cửa sổ thông tin hiện thông tin loài (dựng React vào phần tử riêng, như cửa sổ cây)
  const moLoai = useCallback((ma) => {
    const canh = canhRef.current;
    if (!canh || cheDoRef.current) return;
    if (gocLoaiRef.current) { const cu = gocLoaiRef.current; setTimeout(() => cu.unmount()); }
    const div = document.createElement('div');
    divLoaiRef.current = div;
    gocLoaiRef.current = createRoot(div);
    setLoaiDangXem(ma); setLanMoLoai((n) => n + 1);
    canh.view.openPopup({ title: loaiCay.find((l) => l.ma_loai === ma)?.ten_loai ?? 'Loài cây', content: div });
  }, [loaiCay]);
  // Vẽ (lại) nội dung cửa sổ loài khi đổi loài / dữ liệu cây
  useEffect(() => {
    const loai = loaiCay.find((l) => l.ma_loai === loaiDangXem);
    if (!loai || !gocLoaiRef.current) return;
    gocLoaiRef.current.render(<ThongTinLoai loai={loai} dsCay={dsCay} khuNhieu={khuNhieu?.ma_khu_vuc !== undefined && tapTrung?.loai === loai.ma_loai ? khuNhieu : null}
      tinhTrang={tapTrung?.loai === loai.ma_loai ? tapTrung.tinhTrang : null} onDong={() => canhRef.current?.view.closePopup()} />);
  }, [loaiDangXem, lanMoLoai, loaiCay, dsCay, khuNhieu?.ma_khu_vuc, khuNhieu?.n, tapTrung]);   // eslint-disable-line react-hooks/exhaustive-deps

  moLoaiRef.current = moLoai;
  // LUỒNG (2) chọn loài / tình trạng, đồng bộ: bản đồ (làm mờ cây không thỏa), cửa sổ loài, Chú giải tô đậm, thanh Thống kê,
  // hộp bối cảnh. nhom = { loai } hoặc { tinhTrang }: THAY giá trị của nhóm đó, nhóm kia giữ nguyên (hai điều kiện cùng áp dụng).
  // Bắt đầu chọn (đang tự do) -> xóa Lọc cây (luồng (1) bị khóa đến khi Đặt lại). Bấm lại mục đang chọn: không bỏ chọn;
  // là loài thì mở lại cửa sổ loài (nếu đã đóng). Không đổi gì -> giữ nguyên đối tượng (không zoom / vẽ lại thừa).
  const chonNhom = useCallback((nhom) => {
    const cu = tapTrungRef.current;
    if (!cu) setDkLoc(LOC_RONG);
    const moi = { loai: null, tinhTrang: null, ...cu, ...nhom };
    if (!cu || moi.loai !== cu.loai || moi.tinhTrang !== cu.tinhTrang) setTapTrung(moi);
    if (nhom.loai !== undefined && (loaiDangXemRef.current !== nhom.loai || !canhRef.current?.view.popup?.visible)) moLoai(nhom.loai);
  }, [moLoai]);
  // ĐẶT LẠI (hộp bối cảnh) = Xóa lọc của cả hai luồng: bỏ chọn loài / tình trạng, đưa Lọc cây về mặc định và mở khóa.
  // Giữ khu đang xem và camera; đóng cửa sổ loài (viền khu nhiều nhất tự gỡ khi bỏ chọn).
  const datLai = useCallback(() => {
    setTapTrung(null); setDkLoc(LOC_RONG);
    if (loaiDangXemRef.current !== null) canhRef.current?.view.closePopup();
  }, []);
  // Lọc cây: điều kiện -> biểu thức áp lên lớp cây
  const whereLoc = bieuThucLoc(dkLoc);
  useEffect(() => { datLoc(whereLoc); }, [whereLoc, datLoc]);

  // Quyền thao tác theo khu đang chọn: người quản lý chỉ khi khu đang chọn thuộc khu phụ trách;
  // tài khoản kỹ thuật (ma_nql trống) bật ở mọi lựa chọn. CSDL (trigger) vẫn kiểm tra lần cuối.
  const tk = phien?.tai_khoan;
  const kyThuat = laKyThuat(tk);
  const dsKhu = Array.isArray(tk?.khu_phu_trach) ? tk.khu_phu_trach : [];
  const duocPhep = !!tk && (kyThuat || dsKhu.some((k) => k.ma_khu_vuc === khuChon));
  const tenKhuChon = thongKe.find((r) => r.ma_khu_vuc === khuChon && khuChon !== null)?.ten_khu_vuc;
  const khuLamViec = khuChon === null ? null : { ma_khu_vuc: khuChon, ten_khu_vuc: tenKhuChon };
  // Chú thích khi rê chuột lên nút Thêm cây
  const goiY = !tk ? '' : duocPhep ? `Thêm cây tại ${tenKhuChon ?? 'toàn vùng'}` : 'Chọn khu bạn phụ trách để thêm cây';

  // Cửa sổ thông tin cây đọc tài khoản / loài cây từ kho
  useEffect(() => {
    kho.set({ tk: tk ?? null, kyThuat, dsKhu: dsKhu.map((k) => k.ma_khu_vuc), loaiCay });
    if (!tk && cheDoRef.current === 'sua') thoatBieuMau();
  }, [kho, tk, kyThuat, loaiCay]);   // eslint-disable-line react-hooks/exhaustive-deps

  // Khu đang chọn không còn thuộc quyền (ví dụ đăng nhập tài khoản khác) -> thoát chế độ thêm
  useEffect(() => { if (dangThem && !nguonNB && !duocPhep) batThem(false); }, [dangThem, nguonNB, duocPhep, batThem]);

  return (
    <div className="app">
      <ThanhTieuDe onTim={tim} ketQuaTim={ketQuaTim}
        boiCanh={!dangTai && <BoiCanhBanDo dsCay={dsCay} loaiCay={loaiCay} thongKe={thongKe} khuChon={khuChon} tapTrung={tapTrung} khuNhieu={khuNhieu}
          dangLoc={!!whereLoc} ketQuaLoc={ketQuaLoc} onDatLai={datLai} />}>
        {phien ? (<>
          {!dangTai && <ThanhQuanTri dangThem={dangThem} onThem={(bat) => batThem(bat, khuChon)} duocPhep={duocPhep} goiY={goiY}
            kyThuat={kyThuat} onKhoiPhuc={moKhoiPhuc} />}
          <TheTaiKhoan tk={tk} />
          <button className="nut sang" onClick={dangXuat} id="nut-dang-xuat">Đăng xuất</button>
        </>) : (
          <button className="nut sang" onClick={() => setMoDangNhap(true)} id="nut-dang-nhap">Đăng nhập quản trị</button>
        )}
      </ThanhTieuDe>
      <BangLopDuLieu hienThi={hienThi} onDoi={(khoa, bat) => (khoa === 'nguyCo' ? batNguyCo(bat) : doiLop(khoa, bat))} loaiCay={loaiCay} phamVi={phamVi} ketQuaLoc={ketQuaLoc}
        dkLoc={dkLoc} onDoiDkLoc={setDkLoc} khoaLoc={!!tapTrung} />
      <main>
        <div ref={khungRef} className="khung-3d" />
        {dangTai && <div className="thong-bao">Đang tải dữ liệu và dựng cảnh 3D…</div>}
        {loi && <div className="thong-bao loi">Không tải được dữ liệu: {loi}. Kiểm tra API (webgis/api, npm start).</div>}
        {!dangTai && <ChuGiaiLoai loaiCay={loaiCay} loaiDangXem={tapTrung?.loai ?? null} onChonLoai={(ma) => chonNhom({ loai: ma })} />}
        {thongBaoNoi && <div className={'thong-bao-noi' + (thongBaoNoi.loai === 'canh-bao' ? ' canh-bao-noi' : '')} id="thong-bao-noi" role="status" key={thongBaoNoi.khoa} data-khoa={thongBaoNoi.khoa}>{thongBaoNoi.loai === 'canh-bao' ? '⚠' : '✔'} {thongBaoNoi.text}</div>}
        <div className="crs">VN-2000 / UTM 48N (EPSG:3405)</div>
      </main>
      {dangThem || cayDangSua
        ? <BieuMauCay du={duLieu} loaiCay={loaiCay} onDoi={setDuLieu} onLuu={cayDangSua ? luuSua : luuThem}
            onHuy={cayDangSua ? huySua : () => batThem(false)} dangGui={dangGui} thongBao={thongBao} khuLamViec={khuLamViec}
            nguon={nguonNB} sua={cayDangSua} kcMin={KC_CAY_MIN}
            onVeViTriCu={veViTriCu} />
        : <BangThongKe thongKe={thongKe} khuChon={khuChon} onChonKhu={chonKhu} dsCay={dsCay} loaiCay={loaiCay}
            phanTich={{ ketQua: hienThi.nguyCo ? ketQuaKhu : null, dangChay: hienThi.nguyCo && !ketQuaKhu && khoNguyCo.dangTai, loi: khoNguyCo.loi,
              onPhanTich: () => batNguyCo(true, true), onXoa: () => batNguyCo(false), onChonCay: chonCayPhanTich }}
            tapTrung={tapTrung} onTapTrung={chonNhom}
            khuPhuTrach={!tk ? [] : kyThuat ? thongKe.filter((r) => r.ma_khu_vuc !== null).map((r) => r.ma_khu_vuc) : dsKhu.map((k) => k.ma_khu_vuc)} />}
      {khoiPhuc && <HopKhoiPhuc {...khoiPhuc} onXacNhan={thucHienKhoiPhuc} onDong={() => setKhoiPhuc(null)} onLamMoi={moKhoiPhuc}
        nhatKy={{ onTai: taiNhatKy, onHoanTac: hoanTacNhatKy, loaiCay, khuVuc: thongKe.filter((r) => r.ma_khu_vuc !== null) }} />}
      {moDangNhap && <HopDangNhap onThanhCong={dangNhapXong} onDong={() => setMoDangNhap(false)} />}
    </div>
  );
}
