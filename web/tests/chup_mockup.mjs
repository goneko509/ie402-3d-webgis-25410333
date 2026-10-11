// Chụp ảnh "thiết kế giao diện" cho Chương 3 (mục 241): ảnh từ bản WebGIS đang chạy, gắn số tròn đỏ + khung cho từng thành phần.
// CHỈ ĐỌC: không bấm Lưu / Khôi phục / Hoàn tác; biểu mẫu sửa cây được Hủy trước khi thoát; CSDL không đổi.
// Cần: API (cổng 3001) và web (npm run dev, cổng 5173).
// Chạy: node tests/chup_mockup.mjs [http://localhost:5173] [thư mục ảnh]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const dir = path.dirname(fileURLToPath(import.meta.url));
const URL = process.argv[2] || 'http://localhost:5173';
const out = process.argv[3] || path.join(dir, '../../../Latex_Final/imgs/mockup');
fs.mkdirSync(out, { recursive: true });
const API = URL + '/api';
const MK = 'Demo@2026';
const puppeteer = createRequire(import.meta.url)(process.env.PUPPETEER || 'C:/Users/oneit8x/AppData/Roaming/npm/node_modules/puppeteer');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 600000, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
const choYen = async () => { await sleep(1500); await page.waitForFunction(() => !window.__webgisView.updating, { timeout: 300000 }); await sleep(1500); };
const moTrang = async () => {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 300000 });
  await page.waitForFunction(() => window.__WEBGIS_READY === true, { timeout: 300000 });
  await choYen();
};

// ---- Đánh dấu: khung đỏ + số tròn đỏ; vị trí số: 'tl' | 'tr' | 'bl' | 'br' (góc khung) ----
// muc: { so, sel | pierce | rect: {x,y,w,h}, goc, dem (lề) }
async function hop(m) {
  if (m.rect) return m.rect;
  const h = m.pierce ? await page.$(`pierce/${m.pierce}`) : await page.$(m.sel);
  if (!h) throw new Error('Không thấy phần tử ' + (m.pierce || m.sel));
  const b = await h.boundingBox();
  return { x: b.x, y: b.y, w: b.width, h: b.height };
}
const hopGop = (a, b) => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; };
async function danhDau(ds) {
  const ve = [];
  for (const m of ds) { const r = await hop(m); ve.push({ so: m.so, goc: m.goc || 'tl', dem: m.dem ?? 3, r, khung: m.khung !== false, dx: m.dx || 0, dy: m.dy || 0 }); }
  await page.evaluate((ve) => {
    const g = document.createElement('div'); g.id = 'lop-danh-dau';
    g.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
    const W = innerWidth, H = innerHeight, R = 15;
    for (const { so, goc, dem, r, khung, dx, dy } of ve) {
      const x = Math.max(2, r.x - dem), y = Math.max(2, r.y - dem);
      const w = Math.min(W - 2, r.x + r.w + dem) - x, h = Math.min(H - 2, r.y + r.h + dem) - y;
      if (khung) {
        const k = document.createElement('div');
        k.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border:3px solid #d32f2f;border-radius:7px;box-sizing:border-box`;
        g.appendChild(k);
      }
      let cx = (goc.includes('l') ? x + 4 : x + w - 4) + dx, cy = (goc.includes('t') ? y + 4 : y + h - 4) + dy;
      cx = Math.min(W - R - 2, Math.max(R + 2, cx)); cy = Math.min(H - R - 2, Math.max(R + 2, cy));
      const c = document.createElement('div');
      c.textContent = so;
      c.style.cssText = `position:fixed;left:${cx - R}px;top:${cy - R}px;width:${2 * R}px;height:${2 * R}px;border-radius:50%;background:#d32f2f;color:#fff;`
        + 'font:700 17px/30px "Segoe UI",Arial,sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);box-sizing:content-box';
      g.appendChild(c);
    }
    document.body.appendChild(g);
  }, ve);
}
const xoaDau = () => page.evaluate(() => document.getElementById('lop-danh-dau')?.remove());
async function chup(ten, clip) {
  await page.screenshot({ path: path.join(out, ten), ...(clip ? { clip } : {}) });
  console.log('chụp', ten);
}
const quanh = (r, d) => ({ x: Math.max(0, r.x - d), y: Math.max(0, r.y - d), width: r.w + 2 * d, height: r.h + 2 * d });

// Điểm bản đồ (EPSG:3405) -> tọa độ màn hình
const raManHinh = (x, y, z = 0) => page.evaluate((x, y, z) => {
  const v = window.__webgisView; const s = v.toScreen({ type: 'point', x, y, z, spatialReference: { wkid: 3405 } });
  const r = v.container.getBoundingClientRect(); return { x: r.left + s.x, y: r.top + s.y };
}, x, y, z);
const camera = (x, y, d, tilt, heading = 0) => page.evaluate((x, y, d, tilt, heading) => {
  const v = window.__webgisView; const c = v.camera.clone(); const t = (tilt * Math.PI) / 180;
  c.position = { type: 'point', x, y: y - d * Math.sin(t), z: d * Math.cos(t), spatialReference: { wkid: 3405 } };
  c.tilt = tilt; c.heading = heading; v.camera = c;
}, x, y, d, tilt, heading);
async function moCay(ma) {
  await page.$eval('.tim input', (e) => e.select()); await page.keyboard.press('Backspace');
  await page.type('.tim input', String(ma)); await page.click('.tim button');
  await page.waitForFunction((m) => { const p = window.__webgisView.popup; return p?.visible && p.selectedFeature?.attributes?.ma_cay === m; }, { timeout: 120000 }, ma);
  await page.waitForSelector(`pierce/#ttc-${ma}`, { timeout: 60000 }); await choYen();
}
async function chonKhu(ma) {
  await page.$eval('#muc-thong-ke select', (el, v) => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, v);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, String(ma));
  await choYen();
}
async function dangNhap(ten, mk = MK) {
  await page.click('#nut-dang-nhap'); await page.waitForSelector('#hop-dang-nhap');
  await page.type('input[name=ten_dang_nhap]', ten); await page.type('input[name=mat_khau]', mk);
  await page.click('#hop-dang-nhap button[type=submit]');
}
const hopPopup = async () => {
  const r = await page.evaluate(() => {
    const c = window.__webgisView.popup?.container; const e = c && (c.querySelector?.('.esri-popup__main-container') || c);
    const b = e?.getBoundingClientRect(); return b && b.width > 0 ? { x: b.x, y: b.y, w: b.width, h: b.height } : null;
  });
  return r || hop({ pierce: '.esri-popup__main-container' });
};

// Dữ liệu dùng để đặt số trên cảnh 3D
const cay14 = (await (await fetch(`${API}/cay/14`)).json());
const [x14, y14] = cay14.geometry.coordinates;
const KHU = cay14.properties.ma_khu_vuc;                              // khu của cây 14 (khu ttb phụ trách)

// ================= M1. Màn hình chính (Người dùng) =================
await moTrang();
await chonKhu(KHU);
await moCay(14);
const ban = await hop({ rect: await page.evaluate(() => { const b = window.__webgisView.container.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }) });
const p1 = await hopPopup();
await danhDau([
  { so: 1, rect: { x: ban.x + 30, y: ban.y + ban.h * 0.42, w: 1, h: 1 }, khung: false },
  { so: 2, sel: '.tim', goc: 'tl' },
  { so: 3, sel: '#boi-canh', goc: 'tl', dx: -12 },
  { so: 4, sel: '#nut-dang-nhap', goc: 'tl' },
  { so: 5, sel: '#muc-lop', goc: 'tr' },
  { so: 6, sel: '#chu-giai-loai', goc: 'tl' },
  { so: 7, sel: '#muc-loc', goc: 'tr' },
  { so: 8, sel: '#muc-thong-ke', goc: 'tr' },
  { so: 9, sel: '#muc-thong-ke-cay', goc: 'tr' },
  { so: 10, sel: '#muc-phan-tich', goc: 'tr' },
  { so: 11, sel: '.esri-ui-top-right', goc: 'tl', dx: -16 },
  { so: 12, rect: p1, goc: 'tl' },
]);
await chup('m1_man_hinh_chinh.png');
await xoaDau();

// ================= M2a. Xem theo loài (cửa sổ thông tin loài) =================
await moTrang();
await page.click('#chu-giai-loai button.chu-giai[data-loai="4"]'); await sleep(4000); await choYen();
await danhDau([
  { so: 13, pierce: '#ttl-4', goc: 'tl' },
  { so: 3, sel: '#boi-canh', goc: 'tl', dx: -12 },
]);
await chup('m2a_theo_loai.png');
await xoaDau();

// ================= M2b. Phân tích nguy cơ (vùng ngã đổ) =================
await moTrang();
const kq = (await (await fetch(`${API}/phan-tich/cay-nguy-co`)).json());
const ds = kq.features || kq;
const demKhu = {};
for (const r of ds) { const k = r.ma_khu_vuc ?? r.properties?.ma_khu_vuc; demKhu[k] = (demKhu[k] || 0) + 1; }
const khuNC = +Object.entries(demKhu).sort((a, b) => b[1] - a[1])[0][0];
await chonKhu(khuNC);
for (const id of ['#muc-loc', '#muc-thong-ke-cay']) {                 // thu gọn bớt để thấy danh sách phân tích
  await page.evaluate((id) => document.querySelector(`${id} button, ${id} .tieu-de-muc, ${id} h2`)?.click(), id); await sleep(400);
}
await page.click('#nut-phan-tich'); await sleep(3000); await choYen();
const r0 = ds.find((r) => (r.ma_khu_vuc ?? r.properties?.ma_khu_vuc) === khuNC);
const [xr, yr] = r0.geometry?.coordinates ?? [r0.x, r0.y];
await camera(xr, yr, 320, 50); await choYen();
const sr = await raManHinh(xr, yr);
await danhDau([
  { so: 10, sel: '#muc-phan-tich', goc: 'tl', dx: -12 },
  { so: 14, rect: { x: sr.x - 120, y: sr.y - 110, w: 240, h: 200 }, goc: 'tl' },
]);
await chup('m2b_phan_tich.png');
await xoaDau();

// ================= M3. Hộp đăng nhập (sai thông tin) =================
await moTrang();
await dangNhap('ttb', 'sai-mat-khau');
await page.waitForSelector('#hop-dang-nhap .canh-bao', { timeout: 60000 }); await sleep(500);
const hdn = await hop({ sel: '#hop-dang-nhap' });
await danhDau([{ so: 15, rect: hdn, goc: 'tl', dem: 4 }]);
await chup('m3_dang_nhap.png', quanh(hdn, 28));
await xoaDau();

// ================= M4. Người quản lý khu: nút trên cửa sổ cây, biểu mẫu sửa ở sidebar =================
await page.$eval('input[name=mat_khau]', (el) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ''); el.dispatchEvent(new Event('input', { bubbles: true })); });
await page.type('input[name=mat_khau]', MK);
await page.click('#hop-dang-nhap button[type=submit]');
await page.waitForSelector('#thanh-quan-tri', { timeout: 60000 }); await choYen();
await chonKhu(KHU);
await moCay(14);
// M4a: cửa sổ cây có Nhân bản / Sửa / Xóa
const p4 = await hopPopup();
const nut = hopGop(hopGop(await hop({ pierce: '#ttc-nut-nhan-ban' }), await hop({ pierce: '#ttc-nut-sua' })), await hop({ pierce: '#ttc-nut-xoa' }));
await danhDau([{ so: 17, rect: nut, goc: 'tl', dem: 4, dx: -14 }]);
await chup('m4a_cua_so_quan_ly.png', quanh(p4, 30));
await xoaDau();
// M4b: Sửa -> biểu mẫu ở sidebar; dời thử vị trí (KHÔNG lưu)
if ((await page.evaluate(() => window.__webgisView.popup?.selectedFeature?.attributes?.ma_cay)) !== 14) throw new Error('Dừng: cửa sổ không phải cây 14');
await page.click('pierce/#ttc-nut-sua');
await page.waitForFunction(() => document.querySelector('#bieu-mau-cay h3')?.textContent.includes('Sửa cây #14'), { timeout: 60000 });
await sleep(800);
// Chỗ trống cạnh cây 14 (trong khu, ngoài nhà, cách mọi cây >= 3 m)
const nenNha = (await (await fetch(`${API}/lop-nen/toa-nha`)).json()).features.map((f) => f.geometry);
const khu14 = (await (await fetch(`${API}/khu-vuc`)).json()).features.find((f) => f.properties.ma_khu_vuc === KHU).geometry;
const trongVong = (x, y, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y) && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) c = !c; return c; };
const trongHinh = (x, y, g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).some((pg) => trongVong(x, y, pg[0]) && !pg.slice(1).some((h) => trongVong(x, y, h)));
const dsCay = (await (await fetch(`${API}/cay`)).json()).features.map((f) => f.geometry.coordinates);
let moi = null;
for (const r of [9, 12, 15]) for (let g = 0; g < 16 && !moi; g++) {
  const x = x14 + r * Math.cos((g * Math.PI) / 8), y = y14 + r * Math.sin((g * Math.PI) / 8);
  if (trongHinh(x, y, khu14) && !nenNha.some((n) => trongHinh(x, y, n)) && Math.min(...dsCay.map(([a, b]) => Math.hypot(a - x, b - y))) >= 3) moi = [x, y];
}
await camera((x14 + moi[0]) / 2, (y14 + moi[1]) / 2, 220, 50); await choYen();
const pm = await raManHinh(...moi);
await page.mouse.click(pm.x, pm.y);
await page.waitForFunction(() => document.querySelector('#hang-ve-vi-tri'), { timeout: 60000 }); await sleep(1500); await choYen();
const s14 = await raManHinh(x14, y14), sm = await raManHinh(...moi);
const vung = { x: Math.min(s14.x, sm.x) - 70, y: Math.min(s14.y, sm.y) - 110, w: Math.abs(s14.x - sm.x) + 140, h: Math.abs(s14.y - sm.y) + 150 };
await danhDau([
  { so: 16, rect: hopGop(await hop({ sel: '#the-tai-khoan' }), await hop({ sel: '#thanh-quan-tri' })), goc: 'tl', dx: -14 },
  { so: 18, sel: '#bieu-mau-cay', goc: 'tr' },
  { so: 19, rect: vung, goc: 'tl' },
]);
await chup('m4b_sua_cay.png');
await xoaDau();
await page.click('#nut-huy-bieu-mau'); await sleep(2000);           // Hủy: không ghi
await page.click('#nut-dang-xuat'); await sleep(1000);

// ================= M5. Quản trị hệ thống: Khôi phục (xem trước) + Nhật ký =================
await dangNhap('admin');
await page.waitForSelector('#nut-khoi-phuc', { timeout: 60000 }); await sleep(800);
await page.click('#nut-khoi-phuc');
await page.waitForSelector('#hop-khoi-phuc #kp-khong-co, #hop-khoi-phuc #kp-tom-tat', { timeout: 60000 }); await sleep(800);
const hkp = await hop({ sel: '#hop-khoi-phuc' });
await danhDau([{ so: 20, rect: hkp, goc: 'tl', dem: 4 }]);
await chup('m5a_khoi_phuc.png', quanh(hkp, 28));
await xoaDau();
await page.$$eval('#hop-khoi-phuc [role=tab]', (bs) => bs.find((b) => b.textContent.includes('Nhật ký'))?.click());
await page.waitForSelector('#nk-ds', { timeout: 60000 }); await sleep(1000);
const hnk = await hop({ sel: '#hop-khoi-phuc' });
await danhDau([{ so: 20, sel: '#nk-ds', goc: 'tl', dem: 3 }]);
await chup('m5b_nhat_ky.png', quanh(hnk, 28));
await xoaDau();
await page.$$eval('#hop-khoi-phuc button', (bs) => bs.find((b) => ['Hủy', 'Đóng'].includes(b.textContent.trim()))?.click());
await page.click('#nut-dang-xuat').catch(() => {});
console.log('Số cây sau khi chụp:', (await (await fetch(`${API}/cay`)).json()).features.length);
await browser.close();
