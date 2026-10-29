/* mat-ui.js — componenti condivisi dai moduli 7 e 8 (JS puro, niente JSX: funziona anche da file://).
   Richiede React, assets/crypto.js e assets/deck.js. Espone window.MatUI.
   Tutti i numeri vengono da window.Cripto (BigInt). */
(function () {
  'use strict';
  var h = React.createElement, C = window.Cripto;

  // Testo -> BigInt (solo cifre, segno opzionale); null se non valido o vuoto.
  function num(s) {
    s = String(s == null ? '' : s).replace(/[\s.']/g, '');
    if (!/^-?\d{1,60}$/.test(s)) return null;
    return BigInt(s);
  }
  // Resto sempre non negativo.
  function modB(a, m) { return ((a % m) + m) % m; }
  // Separatore delle migliaia con spazio sottile per numeri lunghi.
  function fmt(x) {
    var s = String(x), neg = s[0] === '-';
    if (neg) s = s.slice(1);
    if (s.length > 6) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (neg ? '−' : '') + s;
  }
  function segno(x) { return x < 0n ? '−' + (-x) : String(x); }

  /* Campo numerico testuale (tastiera numerica sul telefono). */
  function CampoNum(p) {
    var id = p.id || ('n-' + String(p.label).replace(/\W+/g, '-'));
    return h(UI.Field, { label: p.label, htmlFor: id, className: p.className },
      h('input', { id: id, className: 'input mono', inputMode: 'numeric', autoComplete: 'off', value: p.value,
        onChange: function (e) { p.onChange(e.target.value.replace(/[^\d-]/g, '').slice(0, p.max || 40)); },
        'aria-invalid': p.errore ? 'true' : undefined, style: p.style }));
  }

  /* Orologio con n posizioni (0..n-1) e una lancetta su `v`. */
  function Orologio(p) {
    var n = Math.max(2, Math.min(60, p.n)), v = p.v == null ? null : ((p.v % n) + n) % n;
    var R = 92, cx = 110, cy = 110, els = [];
    function pt(i, r) { var t = 2 * Math.PI * i / n; return [cx + r * Math.sin(t), cy - r * Math.cos(t)]; }
    els.push(h('circle', { key: 'c', cx: cx, cy: cy, r: 104, fill: 'var(--bg-card)', stroke: 'var(--border)', strokeWidth: 2 }));
    for (var i = 0; i < n; i++) {
      var q = pt(i, R), act = i === v;
      els.push(h('circle', { key: 'p' + i, cx: q[0], cy: q[1], r: n > 24 ? 3 : (act ? 14 : 12), fill: act ? 'var(--accent)' : 'var(--bg-light)', stroke: act ? 'var(--accent-alt)' : 'var(--border)', strokeWidth: 1.5 }));
      if (n <= 24) els.push(h('text', { key: 't' + i, x: q[0], y: q[1], textAnchor: 'middle', dominantBaseline: 'central', fontFamily: 'var(--f-mono)', fontSize: n > 14 ? 10 : 13, fontWeight: 600, fill: act ? 'var(--on-accent)' : 'var(--text)' }, i));
    }
    if (v !== null) {
      var e = pt(v, R - 18);
      els.push(h('line', { key: 'l', x1: cx, y1: cy, x2: e[0], y2: e[1], stroke: 'var(--accent-alt)', strokeWidth: 4, strokeLinecap: 'round' }));
      els.push(h('circle', { key: 'o', cx: cx, cy: cy, r: 6, fill: 'var(--accent-alt)' }));
    }
    return h('svg', { viewBox: '0 0 220 220', width: p.size || 200, height: p.size || 200, role: 'img', style: { maxWidth: '100%', height: 'auto' },
      'aria-label': 'Orologio con ' + n + ' posizioni' + (v !== null ? ', la lancetta indica ' + v : '') }, els);
  }

  /* Passi dell'algoritmo di Euclide per mcd(a,b): [{a,b,q,r}] (a >= b dopo lo scambio). */
  function righeEuclide(a, b) {
    a = BigInt(a); b = BigInt(b);
    if (a < 0n) a = -a; if (b < 0n) b = -b;
    if (a < b) { var t = a; a = b; b = t; }
    var out = [];
    while (b !== 0n) { var q = a / b, r = a % b; out.push({ a: a, b: b, q: q, r: r }); a = b; b = r; }
    return out;
  }
  function TabEuclide(p) {
    var righe = righeEuclide(p.a, p.b), g = C.mcd(BigInt(p.a), BigInt(p.b));
    return h('div', { className: 'stack' },
      h(UI.Table, { mono: true, center: true, head: ['Passo', 'a', 'b', 'q = a ÷ b', 'r = a mod b', 'a = b·q + r'],
        hlRow: righe.length - 1,
        rows: righe.map(function (r, i) { return [i + 1, fmt(r.a), fmt(r.b), fmt(r.q), fmt(r.r), fmt(r.a) + ' = ' + fmt(r.b) + '·' + fmt(r.q) + ' + ' + fmt(r.r)]; }) }),
      h('p', { className: 'small muted' }, 'Ci si ferma quando il resto è 0: l\'ultimo resto diverso da zero è il MCD. Qui ',
        h('span', { className: 'mono hl' }, 'MCD(' + fmt(p.a) + ', ' + fmt(p.b) + ') = ' + fmt(g)), '.'));
  }

  /* Euclide esteso: dati a (grande) e b, tabella r, q, s, t con r = a·s + b·t. */
  function TabEsteso(p) {
    var a = BigInt(p.a), b = BigInt(p.b), e = C.euclideEsteso(a, b);
    var rows = e.passi.map(function (s) {
      return [s.i, s.q === null ? '—' : fmt(s.q), fmt(s.r), segno(s.s), segno(s.t), fmt(a) + '·' + (s.s < 0n ? '(' + segno(s.s) + ')' : segno(s.s)) + ' + ' + fmt(b) + '·' + (s.t < 0n ? '(' + segno(s.t) + ')' : segno(s.t)) + ' = ' + fmt(s.r)];
    });
    // l'ultima riga è quella con resto 0: evidenzia la penultima (resto = mcd)
    return h('div', { className: 'stack' },
      h(UI.Table, { mono: true, center: true, head: ['i', 'q', 'r', 's', 't', 'a·s + b·t'], rows: rows, hlRow: rows.length - 2 }),
      h('p', { className: 'small muted' }, 'Ogni riga rispetta ', h('span', { className: 'mono hl' }, 'r = a·s + b·t'),
        '. Nella riga con r = MCD si leggono i coefficienti di Bézout: ',
        h('span', { className: 'mono hl' }, 'MCD = ' + fmt(e.mcd) + ' = ' + fmt(a) + '·(' + segno(e.x) + ') + ' + fmt(b) + '·(' + segno(e.y) + ')'), '.'));
  }

  /* Inverso di a modulo m con Euclide esteso (m per primo) e verifica. */
  function datiInverso(a, m) {
    a = BigInt(a); m = BigInt(m);
    var am = modB(a, m), e = C.euclideEsteso(m, am), g = e.mcd;
    var inv = g === 1n ? modB(e.y, m) : null;
    return { a: a, m: m, am: am, e: e, mcd: g, inverso: inv };
  }
  function TabInverso(p) {
    var d = datiInverso(p.a, p.m);
    if (d.mcd !== 1n) return h(UI.Box, { type: 'danger', title: 'Nessun inverso' },
      'MCD(' + fmt(d.am) + ', ' + fmt(d.m) + ') = ' + fmt(d.mcd) + ', diverso da 1: ' + fmt(d.am) + ' e ' + fmt(d.m) + ' non sono coprimi, quindi ' + fmt(d.am) + ' non ha inverso modulo ' + fmt(d.m) + '.');
    var prod = d.am * d.inverso, k = prod / d.m;
    return h('div', { className: 'stack' },
      h(UI.Table, { mono: true, center: true, head: ['i', 'q', 'r', 's', 't'], hlRow: d.e.passi.length - 2,
        rows: d.e.passi.map(function (s) { return [s.i, s.q === null ? '—' : fmt(s.q), fmt(s.r), segno(s.s), segno(s.t)]; }) }),
      h('p', { className: 'small' }, 'Colonne: ', h('span', { className: 'mono' }, 'r = ' + fmt(d.m) + '·s + ' + fmt(d.am) + '·t'), '. Nella riga con r = 1 il coefficiente ',
        h('span', { className: 'mono hl' }, 't = ' + segno(d.e.y)), d.e.y < 0n ? [' è negativo: si somma ' + fmt(d.m) + ' → ', h('span', { key: 'x', className: 'mono hl' }, fmt(d.inverso))] : ' è già l\'inverso.'),
      h('div', { className: 'feedback ok' }, h('b', null, 'Verifica: '), h('span', { className: 'mono' }, fmt(d.am) + ' · ' + fmt(d.inverso) + ' = ' + fmt(prod) + ' = ' + fmt(k) + '·' + fmt(d.m) + ' + ' + fmt(prod % d.m)), ', cioè ',
        h('span', { className: 'mono' }, fmt(d.am) + ' · ' + fmt(d.inverso) + ' ≡ ' + fmt(prod % d.m) + ' (mod ' + fmt(d.m) + ')'), '.'));
  }

  /* Square-and-multiply: una riga per bit dell'esponente. */
  function TabPotenza(p) {
    var b = BigInt(p.base), e = BigInt(p.esp), m = BigInt(p.mod);
    var t = C.potenzaModularePassi(b, e, m), bm = modB(b, m);
    var rows = t.passi.map(function (s, i) {
      return [i + 1, s.bit, i === 0 ? '1² = 1' : fmt(i === 0 ? 1n : t.passi[i - 1].valore) + '² mod ' + fmt(m) + ' = ' + fmt(s.dopoQuadrato),
        s.moltiplica ? fmt(s.dopoQuadrato) + '·' + fmt(bm) + ' mod ' + fmt(m) + ' = ' + fmt(s.valore) : 'niente', fmt(s.valore)];
    });
    return h('div', { className: 'stack' },
      h(UI.Table, { mono: true, center: true, head: ['Passo', 'Bit', 'Quadrato', 'Se il bit è 1: ×' + fmt(bm), 'Valore'], rows: rows, hlRow: rows.length - 1 }),
      h('p', { className: 'small muted' }, 'Esponente ', fmt(e), ' in binario: ', h('span', { className: 'mono hl' }, t.esponenteBinario),
        ' (' + t.esponenteBinario.length + ' bit). Risultato: ', h('span', { className: 'mono hl' }, fmt(b) + '^' + fmt(e) + ' mod ' + fmt(m) + ' = ' + fmt(t.risultato)), '.'));
  }

  /* Numero di moltiplicazioni modulari di square-and-multiply per l'esponente e. */
  function conteggioMoltiplicazioni(e) {
    var bin = BigInt(e).toString(2), q = bin.length, m = 0;
    for (var i = 0; i < bin.length; i++) if (bin[i] === '1') m++;
    return { quadrati: q, moltiplicazioni: m, totale: q + m };
  }

  // Numero di cifre decimali di x (BigInt).
  function cifre(x) { return BigInt(x).toString().length; }

  window.MatUI = { num: num, modB: modB, fmt: fmt, segno: segno, CampoNum: CampoNum, Orologio: Orologio,
    righeEuclide: righeEuclide, TabEuclide: TabEuclide, TabEsteso: TabEsteso, datiInverso: datiInverso, TabInverso: TabInverso,
    TabPotenza: TabPotenza, conteggioMoltiplicazioni: conteggioMoltiplicazioni, cifre: cifre };
})();
