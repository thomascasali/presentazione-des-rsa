/* rsa-ui.js — funzioni di supporto del modulo 8 (JS puro, funziona da file://).
   Richiede assets/crypto.js. Espone window.RsaUI. Tutta l'aritmetica passa da window.Cripto.rsa. */
(function () {
  'use strict';
  var C = window.Cripto;

  var PRIMI = (function () { var l = []; for (var i = 2; i < 400; i++) if (C.isPrimo(i)) l.push(i); return l; })();

  function casuale(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function primoCasuale(min, max, escludi) {
    var l = PRIMI.filter(function (p) { return p >= min && p <= max && p !== escludi; });
    return l[casuale(0, l.length - 1)];
  }
  // Esponenti pubblici candidati: i primi piccoli coprimi con phi e minori di phi.
  function esponentiValidi(phi) {
    var P = BigInt(phi);
    return PRIMI.filter(function (e) { return BigInt(e) < P && C.mcd(BigInt(e), P) === 1n; });
  }
  // Coppia casuale per il gioco di classe: primi tra 11 e 97, e piccolo.
  function coppiaCasuale() {
    for (var tent = 0; tent < 200; tent++) {
      var p = primoCasuale(11, 97), q = primoCasuale(11, 97, p);
      var phi = (p - 1) * (q - 1), es = esponentiValidi(phi).filter(function (e) { return e > 2 && e < 40; });
      if (!es.length) continue;
      return C.rsa.genera(p, q, es[casuale(0, Math.min(es.length - 1, 5))]);
    }
    return C.rsa.genera(61, 53, 17);
  }

  /* Testo <-> numeri: A=01 ... Z=26, due cifre per lettera.
     Blocchi di L lettere: servono blocchi minori di n. Con n piccolo L vale 1 (sostituzione semplice!). */
  function lettereBlocco(n) {
    var N = BigInt(n);
    if (N <= 26n) return 0;
    var L = 1;
    while (L < 8 && BigInt('26'.repeat(L + 1)) < N) L++;
    return L;
  }
  function codificaTesto(testo, n) {
    var L = lettereBlocco(n);
    if (!L) return null;
    var s = C.normalizza(testo).replace(/[^A-Z]/g, '');
    var blocchi = [], cifre = [];
    for (var i = 0; i < s.length; i += L) {
      var b = s.slice(i, i + L), d = '';
      for (var j = 0; j < b.length; j++) d += ('0' + (b.charCodeAt(j) - 64)).slice(-2);
      cifre.push(d);
      blocchi.push(BigInt(d));
    }
    return { L: L, lettere: s, blocchi: blocchi, cifre: cifre };
  }
  function decodificaBlocchi(blocchi, L) {
    var out = '';
    blocchi.forEach(function (b) {
      var d = BigInt(b).toString();
      while (d.length < 2 * L) d = '0' + d;
      if (d.length > 2 * L) { out += '?'; return; }
      for (var i = 0; i < d.length; i += 2) {
        var v = parseInt(d.slice(i, i + 2), 10);
        out += v >= 1 && v <= 26 ? String.fromCharCode(64 + v) : (v === 0 ? '' : '?');
      }
    });
    return out;
  }
  // Lista di numeri da una stringa ("12 345, 67" -> [12n, 345n, 67n]); null se qualcosa non va.
  function listaNumeri(s) {
    var parti = String(s || '').split(/[\s,;]+/).filter(Boolean);
    if (!parti.length) return null;
    var out = [];
    for (var i = 0; i < parti.length; i++) { if (!/^\d{1,40}$/.test(parti[i])) return null; out.push(BigInt(parti[i])); }
    return out;
  }
  // Primo >= x.
  function prossimoPrimo(x) { var n = BigInt(x); while (!C.isPrimo(n)) n++; return n; }

  window.RsaUI = { PRIMI: PRIMI, casuale: casuale, primoCasuale: primoCasuale, esponentiValidi: esponentiValidi,
    coppiaCasuale: coppiaCasuale, lettereBlocco: lettereBlocco, codificaTesto: codificaTesto, decodificaBlocchi: decodificaBlocchi,
    listaNumeri: listaNumeri, prossimoPrimo: prossimoPrimo };
})();
