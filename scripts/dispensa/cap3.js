const L = require('./lib');
const { C, A, capitolo, sez, sub, p, ul, ol, m, ev, formula, tabella, ricorda, errore, nota, esempio, codice, codiceDa, domande, rimandi, raw, it } = L;

const mod26 = (n) => ((n % 26) + 26) % 26;
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

module.exports = () => capitolo(3, 'Il cifrario di Vigenère',
  'Una chiave fatta di lettere: ogni posizione ha il suo spostamento. Per tre secoli sembrò indecifrabile, finché qualcuno guardò le ripetizioni.', () => {
  const KEY = 'LUNA';
  const tr = C.vigenereTraccia('ATTACCO', KEY);
  const cif = C.vigenere('ATTACCO', KEY);
  if (C.vigenereDecifra(cif, KEY) !== 'ATTACCO') throw new Error('cap3: decifratura');
  const lettere = A.split('');
  // tavola completa
  const tavola = lettere.map((r, i) => [r, ...lettere.map((_, j) => A[(i + j) % 26])]);
  // attacco su un testo
  const T = 'LA CRITTOGRAFIA E LARTE DI NASCONDERE IL SIGNIFICATO DI UN MESSAGGIO. CHI SCRIVE TRASFORMA LE PAROLE CON UNA REGOLA E UNA CHIAVE, CHI LEGGE USA LA STESSA CHIAVE PER TORNARE AL TESTO ORIGINALE. NEI SECOLI QUESTA IDEA E STATA USATA PER PROTEGGERE LETTERE, ORDINI MILITARI E SEGRETI DI STATO, MA ANCHE PER GIOCARE CON GLI AMICI. CHI RIESCE A TROVARE LA CHIAVE PUO LEGGERE TUTTO IL MESSAGGIO SENZA CHIEDERE AIUTO A NESSUNO. UN BUON CIFRARIO NON SI AFFIDA ALLA SEGRETEZZA DELL ALGORITMO.';
  const CT = C.normalizza(C.vigenere(T, KEY));
  const ks = C.kasiski(CT, 4);
  const gTot = ks.flatMap((x) => x.distanze).reduce(gcd, 0);
  const icPer = (n) => { let s = 0; for (let k = 0; k < n; k++) { let col = ''; for (let i = k; i < CT.length; i += n) col += CT[i]; s += C.indiceCoincidenza(col); } return s / n; };
  const icRighe = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => [String(n), icPer(n).toFixed(3).replace('.', ',')]);
  const colonne = [0, 1, 2, 3].map((c) => { let s = ''; for (let i = c; i < CT.length; i += 4) s += CT[i]; return s; });
  const migliore = (c) => { let b = 0, bp = Infinity; for (let k = 0; k < 26; k++) { const s = C.punteggioItaliano(C.cesareDecifra(c, k)); if (s < bp) { bp = s; b = k; } } return b; };
  const sposta = colonne.map(migliore);
  const chiaveTrovata = sposta.map((k) => A[k]).join('');
  if (chiaveTrovata !== KEY) throw new Error('cap3: chiave non ricostruita: ' + chiaveTrovata);
  const topCol = colonne.map((c) => { const f = C.frequenze(c); return f.conteggi.map((n, i) => ({ l: A[i], n })).sort((a, b) => b.n - a.n).slice(0, 3).map((x) => x.l).join(' '); });
  const icItaliano = C.indiceCoincidenza(C.normalizza(T));
  // chiave riusata
  const M1 = 'ATTACCO', M2 = 'PARTITA', KK = 'QZKFWBM';
  const C1 = C.vigenere(M1, KK), C2 = C.vigenere(M2, KK);
  const diffM = Array.from(M1).map((c, i) => mod26(c.charCodeAt(0) - M2.charCodeAt(i)));
  const diffC = Array.from(C1).map((c, i) => mod26(c.charCodeAt(0) - C2.charCodeAt(i)));
  if (diffM.join() !== diffC.join()) throw new Error('cap3: differenze');
  return [
    sez('Il limite di Cesare e l\'idea dei più alfabeti'),
    p('Con Cesare (e con la sua versione a chiave numerica quando la chiave è corta) una lettera in chiaro ha <b>sempre</b> la stessa lettera cifrata. Se la E è la lettera più frequente in italiano, nel testo cifrato lo sarà la sua sostituta, e un occhio allenato la trova. L\'idea è usare <b>più alfabeti</b> in alternanza, in modo che la stessa lettera in chiaro venga cifrata ogni volta in modo diverso. Un cifrario che usa un solo alfabeto è <i>monoalfabetico</i>; con più alfabeti in rotazione è <i>polialfabetico</i>.'),

    sez('Un po\' di storia'),
    tabella(['Quando', 'Evento'], [
      ['1553', 'Giovan Battista Bellaso pubblica il cifrario con parola chiave'],
      ['1586', 'Blaise de Vigenère lo descrive nel «Traicté des chiffres»'],
      ['XVIII-XIX secolo', 'Il cifrario è noto come «le chiffre indéchiffrable» (il cifrario indecifrabile)'],
      ['1854-1863', 'Charles Babbage lo viola in segreto verso il 1854; Friedrich Kasiski pubblica il metodo nel 1863'],
    ]),
    p('Il nome è un equivoco storico: il cifrario con parola chiave è di Bellaso; a Vigenère è rimasto il nome, ma lui descrisse una variante diversa.'),

    sez('Come funziona'),
    p('La chiave è una <b>parola</b>. Ogni sua lettera è uno spostamento: A = 0, B = 1, … Z = 25. La chiave LUNA corrisponde quindi alla serie di spostamenti 11, 20, 13, 0, che si ripete lungo il testo.'),
    tabella(['Lettera della chiave', ...KEY.split('')], [['Spostamento', ...KEY.split('').map((l) => String(A.indexOf(l)))]], { mono: true, center: true }),
    ricorda('Cesare è un Vigenère con una chiave di <b>una sola</b> lettera: lo spostamento è sempre lo stesso. E una serie di numeri come 3-1-4 è la chiave DBE (capitolo 2).', 'Rispetto a Cesare'),
    formula('Cifrare: <b>C<sub>i</sub> = (P<sub>i</sub> + K<sub>i mod n</sub>) mod 26</b> &nbsp;&nbsp;&nbsp; Decifrare: <b>P<sub>i</sub> = (C<sub>i</sub> − K<sub>i mod n</sub>) mod 26</b>'),
    p('Con <i>n</i> lunghezza della chiave, la lettera <i>i</i> usa la lettera numero <i>i</i> mod <i>n</i> della chiave: per questo la chiave si ripete.'),

    esempio('ATTACCO con chiave LUNA', [
      tabella(['Posizione', 'Chiaro', 'x', 'Lettera chiave', 'Spostamento', 'x + sposta.', 'mod 26', 'Cifrata'],
        tr.map((t, i) => { const x = A.indexOf(t.chiaro), s = t.spostamento; return [String(i + 1), t.chiaro, String(x), t.chiave, String(s), String(x + s), String((x + s) % 26), t.cifrato]; }),
        { mono: true, center: true }),
      p(`Risultato: ${m('ATTACCO')} → ${ev(cif)}. Le due T cadono su lettere diverse della chiave (U e N) e danno lettere diverse; la C della posizione 5 e quella della 6 pure. In Cesare tutte le coppie uguali avrebbero dato lo stesso risultato.`),
    ].join('')),
    p(`Per <b>decifrare</b> a mano si sposta ogni lettera cifrata <i>indietro</i> della lettera corrispondente della chiave: ${m(cif)} con LUNA dà ${m(C.vigenereDecifra(cif, KEY))}.`),

    sez('La tavola di Vigenère'),
    p('Per cifrare senza fare calcoli si usa la tavola: la riga della lettera della <b>chiave</b> e la colonna della lettera del <b>testo in chiaro</b> si incontrano nella lettera cifrata. Per decifrare si cerca la lettera cifrata nella riga della chiave e si legge in cima la colonna. Ogni riga è l\'alfabeto spostato di una lettera in più.'),
    tabella(['', ...lettere], tavola, { mono: true, center: true, stretta: true, didascalia: 'Tavola di Vigenère: riga = lettera della chiave, colonna = lettera del chiaro.' }),
    p(`Esempio: la T (colonna) cifrata con la chiave U (riga) dà ${m(A[(19 + 20) % 26])}.`),

    sez('Perché è più forte di Cesare'),
    ul([
      'Il profilo delle frequenze si appiattisce. L\'<b>indice di coincidenza</b> (IC) misura quanto il profilo è «a picchi»: circa 0,074 per l\'italiano, circa 0,038 per lettere casuali. Cesare lo conserva, Vigenère lo abbassa.',
      'Le chiavi possibili sono 26<sup>n</sup> con <i>n</i> lunghezza della chiave: ' + [1, 4, 8, 12].map((n) => `${n} lettere → ${n === 12 ? '≈ 9,5 · 10^16' : it(26 ** n)}`).join('; ') + '.',
    ]),
    p('La formula dell\'indice di coincidenza è IC = Σ f<sub>i</sub>(f<sub>i</sub> − 1) / (N (N − 1)), dove f<sub>i</sub> è il numero di occorrenze della lettera <i>i</i> e N il numero totale di lettere: è la probabilità che due lettere prese a caso nel testo siano uguali.'),

    sez('Il cifrario in PHP'),
    p('La funzione è quasi identica a quella di Cesare. La chiave è una stringa: si tolgono i caratteri che non sono lettere, si porta in maiuscolo, e per ogni lettera del testo lo spostamento è <code>ord($chiave[$j % $lunghezza]) − 65</code>. Il contatore <code>$j</code> aumenta soltanto sulle lettere, così spazi e simboli non consumano lettere della chiave.'),
    codice(codiceDa('modulo-3-vigenere/slide.html', 'CODICE'), 'vigenere.php'),

    sez('L\'attacco in tre mosse'),
    p('Vigenère non è invulnerabile. La sua debolezza sta nel fatto che la chiave <b>si ripete</b>. L\'attacco procede così:'),
    ol([
      '<b>Stimare la lunghezza</b> <i>n</i> della chiave (Kasiski, indice di coincidenza).',
      '<b>Dividere il testo in <i>n</i> colonne</b>: le lettere nelle posizioni 1, n+1, 2n+1… sono state cifrate tutte con lo stesso spostamento.',
      '<b>Ogni colonna è un cifrario di Cesare</b>: si rompe con le frequenze. Le lettere trovate formano la chiave.',
    ]),
    p(`Come esempio usiamo un paragrafo di ${CT.length} lettere cifrato con una chiave sconosciuta. Testo cifrato (a gruppi di 5): ${m(CT.match(/.{1,5}/g).join(' '))}`),
    sub('Mossa 1a: il metodo di Kasiski'),
    p('Se due frammenti uguali del testo in chiaro cadono nella stessa posizione rispetto alla chiave, danno frammenti <b>uguali</b> nel testo cifrato. La distanza tra le due ripetizioni è allora un <b>multiplo</b> della lunghezza della chiave. Si cercano nel cifrato le sequenze ripetute e si calcola il massimo comun divisore delle distanze.'),
    tabella(['Sequenza ripetuta', 'Posizioni (da 0)', 'Distanza'], ks.map((x) => [x.sequenza, x.posizioni.join(', '), x.distanze.join(', ')]), { mono: true, center: true }),
    p(`Le distanze sono ${[...new Set(ks.flatMap((x) => x.distanze))].join(', ')} (le ultime tre righe sono la stessa ripetizione, vista da posizioni sovrapposte): il loro massimo comun divisore è ${ev(String(gTot))}. La lunghezza della chiave è 4, oppure un suo divisore (1 o 2). Le sequenze brevi possono ripetersi per caso: conviene considerare più ripetizioni e usare quelle lunghe.`),
    sub('Mossa 1b: l\'indice di coincidenza'),
    p('Per ogni lunghezza <i>n</i> si dividono le colonne e si calcola l\'IC medio. Sulle lunghezze giuste (e sui loro multipli) l\'IC sale verso il valore dell\'italiano, perché ogni colonna è un testo cifrato con un solo spostamento.'),
    tabella(['Lunghezza n', 'IC medio'], icRighe, { mono: true, center: true, ev: (i) => (i === 3 || i === 7 || i === 11), didascalia: 'Picchi su 4, 8 e 12 (multipli di 4); per confronto, l\'italiano ha IC ' + icItaliano.toFixed(3).replace('.', ',') + ' (valore teorico circa 0,074).' }),
    sub('Mossa 2 e 3: colonne e frequenze'),
    p(`Con n = 4 il testo si divide in 4 colonne. Per ciascuna si cerca lo spostamento che fa comparire i picchi dell'italiano:`),
    tabella(['Colonna', 'Lettere più frequenti', 'Spostamento stimato', 'Lettera della chiave'], colonne.map((_, i) => [String(i + 1), topCol[i], String(sposta[i]), A[sposta[i]]]), { mono: true, center: true }),
    p(`Le quattro lettere formano la chiave ${ev(chiaveTrovata)}. Decifrando il testo si ottiene il paragrafo originale. Una volta nota la lunghezza <i>n</i>, il problema diventa <i>n</i> volte Cesare.`),

    sez('Come si rafforza: il one-time pad'),
    p('Se la chiave è lunga quanto il messaggio non c\'è nulla da ripetere: niente colonne, niente Kasiski, niente IC. Il caso limite si chiama <b>one-time pad</b> («blocco monouso») e garantisce una sicurezza perfetta, a tre condizioni.'),
    tabella(['Condizione', 'Significato'], [
      ['Lunga quanto il messaggio', 'Nessuna ripetizione'],
      ['Casuale', 'Ogni lettera uniforme, senza schema (non una parola di senso)'],
      ['Usata una sola volta', 'Mai riutilizzata'],
    ]),
    sub('Perché non si usa dappertutto'),
    p('Per ogni messaggio serve una chiave nuova, casuale, lunga quanto il messaggio e scambiata in modo sicuro: è lo stesso problema di far arrivare un segreto, ma più grande. Soprattutto, <b>non si può riusare</b>. Se due messaggi sono cifrati con la stessa chiave, la differenza dei cifrati coincide con la differenza dei testi in chiaro: la chiave sparisce e il segreto fugge.'),
    esempio('chiave riusata', [
      p(`Si cifrano ${m(M1)} e ${m(M2)} con la stessa chiave ${m(KK)}. I cifrati sono ${ev(C1)} e ${ev(C2)}. Lettera per lettera, la differenza (mod 26) dei due cifrati è uguale a quella dei due testi in chiaro:`),
      tabella(['Posizione', ...[1, 2, 3, 4, 5, 6, 7].map(String)], [
        ['Chiaro 1', ...M1.split('')], ['Chiaro 2', ...M2.split('')], ['Differenza dei chiari', ...diffM.map(String)],
        ['Cifrato 1', ...C1.split('')], ['Cifrato 2', ...C2.split('')], ['Differenza dei cifrati', ...diffC.map(String)],
      ], { mono: true, center: true }),
      p('Chi intercetta i due cifrati ottiene quindi informazioni sui messaggi senza conoscere la chiave. Per questo si chiama «monouso»: non è una raccomandazione, è una condizione.'),
    ].join('')),

    ricorda(ul([
      'Vigenère usa una <b>parola chiave</b>: C = (P + K) mod 26, con la chiave che si ripete.',
      'Si rompe stimando la <b>lunghezza</b> (Kasiski, IC) e poi con le <b>frequenze per colonna</b>.',
      'Il caso limite è il <b>one-time pad</b>: chiave casuale, lunga quanto il messaggio, usata una volta sola.',
    ])),
    errore('Riusare la stessa chiave del one-time pad su due messaggi: la differenza dei cifrati coincide con la differenza dei messaggi e la sicurezza perfetta svanisce.'),

    domande([
      'Cifra «INCONTRO ALLE OTTO» con la chiave MARE, scrivendo la chiave sotto il testo (senza far avanzare la chiave sugli spazi).',
      'Decifra con la tavola di Vigenère il frammento «PQXL» sapendo che la chiave è LUNA.',
      'Perché Vigenère è detto polialfabetico? Quanti alfabeti usa con una chiave di 5 lettere?',
      'Descrivi il metodo di Kasiski: che cosa si cerca nel cifrato e che cosa si calcola?',
      'Perché, una volta nota la lunghezza n, il problema diventa «n volte Cesare»?',
      'Elenca le tre condizioni del one-time pad e spiega che cosa succede se una non è rispettata.',
    ]),
    rimandi([
      ['../modulo-3-vigenere/slide.html', 'Slide del modulo 3', ''],
      ['../modulo-3-vigenere/simulazione-vigenere.html', 'Simulatore di Vigenère', 'anche da smartphone'],
      ['../modulo-3-vigenere/gioco-rompi-vigenere.html', 'Gioco: rompi il messaggio di Vigenère', 'Kasiski e frequenze per colonna'],
      ['../schede/bigliettini-vigenere.html', 'Bigliettini di Vigenère', 'da ritagliare'],
      ['../lab-php/03-vigenere/scheda.html', 'Lab PHP 03: Vigenère', 'cifra, decifra e attacca'],
      ['../quiz/quiz.html?modulo=3', 'Quiz del modulo 3', ''],
    ]),
  ].join('\n');
});
