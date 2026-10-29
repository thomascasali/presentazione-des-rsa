/* ==========================================================================
   crypto.js — motore crittografico didattico (JS puro, UMD).
   Browser: window.Cripto   Node: require('./assets/crypto.js')
   Nessuna dipendenza. Scopo didattico: NON usare per proteggere dati veri.

   Convenzioni
   - Funzioni "cifra" e "decifra" separate (cesare / cesareDecifra, ...).
   - Funzioni *Traccia: restituiscono i passi intermedi per i simulatori.
   - Bit = stringhe di '0' e '1' (es. '01110010'). Esadecimale = stringhe maiuscole.
   - Numeri RSA/aritmetica: accettano number | bigint | stringa numerica;
     mcd, euclideEsteso, inversoModulare, potenzaModulare restituiscono bigint se
     almeno un argomento è bigint, altrimenti number. Le funzioni rsa.* usano sempre bigint.
   ========================================================================== */
(function (radice, fabbrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabbrica();
  else radice.Cripto = fabbrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /* ------------------------------------------------------------------ testo */

  // Toglie gli accenti (à -> a) lasciando il resto.
  function senzaAccenti(testo) {
    return String(testo).normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  // Maiuscole A-Z senza accenti, tutto il resto scartato (spazi e punteggiatura compresi).
  function normalizza(testo) {
    return senzaAccenti(testo).toUpperCase().replace(/[^A-Z]/g, '');
  }

  function mod(n, m) { return ((n % m) + m) % m; }

  function spostaLettera(c, spostamento) {
    var code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCharCode(65 + mod(code - 65 + spostamento, 26));
    if (code >= 97 && code <= 122) return String.fromCharCode(97 + mod(code - 97 + spostamento, 26));
    return c;
  }
  function eLettera(c) {
    var code = c.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
  }
  function indiceLettera(c) { return c.toUpperCase().charCodeAt(0) - 65; }

  /* ----------------------------------------------------------------- Cesare */
  // Mantiene maiuscole/minuscole e lascia invariati i caratteri non alfabetici.

  function cesare(testo, chiave) {
    var k = Math.trunc(Number(chiave)), out = '';
    for (var c of String(testo)) out += spostaLettera(c, k);
    return out;
  }
  function cesareDecifra(testo, chiave) { return cesare(testo, -Math.trunc(Number(chiave))); }

  // Un elemento per carattere: { chiaro, cifrato, lettera, indiceChiaro, indiceCifrato }
  function cesareTraccia(testo, chiave) {
    var k = Math.trunc(Number(chiave)), out = [];
    for (var c of String(testo)) {
      var l = eLettera(c), cif = spostaLettera(c, k);
      out.push({
        chiaro: c, cifrato: cif, lettera: l,
        indiceChiaro: l ? indiceLettera(c) : null,
        indiceCifrato: l ? indiceLettera(cif) : null
      });
    }
    return out;
  }

  /* -------------------------------------------------- Cesare generalizzato */
  // E(x) = (a*x + b) mod 26,  D(y) = a^-1 * (y - b) mod 26

  var CHIAVI_A_VALIDE = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

  function controllaA(a) {
    if (mcd(a, 26) !== 1) throw new RangeError('a = ' + a + ' non è coprimo con 26: la cifratura non sarebbe invertibile');
  }
  function cesareGeneralizzato(testo, a, b) {
    a = Math.trunc(Number(a)); b = Math.trunc(Number(b)); controllaA(a);
    var out = '';
    for (var c of String(testo)) {
      if (!eLettera(c)) { out += c; continue; }
      var base = c === c.toUpperCase() ? 65 : 97;
      out += String.fromCharCode(base + mod(a * (c.charCodeAt(0) - base) + b, 26));
    }
    return out;
  }
  function cesareGeneralizzatoDecifra(testo, a, b) {
    a = Math.trunc(Number(a)); b = Math.trunc(Number(b)); controllaA(a);
    var ainv = inversoModulare(a, 26), out = '';
    for (var c of String(testo)) {
      if (!eLettera(c)) { out += c; continue; }
      var base = c === c.toUpperCase() ? 65 : 97;
      out += String.fromCharCode(base + mod(ainv * (c.charCodeAt(0) - base - b), 26));
    }
    return out;
  }
  // Un elemento per lettera: { chiaro, x, ax, assieme: ax+b, y, cifrato }
  function cesareGeneralizzatoTraccia(testo, a, b) {
    a = Math.trunc(Number(a)); b = Math.trunc(Number(b)); controllaA(a);
    var out = [];
    for (var c of String(testo)) {
      if (!eLettera(c)) { out.push({ chiaro: c, cifrato: c, lettera: false }); continue; }
      var x = indiceLettera(c), ax = a * x, s = ax + b, y = mod(s, 26);
      out.push({ chiaro: c, lettera: true, x: x, ax: ax, somma: s, y: y, cifrato: cesareGeneralizzato(c, a, b) });
    }
    return out;
  }

  /* --------------------------------------------------------------- Vigenère */
  // La chiave avanza solo sulle lettere; maiuscole/minuscole e simboli sono conservati.

  function chiaveVigenere(chiave) {
    var k = normalizza(chiave);
    if (!k.length) throw new RangeError('La chiave Vigenère deve contenere almeno una lettera');
    return k;
  }
  function vigenereTraccia(testo, chiave, decifra) {
    var k = chiaveVigenere(chiave), i = 0, out = [];
    for (var c of String(testo)) {
      if (!eLettera(c)) { out.push({ chiaro: c, cifrato: c, lettera: false }); continue; }
      var kl = k[i % k.length], sp = indiceLettera(kl) * (decifra ? -1 : 1);
      out.push({ chiaro: c, lettera: true, chiave: kl, spostamento: sp, cifrato: spostaLettera(c, sp) });
      i++;
    }
    return out;
  }
  function vigenere(testo, chiave) { return vigenereTraccia(testo, chiave, false).map(function (x) { return x.cifrato; }).join(''); }
  function vigenereDecifra(testo, chiave) { return vigenereTraccia(testo, chiave, true).map(function (x) { return x.cifrato; }).join(''); }

  /* ------------------------------------------------- Trasposizione a colonne */
  // Testo normalizzato (A-Z), scritto per righe in una griglia larga quanto la chiave,
  // completata con il carattere di riempimento (default 'X'); le colonne si leggono
  // nell'ordine alfabetico delle lettere della chiave (a parità, da sinistra a destra).

  function ordineColonne(chiave) {
    var k = chiaveVigenere(chiave);
    var idx = k.split('').map(function (l, i) { return { l: l, i: i }; });
    idx.sort(function (a, b) { return a.l < b.l ? -1 : a.l > b.l ? 1 : a.i - b.i; });
    return idx.map(function (x) { return x.i; });            // posizioni delle colonne in ordine di lettura
  }
  function trasposizioneGriglia(testo, chiave, riempimento) {
    var k = chiaveVigenere(chiave), n = k.length, pad = riempimento || 'X';
    var t = normalizza(testo);
    while (t.length % n !== 0 || t.length === 0) t += pad;
    var righe = [];
    for (var i = 0; i < t.length; i += n) righe.push(t.slice(i, i + n).split(''));
    var ordine = ordineColonne(k);
    var rango = new Array(n);                                // rango[col] = numero d'ordine (1-based)
    ordine.forEach(function (col, r) { rango[col] = r + 1; });
    var colonne = ordine.map(function (col) { return righe.map(function (r) { return r[col]; }).join(''); });
    return { chiave: k, larghezza: n, righe: righe, ordine: ordine, rango: rango, colonne: colonne, cifrato: colonne.join(''), testoNormalizzato: t };
  }
  function trasposizioneColonne(testo, chiave, riempimento) { return trasposizioneGriglia(testo, chiave, riempimento).cifrato; }
  // Restituisce il testo con il riempimento ancora in fondo.
  function trasposizioneColonneDecifra(cifrato, chiave) {
    var k = chiaveVigenere(chiave), n = k.length, t = normalizza(cifrato);
    if (t.length % n !== 0) throw new RangeError('Lunghezza del cifrato (' + t.length + ') non multipla della chiave (' + n + ')');
    var righeN = t.length / n, ordine = ordineColonne(k), griglia = [];
    for (var r = 0; r < righeN; r++) griglia.push(new Array(n));
    ordine.forEach(function (col, pos) {
      for (var r2 = 0; r2 < righeN; r2++) griglia[r2][col] = t[pos * righeN + r2];
    });
    return griglia.map(function (r3) { return r3.join(''); }).join('');
  }

  /* --------------------------------------------------- Frequenze e attacchi */
  // Frequenze percentuali approssimate delle lettere in italiano.
  var FREQ_IT = {
    A: 11.74, B: 0.92, C: 4.50, D: 3.73, E: 11.79, F: 0.95, G: 1.64, H: 1.54, I: 11.28, J: 0.01,
    K: 0.01, L: 6.51, M: 2.51, N: 6.88, O: 9.83, P: 3.05, Q: 0.51, R: 6.37, S: 4.98, T: 5.62,
    U: 3.01, V: 2.10, W: 0.01, X: 0.01, Y: 0.01, Z: 0.49
  };

  // { conteggi:[26], totale, percentuali:[26] } sulle sole lettere A-Z (accenti tolti).
  function frequenze(testo) {
    var t = normalizza(testo), conteggi = new Array(26).fill(0);
    for (var i = 0; i < t.length; i++) conteggi[t.charCodeAt(i) - 65]++;
    var tot = t.length;
    return { conteggi: conteggi, totale: tot, percentuali: conteggi.map(function (c) { return tot ? 100 * c / tot : 0; }) };
  }
  // Chi-quadro rispetto all'italiano: più basso = più simile a una frase italiana.
  function punteggioItaliano(testo) {
    var f = frequenze(testo);
    if (!f.totale) return Infinity;
    var s = 0;
    for (var i = 0; i < 26; i++) {
      var atteso = FREQ_IT[ALFABETO[i]] * f.totale / 100;
      s += Math.pow(f.conteggi[i] - atteso, 2) / atteso;
    }
    return s;
  }
  // Prova le 25 chiavi 1..25. Elementi: { chiave, testo, punteggio }, in ordine di chiave.
  function forzaBruta(cifrato) {
    var out = [];
    for (var k = 1; k <= 25; k++) {
      var t = cesareDecifra(cifrato, k);
      out.push({ chiave: k, testo: t, punteggio: punteggioItaliano(t) });
    }
    return out;
  }
  // La chiave Cesare più probabile (chi-quadro minimo). Affidabile solo su testi non troppo corti.
  function indovinaChiaveCesare(cifrato) {
    var l = forzaBruta(cifrato), m = l[0];
    l.forEach(function (x) { if (x.punteggio < m.punteggio) m = x; });
    return m;
  }
  // Indice di coincidenza: ~0,074 per l'italiano, ~0,038 per testo casuale.
  function indiceCoincidenza(testo) {
    var f = frequenze(testo), n = f.totale;
    if (n < 2) return 0;
    var s = 0;
    f.conteggi.forEach(function (c) { s += c * (c - 1); });
    return s / (n * (n - 1));
  }
  // Sequenze ripetute (>= lunghezzaMin) nel cifrato: [{ sequenza, posizioni, distanze, fattori }]
  function kasiski(cifrato, lunghezzaMin) {
    var t = normalizza(cifrato), L = lunghezzaMin || 3, viste = {}, out = [];
    for (var i = 0; i + L <= t.length; i++) {
      var s = t.substr(i, L);
      (viste[s] = viste[s] || []).push(i);
    }
    Object.keys(viste).forEach(function (s) {
      var p = viste[s];
      if (p.length < 2) return;
      var distanze = [], fattori = {};
      for (var j = 1; j < p.length; j++) distanze.push(p[j] - p[0]);
      distanze.forEach(function (d) { for (var f = 2; f <= Math.min(20, d); f++) if (d % f === 0) fattori[f] = (fattori[f] || 0) + 1; });
      out.push({ sequenza: s, posizioni: p, distanze: distanze, fattori: fattori });
    });
    out.sort(function (a, b) { return b.posizioni.length - a.posizioni.length || a.posizioni[0] - b.posizioni[0]; });
    return out;
  }

  /* ----------------------------------------------------- bit, hex, testo, XOR */

  function testoABit(testo) {
    var bytes = new TextEncoder().encode(String(testo)), o = '';
    bytes.forEach(function (b) { o += b.toString(2).padStart(8, '0'); });
    return o;
  }
  function bitATesto(bit) {
    var b = [];
    for (var i = 0; i + 8 <= bit.length; i += 8) b.push(parseInt(bit.substr(i, 8), 2));
    return new TextDecoder().decode(new Uint8Array(b));
  }
  function hexABit(hex) {
    var o = '';
    String(hex).replace(/\s+/g, '').split('').forEach(function (h) { o += parseInt(h, 16).toString(2).padStart(4, '0'); });
    return o;
  }
  function bitAHex(bit) {
    var o = '';
    for (var i = 0; i < bit.length; i += 4) o += parseInt(bit.substr(i, 4).padEnd(4, '0'), 2).toString(16).toUpperCase();
    return o;
  }
  function testoAHex(testo) { return bitAHex(testoABit(testo)); }
  function hexATesto(hex) { return bitATesto(hexABit(hex)); }

  // XOR bit a bit di due stringhe di bit della stessa lunghezza.
  function xor(a, b) {
    if (a.length !== b.length) throw new RangeError('XOR: lunghezze diverse (' + a.length + ' e ' + b.length + ')');
    var o = '';
    for (var i = 0; i < a.length; i++) o += a[i] === b[i] ? '0' : '1';
    return o;
  }
  // XOR di un messaggio (bit) con una chiave (bit) ripetuta ciclicamente.
  function xorCiclico(messaggio, chiave) {
    var k = '';
    while (k.length < messaggio.length) k += chiave;
    return xor(messaggio, k.slice(0, messaggio.length));
  }

  /* ---------------------------------------------------------- permutazioni */

  function perm(bit, tabella) { var o = ''; for (var i = 0; i < tabella.length; i++) o += bit[tabella[i] - 1]; return o; }
  function ruotaSx(bit, n) { n = n % bit.length; return bit.slice(n) + bit.slice(0, n); }

  /* ------------------------------------------------------------------ S-DES */
  // Simplified DES di Stallings: blocco 8 bit, chiave 10 bit, 2 round.
  // Numerazione dei bit da 1, come nel libro.

  var SDES = {
    P10: [3, 5, 2, 7, 4, 10, 1, 9, 8, 6],
    P8: [6, 3, 7, 4, 8, 5, 10, 9],
    IP: [2, 6, 3, 1, 4, 8, 5, 7],
    IP_INV: [4, 1, 3, 5, 7, 2, 8, 6],
    EP: [4, 1, 2, 3, 2, 3, 4, 1],
    P4: [2, 4, 3, 1],
    S0: [[1, 0, 3, 2], [3, 2, 1, 0], [0, 2, 1, 3], [3, 1, 3, 2]],
    S1: [[0, 1, 2, 3], [2, 0, 1, 3], [3, 0, 1, 0], [2, 1, 0, 3]]
  };

  function controllaBit(s, n, nome) {
    if (!new RegExp('^[01]{' + n + '}$').test(s)) throw new RangeError(nome + ' deve essere di ' + n + ' bit (0/1)');
  }
  // { p10, sinistra, destra, ls1:{c,d}, k1, ls2:{c,d}, k2 }
  function sdesChiavi(chiave) {
    controllaBit(chiave, 10, 'La chiave S-DES');
    var p10 = perm(chiave, SDES.P10), c = p10.slice(0, 5), d = p10.slice(5);
    var c1 = ruotaSx(c, 1), d1 = ruotaSx(d, 1), k1 = perm(c1 + d1, SDES.P8);
    var c2 = ruotaSx(c1, 2), d2 = ruotaSx(d1, 2), k2 = perm(c2 + d2, SDES.P8);
    return { chiave: chiave, p10: p10, c0: c, d0: d, ls1: c1 + d1, k1: k1, ls2: c2 + d2, k2: k2 };
  }
  function sdesSbox(S, quattro) {
    var riga = parseInt(quattro[0] + quattro[3], 2), col = parseInt(quattro[1] + quattro[2], 2);
    return { riga: riga, colonna: col, valore: S[riga][col], uscita: S[riga][col].toString(2).padStart(2, '0') };
  }
  // Funzione F(R, K): { ep, xorChiave, s0, s1, s0In, s1In, uscitaS, p4 }
  function sdesF(R, K) {
    var ep = perm(R, SDES.EP), x = xor(ep, K);
    var s0 = sdesSbox(SDES.S0, x.slice(0, 4)), s1 = sdesSbox(SDES.S1, x.slice(4));
    var us = s0.uscita + s1.uscita;
    return { R: R, K: K, ep: ep, xorChiave: x, s0In: x.slice(0, 4), s1In: x.slice(4), s0: s0, s1: s1, uscitaS: us, p4: perm(us, SDES.P4) };
  }
  // Passi completi: { output, chiavi, ip, round1:{L,R,F,nuovaL}, sw, round2:{...}, preuscita, ipInv }
  function sdesTraccia(blocco, chiave, decifra) {
    controllaBit(blocco, 8, 'Il blocco S-DES');
    var ch = sdesChiavi(chiave), ka = decifra ? ch.k2 : ch.k1, kb = decifra ? ch.k1 : ch.k2;
    var ip = perm(blocco, SDES.IP), L = ip.slice(0, 4), R = ip.slice(4);
    var f1 = sdesF(R, ka), L1 = xor(L, f1.p4);
    var round1 = { chiave: ka, L: L, R: R, F: f1, uscitaL: L1, uscita: L1 + R };
    var sw = R + L1;                                          // scambio dei due semiblocchi
    var L2 = sw.slice(0, 4), R2 = sw.slice(4);
    var f2 = sdesF(R2, kb), L3 = xor(L2, f2.p4);
    var round2 = { chiave: kb, L: L2, R: R2, F: f2, uscitaL: L3, uscita: L3 + R2 };
    var pre = L3 + R2;
    return { ingresso: blocco, chiavi: ch, ip: ip, round1: round1, sw: sw, round2: round2, preuscita: pre, ipInv: perm(pre, SDES.IP_INV), output: perm(pre, SDES.IP_INV) };
  }
  function sdesCifra(blocco, chiave) { return sdesTraccia(blocco, chiave, false).output; }
  function sdesDecifra(blocco, chiave) { return sdesTraccia(blocco, chiave, true).output; }

  /* -------------------------------------------------------------------- DES */

  var DES = {
    IP: [58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
         57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7],
    FP: [40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
         36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25],
    E: [32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17,
        16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1],
    P: [16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25],
    PC1: [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
          63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4],
    PC2: [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2,
          41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32],
    SHIFT: [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    S: [
      [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7, 0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8,
       4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0, 15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
      [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10, 3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5,
       0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15, 13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
      [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8, 13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1,
       13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7, 1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
      [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15, 13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9,
       10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4, 3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
      [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9, 14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6,
       4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14, 11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
      [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11, 10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8,
       9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6, 4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
      [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1, 13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6,
       1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2, 6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
      [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7, 1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2,
       7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8, 2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
    ]
  };

  function controllaHex(h, n, nome) {
    if (!new RegExp('^[0-9a-fA-F]{' + n + '}$').test(h)) throw new RangeError(nome + ' deve essere di ' + n + ' cifre esadecimali');
  }
  // 16 sottochiavi: [{ n, c, d, cd, k }] (stringhe di bit; k = 48 bit). Pure PC1 in .pc1.
  function desSottochiavi(chiaveHex) {
    controllaHex(chiaveHex, 16, 'La chiave DES');
    var pc1 = perm(hexABit(chiaveHex), DES.PC1), c = pc1.slice(0, 28), d = pc1.slice(28), out = [];
    for (var r = 0; r < 16; r++) {
      c = ruotaSx(c, DES.SHIFT[r]); d = ruotaSx(d, DES.SHIFT[r]);
      out.push({ n: r + 1, spostamento: DES.SHIFT[r], c: c, d: d, k: perm(c + d, DES.PC2) });
    }
    out.pc1 = pc1;
    return out;
  }
  // Funzione f(R, K): { e, xorChiave, sbox:[{ ingresso, riga, colonna, valore, uscita }x8], uscitaS, p }
  function desF(R, K) {
    var e = perm(R, DES.E), x = xor(e, K), sb = [], us = '';
    for (var i = 0; i < 8; i++) {
      var sei = x.substr(i * 6, 6), riga = parseInt(sei[0] + sei[5], 2), col = parseInt(sei.slice(1, 5), 2);
      var val = DES.S[i][riga * 16 + col], u = val.toString(2).padStart(4, '0');
      sb.push({ ingresso: sei, riga: riga, colonna: col, valore: val, uscita: u });
      us += u;
    }
    return { R: R, K: K, e: e, xorChiave: x, sbox: sb, uscitaS: us, p: perm(us, DES.P) };
  }
  // Traccia completa di un blocco da 64 bit:
  // { ingresso, chiave, sottochiavi, ip, L0, R0, round:[{ n, L, R, K, f, nuovaR, uscita:{L,R} }x16],
  //   preuscita (R16 L16), fp, output (hex) }
  function desTraccia(bloccoHex, chiaveHex, decifra) {
    controllaHex(bloccoHex, 16, 'Il blocco DES');
    var sk = desSottochiavi(chiaveHex), ip = perm(hexABit(bloccoHex), DES.IP);
    var L = ip.slice(0, 32), R = ip.slice(32), round = [];
    for (var r = 1; r <= 16; r++) {
      var K = decifra ? sk[16 - r].k : sk[r - 1].k, f = desF(R, K), nuovaR = xor(L, f.p);
      round.push({ n: r, L: L, R: R, K: K, f: f, nuovaR: nuovaR, uscita: { L: R, R: nuovaR } });
      L = R; R = nuovaR;
    }
    var pre = R + L, fp = perm(pre, DES.FP);
    return {
      ingresso: bloccoHex.toUpperCase(), chiave: chiaveHex.toUpperCase(), decifra: !!decifra, sottochiavi: sk,
      ip: ip, L0: ip.slice(0, 32), R0: ip.slice(32), round: round, preuscita: pre, fp: fp, output: bitAHex(fp)
    };
  }
  function desCifra(bloccoHex, chiaveHex) { return desTraccia(bloccoHex, chiaveHex, false).output; }
  function desDecifra(bloccoHex, chiaveHex) { return desTraccia(bloccoHex, chiaveHex, true).output; }
  // Triple DES in modalità EDE (cifra K1, decifra K2, cifra K3). Con K1=K2=K3 equivale al DES singolo.
  function tripleDesCifra(bloccoHex, k1, k2, k3) { return desCifra(desDecifra(desCifra(bloccoHex, k1), k2), k3); }
  function tripleDesDecifra(bloccoHex, k1, k2, k3) { return desDecifra(desCifra(desDecifra(bloccoHex, k3), k2), k1); }

  /* -------------------------------------------------------------------- ECB */
  // ECB su DES (dati e chiave in esadecimale) o S-DES (dati e chiave in bit).
  // opzioni: { cifrario:'des'|'sdes' (default des), decifra:false, padding:true }
  // Padding PKCS#7 sul DES (byte), zeri sull'S-DES. Restituisce { output, blocchi:[{ ingresso, uscita }] }.
  function ecb(dati, chiave, opzioni) {
    var o = opzioni || {}, sdes = o.cifrario === 'sdes', dim = sdes ? 8 : 16;
    var pad = o.padding !== false, d = sdes ? String(dati) : String(dati).replace(/\s+/g, '').toUpperCase();
    if (!o.decifra && pad) {
      if (sdes) { while (d.length % 8) d += '0'; }
      else {
        var mancanti = 8 - (d.length / 2) % 8, byte = ('0' + mancanti.toString(16)).slice(-2).toUpperCase();
        for (var i = 0; i < mancanti; i++) d += byte;
      }
    }
    if (d.length % dim !== 0) throw new RangeError('I dati non sono multipli del blocco (' + dim + ' simboli)');
    var blocchi = [], out = '';
    for (var p = 0; p < d.length; p += dim) {
      var b = d.substr(p, dim);
      var u = sdes ? (o.decifra ? sdesDecifra(b, chiave) : sdesCifra(b, chiave))
                   : (o.decifra ? desDecifra(b, chiave) : desCifra(b, chiave));
      blocchi.push({ ingresso: b, uscita: u }); out += u;
    }
    if (o.decifra && pad && !sdes) {
      var n = parseInt(out.slice(-2), 16);
      if (n >= 1 && n <= 8 && out.slice(-2 * n) === out.slice(-2).repeat(n)) out = out.slice(0, out.length - 2 * n);
    }
    return { output: out, blocchi: blocchi };
  }

  /* ------------------------------------------------- aritmetica modulare */

  function big(x) { return typeof x === 'bigint' ? x : BigInt(x); }
  function risultato(v, usaBig) { return usaBig ? v : Number(v); }
  function haBig() { for (var i = 0; i < arguments.length; i++) if (typeof arguments[i] === 'bigint') return true; return false; }
  function modB(a, m) { return ((a % m) + m) % m; }

  function mcd(a, b) {
    var ub = haBig(a, b), x = big(a), y = big(b);
    if (x < 0n) x = -x;
    if (y < 0n) y = -y;
    while (y) { var t = x % y; x = y; y = t; }
    return risultato(x, ub);
  }
  // Algoritmo di Euclide esteso: { mcd, x, y } con a*x + b*y = mcd, più la tabella dei passi:
  // passi = [{ i, q, r, s, t }] dove r_i = r_(i-2) - q*r_(i-1), r_i = a*s_i + b*t_i.
  function euclideEsteso(a, b) {
    var ub = haBig(a, b), r0 = big(a), r1 = big(b), s0 = 1n, s1 = 0n, t0 = 0n, t1 = 1n;
    var passi = [{ i: 0, q: null, r: r0, s: s0, t: t0 }, { i: 1, q: null, r: r1, s: s1, t: t1 }], i = 1;
    while (r1 !== 0n) {
      var q = r0 / r1, r2 = r0 - q * r1, s2 = s0 - q * s1, t2 = t0 - q * t1;
      i++;
      passi.push({ i: i, q: q, r: r2, s: s2, t: t2 });
      r0 = r1; r1 = r2; s0 = s1; s1 = s2; t0 = t1; t1 = t2;
    }
    var c = function (v) { return risultato(v, ub); };
    return {
      mcd: c(r0), x: c(s0), y: c(t0),
      passi: passi.map(function (p) { return { i: p.i, q: p.q === null ? null : c(p.q), r: c(p.r), s: c(p.s), t: c(p.t) }; })
    };
  }
  // Inverso di a modulo m (null se non esiste).
  function inversoModulare(a, m) {
    var ub = haBig(a, m), M = big(m), e = euclideEsteso(modB(big(a), M), M);
    if (big(e.mcd) !== 1n) return null;
    return risultato(modB(big(e.x), M), ub);
  }
  // base^esp mod mod con square-and-multiply.
  function potenzaModulare(base, esp, modulo) {
    var ub = haBig(base, esp, modulo), m = big(modulo), b = modB(big(base), m), e = big(esp), r = 1n % m;
    while (e > 0n) {
      if (e & 1n) r = (r * b) % m;
      b = (b * b) % m; e >>= 1n;
    }
    return risultato(r, ub);
  }
  // Traccia square-and-multiply, scorrendo i bit dell'esponente da sinistra a destra.
  // { risultato, esponenteBinario, passi:[{ bit, dopoQuadrato, moltiplica, valore }] }
  function potenzaModularePassi(base, esp, modulo) {
    var ub = haBig(base, esp, modulo), m = big(modulo), b = modB(big(base), m), e = big(esp);
    var bin = e.toString(2), r = 1n % m, passi = [];
    for (var i = 0; i < bin.length; i++) {
      r = (r * r) % m;
      var dq = r, mol = bin[i] === '1';
      if (mol) r = (r * b) % m;
      passi.push({ bit: bin[i], dopoQuadrato: risultato(dq, ub), moltiplica: mol, valore: risultato(r, ub) });
    }
    return { risultato: risultato(r, ub), esponenteBinario: bin, passi: passi };
  }
  // Primalità: divisione per tentativi sui piccoli, Miller-Rabin deterministico oltre (esatto fino a 3,3e24).
  function isPrimo(n) {
    var N = big(n);
    if (N < 2n) return false;
    var piccoli = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
    for (var i = 0; i < piccoli.length; i++) { if (N === piccoli[i]) return true; if (N % piccoli[i] === 0n) return false; }
    var d = N - 1n, s = 0;
    while ((d & 1n) === 0n) { d >>= 1n; s++; }
    for (var j = 0; j < piccoli.length; j++) {
      var x = potenzaModulare(piccoli[j], d, N);
      if (x === 1n || x === N - 1n) continue;
      var comp = true;
      for (var r = 1; r < s; r++) { x = (x * x) % N; if (x === N - 1n) { comp = false; break; } }
      if (comp) return false;
    }
    return true;
  }
  // Fattorizzazione ingenua per tentativi (per far vedere quanto è lenta): { fattori, tentativi }.
  function fattorizza(n) {
    var N = big(n), f = [], t = 0, d = 2n;
    while (d * d <= N) {
      t++;
      if (N % d === 0n) { f.push(d); N /= d; } else d += d === 2n ? 1n : 2n;
    }
    if (N > 1n) f.push(N);
    return { fattori: f, tentativi: t };
  }

  /* -------------------------------------------------------------------- RSA */
  // Sempre con BigInt. Esempio da manuale: genera(61, 53, 17) -> n=3233, phi=3120, d=2753.

  var rsa = {
    // { p, q, n, phi, e, d, pub:{e,n}, priv:{d,n}, euclide } oppure RangeError con messaggio in italiano.
    genera: function (p, q, e) {
      var P = big(p), Q = big(q), E = big(e);
      if (!isPrimo(P)) throw new RangeError(P + ' non è primo');
      if (!isPrimo(Q)) throw new RangeError(Q + ' non è primo');
      if (P === Q) throw new RangeError('p e q devono essere diversi');
      var n = P * Q, phi = (P - 1n) * (Q - 1n);
      if (E <= 1n || E >= phi) throw new RangeError('e deve stare tra 1 e φ(n) = ' + phi + ' (esclusi)');
      if (mcd(E, phi) !== 1n) throw new RangeError('e = ' + E + ' non è coprimo con φ(n) = ' + phi);
      var eu = euclideEsteso(E, phi), d = modB(eu.x, phi);
      return { p: P, q: Q, n: n, phi: phi, e: E, d: d, pub: { e: E, n: n }, priv: { d: d, n: n }, euclide: eu };
    },
    cifra: function (m, pub) {
      var M = big(m);
      if (M < 0n || M >= big(pub.n)) throw new RangeError('Il messaggio deve essere minore di n = ' + pub.n);
      return potenzaModulare(M, big(pub.e), big(pub.n));
    },
    decifra: function (c, priv) { return potenzaModulare(big(c), big(priv.d), big(priv.n)); },
    // Firma: stessa operazione della decifratura, con la chiave privata.
    firma: function (m, priv) { return potenzaModulare(big(m), big(priv.d), big(priv.n)); },
    // Verifica: la firma elevata a e (chiave pubblica) deve restituire il messaggio.
    verifica: function (firma, m, pub) { return potenzaModulare(big(firma), big(pub.e), big(pub.n)) === big(m); }
  };

  /* ------------------------------------------------------------- esportazione */

  return {
    ALFABETO: ALFABETO, FREQ_IT: FREQ_IT, CHIAVI_A_VALIDE: CHIAVI_A_VALIDE,
    senzaAccenti: senzaAccenti, normalizza: normalizza,
    cesare: cesare, cesareDecifra: cesareDecifra, cesareTraccia: cesareTraccia,
    cesareGeneralizzato: cesareGeneralizzato, cesareGeneralizzatoDecifra: cesareGeneralizzatoDecifra,
    cesareGeneralizzatoTraccia: cesareGeneralizzatoTraccia,
    vigenere: vigenere, vigenereDecifra: vigenereDecifra, vigenereTraccia: vigenereTraccia,
    trasposizioneColonne: trasposizioneColonne, trasposizioneColonneDecifra: trasposizioneColonneDecifra,
    trasposizioneGriglia: trasposizioneGriglia,
    frequenze: frequenze, punteggioItaliano: punteggioItaliano, forzaBruta: forzaBruta,
    indovinaChiaveCesare: indovinaChiaveCesare, indiceCoincidenza: indiceCoincidenza, kasiski: kasiski,
    testoABit: testoABit, bitATesto: bitATesto, hexABit: hexABit, bitAHex: bitAHex, testoAHex: testoAHex, hexATesto: hexATesto,
    xor: xor, xorCiclico: xorCiclico,
    sdes: { tabelle: SDES, chiavi: sdesChiavi, F: sdesF, cifra: sdesCifra, decifra: sdesDecifra, traccia: sdesTraccia },
    des: { tabelle: DES, sottochiavi: desSottochiavi, F: desF, cifra: desCifra, decifra: desDecifra, traccia: desTraccia,
           tripleCifra: tripleDesCifra, tripleDecifra: tripleDesDecifra },
    ecb: ecb,
    mcd: mcd, euclideEsteso: euclideEsteso, inversoModulare: inversoModulare,
    potenzaModulare: potenzaModulare, potenzaModularePassi: potenzaModularePassi,
    isPrimo: isPrimo, fattorizza: fattorizza,
    rsa: rsa
  };
});
