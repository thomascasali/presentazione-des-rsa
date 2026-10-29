const L = require('./lib');
const { C, A, capitolo, sez, sub, p, ul, ol, m, ev, formula, tabella, ricorda, errore, nota, esempio, codice, codiceDa, domande, rimandi } = L;

module.exports = () => capitolo(4, 'La trasposizione',
  'Non cambiare le lettere: cambiare l\'ordine. Una famiglia di cifrari che ancora oggi è un ingrediente dei cifrari a blocchi.', () => {
  const MSG = 'ATTACCOALLALBADOMANI', KZ = 'ZEBRA', KC = 'CASA', KL = 'LUNA', MSG_PAD = 'ATTACCOALLALBA';
  const gZ = C.trasposizioneGriglia(MSG, KZ);
  const gC = C.trasposizioneGriglia(MSG, KC);
  const gP = C.trasposizioneGriglia(MSG_PAD, KL);
  if (C.trasposizioneColonneDecifra(gZ.cifrato, KZ) !== MSG) throw new Error('cap4: decifratura ZEBRA');
  if (C.trasposizioneColonneDecifra(gP.cifrato, KL) !== MSG_PAD + 'XX') throw new Error('cap4: decifratura LUNA ' + C.trasposizioneColonneDecifra(gP.cifrato, KL));
  const doppia = C.trasposizioneColonne(gZ.cifrato, KZ);
  const doppiaCon2 = C.trasposizioneColonne(gZ.cifrato, KL);
  const sostTrasp = C.trasposizioneColonne(C.vigenere(MSG, KL), KZ);
  const TESTO = 'La crittografia è l\'arte di nascondere il significato di un messaggio. Chi scrive trasforma le parole con una regola e una chiave, chi legge usa la stessa chiave per tornare al testo originale. Nei secoli questa idea è stata usata per proteggere lettere, ordini militari e segreti di stato, ma anche per giocare con gli amici.';
  const trasp = C.trasposizioneColonne(TESTO, 'CHIAVE');
  const icChiaro = C.indiceCoincidenza(TESTO), icTrasp = C.indiceCoincidenza(trasp), icCes = C.indiceCoincidenza(C.cesare(C.normalizza(TESTO), 7));
  const virg = (x) => x.toFixed(3).replace('.', ',');
  // griglia con intestazione: chiave e rango
  const grigliaConIntestazione = (g) => [
    ['Chiave', ...g.chiave.split('')],
    ['Turno di lettura', ...g.rango.map(String)],
    ...g.righe.map((r, i) => ['Riga ' + (i + 1), ...r]),
  ];
  // griglia per la decifratura: colonne di altezza 4 (20 / 5)
  const colDec = gZ.cifrato.match(/.{1,4}/g);
  const w = 5;
  return [
    sez('Sostituzione contro trasposizione'),
    tabella(['', 'Sostituzione', 'Trasposizione'], [
      ['Che cosa cambia', 'Le lettere; la posizione resta', 'La posizione; le lettere restano'],
      ['Esempio', 'ATTACCO → ' + C.cesare('ATTACCO', 3) + ' (Cesare, chiave 3)', 'ATTACCO → ' + C.trasposizioneColonne('ATTACCO', 'CHIAVE').slice(0, 7) + '… (colonne)'],
      ['Il cifrato è…', 'fatto di lettere diverse dal chiaro', 'un anagramma del chiaro'],
    ]),
    p('Se un attaccante vede solo il testo cifrato, su ciascuno dei due tipi ha informazioni diverse: nella sostituzione conosce la posizione ma non le lettere, nella trasposizione conosce le lettere ma non la posizione.'),

    sez('Le frequenze non cambiano'),
    p('Poiché le lettere sono le stesse, nel cifrato la E, la A, la I compaiono con la stessa frequenza dell\'italiano. Lo si vede con l\'indice di coincidenza (IC): su un paragrafo di prova, il testo in chiaro e quello trasposto hanno lo stesso IC. Lo conserva anche Cesare, perché sposta tutte le lettere allo stesso modo: l\'IC distingue i cifrari monoalfabetici e le trasposizioni da quelli polialfabetici, ma non li distingue tra loro.'),
    tabella(['Testo', 'Indice di coincidenza'], [
      ['In chiaro', virg(icChiaro)],
      ['Dopo la trasposizione (chiave CHIAVE)', virg(icTrasp)],
      ['Dopo Cesare (chiave 7)', virg(icCes)],
    ], { mono: true, center: true }),
    ul([
      'Un attacco a frequenze <b>non</b> dice nulla sulla chiave di una trasposizione: i conteggi sono quelli dell\'italiano.',
      'Ma è anche un indizio: se l\'IC è alto e i picchi cadono proprio su E, A, I, O, il cifrato è quasi certamente una <b>trasposizione</b>; se l\'IC è alto ma i picchi sono su altre lettere, è una sostituzione monoalfabetica (come Cesare).',
    ]),

    sez('Dalla scitala a ADFGVX'),
    p('La <b>scitala spartana</b> è una striscia di cuoio avvolta a spirale su un bastone: si scrive nel senso della lunghezza, poi si svolge. Letta srotolata, la striscia mostra lettere in disordine; solo chi ha un bastone dello stesso diametro rimette in ordine il testo. La <b>trasposizione a colonne</b> trasforma la striscia in una griglia: il numero di colonne è il «diametro» e la parola chiave decide l\'ordine di lettura. Nel 1918 i tedeschi usarono il cifrario <b>ADFGVX</b>: una sostituzione seguita da una trasposizione a colonne. Il francese Georges Painvin lo ruppe in pochi mesi.'),

    sez('La trasposizione a colonne'),
    ol([
      'Si sceglie una <b>parola chiave</b>: la sua lunghezza è il numero di colonne.',
      'Si scrive il testo nella griglia <b>per righe</b>.',
      'Si numerano le colonne secondo l\'<b>ordine alfabetico</b> delle lettere della chiave.',
      'Si leggono le colonne <b>una alla volta</b>, in quell\'ordine, dall\'alto in basso.',
    ]),
    p('La chiave contiene quindi due informazioni: la <b>larghezza</b> della griglia e l\'<b>ordine</b> delle colonne.'),
    esempio('ATTACCOALLALBADOMANI con la chiave ZEBRA', [
      p('La chiave ha 5 lettere: la griglia ha 5 colonne. Ordinate alfabeticamente le lettere sono A, B, E, R, Z, quindi la colonna della A (la quinta) si legge per prima, poi la B (terza), la E (seconda), la R (quarta) e infine la Z (prima).'),
      tabella(null, grigliaConIntestazione(gZ), { mono: true, center: true }),
      p('Si leggono le colonne dall\'alto in basso nell\'ordine 1, 2, 3, 4, 5 dei turni:'),
      tabella(['Turno', 'Colonna letta', 'Lettere'], gZ.ordine.map((c, i) => [String(i + 1), `colonna ${c + 1} (${KZ[c]})`, gZ.colonne[i]]), { mono: true, center: true }),
      p(`Mettendo in fila le colonne si ottiene ${ev(gZ.cifrato)}.`),
    ].join('')),

    sez('Lettere ripetute nella chiave'),
    p(`Se una lettera compare più volte nella chiave, la colonna <b>più a sinistra</b> ha la precedenza. Con la chiave ${m(KC)} le due A hanno i turni 1 e 2 (la prima A è la colonna 2, la seconda è la colonna 4).`),
    tabella(null, grigliaConIntestazione(gC), { mono: true, center: true }),
    p(`Ordine di lettura (numeri di colonna): ${m(gC.ordine.map((c) => c + 1).join(', '))}. Il cifrato è ${ev(gC.cifrato)}.`),

    sez('Quando il testo non riempie la griglia'),
    p(`Il testo ${m(MSG_PAD)} ha ${MSG_PAD.length} lettere e la chiave ${m(KL)} ha 4 colonne: ${MSG_PAD.length} non è un multiplo di 4, quindi l'ultima riga resta incompleta.`),
    ricorda('Si riempie sempre con <b>X</b> fino a una griglia completa. Decifrando si ottengono le X finali, da riconoscere e ignorare.', 'Convenzione di questo corso'),
    tabella(null, grigliaConIntestazione(gP), { mono: true, center: true }),
    p(`Il cifrato è ${ev(gP.cifrato)}: ${gP.cifrato.length} lettere, un multiplo di 4.`),

    sez('Decifrare: dal cifrato alla griglia'),
    p(`Chi decifra conosce la chiave (quindi la larghezza e l'ordine) e il numero di lettere. Con ${gZ.cifrato.length} lettere e ${w} colonne ogni colonna ha ${gZ.cifrato.length / w} lettere. Si procede così:`),
    ol([
      `Si taglia il cifrato in ${w} pezzi da ${gZ.cifrato.length / w} lettere: ${colDec.map((c) => m(c)).join(', ')}.`,
      `Il primo pezzo appartiene alla colonna con il turno 1 (qui la colonna ${gZ.ordine[0] + 1}), il secondo alla colonna con il turno 2 (${gZ.ordine[1] + 1}) e così via.`,
      'Si rimettono le colonne al loro posto e si legge la griglia <b>per righe</b>.',
    ]),
    tabella(['Turno', 'Pezzo di cifrato', 'Va nella colonna'], colDec.map((c, i) => [String(i + 1), c, `${gZ.ordine[i] + 1} (${KZ[gZ.ordine[i]]})`]), { mono: true, center: true }),
    p(`Leggendo per righe si ottiene ${ev(MSG)}. Se all'ultima riga compaiono delle X, sono il riempimento.`),
    errore('Contare male le lettere: se la lunghezza del cifrato non è un multiplo del numero di colonne, il testo è stato cifrato con un riempimento diverso. Con la convenzione del corso (sempre X fino alla griglia completa) la lunghezza è sempre un multiplo, e tutte le colonne hanno la stessa altezza.'),

    sez('Combinare i cifrari'),
    sub('Doppia trasposizione'),
    p(`Si ripete la trasposizione sul risultato, con la stessa chiave o con un'altra: le colonne si mescolano due volte. Due permutazioni in sequenza si compongono in una sola permutazione più complessa dell'intero testo. Con ZEBRA due volte ${m(MSG)} diventa ${ev(doppia)}; con ZEBRA e poi LUNA diventa ${ev(doppiaCon2)}.`),
    sub('Sostituzione più trasposizione'),
    p(`Si può prima sostituire e poi mescolare. ${m(MSG)} cifrato con Vigenère (chiave LUNA) dà ${m(C.vigenere(MSG, KL))}, e trasposto con ZEBRA diventa ${ev(sostTrasp)}.`),
    ricorda('Claude Shannon (1949) indicò nella <b>confusione</b> e nella <b>diffusione</b> i due ingredienti di un buon cifrario. La confusione rende complicato il legame tra chiave e cifrato e si ottiene con la <b>sostituzione</b>. La diffusione sparge l\'effetto di ogni lettera su molte posizioni e si ottiene con la <b>trasposizione</b>. DES alterna per 16 round S-box (sostituzioni) e permutazioni.', 'Ponte verso i cifrari moderni'),

    sez('Il cifrario in PHP'),
    p('La funzione ripulisce testo e chiave (solo A-Z, maiuscole), riempie con X, calcola l\'ordine di lettura delle colonne e poi concatena le colonne. Due dettagli: la lettera in riga <code>r</code> e colonna <code>col</code> sta nella posizione <code>r * n + col</code> del testo scritto per righe; l\'ordine delle colonne si ottiene ordinando le posizioni per lettera della chiave, e a parità di lettera per posizione (<code>usort</code> con l\'operatore <code>&lt;=&gt;</code>). Per ZEBRA il risultato è [4, 2, 1, 3, 0].'),
    codice(codiceDa('modulo-4-trasposizione/slide.html', 'CODICE'), 'trasposizione.php'),

    sez('Come si rompe: anagrammi e lunghezze'),
    p('Le frequenze non servono. Si prova una <b>larghezza</b> (un divisore della lunghezza del cifrato) e si riordinano le colonne finché le righe formano parole: è un anagramma. Per un cifrato di 20 lettere le larghezze possibili sono i divisori 2, 4, 5 e 10.'),
    tabella(['Larghezza provata', 'Altezza delle colonne', 'Quante permutazioni delle colonne'], [2, 4, 5, 10].map((wd) => {
      let f = 1; for (let i = 2; i <= wd; i++) f *= i;
      return [String(wd), String(20 / wd), L.it(f)];
    }), { mono: true, center: true }),
    p('Con larghezza 5, per esempio, il cifrato si scrive come cinque colonne verticali e si prova a combinarle in modo che le righe abbiano senso. Le possibili permutazioni sono 5! = 120: poche per un computer, che le prova tutte e tiene quelle che producono sequenze di lettere plausibili in italiano. Per chiavi lunghe il numero cresce molto, ma l\'attacco si può fare per gradi: si accostano due colonne alla volta e si guardano le coppie di lettere risultanti.'),

    ricorda(ul([
      'La trasposizione cambia l\'<b>ordine</b> delle lettere, non le lettere: le frequenze restano.',
      'A colonne: griglia scritta per righe, lettura per colonne nell\'ordine alfabetico della chiave, riempimento con <b>X</b>.',
      'Sostituzione (<b>confusione</b>) più trasposizione (<b>diffusione</b>) è l\'idea dei cifrari moderni.',
    ])),

    domande([
      'Cifra «RIUNIONE ALLE NOVE» con trasposizione a colonne e chiave SOLE. Quante X servono per completare la griglia?',
      'Con la chiave BANANA, in quale ordine si leggono le colonne? Come si risolve la parità delle lettere uguali?',
      'Un testo cifrato ha un indice di coincidenza vicino a 0,074 e i picchi di frequenza cadono su E, A, I, O. Che tipo di cifrario è probabile? E se i picchi cadessero su altre lettere?',
      'Hai un cifrato di 24 lettere ottenuto con una trasposizione a colonne. Quali larghezze della griglia sono possibili?',
      'Perché per decifrare conta la lunghezza del cifrato? Descrivi i passi per ricostruire la griglia.',
      'Spiega perché sostituzione e trasposizione si completano. A quale principio di Shannon corrisponde ciascuna?',
    ]),
    rimandi([
      ['../modulo-4-trasposizione/slide.html', 'Slide del modulo 4', ''],
      ['../modulo-4-trasposizione/simulazione-colonne.html', 'Simulatore della trasposizione a colonne', 'con lo strumento per riordinare le colonne'],
      ['../schede/bigliettini-trasposizione.html', 'Bigliettini della trasposizione', 'da ritagliare, con griglia vuota'],
      ['../lab-php/04-trasposizione/scheda.html', 'Lab PHP 04: trasposizione a colonne', ''],
      ['../quiz/quiz.html?modulo=4', 'Quiz del modulo 4', ''],
    ]),
  ].join('\n');
});
