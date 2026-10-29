const L = require('./lib');
const { C, A, capitolo, sez, sub, p, ul, ol, m, ev, formula, tabella, ricorda, errore, nota, esempio, codice, codiceDa, domande, rimandi, it } = L;

const mod = (a, n) => ((a % n) + n) % n;

module.exports = () => capitolo(7, 'La matematica di RSA',
  'Orologi, resti, numeri primi e potenze: gli attrezzi con cui si costruisce il cifrario a chiave pubblica.', () => {
  // prodotto in modulo
  const tabProd = (n) => {
    const nums = Array.from({ length: n - 1 }, (_, i) => i + 1);
    return { head: ['×', ...nums.map(String)], rows: nums.map((a) => [String(a), ...nums.map((b) => String((a * b) % n))]), n };
  };
  const t7 = tabProd(7), t8 = tabProd(8);
  const inv7 = [1, 2, 3, 4, 5, 6].map((a) => [String(a), String([1, 2, 3, 4, 5, 6].find((x) => (a * x) % 7 === 1))]);
  // Euclide 3120, 17
  const passiEuc = []; { let a = 3120, b = 17; while (b) { const q = Math.floor(a / b), r = a % b; passiEuc.push([`${a} = ${q} · ${b} + ${r}`, String(a), String(b), String(q), String(r)]); a = b; b = r; } }
  const ee = C.euclideEsteso(3120n, 17n);
  const inv = C.inversoModulare(17n, 3120n);
  if (inv !== 2753n || (17n * inv) % 3120n !== 1n) throw new Error('cap7: inverso');
  const mn = (x) => String(x).replace('-', '−');
  const righeEE = ee.passi.map((s) => [String(s.i), s.q === null ? '—' : String(s.q), String(s.r), mn(s.s), mn(s.t)]);
  // phi
  const coprimi15 = []; for (let a = 1; a <= 15; a++) if (Number(C.mcd(a, 15)) === 1) coprimi15.push(a);
  // Eulero
  const eul = (a, n) => C.potenzaModulare(BigInt(a), 8n, BigInt(n));
  // square and multiply
  const pm = C.potenzaModularePassi(65n, 17n, 3233n);
  if (pm.risultato !== 2790n) throw new Error('cap7: potenza');
  const naive = (65n ** 17n).toString();
  const cifreRsa = Math.floor(2048 * 65537 * Math.log10(2)) + 1;
  const ft = C.fattorizza(3233n), ft2 = C.fattorizza(1000003n * 1000033n);

  return [
    sez('Che cosa ci serve per RSA'),
    p('RSA usa pochi ingredienti, ma bisogna padroneggiarli uno per uno. Questo capitolo li costruisce in ordine:'),
    tabella(['Ingrediente', 'A che cosa serve'], [
      ['Aritmetica modulare', 'I numeri «girano», come su un orologio: tutti i calcoli di RSA sono resti'],
      ['MCD e numeri coprimi', 'Verificare che e sia utilizzabile (Euclide)'],
      ['Inverso modulare', 'Calcolare la chiave privata d (Euclide esteso)'],
      ['Funzione φ di Eulero', 'Il numero «segreto» φ(n) per n = p · q e il perché RSA funziona'],
      ['Potenza modulare', 'Cifrare e decifrare con numeri enormi (square-and-multiply)'],
      ['Funzione con botola', 'Facile in un verso, difficile nell\'altro: la sicurezza'],
    ]),

    sez('L\'orologio: i numeri girano'),
    p('Sono le 9 e passano 5 ore: non sono le 14, sono le 2. Su un orologio da 12 ore si calcola (9 + 5) mod 12 = 2: dopo il 12 si riparte da 0. Lo stesso accade con le lettere nel cifrario di Cesare, dove l\'orologio ha 26 ore.'),
    sub('Resti e congruenze'),
    ul([
      '<b>a mod n</b> è il resto della divisione di a per n, sempre compreso tra 0 e n − 1.',
      '<b>a ≡ b (mod n)</b> («a è congruo a b modulo n») significa che a e b hanno lo stesso resto: stanno sulla stessa lancetta.',
    ]),
    tabella(['a', 'n', 'a mod n', 'Spiegazione'], [
      ['17', '5', String(mod(17, 5)), '17 = 3 · 5 + 2'],
      ['100', '7', String(mod(100, 7)), '100 = 14 · 7 + 2'],
      ['−3', '26', String(mod(-3, 26)), '−3 + 26 = 23 (resto sempre non negativo)'],
      ['3233', '61', String(mod(3233, 61)), '3233 = 53 · 61 + 0: 3233 è multiplo di 61'],
    ], { mono: true, center: true }),
    errore('Le funzioni <code>%</code> di PHP e JavaScript restituiscono un resto negativo se il dividendo è negativo (<code>-3 % 26</code> vale −3). Il resto matematico va ricavato con <code>(($a % $n) + $n) % $n</code>.'),

    sez('Calcolare in modulo senza numeri enormi'),
    p('Si può <b>ridurre prima</b> e calcolare dopo:'),
    formula('(a · b) mod n = ((a mod n) · (b mod n)) mod n'),
    p('La regola vale per somma, sottrazione e prodotto. La divisione no: per dividere serve l\'inverso, che vediamo tra poco.'),
    esempio('(123 · 456) mod 7', [
      p(`Strada lunga: 123 · 456 = ${it(123 * 456)}, poi ${it(123 * 456)} mod 7 = ${(123 * 456) % 7}. Strada breve: 123 mod 7 = ${123 % 7}, 456 mod 7 = ${456 % 7}, quindi (${123 % 7} · ${456 % 7}) mod 7 = ${((123 % 7) * (456 % 7)) % 7}. Il risultato è lo stesso, ma i numeri non crescono mai. Questa è la proprietà che permetterà di calcolare potenze enormi.`),
    ].join('')),

    sez('L\'inverso moltiplicativo e la tabella del prodotto'),
    p('L\'<b>inverso</b> di a modulo n è il numero x tale che <b>a · x ≡ 1 (mod n)</b>. È come «dividere per a»: in RSA serve per ricavare la chiave privata. Per esempio 3 · 5 = 15 ≡ 1 (mod 7), quindi l\'inverso di 3 modulo 7 è 5.'),
    ricorda('L\'inverso di a modulo n esiste se e solo se <b>MCD(a, n) = 1</b>, cioè se a e n sono coprimi.', 'Quando esiste'),
    p('Per vedere chi ha un inverso si cerca il numero 1 in ogni riga della tabella del prodotto. Modulo 7 (primo) ogni riga contiene un 1; modulo 8 le righe dei numeri pari non ne contengono.'),
    tabella(t7.head, t7.rows, { mono: true, center: true, stretta: true, ev: (i, j, c) => j > 0 && c === '1', didascalia: 'Tabella del prodotto modulo 7. Ogni numero ha un inverso: gli 1 sono evidenziati.' }),
    tabella(t8.head, t8.rows, { mono: true, center: true, stretta: true, ev: (i, j, c) => j > 0 && c === '1', didascalia: 'Tabella del prodotto modulo 8. I numeri pari (2, 4, 6) non hanno un 1 nella riga: non hanno inverso, perché non sono coprimi con 8.' }),

    sez('Numeri primi e coprimi'),
    ul([
      '<b>Primo</b>: ha solo due divisori, 1 e se stesso. 2, 3, 5, 7, 11, … 53, 61.',
      '<b>Coprimi</b>: due numeri sono coprimi se non hanno fattori in comune, cioè se hanno <b>MCD = 1</b>. 8 e 15 sono coprimi anche se nessuno dei due è primo.',
    ]),

    sez('Il massimo comun divisore'),
    p('MCD(a, b) è il più grande numero che divide sia a sia b. Il metodo della scuola scompone in fattori primi e prende quelli comuni: 36 = 2²·3² e 60 = 2²·3·5, quindi MCD = 2² · 3 = 12. Ma scomporre è lento per numeri grandi, e per RSA servono numeri con centinaia di cifre: bisogna calcolare il MCD <b>senza</b> fattorizzare.'),
    sub('L\'algoritmo di Euclide'),
    ricorda('MCD(a, b) = MCD(b, a mod b). Un numero che divide a e b divide anche il resto: si rimpicciolisce il problema finché il resto è zero. L\'ultimo resto diverso da zero è il MCD.', 'Idea di Euclide'),
    esempio('MCD(3120, 17)', [
      p('Si divide, si prende il resto, si scala di un posto (il divisore diventa dividendo, il resto diventa divisore):'),
      tabella(['Divisione', 'a', 'b', 'Quoziente', 'Resto'], passiEuc, { mono: true, center: true, ev: (i, j) => i === passiEuc.length - 2 && j === 4 }),
      p(`L'ultimo resto diverso da zero è 1: MCD(3120, 17) = ${ev('1')}. I due numeri sono coprimi.`),
    ].join('')),

    sez('Euclide esteso e l\'inverso'),
    p('Oltre al MCD, l\'algoritmo può fornire due interi <b>s</b> e <b>t</b> tali che <b>MCD(a, b) = a·s + b·t</b> (i coefficienti di Bézout). Si mantengono, accanto ai resti, due colonne s e t con la stessa regola dei resti: ogni riga si ottiene sottraendo, dalla riga di due posizioni prima, il quoziente per la riga precedente. Si parte da (r, s, t) = (a, 1, 0) e (b, 0, 1).'),
    esempio('i coefficienti di Bézout di 3120 e 17', [
      tabella(['Passo', 'Quoziente q', 'Resto r', 's', 't'], righeEE, { mono: true, center: true, ev: (i) => i === ee.passi.length - 2 }),
      p(`Nella penultima riga il resto è 1, con s = 2 e t = −367: ${ev('1 = 3120 · 2 + 17 · (−367)')}. Si verifica: 6240 − 6239 = 1.`),
    ].join('')),
    sub('Dall\'esteso all\'inverso'),
    p('Da 1 = 3120·s + 17·t, lavorando modulo 3120 il primo termine sparisce e resta 17·t ≡ 1: <b>t è l\'inverso di 17 modulo 3120</b>. Qui t = −367, che modulo 3120 vale 3120 − 367 = 2753.'),
    p(`Verifica: 17 · 2753 = ${it(17 * 2753)} = ${Math.floor(17 * 2753 / 3120)} · 3120 + ${(17 * 2753) % 3120}. Quindi ${ev('17⁻¹ ≡ 2753 (mod 3120)')}. Questo numero sarà la chiave privata d di RSA nel capitolo 8.`),

    sez('La funzione φ di Eulero'),
    p('φ(n) è il numero di interi tra 1 e n che sono <b>coprimi</b> con n. Due regole bastano per RSA:'),
    ul(['φ(p) = p − 1 se p è primo;', 'φ(p · q) = (p − 1)(q − 1) se p e q sono primi distinti.']),
    p(`Esempio: φ(15) = φ(3·5) = 2 · 4 = 8, e infatti i numeri tra 1 e 15 coprimi con 15 sono ${coprimi15.join(', ')}: otto numeri. Per i numeri dell'esempio RSA, φ(3233) = φ(61·53) = 60 · 52 = ${60 * 52}.`),
    ricorda('Se <b>MCD(a, n) = 1</b> allora <b>a<sup>φ(n)</sup> ≡ 1 (mod n)</b> (teorema di Eulero).', 'La proprietà magica'),
    esempio('n = 15, φ(n) = 8', [
      p(`Per a = 2 (coprimo con 15): 2⁸ = 256 = 17 · 15 + 1, quindi 2⁸ ≡ ${eul(2, 15)} (mod 15). Per a = 3 e a = 5, invece, che non sono coprimi con 15 (hanno fattori in comune), la regola non vale: 3⁸ mod 15 = ${eul(3, 15)} e 5⁸ mod 15 = ${eul(5, 15)}, non 1.`),
    ].join('')),

    sez('Potenza modulare: square-and-multiply'),
    p('Cifrare con RSA significa calcolare m<sup>e</sup> mod n. La strada ingenua è calcolare prima la potenza e poi il resto. Con numeri veri è impraticabile:'),
    tabella(['Caso', 'Potenza', 'Cifre del risultato'], [
      ['65^17 (esempio giocattolo)', naive, String(naive.length)],
      ['m a 2048 bit, e = 65537', '(2^2048)^65537', 'circa ' + it(cifreRsa)],
    ], { mono: true }),
    p(`Con chiavi vere il numero intermedio avrebbe oltre ${it(cifreRsa)} cifre decimali, per ogni singola cifratura. Il risultato finale, invece, ha al massimo 617 cifre. La soluzione è ridurre modulo n a ogni moltiplicazione, così i numeri non superano mai n.`),
    p('Si scorre l\'esponente <b>in binario</b>. Per ogni bit, dal più significativo, si eleva al quadrato il risultato corrente; se il bit è 1 si moltiplica anche per la base. Ad ogni operazione si riduce modulo n. L\'esponente 17 in binario è 10001.'),
    esempio('65^17 mod 3233', [
      p(`Si parte da 1. Il risultato corrente si indica con r.`),
      tabella(['Bit', 'Dopo il quadrato', 'Moltiplico per 65?', 'r'], pm.passi.map((s) => [s.bit, String(s.dopoQuadrato), s.moltiplica ? `sì: ${s.dopoQuadrato} · 65 mod 3233` : 'no', String(s.valore)]), { mono: true, center: true }),
      p(`Risultato: 65¹⁷ mod 3233 = ${ev(String(pm.risultato))}. Sono bastati 5 quadrati e 2 moltiplicazioni invece di 16 moltiplicazioni: per esponenti grandi il risparmio è enorme (al più 2 · log₂ e operazioni).`),
    ].join('')),
    sub('In PHP'),
    codice(codiceDa('modulo-7-matematica-rsa/slide.html', 'CODICE_POT'), 'potenza-modulare.php'),
    p('Il bit meno significativo dell\'esponente si legge con <code>$esp &amp; 1</code>; <code>$esp &gt;&gt; 1</code> scarta il bit usato. Con interi a 64 bit la funzione è corretta finché <code>$mod</code> è sotto circa 3 miliardi (il prodotto <code>$risultato * $base</code> deve stare in un intero). Per numeri più grandi servono BigInt o la libreria GMP.'),

    sez('Facile in un verso, difficile nell\'altro'),
    p('Moltiplicare due primi è immediato. Ritrovare i due primi partendo dal prodotto richiede molti tentativi.'),
    tabella(['n', 'Fattori', 'Tentativi di divisione'], [
      ['3233', '53 · 61', String(ft.tentativi)],
      [String(1000003 * 1000033), '1000003 · 1000033', it(ft2.tentativi)],
    ], { mono: true, center: true }),
    p('Con numeri di 13 cifre (due primi di 7 cifre) la divisione per tentativi richiede già mezzo milione di passi; ogni cifra in più moltiplica il lavoro. Esistono algoritmi migliori, ma restano impraticabili per i numeri di RSA.'),
    ricorda('Una funzione è <b>unidirezionale</b> se è facile da calcolare e difficile da invertire. È <b>con botola</b> se esiste un\'informazione speciale che rende facile anche l\'inversione. Dati p e q, calcolare n = p · q è facile; dato n, trovare p e q è difficile; ma chi conosce p e q ricava φ(n) e quindi d. Il segreto del proprietario della chiave è la botola.', 'Funzione unidirezionale con botola'),

    ricorda(ul([
      '<b>Modulo</b>: si lavora con i resti, e si può ridurre prima di calcolare.',
      '<b>MCD</b> con Euclide; <b>inverso</b> con Euclide esteso se MCD = 1.',
      '<b>φ(p·q) = (p − 1)(q − 1)</b>; <b>a<sup>φ(n)</sup> ≡ 1</b> per a coprimo con n.',
      '<b>Square-and-multiply</b> per le potenze; fattorizzare è il verso difficile.',
    ])),

    domande([
      'Calcola 250 mod 7, (−11) mod 6 e 2^10 mod 11 ricorrendo, dove serve, alla riduzione prima del calcolo.',
      'Con l\'algoritmo di Euclide calcola MCD(462, 1071) scrivendo tutte le divisioni.',
      'Costruisci la tabella del prodotto modulo 9. Quali numeri hanno inverso? Perché gli altri no?',
      'Con Euclide esteso trova l\'inverso di 7 modulo 40 e verifica il risultato.',
      'Calcola φ(35) e φ(77). Quale proprietà di 35 e 77 hai usato?',
      'Calcola 7^13 mod 33 con square-and-multiply, scrivendo l\'esponente in binario e la tabella dei passi.',
      'Spiega perché per RSA si usa una funzione «con botola» e che cosa è la botola.',
    ]),
    rimandi([
      ['../modulo-7-matematica-rsa/slide.html', 'Slide del modulo 7', 'con i calcolatori interattivi'],
      ['../modulo-7-matematica-rsa/simulazione-euclide.html', 'Simulazione: Euclide, MCD e inverso', ''],
      ['../modulo-7-matematica-rsa/simulazione-potenza-modulare.html', 'Simulazione: potenza modulare', ''],
      ['../schede/esercizi-matematica-rsa.html', 'Scheda: esercizi di matematica per RSA', 'Euclide, inverso e potenze su carta'],
      ['../lab-php/06-rsa-giocattolo/scheda.html', 'Lab PHP 06: RSA giocattolo', 'mcd, inverso e potenza modulare in PHP'],
      ['../quiz/quiz.html?modulo=7', 'Quiz del modulo 7', ''],
    ]),
  ].join('\n');
});
