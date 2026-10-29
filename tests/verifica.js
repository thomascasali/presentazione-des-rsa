// Verifica delle pagine pubbliche con Playwright.
// Uso (dalla radice del repo):
//   npm install && npx playwright install chromium
//   node tests/verifica.js                    tutte le pagine .html pubbliche
//   node tests/verifica.js modulo-1 lab-php   solo i percorsi che contengono uno di questi testi
//
// Controlli:
//   ERRORI   errori/avvisi in console e eccezioni di pagina; slide con scroll verticale a 1366x768 e 1920x1080;
//            overflow orizzontale a 390x844 (tutte le pagine; per le slide, su ogni slide)
//   AVVISI   link locali che non esistono ancora (non fanno fallire la verifica)
// Si salta: node_modules, docente/, tests/, .git. React, Babel e Google Fonts arrivano dalla rete.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const RADICE = path.resolve(__dirname, '..');
const SALTA = new Set(['node_modules', 'docente', 'tests', '.git']);
const filtri = process.argv.slice(2);

function trovaHtml(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SALTA.has(e.name)) trovaHtml(path.join(dir, e.name), out); }
    else if (e.name.endsWith('.html')) out.push(path.join(dir, e.name));
  }
  return out;
}
const rel = (f) => path.relative(RADICE, f).replace(/\\/g, '/');
const url = (f) => 'file:///' + f.replace(/\\/g, '/').replace(/^\//, '');
const rumore = (t) => /net::|ERR_FAILED|ERR_ABORTED|Failed to load resource|in-browser Babel|Download the React DevTools|favicon/i.test(t);

async function contatore(page) {
  return page.evaluate(() => {
    const m = (document.querySelector('.topbar .count') || {}).textContent;
    const r = m && m.match(/(\d+)\s*\/\s*(\d+)/);
    return r ? +r[2] : 0;
  });
}
async function passa(page, totale, fn) {
  for (let i = 0; i < totale; i++) {
    await fn(i);
    const b = await page.$('button[aria-label="Slide successiva"]');
    if (!b || (await b.getAttribute('disabled')) !== null) break;
    await b.click({ force: true });
    await page.waitForTimeout(160);
  }
}
const leggiSlide = () => ({
  titolo: (document.querySelector('.slide-title, .cover h1') || {}).textContent || '',
  vStage: (() => { const s = document.querySelector('.stage'); return s ? s.scrollHeight - s.clientHeight : 0; })(),
  vDoc: document.documentElement.scrollHeight - innerHeight,
  h: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  font: parseFloat(getComputedStyle(document.documentElement).fontSize),
  link: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
});

(async () => {
  let files = trovaHtml(RADICE, []).sort();
  if (filtri.length) files = files.filter(f => filtri.some(x => rel(f).includes(x)));
  if (!files.length) { console.log('Nessuna pagina trovata.'); return; }
  const browser = await chromium.launch();
  let nErrori = 0, nAvvisi = 0;
  const segnala = (liv, f, msg) => { console.log(`  ${liv === 'ERR' ? 'ERRORE' : 'avviso'}: ${msg}`); if (liv === 'ERR') nErrori++; else nAvvisi++; };

  for (const f of files) {
    const nome = rel(f), eSlide = path.basename(f) === 'slide.html';
    console.log(`\n== ${nome}${eSlide ? ' (slide)' : ''}`);
    const link = new Set();
    const nuova = async (opt) => {
      const page = await browser.newPage(opt);
      page.errs = [];
      page.on('console', m => { if (['error', 'warning'].includes(m.type()) && !rumore(m.text())) page.errs.push(m.text()); });
      page.on('pageerror', e => page.errs.push('Eccezione: ' + e.message));
      await page.goto(url(f)); await page.waitForTimeout(1600);
      return page;
    };

    // desktop: slide senza scroll a due risoluzioni
    if (eSlide) {
      for (const [W, H] of [[1366, 768], [1920, 1080]]) {
        const page = await nuova({ viewport: { width: W, height: H } });
        const tot = await contatore(page), cattive = [];
        let minFont = 99;
        await passa(page, tot, async (i) => {
          const s = await page.evaluate(leggiSlide);
          s.link.forEach(l => link.add(l)); minFont = Math.min(minFont, s.font);
          if (s.vStage > 2 || s.vDoc > 2 || s.h > 2) cattive.push(`#${i + 1} "${s.titolo.slice(0, 40)}" (stage +${s.vStage}px, pagina +${s.vDoc}px, orizz. +${s.h}px)`);
        });
        console.log(`  ${W}x${H}: ${tot} slide, font radice minimo ${minFont.toFixed(1)}px`);
        if (!tot) segnala('ERR', f, `${W}x${H}: nessuna slide trovata (contatore assente)`);
        cattive.forEach(c => segnala('ERR', f, `${W}x${H}: scroll nella slide ${c}`));
        [...new Set(page.errs)].forEach(e => segnala('ERR', f, `console ${W}x${H}: ${e.slice(0, 220)}`));
        await page.close();
      }
    }

    // smartphone: nessun overflow orizzontale
    {
      const page = await nuova({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      const cattive = [];
      const misura = () => page.evaluate(() => ({
        h: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        larghi: [...document.querySelectorAll('body *')].filter(e => {
          if (e.closest('.scrollx, .code-body, [data-noswipe-ok]')) return false;
          const r = e.getBoundingClientRect(), p = getComputedStyle(e).position;
          return r.right > innerWidth + 2 && r.width > 0 && p !== 'fixed';
        }).slice(0, 3).map(e => e.tagName.toLowerCase() + '.' + String(e.className).slice(0, 30)),
        link: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
        titolo: (document.querySelector('.slide-title, .cover h1, h1') || {}).textContent || '',
      }));
      if (eSlide) {
        const tot = await contatore(page);
        await passa(page, tot, async (i) => {
          const s = await misura(); s.link.forEach(l => link.add(l));
          if (s.h > 2) cattive.push(`slide #${i + 1} "${s.titolo.slice(0, 40)}" (+${s.h}px; ${s.larghi.join(', ')})`);
        });
        console.log(`  390x844: ${tot} slide controllate`);
      } else {
        const s = await misura(); s.link.forEach(l => link.add(l));
        if (s.h > 2) cattive.push(`pagina (+${s.h}px; ${s.larghi.join(', ')})`);
        console.log('  390x844: pagina controllata');
      }
      cattive.forEach(c => segnala('ERR', f, `overflow orizzontale a 390x844: ${c}`));
      [...new Set(page.errs)].forEach(e => segnala('ERR', f, `console 390x844: ${e.slice(0, 220)}`));
      await page.close();
    }

    // link locali
    const dir = path.dirname(f), mancanti = [];
    for (const l of link) {
      if (!l || /^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(l)) continue;
      const p = path.resolve(dir, decodeURIComponent(l.split('#')[0].split('?')[0]));
      if (!fs.existsSync(p)) mancanti.push(l);
    }
    mancanti.forEach(l => segnala('AVV', f, `link locale mancante: ${l}`));
  }
  await browser.close();
  console.log(`\nRiepilogo: ${files.length} pagine, ${nErrori} errori, ${nAvvisi} avvisi (link mancanti).`);
  process.exit(nErrori ? 1 : 0);
})();
