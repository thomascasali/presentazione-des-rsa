const L = require('./lib');
const { C, A, capitolo, sez, sub, p, ul, ol, m, ev, formula, tabella, ricorda, errore, nota, esempio, codice, codiceDa, domande, rimandi, bitsSpazi, hexSpazi, it, raw } = L;

const grid = (tab, c) => { const r = []; for (let i = 0; i < tab.length; i += c) r.push(tab.slice(i, i + c).map(String)); return r; };
const g = (b, n) => b.match(new RegExp('.{1,' + n + '}', 'g')).join(' ');
const durata = (s) => {
  const f = (x) => (x >= 100 ? it(Math.round(x)) : x.toFixed(1).replace('.', ','));
  if (s < 60) return f(s) + ' secondi';
  if (s < 3600) return f(s / 60) + ' minuti';
  if (s < 86400) return f(s / 3600) + ' ore';
  if (s < 86400 * 365) return f(s / 86400) + ' giorni';
  return f(s / 86400 / 365) + ' anni';
};

module.exports = () => capitolo(6, 'DES',
  'Il cifrario a blocchi che ha dominato per vent\'anni: struttura di Feistel, S-DES a mano, DES reale, modalità operative e successori.', () => {
  const KEY = '133457799BBCDFF1', PT = '0123456789ABCDEF';
  const TD = C.des.traccia(PT, KEY);
  if (TD.output !== '85E813540F0AB405') throw new Error('cap6: vettore DES');
  const sk = TD.sottochiavi;
  const T = C.des.tabelle;
  const T0 = (bit) => T.PC1.map((i) => bit[i - 1]).join('');
  const pc1 = T0(C.hexABit(KEY));
  // S-DES
  const SK = '1010000010', SP = '01110010';
  const TS = C.sdes.traccia(SP, SK), TSD = C.sdes.traccia(TS.output, SK, true);
  if (TS.output !== '01110111' || TSD.output !== SP) throw new Error('cap6: sdes');
  const ST = C.sdes.tabelle;
  const ch = TS.chiavi;
  const sbox = (t) => `riga ${t.riga}, colonna ${t.colonna} → ${t.valore} = ${t.uscita}`;
  // round DES 1
  const r1 = TD.round[0], f1 = r1.f;
  const xorK = f1.xorChiave;
  const gruppiXor = xorK.match(/.{6}/g);
  const gruppiE = f1.e.match(/.{6}/g);
  // ECB / CBC
  const IV = 'A1B2C3D4E5F60718';
  const blocchiPT = ['4154544143434F21', '4154544143434F21', '4C554E4121212121'];   // "ATTACCO!" "ATTACCO!" "LUNA!!!!"
  const ecb = blocchiPT.map((b) => C.des.cifra(b, KEY));
  const cbc = []; let prev = IV;
  blocchiPT.forEach((b) => { const c = C.des.cifra(C.bitAHex(C.xor(C.hexABit(b), C.hexABit(prev))), KEY); cbc.push(c); prev = c; });
  if (ecb[0] !== ecb[1] || cbc[0] === cbc[1]) throw new Error('cap6: ecb/cbc');
  // 3DES
  const K2 = '0E329232EA6D0D73', K3 = '8787878787878787';
  const tripleUguali = C.des.tripleCifra(PT, KEY, KEY, KEY);
  if (tripleUguali !== TD.output) throw new Error('cap6: 3des uguali');
  const triple = C.des.tripleCifra(PT, KEY, K2, K3);
  if (C.des.tripleDecifra(triple, KEY, K2, K3) !== PT) throw new Error('cap6: 3des decifra');
  const spazio = 2 ** 56;
  const ritmi = [['1 milione di chiavi al secondo', 1e6], ['1 miliardo di chiavi al secondo', 1e9], ['92 miliardi di chiavi al secondo (Deep Crack, dato EFF)', 92e9]];

  return [
    sez('Da Lucifer al DES'),
    tabella(['Quando', 'Che cosa è successo'], [
      ['Anni \'70', 'IBM, con Horst Feistel, sviluppa il cifrario Lucifer (chiave a 128 bit nelle versioni descritte).'],
      ['1973-1974', 'Il National Bureau of Standards (NBS, oggi NIST) chiede proposte per uno standard di cifratura civile. IBM propone una variante di Lucifer.'],
      ['1977', 'L\'NBS pubblica il DES come standard federale (FIPS 46): blocchi di 64 bit, chiave di 56 bit.'],
      ['1999-2005', 'Si affianca la versione Triple DES (FIPS 46-3); nel 2001 nasce AES (FIPS 197) e nel 2005 il DES viene ritirato come standard.'],
    ]),
    p('Per la prima volta un algoritmo di cifratura <b>pubblico e standardizzato</b> poteva essere studiato da tutti. Ha ispirato quasi tutta la ricerca successiva sui cifrari a blocchi.'),
    sub('Le polemiche: chiave corta e S-box'),
    ul([
      '<b>56 bit, non 128</b>: Lucifer usava chiavi più lunghe. Gli studiosi dell\'epoca criticarono la scelta: uno spazio di 2<sup>56</sup> chiavi sarebbe stato attaccabile con hardware dedicato.',
      '<b>Il ruolo della NSA</b>: l\'agenzia collaborò alla revisione e si sospettò un «passaggio segreto». Un\'indagine del Senato statunitense (1978) non trovò manomissioni dell\'algoritmo.',
      '<b>Il sospetto che rientrò</b>: nel 1990 Biham e Shamir scoprirono la crittoanalisi differenziale e si vide che le S-box del DES le resistevano bene. Coppersmith (IBM) raccontò nel 1994 che il team la conosceva già dal 1974 e aveva progettato le S-box di conseguenza.',
    ]),

    sez('Il DES in una figura'),
    tabella(['Blocco in chiaro', 'IP', '16 round (Feistel)', 'Scambio L/R', 'IP⁻¹', 'Blocco cifrato'], [['64 bit = 16 cifre esadecimali', 'permutazione iniziale', 'ognuno con la propria sottochiave', 'dopo il round 16', 'permutazione finale', '64 bit']], { stretta: true }),
    ul([
      '<b>Blocco</b>: 64 bit in ingresso e in uscita.',
      '<b>Chiave</b>: 64 bit, ma 8 sono di parità: solo <b>56</b> contano. Da essa si ricavano 16 sottochiavi da 48 bit.',
      '<b>Round</b>: 16, ognuno con la propria sottochiave.',
    ]),
    p(`L'esempio che useremo è il vettore di prova ufficiale: chiave ${m(KEY)}, blocco ${m(PT)}, cifrato atteso ${ev(TD.output)}.`),

    sez('La rete di Feistel'),
    p('Il blocco si divide in due metà, L (sinistra) e R (destra). In ogni round, con K<sub>i</sub> sottochiave del round:'),
    formula('L<sub>i</sub> = R<sub>i−1</sub> &nbsp;&nbsp;&nbsp; R<sub>i</sub> = L<sub>i−1</sub> ⊕ F(R<sub>i−1</sub>, K<sub>i</sub>)'),
    p('Metà del blocco (R) passa invariata e diventa la nuova L; l\'altra metà viene mescolata con lo XOR con il risultato di F, la «funzione complicata». Al round successivo le parti si invertono.'),
    sub('Perché si può decifrare'),
    tabella(['Un round all\'andata', 'Come tornare indietro'], [['L₁ = R₀', 'R₀ = L₁'], ['R₁ = L₀ ⊕ F(R₀, K₁)', 'L₀ = R₁ ⊕ F(L₁, K₁)']]),
    p('Il passaggio funziona perché R₁ ⊕ F(R₀, K₁) = L₀ ⊕ F ⊕ F = L₀, grazie alla proprietà A ⊕ K ⊕ K = A del capitolo 5.'),
    ricorda('Per decifrare si applica la stessa struttura, partendo dall\'ultimo round, con <b>K₁₆ per primo e K₁ per ultimo</b>. F non deve essere invertibile: basta calcolarla, non annullarla.', 'Conseguenza'),

    sez('S-DES: il DES in miniatura'),
    p('Il DES a 16 round è troppo lungo da seguire a mano. <b>S-DES</b> (Simplified DES, versione didattica di Stallings) ha la stessa struttura in piccolo.'),
    tabella(['', 'DES', 'S-DES'], [['Blocco', '64 bit', '8 bit'], ['Chiave', '56 bit (64 con parità)', '10 bit'], ['Round', '16', '2'], ['Sottochiavi', '16 × 48 bit', '2 × 8 bit'], ['S-box', '8 (6 → 4 bit)', '2 (4 → 2 bit)']]),
    errore('S-DES è solo un esercizio: 2<sup>10</sup> = 1024 chiavi si provano tutte in un istante. Serve a capire, non a proteggere.', 'Attenzione'),
    sub('Le tabelle e come si leggono'),
    p('Una <b>tabella di permutazione</b> elenca, per ogni posizione di <i>uscita</i>, da quale bit dell\'<i>ingresso</i> prendere (i bit si numerano da 1). Esempio con P4 = 2 4 3 1 su 1011: l\'uscita prende il bit 2 (0), poi il 4 (1), poi il 3 (1), poi il 1 (1) e vale 0111. P8 scarta 2 dei 10 bit; E/P ne ripete alcuni per passare da 4 a 8.'),
    tabella(['Tabella', 'Valori'], [
      ['P10', ST.P10.join(' ')], ['P8', ST.P8.join(' ')], ['IP', ST.IP.join(' ')], ['IP⁻¹', ST.IP_INV.join(' ')], ['E/P', ST.EP.join(' ')], ['P4', ST.P4.join(' ')],
    ], { mono: true }),
    sub('Leggere una S-box'),
    p('Una S-box trasforma pochi bit in meno bit usando una tabella. Dei 4 bit in ingresso b₁b₂b₃b₄, i bit esterni (b₁ e b₄) scelgono la <b>riga</b>, quelli interni (b₂ e b₃) la <b>colonna</b>. Il valore trovato (0-3) si riscrive su 2 bit.'),
    tabella(['S0', 'col. 0', 'col. 1', 'col. 2', 'col. 3'], ST.S0.map((r, i) => ['riga ' + i, ...r.map(String)]), { mono: true, center: true }),
    tabella(['S1', 'col. 0', 'col. 1', 'col. 2', 'col. 3'], ST.S1.map((r, i) => ['riga ' + i, ...r.map(String)]), { mono: true, center: true }),

    esempio(`S-DES con chiave ${SK} e blocco ${SP}`, [
      sub('Le due sottochiavi'),
      ol([
        `<b>P10</b> sulla chiave: ${m(SK)} → ${m(ch.p10)}. Si divide in due metà da 5 bit: C₀ = ${m(ch.c0)}, D₀ = ${m(ch.d0)}.`,
        `<b>Scorrimento a sinistra di 1</b> (LS-1) di ciascuna metà: C = ${m(ch.ls1.slice(0, 5))}, D = ${m(ch.ls1.slice(5))}, in tutto ${m(ch.ls1)}.`,
        `<b>P8</b> sceglie 8 dei 10 bit: <b>K1 = ${ch.k1}</b>.`,
        `Sulle metà già scorse si applica <b>LS-2</b> (scorrimento di altri 2 posti): ${m(ch.ls2)}.`,
        `<b>P8</b> di nuovo: <b>K2 = ${ch.k2}</b>.`,
      ]),
      sub('Cifrare il blocco'),
      p(`Il blocco ${m(SP)} passa per <b>IP</b> e diventa ${m(TS.ip)}; si divide in L = ${m(TS.round1.L)} e R = ${m(TS.round1.R)}. Poi due round identici, con K1 nel primo e K2 nel secondo. Dentro un round, la funzione F lavora così:`),
      ol(['E/P espande R da 4 a 8 bit;', 'XOR con la sottochiave;', 'i 4 bit di sinistra vanno in S0, i 4 di destra in S1 (2 bit ciascuna);', 'i 4 bit in uscita dalle S-box passano per P4;', 'il risultato si combina con XOR con L, e le metà si scambiano.']),
      tabella(['Passo', 'Round 1 (K1 = ' + ch.k1 + ')', 'Round 2 (K2 = ' + ch.k2 + ')'], [
        ['Ingresso (L, R)', `${TS.round1.L} ${TS.round1.R}`, `${TS.round2.L} ${TS.round2.R}`],
        ['E/P di R', TS.round1.F.ep, TS.round2.F.ep],
        ['XOR con la sottochiave', TS.round1.F.xorChiave, TS.round2.F.xorChiave],
        ['Ingresso S0 | S1', `${TS.round1.F.s0In} | ${TS.round1.F.s1In}`, `${TS.round2.F.s0In} | ${TS.round2.F.s1In}`],
        ['S0', sbox(TS.round1.F.s0), sbox(TS.round2.F.s0)],
        ['S1', sbox(TS.round1.F.s1), sbox(TS.round2.F.s1)],
        ['Uscite S0 S1', TS.round1.F.uscitaS, TS.round2.F.uscitaS],
        ['P4 = F(R, K)', TS.round1.F.p4, TS.round2.F.p4],
        ['L ⊕ F', TS.round1.uscitaL, TS.round2.uscitaL],
        ['Uscita del round', TS.round1.uscita, TS.round2.uscita],
      ], { mono: true }),
      p(`Tra i due round le metà si scambiano (SW): ${m(TS.round1.uscita)} → ${m(TS.sw)}. Dopo il secondo round (senza scambio) si ottiene ${m(TS.preuscita)}. La permutazione finale <b>IP⁻¹</b> dà il cifrato:`),
      p(`<b>${SP} → ${TS.output}</b>`),
    ].join('')),
    sub('Decifrare'),
    p('Per decifrare si ripete <b>tutto</b> l\'algoritmo, ma nel primo round si usa K2 e nel secondo K1.'),
    tabella(['', 'Cifratura', 'Decifratura'], [
      ['Ingresso', TS.ingresso, TSD.ingresso], ['Round 1 usa', 'K1 = ' + TS.round1.chiave, 'K2 = ' + TSD.round1.chiave], ['Round 2 usa', 'K2 = ' + TS.round2.chiave, 'K1 = ' + TSD.round2.chiave], ['Uscita', TS.output, TSD.output],
    ], { mono: true, center: true }),
    p(`Verifica: il cifrato ${m(TS.output)} decifrato con la stessa chiave ritorna al blocco di partenza ${m(SP)}.`),

    sez('Il DES reale'),
    sub('IP e IP⁻¹: le permutazioni iniziale e finale'),
    p('Le permutazioni del DES funzionano come quelle di S-DES, con 64 posizioni. Le tabelle si leggono per righe: la prima riga di IP (58, 50, 42, …) dice che il bit 1 dell\'uscita è il bit 58 dell\'ingresso.'),
    tabella(['IP (64 → 64)', '', '', '', '', '', '', ''], grid(T.IP, 8), { mono: true, center: true, stretta: true }),
    tabella(['IP⁻¹ (64 → 64)', '', '', '', '', '', '', ''], grid(T.FP, 8), { mono: true, center: true, stretta: true }),
    p(`Il blocco ${m(PT)} in binario è ${m(g(C.hexABit(PT), 8))}. Dopo IP diventa ${m(g(TD.ip, 8))}, da cui L₀ = ${m(C.bitAHex(TD.L0))} e R₀ = ${m(C.bitAHex(TD.R0))} (le due metà da 32 bit, in esadecimale). IP⁻¹ è la permutazione inversa: annulla IP.`),

    sub('Le sottochiavi: PC-1, rotazioni, PC-2'),
    ol([
      `<b>PC-1</b> (da 64 a 56 bit) scarta gli 8 bit di parità e rimescola i 56 rimasti, che si dividono in due metà da 28 bit: C₀ e D₀. Per la chiave ${m(KEY)}: C₀ = ${m(g(pc1.slice(0, 28), 7))}, D₀ = ${m(g(pc1.slice(28), 7))}.`,
      'In ogni round C e D <b>ruotano a sinistra</b> di 1 o 2 posti, secondo una tabella fissa. Le rotazioni sono cumulative.',
      '<b>PC-2</b> sceglie 48 dei 56 bit di C<sub>i</sub>D<sub>i</sub>: ecco la sottochiave K<sub>i</sub>.',
    ]),
    tabella(['Round', ...T.SHIFT.map((_, i) => String(i + 1))], [['Rotazioni', ...T.SHIFT.map(String)]], { mono: true, center: true, stretta: true }),
    tabella(['PC-1 (64 → 56)', '', '', '', '', '', ''], grid(T.PC1, 7), { mono: true, center: true, stretta: true }),
    tabella(['PC-2 (56 → 48)', '', '', '', '', ''], grid(T.PC2, 6), { mono: true, center: true, stretta: true }),
    p(`Dopo il round 1 (rotazione di 1): C₁ = ${m(g(sk[0].c, 7))}, D₁ = ${m(g(sk[0].d, 7))}. Con PC-2 si ottiene K₁ = ${m(C.bitAHex(sk[0].k))} (48 bit = 12 cifre esadecimali). Tutte le sottochiavi dell'esempio:`),
    tabella(['Sottochiave', 'Valore (hex)', 'Sottochiave', 'Valore (hex)'], Array.from({ length: 8 }, (_, i) => [`K${i + 1}`, C.bitAHex(sk[i].k), `K${i + 9}`, C.bitAHex(sk[i + 8].k)]), { mono: true, center: true }),

    sub('La funzione F del DES'),
    p('La funzione F prende R (32 bit) e la sottochiave K (48 bit):'),
    ol([
      '<b>E</b> (espansione) porta R da 32 a 48 bit ripetendo i bit ai bordi di ogni gruppo da 4;',
      'XOR con la sottochiave K;',
      'le <b>8 S-box</b>: ogni gruppo da 6 bit entra in una S-box e ne esce un gruppo da 4 bit (bit esterni = riga, bit interni = colonna);',
      '<b>P</b> permuta i 32 bit risultanti.',
    ]),
    tabella(['E (32 → 48)', '', '', '', '', ''], grid(T.E, 6), { mono: true, center: true, stretta: true }),
    tabella(['P (32 → 32)', '', '', ''], grid(T.P, 4), { mono: true, center: true, stretta: true }),
    p('Le 8 S-box sono l\'unica parte <b>non lineare</b> (confusione): senza di esse il DES sarebbe una funzione lineare, fatta di XOR e permutazioni, e si romperebbe risolvendo equazioni. L\'espansione E e la permutazione P distribuiscono l\'effetto di ogni bit su più S-box del round successivo (diffusione). Come esempio ecco la prima S-box; le altre sette sono nello standard FIPS 46-3.'),
    tabella(['S1', ...Array.from({ length: 16 }, (_, i) => String(i))], [0, 1, 2, 3].map((r) => ['riga ' + r, ...T.S[0].slice(r * 16, r * 16 + 16).map(String)]), { mono: true, center: true, stretta: true }),

    esempio('il primo round del DES', [
      p(`Valori con il vettore ufficiale: R₀ = ${m(C.bitAHex(r1.R))} (in binario ${m(g(r1.R, 8))}), K₁ = ${m(C.bitAHex(r1.K))}.`),
      ol([
        `<b>E(R₀)</b> (48 bit): ${m(g(f1.e, 6))}`,
        `<b>XOR con K₁</b>: ${m(g(xorK, 6))}`,
        'Gruppi da 6 bit nelle 8 S-box (riga = primo e ultimo bit, colonna = i 4 bit centrali):',
      ]),
      tabella(['S-box', 'Ingresso (6 bit)', 'Riga', 'Colonna', 'Valore', 'Uscita (4 bit)'], f1.sbox.map((s, i) => ['S' + (i + 1), s.ingresso, String(s.riga), String(s.colonna), String(s.valore), s.uscita]), { mono: true, center: true }),
      ol([
        `Le 8 uscite affiancate: ${m(g(f1.uscitaS, 4))} (32 bit).`,
        `<b>P</b>: ${m(g(f1.p, 4))} = ${m(C.bitAHex(f1.p))} = F(R₀, K₁).`,
        `<b>R₁ = L₀ ⊕ F</b> = ${m(C.bitAHex(TD.L0))} ⊕ ${m(C.bitAHex(f1.p))} = ${ev(C.bitAHex(r1.nuovaR))}; <b>L₁ = R₀</b> = ${ev(C.bitAHex(r1.R))}.`,
      ]),
    ].join('')),

    sub('I 16 round e il risultato finale'),
    p('Si ripete lo stesso round 16 volte con K₁…K₁₆. La tabella riporta le due metà dopo ciascun round (esadecimale).'),
    tabella(['Round', 'L', 'R', 'Round', 'L', 'R'], Array.from({ length: 8 }, (_, i) => [String(i + 1), C.bitAHex(TD.round[i].uscita.L), C.bitAHex(TD.round[i].uscita.R), String(i + 9), C.bitAHex(TD.round[i + 8].uscita.L), C.bitAHex(TD.round[i + 8].uscita.R)]), { mono: true, center: true }),
    p(`Dopo il round 16 le metà si scambiano: R₁₆L₁₆ = ${m(C.bitAHex(TD.preuscita))}. Infine IP⁻¹ produce il blocco cifrato.`),
    ricorda(`Chiave <b>${KEY}</b> · testo <b>${PT}</b> → <b>${TD.output}</b>. È il vettore di prova ufficiale con cui si verifica ogni implementazione del DES.`, 'Vettore di prova'),

    sez('Modalità operative'),
    p('Il DES cifra 8 byte per volta. Per messaggi più lunghi serve una <b>modalità operativa</b>.'),
    sub('ECB: blocchi uguali, cifrati uguali'),
    p('In <b>ECB</b> (Electronic Codebook) ogni blocco si cifra da solo con la stessa chiave: blocchi uguali producono cifrati uguali, e la struttura dei dati resta visibile (il caso classico è un\'immagine cifrata in ECB di cui si riconosce ancora la sagoma).'),
    sub('CBC e il vettore di inizializzazione'),
    p('In <b>CBC</b> (Cipher Block Chaining) ogni blocco in chiaro viene combinato con XOR con il cifrato del blocco precedente prima di essere cifrato; per il primo blocco si usa un <b>vettore di inizializzazione</b> (IV). L\'IV è casuale, non segreto, e va cambiato a ogni messaggio.'),
    esempio('tre blocchi, due uguali', [
      p(`Si cifrano con la chiave ${m(KEY)} tre blocchi da 8 byte (due uguali: «ATTACCO!» ripetuto, poi «LUNA!!!!»). IV per CBC: ${m(IV)}.`),
      tabella(['Blocco', 'In chiaro (hex)', 'ECB', 'CBC'], blocchiPT.map((b, i) => [String(i + 1), b, ecb[i], cbc[i]]), { mono: true, center: true, ev: (i, j) => (j === 2 && (i === 0 || i === 1)) }),
      p('In ECB i blocchi 1 e 2 hanno lo stesso cifrato; in CBC no, perché ogni blocco è combinato con il precedente.'),
    ].join('')),

    sez('Il problema dei 56 bit'),
    p(`Le chiavi possibili sono 2<sup>56</sup> = 72.057.594.037.927.936, circa 7,2 × 10<sup>16</sup>. Il tempo per provarle tutte dipende dalla velocità:`),
    tabella(['Velocità di ricerca', 'Tempo per provarle tutte'], ritmi.map(([n, r]) => [n, durata(spazio / r)])),
    p('In media si trova la chiave dopo aver provato metà dello spazio: la metà dei tempi indicati. Con hardware specializzato e molti chip in parallelo la ricerca diventa realistica.'),
    sub('Deep Crack, 1998'),
    tabella(['Quando', 'Chi', 'Risultato'], [
      ['1997', 'Progetto DESCHALL (distribuito)', 'Prima «DES Challenge» di RSA risolta in 96 giorni.'],
      ['Gen-feb 1998', 'distributed.net', 'DES Challenge II-1 risolta in 39 giorni.'],
      ['Luglio 1998', 'EFF, macchina «Deep Crack»', 'DES Challenge II-2 risolta in 56 ore. Costo di costruzione sotto i 250.000 dollari.'],
      ['Gen 1999', 'EFF e distributed.net', 'DES Challenge III risolta in circa 22 ore.'],
    ]),
    p('Il DES con una sola chiave a 56 bit non è più sicuro: la dimostrazione pubblica che un attacco a forza bruta era alla portata di organizzazioni con pochi mezzi.'),

    sez('I successori: Triple DES e AES'),
    sub('Triple DES (3DES)'),
    p('Il Triple DES applica il DES tre volte nello schema EDE: cifra con K1, <i>decifra</i> con K2, cifra con K3. Perché «decifra» al centro? Con K1 = K2 = K3 le tre operazioni si semplificano e si ottiene il DES singolo: compatibilità con i sistemi vecchi.'),
    tabella(['Chiavi', 'Blocco ' + PT + ' diventa'], [
      ['K1 = K2 = K3 = ' + KEY, tripleUguali + '  (uguale al DES singolo)'],
      [`K1 = ${KEY}, K2 = ${K2}, K3 = ${K3}`, triple],
    ], { mono: true }),
    p('La chiave ha 168 bit (3 × 56), ma l\'attacco «meet-in-the-middle» riduce la sicurezza effettiva a circa <b>112 bit</b>. Resta lento e con blocchi di 64 bit: oggi è sconsigliato.'),
    sub('AES'),
    p('Nel 1997 il NIST lancia una gara pubblica; vince <b>Rijndael</b> (Daemen e Rijmen, Belgio). AES diventa standard nel 2001 (FIPS 197).'),
    tabella(['Parametro', 'AES'], [['Blocco', '128 bit'], ['Chiave', '128, 192 o 256 bit'], ['Round', '10, 12 o 14'], ['Struttura', 'rete di sostituzione-permutazione (non Feistel): tutto il blocco è trasformato a ogni round']]),
    p('AES-128 e AES-256 sono oggi lo standard di fatto (Wi-Fi WPA2, HTTPS, dischi cifrati). Le idee viste nel DES (confusione, diffusione, round, sottochiavi) si ritrovano tutte.'),

    sez('Il DES in PHP con OpenSSL'),
    p('Per usare un cifrario a blocchi in PHP non si riscrive l\'algoritmo: si usa la funzione <code>openssl_encrypt()</code>. Esempio con 3DES in modalità CBC. <code>random_bytes()</code> produce byte casuali crittograficamente sicuri; l\'IV ha la lunghezza del blocco (8 byte) e viaggia in chiaro davanti al cifrato; OpenSSL aggiunge da solo il padding.'),
    codice(codiceDa('modulo-6-des/slide.html', 'CODICE_3DES'), '3des-cbc.php'),
    sub('E il DES singolo?'),
    codice(codiceDa('modulo-6-des/slide.html', 'CODICE_DES'), 'des-singolo.php'),
    nota('Con PHP 8.3 e OpenSSL 3 la chiamata <code>openssl_encrypt(…, \'DES-ECB\', …)</code> restituisce <code>false</code> (errore «unsupported»): in OpenSSL 3 il DES singolo sta nel <i>provider legacy</i>, spesso non attivo. 3DES e AES funzionano. Con K1 = K2 = K3 il 3DES dà lo stesso risultato del vettore ufficiale ' + TD.output + '.', 'Comportamento reale'),

    ricorda(ul([
      'Feistel: <b>L′ = R, R′ = L ⊕ F(R, K)</b>; per decifrare stessa struttura, sottochiavi invertite.',
      'DES: blocco 64 bit, chiave 56 bit, 16 round; F = E, XOR con la sottochiave, 8 S-box, P.',
      'ECB lascia vedere la struttura dei dati; CBC la nasconde con IV e concatenamento.',
      '56 bit si forzano (Deep Crack, 1998): 3DES e poi AES.',
    ])),

    domande([
      'Scrivi le formule di un round di Feistel e spiega perché per decifrare basta invertire l\'ordine delle sottochiavi.',
      'Calcola con S-DES le sottochiavi K1 e K2 per la chiave 1100011110 (usa le tabelle P10, P8 e gli scorrimenti).',
      'In un round DES, come si passa da 32 a 48 bit? E da 48 a 32? Quale delle due operazioni è non lineare?',
      'Che differenza c\'è tra ECB e CBC? Perché l\'IV non deve essere segreto ma deve cambiare a ogni messaggio?',
      'Quante chiavi ha il DES? Perché Deep Crack nel 1998 rese insicura la chiave da 56 bit?',
      'Perché il 3DES usa lo schema cifra-decifra-cifra? Quale sicurezza effettiva offre?',
    ]),
    rimandi([
      ['../modulo-6-des/slide.html', 'Slide del modulo 6', ''],
      ['../modulo-6-des/simulazione-sdes.html', 'Simulatore S-DES passo per passo', 'con input libero'],
      ['../modulo-6-des/simulazione-des.html', 'Simulatore DES: 16 round', ''],
      ['../modulo-6-des/gioco-sdes-a-mano.html', 'Gioco: S-DES a mano', 'chiave e blocco casuali, verifica a ogni passo'],
      ['../schede/sdes-a-mano.html', 'Scheda S-DES a mano', 'da stampare'],
      ['../lab-php/07-des-openssl/scheda.html', 'Lab PHP 07: DES e OpenSSL', 'openssl_encrypt, ECB contro CBC'],
    ]),
  ].join('\n');
});
