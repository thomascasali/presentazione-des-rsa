// Funzioni di supporto per il generatore della dispensa (HTML statico).
const fs = require('fs'), path = require('path');
const RADICE = path.resolve(__dirname, '..', '..');
const C = require(path.join(RADICE, 'assets', 'crypto.js'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const raw = (s) => ({ __raw: String(s) });
const cella = (c) => (c && c.__raw !== undefined ? c.__raw : esc(c));
const it = (n) => Number(n).toLocaleString('it-IT');
const big = (x) => (typeof x === 'bigint' ? x : BigInt(x));

// Indice della dispensa, riempito mentre si generano i capitoli.
const stato = { cap: 0, titoloCap: '', toc: [], idUsati: new Set() };
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

function capitolo(n, titolo, introduzione, corpo) {
  stato.cap = n; stato.titoloCap = titolo;
  const voce = { n, titolo, id: 'cap-' + n, sez: [] };
  stato.toc.push(voce);
  stato.corrente = voce;
  const body = typeof corpo === 'function' ? corpo() : corpo;
  return `<section class="cap" id="cap-${n}">
<header class="cap-head"><p class="cap-num">Capitolo ${n}</p><h2 class="cap-title">${esc(titolo)}</h2>${introduzione ? `<p class="cap-intro">${introduzione}</p>` : ''}</header>
${body}
</section>`;
}
function sez(titolo) {
  let id = `c${stato.cap}-${slug(titolo)}`, k = 2;
  while (stato.idUsati.has(id)) id = `c${stato.cap}-${slug(titolo)}-${k++}`;
  stato.idUsati.add(id);
  stato.corrente.sez.push({ id, titolo });
  return `<h3 id="${id}">${esc(titolo)}</h3>`;
}
const sub = (t) => `<h4>${esc(t)}</h4>`;
const p = (html) => `<p>${html}</p>`;
const ul = (voci) => `<ul>${voci.map((v) => `<li>${v}</li>`).join('')}</ul>`;
const ol = (voci) => `<ol>${voci.map((v) => `<li>${v}</li>`).join('')}</ol>`;
const m = (s) => `<span class="m">${esc(s)}</span>`;          // inline mono
const ev = (s) => `<span class="m ev">${esc(s)}</span>`;     // inline mono evidenziato
const formula = (html) => `<p class="formula">${html}</p>`;

function tabella(head, rows, o = {}) {
  const cls = ['t', o.mono ? 'mono' : '', o.center ? 'ctr' : '', o.stretta ? 'stretta' : ''].filter(Boolean).join(' ');
  const th = head ? `<thead><tr>${head.map((h) => `<th>${cella(h)}</th>`).join('')}</tr></thead>` : '';
  const tb = rows.map((r, i) => `<tr${o.evRiga && o.evRiga(r, i) ? ' class="ev-riga"' : ''}>${r.map((c, j) => {
    const e = o.ev && o.ev(i, j, c);
    return `<td${e ? ' class="ev"' : ''}>${cella(c)}</td>`;
  }).join('')}</tr>`).join('');
  const cap = o.didascalia ? `<caption>${o.didascalia}</caption>` : '';
  return `<div class="scrollx"><table class="${cls}">${cap}${th}<tbody>${tb}</tbody></table></div>`;
}

function box(tipo, titolo, html) {
  return `<aside class="box ${tipo}"><p class="box-t">${esc(titolo)}</p>${html}</aside>`;
}
const ricorda = (html, t = 'Da ricordare') => box('ricorda', t, html);
const errore = (html, t = 'Errore tipico') => box('errore', t, html);
const nota = (html, t = 'Nota') => box('nota', t, html);
const esempio = (titolo, html) => `<div class="esempio"><p class="esempio-t">Esempio svolto: ${esc(titolo)}</p>${html}</div>`;

function codice(testo, titolo) {
  return `<figure class="cod"><figcaption>${esc(titolo || 'Codice')}</figcaption><div class="scrollx"><pre><code>${esc(testo)}</code></pre></div></figure>`;
}
function domande(lista) {
  return `<section class="verifica"><h3>Autoverifica</h3><ol>${lista.map((d) => `<li>${d}</li>`).join('')}</ol></section>`;
}
function rimandi(voci) {
  return `<section class="rimandi"><h3>Per esercitarsi</h3><ul>${voci.map(([href, nome, desc]) => `<li><a href="${href}">${esc(nome)}</a>${desc ? ` &mdash; ${desc}` : ''}</li>`).join('')}</ul></section>`;
}

// Estrae da una slide una costante di tipo template literal (codice PHP di riferimento).
function codiceDa(file, nome) {
  const t = fs.readFileSync(path.join(RADICE, file), 'utf8');
  const r = new RegExp('const ' + nome + ' = `([\\s\\S]*?)`;');
  const mm = t.match(r);
  if (!mm) throw new Error('Costante non trovata: ' + file + ' ' + nome);
  return mm[1].split('\\\\').join('\\');
}

const bitsSpazi = (b, g = 4) => b.replace(new RegExp('(.{' + g + '})(?=.)', 'g'), '$1 ');
const hexSpazi = (h, g = 4) => h.replace(new RegExp('(.{' + g + '})(?=.)', 'g'), '$1 ');
const A = C.ALFABETO;

module.exports = { RADICE, C, A, esc, raw, it, big, stato, capitolo, sez, sub, p, ul, ol, m, ev, formula, tabella, box, ricorda, errore, nota, esempio, codice, domande, rimandi, codiceDa, bitsSpazi, hexSpazi };
