const L = require('./lib');
const { C, A, capitolo, sez, sub, p, ul, ol, m, ev, formula, tabella, ricorda, errore, nota, esempio, codice, codiceDa, domande, rimandi } = L;

module.exports = () => capitolo(1, 'Il cifrario di Cesare',
  'Il più antico dei cifrari a sostituzione: come funziona, come si programma e perché si rompe in pochi minuti.', () => {
  const tr = C.cesareTraccia('ATTACCO', 3);
  const cif = C.cesare('ATTACCO', 3);
  const lettere = A.split('');
  const numeri = lettere.map((_, i) => String(i));
  const shift3 = lettere.map((_, i) => A[(i + 3) % 26]);
  const CIFRATO_BF = C.cesare('Domani verifica di reti', 11);
  const bf = C.forzaBruta(CIFRATO_BF);
  const righeBf = [];
  for (let i = 0; i < 13; i++) {
    const a = bf[i], b = bf[i + 13];
    righeBf.push([String(a.chiave), a.testo, b ? String(b.chiave) : '', b ? b.testo : '']);
  }
  const CAMPIONE = 'La crittografia è l\'arte di nascondere il significato di un messaggio. Chi scrive trasforma le parole con una regola e una chiave, chi legge usa la stessa chiave per tornare al testo originale. Nei secoli questa idea è stata usata per proteggere lettere, ordini militari e segreti di stato, ma anche per giocare con gli amici.';
  const cifratoF = C.cesare(CAMPIONE, 7);
  const f = C.frequenze(cifratoF);
  const top = f.conteggi.map((c, i) => ({ l: A[i], c, pc: f.percentuali[i] })).sort((a, b) => b.c - a.c).slice(0, 6);
  const itTop = Object.entries(C.FREQ_IT).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const freqIt = lettere.map((l) => C.FREQ_IT[l].toFixed(1).replace('.', ','));
  const chiaveTrovata = C.indovinaChiaveCesare(cifratoF).chiave;
  return [
    sez('Idea e storia'),
    p('Lo storico romano Svetonio racconta che Giulio Cesare, nelle lettere riservate, <b>sostituiva ogni lettera con quella tre posti più avanti</b> nell\'alfabeto: A diventa D, B diventa E, C diventa F e così via; dopo la Z si riparte dalla A. Svetonio attribuisce ad Augusto una versione con spostamento di un solo posto. Lo spostamento è la <b>chiave</b> del cifrario: per Cesare era 3.'),
    p('Il cifrario di Cesare è un cifrario a <b>sostituzione monoalfabetica</b>: ogni lettera in chiaro ha sempre la stessa lettera cifrata. Il termine tornerà con Vigenère. Il cifrario è il punto di partenza di tutto il percorso perché contiene già le idee che ritroveremo in DES e RSA: un algoritmo, una chiave, un attacco.'),

    sez('Come funziona: due alfabeti affiancati'),
    p('Per cifrare a mano si scrive l\'alfabeto due volte. Il secondo è <i>scorrevole</i>: lo si sposta della chiave. Per cifrare una lettera si cerca nella riga di sopra e si scrive quella che sta sotto di lei. Con chiave 3:'),
    tabella(['Chiaro', ...lettere], [['Cifrato', ...shift3]], { mono: true, center: true, stretta: true }),
    p(`Sulla X, sulla Y e sulla Z l'alfabeto «torna indietro» e si riparte dalla A: è già l'idea dell'aritmetica modulare, che formalizziamo nel prossimo paragrafo.`),

    sez('Dalle lettere ai numeri: l\'aritmetica modulare'),
    p('Per scrivere il cifrario in forma di calcolo si associa a ogni lettera un numero, partendo da <b>A = 0</b> (non da 1: in questo modo il resto della divisione funziona senza correzioni).'),
    tabella(['Lettera', ...lettere], [['Numero', ...numeri]], { mono: true, center: true, stretta: true }),
    formula('Cifrare: <b>E(x) = (x + k) mod 26</b> &nbsp;&nbsp;&nbsp; Decifrare: <b>D(y) = (y − k) mod 26</b>'),
    p('«mod 26» significa «il resto della divisione per 26»: è come un orologio con 26 ore. Se la somma supera 25 si sottrae 26 e si riparte da A. Nel capitolo 7 riprenderemo il modulo in modo sistematico, perché è la base di RSA.'),

    esempio('ATTACCO con chiave 3', [
      p('Si procede una lettera per volta: si trova il numero della lettera, si somma 3, si riduce modulo 26 e si torna alla lettera.'),
      tabella(['Lettera', 'x', 'x + 3', 'se oltre la Z: − 26', 'y', 'Cifrata'],
        tr.map((t) => [t.chiaro, String(t.indiceChiaro), String(t.indiceChiaro + 3), t.indiceChiaro + 3 > 25 ? `${t.indiceChiaro + 3} − 26 = ${t.indiceCifrato}` : '—', String(t.indiceCifrato), t.cifrato]),
        { mono: true, center: true }),
      p(`Risultato: ${m('ATTACCO')} → ${ev(cif)}. Le due T e le due C danno la stessa lettera cifrata (W e F): è una caratteristica di tutti i cifrari monoalfabetici, e ne approfitteremo per attaccarli.`),
    ].join('')),

    sez('Decifrare e contare le chiavi'),
    p('Decifrare è lo stesso algoritmo con il segno opposto: si sposta ogni lettera <b>indietro</b> di k posti (D = A + 3, quindi A = D − 3). Le chiavi utili sono <b>25</b>: con chiave 0 il testo non cambia, con chiave 26 si fa un giro completo e si torna alla chiave 0.'),
    p(`Una curiosità è la chiave 13, detta ROT13: applicata due volte restituisce l'originale, perché 13 + 13 = 26. Per esempio «Ciao» diventa «${C.cesare('Ciao', 13)}» e, cifrata di nuovo, torna «${C.cesare(C.cesare('Ciao', 13), 13)}».`),

    sez('Il resto con i numeri negativi'),
    errore(`Decifrando la lettera C (x = 2) con k = 5 si ottiene 2 − 5 = −3. In PHP, come in JavaScript, il resto ha il segno del dividendo: <span class="m">${-3} % 26</span> dà <span class="m ev">${(-3) % 26}</span>, non 23. Il valore corretto si ottiene con <span class="m ev">(((−3) % 26) + 26) % 26 = ${(((-3) % 26) + 26) % 26}</span>.`),
    p('La correzione («si somma 26, poi si fa di nuovo il resto») è la prima cosa da ricordare quando si programma un cifrario: la ritroveremo in tutti i capitoli seguenti.'),

    sez('Il cifrario in PHP'),
    p('Per cifrare una lettera servono due funzioni di PHP: <code>ord()</code> trasforma un carattere nel suo codice numerico (in ASCII A vale 65 e a vale 97), <code>chr()</code> fa il percorso inverso. Sottraendo il codice di A la lettera diventa un numero da 0 a 25; si somma la chiave, si fa il resto della divisione per 26 e si riconverte.'),
    tabella(['Passo', 'Operazione', 'Per la lettera X con k = 3'],
      [['1', 'ord(\'X\')', '88'], ['2', '− 65 (posizione nell\'alfabeto)', '23'], ['3', '+ k', '26'], ['4', '% 26', '0'], ['5', '+ 65, poi chr()', `'${C.cesare('X', 3)}'`]], { mono: true }),
    p('La funzione completa lavora su un intero testo. Tre scelte da notare: la chiave viene normalizzata tra 0 e 25 (anche se negativa o troppo grande), maiuscole e minuscole usano basi diverse (65 e 97), e tutto ciò che non è una lettera (spazi, cifre, punteggiatura, lettere accentate) viene copiato senza cambiarlo.'),
    codice(codiceDa('modulo-1-cesare/slide.html', 'CODICE_TESTO'), 'cesare.php'),

    sez('Attacco 1: la forza bruta'),
    p('Le chiavi sono solo 25: chi intercetta il messaggio le prova <b>tutte</b> e legge quale risultato ha senso. Un computer ci mette una frazione di millisecondo. Il testo cifrato dell\'esempio è <span class="m">' + CIFRATO_BF + '</span>; la tabella mostra il risultato della decifratura con ciascuna chiave.'),
    tabella(['Chiave', 'Testo', 'Chiave', 'Testo'], righeBf, { mono: true, evRiga: () => false, ev: (i, j, c) => j % 2 === 1 && /domani verifica di reti/i.test(c) }),
    p('Solo una riga è una frase italiana. Il programma può scegliere da solo confrontando le frequenze delle lettere con quelle dell\'italiano (punteggio chi-quadro): con testi molto corti la statistica può sbagliare, l\'occhio umano no.'),

    sez('Attacco 2: l\'analisi delle frequenze'),
    p('In italiano alcune lettere sono molto più comuni di altre. Poiché Cesare sposta tutte le lettere della stessa quantità, <b>il profilo delle frequenze resta uguale, ma traslato</b>. Se nel testo cifrato la lettera più frequente è, per esempio, la L, è probabile che sia la sostituta della E, e la chiave si legge subito.'),
    tabella(['Lettera', ...lettere], [['Frequenza %', ...freqIt]], { mono: true, center: true, stretta: true, didascalia: 'Frequenze approssimate delle lettere nell\'italiano scritto (valori usati dal motore crypto.js).' }),
    p(`Un esempio: il testo di un paragrafo sulla crittografia (${f.totale} lettere) viene cifrato con una chiave sconosciuta. Le lettere più frequenti nel cifrato sono:`),
    tabella(['Posizione', 'Lettera cifrata', 'Occorrenze', 'Percentuale'], top.map((t, i) => [String(i + 1), t.l, String(t.c), t.pc.toFixed(1).replace('.', ',') + ' %']), { mono: true, center: true }),
    p(`In italiano le più frequenti sono ${itTop.map((x) => x[0]).join(', ')}. Facendo scorrere il profilo italiano finché i picchi coincidono si trova lo spostamento: qui la chiave è ${ev(String(chiaveTrovata))}. L'attacco funziona bene con testi lunghi; con testi corti i profili sono rumorosi.`),

    sez('Perché Cesare non è sicuro'),
    tabella(['Cosa funziona', 'Cosa lo rompe'], [
      ['Semplice da spiegare e da programmare', 'Solo 25 chiavi: la forza bruta è immediata'],
      ['Ottimo per capire chiave, algoritmo e attacco', 'Ogni lettera ha sempre la stessa sostituta'],
      ['Ha ispirato cifrari più robusti', 'Le frequenze delle lettere restano visibili'],
    ]),
    p('Qui il problema è che le chiavi possibili sono troppo poche: in coerenza con il principio di Kerckhoffs, anche se l\'algoritmo è noto la sicurezza dovrebbe essere garantita dalla chiave, ma uno spazio di 25 chiavi non protegge nulla. I capitoli successivi mostrano come rimediare alle due debolezze.'),

    ricorda(ul([
      'Cesare sposta ogni lettera di <b>k posti</b>: E(x) = (x + k) mod 26, con A = 0.',
      'Decifrare = spostare indietro. Le chiavi utili sono 25.',
      'In PHP: <code>ord()</code>, <code>chr()</code>, <code>%</code>, con la correzione per i numeri negativi.',
      'Si rompe con la <b>forza bruta</b> (25 chiavi) o con le <b>frequenze</b> (profilo traslato).',
    ])),

    domande([
      'Cifra «RINVIO A LUNEDI» con chiave 5, scrivendo per ogni lettera numero, somma e resto.',
      'Decifra «WKLV LV D WHVW» sapendo che la chiave è 3.',
      'Perché le chiavi utili sono 25 e non 26? Che cosa succede con chiave 29?',
      'Calcola in PHP (a mano) il valore di −7 % 26 e spiega come ottenere il resto matematico corretto.',
      'Spiega perché l\'analisi delle frequenze funziona contro Cesare ma non basta a trovare la chiave di un testo di sole 6 lettere.',
      'Un cifrato di Cesare ha come lettera più frequente la Q. Quale chiave è plausibile? Su quale ipotesi si basa la risposta?',
    ]),
    rimandi([
      ['../modulo-1-cesare/slide.html', 'Slide del modulo 1', ''],
      ['../modulo-1-cesare/simulazione-ruota.html', 'Simulazione: la ruota di Cesare', 'anche da smartphone'],
      ['../modulo-1-cesare/gioco-rompi-cesare.html', 'Gioco: rompi il messaggio di Cesare', 'forza bruta e frequenze'],
      ['../schede/bigliettini-cesare.html', 'Bigliettini di Cesare', 'da ritagliare e scambiare'],
      ['../lab-php/01-cesare/scheda.html', 'Lab PHP 01: il cifrario di Cesare', 'completa, scrivi l\'inversa, scrivi l\'attacco'],
      ['../lab-php/05-frequenze/scheda.html', 'Lab PHP 05: analisi delle frequenze', ''],
    ]),
  ].join('\n');
});
