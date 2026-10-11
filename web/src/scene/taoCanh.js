// Dựng cảnh 3D (đặc tả mục 7): SceneView local EPSG:3405, không basemap; các lớp tạo từ GeoJSON của API.
// Cây theo mô hình rút gọn Chương 2: thân trụ (DBH, cao (1-k)H), tán cầu (rộng 2R, cao kH) đặt trên thân.
import Map from '@arcgis/core/Map.js';
import SceneView from '@arcgis/core/views/SceneView.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer.js';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import Extent from '@arcgis/core/geometry/Extent.js';
import Home from '@arcgis/core/widgets/Home.js';
import Polygon from '@arcgis/core/geometry/Polygon.js';
import Point from '@arcgis/core/geometry/Point.js';
import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import * as containsOperator from '@arcgis/core/geometry/operators/containsOperator.js';
import * as differenceOperator from '@arcgis/core/geometry/operators/differenceOperator.js';
import * as unionOperator from '@arcgis/core/geometry/operators/unionOperator.js';

export const SR = new SpatialReference({ wkid: 3405 });
export const K = 0.75;
export const MAU_LOAI = { 1: '#6aa84f', 2: '#2e6b30', 3: '#b5c934', 4: '#3d9970' };

const poly = (g) => ({ type: 'polygon', rings: g.type === 'Polygon' ? g.coordinates : g.coordinates.flat(1), spatialReference: SR });
const line = (g) => ({ type: 'polyline', paths: g.type === 'LineString' ? [g.coordinates] : g.coordinates, spatialReference: SR });
const point = (g) => ({ type: 'point', x: g.coordinates[0], y: g.coordinates[1], spatialReference: SR });
// Hình chiếu tán xuống mặt đất: đa giác tròn bán kính R quanh gốc cây (64 đỉnh), cùng định nghĩa với STBuffer(R) khi thống kê
const SO_DINH = 64;
const vongTan = (f) => {
  const [x, y] = f.geometry.coordinates;
  const r = f.properties.ban_kinh_tan;
  const vong = Array.from({ length: SO_DINH + 1 }, (_, i) => {
    const a = (-2 * Math.PI * (i % SO_DINH)) / SO_DINH;   // chiều kim đồng hồ: vòng ngoài theo quy ước ArcGIS
    return [x + r * Math.cos(a), y + r * Math.sin(a)];
  });
  return { type: 'polygon', rings: [vong], spatialReference: SR };
};

function fieldsOf(props) {
  return Object.entries(props).map(([name, v]) => ({ name, type: typeof v === 'number' ? 'double' : 'string' }));
}

/** FeatureLayer phía client từ FeatureCollection; toGeom chuyển GeoJSON geometry -> geometry ArcGIS. */
function lop(fc, toGeom, geometryType, opts) {
  const sample = fc.features[0]?.properties ?? {};
  return new FeatureLayer({
    source: fc.features.map((f, i) => ({ geometry: toGeom(f.geometry, f), attributes: { oid: i + 1, ...f.properties } })),
    objectIdField: 'oid',
    fields: [{ name: 'oid', type: 'oid' }, ...fieldsOf(sample)],
    geometryType, spatialReference: SR, outFields: ['*'], ...opts,
  });
}

const object3d = (primitive, color) => ({ type: 'point-3d', symbolLayers: [{ type: 'object', resource: { primitive }, material: { color }, anchor: 'bottom' }] });
// Thuộc tính cây hiển thị trong cửa sổ thông tin (dùng bởi nội dung popup tùy biến ThongTinCay)
export const TRUONG_CAY = [
  { khoa: 'ten_loai', nhan: 'Loài' }, { khoa: 'ten_khoa_hoc', nhan: 'Tên khoa học' },
  { khoa: 'chieu_cao', nhan: 'Chiều cao (m)', so: 1 }, { khoa: 'ban_kinh_tan', nhan: 'Bán kính tán (m)', so: 1 },
  { khoa: 'dbh', nhan: 'DBH (cm)', so: 1 }, { khoa: 'ngay_trong', nhan: 'Ngày trồng' }, { khoa: 'tuoi', nhan: 'Tuổi (năm)', so: 0 },
  { khoa: 'tinh_trang', nhan: 'Tình trạng' }, { khoa: 'ten_khu_vuc', nhan: 'Khu vực' }];
// noiDung: hàm ({ graphic }) => HTMLElement (nội dung tùy biến có nút Sửa/Xóa); không có thì dùng bảng trường mặc định
const popupCay = (noiDung) => ({
  title: 'Cây #{ma_cay}', outFields: ['*'],
  content: noiDung ?? [{ type: 'fields', fieldInfos: TRUONG_CAY.map((t) => ({ fieldName: t.khoa, label: t.nhan, ...(t.so !== undefined ? { format: { places: t.so } } : {}) })) }],
});

/** Tạo các lớp từ dữ liệu API. Trả về { layers (theo khóa của bảng lớp dữ liệu), all } */
export function taoLop({ khuVuc, cay, toaNha, duong, ranhGioi, noiDungCay }) {
  const CAY_POPUP = popupCay(noiDungCay);
  const toaNhaLop = lop(toaNha, poly, 'polygon', {
    title: 'Tòa nhà',
    renderer: { type: 'simple', symbol: { type: 'polygon-3d', symbolLayers: [{ type: 'extrude', material: { color: '#d9d6cf' },
      edges: { type: 'solid', color: [90, 90, 90, 0.35] } }] },
    visualVariables: [{ type: 'size', valueExpression: 'Min($feature.chieu_cao, 45)', valueUnit: 'meters' }] },
    popupTemplate: { title: '{ten}', content: 'Chiều cao: {chieu_cao} m ({nguon_chieu_cao})' },
  });
  const duongLop = lop(duong, line, 'polyline', {
    title: 'Đường giao thông', elevationInfo: { mode: 'on-the-ground' },
    renderer: { type: 'simple', symbol: { type: 'simple-line', color: [196, 191, 180], width: 2.2 } },
  });
  const ranhLop = lop(ranhGioi, poly, 'polygon', {
    title: 'Ranh giới', elevationInfo: { mode: 'on-the-ground' },
    renderer: { type: 'simple', symbol: { type: 'simple-fill', color: [0, 0, 0, 0], outline: { color: [20, 20, 20], width: 2.5 } } },
  });
  const khuLop = lop(khuVuc, poly, 'polygon', {
    title: 'Khu vực', elevationInfo: { mode: 'on-the-ground' },
    renderer: { type: 'simple', symbol: { type: 'simple-fill', color: [210, 228, 192, 0.55], outline: { color: [27, 94, 32], width: 1.6, style: 'dash' } } },
    labelingInfo: [{ labelExpressionInfo: { expression: '$feature.ten_khu_vuc' },
      symbol: { type: 'label-3d', symbolLayers: [{ type: 'text', material: { color: '#1b5e20' }, size: 11, halo: { color: 'white', size: 1 } }] } }],
  });
  const than = lop(cay, point, 'point', {
    title: 'Thân cây', elevationInfo: { mode: 'on-the-ground' },
    renderer: { type: 'simple', symbol: object3d('cylinder', '#7b5a3c'), visualVariables: [
      { type: 'size', axis: 'width-and-depth', valueExpression: '$feature.dbh / 100', valueUnit: 'meters' },
      { type: 'size', axis: 'height', valueExpression: `$feature.chieu_cao * ${1 - K}`, valueUnit: 'meters' }] },
    popupTemplate: CAY_POPUP,
  });
  const tan = lop(cay, point, 'point', {
    title: 'Tán cây',
    elevationInfo: { mode: 'relative-to-ground', featureExpressionInfo: { expression: `$feature.chieu_cao * ${1 - K}` }, unit: 'meters' },
    renderer: { type: 'unique-value', field: 'ma_loai', defaultSymbol: object3d('sphere', '#3d9970'),
      uniqueValueInfos: Object.entries(MAU_LOAI).map(([v, c]) => ({ value: Number(v), symbol: object3d('sphere', c) })),
      visualVariables: [
        { type: 'size', axis: 'width-and-depth', valueExpression: '$feature.ban_kinh_tan * 2', valueUnit: 'meters' },
        { type: 'size', axis: 'height', valueExpression: `$feature.chieu_cao * ${K}`, valueUnit: 'meters' }] },
    popupTemplate: CAY_POPUP,
  });
  // Vùng che phủ: hình chiếu đứng của tán xuống mặt đất = hình tròn bán kính R, phủ sát mặt đất (không có chiều cao),
  // mặc định bật (UC04). Không dùng khối trụ: size chỉ theo một trục làm ArcGIS kéo chiều cao theo tỉ lệ R.
  const chePhu = lop(cay, (g, f) => vongTan(f), 'polygon', {
    title: 'Vùng che phủ', elevationInfo: { mode: 'on-the-ground' },
    renderer: { type: 'simple', symbol: { type: 'simple-fill', color: [46, 125, 50, 0.45], outline: { color: [27, 94, 32, 0.8], width: 0.8 } } },
  });
  // Ảnh vệ tinh Esri World Imagery: xuất ảnh động (export) chiếu thẳng sang EPSG:3405 phía máy chủ, phủ lên mặt đất;
  // dịch vụ tile Web Mercator không dùng được trong cảnh local VN-2000. Mặc định tắt.
  const veTinh = new MapImageLayer({ url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
    title: 'Ảnh vệ tinh', imageFormat: 'jpg', visible: false, listMode: 'hide' });
  return {
    layers: { toaNha: [toaNhaLop], duong: [duongLop], cayXanh: [than, tan], chePhu: [chePhu], ranhGioi: [khuLop, ranhLop], veTinh: [veTinh] },
    tan, than, chePhu, khuLop,
    all: [veTinh, khuLop, duongLop, ranhLop, chePhu, toaNhaLop, than, tan],
  };
}

/** Sau khi thêm/sửa/xóa (UC05): thay toàn bộ đối tượng của 3 lớp cây bằng dữ liệu mới từ API. */
export async function capNhatCay(lopCanh, fc) {
  const moi = (hinh) => fc.features.map((f, i) => ({ geometry: hinh(f), attributes: { oid: i + 1, ...f.properties } }));
  for (const [l, hinh] of [[lopCanh.than, (f) => point(f.geometry)], [lopCanh.tan, (f) => point(f.geometry)], [lopCanh.chePhu, vongTan]]) {
    const ids = await l.queryObjectIds();
    await l.applyEdits({ deleteFeatures: ids.map((objectId) => ({ objectId })), addFeatures: moi(hinh) });
  }
}

// ---------- Vùng làm việc khi thêm cây / dời vị trí (UC05) ----------
/** Đa giác từng khu: { ma_khu_vuc: { hinh: Polygon, ten } } */
export function taoVungKhu(khuVuc) {
  return Object.fromEntries(khuVuc.features.map((f) => [f.properties.ma_khu_vuc,
    { hinh: new Polygon(poly(f.geometry)), ten: f.properties.ten_khu_vuc }]));
}
/** Hợp nhiều khu thành một vùng (tài khoản kỹ thuật ở chế độ toàn vùng). */
export const hopVung = (dsHinh) => (dsHinh.length === 1 ? dsHinh[0] : unionOperator.executeMany(dsHinh));
/** Điểm (x, y) có nằm trong vùng không. */
export const trongVung = (vung, x, y) => containsOperator.execute(vung, new Point({ x, y, spatialReference: SR }));
/** Nền (footprint) các tòa nhà để chặn đặt gốc cây trong nhà (mục 219): đa giác + khung bao (lọc nhanh trước khi xét chứa). */
export const taoNenNha = (toaNha) => toaNha.features.map((f) => {
  const hinh = new Polygon(poly(f.geometry));
  return { hinh, ext: hinh.extent, ma: f.properties.ma_toa_nha, ten: f.properties.ten };
});
/** Tòa nhà có nền chứa điểm (x, y), hoặc null. */
export const timNha = (dsNha, x, y) => dsNha.find((n) => x >= n.ext.xmin && x <= n.ext.xmax && y >= n.ext.ymin && y <= n.ext.ymax && trongVung(n.hinh, x, y)) ?? null;
export const tenNha = (n) => (n.ten ? n.ten : `#${n.ma}`);
/** Lớp mặt nạ: làm tối phần ngoài vùng làm việc, viền sáng quanh vùng. */
export function taoLopMatNa() {
  return new GraphicsLayer({ title: 'Mặt nạ vùng làm việc', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });
}
export function datMatNa(lopMatNa, vung, khungNgoai) {
  lopMatNa.removeAll();
  if (!vung) return;
  const ngoai = differenceOperator.execute(Polygon.fromExtent(khungNgoai), vung);
  lopMatNa.addMany([
    new Graphic({ geometry: ngoai, symbol: { type: 'simple-fill', color: [20, 30, 20, 0.55], outline: { width: 0 } } }),
    new Graphic({ geometry: vung, symbol: { type: 'simple-fill', color: [255, 255, 255, 0], outline: { color: [255, 179, 0, 1], width: 3 } } }),
  ]);
}

// ---------- Thống kê cây xanh: tập trung vào một nhóm (loài / tình trạng) ----------
// featureEffect (làm mờ có sẵn) KHÔNG hỗ trợ SceneView -> đổi renderer: thêm biến màu + độ mờ theo biểu thức Arcade.
// Cây thuộc nhóm (và thuộc khu đang chọn nếu có): giữ màu loài, rõ; cây khác: xám, mờ. Biến kích thước giữ nguyên.
const MAU_MO = '#9e9e9e';
const rendererGoc = new WeakMap();      // lớp -> renderer gốc (để bỏ tập trung)
/** nhom = { loai: ma_loai } | { tinhTrang: 'Suy yếu' } | null (bỏ tập trung); khu = ma_khu_vuc | null (toàn vùng) */
export function datTapTrung(lopCanh, nhom, khu) {
  // nhom = { loai, tinhTrang } (null = không áp điều kiện đó); hai điều kiện cùng áp dụng
  const phan = !nhom ? [] : [
    ...(nhom.loai != null ? [`$feature.ma_loai == ${Number(nhom.loai)}`] : []),
    ...(nhom.tinhTrang != null ? [`$feature.tinh_trang == "${String(nhom.tinhTrang).replace(/"/g, '')}"`] : [])];
  const dk = !phan.length ? null : [...phan, ...(khu !== null && khu !== undefined ? [`$feature.ma_khu_vuc == ${Number(khu)}`] : [])].join(' && ');
  for (const l of [lopCanh.tan, lopCanh.than, lopCanh.chePhu]) {
    if (!rendererGoc.has(l)) rendererGoc.set(l, l.renderer.clone());
    const goc = rendererGoc.get(l);
    if (!dk) { l.renderer = goc.clone(); continue; }
    const r = goc.clone();
    const vv = [...(r.visualVariables ?? []).filter((v) => v.type === 'size'),
      { type: 'opacity', valueExpression: `IIF(${dk}, 1, 0)`, stops: [{ value: 0, opacity: 0.18 }, { value: 1, opacity: 1 }] }];
    // Tán: màu loài cho cây thuộc nhóm, xám cho cây khác (biến màu ghi đè màu ký hiệu nên mã hóa cả 4 màu loài)
    if (l === lopCanh.tan) vv.push({ type: 'color', valueExpression: `IIF(${dk}, $feature.ma_loai, 0)`,
      stops: [{ value: 0, color: MAU_MO }, ...Object.entries(MAU_LOAI).map(([m, c]) => ({ value: Number(m), color: c }))] });
    r.visualVariables = vv;
    l.renderer = r;
  }
}

// ---------- UC07: phân tích cây có nguy cơ ảnh hưởng công trình ----------
/** Vòng tròn bán kính r (m) quanh (x, y), 64 đỉnh, chiều kim đồng hồ. */
const vongTron = (x, y, r) => ({ type: 'polygon', spatialReference: SR,
  rings: [Array.from({ length: SO_DINH + 1 }, (_, i) => { const a = (-2 * Math.PI * (i % SO_DINH)) / SO_DINH; return [x + r * Math.cos(a), y + r * Math.sin(a)]; })] });
// Phóng tới một cây khi mở cửa sổ thông tin: tỷ lệ ~1:950 (camera cách cây ~210 m), bằng khoảng 1/3 mức "Phóng tới"
// gốc của ArcGIS (~1:313, ~70 m) - đủ gần để tách cây khỏi các cây xung quanh mà vẫn thấy bối cảnh.
export const PHONG_CAY = { scale: 950, tilt: 62 };
/** Lớp vòng đánh dấu cây đang chọn (vòng xanh đậm quanh gốc, trên mặt đất). */
export const taoLopChon = (title = 'Cây đang chọn') => new GraphicsLayer({ title, listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });
export function datVongChon(lopChon, g, r) {
  lopChon.removeAll();
  if (!g) return;
  const rv = Math.max(r * 1.25, 4);
  lopChon.add(new Graphic({ geometry: vongTron(g.x, g.y, rv),
    symbol: { type: 'simple-fill', color: [0, 172, 193, 0.12], outline: { color: [0, 131, 143, 1], width: 3.5 } } }));
}
export const taoLopPhanTich = () => new GraphicsLayer({ title: 'Phân tích nguy cơ', listMode: 'hide', elevationInfo: { mode: 'on-the-ground' } });
/** Lớp "Vùng ngã đổ" (vùng mục tiêu ISA) cho từng cây có nguy cơ: vòng NGOÀI 1,5 x H (tầm đổ, viền mảnh, nền rất nhạt) và vòng
 *  TRONG 1 x H (viền đậm), cùng các đoạn đường bị ảnh hưởng (đỏ). Trả về các vòng ngoài (để đưa vào khung nhìn). */
export function vePhanTich(lopPhanTich, ketQua, doanDuong) {
  lopPhanTich.removeAll();
  const vong = ketQua.map((r) => new Graphic({ geometry: vongTron(r.x, r.y, r.tam_do), attributes: { ma_cay: r.ma_cay },
    symbol: { type: 'simple-fill', color: [245, 124, 0, 0.06], outline: { color: [245, 124, 0, 0.85], width: 1 } } }));
  const vong1H = ketQua.map((r) => new Graphic({ geometry: vongTron(r.x, r.y, r.chieu_cao), attributes: { ma_cay: r.ma_cay },
    symbol: { type: 'simple-fill', color: [245, 124, 0, 0.12], outline: { color: [230, 81, 0, 0.95], width: 2 } } }));
  const duong = doanDuong.map((f) => new Graphic({ geometry: f.geometry,
    symbol: { type: 'simple-line', color: [208, 59, 59, 0.95], width: 4 } }));
  lopPhanTich.addMany([...vong, ...vong1H, ...duong]);
  return vong;
}

/** SceneView local EPSG:3405, giới hạn trong khung vùng nghiên cứu, camera nhìn xiên toàn vùng. */
export function taoView(container, lopCanh, ranhGioi) {
  const g = ranhGioi.features[0].geometry;   // Polygon: [vòng][điểm]; MultiPolygon: [đa giác][vòng][điểm]
  const coords = g.coordinates.flat(g.type === 'Polygon' ? 1 : 2);
  const xs = coords.map((c) => c[0]); const ys = coords.map((c) => c[1]);
  const ext = new Extent({ xmin: Math.min(...xs) - 150, ymin: Math.min(...ys) - 150, xmax: Math.max(...xs) + 150, ymax: Math.max(...ys) + 150, spatialReference: SR });
  const view = new SceneView({
    container, viewingMode: 'local', spatialReference: SR, clippingArea: ext, extent: ext,
    map: new Map({ layers: lopCanh.all, ground: { surfaceColor: '#e8ecdf' } }),
    environment: { background: { type: 'color', color: [233, 238, 243] }, starsEnabled: false, atmosphereEnabled: false,
      lighting: { type: 'virtual' } },
    // Cửa sổ thông tin ghim góc DƯỚI trái, nằm ngang cạnh Chú giải loài cây (CSS), không có nút tách; bỏ hàng nút
    // "Phóng tới" mặc định (cây tự được phóng tới khi chọn) để dành chỗ cho nội dung. Giữa bản đồ để trống cho cây.
    popup: { dockEnabled: true, dockOptions: { position: 'bottom-left', breakpoint: false, buttonEnabled: false },
      // Ẩn cả thanh tiêu đề ArcGIS: ThongTinCay tự vẽ dòng tiêu đề gọn (mã cây, loài, tình trạng, khu, nút, đóng)
      visibleElements: { actionBar: false, collapseButton: false, heading: false, closeButton: false, featureNavigation: false }, viewModel: { includeDefaultActions: false }, defaultPopupTemplateEnabled: false },
    qualityProfile: 'high',
  });
  // Tô nổi kết quả phân tích nguy cơ (UC07): đỏ, khác màu xanh của tìm kiếm / chọn khu
  view.highlights.add({ name: 'nguy-co', color: '#d03b3b', haloOpacity: 1, fillOpacity: 0.35 });
  // Khu có nhiều cây nhất của nhóm đang tập trung: chỉ viền (nền rất nhạt) để không che cụm cây
  view.highlights.add({ name: 'khu-nhieu', color: '#00b7eb', haloOpacity: 1, fillOpacity: 0.06 });
  const home = new Home({ view, id: 'home' });   // App.vuaToanVung cập nhật viewpoint sau khi căn vừa khít phần bản đồ trống
  view.ui.add(home, 'top-right');
  view.ui.move(['zoom', 'navigation-toggle', 'compass'], 'top-right');
  // Khung nhìn ban đầu: extent ở trên (tạm); App.vuaToanVung căn lại ranh giới vùng vừa khít phần bản đồ trống (trên Chú giải)
  // sau khi giao diện hiện, rồi gán viewpoint cho nút Home. Không goTo ở đây để tránh chạy đua ghi đè khung nhìn đã căn.
  return view;
}
