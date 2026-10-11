// Kiểm thử giao diện UC01 - UC04 bằng Chrome headless (puppeteer), chụp ảnh từng bước vào tests/anh/.
// Cần: API (webgis/api: npm start, cổng 3001) và web (npm run dev, cổng 5173) đang chạy.
// Chạy: node tests/kiem_thu_giao_dien.mjs [http://localhost:5173]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'anh');
fs.mkdirSync(out, { recursive: true });
const URL = process.argv[2] || 'http://localhost:5173';
const API = URL + '/api';
const puppeteer = createRequire(import.meta.url)(process.env.PUPPETEER || 'puppeteer');

const kq = [];
const check = (ma, ten, ok, tt = '') => kq.push([ma, ten, ok ? 'Đạt' : 'KHÔNG ĐẠT', tt]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 960 });
const loiTrang = [];
page.on('pageerror', (e) => loiTrang.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') loiTrang.push(m.text()); });

// Chờ cảnh 3D dựng xong (SceneView hết "updating")
async function choCanh(timeout = 300000) {
  await page.waitForFunction(() => window.__WEBGIS_READY === true, { timeout });   // cờ do App.jsx đặt sau view.when()
  await sleep(3000);
  await page.waitForFunction(() => !window.__webgisView.updating, { timeout });     // chờ các lớp vẽ xong
  await sleep(2000);
}

// Nhập ô tìm kiếm: xóa nội dung cũ (Ctrl+A, Backspace) rồi gõ và Enter
async function timKiem(text) {
  await page.click('.tim input');
  await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.type('.tim input', text);
  await page.keyboard.press('Enter');
}

// Lần chạy đầu Vite phải đóng gói trước @arcgis/core nên có thể mất vài phút
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 300000 });
await choCanh();
await page.screenshot({ path: path.join(out, '1_tong_quan.png') });
const nhanLop = await page.$$eval('.lop', (els) => els.map((e) => e.textContent.trim()));
const loai = await page.$$eval('#chu-giai-loai .chu-giai', (els) => els.length);
check('U1', 'UC01: cảnh 3D hiển thị, có canvas WebGL', (await page.$('.khung-3d canvas')) !== null);
const macDinh = await page.$$eval('.lop input', (els) => els.map((e) => e.checked));
check('U14', 'Mục Lọc cây mở sẵn khi tải trang', (await page.$('#bo-loc-cay')) !== null);
check('U2', 'Bảng lớp dữ liệu 7 lớp (mặc định bật hết trừ ảnh vệ tinh, vùng ngã đổ); chú giải nổi 4 loài',
  nhanLop.length === 7 && loai === 4 && JSON.stringify(macDinh) === '[true,true,true,true,true,false,false]', `${nhanLop.length} lớp, ${loai} loài, ${JSON.stringify(macDinh)}`);
const kpi = await page.$$eval('.kpi b', (els) => els.map((e) => e.textContent));
check('U3', 'Thống kê toàn vùng: 333 cây', kpi[0] === '333', kpi.join(' | '));

// UC04: bật ảnh vệ tinh, tắt tòa nhà
const hop = await page.$$('.lop input');
await hop[5].click(); await hop[0].click(); await sleep(5000);
const trangThai = await page.$$eval('.lop input', (els) => els.map((e) => e.checked));
const veTinh = await page.evaluate(() => { const l = window.__webgisView.map.allLayers.find((x) => x.title === 'Ảnh vệ tinh'); return l.visible && !l.loadError; });
check('U4', 'UC04: bật Ảnh vệ tinh (Esri World Imagery, EPSG:3405), tắt Tòa nhà', trangThai[5] === true && trangThai[0] === false && veTinh, JSON.stringify(trangThai));
await page.screenshot({ path: path.join(out, '2_bat_tat_lop.png') });
await hop[5].click(); await hop[0].click(); await sleep(2000);

// UC02: tìm cây 14 -> 1 cây, mở cửa sổ thông tin
await timKiem('14');
await page.waitForFunction(() => document.querySelector('.kq-tim')?.textContent, { timeout: 30000 });
await sleep(8000);
const kqTim = await page.$eval('.kq-tim', (e) => e.textContent);
// SDK 5.x vẽ popup trong shadow DOM -> đọc trạng thái popup qua view (App.jsx gán window.__webgisView)
const popup = await page.evaluate(() => {
  const p = window.__webgisView.popup;
  const a = p?.selectedFeature?.attributes;
  return Boolean(p?.visible && a && a.ma_cay === 14 && a.ten_loai === 'Me tây');
});
check('U5', 'UC02: tìm mã 14 -> ô tìm ghi "Me tây", cửa sổ thông tin "Cây #14"', kqTim === 'Me tây' && popup, kqTim);
await page.screenshot({ path: path.join(out, '3_tim_cay_14.png') });

// UC02: tìm theo loài
await timKiem('Sao đen');
await sleep(8000);
const kqLoai = await page.$eval('.kq-tim', (e) => e.textContent);
const nSaoDen = (await (await fetch(`${API}/cay?q=${encodeURIComponent('Sao đen')}`)).json()).features.length;
check('U6', 'UC02: tìm loài "Sao đen" -> ô tìm ghi "Loài Sao đen (n cây)", n khớp CSDL', kqLoai === `Loài Sao đen (${nSaoDen} cây)` && nSaoDen > 1, kqLoai);
await page.screenshot({ path: path.join(out, '4_tim_sao_den.png') });

// UC03: chọn khu 3 trong biểu đồ
const thanh = await page.$$('.thanh');
await thanh[2].click(); await sleep(8000);
const kpi3 = await page.$$eval('.kpi b', (els) => els.map((e) => e.textContent));
const chon = await page.$eval('select', (s) => s.value);
// Đối chiếu với thống kê CSDL (sp_thong_ke_che_phu qua API) thay vì số cố định: dữ liệu có thể đã được sửa khi thử chức năng
const tk3 = (await (await fetch(`${API}/thong-ke?khu=3`)).json())[0];
const tyLe3 = tk3.ty_le_che_phu.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
check('U7', 'UC03: chọn khu 3 -> số cây và tỷ lệ che phủ khớp thống kê CSDL', chon === '3' && kpi3[0] === String(tk3.so_cay) && kpi3[2].startsWith(tyLe3),
  `${kpi3.join(' | ')} (CSDL ${tk3.so_cay} cây, ${tyLe3} %)`);
await page.screenshot({ path: path.join(out, '5_thong_ke_khu_3.png') });

// Lọc cây: chỉ Lim xẹt, chiều cao >= 10 m -> số cây hiển thị khớp dữ liệu API; Xóa lọc -> toàn bộ
const dsCay = (await (await fetch(`${API}/cay`)).json()).features.map((f) => f.properties);
// Mục Lọc cây mặc định mở; chỉ bấm tiêu đề nếu đang đóng
if (!(await page.$('#bo-loc-cay'))) { await page.click('#muc-loc .muc-tieu-de'); await sleep(800); }
for (const m of [1, 2, 4]) await page.click(`input[data-loai="${m}"]`);
await page.type('input[name=chieu_cao_tu]', '10'); await sleep(2000);
const hienLoc = Number(await page.$eval('#ket-qua-loc b', (e) => e.textContent));
const kyVong = dsCay.filter((p) => p.ma_loai === 3 && p.chieu_cao >= 10).length;
const tanHien = await page.evaluate(() => window.__webgisView.map.allLayers.find((l) => l.title?.includes('Tán'))?.definitionExpression ?? '');
await page.screenshot({ path: path.join(out, '6_loc_cay.png') });
await page.click('#nut-xoa-loc'); await sleep(2000);
const hienSauXoa = Number(await page.$eval('#ket-qua-loc b', (e) => e.textContent));
check('U8', 'Lọc cây: Lim xẹt, H >= 10 m -> số cây hiện khớp CSDL; Xóa lọc -> hiện lại toàn bộ',
  hienLoc === kyVong && hienSauXoa === dsCay.length, `${hienLoc} = ${kyVong}; sau xóa ${hienSauXoa}; ${tanHien}`);

// Bung xổ / thu gọn Thống kê che phủ: thu gọn ẩn KPI và biểu đồ, vẫn giữ ô chọn khu
await page.click('#muc-thong-ke .muc-tieu-de'); await sleep(500);
const thuGon = (await page.$('.kpis')) === null && (await page.$('#muc-thong-ke select')) !== null;
await page.click('#muc-thong-ke .muc-tieu-de'); await sleep(500);
check('U9', 'Thống kê che phủ: thu gọn ẩn KPI và biểu đồ, giữ ô chọn khu; bung lại hiện đủ', thuGon && (await page.$('.kpis')) !== null);

// Lọc: ô "Tất cả" của Loài cây -> bỏ hết (0 cây), chọn lại hết (toàn bộ)
if (!(await page.$('#loc-loai-tat-ca'))) { await page.click('#muc-loc .muc-tieu-de'); await sleep(500); }
await page.click('#loc-loai-tat-ca'); await sleep(1500);
const boHet = Number(await page.$eval('#ket-qua-loc b', (e) => e.textContent));
await page.click('#loc-loai-tat-ca'); await sleep(1500);
const chonHet = Number(await page.$eval('#ket-qua-loc b', (e) => e.textContent));
check('U11', 'Lọc cây: ô "Tất cả" loài -> bỏ hết 0 cây, chọn lại hết toàn bộ', boHet === 0 && chonHet === dsCay.length, `${boHet}; ${chonHet}`);

// Thống kê cây xanh theo khu đang chọn (khu 3): % theo loài và tình trạng khớp dữ liệu API
const c3 = dsCay.filter((p) => p.ma_khu_vuc === 3);
const pct = (n) => ((n / c3.length) * 100).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const tkCay = await page.$$eval('#muc-thong-ke-cay .tk-thanh', (els) => Object.fromEntries(els.map((e) => [e.dataset.khoa, e.querySelector('.tk-so b').textContent])));
const kvLoai = [1, 2, 3, 4].every((m) => tkCay[`loai-${m}`] === `${pct(c3.filter((p) => p.ma_loai === m).length)} %`);
const kvTt = ['Bình thường', 'Suy yếu', 'Nguy hiểm'].every((t) => tkCay[`tt-${t}`] === `${pct(c3.filter((p) => p.tinh_trang === t).length)} %`);
check('U12', 'Thống kê cây xanh khu 3: % theo loài và theo tình trạng khớp dữ liệu CSDL', kvLoai && kvTt, JSON.stringify(tkCay));
await page.screenshot({ path: path.join(out, '7_thong_ke_cay.png') });

// UC07: phân tích nguy cơ cho khu đang chọn (khu 3) -> số cây khớp API; bấm dòng đầu -> mở cửa sổ thông tin đúng cây
await page.click('#nut-phan-tich'); await page.waitForSelector('#pt-tom-tat', { timeout: 60000 }); await sleep(3000);
const ptApi = await (await fetch(`${API}/phan-tich/cay-nguy-co?khu=3`)).json();
const ptDong = await page.$$eval('#pt-ds .pt-dong', (els) => els.map((e) => Number(e.dataset.maCay)));
const ptDoHoa = await page.evaluate(() => window.__webgisView.map.allLayers.find((l) => l.title === 'Phân tích nguy cơ').graphics.length);
await page.screenshot({ path: path.join(out, '8_phan_tich_nguy_co.png') });
let ptPopup = null;
if (ptDong.length) {
  await page.click('#pt-ds li:first-child .pt-dong'); await sleep(6000);
  ptPopup = await page.evaluate(() => { const p = window.__webgisView.popup; return p?.visible ? p.selectedFeature?.attributes?.ma_cay : null; });
}
const tkCayMo = (await page.$('#muc-thong-ke-cay .tk-thanh')) !== null;
const ptHop = ptPopup ? await page.$eval(`pierce/#ttc-pt`, (e) => e.textContent).catch(() => '') : '';
const gmap = ptPopup ? await page.$eval('pierce/#ttc-gmap', (e) => e.href).catch(() => '') : '';
check('U15', 'Bấm Phân tích -> Thống kê cây xanh tự thu gọn; cửa sổ thông tin có "Đối tượng trong tầm đổ" và liên kết Google Maps (WGS84)',
  !tkCayMo && (ptApi.length === 0 || (ptHop.includes('vùng ngã đổ') && /google\.com\/maps\/search\/\?api=1&query=10\.8\d+,106\.[78]\d+/.test(gmap))), `${ptHop.slice(0, 60)} | ${gmap.slice(-32)}`);
check('U13', 'UC07: phân tích nguy cơ khu 3 -> danh sách khớp API, có vòng tầm đổ; bấm dòng đầu mở đúng cây',
  JSON.stringify(ptDong) === JSON.stringify(ptApi.map((r) => r.ma_cay)) && ptDoHoa >= ptApi.length && (ptApi.length === 0 || ptPopup === ptApi[0].ma_cay),
  `${ptDong.length} cây, ${ptDoHoa} đồ họa, mở #${ptPopup}`);

// Thống kê cây xanh: bấm thanh -> tập trung nhóm (cây khác xám, mờ); bấm nhóm khác -> thay; bấm lại -> bỏ (renderer gốc)
const vvTan = () => page.evaluate(() => (window.__webgisView.map.allLayers.find((l) => l.title === 'Tán cây').renderer.visualVariables ?? [])
  .map((v) => v.type + (v.valueExpression ? ':' + v.valueExpression : '')).join(' | '));
if (!(await page.$('#muc-thong-ke-cay button.tk-thanh'))) { await page.click('#muc-thong-ke-cay .muc-tieu-de'); await sleep(500); }
await page.click('button.tk-thanh[data-khoa="loai-2"]'); await sleep(1500);
const vv1 = await vvTan();
await page.click('button.tk-thanh[data-khoa="tt-Suy yếu"]'); await sleep(1500);
const vv2 = await vvTan(); const coDongCu = (await page.$('#tk-tap-trung')) !== null;
await page.click('button.tk-thanh[data-khoa="tt-Suy yếu"]'); await sleep(1500);      // bấm lại: không bỏ chọn
const vv2b = await vvTan(); const tkChon2 = await page.$$eval('button.tk-thanh.chon', (bs) => bs.map((b) => b.dataset.khoa).sort().join(','));
await page.click('#nut-dat-lai'); await sleep(1500);
const vv3 = await vvTan();
check('U16', 'Thống kê cây xanh: bấm "Sao đen" -> chọn; thêm "Suy yếu" -> Sao đen VÀ Suy yếu (song song); bấm lại không bỏ; Đặt lại -> hiển thị gốc; không còn dòng "Bản đồ đang tập trung"',
  vv1.includes('ma_loai == 2') && vv1.includes('opacity') && vv2.includes('"Suy yếu"') && vv2.includes('ma_loai == 2') && !coDongCu
  && vv2b === vv2 && tkChon2 === 'loai-2,tt-Suy yếu'
  && !vv3.includes('opacity') && !vv3.includes('color'), `${vv1.slice(-60)} -> ${vv3}`);

// Chú giải: bấm loài -> ĐỒNG BỘ 4 nơi (bản đồ tập trung, cửa sổ thông tin loài, Chú giải tô đậm, thanh Thống kê);
// Phân tích nguy cơ -> tự bỏ tập trung
const loaiApi = (await (await fetch(`${API}/loai-cay`)).json()).find((l) => l.ma_loai === 3);
await page.click('#chu-giai-loai button.chu-giai[data-loai="3"]'); await sleep(2500);
const ttl = await page.$eval('pierce/#ttl-3', (e) => e.innerText).catch(() => '');
const vvTT = await vvTan();
const cgDam = await page.$eval('#chu-giai-loai .dang-xem', (e) => e.dataset.loai).catch(() => null);
const tkChon = await page.$$eval('button.tk-thanh.chon', (bs) => bs.map((b) => b.dataset.khoa).join(','));
await page.click('#nut-phan-tich'); await page.waitForSelector('#pt-tom-tat', { timeout: 60000 }); await sleep(1500);
const vvPT = await vvTan();
check('U17', 'Chú giải: bấm "Lim xẹt" -> đồng bộ: bản đồ tập trung, cửa sổ thông tin loài (đặc tính, ra hoa, tuổi thọ, số cây), Chú giải tô đậm, thanh Thống kê chọn; Phân tích -> bỏ tập trung',
  ttl.includes(loaiApi.dac_tinh_sinh_hoc) && ttl.includes(loaiApi.thoidiem_rahoa) && ttl.includes(`${loaiApi.tuoi_tho_tb} năm`) && ttl.includes(String(dsCay.filter((c) => c.ma_loai === 3).length))
  && vvTT.includes('ma_loai == 3') && cgDam === '3' && tkChon === 'loai-3' && !vvPT.includes('opacity'), `${cgDam} | ${tkChon} | ${ttl.replace(/\s+/g, ' ').slice(0, 50)}`);

// Chọn khu -> khu nằm giữa và vừa khít phần bản đồ còn trống (trên mép trên khối Chú giải / cửa sổ thông tin), lề ~16 px
await page.select('aside.panel.phai select', '3'); await sleep(3000);
await page.waitForFunction(() => !window.__webgisView.animation, { timeout: 60000 }); await sleep(800);
const khop = await page.evaluate(async () => {
  const v = window.__webgisView; const lop = v.map.allLayers.find((l) => l.title === 'Khu vực');
  const { features } = await lop.queryFeatures({ where: 'ma_khu_vuc = 3', returnGeometry: true });
  const pts = features[0].geometry.rings.flat().map(([x, y]) => v.toScreen({ type: 'point', x, y, z: 0, spatialReference: { wkid: 3405 } })).filter(Boolean);
  const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
  const b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const day = document.querySelector('#chu-giai-loai').getBoundingClientRect().top - v.container.getBoundingClientRect().top;
  return { le: [b[0], b[1], v.width - b[2], day - b[3]].map(Math.round), lechTam: [Math.round((b[0] + b[2]) / 2 - v.width / 2), Math.round((b[1] + b[3]) / 2 - day / 2)] };
});
check('U18', 'Chọn khu 3 -> khu nằm giữa, vừa khít phần bản đồ trống (lề cạnh khít 10-22 px, lệch tâm <= 4 px, không tràn)',
  Math.min(...khop.le) >= 10 && Math.min(khop.le[0], khop.le[1]) <= 22 && Math.abs(khop.lechTam[0]) <= 4 && Math.abs(khop.lechTam[1]) <= 4, JSON.stringify(khop));

// Toàn vùng: chọn nhóm -> khu có nhiều cây của nhóm nhất được tô viền, CỤM CÂY nhóm trong khu đó vừa khít phần bản đồ trống;
// khu đang chọn không đổi; Thống kê + cửa sổ loài hiện "nhiều nhất ...". Đã chọn khu -> không zoom.
const choYen = async () => { await sleep(800); await page.waitForFunction(() => !window.__webgisView.animation, { timeout: 60000 }); await sleep(800); };
const camera = () => page.evaluate(() => { const c = window.__webgisView.camera; return [c.position.x, c.position.y, c.position.z, c.heading, c.tilt].map((v) => Math.round(v * 10) / 10).join(','); });
const khuMax = (loc) => { const d = {}; dsCay.filter(loc).forEach((c) => { d[c.ma_khu_vuc] = (d[c.ma_khu_vuc] ?? 0) + 1; });
  return Object.entries(d).sort((a, b) => b[1] - a[1])[0].map(Number); };
await page.select('aside.panel.phai select', ''); await sleep(3000); await choYen();
const bcText = () => page.$eval('#boi-canh .bc-chu', (e) => e.innerText.replace(/\s+/g, ' ').replace(/\s*\|\s*/g, ' | ').trim());   // khoảng quanh "|" là margin CSS
const bc0 = await bcText();
const [km2, n2] = khuMax((c) => c.ma_loai === 2);
if (!(await page.$('#muc-thong-ke-cay button.tk-thanh'))) { await page.click('#muc-thong-ke-cay .muc-tieu-de'); await sleep(500); }
await page.click('#chu-giai-loai button.chu-giai[data-loai="2"]'); await sleep(4000); await choYen();     // đợi cửa sổ loài dựng xong rồi mới căn
const fullCay = (await (await fetch(`${API}/cay`)).json()).features;
const cum = fullCay.filter((f) => f.properties.ma_loai === 2 && f.properties.ma_khu_vuc === km2);
const khopCum = await page.evaluate((cum) => {
  const v = window.__webgisView;
  const pts = cum.flatMap((f) => { const [x, y] = f.geometry.coordinates, r = f.properties.ban_kinh_tan;
    return [[x - r, y], [x + r, y], [x, y - r], [x, y + r]]; })
    .map(([x, y]) => v.toScreen({ type: 'point', x, y, z: 0, spatialReference: { wkid: 3405 } })).filter(Boolean);
  const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
  const b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const day = document.querySelector('#chu-giai-loai').getBoundingClientRect().top - v.container.getBoundingClientRect().top;
  return { le: [b[0], b[1], v.width - b[2], day - b[3]].map(Math.round), lechTam: [Math.round((b[0] + b[2]) / 2 - v.width / 2), Math.round((b[1] + b[3]) / 2 - day / 2)] };
}, cum);
const tkNhieu = await page.$eval('#tk-khu-nhieu', (e) => e.textContent).catch(() => '');
const ttlNhan = await page.$eval('pierce/#ttl-nhan', (e) => e.textContent).catch(() => '');
const khuSau = await page.$eval('aside.panel.phai select', (s) => s.value);
const bc1 = await bcText();
const tenKm2 = (await (await fetch(`${API}/thong-ke`)).json()).find((r) => r.ma_khu_vuc === km2).ten_khu_vuc;
check('U19', 'Toàn vùng, bấm "Sao đen" -> cụm Sao đen của khu nhiều nhất vừa khít phần bản đồ trống (lề 8-25 px, lệch tâm <= 6 px); khu đang chọn giữ nguyên; cửa sổ loài ghi khu nhiều nhất (Thống kê không còn dòng tập trung)',
  Math.min(...khopCum.le) >= 8 && Math.min(...khopCum.le) <= 25 && Math.abs(khopCum.lechTam[0]) <= 6 && Math.abs(khopCum.lechTam[1]) <= 6 && khuSau === ''
  && !tkNhieu && ttlNhan.includes(tenKm2) && ttlNhan.includes(`${n2} cây`),
  `${tkNhieu.trim()} | ${ttlNhan} | ${JSON.stringify(khopCum)}`);

await page.click('#nut-dat-lai'); await choYen();     // bỏ chọn
await page.select('aside.panel.phai select', '3'); await sleep(3000); await choYen();
const cam0 = await camera();
await page.click('button.tk-thanh[data-khoa="tt-Nguy hiểm"]'); await sleep(1500); await choYen();
const cam1 = await camera();
const coNhieu = (await page.$('#tk-khu-nhieu')) !== null;
const vvNH = await vvTan();
const bc2 = await bcText();
await page.click('#nut-dat-lai'); await sleep(800);
check('U20', 'Đã chọn khu 3, bấm "Nguy hiểm" -> chỉ tập trung trong khu, KHÔNG zoom, không ghi "nhiều nhất"',
  cam0 === cam1 && !coNhieu && vvNH.includes('"Nguy hiểm"') && vvNH.includes('ma_khu_vuc == 3'), `${cam0} -> ${cam1}`);

// Hộp bối cảnh bản đồ (thanh tiêu đề): khu đang xem (số cây) / loài (số cây trong khu) | tình trạng (số cây · % trong khu)
const c3n = dsCay.filter((c) => c.ma_khu_vuc === 3), nNH3 = c3n.filter((c) => c.tinh_trang === 'Nguy hiểm').length;
const kv = [
  `Toàn vùng nghiên cứu (${dsCay.length}) Tất cả loài | Tất cả tình trạng`,
  `Khu Đông Nam (${dsCay.filter((c) => c.ma_khu_vuc === km2).length}) Loài Sao đen (${n2}) | Tất cả tình trạng`,
  `Khu QT Sáng tạo (${c3n.length}) Tất cả loài | Nguy hiểm (${nNH3} · ${((nNH3 / c3n.length) * 100).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %)`];
check('U21', 'Hộp bối cảnh: toàn vùng; Sao đen (toàn vùng -> khu nhiều nhất, số cây trong khu); khu 3 + Nguy hiểm (số cây · %)',
  bc0 === kv[0] && bc1 === kv[1] && bc2 === kv[2], [bc0, bc1, bc2].join(' || '));

// Hai luồng: đang Lọc cây -> chọn loài ở Chú giải xóa lọc + khóa Lọc cây; thêm tình trạng (song song); nhấp vùng trống trên bản đồ
// và đổi khu KHÔNG bỏ chọn; Đặt lại -> bỏ chọn, mở khóa Lọc cây, giữ khu
await page.select('aside.panel.phai select', ''); await sleep(2500); await choYen();
if (!(await page.$('#bo-loc-cay'))) { await page.click('#muc-loc .muc-tieu-de'); await sleep(500); }
await page.click('#bo-loc-cay input[data-loai="2"]'); await sleep(1500);          // Lọc cây: bỏ Sao đen
const bcLoc = await bcText(); const hienLoc1 = Number(await page.$eval('#ket-qua-loc b', (e) => e.textContent));
await page.click('#chu-giai-loai button.chu-giai[data-loai="1"]'); await sleep(2500);
const locSau = await page.evaluate(() => window.__webgisView.map.allLayers.find((l) => l.title === 'Tán cây').definitionExpression ?? '');
const khoa1 = await page.$eval('#bo-loc-cay', (e) => e.disabled); const sdTick = await page.$eval('#bo-loc-cay input[data-loai="2"]', (e) => e.checked);
if (!(await page.$('#muc-thong-ke-cay button.tk-thanh'))) { await page.click('#muc-thong-ke-cay .muc-tieu-de'); await sleep(500); }
await page.click('button.tk-thanh[data-khoa="tt-Bình thường"]'); await sleep(1500); await choYen();
const vvHai = await vvTan(); const bcHai = await bcText();
const v0 = await page.evaluate(() => { const r = window.__webgisView.container.getBoundingClientRect(); return { x: r.left + 30, y: r.top + 60 }; });
await page.mouse.click(v0.x, v0.y); await sleep(2500);                             // nhấp vùng trống (góc trên trái bản đồ)
const vvNhap = await vvTan(); const cgNhap = await page.$eval('#chu-giai-loai .dang-xem', (e) => e.dataset.loai).catch(() => null);
await page.select('aside.panel.phai select', '2'); await sleep(3000); await choYen();
const vvKhu = await vvTan(); const ttlKhu = await page.$eval('pierce/#ttl-1', () => true).catch(() => false);
await page.click('#nut-dat-lai'); await sleep(1500);
const vvDL = await vvTan(); const khoa2 = await page.$eval('#bo-loc-cay', (e) => e.disabled); const khuDL = await page.$eval('aside.panel.phai select', (s) => s.value);
const bcDL = await bcText();
const [, nBangBT] = khuMax((c) => c.ma_loai === 1 && c.tinh_trang === 'Bình thường');   // toàn vùng -> số cây ở khu nhiều nhất
check('U22', 'Hai luồng: đang lọc -> chọn Bàng xóa lọc, khóa Lọc cây; thêm Bình thường (song song); nhấp bản đồ và đổi khu không bỏ chọn; Đặt lại -> bỏ chọn, mở khóa, giữ khu',
  bcLoc.includes(`Đang lọc: ${hienLoc1} / ${dsCay.length} cây`) && hienLoc1 < dsCay.length && locSau === '' && khoa1 && sdTick
  && vvHai.includes('ma_loai == 1') && vvHai.includes('"Bình thường"') && bcHai.includes('Loài Bàng') && bcHai.includes(`Bình thường (${nBangBT} · `)
  && vvNhap === vvHai && cgNhap === '1' && vvKhu.includes('ma_loai == 1') && vvKhu.includes('"Bình thường"') && vvKhu.includes('ma_khu_vuc == 2') && ttlKhu
  && !vvDL.includes('opacity') && !khoa2 && khuDL === '2' && bcDL.includes('Tất cả loài'),
  `${bcLoc} || ${bcHai} || khóa ${khoa1}->${khoa2} || nhấp: ${vvNhap === vvHai} || khu ${khuDL}, cửa sổ loài ${ttlKhu} || ${bcDL}`);

// Lớp "Vùng ngã đổ" (Lớp dữ liệu) và mục Phân tích nguy cơ dùng CHUNG một kho nạp sẵn: bật lớp -> có vòng (1H + 1,5H) và danh
// sách; đổi khu -> vẽ lại từ kho, KHÔNG gọi API phân tích; tắt lớp (hoặc Ẩn) -> xóa cả hai; không còn thanh trượt hệ số
let goiPt = 0;
page.on('request', (rq) => { if (rq.url().includes('/phan-tich/cay-nguy-co')) goiPt++; });
await page.select('aside.panel.phai select', ''); await sleep(2500); await choYen();
const oLop = async () => (await page.$$('.lop input'))[6];
if ((await page.$eval('#muc-phan-tich', (e) => !!e.querySelector('#pt-tom-tat')).catch(() => false))) { await page.click('#nut-xoa-phan-tich'); await sleep(800); }
await (await oLop()).click(); await page.waitForSelector('#pt-tom-tat', { timeout: 60000 }); await sleep(2500);
const doHoa = () => page.evaluate(() => window.__webgisView.map.allLayers.find((l) => l.title === 'Phân tích nguy cơ').graphics.length);
const ptToan = await (await fetch(`${API}/phan-tich/cay-nguy-co`)).json(); goiPt = 0;
const dh1 = await doHoa(); const ds1 = await page.$$eval('#pt-ds .pt-dong', (els) => els.length);
const coTruot = (await page.$('#muc-phan-tich input[type=range]')) !== null; const heSo = await page.$eval('#pt-he-so', (e) => e.textContent).catch(() => '');
await page.select('aside.panel.phai select', '5'); await sleep(3000); await choYen();
const ds5 = await page.$$eval('#pt-ds .pt-dong', (els) => els.map((e) => Number(e.dataset.maCay)));
const goiSauDoiKhu = goiPt;
await (await oLop()).click(); await sleep(1500);
const dhTat = await doHoa(); const coDs = (await page.$('#pt-ds')) !== null;
await page.select('aside.panel.phai select', ''); await sleep(2000);
check('U23', 'Lớp "Vùng ngã đổ": bật ở Lớp dữ liệu -> 2 vòng/cây + danh sách toàn vùng; đổi khu 5 -> danh sách từ kho, không gọi API; tắt -> xóa; 1,5 × H cố định',
  ds1 === ptToan.length && dh1 >= 2 * ptToan.length && JSON.stringify(ds5) === JSON.stringify(ptToan.filter((r) => r.ma_khu_vuc === 5).map((r) => r.ma_cay))
  && goiSauDoiKhu === 0 && dhTat === 0 && !coDs && !coTruot && heSo.includes('1,5 × H'),
  `${ds1} cây, ${dh1} đồ họa; khu 5: ${ds5.length} cây, ${goiSauDoiKhu} lần gọi API; tắt: ${dhTat} đồ họa; ${heSo}`);

check('U10', 'Không có lỗi JavaScript trên trang', loiTrang.length === 0, loiTrang.slice(0, 3).join(' | '));
await browser.close();

for (const [ma, ten, r, tt] of kq) console.log(`${ma.padEnd(4)} ${ten.padEnd(84)} ${r.padEnd(9)} ${tt}`);
const dat = kq.filter((k) => k[2] === 'Đạt').length;
console.log(`\nTỔNG: ${dat}/${kq.length} Đạt; ảnh ở ${out}`);
process.exit(dat === kq.length ? 0 : 1);
