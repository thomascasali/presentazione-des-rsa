const L = require('./lib');
const { C, A, capitolo, sez, sub, p, ul, ol, m, ev, formula, tabella, ricorda, errore, nota, esempio, codice, codiceDa, domande, rimandi, esc, it } = L;

const mod26 = (n) => ((n % 26) + 26) % 26;
// Cesare a chiave numerica (serie di spostamenti): la chiave avanza solo sulle lettere.
function traccia(testo, chiave, decifra) {
  const k = chiave.map(mod26); let j = 0;
  return Array.from(String(testo)).map((ch) => {
    const code = ch.charCodeAt(0), up = code >= 65 && code <= 90, lo = code >= 97 && code <= 122;
    if (!up && !lo) return { c: ch, lettera: false, out: ch };
    const base = up ? 65 : 97, kk = k[j % k.length], x = code - base, y = mod26(x + (decifra ? -kk : kk));
    const r = { c: ch, lettera: true, j, k: kk, x, y, out: String.fromCharCode(base + y) };
    j++; return r;
  });
}
const seq = (t, k, d) => traccia(t, k, d).map((x) => x.out).join('');

module.exports = () => capitolo(2, 'Cesare con chiave numerica',
  'Una serie di numeri al posto di uno solo: la chiave si allunga e le frequenze delle lettere si confondono.', () => {
  const K = [3, 1, 4];
  // verifica incrociata con il motore: la serie 3-1-4 equivale alla chiave DBE di Vigenère
  if (seq('ATTACCO', K) !== C.vigenere('ATTACCO', 'DBE')) throw new Error('cap2: serie 3-1-4 diversa da Vigenère DBE');
  const ES = 'ATTACCO ALBA';
  const tr = traccia(ES, K).filter((x) => x.lettera);
  const cifES = seq(ES, K);
  const compl = K.map((k) => mod26(-k));
  if (seq(cifES, K, true) !== ES) throw new Error('cap2: decifratura');
  const trAtt = traccia('ATTACCO', K);
  const chiaviTab = [1, 2, 3, 4, 6, 8, 10, 12].map((n) => {
    const tot = 26n ** BigInt(n);
    const sec = Number(tot) / 1e9;
    let t;
    if (sec < 1e-3) t = 'meno di un millisecondo';
    else if (sec < 1) t = (sec * 1000).toFixed(1).replace('.', ',') + ' millisecondi';
    else if (sec < 60) t = sec.toFixed(1).replace('.', ',') + ' secondi';
    else if (sec < 3600) t = (sec / 60).toFixed(1).replace('.', ',') + ' minuti';
    else if (sec < 86400) t = (sec / 3600).toFixed(1).replace('.', ',') + ' ore';
    else if (sec < 86400 * 365) t = it(Math.round(sec / 86400)) + ' giorni';
    else t = it(Math.round(sec / 86400 / 365)) + ' anni';
    return [String(n), tot.toString().length > 12 ? tot.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : it(tot), t];
  });
  // attacco per colonne su un testo lungo
  const TESTO = 'La crittografia è l\'arte di nascondere il significato di un messaggio. Chi scrive trasforma le parole con una regola e una chiave, chi legge usa la stessa chiave per tornare al testo originale. Nei secoli questa idea è stata usata per proteggere lettere, ordini militari e segreti di stato, ma anche per giocare con gli amici.';
  const cifL = seq(C.normalizza(TESTO), K);
  const colonne = [0, 1, 2].map((c) => { let s = ''; for (let i = c; i < cifL.length; i += 3) s += cifL[i]; return s; });
  const trovati = colonne.map((c) => C.indovinaChiaveCesare(c).chiave);
  const spostamentiTrovati = trovati;
  const fq = colonne.map((c) => { const f = C.frequenze(c); return f.conteggi.map((n, i) => ({ l: A[i], n })).sort((a, b) => b.n - a.n).slice(0, 3).map((x) => x.l).join(' '); });

  return [
    sez('Un solo numero è poco'),
    p('Il cifrario di Cesare ha due punti deboli: ha solo 25 chiavi, che si provano tutte, e ogni lettera ha sempre la stessa sostituta, per cui le frequenze restano visibili. L\'idea più naturale per rimediare è cambiare lo spostamento <b>a ogni lettera</b>, seguendo una serie di numeri che si ripete.'),
    p('Con la chiave <b>3-1-4</b> la prima lettera si sposta di 3, la seconda di 1, la terza di 4; poi si ricomincia dal primo numero: 3, 1, 4, 3, 1, 4, 3… finché c\'è testo. Se la serie ha un solo numero si ottiene di nuovo il Cesare semplice: è un caso particolare. (Non va confuso con il cifrario affine, E(x) = a·x + b, una variante matematica che non fa parte di questo percorso.)'),

    sez('Esempio svolto: ATTACCO ALBA con 3-1-4'),
    p('La tabella elenca le lettere una per volta. Lo spostamento della <i>i</i>-esima lettera è il numero <i>i</i> mod 3 della chiave; la colonna «Numero» indica quale numero della chiave si usa.'),
    tabella(['Lettera', 'x', 'Numero della chiave', 'Spostamento', 'x + sposta.', 'Dopo il mod 26', 'Cifrata'],
      tr.map((t) => [t.c, String(t.x), String((t.j % 3) + 1), String(t.k), String(t.x + t.k), t.x + t.k > 25 ? `${t.x + t.k} − 26 = ${t.y}` : String(t.y), t.out]),
      { mono: true, center: true }),
    p(`Risultato: ${m(ES)} → ${ev(cifES)}. Le due T hanno spostamenti diversi (la prima 1, la seconda 4) e quindi danno lettere diverse: è il punto centrale del cifrario. Le due A di ATTACCO, invece, cadono entrambe sul numero 3 e danno la stessa lettera D, perché la lunghezza della chiave è 3 e la quarta lettera ha la stessa posizione nel giro della prima.`),

    sez('Spazi e punteggiatura: la chiave aspetta'),
    ricorda('In questo corso la chiave avanza <b>solo quando si cifra una lettera</b>. Spazi, cifre, punteggiatura e lettere accentate si copiano e non consumano nessun numero della chiave.', 'Convenzione'),
    tabella(['Carattere', ...Array.from('CIAO MONDO')], [
      ['Numero usato', ...traccia('CIAO MONDO', K).map((t) => (t.lettera ? String((t.j % 3) + 1) : '—'))],
      ['Spostamento', ...traccia('CIAO MONDO', K).map((t) => (t.lettera ? String(t.k) : '—'))],
      ['Cifrato', ...traccia('CIAO MONDO', K).map((t) => t.out === ' ' ? '␣' : t.out)],
    ], { mono: true, center: true, stretta: true }),
    p(`«CIAO MONDO» diventa ${ev(seq('CIAO MONDO', K))}. Dopo la O di CIAO (la quarta lettera, numero 1 del secondo giro) lo spazio non fa niente e la M, quinta lettera, usa il numero 2. È la stessa regola di Vigenère: chi riceve può contare le sole lettere. L'alternativa (far avanzare la chiave anche sugli spazi) è possibile, ma va scritta nelle regole: le due convenzioni danno cifrati diversi e due persone che usano convenzioni diverse non riescono a scambiarsi messaggi. È un piccolo esempio di <i>protocollo</i> da concordare.`),

    sez('Decifrare: la serie opposta'),
    p(`Decifrare è lo stesso algoritmo con i segni opposti: ogni lettera si sposta indietro di 3, 1, 4, 3, 1, 4… Equivale a spostare in avanti della serie «complementare» ${ev(compl.join('-'))}, perché ogni numero s si annulla con 26 − s.`),
    tabella(['Cifrata', ...tr.map((t) => t.out)], [
      ['Spostamento indietro', ...tr.map((t) => String(t.k))],
      ['In chiaro', ...tr.map((t) => t.c)],
    ], { mono: true, center: true, stretta: true }),
    p(`Si ritrova ${m('ATTACCOALBA')}.`),

    sez('Stessa lettera, sostituti diversi'),
    tabella(['Posizione', '1', '2', '3', '4', '5', '6', '7'], [
      ['In chiaro', ...'ATTACCO'.split('')],
      ['Spostamento', ...trAtt.map((t) => String(t.k))],
      ['Cifrato', ...trAtt.map((t) => t.out)],
    ], { mono: true, center: true }),
    p('La T diventa U la prima volta e X la seconda; la C diventa D e G. Cambiano i sostituti della stessa lettera, ma solo se cade su numeri diversi: con lo stesso numero la sostituzione è la stessa. Il cifrario non è più monoalfabetico: usa <b>tre alfabeti</b>, uno per ogni numero della chiave. Si dice <i>polialfabetico</i>.'),

    sez('Il cifrario in PHP'),
    p('Rispetto al capitolo 1 ci sono due novità: la chiave è un array di interi, e un contatore <code>$j</code> conta le lettere già cifrate, così che lo spostamento sia <code>$chiave[$j % $n]</code> (indice ciclico). Il ramo <code>else</code> usa <code>continue</code> perché sugli spazi la chiave non avanza.'),
    codice(codiceDa('modulo-2-cesare-generalizzato/slide.html', 'CODICE_SERIE'), 'cesare-generalizzato.php'),
    sub('Tre trabocchetti'),
    ul([
      '<b>Numeri negativi</b>: in PHP <code>-3 % 26</code> vale −3, non 23. Ogni numero della chiave va normalizzato.',
      '<b>Chiave vuota</b>: <code>$j % 0</code> è una divisione per zero (in PHP 8 lancia un\'eccezione). Va gestita prima del ciclo.',
      '<b>Contare lettere, non caratteri</b>: se <code>$j</code> aumentasse anche sugli spazi, il cifrato cambierebbe e non sarebbe più leggibile con la convenzione del corso. L\'errore non produce messaggi: si scopre solo confrontando con un esempio svolto a mano.',
    ]),

    sez('L\'attacco: quante chiavi?'),
    p('Ogni numero della chiave ha 26 valori. Con <i>n</i> numeri le chiavi sono 26<sup><i>n</i></sup>: crescono in modo esponenziale a ogni numero in più. La tabella stima il tempo per provarle tutte supponendo un miliardo di chiavi al secondo.'),
    tabella(['Numeri nella chiave', 'Chiavi possibili (26ⁿ)', 'Tempo per provarle tutte'], chiaviTab, { mono: true, center: false }),
    p('Il conto vale però soltanto per chi prova le chiavi una per una. La struttura del cifrario permette di fare molto meglio.'),
    sub('Le frequenze si appiattiscono'),
    p('Con più numeri la stessa lettera in chiaro finisce su lettere cifrate diverse, e il profilo delle frequenze del testo intero si appiattisce. L\'indice di coincidenza (IC), che misura quanto un testo somiglia all\'italiano (circa 0,074) o a lettere casuali (circa 0,038), scende al crescere della lunghezza della chiave. L\'attacco del capitolo 1 sul testo intero non funziona più.'),
    sub('Se conosci la lunghezza, ogni colonna è un Cesare'),
    p('Le lettere nelle posizioni 1, 4, 7… sono state spostate tutte dello stesso numero; lo stesso per le posizioni 2, 5, 8… e 3, 6, 9… Se si conosce la lunghezza <i>n</i> della chiave, si divide il testo cifrato in <i>n</i> <b>colonne</b> e ciascuna è un cifrario di Cesare con la sua chiave, che si rompe con le frequenze.'),
    esempio('un paragrafo cifrato con una chiave di lunghezza 3', [
      p(`Il testo cifrato (${cifL.length} lettere, senza spazi) viene diviso in 3 colonne di circa ${Math.round(cifL.length / 3)} lettere ciascuna. Le lettere più frequenti di ogni colonna e lo spostamento stimato con le frequenze sono:`),
      tabella(['Colonna', 'Lettere più frequenti', 'Spostamento stimato'], colonne.map((_, i) => [String(i + 1), fq[i], String(spostamentiTrovati[i])]), { mono: true, center: true }),
      p(`Le tre colonne forniscono ${ev(spostamentiTrovati.join('-'))}: la chiave è ricostruita. Con pochi caratteri per colonna la statistica sbaglia, quindi serve un testo abbastanza lungo.`),
    ].join('')),
    p('Resta una domanda: come si scopre la lunghezza della chiave? La risposta (Kasiski e indice di coincidenza) è nel capitolo 3. Se invece la chiave è di due numeri le chiavi sono soltanto 676: il computer le prova tutte e tiene quelle che producono una <i>parola probabile</i> attesa nel testo (per esempio «bonifico»).'),

    sez('Numeri o lettere: è la stessa chiave'),
    p(`Poiché A vale 0, B vale 1 e così via, una serie di numeri è una parola e viceversa. La chiave ${ev('3-1-4')} coincide con la chiave ${ev('DBE')} (D = 3, B = 1, E = 4): ATTACCO diventa ${ev(seq('ATTACCO', K))} con i numeri e ${ev(C.vigenere('ATTACCO', 'DBE'))} con la parola DBE. Il cifrario di Vigenère è esattamente questo, con una parola da ricordare al posto di una serie di numeri; lo studiamo nel capitolo 3.`),
    tabella(['Lettera', ...A.split('')], [['Numero', ...A.split('').map((_, i) => String(i))]], { mono: true, center: true, stretta: true }),

    sez('Debolezze'),
    tabella(['Cosa migliora', 'Cosa resta debole'], [
      ['Le chiavi crescono come 26ⁿ', 'La chiave si ripete: le colonne sono Cesare'],
      ['Le frequenze del testo intero si appiattiscono', 'Sequenze ripetute nel testo tradiscono la lunghezza'],
      ['Ancora semplice da spiegare e programmare', 'Una chiave di numeri è scomoda da ricordare'],
    ]),
    p('Più la chiave è lunga, meglio protegge. Il caso limite è una chiave lunga quanto il messaggio e usata una sola volta (one-time pad, capitoli 3 e 5).'),

    ricorda(ul([
      'La chiave è una <b>serie di numeri</b>: la <i>i</i>-esima lettera si sposta di chiave[<i>i</i> mod <i>n</i>].',
      'La chiave avanza solo sulle lettere. Decifrare = serie complementare (26 − s).',
      'Chiavi possibili: 26<sup>n</sup>. Ma ogni colonna è un Cesare, e si attacca con le frequenze.',
      'In PHP: indice ciclico <code>$j % $n</code>.',
    ])),

    domande([
      'Cifra «ATTENZIONE» con la chiave 2-5-1, indicando per ogni lettera lo spostamento usato.',
      'Qual è la serie complementare della chiave 7-0-19? Come si usa per decifrare?',
      'Perché nella chiave 3-1-4 le due T di ATTACCO danno lettere diverse mentre le due A danno la stessa?',
      'Quante chiavi ha un cifrario con serie di 6 numeri? Perché questo numero non è l\'unico indicatore della sicurezza?',
      'Descrivi come si attacca un testo cifrato con chiave di lunghezza nota. Che cosa cambia se la lunghezza non si conosce?',
      'Scrivi la chiave in lettere equivalente alla serie 12-20-13-0.',
    ]),
    rimandi([
      ['../modulo-2-cesare-generalizzato/slide.html', 'Slide del modulo 2', ''],
      ['../modulo-2-cesare-generalizzato/simulazione-chiave-numerica.html', 'Simulatore e sfida: Cesare a chiave numerica', 'trova la chiave di un messaggio intercettato'],
      ['../schede/bigliettini-cesare-generalizzato.html', 'Bigliettini a chiave numerica', 'da ritagliare'],
      ['../lab-php/02-cesare-generalizzato/scheda.html', 'Lab PHP 02: Cesare generalizzato', 'cifra, decifra e attacca con chiave di lunghezza nota'],
    ]),
  ].join('\n');
});
