/* ==========================================================================
   viste.js — viste condivise del modulo 6 (S-DES e DES), JS puro (niente JSX)
   per funzionare anche da file://. Si carica dopo crypto.js e deck.js.
   Espone window.VisteDES. Tutti i numeri arrivano da window.Cripto.
   ========================================================================== */
(function () {
  'use strict';
  var h = React.createElement, U = window.UI, C = window.Cripto;
  var SD = C.sdes.tabelle, DT = C.des.tabelle;

  function range(a, b) { var o = []; for (var i = a; i < b; i++) o.push(i); return o; }
  function sp(cls, t, key) { return h('span', { className: cls, key: key }, t); }
  function m(t, key) { return h('span', { className: 'mono hl', key: key }, t); }
  function p(/* figli */) { return h.apply(null, ['p', null].concat([].slice.call(arguments))); }
  function pesoUno(b) { return b.split('').filter(function (x) { return x === '1'; }).length; }
  function raggruppa(bit, n) { var o = []; for (var i = 0; i < bit.length; i += n) o.push(bit.slice(i, i + n)); return o.join(' '); }

  function Bits(label, bits, opt) {
    opt = opt || {};
    return h(U.BitRow, { label: label, bits: bits, group: opt.group === undefined ? 4 : opt.group, marks: opt.marks, compact: opt.compact });
  }
  // marca i bit [da, a) con un colore
  function segna(da, a, col, base) { var o = Object.assign({}, base || {}); for (var i = da; i < a; i++) o[i] = col; return o; }

  /* Tabella di permutazione: per ogni posizione di uscita, da quale bit dell'ingresso arriva e quanto vale. */
  function PermView(q) {
    var n = q.tabella.length, per = q.riga || n, blocchi = [];
    for (var s = 0; s < n; s += per) blocchi.push(s);
    return h('div', { className: 'scrollx' }, blocchi.map(function (s) {
      var idx = range(s, Math.min(n, s + per));
      return h('table', { className: 'table mono center perm', key: s, style: { marginBottom: '.3rem' } }, h('tbody', null,
        h('tr', null, h('th', null, 'uscita'), idx.map(function (j) { return h('th', { key: j }, j + 1); })),
        h('tr', null, h('td', { className: 't-info' }, 'dal bit'), idx.map(function (j) { return h('td', { key: j, className: 't-info' }, q.tabella[j]); })),
        h('tr', null, h('td', null, 'valore'), idx.map(function (j) { return h('td', { key: j, className: 'hl' }, q.ingresso[q.tabella[j] - 1]); }))));
    }));
  }
  // Ingresso numerato (bit 1, 2, ...) + tabella + uscita.
  function Permutazione(q) {
    return h('div', { className: 'stack' },
      q.ingressoEtichetta !== false ? Bits(q.etichetta || 'ingresso', q.ingresso, { group: q.group, compact: q.compact }) : null,
      h(PermView, q),
      Bits(q.uscitaEtichetta || 'uscita', q.uscita, { group: q.group, compact: q.compact, marks: q.marks }));
  }

  /* Matrice di una S-box con la cella letta evidenziata. righe: array di array. */
  function SboxMatrice(q) {
    var rows = q.righe, nc = rows[0].length, bitsCol = nc === 4 ? 2 : 4;
    return h('div', { className: 'scrollx' }, h('table', { className: 'table mono center sbox' },
      h('thead', null, h('tr', null, h('th', null, q.nome || 'S'), range(0, nc).map(function (c) {
        return h('th', { key: c, className: q.colonna === c ? 'hl-col' : '' }, c.toString(2).padStart(bitsCol, '0') + (q.compattaCol ? '' : ' (' + c + ')'));
      }))),
      h('tbody', null, rows.map(function (r, i) {
        return h('tr', { key: i }, h('th', { className: q.riga === i ? 'hl-col' : '' }, i.toString(2).padStart(2, '0') + ' (' + i + ')'),
          r.map(function (v, c) {
            var sel = q.riga === i && q.colonna === c;
            return h('td', { key: c, className: sel ? 'sel' : (q.riga === i || q.colonna === c ? 'cross' : '') }, v);
          }));
      }))));
  }
  function desRighe(i) { return range(0, 4).map(function (r) { return DT.S[i].slice(r * 16, r * 16 + 16); }); }

  /* Una S-box DES letta: 6 bit in ingresso, bit esterni = riga, interni = colonna. */
  function DesSboxCard(q) {
    var s = q.sbox, i = q.indice;
    var marks = { 0: 'warn', 5: 'warn', 1: 'info', 2: 'info', 3: 'info', 4: 'info' };
    return h('div', { className: 'card light sbox-card', key: i },
      h('div', { className: 'row-between' }, h('b', null, 'S' + (i + 1)), h('span', { className: 'mono xs muted' }, 'riga ' + s.riga + ' · colonna ' + s.colonna)),
      Bits('ingresso 6 bit', s.ingresso, { group: 0, marks: marks, compact: true }),
      h('div', { className: 'small dim' }, 'riga = bit esterni ', m(s.ingresso[0] + s.ingresso[5]), ' = ', m(String(s.riga)), ' · colonna = bit interni ', m(s.ingresso.slice(1, 5)), ' = ', m(String(s.colonna))),
      q.matrice ? h(SboxMatrice, { righe: desRighe(i), riga: s.riga, colonna: s.colonna, nome: 'S' + (i + 1), compattaCol: true }) : null,
      h('div', { className: 'small' }, 'valore ', m(String(s.valore)), ' → ', m(s.uscita)));
  }

  /* ----------------------------------------------------------------- S-DES */

  var RIGA_COL = 'riga = bit 1 e 4, colonna = bit 2 e 3';

  function SdesSbox(q) {
    var sb = q.sbox, nome = q.nome, S = nome === 'S0' ? SD.S0 : SD.S1;
    var marks = { 0: 'warn', 3: 'warn', 1: 'info', 2: 'info' };
    return h('div', { className: 'card light' },
      h('b', null, nome),
      Bits('ingresso 4 bit', q.ingresso, { group: 0, marks: marks }),
      h('div', { className: 'small dim' }, 'riga = bit 1 e 4 → ', m(q.ingresso[0] + q.ingresso[3]), ' = ', m(String(sb.riga)), ' · colonna = bit 2 e 3 → ', m(q.ingresso[1] + q.ingresso[2]), ' = ', m(String(sb.colonna))),
      h(SboxMatrice, { righe: S, riga: sb.riga, colonna: sb.colonna, nome: nome }),
      h('div', { className: 'small' }, 'valore ', m(String(sb.valore)), ' → in 2 bit: ', m(sb.uscita)));
  }

  /* Elenco dei passi dello S-DES (cifratura o decifratura) per Steps. t = C.sdes.traccia(...). */
  function sdesPassi(t, decifra) {
    var ch = t.chiavi, r1 = t.round1, r2 = t.round2;
    var n1 = decifra ? 'K2' : 'K1', n2 = decifra ? 'K1' : 'K2';
    var passi = [];
    function add(title, content) { passi.push({ title: title, content: h('div', { className: 'stack' }, content) }); }

    add('1 · La chiave di 10 bit', [
      p('Dalla chiave di 10 bit si ricavano due sottochiavi di 8 bit: ', m('K1'), ' per il primo round e ', m('K2'), ' per il secondo.'),
      Bits('chiave', ch.chiave, { group: 0, compact: true }),
      p('I bit si numerano da ', m('1'), ' a sinistra, come nelle tabelle.')]);
    add('2 · P10: rimescolare i bit', [
      p('La tabella P10 dice, per ogni posizione di uscita, quale bit della chiave prendere. P10 = ', m('[' + SD.P10.join(', ') + ']'), '.'),
      h(Permutazione, { ingresso: ch.chiave, tabella: SD.P10, uscita: ch.p10, group: 0, compact: true, etichetta: 'chiave', uscitaEtichetta: 'dopo P10' })]);
    add('3 · Dividere in due metà e ruotare (LS-1)', [
      p('Si separa in due metà da 5 bit. Ciascuna metà ruota a sinistra di 1: il primo bit passa in fondo.'),
      h('div', { className: 'grid', style: { '--cols': 2 } },
        h('div', { className: 'stack' }, Bits('metà sinistra', ch.c0, { group: 0 }), Bits('dopo LS-1', ch.ls1.slice(0, 5), { group: 0, marks: { 4: 'warn' } })),
        h('div', { className: 'stack' }, Bits('metà destra', ch.d0, { group: 0 }), Bits('dopo LS-1', ch.ls1.slice(5), { group: 0, marks: { 4: 'warn' } }))),
      p('Le due metà rimesse insieme: ', m(ch.ls1), '.')]);
    add('4 · P8: scegliere 8 bit, ecco K1', [
      p('P8 prende 8 dei 10 bit (due vengono scartati): P8 = ', m('[' + SD.P8.join(', ') + ']'), '.'),
      h(Permutazione, { ingresso: ch.ls1, tabella: SD.P8, uscita: ch.k1, group: 0, compact: true, etichetta: 'dopo LS-1', uscitaEtichetta: 'K1', marks: segna(0, 8, 'success') })]);
    add('5 · Altre due rotazioni (LS-2)', [
      p('Si riparte dalle due metà ', h('b', null, 'già ruotate'), ' di 1 e si ruotano di altri ', m('2'), ' posti (non dalla chiave originale!).'),
      h('div', { className: 'grid', style: { '--cols': 2 } },
        h('div', { className: 'stack' }, Bits('sinistra dopo LS-1', ch.ls1.slice(0, 5), { group: 0 }), Bits('dopo LS-2', ch.ls2.slice(0, 5), { group: 0 })),
        h('div', { className: 'stack' }, Bits('destra dopo LS-1', ch.ls1.slice(5), { group: 0 }), Bits('dopo LS-2', ch.ls2.slice(5), { group: 0 }))),
      p('Insieme: ', m(ch.ls2), '.')]);
    add('6 · P8 ancora: ecco K2', [
      p('Stessa tabella P8 applicata al nuovo risultato.'),
      h(Permutazione, { ingresso: ch.ls2, tabella: SD.P8, uscita: ch.k2, group: 0, compact: true, etichetta: 'dopo LS-2', uscitaEtichetta: 'K2', marks: segna(0, 8, 'success') }),
      h('div', { className: 'box success' }, h('div', { className: 'box-body' }, 'Sottochiavi pronte: ', m('K1 = ' + ch.k1), ' e ', m('K2 = ' + ch.k2), '.' + (decifra ? ' Per decifrare si usano in ordine inverso: prima K2, poi K1.' : '')))]);

    add('7 · Il blocco e la permutazione iniziale IP', [
      p('Il blocco di ', m('8'), ' bit ' + (decifra ? 'cifrato' : 'in chiaro') + ' passa per la permutazione IP = ', m('[' + SD.IP.join(', ') + ']'), '. Poi si divide in ', m('L'), ' (4 bit a sinistra) e ', m('R'), ' (4 a destra).'),
      h(Permutazione, { ingresso: t.ingresso, tabella: SD.IP, uscita: t.ip, group: 0, compact: true, etichetta: decifra ? 'blocco cifrato' : 'blocco in chiaro', uscitaEtichetta: 'dopo IP', marks: segna(0, 4, 'info', segna(4, 8, 'warn')) }),
      p('L = ', m(r1.L), ' · R = ', m(r1.R))]);
    function roundEP(r, nome, nk, num) {
      add(num + ' · Round ' + (nk === n1 ? 1 : 2) + ': espandere R con E/P', [
        p('La funzione F lavora su 8 bit ma R ne ha 4: la tabella E/P = ', m('[' + SD.EP.join(', ') + ']'), ' li espande a 8, ripetendo alcuni bit.'),
        h(Permutazione, { ingresso: r.R, tabella: SD.EP, uscita: r.F.ep, group: 0, compact: true, etichetta: 'R', uscitaEtichetta: 'E/P(R)' })]);
      add((num + 1) + ' · Round ' + (nk === n1 ? 1 : 2) + ': XOR con ' + nk, [
        p('Si fa lo XOR bit a bit tra E/P(R) e la sottochiave ', m(nk), '.'),
        Bits('E/P(R)', r.F.ep, { group: 0, compact: true }),
        Bits(nk, r.chiave, { group: 0, compact: true }),
        Bits('risultato', r.F.xorChiave, { group: 0, compact: true, marks: segna(0, 4, 'info', segna(4, 8, 'warn')) }),
        p('I primi 4 bit ', m(r.F.s0In), ' vanno alla S-box S0, gli ultimi 4 ', m(r.F.s1In), ' alla S-box S1.')]);
      add((num + 2) + ' · Round ' + (nk === n1 ? 1 : 2) + ': le S-box S0 e S1', [
        p('Ogni S-box trasforma 4 bit in 2 bit con una tabella. ', RIGA_COL, '.'),
        h('div', { className: 'grid', style: { '--cols': 2 } },
          h(SdesSbox, { nome: 'S0', ingresso: r.F.s0In, sbox: r.F.s0 }),
          h(SdesSbox, { nome: 'S1', ingresso: r.F.s1In, sbox: r.F.s1 })),
        p('Uscite affiancate: ', m(r.F.s0.uscita), ' + ', m(r.F.s1.uscita), ' = ', m(r.F.uscitaS), '.')]);
      add((num + 3) + ' · Round ' + (nk === n1 ? 1 : 2) + ': P4 e XOR con L', [
        p('P4 = ', m('[' + SD.P4.join(', ') + ']'), ' rimescola i 4 bit; poi si fa XOR con ', m('L'), ': il risultato è la nuova metà sinistra. ', m('R'), ' non cambia.'),
        h(Permutazione, { ingresso: r.F.uscitaS, tabella: SD.P4, uscita: r.F.p4, group: 0, compact: true, etichetta: 'uscita S-box', uscitaEtichetta: 'F(R, ' + nk + ') = P4' }),
        Bits('L', r.L, { group: 0, compact: true }), Bits('F(R, ' + nk + ')', r.F.p4, { group: 0, compact: true }),
        Bits('L ⊕ F = nuova L', r.uscitaL, { group: 0, compact: true, marks: segna(0, 4, 'success') }),
        p('Uscita del round: ', m(r.uscitaL), ' + ', m(r.R), ' = ', m(r.uscita), '.')]);
    }
    roundEP(r1, 'round1', n1, 8);
    add('12 · SW: scambio delle due metà', [
      p('Tra il primo e il secondo round le due metà si scambiano: la destra diventa sinistra e viceversa.'),
      Bits('uscita round 1 (L | R)', r1.uscita, { group: 0, compact: true, marks: segna(0, 4, 'success') }),
      Bits('dopo SW (R | L)', t.sw, { group: 0, compact: true, marks: segna(4, 8, 'success') }),
      p('Nel secondo round ', m('L = ' + r2.L), ' e ', m('R = ' + r2.R), '.')]);
    roundEP(r2, 'round2', n2, 13);
    add('17 · Permutazione finale IP⁻¹', [
      p('Il secondo round dà ', m(r2.uscita), '. Dopo il round 2 ', h('b', null, 'non'), ' c\'è lo scambio. Si applica l\'inversa di IP, IP⁻¹ = ', m('[' + SD.IP_INV.join(', ') + ']'), '.'),
      h(Permutazione, { ingresso: t.preuscita, tabella: SD.IP_INV, uscita: t.output, group: 0, compact: true, etichetta: 'uscita round 2', uscitaEtichetta: decifra ? 'blocco in chiaro' : 'blocco cifrato', marks: segna(0, 8, 'success') }),
      h('div', { className: 'box success' }, h('div', { className: 'box-title' }, 'Risultato'),
        h('div', { className: 'box-body' }, m(t.ingresso), ' → ', m(t.output)))]);
    return passi;
  }

  /* ------------------------------------------------------------------- DES */

  // 48 bit in 8 gruppi da 6 (o 32 in 8 da 4)
  function Gruppi(label, bit, n, marks) { return Bits(label, bit, { group: n, compact: true, marks: marks }); }

  /* Un round DES in 6 passi. r = round della traccia, nome della sottochiave K{n}. */
  function desRoundPassi(r, opt) {
    opt = opt || {};
    var f = r.f, nk = 'K' + r.n, passi = [];
    function add(title, content) { passi.push({ title: title, content: h('div', { className: 'stack' }, content) }); }
    add('Ingresso del round ' + r.n, [
      p('Il blocco è diviso in due metà da 32 bit: ', m('L' + (r.n - 1)), ' e ', m('R' + (r.n - 1)), '. Per questo round serve la sottochiave ', m(nk), ' (48 bit).'),
      Gruppi('L' + (r.n - 1) + ' = ' + C.bitAHex(r.L), r.L, 4), Gruppi('R' + (r.n - 1) + ' = ' + C.bitAHex(r.R), r.R, 4), Gruppi(nk + ' = ' + C.bitAHex(r.K), r.K, 6)]);
    add('Espansione E: da 32 a 48 bit', [
      p('R è di 32 bit, la sottochiave di 48: la tabella E ripete i bit ai bordi di ogni gruppo da 4 e ottiene 8 gruppi da 6.'),
      Gruppi('R', r.R, 4), h(PermView, { ingresso: r.R, tabella: DT.E, riga: 12 }), Gruppi('E(R)', f.e, 6)]);
    add('XOR con la sottochiave ' + nk, [
      p('Lo XOR bit a bit tra E(R) e ', m(nk), ' dà 48 bit, divisi in 8 blocchi da 6: uno per ciascuna S-box.'),
      Gruppi('E(R)', f.e, 6), Gruppi(nk, r.K, 6), Gruppi('E(R) ⊕ ' + nk, f.xorChiave, 6)]);
    add('Le 8 S-box: da 6 a 4 bit', [
      p('Ogni blocco da 6 bit entra in una S-box: i bit ', h('b', { className: 't-warn' }, 'esterni'), ' (1° e 6°) scelgono la riga, i 4 bit ', h('b', { className: 't-info' }, 'interni'), ' scelgono la colonna. L\'uscita è un numero 0-15, cioè 4 bit.'),
      h('div', { className: 'grid sbox8', style: { '--cols': opt.colonneSbox || 4 } }, f.sbox.map(function (sb, i) { return h(DesSboxCard, { sbox: sb, indice: i, key: i, matrice: !!opt.matrici }); })),
      Gruppi('uscite concatenate (32 bit)', f.uscitaS, 4)]);
    add('Permutazione P (32 → 32)', [
      p('Le 32 uscite si rimescolano con la tabella P, così ogni S-box della round successiva riceve bit provenienti da più S-box.'),
      h(PermView, { ingresso: f.uscitaS, tabella: DT.P, riga: 16 }), Gruppi('f(R, ' + nk + ')', f.p, 4)]);
    add('XOR con L: la nuova R', [
      p('Il risultato di f si combina con ', m('L' + (r.n - 1)), ' tramite XOR e diventa ', m('R' + r.n), '. La vecchia ', m('R'), ' diventa la nuova ', m('L' + r.n), ' senza modifiche.'),
      Gruppi('L' + (r.n - 1), r.L, 4), Gruppi('f(R, ' + nk + ')', f.p, 4), Gruppi('R' + r.n + ' = L ⊕ f', r.nuovaR, 4, segna(0, 32, 'success')),
      p(m('L' + r.n + ' = ' + C.bitAHex(r.uscita.L)), ' · ', m('R' + r.n + ' = ' + C.bitAHex(r.uscita.R)))]);
    return passi;
  }

  /* Tabella compatta delle sottochiavi (K in gruppi da 6 bit). */
  function TabellaSottochiavi(sk, da, a) {
    return h(U.Table, {
      mono: true, head: ['n', 'shift', 'K (48 bit, gruppi da 6)', 'hex'],
      rows: sk.slice(da, a).map(function (k) { return [k.n, k.spostamento, raggruppa(k.k, 6), C.bitAHex(k.k)]; })
    });
  }

  window.VisteDES = {
    range: range, m: m, pesoUno: pesoUno, raggruppa: raggruppa, Bits: Bits, segna: segna,
    PermView: PermView, Permutazione: Permutazione, SboxMatrice: SboxMatrice, SdesSbox: SdesSbox,
    DesSboxCard: DesSboxCard, desRighe: desRighe,
    sdesPassi: sdesPassi, desRoundPassi: desRoundPassi, TabellaSottochiavi: TabellaSottochiavi
  };
})();
