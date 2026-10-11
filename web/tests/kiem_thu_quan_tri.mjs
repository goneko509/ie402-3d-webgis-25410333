// Kiểm thử giao diện UC06 (đăng nhập) và UC05 (thêm / sửa / xóa) bằng Chrome headless, chụp ảnh vào tests/anh/.
// Cần: API (npm start, cổng 3001) và web (npm run dev, cổng 5173). Mọi thay đổi được hoàn tác; dữ liệu cuối vẫn 333 cây.
// Chạy: node tests/kiem_thu_quan_tri.mjs [http://localhost:5173]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'anh');
fs.mkdirSync(out, { recursive: true });
const URL = process.argv[2] || 'http://localhost:5173';
const API = URL + '/api';
const puppeteer = createRequire(import.meta.url)(process.env.PUPPETEER || 'C:/Users/oneit8x/AppData/Roaming/npm/node_modules/puppeteer');
const kq = [];
const check = (ma, ten, ok, tt = '') => kq.push([ma, ten, ok ? 'Đạt' : 'KHÔNG ĐẠT', tt]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 960 });
const loiTrang = [];
page.on('pageerror', (e) => loiTrang.push(e.message));

const choYen = async () => { await sleep(1500); await page.waitForFunction(() => !window.__webgisView.updating, { timeout: 120000 }); await sleep(1000); };
const chup = (ten) => page.screenshot({ path: path.join(out, ten) });
const text = (sel) => page.$eval(sel, (e) => e.textContent).catch(() => '');

// Gán giá trị cho ô nhập React (date, number, select) qua setter gốc rồi phát sự kiện
async function datGiaTri(sel, value) {
  await page.$eval(sel, (el, v) => {
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  }, String(value));
}

// Đưa camera tới điểm (EPSG:3405) rồi nhấp chuột thật vào đúng vị trí đó trên màn hình
async function nhapBanDo(x, y) {
  // Gán camera trực tiếp: goTo với điểm dạng object thuần resolve nhưng không dời camera (SDK 5.1)
  await page.evaluate((x, y) => {
    const v = window.__webgisView;
    const c = v.camera.clone();
    c.position = { type: 'point', x, y: y - 360, z: 360, spatialReference: { wkid: 3405 } };
    c.tilt = 45; c.heading = 0;
    v.camera = c;
  }, x, y);
  await choYen();
  const p = await page.evaluate((x, y) => {
    const v = window.__webgisView;
    const s = v.toScreen({ type: 'point', x, y, z: 0, spatialReference: { wkid: 3405 } });
    const r = v.container.getBoundingClientRect();
    return { x: r.left + s.x, y: r.top + s.y };
  }, x, y);
  // Nhấp và chờ biểu mẫu phản hồi (ô vị trí có tọa độ); SwiftShader chậm nên thử lại một lần nếu chưa thấy
  let duoc = false;
  for (let lan = 0; lan < 2 && !duoc; lan++) {
    await page.mouse.click(p.x, p.y);
    try {
      await page.waitForFunction(() => document.querySelector('#bieu-mau-cay input[readonly]')?.value.startsWith('X ='), { timeout: 15000 });
      duoc = true;
    } catch { /* thử lại */ }
  }
  if (!duoc) {
    await chup('loi_nhap_ban_do.png');
    throw new Error(`Nhấp bản đồ không chọn được (điểm ${x.toFixed(1)}, ${y.toFixed(1)} -> màn hình ${JSON.stringify(p)}); ảnh: loi_nhap_ban_do.png`);
  }
  await sleep(1000);
}

async function dienBieuMau() {
  await datGiaTri('select[name=ma_loai]', 1);
  await datGiaTri('input[name=chieu_cao]', 8.5);
  await datGiaTri('input[name=ban_kinh_tan]', 3.2);
  await datGiaTri('input[name=dbh]', 18);
  await datGiaTri('input[name=ngay_trong]', '2021-03-15');
}

// Nhấp thử một điểm khi đang thêm cây: trả về con trỏ tại điểm đó và biểu mẫu có nhận vị trí không (không ném lỗi)
async function nhapThu(x, y) {
  await page.evaluate((x, y) => {
    const v = window.__webgisView; const c = v.camera.clone();
    c.position = { type: 'point', x, y: y - 360, z: 360, spatialReference: { wkid: 3405 } }; c.tilt = 45; c.heading = 0; v.camera = c;
  }, x, y);
  await choYen();
  const p = await page.evaluate((x, y) => {
    const v = window.__webgisView; const s = v.toScreen({ type: 'point', x, y, z: 0, spatialReference: { wkid: 3405 } });
    const r = v.container.getBoundingClientRect(); return { x: r.left + s.x, y: r.top + s.y };
  }, x, y);
  await page.mouse.move(p.x, p.y); await sleep(500);
  const conTro = await page.$eval('.khung-3d', (e) => e.style.cursor);
  await page.mouse.click(p.x, p.y); await sleep(3000);
  return { conTro, nhan: (await page.$('#bieu-mau-cay input[readonly]')) !== null };
}

// Tìm cây theo mã (ô tìm kiếm) -> cửa sổ thông tin của cây đó mở
const cayDangMo = () => page.evaluate(() => { const p = window.__webgisView.popup; return p?.visible ? p.selectedFeature?.attributes?.ma_cay : null; });
async function moCay(ma) {
  await page.$eval('.tim input', (e) => e.select()); await page.keyboard.press('Backspace');
  await page.type('.tim input', String(ma)); await page.click('.tim button');
  await page.waitForFunction((m) => { const p = window.__webgisView.popup; return p?.visible && p.selectedFeature?.attributes?.ma_cay === m; }, { timeout: 60000 }, ma);
  await page.waitForSelector(`pierce/#ttc-${ma}`, { timeout: 30000 }); await choYen();
}

const ketThucGui = () => page.waitForFunction(() => document.querySelector('#thong-bao-ghi') && !document.querySelector('#nut-luu[disabled]'), { timeout: 60000 });

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 300000 });
await page.waitForFunction(() => window.__WEBGIS_READY === true, { timeout: 300000 });
await choYen();
const cay14 = await (await fetch(`${API}/cay/14`)).json();
const [x14, y14] = cay14.geometry.coordinates;
const tatCaCay = (await (await fetch(`${API}/cay`)).json()).features;

// Điểm thêm cây thử: gần các cây của khu nhưng cách MỌI cây >= 15 m (không nhấp trúng tán cây thật)
// Nền tòa nhà (để điểm thử không rơi vào nhà: CSDL và giao diện chặn đặt cây trong nhà - mục 219)
const nenNha = (await (await fetch(`${API}/lop-nen/toa-nha`)).json()).features.map((f) => f.geometry);
const trongVong = (x, y, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y) && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) c = !c; return c; };
const trongHinh = (x, y, g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).some((pg) => trongVong(x, y, pg[0]) && !pg.slice(1).some((h) => trongVong(x, y, h)));
const trongNha = (x, y) => nenNha.some((g) => trongHinh(x, y, g));
function diemTrong(khu) {
  const pts = tatCaCay.map((f) => f.geometry.coordinates);
  for (const f of tatCaCay.filter((c) => c.properties.ma_khu_vuc === khu)) {
    const [cx, cy] = f.geometry.coordinates;
    for (const [dx, dy] of [[25, 0], [0, 25], [-25, 0], [0, -25], [25, 25], [-25, -25], [25, -25], [-25, 25]]) {
      const [x, y] = [cx + dx, cy + dy];
      if (pts.every(([px, py]) => Math.hypot(px - x, py - y) >= 15) && !trongNha(x, y)) return [x, y];
    }
  }
  throw new Error(`Không tìm được điểm trống trong khu ${khu}`);
}

// Dừng kiểm thử TRƯỚC khi ghi nếu biểu mẫu không chọn đúng cây mong đợi (tránh xóa / sửa nhầm cây thật)
function batBuoc(dieuKien, moTa) {
  if (!dieuKien) throw new Error('DỪNG KIỂM THỬ, không thực hiện thao tác ghi: ' + moTa);
}

// Dọn dẹp bằng API nếu kiểm thử dừng giữa chừng: xóa cây thử còn sót (chỉ cây có mã > cây lớn nhất lúc bắt đầu)
const maLonNhat = Math.max(...tatCaCay.map((f) => f.properties.ma_cay));
async function donDep() {
  const tok = (await (await fetch(`${API}/dang-nhap`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ten_dang_nhap: 'ttb', mat_khau: 'Demo@2026' }) })).json()).token;
  for (const f of (await (await fetch(`${API}/cay`)).json()).features.filter((c) => c.properties.ma_cay > maLonNhat))
    await fetch(`${API}/cay/${f.properties.ma_cay}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok}` } });
}
const dungKhan = async (e) => { console.error(e?.message ?? e); await donDep(); await browser.close(); process.exit(1); };
process.on('uncaughtException', dungKhan);
process.on('unhandledRejection', dungKhan);

// ---------- UC06 ----------
await page.click('#nut-dang-nhap');
await page.waitForSelector('#hop-dang-nhap');
await page.type('input[name=ten_dang_nhap]', 'ttb'); await page.type('input[name=mat_khau]', 'sai-mat-khau');
await page.click('#hop-dang-nhap button[type=submit]');
await page.waitForSelector('#hop-dang-nhap .canh-bao', { timeout: 30000 });
const loiDn = await text('#hop-dang-nhap .canh-bao');
check('Q1', 'Đăng nhập sai mật khẩu -> báo lỗi trong hộp đăng nhập', loiDn.includes('Sai tên đăng nhập'), loiDn);
await chup('6_dang_nhap_sai.png');
await datGiaTri('input[name=mat_khau]', 'Demo@2026');
await page.click('#hop-dang-nhap button[type=submit]');
await page.waitForSelector('#thanh-quan-tri', { timeout: 30000 });
const theTk = await text('#the-tai-khoan');
check('Q2', 'Đăng nhập ttb -> thanh quản trị; thẻ tài khoản: Người quản lý khu, khu Trung tâm MC-IN (2) và Đông Nam (5)',
  theTk.includes('ttb') && theTk.includes('Người quản lý khu') && theTk.includes('Trung tâm MC – IN (2)') && theTk.includes('Đông Nam (5)'), theTk.replace(/\n/g, ' ').slice(0, 120));

// ---------- Nút Thêm cây mờ cho tới khi chọn khu mình phụ trách; khu phụ trách có ngôi sao ở bảng Thống kê ----------
const soNutBat = () => page.$$eval('#thanh-quan-tri button', (bs) => bs.filter((b) => !b.disabled).length);
const chonKhuTk = async (ma) => { await page.select('aside.panel.phai select', ma === null ? '' : String(ma)); await sleep(800); };
const batToanVung = await soNutBat();
const khuSao = await page.$$eval('.thanh .sao-phu-trach', (es) => es.map((e) => Number(e.closest('.thanh').dataset.khu)));
check('Q3', 'Bảng Thống kê: ngôi sao vàng ở đúng khu ttb phụ trách (2, 5)', JSON.stringify(khuSao) === '[2,5]', `khu có sao ${khuSao}`);
await chup('6b_nut_mo_toan_vung.png');
await chonKhuTk(1);
const batKhu1 = await soNutBat();
check('Q4', 'Toàn vùng và khu 1 (không phụ trách) -> nút Thêm cây mờ',
  batToanVung === 0 && batKhu1 === 0, `bật ${batToanVung}, ${batKhu1}`);
await chonKhuTk(2);
const batKhu2 = await soNutBat();
check('Q5', 'Chọn khu 2 (phụ trách) -> nút Thêm cây sáng', batKhu2 === 1, `bật ${batKhu2}`);
await chup('6c_nut_sang_khu_2.png');

// ---------- UC05 - thêm: căn khu làm việc NHƯ CHỌN KHU (mục 213), ngoài khu bị làm mờ, nhấp ngoài khu không có tác dụng ----------
// Đo đa giác (lớp 'Khu vực' theo mã khu, hoặc 'Ranh giới') trên màn hình so với phần bản đồ trống (trên mép trên Chú giải)
const doKhop = (lop, where) => page.evaluate(async (lop, where) => {
  const v = window.__webgisView; const l = v.map.allLayers.find((x) => x.title === lop);
  const { features } = await l.queryFeatures({ where, returnGeometry: true });
  const pts = features.flatMap((f) => f.geometry.rings.flat()).map(([x, y]) => v.toScreen({ type: 'point', x, y, z: 0, spatialReference: { wkid: 3405 } })).filter(Boolean);
  const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
  const b = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const day = document.querySelector('#chu-giai-loai').getBoundingClientRect().top - v.container.getBoundingClientRect().top;
  return { le: [b[0], b[1], v.width - b[2], day - b[3]].map(Math.round), lechTam: [Math.round((b[0] + b[2]) / 2 - v.width / 2), Math.round((b[1] + b[3]) / 2 - day / 2)] };
}, lop, where);
const vuaKhit = (k) => Math.min(...k.le) >= 10 && Math.min(k.le[0], k.le[1]) <= 22 && Math.abs(k.lechTam[0]) <= 4 && Math.abs(k.lechTam[1]) <= 4;
const choBay = async () => { await sleep(800); await page.waitForFunction(() => !window.__webgisView.animation, { timeout: 60000 }); await sleep(600); };
const camera = () => page.evaluate(() => { const c = window.__webgisView.camera; return [c.position.x, c.position.y, c.position.z, c.tilt]; });
await choBay();
const cam0 = await camera();
await page.click('[data-che-do=them]'); await choYen(); await choBay();
const cam1 = await camera(); const khopThem = await doKhop('Khu vực', 'ma_khu_vuc = 2');
const lechCam = Math.max(...cam0.map((v, i) => Math.abs(v - cam1[i])));
check('Q17', 'Đang xem khu 2, bấm Thêm cây -> khu 2 vừa khít phần bản đồ trống như chọn khu; camera không nhảy (lệch <= 1 m / 1°)',
  vuaKhit(khopThem) && lechCam <= 1, `${JSON.stringify(khopThem)}, camera lệch ${lechCam.toFixed(2)}`);
// Đang PHÓNG TO vào trong khu 2 (tỷ lệ 1:1500 quanh tâm khu) -> bấm Thêm cây: GIỮ camera (thêm tại chỗ đang xem)
await page.click('[data-che-do=them]'); await sleep(800);                       // thoát
await page.evaluate(async () => { const v = window.__webgisView; const l = v.map.allLayers.find((x) => x.title === 'Khu vực');
  const { features } = await l.queryFeatures({ where: 'ma_khu_vuc = 2', returnGeometry: true });
  await v.goTo({ target: features[0].geometry.centroid, scale: 1500, tilt: 55 }, { animate: false }); });
await choBay();
const camPT0 = await camera();
await page.click('[data-che-do=them]'); await choYen(); await choBay();
const camPT1 = await camera(); const lechPT = Math.max(...camPT0.map((v, i) => Math.abs(v - camPT1[i])));
check('Q19', 'Đang phóng to trong khu 2, bấm Thêm cây -> giữ nguyên camera (thêm cây tại chỗ đang xem)', lechPT <= 1, `camera lệch ${lechPT.toFixed(2)}`);
// Đang NHÌN XA (nút Home: toàn vùng, khu 2 nhỏ hơn khung) -> bấm Thêm cây: căn khu 2 vừa khít như chọn khu
await page.click('[data-che-do=them]'); await sleep(800);
await page.evaluate(() => window.__webgisView.ui.find('home').go()); await choBay();
await page.click('[data-che-do=them]'); await choYen(); await choBay();
const khopXa = await doKhop('Khu vực', 'ma_khu_vuc = 2');
check('Q20', 'Đang nhìn xa (Home), bấm Thêm cây -> khu 2 vừa khít phần bản đồ trống', vuaKhit(khopXa), JSON.stringify(khopXa));
const soMatNa = await page.evaluate(() => window.__webgisMatNa.graphics.length);
const ngoai = await nhapThu(...diemTrong(1));
check('Q6', 'Bấm Thêm (khu 2) -> mặt nạ làm mờ ngoài khu; nhấp vào khu 1 -> không nhận vị trí',
  soMatNa === 2 && !ngoai.nhan && ngoai.conTro === 'not-allowed', `mặt nạ ${soMatNa}, con trỏ ${ngoai.conTro}`);
await chup('7a_them_mat_na.png');
// Nhấp vào giữa một tòa nhà trong khu 2 (điểm bên trong nền nhà, cách mép >= 4 m) -> không nhận vị trí, con trỏ cấm, cảnh báo
const khu2Hinh = (await (await fetch(`${API}/khu-vuc`)).json()).features.find((f) => f.properties.ma_khu_vuc === 2).geometry;
let diemNha = null;
for (const g of nenNha) {
  const r = (g.type === 'Polygon' ? g.coordinates : g.coordinates[0])[0];
  const xs = r.map((p) => p[0]), ys = r.map((p) => p[1]);
  const [x, y] = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  const sau = [[4, 0], [-4, 0], [0, 4], [0, -4]].every(([dx, dy]) => trongHinh(x + dx, y + dy, g));
  if (sau && trongHinh(x, y, khu2Hinh)) { diemNha = [x, y]; break; }
}
batBuoc(diemNha, 'không tìm được tòa nhà trong khu 2 để thử');
const vaoNha = await nhapThu(...diemNha);
const tbNha = await text('#thong-bao-ghi');
check('Q23', 'Thêm cây: nhấp vào tòa nhà trong khu 2 -> không nhận vị trí, con trỏ cấm, báo "nằm trong tòa nhà"',
  !vaoNha.nhan && vaoNha.conTro === 'not-allowed' && tbNha.includes('nằm trong tòa nhà'), `${vaoNha.conTro} | ${tbNha}`);
const [xThem, yThem] = diemTrong(2);
await nhapBanDo(xThem, yThem);
const viTri = await page.$eval('#bieu-mau-cay input[readonly]', (e) => e.value).catch(() => '');
const khuThem = await page.$eval('input[name=khu_vuc]', (e) => e.value).catch(() => '');
check('Q7', 'Nhấp trong khu 2 -> biểu mẫu nhận tọa độ, khu Trung tâm MC-IN; không còn cảnh báo ngoài khu',
  viTri.startsWith('X =') && khuThem.includes('Marie Curie') && (await page.$('#canh-bao-khu')) === null, `${viTri}; ${khuThem}`);
await dienBieuMau();
await chup('7_bieu_mau_them.png');
await page.click('#nut-luu'); await ketThucGui();
const tbThem = await text('#thong-bao-ghi');
const maMoi = Number(/#(\d+)/.exec(tbThem)?.[1]);
check('Q8', 'Lưu cây mới ở khu 2 -> thành công, khu tự gán Trung tâm MC-IN', tbThem.includes('Đã thêm cây') && tbThem.includes('Marie Curie') && maMoi > 0, tbThem);
const soCay = (await (await fetch(`${API}/health`)).json()).csdl.so_cay;
check('Q9', 'CSDL tăng lên 334 cây', soCay === 334, String(soCay));
await choYen(); await chup('8_them_thanh_cong.png');
await page.click('#bieu-mau-cay .nut.vien'); await sleep(800);

// ---------- UC05 - xóa trong cửa sổ thông tin: tìm cây vừa thêm -> Xóa -> Xác nhận ----------
await moCay(maMoi);
batBuoc(await cayDangMo() === maMoi, `cửa sổ thông tin đang mở cây #${await cayDangMo()} thay vì #${maMoi}`);
await page.click('pierce/#ttc-nut-xoa'); await sleep(500);
const xacNhan = await page.$eval('pierce/.ttc-xac-nhan', (e) => e.textContent).catch(() => '');
check('Q10', `Cửa sổ thông tin cây #${maMoi} -> Xóa -> hỏi xác nhận ngay trong cửa sổ`, xacNhan.includes(`cây #${maMoi}`), xacNhan);
await chup('9_xoa_trong_cua_so.png');
await page.click('pierce/#ttc-nut-xac-nhan-xoa');
await page.waitForSelector('#thong-bao-noi', { timeout: 60000 });
const tbXoa = await text('#thong-bao-noi');
check('Q11', 'Xác nhận xóa -> thông báo "Đã xóa", CSDL trở về 333 cây',
  tbXoa.includes(`Đã xóa cây #${maMoi}`) && (await (await fetch(`${API}/health`)).json()).csdl.so_cay === 333, tbXoa);

// ---------- UC05 - NHÂN BẢN (mục 216): cây nguồn ở khu 2 -> biểu mẫu điền sẵn (trừ tình trạng); đặt sát cây -> bị chặn;
// đặt chỗ trống + tích "Đã kiểm tra" -> lưu cây mới; giữ chế độ để đặt tiếp. Cây thử bị XÓA ngay để CSDL về 333 cây ----------
const dsCayNB = (await (await fetch(`${API}/cay`)).json()).features.map((f) => ({ ...f.properties, x: f.geometry.coordinates[0], y: f.geometry.coordinates[1] }));
const khu2 = (await (await fetch(`${API}/khu-vuc`)).json()).features.find((f) => f.properties.ma_khu_vuc === 2).geometry;
const trongDaGiac = (x, y, g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).some((pg) => {
  let c = false; const r = pg[0];
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y) && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) c = !c;
  return c;
});
const ganNhat = (x, y) => Math.min(...dsCayNB.map((c) => Math.hypot(c.x - x, c.y - y)));
// Cây nguồn: cây khu 2 có chỗ trống (cách mọi cây >= 3 m, trong khu 2) ở bán kính 5-9 m
let nguon = null, choTrong = null;
for (const c of dsCayNB.filter((t) => t.ma_khu_vuc === 2)) {
  for (const r of [5, 7, 9]) for (let g = 0; g < 16 && !choTrong; g++) {
    const x = c.x + r * Math.cos((g * Math.PI) / 8), y = c.y + r * Math.sin((g * Math.PI) / 8);
    if (ganNhat(x, y) >= 3 && trongDaGiac(x, y, khu2)) choTrong = { x, y };
  }
  if (choTrong) { nguon = c; break; }
}
batBuoc(nguon, 'không tìm được cây khu 2 có chỗ trống để thử nhân bản');
await moCay(nguon.ma_cay);
await page.click('pierce/#ttc-nut-nhan-ban'); await page.waitForSelector('#bieu-mau-cay', { timeout: 30000 }); await sleep(1500);
const tieuDeNB = await text('#bieu-mau-cay h3');
const vongNB = await page.evaluate(() => window.__webgisView.map.allLayers.find((l) => l.title === 'Cây đang sửa / nhân bản').graphics.length);
await nhapBanDo(nguon.x + 0.3, nguon.y);                                  // sát cây nguồn (0,3 m)
const chanGan = (await page.$('#nb-qua-gan')) !== null && (await page.$eval('#nut-luu', (b) => b.disabled));
await nhapBanDo(choTrong.x, choTrong.y);
const hetGan = (await page.$('#nb-qua-gan')) === null;
const khoaChuaKT = await page.$eval('#nut-luu', (b) => b.disabled);
const dienSan = await page.evaluate(() => ({ loai: document.querySelector('select[name=ma_loai]').value, h: document.querySelector('input[name=chieu_cao]').value,
  tt: document.querySelector('select[name=tinh_trang]').value, giong: document.querySelectorAll('.giong-nguon').length }));
await chup('7b_nhan_ban.png');
await page.click('#nb-da-kiem-tra'); await sleep(300);
const moSauKT = await page.$eval('#nut-luu', (b) => !b.disabled);
await page.click('#nut-luu'); await ketThucGui();
const tbNB = await text('#thong-bao-ghi');
const maNB = Number(/→ cây #(\d+)/.exec(tbNB)?.[1]);
const cayNB = maNB ? (await (await fetch(`${API}/cay/${maNB}`)).json()).properties : null;
const conCheDo = (await text('#bieu-mau-cay h3')).includes(`Nhân bản từ cây #${nguon.ma_cay}`) && (await page.$('#bieu-mau-cay .huong-dan-chon')) !== null;
if (maNB) {                                                                // dọn: xóa cây thử bằng API (tài khoản ttb)
  const tokNB = (await (await fetch(`${API}/dang-nhap`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ten_dang_nhap: 'ttb', mat_khau: 'Demo@2026' }) })).json()).token;
  await fetch(`${API}/cay/${maNB}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokNB}` } });
}
await page.click('#bieu-mau-cay .nut.vien'); await sleep(800);
check('Q21', `Nhân bản cây #${nguon.ma_cay}: điền sẵn loài/H (tình trạng Bình thường, nhãn "giống cây"); đặt sát 0,3 m -> chặn; chưa tích kiểm tra -> khóa Lưu`,
  tieuDeNB.includes(`Nhân bản từ cây #${nguon.ma_cay}`) && vongNB === 1 && chanGan && hetGan && khoaChuaKT && moSauKT
  && dienSan.loai === String(nguon.ma_loai) && Number(dienSan.h) === nguon.chieu_cao && dienSan.tt === 'Bình thường' && dienSan.giong === 5,
  `${tieuDeNB} | chặn gần ${chanGan} | ${JSON.stringify(dienSan)}`);
check('Q22', 'Lưu bản sao -> cây mới cùng loài / H / R / DBH / ngày trồng, tình trạng Bình thường, khu 2; giữ chế độ nhân bản; xóa cây thử -> 333 cây',
  !!cayNB && cayNB.ma_loai === nguon.ma_loai && cayNB.chieu_cao === nguon.chieu_cao && cayNB.ban_kinh_tan === nguon.ban_kinh_tan && cayNB.dbh === nguon.dbh
  && cayNB.ngay_trong === nguon.ngay_trong && cayNB.tinh_trang === 'Bình thường' && cayNB.ma_khu_vuc === 2 && conCheDo
  && (await (await fetch(`${API}/health`)).json()).csdl.so_cay === 333, tbNB);

// ---------- UC05 - SỬA ở sidebar phải (mục 224): cây 14 ----------
// Mở biểu mẫu sửa từ cửa sổ cây 14 (đóng cửa sổ, biểu mẫu "Sửa cây #14" ở sidebar)
const moSua14 = async () => {
  batBuoc(await cayDangMo() === 14, `cửa sổ thông tin đang mở cây #${await cayDangMo()} thay vì #14`);
  await page.click('pierce/#ttc-nut-sua');
  await page.waitForFunction(() => document.querySelector('#bieu-mau-cay h3')?.textContent.includes('Sửa cây #14'), { timeout: 30000 });
  await sleep(800);
};
const oViTri = () => page.$eval('#bieu-mau-cay input[readonly]', (e) => e.value).catch(() => '');
const suaH = async (h) => {
  await moSua14();
  await datGiaTri('input[name=chieu_cao]', h);
  const khoaCu = await page.$eval('#thong-bao-noi', (e) => e.dataset.khoa).catch(() => null);
  await page.click('#nut-luu');
  await page.waitForFunction((k) => { const e = document.querySelector('#thong-bao-noi'); return e && e.dataset.khoa !== k; }, { timeout: 60000 }, khoaCu);
  await page.waitForFunction(() => window.__webgisView.popup?.visible && window.__webgisView.popup.selectedFeature?.attributes?.ma_cay === 14, { timeout: 60000 });
  await sleep(1500);
  return (await (await fetch(`${API}/cay/14`)).json()).properties.chieu_cao;
};
await moCay(14);
const coNut = await page.$eval('pierce/#ttc-nut-sua', (b) => !b.disabled).catch(() => false);
const cay14Goc = (await (await fetch(`${API}/cay/14`)).json());
const [xGoc14, yGoc14] = cay14Goc.geometry.coordinates;
const khu14 = (await (await fetch(`${API}/khu-vuc`)).json()).features.find((f) => f.properties.ma_khu_vuc === cay14Goc.properties.ma_khu_vuc).geometry;
// Ba chỗ trống quanh cây 14 (trong khu của cây, ngoài nhà, cách mọi cây >= 3 m)
const choTrong14 = [];
for (const r of [6, 9, 12, 15]) for (let g = 0; g < 16 && choTrong14.length < 3; g++) {
  const x = xGoc14 + r * Math.cos((g * Math.PI) / 8), y = yGoc14 + r * Math.sin((g * Math.PI) / 8);
  if (trongHinh(x, y, khu14) && !trongNha(x, y) && Math.min(...dsCayNB.map((c) => Math.hypot(c.x - x, c.y - y))) >= 3) choTrong14.push([x, y]);
}
batBuoc(choTrong14.length === 3, 'không đủ 3 chỗ trống quanh cây 14');
await moSua14();
const daDongCuaSo = (await cayDangMo()) === null;
const coMatNa = (await page.evaluate(() => window.__webgisMatNa.graphics.length)) > 0;
const viTri0 = await oViTri();
const vongSua = () => page.evaluate(() => window.__webgisView.map.allLayers.find((l) => l.title === 'Cây đang sửa / nhân bản').graphics.length);
const ghim = () => page.evaluate(() => window.__webgisView.graphics.length);
const vong0 = await vongSua();
const nutBieuMau = await page.$$eval('#bieu-mau-cay button', (bs) => bs.map((b) => b.textContent.trim()).filter((t) => ['Hủy', 'Đóng'].includes(t)));
const cacViTri = [];
for (const [x, y] of choTrong14) { await nhapBanDo(x, y); cacViTri.push(`${await oViTri()} | ${await page.$eval('#hang-ve-vi-tri', (e) => e.textContent).catch(() => '')}`); }
const ghimTruoc = await ghim();
await page.click('#nut-ve-vi-tri-cu'); await sleep(500);
const viTriVe = await oViTri(); const ghimSau = await ghim();
await chup('10_sua_cay_14.png');
await page.click('#nut-huy-bieu-mau'); await sleep(2500);
const sauHuy = { bieuMau: (await page.$('#bieu-mau-cay')) !== null, cuaSo: await cayDangMo(), matNa: await page.evaluate(() => window.__webgisMatNa.graphics.length), vong: await vongSua() };
const viTriCSDL = (await (await fetch(`${API}/cay/14`)).json()).geometry.coordinates;
check('Q24', 'Sửa cây 14 ở sidebar: vòng đánh dấu cây, chỉ 1 nút Hủy; nhấp 3 chỗ -> vị trí theo lần cuối, "Cách vị trí cũ" cùng dòng nút; "Về vị trí cũ" gỡ ghim; Hủy -> mở lại cửa sổ, bỏ vòng, CSDL không đổi',
  daDongCuaSo && coMatNa && vong0 === 1 && JSON.stringify(nutBieuMau) === '["Hủy"]' && viTri0.startsWith('Giữ nguyên') && new Set(cacViTri).size === 3
  && cacViTri.every((v) => v.startsWith('X =') && v.includes('Cách vị trí cũ') && v.includes('Về vị trí cũ')) && ghimTruoc === 1 && ghimSau === 0
  && viTriVe.startsWith('Giữ nguyên') && !sauHuy.bieuMau && sauHuy.cuaSo === 14 && sauHuy.matNa === 0 && sauHuy.vong === 0
  && Math.abs(viTriCSDL[0] - xGoc14) < 0.001 && Math.abs(viTriCSDL[1] - yGoc14) < 0.001,
  `${viTri0.slice(0, 20)} | ${cacViTri.map((v) => v.slice(0, 30)).join(' / ')} | ${JSON.stringify(sauHuy)}`);
// Dời vị trí thật rồi trả lại: Lưu vị trí mới -> CSDL đổi tọa độ, cửa sổ mở lại; trả tọa độ gốc chính xác bằng API (ttb)
await moSua14();
await nhapBanDo(...choTrong14[0]);
const khoaTruocDoi = await page.$eval('#thong-bao-noi', (e) => e.dataset.khoa).catch(() => null);
await page.click('#nut-luu');
await page.waitForFunction((k) => { const e = document.querySelector('#thong-bao-noi'); return e && e.dataset.khoa !== k; }, { timeout: 60000 }, khoaTruocDoi);
await sleep(1500);
const viTriMoiCSDL = (await (await fetch(`${API}/cay/14`)).json()).geometry.coordinates;
const daDoi = Math.hypot(viTriMoiCSDL[0] - choTrong14[0][0], viTriMoiCSDL[1] - choTrong14[0][1]) < 1.5 && Math.hypot(viTriMoiCSDL[0] - xGoc14, viTriMoiCSDL[1] - yGoc14) > 4;
const tok14 = (await (await fetch(`${API}/dang-nhap`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ten_dang_nhap: 'ttb', mat_khau: 'Demo@2026' }) })).json()).token;
const p14 = cay14Goc.properties;
await fetch(`${API}/cay/14`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok14}` },
  body: JSON.stringify({ ma_loai: p14.ma_loai, chieu_cao: p14.chieu_cao, ban_kinh_tan: p14.ban_kinh_tan, dbh: p14.dbh, ngay_trong: p14.ngay_trong, tinh_trang: p14.tinh_trang, x: xGoc14, y: yGoc14 }) });
const traLai = (await (await fetch(`${API}/cay/14`)).json()).geometry.coordinates;
check('Q25', 'Sửa cây 14: dời tới chỗ trống + Lưu -> CSDL đổi tọa độ (cửa sổ mở lại); trả lại tọa độ gốc chính xác',
  daDoi && (await cayDangMo()) === 14 && Math.abs(traLai[0] - xGoc14) < 0.001 && Math.abs(traLai[1] - yGoc14) < 0.001,
  `mới ${viTriMoiCSDL.map((v) => v.toFixed(1))} | trả lại ${traLai.map((v) => v.toFixed(3))}`);
// Thuộc tính: 13,7 -> 13,8 -> 13,7 (hoàn tác)
await moCay(14);
const h1 = await suaH(13.8);
const h2 = await suaH(13.7);
check('Q12', 'Cửa sổ cây 14 có nút Sửa; sửa chiều cao ở sidebar 13,7 -> 13,8 -> 13,7 (hoàn tác); Lưu -> mở lại cửa sổ cây', coNut && h1 === 13.8 && h2 === 13.7, `${h1} -> ${h2}`);

// ---------- Cây ngoài khu phụ trách: Sửa / Xóa bị khóa ----------
const cayKhu1 = tatCaCay.find((f) => f.properties.ma_khu_vuc === 1).properties.ma_cay;
await moCay(cayKhu1);
const khoaSua = await page.$eval('pierce/#ttc-nut-sua', (b) => b.disabled).catch(() => false);
const khoaXoa = await page.$eval('pierce/#ttc-nut-xoa', (b) => b.disabled).catch(() => false);
const ghiNgoai = await page.$eval('pierce/#ttc-ngoai-khu', (e) => e.textContent).catch(() => '');
check('Q13', `Cây #${cayKhu1} ở khu 1 (không phụ trách) -> Sửa, Xóa bị khóa, ghi khu và người phụ trách (Lê Minh Châu)`,
  khoaSua && khoaXoa && ghiNgoai.includes('Khu phía Tây') && ghiNgoai.includes('Người phụ trách: Lê Minh Châu'), ghiNgoai);
await chup('11_cay_ngoai_khu.png');

// ---------- Đăng xuất ----------
await page.click('#nut-dang-xuat'); await sleep(1000);
check('Q14', 'Đăng xuất -> ẩn thanh quản trị, hiện lại nút đăng nhập', (await page.$('#thanh-quan-tri')) === null && (await page.$('#nut-dang-nhap')) !== null);
// ---------- Admin: nút Khôi phục DL mặc định sát phải Thêm cây, hộp xem trước (KHÔNG thực hiện) ----------
await page.click('#nut-dang-nhap'); await page.waitForSelector('#hop-dang-nhap');
await page.type('input[name=ten_dang_nhap]', 'admin'); await page.type('input[name=mat_khau]', 'Demo@2026');
await page.click('#hop-dang-nhap button[type=submit]'); await page.waitForSelector('#nut-khoi-phuc', { timeout: 30000 });
const viTriNut = await page.evaluate(() => { const a = document.querySelector('[data-che-do=them]').getBoundingClientRect(); const b = document.querySelector('#nut-khoi-phuc').getBoundingClientRect(); return b.left > a.right && b.left - a.right < 20 && Math.abs(a.top - b.top) < 2; });
await page.click('#nut-khoi-phuc'); await page.waitForSelector('#hop-khoi-phuc #kp-khong-co, #hop-khoi-phuc #kp-tom-tat', { timeout: 30000 });
const hopKp = await text('#hop-khoi-phuc');
await chup('12_khoi_phuc_xem_truoc.png');
await page.click('#hop-khoi-phuc .nut.vien'); await sleep(500);
await page.select('aside.panel.phai select', ''); await sleep(2500); await choBay();
await page.click('[data-che-do=them]'); await choYen(); await choBay();
const khopToan = await doKhop('Ranh giới', '1=1');
await page.click('[data-che-do=them]'); await sleep(800);            // thoát chế độ thêm
check('Q18', 'Admin, toàn vùng, bấm Thêm cây -> ranh giới vùng nghiên cứu vừa khít phần bản đồ trống (như Toàn vùng)', vuaKhit(khopToan), JSON.stringify(khopToan));
check('Q16', 'Admin: nút "Khôi phục DL mặc định" sát phải Thêm cây; mở hộp xem trước (không thực hiện)', viTriNut && hopKp.includes('Khôi phục dữ liệu mặc định') && (await page.$('#hop-khoi-phuc')) === null, hopKp.replace(/\n/g, ' ').slice(0, 90));
await page.click('#nut-dang-xuat'); await sleep(800);
check('Q15', 'Dữ liệu cuối vẫn 333 cây; không lỗi JavaScript', (await (await fetch(`${API}/health`)).json()).csdl.so_cay === 333 && loiTrang.length === 0, loiTrang.slice(0, 2).join(' | '));
await browser.close();

for (const [ma, ten, r, tt] of kq) console.log(`${ma.padEnd(4)} ${ten.padEnd(96)} ${r.padEnd(9)} ${tt}`);
const dat = kq.filter((k) => k[2] === 'Đạt').length;
console.log(`\nTỔNG: ${dat}/${kq.length} Đạt; ảnh ở ${out}`);
process.exit(dat === kq.length ? 0 : 1);
