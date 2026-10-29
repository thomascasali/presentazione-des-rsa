// Test del motore crittografico. Esecuzione:  node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../assets/crypto.js');

test('Cesare: vettori e round-trip', () => {
  assert.equal(C.cesare('ATTACCO', 3), 'DWWDFFR');
  assert.equal(C.cesare('Ciao, Mondo!', 3), 'Fldr, Prqgr!');
  assert.equal(C.cesare('xyz', 3), 'abc');
  assert.equal(C.cesareDecifra('DWWDFFR', 3), 'ATTACCO');
  assert.equal(C.cesare('Città è', 5), 'Hnyyà è'); // lettere accentate invariate
  for (let k = -30; k <= 30; k++) {
    const m = 'Domani, alle 8:30, verifica di Sistemi e Reti!';
    assert.equal(C.cesareDecifra(C.cesare(m, k), k), m);
  }
  assert.equal(C.cesare('Abc', 26), 'Abc');
  const t = C.cesareTraccia('Ab,', 3);
  assert.equal(t.length, 3);
  assert.deepEqual([t[0].cifrato, t[1].cifrato, t[2].cifrato], ['D', 'e', ',']);
  assert.equal(t[0].indiceChiaro, 0); assert.equal(t[0].indiceCifrato, 3); assert.equal(t[2].lettera, false);
});

test('Cesare generalizzato: affine, round-trip, chiavi non valide', () => {
  assert.equal(C.cesareGeneralizzato('HELLO', 5, 8), 'RCLLA');           // esempio classico a=5 b=8
  assert.equal(C.cesareGeneralizzatoDecifra('RCLLA', 5, 8), 'HELLO');
  assert.equal(C.cesareGeneralizzato('ABC', 1, 3), C.cesare('ABC', 3));
  assert.throws(() => C.cesareGeneralizzato('ABC', 2, 3), RangeError);
  assert.throws(() => C.cesareGeneralizzato('ABC', 13, 3), RangeError);
  for (const a of C.CHIAVI_A_VALIDE) {
    for (const b of [0, 1, 7, 25]) {
      const m = 'Verifica di Sistemi, Reti e Crittografia.';
      assert.equal(C.cesareGeneralizzatoDecifra(C.cesareGeneralizzato(m, a, b), a, b), m);
    }
  }
  assert.equal(C.CHIAVI_A_VALIDE.length, 12);
  const t = C.cesareGeneralizzatoTraccia('H', 5, 8)[0];
  assert.deepEqual([t.x, t.ax, t.somma, t.y, t.cifrato], [7, 35, 43, 17, 'R']);
});

test('Vigenère: vettori e round-trip', () => {
  assert.equal(C.vigenere('ATTACKATDAWN', 'LEMON'), 'LXFOPVEFRNHR');   // esempio classico
  assert.equal(C.vigenereDecifra('LXFOPVEFRNHR', 'LEMON'), 'ATTACKATDAWN');
  assert.equal(C.vigenere('Attacco all\'alba', 'LIMONE').length, 'Attacco all\'alba'.length);
  const m = 'Il Cifrario di Vigenère, 1586: resistette per secoli!';
  assert.equal(C.vigenereDecifra(C.vigenere(m, 'chiave'), 'chiave'), m);
  assert.throws(() => C.vigenere('abc', '123'), RangeError);
  const tr = C.vigenereTraccia('AB', 'BC');
  assert.deepEqual(tr.map(x => x.cifrato), ['B', 'D']);
});

test('Trasposizione a colonne: cifra, decifra, padding', () => {
  const g = C.trasposizioneGriglia('WE ARE DISCOVERED FLEE AT ONCE', 'ZEBRAS');
  assert.equal(g.testoNormalizzato, 'WEAREDISCOVEREDFLEEATONCEXXXXX');   // 25 lettere + 5 di riempimento
  assert.equal(C.trasposizioneColonne('ABCDEF', 'CAB'), 'BECFAD');         // calcolato a mano
  assert.equal(C.trasposizioneColonne('HELLOWORLD', 'CAB'), 'EORXLWLXHLOD');
  assert.equal(g.larghezza, 6);
  assert.equal(g.righe.length * 6, g.testoNormalizzato.length);
  assert.deepEqual(g.rango, [6, 3, 2, 4, 1, 5]);                       // ZEBRAS: A=1 B=2 E=3 R=4 S=5 Z=6
  assert.equal(g.ordine.join(), '4,2,1,3,5,0');                        // colonne lette: A(4), B(2), E(1), R(3), S(5), Z(0)
  // padding con X
  assert.equal(C.trasposizioneColonne('ABCDE', 'CAB'), C.trasposizioneColonne('ABCDEX', 'CAB'));
  assert.equal(C.trasposizioneColonneDecifra(C.trasposizioneColonne('ABCDE', 'CAB'), 'CAB'), 'ABCDEX');
  // round-trip su testo con lunghezza multipla e non
  for (const [t, k] of [['ATTACCOALLALBA', 'LUNA'], ['CIAOMONDO', 'SOLE'], ['A', 'XYZ'], ['Verifica di Sistemi e Reti', 'RETI']]) {
    const dec = C.trasposizioneColonneDecifra(C.trasposizioneColonne(t, k), k);
    const norm = C.normalizza(t);
    assert.ok(dec.startsWith(norm), `${t}/${k}: ${dec}`);
    assert.ok(/^X*$/.test(dec.slice(norm.length)));
    assert.equal(dec.length % k.length, 0);
  }
  assert.equal(C.trasposizioneGriglia('ATTACCO', 'ABC').cifrato.length, 9);
  assert.throws(() => C.trasposizioneColonneDecifra('ABCDE', 'AB'), RangeError);
});

test('Frequenze, forza bruta, analisi', () => {
  const f = C.frequenze('Ciao àA!');
  assert.equal(f.totale, 6);                                            // C I A O A A (la à diventa a)
  assert.equal(f.conteggi[0], 3);
  const testo = 'La crittografia serve a proteggere le informazioni che viaggiano in rete e consente di verificare che un messaggio non sia stato modificato';
  const cif = C.cesare(testo, 7);
  const fb = C.forzaBruta(cif);
  assert.equal(fb.length, 25);
  assert.equal(fb[6].chiave, 7);
  assert.equal(fb[6].testo, testo);
  assert.equal(C.indovinaChiaveCesare(cif).chiave, 7);
  assert.ok(C.indiceCoincidenza(testo) > 0.06);
  const vig = C.vigenere(testo, 'CHIAVE');
  assert.ok(C.indiceCoincidenza(vig) < C.indiceCoincidenza(testo));
  assert.ok(C.kasiski('ABCXYZABCQQABC', 3).some(x => x.sequenza === 'ABC' && x.distanze.join() === '6,11'));
});

test('Bit, hex, testo, XOR', () => {
  assert.equal(C.testoABit('A'), '01000001');
  assert.equal(C.bitATesto('0100100001101001'), 'Hi');
  assert.equal(C.hexABit('A5'), '10100101');
  assert.equal(C.bitAHex('10100101'), 'A5');
  assert.equal(C.testoAHex('Now is t'), '4E6F772069732074');
  assert.equal(C.hexATesto('4E6F772069732074'), 'Now is t');
  assert.equal(C.xor('1100', '1010'), '0110');
  assert.equal(C.xorCiclico('11110000', '10'), '01011010');
  const m = C.testoABit('Ciao'), k = C.testoABit('segreto!').slice(0, 32);
  assert.equal(C.xor(C.xor(m, k), k), m);                               // XOR è il proprio inverso
  assert.throws(() => C.xor('10', '1'), RangeError);
});

test('S-DES (Stallings): chiavi, cifratura, round-trip', () => {
  const ch = C.sdes.chiavi('1010000010');
  assert.equal(ch.p10, '1000001100');
  assert.equal(ch.k1, '10100100');
  assert.equal(ch.k2, '01000011');
  const t = C.sdes.traccia('01110010', '1010000010');
  assert.equal(t.ip, '10101001');
  assert.equal(t.output, '01110111');                                   // esempio del capitolo 3 di Stallings
  assert.equal(C.sdes.cifra('01110010', '1010000010'), '01110111');
  assert.equal(C.sdes.decifra('01110111', '1010000010'), '01110010');
  for (let b = 0; b < 256; b += 5) {
    const bit = b.toString(2).padStart(8, '0');
    for (const k of ['0000000000', '1111111111', '0111111101', '1010000010']) {
      assert.equal(C.sdes.decifra(C.sdes.cifra(bit, k), k), bit);
    }
  }
  assert.throws(() => C.sdes.cifra('0101', '1010000010'), RangeError);
  // le tracce espongono tutti i passi
  assert.equal(t.round1.F.ep.length, 8); assert.equal(t.round1.F.p4.length, 4);
  assert.equal(t.sw.length, 8); assert.equal(t.round2.F.uscitaS.length, 4);
});

test('S-DES: secondo vettore calcolato a mano con le tabelle', () => {
  // Blocco 00000000, chiave 0000000000: K1 = K2 = 00000000.
  // Round 1: S0[0][0]=1, S1[0][0]=0 -> 0100 -> P4 -> 1000; scambio -> 00001000.
  // Round 2: EP(1000)=01000001, S0[0][2]=3, S1[1][0]=2 -> 1110 -> P4 -> 1011; IP^-1(10111000)=11110000.
  const t = C.sdes.traccia('00000000', '0000000000');
  assert.equal(t.round1.F.uscitaS, '0100');
  assert.equal(t.round1.F.p4, '1000');
  assert.equal(t.sw, '00001000');
  assert.equal(t.round2.F.uscitaS, '1110');
  assert.equal(t.round2.F.p4, '1011');
  assert.equal(t.output, '11110000');
  assert.equal(C.sdes.decifra('11110000', '0000000000'), '00000000');
});

test('DES: vettori ufficiali', () => {
  assert.equal(C.des.cifra('0123456789ABCDEF', '133457799BBCDFF1'), '85E813540F0AB405');
  assert.equal(C.des.decifra('85E813540F0AB405', '133457799BBCDFF1'), '0123456789ABCDEF');
  // NIST: variable plaintext known answer
  assert.equal(C.des.cifra('8000000000000000', '0101010101010101'), '95F8A5E5DD31D900');
  assert.equal(C.des.cifra('0000000000000000', '0101010101010101'), '8CA64DE9C1B123A7');
  // classico "Now is t" con chiave 0123456789ABCDEF
  assert.equal(C.des.cifra('4E6F772069732074', '0123456789ABCDEF'), '3FA40E8A984D4815');
  // minuscole accettate
  assert.equal(C.des.cifra('0123456789abcdef', '133457799bbcdff1'), '85E813540F0AB405');
});

test('DES: traccia (valori intermedi del tutorial classico)', () => {
  const t = C.des.traccia('0123456789ABCDEF', '133457799BBCDFF1');
  assert.equal(t.sottochiavi.length, 16);
  assert.equal(t.sottochiavi.pc1, '11110000110011001010101011110101010101100110011110001111');
  assert.equal(t.sottochiavi[0].k, '000110110000001011101111111111000111000001110010');
  assert.equal(t.sottochiavi[15].k, '110010110011110110001011000011100001011111110101');
  assert.equal(t.ip, '1100110000000000110011001111111111110000101010101111000010101010');
  assert.equal(t.L0, '11001100000000001100110011111111');
  assert.equal(t.R0, '11110000101010101111000010101010');
  assert.equal(t.round.length, 16);
  const r1 = t.round[0];
  assert.equal(r1.f.e, '011110100001010101010101011110100001010101010101');
  assert.equal(r1.f.xorChiave, '011000010001011110111010100001100110010100100111');
  assert.equal(r1.f.uscitaS, '01011100100000101011010110010111');
  assert.equal(r1.f.p, '00100011010010101010100110111011');
  assert.equal(r1.uscita.R, '11101111010010100110010101000100');
  assert.equal(r1.uscita.L, t.R0);
  assert.equal(t.round[15].uscita.R.length, 32);
  assert.equal(t.preuscita, '00001010010011001101100110010101' + '01000011010000100011001000110100');
  assert.equal(t.output, '85E813540F0AB405');
  assert.equal(r1.f.sbox.length, 8);
  assert.deepEqual([r1.f.sbox[0].ingresso, r1.f.sbox[0].riga, r1.f.sbox[0].colonna, r1.f.sbox[0].valore], ['011000', 0, 12, 5]);
});

test('DES: Triple DES, validazione, ECB', () => {
  const k = '133457799BBCDFF1', m = '0123456789ABCDEF';
  assert.equal(C.des.tripleCifra(m, k, k, k), C.des.cifra(m, k));
  const k2 = '0123456789ABCDEF', k3 = 'FEDCBA9876543210';
  const c = C.des.tripleCifra(m, k, k2, k3);
  assert.notEqual(c, C.des.cifra(m, k));
  assert.equal(C.des.tripleDecifra(c, k, k2, k3), m);
  assert.throws(() => C.des.cifra('ZZ', k), RangeError);
  assert.throws(() => C.des.cifra(m, '1234'), RangeError);
  // ECB: blocchi uguali -> cifrati uguali; round-trip con padding PKCS#7
  const dati = C.testoAHex('CIAO CIAO CIAO!');
  const e = C.ecb(dati, k);
  assert.equal(e.output.length % 16, 0);
  assert.equal(C.ecb(e.output, k, { decifra: true }).output, dati);
  const rip = C.ecb('0123456789ABCDEF0123456789ABCDEF', k, { padding: false });
  assert.equal(rip.blocchi[0].uscita, rip.blocchi[1].uscita);
  assert.equal(rip.output, '85E813540F0AB405'.repeat(2));
  const es = C.ecb('1111000011110000', '1010000010', { cifrario: 'sdes', padding: false });
  assert.equal(es.blocchi[0].uscita, es.blocchi[1].uscita);
  assert.equal(C.ecb(es.output, '1010000010', { cifrario: 'sdes', decifra: true, padding: false }).output, '1111000011110000');
});

test('Aritmetica: MCD, Euclide esteso, inverso, potenza modulare, primi', () => {
  assert.equal(C.mcd(48, 18), 6);
  assert.equal(C.mcd(17, 3120), 1);
  assert.equal(C.mcd(0, 5), 5);
  assert.equal(typeof C.mcd(48n, 18n), 'bigint');
  const e = C.euclideEsteso(240, 46);
  assert.equal(e.mcd, 2);
  assert.equal(240 * e.x + 46 * e.y, 2);
  assert.deepEqual([e.x, e.y], [-9, 47]);
  assert.deepEqual(e.passi.map(p => p.r), [240, 46, 10, 6, 4, 2, 0]);
  assert.deepEqual(e.passi.slice(2).map(p => p.q), [5, 4, 1, 1, 2]);
  for (const [a, b] of [[17, 3120], [35, 26], [101, 62], [7, 13]]) {
    const r = C.euclideEsteso(a, b);
    assert.equal(a * r.x + b * r.y, r.mcd);
  }
  assert.equal(C.inversoModulare(17, 3120), 2753);
  assert.equal(C.inversoModulare(3, 26), 9);
  assert.equal(C.inversoModulare(2, 26), null);
  assert.equal((17 * C.inversoModulare(17, 3120)) % 3120, 1);
  assert.equal(C.potenzaModulare(65, 17, 3233), 2790);
  assert.equal(C.potenzaModulare(2, 10, 1000), 24);
  assert.equal(C.potenzaModulare(7, 0, 13), 1);
  assert.equal(C.potenzaModulare(4n, 13n, 497n), 445n);
  const pp = C.potenzaModularePassi(65, 17, 3233);
  assert.equal(pp.risultato, 2790);
  assert.equal(pp.esponenteBinario, '10001');
  assert.equal(pp.passi.length, 5);
  assert.equal(pp.passi[pp.passi.length - 1].valore, 2790);
  assert.equal(C.isPrimo(61), true); assert.equal(C.isPrimo(53), true);
  assert.equal(C.isPrimo(1), false); assert.equal(C.isPrimo(91), false); assert.equal(C.isPrimo(3233), false);
  assert.equal(C.isPrimo(2147483647), true);                           // primo di Mersenne 2^31-1
  assert.equal(C.isPrimo(561), false);                                 // numero di Carmichael
  assert.equal(C.isPrimo(2305843009213693951n), true);                 // 2^61-1
  const f = C.fattorizza(3233);
  assert.deepEqual(f.fattori, [53n, 61n]);
});

test('RSA: p=61 q=53 e=17', () => {
  const k = C.rsa.genera(61, 53, 17);
  assert.equal(k.n, 3233n); assert.equal(k.phi, 3120n); assert.equal(k.d, 2753n);
  assert.deepEqual(k.pub, { e: 17n, n: 3233n });
  const c = C.rsa.cifra(65, k.pub);
  assert.equal(c, 2790n);
  assert.equal(C.rsa.decifra(c, k.priv), 65n);
  // firma e verifica
  const s = C.rsa.firma(65, k.priv);
  assert.equal(s, C.potenzaModulare(65n, 2753n, 3233n));
  assert.equal(C.rsa.verifica(s, 65, k.pub), true);
  assert.equal(C.rsa.verifica(s, 66, k.pub), false);
  // tutti i messaggi possibili tornano indietro
  for (let m = 0; m < 3233; m += 7) assert.equal(C.rsa.decifra(C.rsa.cifra(m, k.pub), k.priv), BigInt(m));
  // altra coppia
  const k2 = C.rsa.genera(11, 13, 7);
  assert.equal(k2.n, 143n); assert.equal(k2.d, 103n);
  // errori
  assert.throws(() => C.rsa.genera(60, 53, 17), RangeError);
  assert.throws(() => C.rsa.genera(61, 53, 2), RangeError);            // e non coprimo con phi
  assert.throws(() => C.rsa.genera(61, 61, 17), RangeError);
  assert.throws(() => C.rsa.cifra(3233, k.pub), RangeError);
  // chiavi più grandi con BigInt
  const g = C.rsa.genera(2305843009213693951n, 2147483647n, 65537n);
  const m = 123456789012345678901234567890n % g.n;
  assert.equal(C.rsa.decifra(C.rsa.cifra(m, g.pub), g.priv), m);
});
