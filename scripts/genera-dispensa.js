// Genera dispensa/dispensa.html (HTML statico, stampabile) con tutti gli esempi calcolati da assets/crypto.js.
// Uso (dalla radice del repo):  node scripts/genera-dispensa.js
const fs = require('fs'), path = require('path');
const L = require('./dispensa/lib');
const { stato, esc } = L;

const capitoli = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => require('./dispensa/cap' + n)());
const fin = require('./dispensa/finale');
const appendici = fin.glossario() + '\n' + fin.fonti();
const css = fs.readFileSync(path.join(__dirname, 'dispensa', 'stile.css'), 'utf8');

const toc = stato.toc;
const navTree = toc.map((c) => `<li class="t-cap"><a href="#${c.id}">${c.n}. ${esc(c.titolo)}</a><ul class="t-sez">${c.sez.map((s) => `<li><a href="#${s.id}">${esc(s.titolo)}</a></li>`).join('')}</ul></li>`).join('');
const nav = `<nav id="toc" aria-label="Indice della dispensa"><a class="torna" href="../index.html">&larr; Indice del percorso</a><details id="tocd" open><summary>Indice della dispensa</summary><ol>${navTree}<li class="t-cap"><a href="#glossario">Appendice A. Glossario</a></li><li class="t-cap"><a href="#fonti">Appendice B. Fonti e letture</a></li></ol></details></nav>`;

const indiceCapitoli = `<section class="indice-capitoli" id="indice" aria-labelledby="indice-t"><h2 id="indice-t">Indice dei capitoli</h2><ol>${toc.map((c) => `<li><a href="#${c.id}"><b>${c.n}</b>${esc(c.titolo)}</a></li>`).join('')}<li><a href="#glossario"><b>A</b>Glossario</a></li><li><a href="#fonti"><b>B</b>Fonti e letture</a></li></ol></section>`;

const copertina = `<header class="copertina">
<p class="meta">Dispensa &middot; 5ª ITIS Informatica &middot; Sistemi e Reti</p>
<h1>Crittografia: dai cifrari classici a DES e RSA</h1>
<p class="sotto">Un testo completo per studiare senza le slide: dalla scitala e dal cifrario di Cesare fino alla crittografia ibrida di HTTPS e SSH, con tutti gli esempi svolti passo per passo.</p>
<div class="toolbar no-stampa"><button type="button" id="stampa">Stampa la dispensa (A4)</button><a class="btn sec" href="../index.html">Indice del percorso</a></div>
<div class="box nota usare"><p class="box-t">Come usare la dispensa</p><p>Ogni capitolo corrisponde a un modulo del percorso (da 0 a 9) e si può leggere da solo; i capitoli si appoggiano uno sull'altro, quindi conviene seguire l'ordine. Nel testo trovi:</p>
<ul><li><b>Esempio svolto</b>: un calcolo completo con tutti i numeri intermedi, per rifarlo a mano.</li><li><b>Da ricordare</b>: le definizioni e le regole da sapere a memoria.</li><li><b>Errore tipico</b>: gli sbagli più frequenti.</li><li><b>Autoverifica</b>: domande a fine capitolo per controllare di aver capito (senza soluzioni: provale prima su carta).</li><li><b>Per esercitarsi</b>: simulazioni, giochi, schede e laboratori PHP e OpenSSL del percorso.</li></ul></div>
</header>`;

const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dispensa di crittografia: dai cifrari classici a DES e RSA</title>
<meta name="description" content="Dispensa completa e stampabile su cifrari classici, DES, RSA e crittografia ibrida, con esempi svolti.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,800&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/print.css" media="print">
<style>
${css}
</style>
</head>
<body>
<div class="layout">
${nav}
<main id="contenuto">
${copertina}
${indiceCapitoli}
${capitoli.join('\n')}
${appendici}
</main>
</div>
<script>
(function () {
  try {
    var d = document.getElementById('tocd');
    if (d && window.innerWidth < 1000) d.removeAttribute('open');
    var b = document.getElementById('stampa');
    if (b) b.addEventListener('click', function () { window.print(); });
    if (d) d.addEventListener('click', function (e) { if (window.innerWidth < 1000 && e.target.closest && e.target.closest('a')) d.removeAttribute('open'); });
    if ('IntersectionObserver' in window) {
      var link = {};
      document.querySelectorAll('#toc a[href^="#"]').forEach(function (a) { link[a.getAttribute('href').slice(1)] = a; });
      var corr = null;
      var io = new IntersectionObserver(function (voci) {
        voci.forEach(function (v) {
          if (v.isIntersecting && link[v.target.id]) { if (corr) corr.classList.remove('corrente'); corr = link[v.target.id]; corr.classList.add('corrente'); }
        });
      }, { rootMargin: '0px 0px -75% 0px' });
      document.querySelectorAll('main h3[id], main section.cap[id]').forEach(function (h) { io.observe(h); });
    }
  } catch (e) {}
})();
</script>
</body>
</html>
`;
const dest = path.join(L.RADICE, 'dispensa', 'dispensa.html');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, html, 'utf8');
console.log('Scritto ' + path.relative(L.RADICE, dest) + ' (' + Math.round(html.length / 1024) + ' KB), capitoli: ' + toc.length + ', sezioni: ' + toc.reduce((s, c) => s + c.sez.length, 0));
