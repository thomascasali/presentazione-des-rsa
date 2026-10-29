const L = require('./lib');
const { C, A, capitolo, sez, sub, p, ul, ol, m, ev, formula, tabella, ricorda, errore, nota, esempio, codice, codiceDa, domande, rimandi, it } = L;

const PHP_CHIAVI = `<?php
function mcd(int $a, int $b): int {
    while ($b !== 0) { [$a, $b] = [$b, $a % $b]; }
    return $a;
}

function inverso(int $e, int $phi): int {
    [$r0, $r1] = [$phi, $e];
    [$t0, $t1] = [0, 1];
    while ($r1 !== 0) {
        $q = intdiv($r0, $r1);
        [$r0, $r1] = [$r1, $r0 - $q * $r1];
        [$t0, $t1] = [$t1, $t0 - $q * $t1];
    }
    return (($t0 % $phi) + $phi) % $phi;   // t può essere negativo
}

function generaChiavi(int $p, int $q, int $e): array {
    $n = $p * $q;
    $phi = ($p - 1) * ($q - 1);
    if (mcd($e, $phi) !== 1) { throw new InvalidArgumentException('e non è coprimo con phi'); }
    $d = inverso($e, $phi);
    return ['pub' => [$e, $n], 'priv' => [$d, $n]];
}`;
const PHP_CIFRA = `<?php
// potenzaModulare() è quella del capitolo 7 (square-and-multiply)
function cifra(int $m, array $pub): int {
    return potenzaModulare($m, $pub[0], $pub[1]);      // c = m^e mod n
}

function decifra(int $c, array $priv): int {
    return potenzaModulare($c, $priv[0], $priv[1]);    // m = c^d mod n
}

function attacco(int $n, int $e): int {
    for ($p = 2; $p * $p <= $n; $p++) {                 // fattorizzazione ingenua
        if ($n % $p === 0) {
            $q = intdiv($n, $p);
            return inverso($e, ($p - 1) * ($q - 1));   // ricava d
        }
    }
    throw new InvalidArgumentException('n è primo: non è una chiave RSA');
}`;

const lettereBlocco = 2;

module.exports = () => capitolo(8, 'RSA',
  'Il cifrario a chiave pubblica: chiavi, cifratura, firma digitale e perché non si rompe.', () => {
  const K = C.rsa.genera(61, 53, 17);
  const M0 = 65n;
  const C0 = C.rsa.cifra(M0, K.pub);
  const S0 = C.rsa.firma(M0, K.priv);
  if (C0 !== 2790n || C.rsa.decifra(C0, K.priv) !== M0 || !C.rsa.verifica(S0, M0, K.pub)) throw new Error('cap8: rsa');
  const ED = K.e * K.d, KED = (ED - 1n) / K.phi;
  const pmC = C.potenzaModularePassi(M0, K.e, K.n);
  const pmD = C.potenzaModularePassi(C0, K.d, K.n);
  const righePot = (pm) => pm.passi.map((s) => [s.bit, String(s.dopoQuadrato), s.moltiplica ? 'sì' : 'no', String(s.valore)]);
  // parola -> numeri
  const PAR = 'CIAO';
  const cifre = []; for (let i = 0; i < PAR.length; i += lettereBlocco) cifre.push(Array.from(PAR.slice(i, i + lettereBlocco)).map((c) => ('0' + (c.charCodeAt(0) - 64)).slice(-2)).join(''));
  const blocchi = cifre.map((c) => BigInt(c));
  const bc = blocchi.map((b) => C.rsa.cifra(b, K.pub)), bd = bc.map((c) => C.rsa.decifra(c, K.priv));
  if (bd.map(String).join() !== blocchi.map(String).join()) throw new Error('cap8: blocchi');
  // fattorizzazione
  const ft = C.fattorizza(3233n);
  const cifre2048 = (1n << 2048n).toString().length;
  const cifreRad = (1n << 1023n).toString().length;
  const dAtt = C.inversoModulare(17n, BigInt((ft.fattori[0] - 1n) * (ft.fattori[1] - 1n)));
  return [
    sez('Il problema della chiave condivisa'),
    p('Con un cifrario simmetrico mittente e destinatario hanno <b>la stessa chiave</b>. Ma come se la scambiano, se il canale non è sicuro? Ci sono due problemi: distribuire la chiave in modo sicuro, e gestire un numero di chiavi che cresce con il quadrato delle persone (n(n−1)/2, come si è visto nel capitolo 0: 4950 chiavi per 100 persone). La soluzione di RSA: due chiavi diverse, una pubblica e una privata.'),

    sez('Come nasce la chiave pubblica'),
    tabella(['Anno', 'Evento'], [
      ['1973', 'Clifford Cocks, al GCHQ britannico, ideò un sistema equivalente a RSA. Rimase segreto fino al 1997.'],
      ['1976', 'Diffie e Hellman (con Merkle) pubblicano «New Directions in Cryptography»: scambio di chiavi su canale pubblico.'],
      ['1977', 'Rivest, Shamir e Adleman, al MIT, inventano RSA. Descrizione formale nel 1978.'],
      ['2000', 'Scade il brevetto statunitense di RSA: l\'algoritmo diventa libero.'],
    ]),
    p('RSA sono le iniziali dei tre autori: Rivest, Shamir, Adleman. Diffie e Hellman propongono l\'idea e un metodo per accordarsi su una chiave; RSA è il primo cifrario a chiave pubblica pubblicato che serve anche per cifrare e firmare.'),

    sez('Due chiavi: una pubblica, una privata'),
    p('Bob genera le due chiavi e pubblica la chiave pubblica. Alice cifra il messaggio con la pubblica di Bob; il messaggio cifrato circola in chiaro sulla rete; solo Bob lo decifra con la sua privata.'),
    ul([
      '<b>Il lucchetto aperto</b>: la chiave pubblica è un lucchetto aperto. Chiunque può chiuderlo, solo Bob ha la chiave per riaprirlo.',
      '<b>Condizione</b>: dalla chiave pubblica non deve essere possibile ricavare quella privata (se non con un lavoro impraticabile).',
    ]),

    sez('Generare le chiavi in 5 passi'),
    p('Si usano numeri piccoli per poter seguire i calcoli a mano. Nella realtà p e q hanno centinaia di cifre.'),
    tabella(['Passo', 'Operazione', 'Esempio'], [
      ['1', 'Scegli due numeri primi p e q (segreti, diversi)', `p = 61, q = 53 (primi: ${C.isPrimo(61)}, ${C.isPrimo(53)})`],
      ['2', 'Calcola n = p · q (il «modulo», pubblico)', `n = 61 · 53 = ${K.n}`],
      ['3', 'Calcola φ(n) = (p − 1)(q − 1) (segreto: serve conoscere p e q)', `φ(n) = 60 · 52 = ${K.phi}`],
      ['4', 'Scegli e con 1 < e < φ(n) e MCD(e, φ(n)) = 1 (nella pratica spesso 65537)', `e = 17: MCD(17, ${K.phi}) = ${C.mcd(17n, K.phi)}`],
      ['5', 'Calcola d, inverso di e modulo φ(n) (Euclide esteso)', `d = 17⁻¹ mod ${K.phi} = ${K.d}`],
    ]),
    p(`Verifica del passo 5: 17 · ${K.d} = ${ED} = ${KED} · ${K.phi} + ${ED % K.phi}. Il calcolo di d con la tabella di Euclide esteso è nel capitolo 7.`),
    ricorda(`<b>Chiave pubblica</b>: (e, n) = (${K.e}, ${K.n}). <b>Chiave privata</b>: (d, n) = (${K.d}, ${K.n}). Si buttano p, q e φ(n).`, 'Le due chiavi'),

    sez('Cifrare e decifrare'),
    formula('Cifratura: <b>c = m<sup>e</sup> mod n</b> &nbsp;&nbsp;&nbsp; Decifratura: <b>m = c<sup>d</sup> mod n</b>'),
    p('Il messaggio m deve essere un numero minore di n. Per cifrare si usa solo la chiave pubblica; per decifrare serve la privata.'),
    esempio('cifrare m = 65', [
      p(`c = 65¹⁷ mod 3233, con square-and-multiply (esponente 17 = ${m(pmC.esponenteBinario)} in binario):`),
      tabella(['Bit', 'Dopo il quadrato', 'Moltiplico per 65?', 'r'], righePot(pmC), { mono: true, center: true }),
      p(`Il testo cifrato è ${ev(String(C0))}.`),
    ].join('')),
    esempio('decifrare c = 2790', [
      p(`m = 2790²⁷⁵³ mod 3233. L'esponente d = 2753 in binario è ${m(pmD.esponenteBinario)}, 12 bit: bastano 12 quadrati e poche moltiplicazioni.`),
      tabella(['Bit', 'Dopo il quadrato', 'Moltiplico per 2790?', 'r'], righePot(pmD), { mono: true, center: true }),
      p(`Si ritrova ${ev(String(pmD.risultato))}: il messaggio originale.`),
    ].join('')),

    sez('Perché funziona: l\'intuizione di Eulero'),
    p(`Dal capitolo 7: se m è coprimo con n, allora m<sup>φ(n)</sup> ≡ 1 (mod n). Poiché d è l'inverso di e modulo φ(n), si ha e · d = 1 + k · φ(n) per un certo intero k; qui e · d = 17 · ${K.d} = ${ED} = 1 + ${KED} · ${K.phi}. Allora:`),
    formula(`(m<sup>e</sup>)<sup>d</sup> = m<sup>e·d</sup> = m<sup>1 + ${KED}·φ</sup> = m · (m<sup>φ</sup>)<sup>${KED}</sup> ≡ m · 1<sup>${KED}</sup> = <b>m</b>`),
    p('La decifratura annulla la cifratura: per questo d si sceglie come inverso di e modulo φ(n). Il caso (rarissimo) di m non coprimo con n funziona comunque: la dimostrazione completa usa il teorema cinese del resto.'),

    sez('Dalle parole ai numeri'),
    p(`RSA cifra <b>numeri</b> minori di n. Per le parole serve una codifica e dei blocchi: si associa a ogni lettera un numero di due cifre (A = 01, B = 02, … Z = 26) e si uniscono le lettere a gruppi. Con n = 3233 si possono unire due lettere: il blocco massimo è 2626 &lt; 3233. La parola «${PAR}» diventa i blocchi ${m(cifre.join(' '))}, cioè i numeri ${m(blocchi.join(', '))}.`),
    tabella(['Blocco m', 'Cifrato c = m¹⁷ mod 3233', 'Decifrato c²⁷⁵³ mod 3233'], blocchi.map((b, i) => [String(b), String(bc[i]), String(bd[i])]), { mono: true, center: true }),
    errore('Se n è piccolo (n ≤ 2626) si può usare un blocco di una sola lettera: RSA diventa allora una semplice sostituzione monoalfabetica, rompibile con le frequenze (capitolo 1).'),

    sez('La firma digitale: stesse chiavi, ruoli invertiti'),
    p('Se si applica la chiave <b>privata</b> al messaggio, chiunque può controllare il risultato con la chiave <b>pubblica</b>. Solo chi possiede d può produrre una firma che la chiave pubblica verifica: è la prova dell\'autore e dell\'integrità.'),
    tabella(['Passo', 'Operazione', 'Chiave'], [
      ['Firma', 's = m^d mod n', 'privata'],
      ['Invio', '(messaggio m, firma s)', ''],
      ['Verifica', 's^e mod n', 'pubblica'],
      ['Esito', 'se è uguale a m, la firma è autentica', ''],
    ]),
    p(`Firma di ${M0}: ${M0}^${K.d} mod ${K.n} = ${ev(String(S0))}. Verifica: ${S0}^${K.e} mod ${K.n} = ${ev(String(C.potenzaModulare(S0, K.e, K.n)))}, che coincide con il messaggio. Se qualcuno modifica m, la verifica fallisce.`),
    sub('Si firma l\'impronta, non il documento'),
    p('Firmare direttamente un documento lungo richiederebbe molti blocchi RSA, lenti. Si firma invece una sua <b>impronta</b> (hash) di lunghezza fissa. Chi riceve ricalcola l\'impronta, applica la chiave pubblica alla firma e confronta i due risultati (capitolo 9).'),
    sub('Chi può fare cosa'),
    tabella(['Obiettivo', 'Chi opera', 'Chiave usata', 'Chi controlla', 'Chiave usata'], [
      ['Riservatezza (cifrare)', 'Mittente', 'Pubblica del destinatario', 'Destinatario (decifra)', 'Privata del destinatario'],
      ['Autenticità (firmare)', 'Autore', 'Privata dell\'autore', 'Chiunque (verifica)', 'Pubblica dell\'autore'],
    ]),
    p('Tutti possono cifrare per Bob e verificare le firme di Bob: serve solo la sua chiave pubblica. Solo Bob può decifrare i messaggi per Bob e firmare a nome di Bob: serve la sua chiave privata. Cifrare e firmare si possono combinare: firma con la propria privata e cifra con la pubblica del destinatario.'),

    sez('Sicurezza: fattorizzare n'),
    p(`L'attaccante vede n ed e. Se fattorizza n ricava φ(n), poi d, e legge tutto. Con n = ${K.n} è immediato: dividendo per tentativi si trova ${ev(ft.fattori.join(' · '))} dopo ${ft.tentativi} tentativi. Da lì φ = ${ft.fattori[0] - 1n} · ${ft.fattori[1] - 1n} = ${K.phi}, e l'inverso di 17 modulo ${K.phi} (Euclide esteso) è ${dAtt}: la chiave privata. Il codice PHP dell'attacco è alla fine del capitolo.`),
    sub('Con 2048 bit: un altro mondo'),
    tabella(['', 'Esempio', 'RSA-2048'], [
      ['Cifre di n', '4', String(cifre2048)],
      ['Divisioni per tentativi (circa √n/2)', String(ft.tentativi), 'circa 10^' + (cifreRad - 1)],
    ], { mono: true }),
    p(`Anche a un miliardo di miliardi (10^18) di divisioni al secondo servirebbero circa 10^${cifreRad - 19} secondi. L'età dell'universo è circa 4·10^17 secondi. Esistono algoritmi molto più rapidi della divisione per tentativi, ma restano impraticabili a questa dimensione.`),
    sub('I record di fattorizzazione'),
    tabella(['Numero', 'Cifre', 'Bit', 'Fattorizzato'], [
      ['RSA-129', '129', '426', '1994'], ['RSA-768', '232', '768', '2009'], ['RSA-240', '240', '795', '2019'], ['RSA-250', '250', '829', '2020'], ['RSA-2048', '617', '2048', 'non fattorizzato'],
    ], { mono: true, center: true }),
    p('Per dare l\'idea, la fattorizzazione di RSA-250 (2020) è costata circa 2700 anni-core di calcolo su tanti computer. Un RSA-2048 è molto più grande: la difficoltà cresce in modo rapidissimo con i bit. Fonti: sfide RSA Laboratories; annunci dei team di ricerca per RSA-240 e RSA-250.'),
    sub('Dimensioni consigliate'),
    tabella(['Modulo RSA', 'Sicurezza equivalente', 'Giudizio'], [
      ['1024 bit', '80 bit', 'Non più accettabile'], ['2048 bit', '112 bit', 'Minimo attuale'], ['3072 bit', '128 bit', 'Consigliato per i nuovi sistemi'], ['7680 bit', '192 bit', 'Alta sicurezza'], ['15360 bit', '256 bit', 'Massima sicurezza (poco pratico)'],
    ], { mono: true }),
    p('Valori della raccomandazione NIST SP 800-57. «Sicurezza equivalente» indica un lavoro paragonabile alla forza bruta su una chiave simmetrica di quella lunghezza. Per avere la stessa sicurezza di AES a 128 bit serve una chiave RSA di 3072 bit: un motivo in più per usare RSA solo dove serve.'),

    sez('RSA «da libro» è insicuro'),
    p('Se a ogni messaggio corrisponde sempre lo stesso cifrato (RSA <b>deterministico</b>), l\'attaccante può provare tutti i messaggi possibili con la chiave pubblica e confrontare i risultati con il cifrato intercettato. Con messaggi di poche possibilità («sì» o «no») basta provarli tutti.'),
    tabella(['Problemi dell\'RSA «da libro»', 'Rimedio: il padding'], [
      ['Deterministico: stessa m, stesso c', '<b>OAEP</b> per cifrare: aggiunge casualità e struttura (RFC 8017)'],
      ['Messaggi corti: se m^e < n basta una radice e-esima, senza modulo', '<b>PSS</b> per firmare (RFC 8017)'],
      ['Malleabile: dai cifrati si costruiscono altri cifrati validi', 'Si usa sempre una libreria collaudata (OpenSSL), mai codice scritto a mano'],
    ].map((r) => r.map((x) => L.raw(x)))),
    errore('Il nostro RSA giocattolo è ottimo per capire, ma non va mai usato per proteggere dati reali: numeri piccoli, nessun padding.', 'Attenzione'),

    sez('Il computer quantistico e l\'algoritmo di Shor'),
    p('Nel 1994 Peter Shor mostrò che un computer quantistico abbastanza grande potrebbe fattorizzare n in tempo polinomiale: RSA non reggerebbe. I computer quantistici attuali sono però lontanissimi dalle dimensioni richieste (le stime parlano di un numero enorme di qubit fisici corretti dagli errori): nessuno rompe oggi RSA-2048. Il NIST ha standardizzato nel 2024 i primi algoritmi di crittografia post-quantistica (FIPS 203, 204, 205) e promuove la transizione graduale; chi deve proteggere dati per molti anni inizia a pianificarla.'),

    sez('RSA e DES a confronto'),
    tabella(['', 'DES / AES (simmetrico)', 'RSA (asimmetrico)'], [
      ['Chiavi', 'Una sola, segreta, condivisa', 'Due: pubblica e privata'],
      ['Problema principale', 'Scambiare la chiave', 'Lentezza e dimensione dei numeri'],
      ['Velocità', 'Molto alta', 'Molto più bassa (ordini di grandezza)'],
      ['Messaggi', 'Lunghi quanto serve', 'Brevi: minori di n'],
      ['Usi tipici', 'Cifrare i dati', 'Scambiare chiavi, firmare'],
      ['Sicurezza', 'Forza bruta sulla chiave', 'Fattorizzazione di n'],
    ]),
    p('I due sistemi si completano: RSA risolve lo scambio della chiave, il cifrario simmetrico fa il lavoro pesante. È la crittografia ibrida del capitolo 9: così funzionano HTTPS e SSH.'),

    sez('RSA giocattolo in PHP'),
    p('Il programma usa soltanto interi, quindi funziona per numeri piccoli. La prima parte costruisce le chiavi (MCD, inverso con Euclide esteso, <code>generaChiavi()</code>). La seconda cifra, decifra e mostra l\'attacco a n piccolo. Per verificarlo: <code>cifra(65, [17, 3233])</code> deve dare ' + C0 + '; <code>decifra(' + C0 + ', [' + K.d + ', 3233])</code> deve restituire 65.'),
    codice(PHP_CHIAVI, 'rsa-chiavi.php'),
    codice(PHP_CIFRA, 'rsa-uso.php'),

    ricorda(ul([
      '<b>Chiavi</b>: n = p·q, φ = (p−1)(q−1), e coprimo con φ, d = e⁻¹ mod φ.',
      '<b>Cifra</b> c = m<sup>e</sup> mod n; <b>decifra</b> m = c<sup>d</sup> mod n. Firma e verifica: ruoli invertiti.',
      'La sicurezza sta nella <b>difficoltà di fattorizzare n</b>; servono almeno 2048 bit e il padding.',
    ])),

    domande([
      'Con p = 11, q = 13 ed e = 7 calcola n, φ(n) e d (con Euclide esteso). Verifica che e · d ≡ 1 (mod φ).',
      'Con le chiavi dell\'esercizio precedente cifra m = 9 e poi decifra il risultato. Quanti quadrati servono con square-and-multiply?',
      'Perché per cifrare si usa la chiave pubblica del destinatario e per firmare la propria chiave privata? Che garanzia si ottiene nei due casi?',
      'Se un attaccante conosce n = 3233 ed e = 17, che cosa gli manca per leggere i messaggi? Come può ottenerlo e perché non è fattibile con 2048 bit?',
      'Perché m deve essere minore di n? Come si codifica una parola con n = 3233?',
      'Che cos\'è il padding OAEP e quale difetto dell\'RSA «da libro» risolve?',
      'Perché RSA non si usa per cifrare un intero file? Che cosa si fa in pratica?',
    ]),
    rimandi([
      ['../modulo-8-rsa/slide.html', 'Slide del modulo 8', ''],
      ['../modulo-8-rsa/simulazione-rsa.html', 'Simulatore RSA giocattolo', 'cifra, decifra, firma; anche da smartphone'],
      ['../modulo-8-rsa/gioco-rsa-di-classe.html', 'Gioco: RSA di classe', 'ogni studente genera la coppia di chiavi'],
      ['../schede/rsa-di-classe.html', 'Scheda: RSA di classe', 'da stampare'],
      ['../lab-php/06-rsa-giocattolo/scheda.html', 'Lab PHP 06: RSA giocattolo', 'MCD, inverso, potenza modulare e attacco'],
      ['../quiz/quiz.html?modulo=8', 'Quiz del modulo 8', ''],
    ]),
  ].join('\n');
});
