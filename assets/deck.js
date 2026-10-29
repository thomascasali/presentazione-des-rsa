/* ==========================================================================
   deck.js — guscio della presentazione + componenti condivisi (JS puro, niente JSX).
   Richiede React 18 e ReactDOM 18 già caricati (window.React, window.ReactDOM).
   Funziona anche aperto da file://.

   API
     Deck.mount(slides, opzioni)     monta la presentazione in #root
     window.UI                       componenti riusabili (anche nelle pagine di gioco)
     UI.render(elemento, selettore)  monta una pagina singola (giochi/simulazioni)
     UI.salva(chiave, v) / UI.carica(chiave, predefinito)   localStorage sicuro (try/catch)

   Slide: { sezione, titolo, contenuto, note, copertina?, senzaTitolo? }
     - contenuto: funzione () => elemento React (può usare hook: è montata come componente)
     - titolo: se presente, il guscio disegna <h2 class="slide-title"> sopra il contenuto
     - copertina: true -> slide di apertura standard (numero, nome, sottotitolo); se c'è
       anche `contenuto`, viene aggiunto sotto
     - note: stringa oppure array di paragrafi (pannello con il tasto N)
   Opzioni: { modulo, nome, sottotitolo, indice: '../index.html' }
   ========================================================================== */
(function () {
  'use strict';
  var React = window.React, ReactDOM = window.ReactDOM;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useLayoutEffect = React.useLayoutEffect;

  /* ------------------------------------------------------------- utilità */

  var PREFISSO = 'des-rsa:';
  function salva(chiave, valore) { try { localStorage.setItem(PREFISSO + chiave, JSON.stringify(valore)); } catch (e) { /* storage non disponibile */ } }
  function carica(chiave, predefinito) {
    try {
      var v = localStorage.getItem(PREFISSO + chiave);
      return v === null ? predefinito : JSON.parse(v);
    } catch (e) { return predefinito; }
  }
  function cls() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function fermaClick(e) { e.stopPropagation(); }

  /* Registro dei "passi" interni a una slide (righe di codice, stepper): le frecce/spazio
     li avanzano prima di cambiare slide. Ogni handler: { avanti(): bool, indietro(): bool }. */
  var gestoriPassi = [];
  function usaPassi(gestore) {
    useEffect(function () {
      gestoriPassi.push(gestore);
      return function () { var i = gestoriPassi.indexOf(gestore); if (i >= 0) gestoriPassi.splice(i, 1); };
    }, [gestore]);
  }
  function consumaPasso(verso) {
    for (var i = 0; i < gestoriPassi.length; i++) if (gestoriPassi[i][verso]()) return true;
    return false;
  }

  /* ------------------------------------------------------------ componenti */

  // <Box type="info|warn|danger|tip|success" title="...">
  function Box(p) {
    return h('div', { className: cls('box', p.type && p.type !== 'info' ? p.type : '', p.className) },
      p.title ? h('div', { className: 'box-title' }, p.title) : null,
      h('div', { className: 'box-body' }, p.children));
  }
  function Glow(p) { return h('div', { className: cls('glow', p.className) }, h('div', null, p.children)); }
  // <Chip color="info|success|danger|warn|purple">testo</Chip>
  function Chip(p) { return h('span', { className: cls('chip', p.color, p.className) }, p.children); }
  // <Grid cols={3} min="..."> figli in colonne (su smartphone una colonna sola; keep2 le mantiene a 2)
  function Grid(p) {
    var st = Object.assign({ '--cols': p.cols || 2 }, p.gap ? { gap: p.gap } : null, p.style);
    return h('div', { className: cls('grid', p.stretch && 'stretch', p.keep2 && 'keep2', p.className), style: st }, p.children);
  }
  function Card(p) { return h('div', { className: cls('card', p.tone && 'top-' + p.tone, p.light && 'light', p.className), style: p.style }, p.children); }
  function Btn(p) {
    var q = Object.assign({}, p, { className: cls('btn', p.variant, p.small && 'sm', p.className), type: p.type || 'button' });
    delete q.variant; delete q.small;
    return h('button', q, p.children);
  }
  // <Field label="Chiave"><input className="input" .../></Field>
  function Field(p) {
    return h('div', { className: cls('field', p.className), style: p.style },
      p.label ? h('label', { htmlFor: p.htmlFor }, p.label) : null, p.children);
  }
  function Kbd(p) { return h('kbd', null, p.children); }

  // <Table head={['A','B']} rows={[[1,2]]} mono center hlRow={0} />
  function Table(p) {
    return h('div', { className: 'scrollx' },
      h('table', { className: cls('table', p.mono && 'mono', p.center && 'center') },
        p.head ? h('thead', null, h('tr', null, p.head.map(function (c, i) { return h('th', { key: i }, c); }))) : null,
        h('tbody', null, (p.rows || []).map(function (r, i) {
          return h('tr', { key: i, className: p.hlRow === i ? 'hl-row' : '' }, r.map(function (c, j) { return h('td', { key: j }, c); }));
        }))));
  }

  // <Flow steps={[{icon,label,sub,color}]} /> catena di blocchi con frecce
  function Flow(p) {
    var out = [];
    p.steps.forEach(function (s, i) {
      out.push(h('div', { key: 'f' + i, className: 'flow-item', style: s.color ? { borderTopColor: s.color } : null },
        s.icon ? h('span', { className: 'ic', 'aria-hidden': true }, s.icon) : null,
        h('b', null, s.label), s.sub ? h('span', { className: 's' }, s.sub) : null));
      if (i < p.steps.length - 1) out.push(h('div', { key: 'a' + i, className: 'flow-arrow', 'aria-hidden': true }, '→'));
    });
    return h('div', { className: 'flow' }, out);
  }

  // <CompareTwo left={{title,icon,color,points:[]}} right={...} />
  function CompareTwo(p) {
    return h('div', { className: 'compare' }, [p.left, p.right].map(function (c, i) {
      return h('div', { key: i, className: 'card', style: { borderTop: '4px solid ' + (c.color || 'var(--accent)') } },
        h('div', { className: 'ct', style: { color: (c.color || 'var(--accent)').replace(/var\(--(success|danger|info|warn|purple)\)/, 'var(--$1-t)') } }, (c.icon ? c.icon + ' ' : '') + c.title),
        h('ul', null, c.points.map(function (t, j) { return h('li', { key: j }, t); })));
    }));
  }

  // <ActivityBadge href="../simulazione.html" label="Apri la simulazione" icon="..." />
  function ActivityBadge(p) {
    return h('a', { href: p.href, target: p.stesso ? undefined : '_blank', rel: 'noopener', onClick: fermaClick, className: 'activity' },
      h('span', { 'aria-hidden': true }, p.icon || '📄'), h('span', null, p.label), h('span', { 'aria-hidden': true }, '↗'));
  }

  /* -------- Bit: <BitRow bits="01101001" group={4} marks={{2:'info'}} onToggle={i=>..} label="..." /> */
  function BitRow(p) {
    var bits = String(p.bits || '').replace(/\s+/g, ''), g = p.group === undefined ? 4 : p.group;
    var gruppi = [];
    if (!g) gruppi.push({ da: 0, a: bits.length });
    else for (var i = 0; i < bits.length; i += g) gruppi.push({ da: i, a: Math.min(i + g, bits.length) });
    var marks = p.marks || {};
    var celle = function (gr) {
      var out = [];
      for (var k = gr.da; k < gr.a; k++) (function (idx) {
        var m = marks[idx], c = cls('bit', bits[idx] === '1' && 'one', m && 'm-' + m, p.compact && 'compact');
        if (p.onToggle) out.push(h('button', { key: idx, type: 'button', className: c, 'aria-label': 'Bit ' + (idx + 1) + ': ' + bits[idx] + ' (clicca per invertire)', onClick: function () { p.onToggle(idx); } }, bits[idx]));
        else out.push(h('span', { key: idx, className: c }, bits[idx]));
      })(k);
      return out;
    };
    return h('div', null,
      p.label ? h('div', { className: 'bits-label' }, p.label) : null,
      h('div', { className: cls('bits', p.compact && 'compact'), role: 'group', 'aria-label': p.label || 'bit' },
        gruppi.map(function (gr, i) { return h('span', { key: i, className: 'bits-group' }, celle(gr)); })));
  }

  /* -------- Steps: stepper avanti/indietro. steps = [{ title, content }] ; mode 'single' | 'cumulative' */
  function Steps(p) {
    var st = useState(p.start || 0), n = st[0], setN = st[1];
    var tot = p.steps.length, ref = useRef({});
    ref.current.avanti = function () { if (p.keys === false || n >= tot - 1) return false; setN(n + 1); return true; };
    ref.current.indietro = function () { if (p.keys === false || n <= 0) return false; setN(n - 1); return true; };
    usaPassi(ref.current);
    var cumul = p.mode === 'cumulative';
    var carte = (cumul ? p.steps.slice(0, n + 1) : [p.steps[n]]).map(function (s, i) {
      var idx = cumul ? i : n;
      return h('div', { key: idx, className: cls('step-card', cumul && idx < n && 'past') },
        s.title ? h('h3', null, s.title) : null, h('div', null, s.content));
    });
    return h('div', { className: 'steps' },
      h('div', { className: 'row-between' },
        h('div', { className: 'steps-dots', role: 'group', 'aria-label': 'Passi' }, p.steps.map(function (s, i) {
          return h('button', { key: i, type: 'button', className: cls('dot', i < n && 'done', i === n && 'now'), 'aria-label': 'Passo ' + (i + 1), 'aria-current': i === n ? 'step' : undefined, onClick: function () { setN(i); } });
        })),
        h('span', { className: 'mono small muted' }, 'Passo ' + (n + 1) + ' di ' + tot)),
      carte,
      h('div', { className: 'row' },
        h(Btn, { onClick: function () { setN(Math.max(0, n - 1)); }, disabled: n === 0 }, '← Indietro'),
        h(Btn, { variant: 'primary', onClick: function () { setN(Math.min(tot - 1, n + 1)); }, disabled: n === tot - 1 }, 'Avanti →'),
        n > 0 ? h(Btn, { variant: 'ghost', onClick: function () { setN(0); } }, '↺ Da capo') : null));
  }

  /* -------- Code: codice con evidenziazione PHP e rivelazione riga per riga.
     <Code code={`...`} lang="php" title="cesare.php" reveal explain={['spiega riga 1', ...]} highlight={[3,4]} /> */
  var PHP_KW = 'function|return|if|else|elseif|foreach|for|while|as|echo|array|true|false|null|new|use|class|public|private|static|const|declare|namespace|require|require_once|include|fn|match|and|or|break|continue|isset|empty|print';
  var RE_PHP = new RegExp('(\\/\\/.*|#.*)|(\\/\\*.*?\\*\\/)|("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')|(\\$[A-Za-z_]\\w*)|(<\\?php|\\?>)|\\b(' + PHP_KW + ')\\b|\\b(\\d+(?:\\.\\d+)?)\\b|\\b([A-Za-z_]\\w*)(?=\\()', 'g');
  var CLASSI = [null, 'tk-c', 'tk-c', 'tk-s', 'tk-v', 'tk-k', 'tk-k', 'tk-n', 'tk-f'];

  function evidenzia(riga, lang, stato) {
    if (lang !== 'php') return [riga];
    if (stato.blocco) {
      var fine = riga.indexOf('*/');
      if (fine < 0) return [h('span', { key: 0, className: 'tk-c' }, riga)];
      stato.blocco = false;
      return [h('span', { key: 0, className: 'tk-c' }, riga.slice(0, fine + 2))].concat(evidenzia(riga.slice(fine + 2), lang, stato));
    }
    var out = [], ult = 0, m, k = 0;
    RE_PHP.lastIndex = 0;
    while ((m = RE_PHP.exec(riga)) !== null) {
      if (m.index > ult) out.push(riga.slice(ult, m.index));
      var gi = 1; while (gi < 9 && m[gi] === undefined) gi++;
      out.push(h('span', { key: 't' + k++, className: CLASSI[gi] }, m[0]));
      ult = m.index + m[0].length;
      if (m[0].length === 0) RE_PHP.lastIndex++;
    }
    var resto = riga.slice(ult), ap = resto.indexOf('/*');
    if (ap >= 0 && resto.indexOf('*/', ap) < 0) {
      stato.blocco = true;
      out.push(resto.slice(0, ap)); out.push(h('span', { key: 'b', className: 'tk-c' }, resto.slice(ap)));
    } else if (resto) out.push(resto);
    return out;
  }

  function Code(p) {
    var righe = String(p.code).replace(/\n$/, '').split('\n'), lang = p.lang || 'php';
    var vuota = function (i) { return !righe[i] || !righe[i].trim(); };
    var st = useState(p.reveal ? { cur: -1, shown: 0 } : { cur: -1, shown: righe.length }), s = st[0], setS = st[1];
    var avanza = function () {
      var i = s.shown; while (i < righe.length && vuota(i)) i++;
      if (i >= righe.length) { setS({ cur: s.cur, shown: righe.length }); return; }
      var sh = i + 1; while (sh < righe.length && vuota(sh)) sh++;
      setS({ cur: i, shown: sh });
    };
    var indietro = function () {
      var i = s.cur - 1; while (i >= 0 && vuota(i)) i--;
      if (i < 0) { setS({ cur: -1, shown: 0 }); return; }
      setS({ cur: i, shown: i + 1 });
    };
    var finito = s.shown >= righe.length && (s.cur >= 0 || !p.reveal);
    var ref = useRef({});
    ref.current.avanti = function () { if (!p.reveal || p.keys === false || s.shown >= righe.length) return false; avanza(); return true; };
    ref.current.indietro = function () { if (!p.reveal || p.keys === false || s.cur < 0) return false; indietro(); return true; };
    usaPassi(ref.current);

    var stato = { blocco: false }, evid = p.highlight || [];
    var corpo = righe.map(function (r, i) {
      var visibile = i < s.shown;
      return h('div', { key: i, className: cls('code-line', evid.indexOf(i + 1) >= 0 && 'hl', p.reveal && i === s.cur && 'cur', !visibile && 'off'), 'aria-hidden': visibile ? undefined : true },
        h('span', { className: 'n' }, i + 1), h('span', null, evidenzia(r, lang, stato)));
    });
    var spiega = p.explain && s.cur >= 0 ? (Array.isArray(p.explain) ? p.explain[s.cur] : p.explain[s.cur + 1]) : null;
    return h('div', { className: cls('code', p.className) },
      p.title ? h('div', { className: 'code-head' }, h('span', null, p.title), h('span', null, lang.toUpperCase())) : null,
      h('pre', { className: 'code-body', tabIndex: 0 }, corpo),
      p.reveal ? h('div', { className: 'code-explain', 'aria-live': 'polite' },
        s.cur < 0 ? 'Premi «Prossima riga» (o la freccia destra) per rivelare il codice una riga alla volta.' : (spiega || '')) : null,
      p.reveal ? h('div', { className: 'code-ctrl' },
        h(Btn, { small: true, onClick: indietro, disabled: s.cur < 0 }, '← Riga precedente'),
        h(Btn, { small: true, variant: 'primary', onClick: avanza, disabled: finito }, 'Prossima riga →'),
        h(Btn, { small: true, variant: 'ghost', onClick: function () { setS({ cur: righe.length - 1, shown: righe.length }); } }, 'Mostra tutto'),
        h('span', { className: 'mono xs muted' }, Math.max(0, s.cur + 1) + ' / ' + righe.length)) : null);
  }

  /* -------- Pagina singola (giochi, simulazioni da smartphone):
     <PaginaGioco titolo="..." indietro="slide.html" indietroEtichetta="Modulo 1">...</PaginaGioco> */
  function PaginaGioco(p) {
    return h('div', null,
      h('div', { className: 'bg-texture' }),
      h('div', { className: cls('page', p.largo && 'wide') },
        h('div', { className: 'page-head' },
          p.indietro ? h('a', { href: p.indietro }, '← ' + (p.indietroEtichetta || 'Indietro')) : null,
          h('h1', null, p.titolo)),
        p.children));
  }
  function render(elemento, selettore) {
    ReactDOM.createRoot(document.querySelector(selettore || '#root')).render(elemento);
  }

  /* ------------------------------------------------------------- icone */
  function icona(figure, size) {
    return h('svg', { width: size || 20, height: size || 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, figure);
  }
  var IcSx = function () { return icona(h('polyline', { points: '15 18 9 12 15 6' })); };
  var IcDx = function () { return icona(h('polyline', { points: '9 18 15 12 9 6' })); };
  var IcNote = function () { return icona([h('path', { key: 1, d: 'M4 4h16v12H8l-4 4z' }), h('line', { key: 2, x1: 7.5, y1: 8.5, x2: 16.5, y2: 8.5 }), h('line', { key: 3, x1: 7.5, y1: 12, x2: 13, y2: 12 })], 19); };
  var IcExp = function () { return icona([h('polyline', { key: 1, points: '9 3 3 3 3 9' }), h('polyline', { key: 2, points: '15 3 21 3 21 9' }), h('polyline', { key: 3, points: '9 21 3 21 3 15' }), h('polyline', { key: 4, points: '15 21 21 21 21 15' })], 19); };
  var IcCol = function () { return icona([h('polyline', { key: 1, points: '4 9 9 9 9 4' }), h('polyline', { key: 2, points: '20 9 15 9 15 4' }), h('polyline', { key: 3, points: '4 15 9 15 9 20' }), h('polyline', { key: 4, points: '20 15 15 15 15 20' })], 19); };
  var IcLista = function () { return icona([h('line', { key: 1, x1: 8, y1: 6, x2: 21, y2: 6 }), h('line', { key: 2, x1: 8, y1: 12, x2: 21, y2: 12 }), h('line', { key: 3, x1: 8, y1: 18, x2: 21, y2: 18 }), h('line', { key: 4, x1: 3, y1: 6, x2: 3.01, y2: 6 }), h('line', { key: 5, x1: 3, y1: 12, x2: 3.01, y2: 12 }), h('line', { key: 6, x1: 3, y1: 18, x2: 3.01, y2: 18 })], 19); };

  /* ------------------------------------------------------------- guscio */

  var BASE_PX = 17, MIN_PX = 12.5, LARGHEZZA_RIF = 1366, ALTEZZA_RIF = 768;
  function eMobile() { return window.innerWidth <= 900; }
  function zoomBase() { return Math.min(2.4, Math.max(1, Math.min(window.innerWidth / LARGHEZZA_RIF, window.innerHeight / ALTEZZA_RIF))); }
  function daHash(tot) {
    var n = parseInt((window.location.hash || '').replace('#', ''), 10);
    return isNaN(n) ? 0 : Math.max(0, Math.min(tot - 1, n - 1));
  }

  function CorpoSlide(p) { return p.fn ? p.fn(h) : null; }

  function Guscio(props) {
    var slides = props.slides, opts = props.opts || {}, tot = slides.length;
    var st = useState(function () { return daHash(tot); }), cur = st[0], setCur = st[1];
    var nt = useState(false), notesOn = nt[0], setNotesOn = nt[1];
    var ix = useState(false), indexOn = ix[0], setIndexOn = ix[1];
    var fs = useState(false), isFs = fs[0], setIsFs = fs[1];
    var sz = useState(0), setSize = sz[1];
    var stageRef = useRef(null), slideRef = useRef(null), touch = useRef(null);
    var s = slides[cur], mobile = eMobile();
    var fsOk = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);

    var vai = function (n) { setCur(Math.max(0, Math.min(tot - 1, n))); };
    var avanti = function () { if (consumaPasso('avanti')) return; setCur(function (c) { return Math.min(c + 1, tot - 1); }); };
    var indietro = function () { if (consumaPasso('indietro')) return; setCur(function (c) { return Math.max(c - 1, 0); }); };
    var tutto = function () {
      try {
        var el = document.documentElement;
        if (!(document.fullscreenElement || document.webkitFullscreenElement)) {
          var rq = el.requestFullscreen || el.webkitRequestFullscreen;
          if (rq) { var pr = rq.call(el); if (pr && pr.catch) pr.catch(function () {}); }
        } else {
          var ex = document.exitFullscreen || document.webkitExitFullscreen;
          if (ex) { var pe = ex.call(document); if (pe && pe.catch) pe.catch(function () {}); }
        }
      } catch (e) { /* API non supportata */ }
    };

    /* tastiera */
    var fnRef = useRef({});
    fnRef.current = { avanti: avanti, indietro: indietro, tutto: tutto, vai: vai };
    useEffect(function () {
      var onKey = function (e) {
        var t = e.target, tag = (t && t.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var f = fnRef.current;
        if (e.key === 'Escape') { setIndexOn(false); return; }
        if ((e.key === ' ' || e.key === 'Enter') && (tag === 'BUTTON' || tag === 'A')) return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); f.avanti(); }
        else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); f.indietro(); }
        else if (e.key === 'Home') { f.vai(0); }
        else if (e.key === 'End') { f.vai(tot - 1); }
        else if (e.key === 'n' || e.key === 'N') setNotesOn(function (v) { return !v; });
        else if (e.key === 'f' || e.key === 'F') f.tutto();
        else if (e.key === 'i' || e.key === 'I') setIndexOn(function (v) { return !v; });
      };
      window.addEventListener('keydown', onKey);
      return function () { window.removeEventListener('keydown', onKey); };
    }, []);

    /* schermo intero, ridimensionamento, hash */
    useEffect(function () {
      var onFs = function () { setIsFs(!!(document.fullscreenElement || document.webkitFullscreenElement)); };
      var onRes = function () { setSize(window.innerWidth * 10000 + window.innerHeight); };
      var onHash = function () { setCur(daHash(tot)); };
      document.addEventListener('fullscreenchange', onFs); document.addEventListener('webkitfullscreenchange', onFs);
      window.addEventListener('resize', onRes); window.addEventListener('hashchange', onHash);
      return function () {
        document.removeEventListener('fullscreenchange', onFs); document.removeEventListener('webkitfullscreenchange', onFs);
        window.removeEventListener('resize', onRes); window.removeEventListener('hashchange', onHash);
      };
    }, []);
    useEffect(function () {
      try { window.history.replaceState(null, '', '#' + (cur + 1)); } catch (e) { try { window.location.hash = String(cur + 1); } catch (e2) { /* niente */ } }
      var titolo = (opts.modulo !== undefined && opts.modulo !== '' ? 'Modulo ' + opts.modulo + ' — ' : '') + (opts.nome || '');
      document.title = titolo + (s.titolo ? ' · ' + s.titolo : '');
      if (mobile && stageRef.current) window.scrollTo(0, 0);
    }, [cur]);

    /* adattamento: su desktop la slide deve stare nello schermo senza scroll.
       Si parte dalla dimensione di riferimento (scalata sullo schermo) e si riduce il
       font-size della radice finché il contenuto entra. */
    var adatta = function () {
      var root = document.documentElement, st = stageRef.current, sl = slideRef.current;
      if (!st || !sl) return;
      if (eMobile()) { root.style.fontSize = '16px'; root.style.removeProperty('--slide-max'); return; }
      var z = zoomBase(), px = BASE_PX * z, max = Math.round(1240 * z);
      root.style.setProperty('--slide-max', max + 'px');
      for (var i = 0; i < 24; i++) {
        root.style.fontSize = px + 'px';
        var ok = sl.getBoundingClientRect().height <= st.clientHeight - 2 && sl.scrollWidth <= sl.clientWidth + 1;
        if (ok || px <= MIN_PX) break;
        px = Math.max(MIN_PX, px * 0.95);
      }
    };
    useLayoutEffect(adatta, [cur, notesOn, mobile, sz[0]]);
    useEffect(function () {
      if (typeof ResizeObserver === 'undefined' || !slideRef.current) return;
      var raf = 0, ro = new ResizeObserver(function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(adatta); });
      ro.observe(slideRef.current);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(adatta);
      return function () { ro.disconnect(); cancelAnimationFrame(raf); };
    }, [cur]);

    /* swipe e click ai bordi */
    var onTouchStart = function (e) {
      if (e.target.closest && e.target.closest('input,textarea,select,.scrollx,.code-body,[data-noswipe]')) { touch.current = null; return; }
      var t = e.changedTouches[0]; touch.current = { x: t.clientX, y: t.clientY };
    };
    var onTouchEnd = function (e) {
      var o = touch.current; touch.current = null; if (!o) return;
      var t = e.changedTouches[0], dx = t.clientX - o.x, dy = t.clientY - o.y;
      if (Math.abs(dx) > 70 && Math.abs(dy) < 55) { if (dx < 0) avanti(); else indietro(); }
    };
    var onStageClick = function (e) {
      if (e.target !== stageRef.current) return;                  // solo il bordo vuoto, mai il contenuto
      var r = stageRef.current.getBoundingClientRect();
      if (e.clientX > r.left + r.width / 2) avanti(); else indietro();
    };

    var dove = (opts.modulo !== undefined && opts.modulo !== '' ? 'Modulo ' + opts.modulo + ' — ' : '') + (opts.nome || '') + (s.sezione ? ' · ' + s.sezione : '');
    var contenuto;
    if (s.copertina) {
      contenuto = h('div', { className: 'cover' },
        opts.modulo !== undefined && opts.modulo !== '' ? h('div', { className: 'num' }, 'Modulo ' + opts.modulo) : null,
        h('h1', null, s.titolo || opts.nome),
        (s.sottotitolo || opts.sottotitolo) ? h('p', { className: 'lead' }, s.sottotitolo || opts.sottotitolo) : null,
        s.contenuto ? h(CorpoSlide, { fn: s.contenuto }) : null);
    } else {
      contenuto = h(React.Fragment, null,
        s.titolo && !s.senzaTitolo ? h('h2', { className: 'slide-title' }, s.titolo) : null,
        h(CorpoSlide, { fn: s.contenuto }));
    }
    var note = Array.isArray(s.note) ? s.note : (s.note ? [s.note] : []);
    var notesH = notesOn && !mobile ? '34vh' : '0px';

    return h('div', { className: 'deck', style: { '--notes-h': notesH } },
      h('div', { className: 'bg-texture' }),
      h('header', { className: 'topbar' },
        h('div', { className: 'left' },
          h('a', { className: 'back', href: opts.indice || '../index.html' }, '← Indice'),
          h('span', { className: 'hide-mobile', style: { color: 'var(--border)' }, 'aria-hidden': true }, '|'),
          h('span', { className: 'where', title: dove }, dove)),
        h('div', { className: 'right' },
          h('span', { className: 'count', 'aria-label': 'Slide ' + (cur + 1) + ' di ' + tot }, (cur + 1) + ' / ' + tot),
          h('div', { className: 'progress', 'aria-hidden': true }, h('div', { style: { width: ((cur + 1) / tot * 100) + '%' } })))),
      h('main', { className: 'stage', ref: stageRef, onClick: onStageClick, onTouchStart: onTouchStart, onTouchEnd: onTouchEnd },
        h('section', { className: 'slide slide-enter', key: cur, ref: slideRef, 'aria-label': s.titolo || opts.nome }, contenuto)),
      notesOn ? h('aside', { className: 'notes-panel', 'aria-label': 'Note per chi parla' },
        h('strong', null, 'Note per chi parla'), ' — ' + dove,
        note.length ? note.map(function (t, i) { return h('p', { key: i }, t); }) : h('p', null, '(nessuna nota per questa slide)')) : null,
      h('footer', { className: 'bottombar' },
        h('div', { className: 'btn-group' },
          h('button', { className: 'icon-btn', onClick: indietro, disabled: cur === 0, 'aria-label': 'Slide precedente', title: 'Slide precedente (←)' }, h(IcSx)),
          h('button', { className: 'icon-btn', onClick: avanti, disabled: cur === tot - 1, 'aria-label': 'Slide successiva', title: 'Slide successiva (→)' }, h(IcDx))),
        h('div', { className: 'btn-group' },
          h('button', { className: 'icon-btn', onClick: function () { setIndexOn(true); }, 'aria-label': 'Elenco slide (I)', title: 'Elenco slide (I)' }, h(IcLista)),
          h('button', { className: cls('icon-btn', notesOn && 'active'), onClick: function () { setNotesOn(function (v) { return !v; }); }, 'aria-label': 'Note per chi parla (N)', title: 'Note per chi parla (N)', 'aria-pressed': notesOn }, h(IcNote)),
          fsOk ? h('button', { className: cls('icon-btn', isFs && 'active'), onClick: tutto, 'aria-label': 'Schermo intero (F)', title: 'Schermo intero (F)', 'aria-pressed': isFs }, isFs ? h(IcCol) : h(IcExp)) : null)),
      indexOn ? h('div', { className: 'overlay', onClick: function () { setIndexOn(false); } },
        h('div', { className: 'overlay-box', role: 'dialog', 'aria-modal': true, 'aria-label': 'Elenco delle slide', onClick: fermaClick },
          h('div', { className: 'overlay-head' }, h('span', null, 'Slide del modulo'),
            h('button', { className: 'btn ghost', onClick: function () { setIndexOn(false); }, autoFocus: true }, 'Chiudi (Esc)')),
          h('ul', { className: 'overlay-list' }, slides.map(function (x, i) {
            return h('li', { key: i }, h('button', { className: i === cur ? 'now' : '', onClick: function () { vai(i); setIndexOn(false); } },
              h('span', { className: 'num' }, i + 1), h('span', null, x.titolo || opts.nome), h('span', { className: 'sec' }, x.sezione || '')));
          })))) : null);
  }

  /* ------------------------------------------------------------- esportazione */

  function mount(slides, opts) {
    var el = document.querySelector((opts && opts.contenitore) || '#root');
    ReactDOM.createRoot(el).render(h(Guscio, { slides: slides, opts: opts || {} }));
  }

  window.Deck = { mount: mount, h: h, usaPassi: usaPassi, salva: salva, carica: carica };
  window.UI = {
    h: h, Box: Box, Glow: Glow, Chip: Chip, Grid: Grid, Card: Card, Btn: Btn, Field: Field, Kbd: Kbd, Table: Table,
    Flow: Flow, CompareTwo: CompareTwo, ActivityBadge: ActivityBadge, BitRow: BitRow, Steps: Steps, Code: Code,
    PaginaGioco: PaginaGioco, render: render, salva: salva, carica: carica, cls: cls
  };
})();
