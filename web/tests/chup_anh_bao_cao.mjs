// Chụp 4 ảnh KẾT QUẢ trên bản triển khai cho Chương 4 (tests/anh/bc_a..d.png), mục 242.
// CHỈ ĐỌC: ảnh (d) nhấp vào nền tòa nhà khi thêm cây -> giao diện chặn ngay, không gửi gì xuống CSDL.
// Chạy: node tests/chup_anh_bao_cao.mjs [https://ie402-webgis-25410333.azurewebsites.net]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'anh');
fs.mkdirSync(out, { recursive: true });
const URL = process.argv[2] || 'https://ie402-webgis-25410333.azurewebsites.net';
const API = URL + '/api';
const puppeteer = createRequire(import.meta.url)(process.env.PUPPETEER || 'puppeteer');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 600000, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 960, deviceScaleFactor: 1.5 });
const choYen = async () => { await sleep(1500); await page.waitForFunction(() => !window.__webgisView.updating, { timeout: 300000 }); await sleep(2000); };
const chup = async (ten) => { await page.screenshot({ path: path.join(out, ten) }); console.log('chụp', ten); };
const moTrang = async () => {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 300000 });
  await page.waitForFunction(() => window.__WEBGIS_READY === true, { timeout: 300000 });
  await choYen();
};
// Đặt camera nhìn xiên tới điểm (x, y) từ phía nam, cách d mét
const camera = (x, y, d, tilt) => page.evaluate((x, y, d, tilt) => {
  const v = window.__webgisView; const c = v.camera.clone(); const t = (tilt * Math.PI) / 180;
  c.position = { type: 'point', x, y: y - d * Math.sin(t), z: d * Math.cos(t), spatialReference: { wkid: 3405 } };
  c.tilt = tilt; c.heading = 0; v.camera = c;
}, x, y, d, tilt);
const batLop = (ten) => page.evaluate((ten) => { [...document.querySelectorAll('.lop')].find((e) => e.textContent.includes(ten)).click(); }, ten);
async function chonKhu(ma) {
  await page.$eval('#muc-thong-ke select', (el, v) => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, v);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, String(ma));
  await choYen();
}
const tam = (ma) => fetch(`${API}/cay?khu=${ma}`).then((r) => r.json()).then((j) => {
  const c = j.features.map((f) => f.geometry.coordinates);
  return [c.reduce((s, p) => s + p[0], 0) / c.length, c.reduce((s, p) => s + p[1], 0) / c.length];
});

// (a) Tổng quan: cảnh 3D toàn vùng + thống kê che phủ
await moTrang();
await chup('bc_a_tong_quan.png');

// (b) Lớp ảnh vệ tinh (Esri) + ranh giới khu, nhìn Khu Quảng trường Sáng tạo
await batLop('Ảnh vệ tinh');
const [x3, y3] = await tam(3);
await camera(x3, y3, 700, 50); await choYen(); await sleep(3000);
await chup('bc_b_anh_ve_tinh.png');
await batLop('Ảnh vệ tinh');

// (c) Lớp vùng che phủ (hình chiếu tán, bật sẵn), nhìn cận khu 3; không chọn khu để lớp tô sáng khu không che các đĩa
await camera(x3, y3, 260, 55); await choYen();
await chup('bc_c_vung_che_phu.png');

// (d) Người quản lý khu ttb thêm cây ở khu 2 (khu phụ trách), nhấp vào nền một tòa nhà -> bị chặn ngay trên giao diện
await page.click('#nut-dang-nhap'); await page.waitForSelector('#hop-dang-nhap');
await page.type('input[name=ten_dang_nhap]', 'ttb'); await page.type('input[name=mat_khau]', 'Demo@2026');
await page.click('#hop-dang-nhap button[type=submit]'); await page.waitForSelector('#thanh-quan-tri', { timeout: 60000 });
await chonKhu(2);
await page.click('[data-che-do=them]'); await choYen();
const nenNha = (await (await fetch(`${API}/lop-nen/toa-nha`)).json()).features.map((f) => f.geometry);
const khu2 = (await (await fetch(`${API}/khu-vuc`)).json()).features.find((f) => f.properties.ma_khu_vuc === 2).geometry;
const trongVong = (x, y, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y) && x < ((r[j][0] - r[i][0]) * (y - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) c = !c; return c; };
const trongHinh = (x, y, g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates).some((pg) => trongVong(x, y, pg[0]) && !pg.slice(1).some((h) => trongVong(x, y, h)));
const [x2, y2] = await tam(2);
let diem = null, kcMin = Infinity;
for (const g of nenNha) {                                        // tòa nhà trong khu 2, gần tâm cụm cây nhất, tâm nằm trong nền nhà
  const v = (g.type === 'Polygon' ? g.coordinates : g.coordinates[0])[0];
  const x = v.reduce((s, p) => s + p[0], 0) / v.length, y = v.reduce((s, p) => s + p[1], 0) / v.length;
  const kc = Math.hypot(x - x2, y - y2);
  if (kc < kcMin && trongHinh(x, y, g) && trongHinh(x, y, khu2)) { kcMin = kc; diem = [x, y]; }
}
await camera(diem[0], diem[1] - 40, 330, 40); await choYen();
const p = await page.evaluate((x, y) => {
  const v = window.__webgisView; const s = v.toScreen({ type: 'point', x, y, z: 0, spatialReference: { wkid: 3405 } });
  const r = v.container.getBoundingClientRect(); return { x: r.left + s.x, y: r.top + s.y };
}, ...diem);
await page.mouse.click(p.x, p.y);
await page.waitForFunction(() => document.body.innerText.includes('nằm trong tòa nhà'), { timeout: 60000 });
await sleep(1500); await chup('bc_d_chan_trong_nha.png');
await page.click('[data-che-do=them]'); await sleep(800);
await page.click('#nut-dang-xuat').catch(() => {});
const so = (await (await fetch(`${API}/health`)).json()).csdl?.so_cay;
await browser.close();
console.log(`Đã chụp 4 ảnh vào ${out}; CSDL ${so} cây`);
