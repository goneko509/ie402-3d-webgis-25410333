// Chạy spike (đặc tả mục 7): lấy dữ liệu từ API -> data.js, điền phiên bản SDK, mở trang bằng Chrome headless (puppeteer),
// chờ SceneView dựng xong, chụp ảnh spike.png và in kết quả.
// Cách chạy: API đang chạy ở http://localhost:3001 (npm start), rồi: node chay_spike.mjs <phiên bản SDK, ví dụ 4.33>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const dir = path.dirname(fileURLToPath(import.meta.url));
const version = process.argv[2];
if (!version) throw new Error('Cần tham số phiên bản SDK, ví dụ: node chay_spike.mjs 4.33');
const API = process.env.API || 'http://localhost:3001/api';
const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER || 'C:/Users/oneit8x/AppData/Roaming/npm/node_modules/puppeteer');

const cay14 = await (await fetch(`${API}/cay/14`)).json();
const [cx, cy] = cay14.geometry.coordinates;
const bbox = [cx - 300, cy - 300, cx + 300, cy + 300].join(',');
const cay = (await (await fetch(`${API}/cay`)).json()).features
  .filter((f) => Math.abs(f.geometry.coordinates[0] - cx) < 300 && Math.abs(f.geometry.coordinates[1] - cy) < 300);
const toaNha = (await (await fetch(`${API}/lop-nen/toa-nha?bbox=${bbox}`)).json()).features;
fs.writeFileSync(path.join(dir, 'data.js'), `window.DATA = ${JSON.stringify({ tam: [cx, cy], cay, toaNha })};\n`);
const html = fs.readFileSync(path.join(dir, 'spike.html'), 'utf8').replaceAll('__V__', version);
fs.writeFileSync(path.join(dir, 'spike.run.html'), html);
console.log(`dữ liệu: ${cay.length} cây, ${toaNha.length} tòa nhà quanh cây 14`);

const browser = await puppeteer.launch({ headless: 'new', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 850 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(pathToFileURL(path.join(dir, 'spike.run.html')).href);
try {
  await page.waitForFunction('window.SPIKE', { timeout: 120000 });
} catch { /* in kết quả bên dưới */ }
await new Promise((r) => setTimeout(r, 3000));
await page.screenshot({ path: path.join(dir, 'spike.png') });
console.log('kết quả:', await page.evaluate(() => window.SPIKE || 'chưa xong (quá thời gian)'));
if (errors.length) console.log('lỗi trang:', errors.slice(0, 5).join(' | '));
await browser.close();
