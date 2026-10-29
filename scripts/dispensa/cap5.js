const L = require('./lib');
const { C, A, capitolo, sez, sub, p, ul, ol, m, ev, formula, tabella, ricorda, errore, nota, esempio, codice, domande, rimandi, bitsSpazi, hexSpazi } = L;

const contaUni = (b) => [...b].filter((x) => x === '1').length;

module.exports = () => capitolo(5, 'Cifrari moderni: bit e XOR',
  'Dai caratteri ai bit, dalla porta XOR ai cifrari a blocchi: le idee che portano al DES.', () => {
  const byteHex = (s) => C.testoAHex(s).match(/../g);
  const bitCiao = C.testoABit('Ciao');
  const b8 = (b) => b.match(/.{8}/g);
  const t = (a, b) => [a, b, C.xor(a, b)];
  // cifrario XOR su testo
  const MSG = 'CIAO', KEY = 'LUNA';
  const mB = C.testoABit(MSG), kB = C.testoABit(KEY);
  const cB = C.xorCiclico(mB, kB);
  if (C.bitATesto(C.xorCiclico(cB, kB)) !== MSG) throw new Error('cap5: xor');
  // chiave corta e ripetuta
  const FRASE = 'Gentile cliente, la informiamo';
  const KEY2 = 'LUNA';
  const fB = C.testoABit(FRASE), cFB = C.xorCiclico(fB, C.testoABit(KEY2));
  const ipotesi = 'Gent';
  const recuperata = C.bitATesto(C.xor(cFB.slice(0, 32), C.testoABit(ipotesi)));
  // one-time pad: due messaggi stessa chiave
  const M1 = 'SI', M2 = 'NO', KP = 'q7';
  const c1 = C.xor(C.testoABit(M1), C.testoABit(KP)), c2 = C.xor(C.testoABit(M2), C.testoABit(KP));
  const dC = C.xor(c1, c2), dM = C.xor(C.testoABit(M1), C.testoABit(M2));
  if (dC !== dM) throw new Error('cap5: otp');
  // effetto valanga con il DES
  const KD = '133457799BBCDFF1', P0 = '0123456789ABCDEF', P1 = '0123456789ABCDEE';
  const t0 = C.des.traccia(P0, KD), t1 = C.des.traccia(P1, KD);
  const bitDiff = (x, y) => contaUni(C.xor(x, y));
  const r1 = t0.round.map((r, i) => [String(r.n), String(bitDiff(r.uscita.L + r.uscita.R, t1.round[i].uscita.L + t1.round[i].uscita.R))]);
  const cifDiff = bitDiff(C.hexABit(t0.output), C.hexABit(t1.output));
  const hexChars = '0123456789ABCDEF'.split('').map((c) => [c, String(parseInt(c, 16)), C.hexABit(c)]);
  return [
    sez('Dai caratteri ai bit'),
    p('Un cifrario moderno non sposta lettere: trasforma <b>sequenze di bit</b>. Ogni dato (testo, immagine, file) è una sequenza di byte; se il cifrario lavora sui bit, funziona su qualunque dato e non solo sulle lettere dell\'alfabeto.'),
    p('Il testo «Ciao» passa da caratteri a codici numerici, poi a byte (che si scrivono in esadecimale) e infine a bit:'),
    tabella(['Carattere', ...'Ciao'.split('')], [
      ['Codice (decimale)', ...Array.from(new TextEncoder().encode('Ciao')).map(String)],
      ['Byte (esadecimale)', ...byteHex('Ciao')],
      ['Bit', ...b8(bitCiao)],
    ], { mono: true, center: true }),
    sub('ASCII e UTF-8'),
    p('<b>ASCII</b> assegna un numero a ogni carattere base (A = 65, a = 97, cifra 0 = 48, spazio = 32). <b>UTF-8</b> lo estende: i caratteri comuni usano 1 byte, gli altri da 2 a 4. Una lettera accentata o il simbolo dell\'euro occupano più byte, il che spiega perché nel codice PHP dei capitoli precedenti le lettere accentate non vengono cifrate: ciascun byte è fuori dall\'intervallo A-Z.'),
    tabella(['Carattere', 'Byte in UTF-8 (esadecimale)', 'Numero di byte'], [
      ['A', C.testoAHex('A'), '1'], ['a', C.testoAHex('a'), '1'], ['è', C.testoAHex('è'), '2'], ['€', C.testoAHex('€'), '3'],
    ], { mono: true, center: true }),
    sub('Esadecimale: i bit in breve'),
    p('Leggere 64 bit è faticoso. Si raggruppano a <b>4 bit</b> e ogni gruppo diventa una cifra: 0-9 e poi A-F. Un byte sono quindi 2 cifre. Il DES scriverà il blocco di 64 bit con 16 cifre esadecimali, per esempio 0123456789ABCDEF.'),
    tabella(['Cifra', ...hexChars.map((x) => x[0])], [['Decimale', ...hexChars.map((x) => x[1])], ['Bit', ...hexChars.map((x) => x[2])]], { mono: true, center: true, stretta: true }),

    sez('XOR: l\'operazione dei cifrari'),
    p('XOR (⊕, «o esclusivo») dà <b>1 se i due bit sono diversi</b>, 0 se sono uguali.'),
    tabella(['A', 'K', 'A ⊕ K'], [['0', '0', '0'], ['0', '1', '1'], ['1', '0', '1'], ['1', '1', '0']], { mono: true, center: true }),
    p('Su due sequenze di bit si opera bit per bit. Dove la chiave ha un 1 il bit del messaggio viene invertito; dove ha uno 0 resta com\'è: la chiave funziona da interruttore.'),
    tabella(['', 'bit'], [['A', '01101001'], ['K', '10110100'], ['A ⊕ K', C.xor('01101001', '10110100')]], { mono: true }),
    sub('Le proprietà'),
    ul(['A ⊕ 0 = A', 'A ⊕ A = 0', 'A ⊕ K = K ⊕ A', '(A ⊕ K) ⊕ K = A ⊕ (K ⊕ K) = A ⊕ 0 = <b>A</b>']),
    ricorda('Per cifrare e per decifrare si fa la <b>stessa operazione</b> con la stessa chiave. Non esiste un «algoritmo inverso». Verifica sul byte di prima: (A ⊕ K) ⊕ K = ' + C.xor(C.xor('01101001', '10110100'), '10110100') + ' = A.', 'Conseguenza'),

    sez('Il cifrario XOR sul testo'),
    p('Si trasforma il messaggio in byte e si fa lo XOR con la chiave, <b>ripetendola</b> se è più corta del messaggio.'),
    esempio(`messaggio «${MSG}» con chiave «${KEY}»`, [
      tabella(['Carattere', ...MSG.split('')], [
        ['Messaggio (bit)', ...b8(mB)],
        ['Chiave «' + KEY + '» (bit)', ...b8(kB)],
        ['XOR (bit)', ...b8(cB)],
        ['XOR (esadecimale)', ...C.bitAHex(cB).match(/../g)],
      ], { mono: true, center: true }),
      p(`Il cifrato è ${ev(C.bitAHex(cB))} (esadecimale). Per decifrare basta rifare lo XOR con la stessa chiave: ${m(C.bitAHex(cB))} ⊕ ${m(C.testoAHex(KEY))} = ${m(C.testoAHex(MSG))}, cioè «${MSG}». I byte del cifrato sono spesso caratteri non stampabili, per questo si mostra l'esadecimale.`),
    ].join('')),

    sez('One-time pad: la cifratura perfetta'),
    ricorda('Se la chiave è <b>casuale</b>, <b>lunga quanto il messaggio</b> e <b>usata una volta sola</b>, il cifrario XOR è il one-time pad. Claude Shannon dimostrò nel 1949 che in queste condizioni il cifrato non rivela nulla sul messaggio (segretezza perfetta).', 'Le tre regole'),
    sub('Se la chiave si riusa, crolla tutto'),
    p(`Con la stessa chiave su due messaggi, lo XOR dei cifrati <b>cancella la chiave</b>: C1 ⊕ C2 = (M1 ⊕ K) ⊕ (M2 ⊕ K) = M1 ⊕ M2. Esempio con i messaggi «${M1}» e «${M2}» e la chiave «${KP}»:`),
    tabella(['', 'Primo byte', 'Secondo byte'], [
      ['M1 «' + M1 + '»', ...b8(C.testoABit(M1))], ['M2 «' + M2 + '»', ...b8(C.testoABit(M2))], ['M1 ⊕ M2', ...b8(dM)],
      ['C1 = M1 ⊕ K', ...b8(c1)], ['C2 = M2 ⊕ K', ...b8(c2)], ['C1 ⊕ C2', ...b8(dC)],
    ], { mono: true, center: true }),
    p('Le ultime righe delle due metà coincidono: chi intercetta i due cifrati ottiene M1 ⊕ M2 senza conoscere la chiave, e da lì, con un po\' di ingegno o di testo noto, può risalire ai messaggi. Nel progetto Venona i crittoanalisti statunitensi lessero parti di messaggi sovietici proprio perché alcune pagine di one-time pad erano state riusate: «una volta sola» non è una raccomandazione.'),
    sub('Chiave corta e ripetuta: debole'),
    p(`Se la chiave è più corta del messaggio, si ripete; chi conosce (o indovina) l'inizio del testo la legge direttamente. Se Eve sospetta che il messaggio cominci con «${ipotesi}», fa lo XOR tra i primi byte del cifrato e quelli dell'ipotesi:`),
    tabella(['', ...ipotesi.split('')], [
      ['Cifrato (esadecimale)', ...C.bitAHex(cFB.slice(0, 32)).match(/../g)],
      ['Ipotesi «' + ipotesi + '» (esadecimale)', ...C.testoAHex(ipotesi).match(/../g)],
      ['XOR = chiave', ...C.bitAHex(C.xor(cFB.slice(0, 32), C.testoABit(ipotesi))).match(/../g)],
      ['Come testo', ...recuperata.split('')],
    ], { mono: true, center: true }),
    p(`Compare la chiave ${ev(recuperata)}, che ripetuta sul resto del cifrato decifra tutto il messaggio. Un attacco di questo tipo si chiama <i>a testo noto</i> (known plaintext).`),

    sez('Confusione e diffusione'),
    p('Nel 1949 Claude Shannon, in «Communication Theory of Secrecy Systems», indicò due proprietà che un buon cifrario deve avere. Sono ancora il criterio con cui si progettano i cifrari a blocchi.'),
    tabella(['Proprietà', 'Che cosa richiede', 'Come si ottiene'], [
      ['Confusione', 'Il legame tra chiave e cifrato deve essere complicato: ogni bit del cifrato dipende dalla chiave in modo non lineare', 'Sostituzione (S-box)'],
      ['Diffusione', 'Ogni bit del messaggio deve influenzare molti bit del cifrato, nascondendo le statistiche', 'Permutazione e più round'],
    ]),
    p('Cesare e il solo XOR hanno confusione e diffusione molto basse: un bit cambiato in ingresso cambia un solo bit in uscita.'),
    sub('Effetto valanga'),
    p('Un buon cifrario fa sì che cambiando <b>un solo bit</b> del messaggio cambi circa <b>metà</b> dei bit del cifrato. Con il DES (chiave ' + KD + ') si cifrano due blocchi che differiscono per un solo bit: ' + P0 + ' e ' + P1 + '.'),
    tabella(['Dopo il round', ...r1.map((x) => x[0])], [['Bit diversi su 64', ...r1.map((x) => x[1])]], { mono: true, center: true, stretta: true }),
    p(`Dopo pochi round i due blocchi differiscono già in circa metà dei bit; alla fine i due cifrati (${m(t0.output)} e ${m(t1.output)}) differiscono per ${ev(String(cifDiff))} bit su 64. Con un cifrario XOR la differenza sarebbe stata di 1 bit.`),

    sez('Cifrari a flusso e a blocchi'),
    tabella(['', 'A flusso', 'A blocchi'], [
      ['Idea', 'Genera una sequenza pseudocasuale di bit dalla chiave e la combina con il messaggio con XOR, bit per bit', 'Divide il messaggio in blocchi di lunghezza fissa; ogni blocco passa per più round di trasformazione'],
      ['Adatto a', 'Dati continui (comunicazioni in tempo reale)', 'Dati di qualsiasi lunghezza, con una modalità operativa (ECB, CBC…)'],
      ['Esempi', 'ChaCha20, RC4 (oggi sconsigliato)', 'DES (64 bit), AES (128 bit)'],
    ]),
    sub('Rete di sostituzione-permutazione'),
    p('Un cifrario a blocchi ripete più volte un round fatto di tre operazioni: XOR con una sottochiave del round, <b>S-box</b> (sostituzione: confusione), <b>P-box</b> (permutazione: diffusione). Ripetendo i round, ogni bit del blocco finisce per dipendere da ogni bit della chiave e del messaggio.'),
    sub('L\'idea della rete di Feistel'),
    p('Il DES non è una rete SP pura: usa la struttura di <b>Feistel</b>. Si divide il blocco in due metà, L (sinistra) e R (destra), e in ogni round: R passa invariata e diventa la nuova L; la funzione F(R, K) calcolata con la sottochiave viene combinata con XOR alla vecchia L, e il risultato diventa la nuova R.'),
    ricorda('La funzione F <b>non deve essere invertibile</b>: per decifrare si ripete la stessa struttura con le sottochiavi in ordine inverso. Nel capitolo 6 lo si vede passo per passo.', 'Il vantaggio'),

    ricorda(ul([
      'Il computer cifra <b>bit</b>: testo → byte (ASCII/UTF-8) → esadecimale.',
      'XOR: <b>A ⊕ K ⊕ K = A</b>. Con chiave casuale, lunga come il messaggio e usata una volta è perfetto; altrimenti è debole.',
      'Shannon: <b>confusione</b> (S-box) e <b>diffusione</b> (permutazioni, round, effetto valanga).',
      'Cifrari a flusso e a blocchi; reti SP e reti di Feistel.',
    ])),

    domande([
      'Scrivi in binario e in esadecimale la parola «Re» (codici ASCII 82 e 101).',
      'Calcola 10110010 ⊕ 01101100 e poi rifai lo XOR con 01101100: che cosa ottieni, e perché?',
      'Elenca le tre condizioni del one-time pad. Che cosa succede se la chiave viene usata due volte?',
      'Perché un cifrario XOR con chiave corta e ripetuta è debole se si conosce l\'inizio del messaggio?',
      'Spiega confusione e diffusione con un esempio per ciascuna. Perché Cesare non ha né l\'una né l\'altra?',
      'Descrivi un round di una rete di Feistel con le formule L′ = … e R′ = …; perché F non deve essere invertibile?',
    ]),
    rimandi([
      ['../modulo-5-cifrari-moderni/slide.html', 'Slide del modulo 5', ''],
      ['../modulo-5-cifrari-moderni/simulazione-xor.html', 'Simulazione: XOR bit a bit', 'anche da smartphone'],
      ['../quiz/quiz.html?modulo=5', 'Quiz del modulo 5', ''],
    ]),
  ].join('\n');
});
