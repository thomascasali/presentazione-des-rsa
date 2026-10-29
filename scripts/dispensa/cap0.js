const L = require('./lib');
const { C, capitolo, sez, sub, p, ul, ol, m, ev, tabella, ricorda, errore, esempio, domande, rimandi, it } = L;

module.exports = () => capitolo(0, 'Introduzione alla crittografia',
  'Perché si cifra, che cosa vuol dire proteggere un messaggio e quale strada percorreremo: dai cifrari antichi a DES e RSA.', () => {
  const cif = C.cesare('ATTACCO', 3);
  const scitala = C.trasposizioneGriglia('ATTACCO ALL ALBA', 'ABCD');
  const chiavi = [5, 10, 28, 100].map((n) => [n, it(n * (n - 1) / 2), it(2 * n)]);
  return [
    sez('Perché serve la crittografia'),
    p('Quando Alice invia un messaggio a Bob attraverso una rete, il messaggio non viaggia in linea retta: attraversa il Wi-Fi, gli switch, i router, i dispositivi del provider e infine il server di destinazione. Ognuno di questi nodi è sotto il controllo di qualcun altro. Chi controlla un nodo può leggere il traffico (<i>sniffing</i>) oppure modificarlo mentre passa.'),
    p('Alice, Bob ed Eve sono i nomi convenzionali dei personaggi: Alice è il mittente, Bob il destinatario, Eve (da <i>eavesdropper</i>, «chi origlia») è l\'attaccante che intercetta. Li useremo in tutta la dispensa. La contromisura è rendere il messaggio incomprensibile a chiunque non possieda il segreto giusto: questa è la <b>crittografia</b>. La parola significa «scrittura nascosta» e viene dal greco <i>kryptós</i> (nascosto) e <i>gráphein</i> (scrivere).'),

    sez('I quattro obiettivi'),
    p('Un sistema di comunicazione sicuro deve garantire quattro proprietà. La cifratura da sola ne garantisce soltanto una: per le altre servono strumenti diversi, che incontreremo più avanti.'),
    tabella(['Obiettivo', 'Che cosa garantisce', 'Strumento tipico', 'Esempio'], [
      ['Riservatezza', 'Solo il destinatario legge il messaggio', 'Cifratura (capitoli 1-9)', 'Una chat'],
      ['Integrità', 'Il messaggio non è stato modificato', 'Funzioni hash, codici MAC', 'Un file scaricato identico all\'originale'],
      ['Autenticazione', 'Il mittente è chi dice di essere', 'Password, certificati, firma', 'Accesso a un sito di home banking'],
      ['Non ripudio', 'Il mittente non può negare di aver inviato il messaggio', 'Firma digitale (capitolo 8)', 'Un contratto firmato'],
    ]),
    p('In questo percorso ci concentriamo sulla riservatezza e sulla firma; l\'integrità e le funzioni hash compaiono nei capitoli 8 e 9.'),

    sez('Il lessico di base'),
    p('Questi termini ricorrono in ogni capitolo. La tabella usa come esempio il cifrario di Cesare con chiave 3, che studieremo nel capitolo 1.'),
    tabella(['Termine', 'Significato', 'Esempio'], [
      ['Testo in chiaro', 'Il messaggio originale, leggibile', 'ATTACCO'],
      ['Testo cifrato', 'Il messaggio trasformato, illeggibile', cif],
      ['Algoritmo (cifrario)', 'La regola con cui si trasforma il testo', 'spostare le lettere'],
      ['Chiave', 'Il dato segreto che governa l\'algoritmo', '3'],
      ['Cifratura / decifratura', 'Da chiaro a cifrato / da cifrato a chiaro', 'ATTACCO ⇄ ' + cif],
      ['Crittoanalisi', 'Leggere o rompere il cifrato senza la chiave', 'provare tutte le chiavi'],
    ]),
    errore('In italiano corretto si dice <b>cifrare</b> e <b>decifrare</b>. «Criptare» è un calco dall\'inglese <i>to encrypt</i> e si trova in molti testi, ma è meglio evitarlo. Inoltre non si deve confondere <i>decifrare</i> (operazione di chi conosce la chiave) con <i>rompere</i> o <i>forzare</i> un cifrario (crittoanalisi, senza la chiave).'),
    sub('Crittografia, crittoanalisi, steganografia'),
    ul([
      '<b>Crittografia</b>: rende il messaggio <i>illeggibile</i>. Tutti sanno che un messaggio c\'è, nessuno lo capisce.',
      '<b>Crittoanalisi</b>: cerca di <i>rompere</i> il cifrario senza la chiave. È il mestiere di Eve. Insieme, crittografia e crittoanalisi formano la crittologia: ogni cifrario nuovo nasce da un attacco riuscito al precedente.',
      '<b>Steganografia</b>: nasconde l\'<i>esistenza</i> del messaggio, per esempio dentro un\'immagine. Si può combinare con la crittografia (prima si cifra, poi si nasconde), ma è un\'altra cosa.',
    ]),

    sez('Il principio di Kerckhoffs'),
    ricorda('La sicurezza di un cifrario deve dipendere <b>solo dalla segretezza della chiave</b>, non da quella dell\'algoritmo. Formulato da Auguste Kerckhoffs nel 1883.', 'Principio di Kerckhoffs'),
    p('Le ragioni sono tre. Un algoritmo segreto prima o poi trapela (smontando un dispositivo, analizzando un programma, grazie a una spia). Un algoritmo pubblico, invece, viene esaminato da migliaia di esperti, e i suoi difetti emergono. Infine cambiare una chiave è facile, cambiare un algoritmo no. L\'idea opposta si chiama <i>sicurezza per oscurità</i> ed è considerata una cattiva pratica. DES e RSA sono pubblici da decenni e restano (con i limiti che vedremo) sicuri: nel corso gli algoritmi saranno sempre noti e l\'unico segreto sarà la chiave.'),

    sez('Due famiglie di cifrari: sostituire e mescolare'),
    p('Tutti i cifrari classici sono combinazioni di due idee elementari. Anche i cifrari moderni lo sono: la <i>confusione</i> corrisponde alla sostituzione e la <i>diffusione</i> alla trasposizione (capitolo 5).'),
    ul([
      `<b>Sostituzione</b>: ogni lettera diventa un'altra lettera. Le lettere cambiano, la posizione resta. Con il cifrario di Cesare (chiave 3): ${m('ATTACCO')} diventa ${ev(cif)}.`,
      '<b>Trasposizione</b>: le lettere restano le stesse, cambia l\'ordine. È il principio della scitala spartana, che vedremo nel capitolo 4.',
    ]),
    esempio('trasposizione su quattro colonne', [
      p('Si scrive il messaggio ATTACCO ALL ALBA (senza spazi) su una griglia di 4 colonne, riempiendo per righe, e poi si legge per colonne da sinistra a destra.'),
      tabella(null, scitala.righe, { mono: true, center: true, stretta: true }),
      p(`Il testo cifrato è ${ev(scitala.cifrato)}. Sono le stesse lettere del messaggio, in un altro ordine; le X finali completano la griglia.`),
    ].join('')),

    sez('Breve storia'),
    tabella(['Quando', 'Evento', 'Famiglia'], [
      ['V sec. a.C.', 'Scitala spartana: una striscia di cuoio avvolta su un bastone, descritta da autori greci tra cui Plutarco', 'trasposizione'],
      ['I sec. a.C.', 'Giulio Cesare sposta ogni lettera di tre posti (racconta Svetonio)', 'sostituzione'],
      ['1553 - 1586', 'Bellaso descrive il cifrario con parola chiave; Vigenère ne pubblica una versione. Kasiski ne trova il punto debole nel 1863', 'sostituzione polialfabetica'],
      ['1918 - 1945', 'Enigma, macchina a rotori brevettata da Scherbius, rotta da matematici polacchi e dal gruppo di Bletchley Park (con Alan Turing)', 'macchina a rotori'],
      ['1977', 'DES, standard americano basato su un progetto IBM; sostituito da AES nel 2001', 'simmetrico'],
      ['1976 - 1977', 'Diffie e Hellman propongono la coppia di chiavi; Rivest, Shamir e Adleman realizzano RSA', 'asimmetrico'],
    ]),
    p('Il filo conduttore è che ogni cifrario nasce dall\'attacco al precedente: Cesare cade con le frequenze, Vigenère con Kasiski, Enigma con la matematica e le macchine, DES con la potenza di calcolo. RSA nasce da un\'idea diversa: la coppia di chiavi.'),

    sez('Crittografia simmetrica e asimmetrica'),
    sub('Una chiave sola'),
    p('Nella crittografia <b>simmetrica</b> Alice e Bob usano la stessa chiave K: Alice cifra con K, Eve vede passare solo il testo cifrato, Bob decifra con la stessa K. Sono simmetrici tutti i cifrari dei capitoli 1-6: Cesare, Vigenère, trasposizione, DES, AES. Il pregio è la velocità, adatta a grandi quantità di dati. Il problema è che Alice e Bob devono già condividere K: come se la scambiano, senza che Eve la veda?'),
    sub('Due chiavi'),
    p('Nella crittografia <b>asimmetrica</b> ogni persona ha una coppia di chiavi legate matematicamente: una <b>pubblica</b>, che si può diffondere, e una <b>privata</b>, che non esce mai dal suo proprietario. Ciò che una chiave cifra, solo l\'altra può decifrare.'),
    ul([
      '<b>Riservatezza</b>: Alice cifra con la chiave <i>pubblica</i> di Bob; solo la <i>privata</i> di Bob può decifrare.',
      '<b>Firma digitale</b>: Alice firma con la sua chiave <i>privata</i>; chiunque verifica con la sua <i>pubblica</i>.',
    ]),
    tabella(['', 'Simmetrica', 'Asimmetrica'], [
      ['Chiavi', 'Una sola, segreta e condivisa', 'Coppia: pubblica e privata'],
      ['Velocità', 'Alta', 'Molto più bassa'],
      ['Problema', 'Come scambiare la chiave', 'Come essere certi di chi è la chiave pubblica'],
      ['Chiavi per n persone', 'n(n−1)/2', '2n'],
      ['Esempi', 'DES, AES', 'RSA'],
      ['Uso tipico', 'Cifrare i dati', 'Scambiare chiavi, firmare'],
    ]),
    sub('Quante chiavi servono'),
    p('Se n persone vogliono parlarsi a coppie con la crittografia simmetrica, ogni coppia ha bisogno di una chiave sua, scambiata in segreto: in tutto n(n−1)/2 chiavi, cioè un numero che cresce con il quadrato di n. Con la crittografia asimmetrica ogni persona ha due chiavi e ne pubblica una: in tutto 2n.'),
    tabella(['Persone', 'Chiavi simmetriche', 'Chiavi asimmetriche'], chiavi.map((r) => r.map(String)), { mono: true, center: true, didascalia: 'Una classe di 28 studenti corrisponde alla terza riga.' }),
    ricorda('Nella pratica i due mondi si usano insieme: la crittografia asimmetrica scambia una chiave segreta, quella simmetrica cifra i dati. È la <b>crittografia ibrida</b> (capitolo 9), alla base di HTTPS e SSH.'),

    sez('Un\'analogia: la scatola con il doppio lucchetto'),
    p('Alice vuole far arrivare un biglietto a Bob. Hanno una scatola e due lucchetti con chiavi diverse: la chiave del lucchetto A ce l\'ha solo Alice, quella del lucchetto B solo Bob. Non si scambiano mai le chiavi, ed Eve può toccare la scatola ma non aprirla. La soluzione richiede tre viaggi:'),
    ol([
      'Alice mette il biglietto nella scatola, la chiude con il lucchetto A e la spedisce a Bob.',
      'Bob non può aprire A: aggiunge il proprio lucchetto B e rispedisce la scatola ad Alice (ora ha due lucchetti).',
      'Alice toglie il suo lucchetto A e rispedisce la scatola a Bob, che ora ha solo B. Bob lo toglie con la sua chiave, apre e legge.',
    ]),
    p('Nessuna chiave è mai passata da una mano all\'altra. Funziona perché i lucchetti si possono togliere in qualunque ordine (in matematica si dice che le operazioni sono <i>commutative</i>). Non è però RSA: con RSA Alice usa direttamente il lucchetto «aperto» di Bob, la sua chiave pubblica, e la scatola viaggia una volta sola. Il punto debole del gioco è che Eve potrebbe fingersi Bob e metterci un lucchetto suo: è il problema dell\'autenticazione, che i certificati risolveranno nel capitolo 9.'),

    sez('La mappa del percorso'),
    tabella(['Capitolo', 'Argomento', 'Idea chiave'], [
      ['1', 'Cifrario di Cesare', 'Spostare le lettere: il più antico dei cifrari'],
      ['2', 'Cesare con chiave numerica', 'Una serie di spostamenti al posto di uno'],
      ['3', 'Vigenère', 'La chiave diventa una parola'],
      ['4', 'Trasposizione', 'Mescolare le lettere senza cambiarle'],
      ['5', 'Cifrari moderni', 'Bit, XOR, confusione e diffusione'],
      ['6', 'DES', 'Rete di Feistel, S-DES, 3DES e AES'],
      ['7', 'Matematica di RSA', 'Modulo, MCD, inverso, potenze modulari'],
      ['8', 'RSA', 'Chiavi pubblica e privata, firma'],
      ['9', 'Crittografia ibrida', 'Simmetrica e asimmetrica insieme: TLS e SSH'],
    ]),
    p('Tre blocchi: i cifrari <b>classici</b> (capitoli 1-4, con i relativi attacchi), i cifrari <b>moderni</b> (5-6) e quelli <b>asimmetrici</b> (7-9). Dopo i capitoli trovi il glossario e le fonti.'),

    domande([
      'Elenca i quattro obiettivi della crittografia e associa a ciascuno uno strumento.',
      'Che cosa afferma il principio di Kerckhoffs? Perché un algoritmo pubblico può essere più affidabile di uno segreto?',
      'Qual è la differenza tra crittografia, crittoanalisi e steganografia?',
      'Cifra la parola SCUOLA con il cifrario di Cesare, chiave 3. Quale famiglia di cifrari è?',
      'Dieci persone vogliono comunicare a coppie con la crittografia simmetrica: quante chiavi servono? E con quella asimmetrica?',
      'Nel gioco della scatola, perché Alice e Bob non hanno bisogno di scambiarsi le chiavi? Quale attacco rimane possibile?',
    ]),
    rimandi([
      ['../modulo-0-introduzione/slide.html', 'Slide del modulo 0', 'la presentazione di questo capitolo'],
      ['../modulo-0-introduzione/simulazione-lucchetti.html', 'Simulazione: la scatola con il doppio lucchetto', 'anche da smartphone'],
      ['../quiz/quiz.html?modulo=0', 'Quiz del modulo 0', ''],
    ]),
  ].join('\n');
});
