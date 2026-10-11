// Ghép scene.json, stats.json vào template, chụp các màn hình mockup ra PNG (2x).
const fs = require('fs');
const path = require('path');
const puppeteer = require(process.env.PUPPETEER || 'puppeteer');

const dir = __dirname;
const outDir = process.argv[2];
const html = fs.readFileSync(path.join(dir, 'template.html'), 'utf8')
  .replace('__SCENE__', fs.readFileSync(path.join(dir, 'scene.json'), 'utf8'))
  .replace('__STATS__', fs.readFileSync(path.join(dir, 'stats.json'), 'utf8'));
const page = path.join(dir, 'mockup.html');
fs.writeFileSync(page, html);

(async () => {
  const browser = await puppeteer.launch({headless: 'new'});
  const tab = await browser.newPage();
  await tab.setViewport({width: 1600, height: 960, deviceScaleFactor: 2});
  tab.on('pageerror', e => console.log('PAGE ERROR', e.message));
  for (const [screen, file] of [['user', 'mockup_nguoidung.png'], ['login', 'mockup_dangnhap.png'], ['admin', 'mockup_quantri.png']]) {
    await tab.goto('file:///' + page.replace(/\\/g, '/') + '?screen=' + screen);
    await tab.waitForFunction('window.READY === true', {timeout: 10000});
    let clip = {x: 0, y: 0, width: 1600, height: 960};
    if (screen === 'login') {
      const r = await tab.evaluate(() => { const b = document.getElementById('c-loginbox').getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; });
      clip = {x: r[0] - 40, y: r[1] - 40, width: r[2] + 80, height: r[3] + 80};
    }
    await tab.screenshot({path: path.join(outDir, file), clip});
    console.log('saved', file);
  }
  await browser.close();
})();
