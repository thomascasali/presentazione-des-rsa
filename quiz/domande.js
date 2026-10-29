/* Banca domande del quiz (JS puro, window.DOMANDE).
   Modalità autovalutazione: le soluzioni stanno nel codice.
   Tipi: 'scelta' (la prima opzione è quella giusta, l'ordine si mescola a runtime),
         'vf' (vero/falso), 'numero' (risposta numerica), 'testo' (risposta testuale breve).
   Per 'numero' e 'testo' il campo `atteso` è un valore o una funzione che lo calcola con Cripto. */
(function () {
  var G = typeof window !== 'undefined' ? window : globalThis;
  var C = G.Cripto;
  var D = [];
  var cont = {};
  function id(m) { cont[m] = (cont[m] || 0) + 1; return 'm' + m + '-' + cont[m]; }
  function sc(m, testo, giusta, sbagliate, spiegazione) {
    D.push({ id: id(m), modulo: m, tipo: 'scelta', testo: testo, giusta: giusta, opzioni: [giusta].concat(sbagliate), spiegazione: spiegazione });
  }
  function vf(m, testo, vero, spiegazione) {
    D.push({ id: id(m), modulo: m, tipo: 'vf', testo: testo, vero: vero, spiegazione: spiegazione });
  }
  function num(m, testo, atteso, spiegazione) {
    D.push({ id: id(m), modulo: m, tipo: 'numero', testo: testo, atteso: atteso, spiegazione: spiegazione });
  }
  function txt(m, testo, atteso, spiegazione, suggerimento) {
    D.push({ id: id(m), modulo: m, tipo: 'testo', testo: testo, atteso: atteso, spiegazione: spiegazione, suggerimento: suggerimento || '' });
  }

  /* ---------- Modulo 0: introduzione ---------- */
  sc(0, 'Quale obiettivo della crittografia garantisce che un messaggio non sia stato modificato durante il tragitto?', 'Integrità',
    ['Riservatezza', 'Autenticazione', 'Non ripudio'],
    'L\'integrità riguarda l\'assenza di modifiche; si controlla con funzioni hash e codici MAC. La riservatezza riguarda chi può leggere.');
  sc(0, 'Secondo il principio di Kerckhoffs, da che cosa deve dipendere la sicurezza di un cifrario?', 'Solo dalla segretezza della chiave',
    ['Dalla segretezza dell\'algoritmo', 'Dalla complessità del manuale d\'uso', 'Dal fatto che nessuno conosca il tipo di cifrario'],
    'Un algoritmo segreto prima o poi trapela; uno pubblico è esaminato da molti esperti. DES e RSA sono pubblici da decenni e restano validi.');
  sc(0, 'Che cosa fa la steganografia?', 'Nasconde l\'esistenza stessa del messaggio',
    ['Rende il messaggio illeggibile ma visibile', 'Rompe un cifrario senza la chiave', 'Calcola l\'impronta di un file'],
    'La crittografia rende il messaggio incomprensibile, la steganografia lo nasconde (per esempio dentro un\'immagine).');
  sc(0, 'Quale strumento fornisce il non ripudio?', 'La firma digitale',
    ['La funzione hash da sola', 'Il cifrario di Cesare', 'Il Wi-Fi protetto da password'],
    'Solo chi possiede la chiave privata può produrre la firma, quindi il firmatario non può negare di averla fatta.');
  sc(0, 'Qual è il problema della distribuzione delle chiavi?', 'Far arrivare la chiave segreta al destinatario senza che Eve la intercetti',
    ['Scegliere una chiave abbastanza lunga', 'Tradurre la chiave in binario', 'Impedire che il messaggio cambi lunghezza'],
    'Con un cifrario simmetrico mittente e destinatario devono già condividere la chiave: come se la scambiano in modo sicuro? La crittografia asimmetrica risolve il problema.');
  vf(0, 'La crittoanalisi consiste nel leggere o rompere un messaggio cifrato senza conoscere la chiave.', true,
    'È il gioco di Eve. Crittografia e crittoanalisi sono le due facce della crittologia.');
  vf(0, 'Nella trasposizione le lettere cambiano ma restano al loro posto.', false,
    'È il contrario: nella sostituzione le lettere cambiano e la posizione resta; nella trasposizione le lettere restano le stesse e cambia l\'ordine.');
  vf(0, 'Nella crittografia simmetrica si usa una sola chiave sia per cifrare sia per decifrare.', true,
    'Nella asimmetrica le chiavi sono due: una pubblica e una privata.');
  vf(0, 'Un algoritmo di cifratura tenuto segreto è più sicuro di uno pubblico.', false,
    'Affidarsi alla segretezza dell\'algoritmo è la «sicurezza per oscurità», considerata una cattiva pratica (Kerckhoffs, 1883).');
  txt(0, 'Cifra ATTACCO con il cifrario di Cesare, chiave 3.', function () { return C.cesare('ATTACCO', 3); },
    'Ogni lettera avanza di 3 posti: A diventa D, T diventa W, C diventa F, O diventa R.', 'Scrivi solo il testo cifrato');

  /* ---------- Modulo 1: Cesare ---------- */
  txt(1, 'Cifra CIAO con il cifrario di Cesare, chiave 3.', function () { return C.cesare('CIAO', 3); },
    'C diventa F, I diventa L, A diventa D, O diventa R.');
  txt(1, 'Decifra FRQ con il cifrario di Cesare, chiave 3.', function () { return C.cesareDecifra('FRQ', 3); },
    'Per decifrare si sposta ogni lettera indietro di 3 posti: F diventa C, R diventa O, Q diventa N.');
  txt(1, 'Cifra la lettera Z con Cesare, chiave 3.', function () { return C.cesare('Z', 3); },
    'Dopo la Z si ricomincia da A: con l\'aritmetica modulare (25 + 3) mod 26 = 2, cioè la lettera C.');
  sc(1, 'Quante sono le chiavi utili del cifrario di Cesare sull\'alfabeto di 26 lettere?', '25',
    ['26', '13', '52'],
    'Con chiave 0 il testo non cambia e con chiave 26 si fa un giro completo e si torna a 0: restano 25 chiavi utili.');
  sc(1, 'Quale attacco sfrutta il fatto che in italiano alcune lettere (E, A, I, O) sono molto più comuni delle altre?', 'L\'analisi delle frequenze',
    ['La forza bruta sulle 25 chiavi', 'Il metodo di Kasiski', 'L\'algoritmo di Euclide'],
    'Cesare sposta tutte le lettere della stessa quantità: il profilo delle frequenze resta uguale, ma traslato. La traslazione rivela la chiave.');
  sc(1, 'A che cosa serve il «resto della divisione» (mod 26) nel cifrario di Cesare?', 'A tornare all\'inizio dell\'alfabeto dopo la Z',
    ['A scegliere la chiave', 'A distinguere maiuscole e minuscole', 'A rendere il cifrario più lento'],
    'Le lettere sono numeri da 0 a 25: la somma può superare 25 e il resto della divisione per 26 la riporta nell\'alfabeto.');
  vf(1, 'Con il cifrario di Cesare la stessa lettera in chiaro viene sempre cifrata con la stessa lettera.', true,
    'È una delle debolezze: ogni lettera ha sempre la stessa sostituta e le frequenze restano visibili.');
  vf(1, 'Con la chiave 13 cifrare due volte lo stesso testo restituisce il testo originale.', true,
    '13 + 13 = 26, un giro completo: è il cosiddetto ROT13.');
  vf(1, 'Con la chiave 26 il testo cifrato è diverso dal testo in chiaro.', false,
    '26 mod 26 = 0: ogni lettera torna su se stessa, come con la chiave 0.');
  sc(1, 'Perché il cifrario di Cesare non è sicuro?', 'Le chiavi sono poche e le frequenze delle lettere restano visibili',
    ['La chiave è troppo lunga', 'Richiede un computer', 'L\'algoritmo è segreto'],
    'Solo 25 chiavi: la forza bruta è immediata. Inoltre la statistica del linguaggio sopravvive alla cifratura.');

  /* ---------- Modulo 2: Cesare generalizzato (serie di numeri) ---------- */
  txt(2, 'Cifra ATTACCO con la chiave a serie di numeri 3-1-4 (dopo l\'ultimo numero si ricomincia).', function () { return C.vigenere('ATTACCO', 'DBE'); },
    'Spostamenti 3, 1, 4, 3, 1, 4, 3: A+3=D, T+1=U, T+4=X, A+3=D, C+1=D, C+4=G, O+3=R.');
  txt(2, 'Decifra DUXDDGR con la stessa chiave 3-1-4.', function () { return C.vigenereDecifra('DUXDDGR', 'DBE'); },
    'Si applicano gli stessi numeri nello stesso ordine, ma arretrando: indietro di 3, 1, 4, 3, 1, 4, 3.');
  num(2, 'Quante chiavi esistono con una serie di 3 numeri (ognuno da 0 a 25)?', function () { return Math.pow(26, 3); },
    'Ogni numero ha 26 valori: 26 alla n. Per n = 3 sono 26³ = 17576.');
  sc(2, 'Con una chiave di n numeri, quante sono le chiavi possibili?', '26 elevato a n',
    ['26 per n', 'n elevato a 26', '25 più n'],
    'Ogni posizione della chiave ha 26 valori indipendenti, quindi si moltiplica 26 per se stesso n volte.');
  vf(2, 'Con la serie di numeri la stessa lettera in chiaro viene sempre cifrata con la stessa lettera.', false,
    'È il vantaggio rispetto a Cesare: nell\'esempio le due T danno lettere cifrate diverse, perché cadono su numeri diversi della chiave.');
  vf(2, 'Se la serie ha un solo numero si ottiene il Cesare semplice.', true,
    'Il cifrario di Cesare è un caso particolare con chiave di lunghezza 1.');
  vf(2, 'Le frequenze delle lettere nel testo cifrato risultano più «spalmate» rispetto a Cesare.', true,
    'Usare più spostamenti confonde i picchi della statistica del linguaggio, ma non li cancella del tutto.');
  sc(2, 'Che cosa succede alla chiave quando nel testo c\'è uno spazio?', 'La chiave aspetta: lo spazio resta com\'è e il numero non viene consumato',
    ['Lo spazio viene cifrato come una lettera', 'La chiave riparte dall\'inizio', 'Il testo viene rifiutato'],
    'Spazi e punteggiatura restano invariati e il numero della chiave viene usato dalla lettera seguente.');
  sc(2, 'Se un attaccante conosce la lunghezza della chiave, come procede?', 'Divide il testo in colonne: ognuna è un Cesare da rompere con le frequenze',
    ['Prova tutte le 26 alla n chiavi, senza altro', 'Cerca il massimo comun divisore', 'Calcola l\'inverso modulare'],
    'Le lettere cifrate con lo stesso numero formano una colonna: dentro ogni colonna lo spostamento è costante, quindi è un Cesare.');
  sc(2, 'Per decifrare con una serie di numeri che cosa si fa?', 'Si arretra di ogni numero della serie, nello stesso ordine',
    ['Si avanza di 26 meno la lunghezza', 'Si usa la serie scritta al contrario, avanzando', 'Non si può decifrare senza il computer'],
    'Cifrare e decifrare usano lo stesso schema con segno opposto: la serie è la stessa, cambia solo il verso dello spostamento.');

  /* ---------- Modulo 3: Vigenère ---------- */
  txt(3, 'Cifra ATTACCO con Vigenère, chiave LUNA.', function () { return C.vigenere('ATTACCO', 'LUNA'); },
    'Gli spostamenti sono L=11, U=20, N=13, A=0, poi si ricomincia: A+11=L, T+20=N, T+13=G, A+0=A, C+11=N, C+20=W, O+13=B.');
  txt(3, 'Decifra LNGANWB con Vigenère, chiave LUNA.', function () { return C.vigenereDecifra('LNGANWB', 'LUNA'); },
    'Si sottrae lo spostamento di ogni lettera della chiave, ripetuta ciclicamente.');
  sc(3, 'Quale metodo trova la lunghezza della chiave di Vigenère sfruttando le ripetizioni nel testo cifrato?', 'Il metodo di Kasiski',
    ['La forza bruta sulle 25 chiavi', 'L\'algoritmo di Euclide esteso', 'Il quadrato di Polibio'],
    'Sequenze uguali nel chiaro che cadono alla stessa posizione della chiave danno sequenze uguali nel cifrato: le distanze sono multipli della lunghezza.');
  sc(3, 'Quanto vale circa l\'indice di coincidenza dell\'italiano e quello di un testo di lettere casuali?', 'Circa 0,074 per l\'italiano e 0,038 per lettere casuali',
    ['Circa 0,038 per l\'italiano e 0,074 per lettere casuali', 'Entrambi circa 0,5', 'Entrambi circa 1'],
    'L\'indice misura quanto il profilo è «a picchi»: Cesare lo conserva, Vigenère lo abbassa avvicinandolo al caso.');
  sc(3, 'Che cosa serve per avere un one-time pad?', 'Una chiave casuale, lunga quanto il messaggio e usata una volta sola',
    ['Una chiave breve e facile da ricordare', 'Una chiave pubblica e una privata', 'Un algoritmo segreto'],
    'Con queste tre condizioni Shannon dimostrò nel 1949 la segretezza perfetta.');
  sc(3, 'Perché il one-time pad non si usa dappertutto?', 'La chiave, lunga come il messaggio, andrebbe distribuita in modo sicuro e mai riusata',
    ['È meno sicuro di Cesare', 'È troppo corto', 'Richiede due chiavi'],
    'Il problema si sposta: occorre consegnare in segreto una chiave enorme quanto i dati, e usarla davvero una volta sola.');
  vf(3, 'Vigenère, chiamato «le chiffre indéchiffrable», ha resistito agli attacchi per circa tre secoli.', true,
    'Fino all\'attacco di Kasiski (1863) sembrò indecifrabile.');
  vf(3, 'Rispetto a Cesare, Vigenère abbassa l\'indice di coincidenza del testo cifrato.', true,
    'Più alfabeti di sostituzione appiattiscono il profilo delle frequenze.');
  sc(3, 'Dopo aver stimato la lunghezza L della chiave di Vigenère, come si procede?', 'Si dividono le lettere in L colonne e si fa l\'analisi delle frequenze su ognuna',
    ['Si calcola 26 alla L e si prova tutto', 'Si cifra di nuovo con Cesare', 'Si calcola l\'inverso moltiplicativo'],
    'Ogni colonna è stata cifrata con un unico spostamento, quindi è un Cesare: la lettera più frequente indica lo spostamento.');
  vf(3, 'Vigenère con una chiave di una sola lettera equivale al cifrario di Cesare.', true,
    'Con una sola lettera lo spostamento è sempre lo stesso: è un Cesare.');

  /* ---------- Modulo 4: trasposizione ---------- */
  vf(4, 'Un cifrario a trasposizione non modifica le frequenze delle lettere.', true,
    'Le lettere sono le stesse, cambia solo l\'ordine: l\'analisi delle frequenze non aiuta.');
  vf(4, 'Un cifrario a trasposizione sostituisce ogni lettera con un\'altra.', false,
    'Quella è la sostituzione. La trasposizione rimescola le posizioni.');
  sc(4, 'Quale antico strumento spartano è un esempio di trasposizione?', 'La scitala',
    ['La ruota di Cesare', 'La tavola di Vigenère', 'La macchina DES'],
    'Un nastro avvolto su un bastone: si scrive per righe e si legge per colonne, che è proprio una trasposizione.');
  sc(4, 'Con la chiave ZEBRA, in quale ordine si leggono le colonne?', 'In ordine alfabetico delle lettere della chiave: A, B, E, R, Z',
    ['Nell\'ordine Z, E, B, R, A', 'Dall\'ultima alla prima colonna', 'In ordine casuale a ogni messaggio'],
    'La colonna sotto la A (la quinta) viene letta per prima, poi la B (terza), la E (seconda), la R (quarta) e la Z (prima).');
  num(4, 'Quante colonne ha la griglia con chiave ZEBRA?', 5,
    'La griglia ha una colonna per ogni lettera della chiave: Z, E, B, R, A sono cinque.');
  sc(4, 'Che cosa si fa quando il testo non riempie l\'ultima riga della griglia?', 'Si completa con lettere di riempimento (per esempio X)',
    ['Si cancellano le lettere in più', 'Si cambia la chiave', 'Si cifra in modo diverso l\'ultima riga'],
    'Il padding rende la griglia rettangolare; chi decifra sa che le X finali sono riempimento.');
  txt(4, 'Cifra ATTACCOALBA con trasposizione a colonne, chiave ZEBRA, riempiendo con X.', function () { return C.trasposizioneColonne('ATTACCOALBA', 'ZEBRA'); },
    'Cinque colonne e tre righe (ATTAC / COALB / AXXXX): si leggono le colonne nell\'ordine alfabetico della chiave: A, B, E, R, Z.',
    'Una sola riga, senza spazi');
  sc(4, 'Come si attacca di solito una trasposizione?', 'Provando le larghezze della griglia e riordinando le colonne finché compaiono parole (anagrammi)',
    ['Con l\'analisi delle frequenze', 'Con il test di primalità', 'Provando le 25 chiavi di Cesare'],
    'Le frequenze non cambiano e non servono; si prova una larghezza divisore della lunghezza e si riordinano le colonne.');
  vf(4, 'Combinare sostituzione e trasposizione dà un cifrario più forte e anticipa le idee dei cifrari moderni.', true,
    'Sostituzione = confusione, trasposizione = diffusione (Shannon, 1949): il DES le alterna per 16 round.');
  sc(4, 'Nei termini di Shannon, quale proprietà si ottiene con la trasposizione?', 'Diffusione',
    ['Confusione', 'Integrità', 'Non ripudio'],
    'La trasposizione sparge l\'effetto di ogni lettera su molte posizioni; la sostituzione produce confusione.');

  /* ---------- Modulo 5: cifrari moderni, bit e XOR ---------- */
  txt(5, 'Calcola 1100 XOR 1010.', function () { return C.xor('1100', '1010'); },
    'XOR dà 1 solo se i due bit sono diversi: 1⊕1=0, 1⊕0=1, 0⊕1=1, 0⊕0=0.', 'Quattro bit');
  txt(5, 'Scrivi la lettera A (codice ASCII 65) su 8 bit.', function () { return C.testoABit('A'); },
    '65 = 64 + 1, cioè 01000001.', 'Otto bit');
  txt(5, 'Scrivi in esadecimale il testo AB (codici ASCII 65 e 66).', function () { return C.testoAHex('AB'); },
    '65 = 0x41 e 66 = 0x42, quindi 4142.', 'Quattro cifre esadecimali');
  num(5, 'Quanti bit rappresenta una cifra esadecimale?', 4,
    'Una cifra esadecimale vale 16 valori, cioè 4 bit; due cifre formano un byte.');
  vf(5, 'Vale la proprietà A ⊕ K ⊕ K = A.', true,
    'Applicare due volte la stessa chiave con XOR annulla l\'effetto: per questo cifratura e decifratura coincidono.');
  sc(5, 'Che cosa succede se si riusa la chiave di un one-time pad per due messaggi?', 'Lo XOR dei due cifrati è uguale allo XOR dei due messaggi: la chiave sparisce',
    ['Il cifrato diventa indecifrabile', 'La chiave si raddoppia', 'Non cambia nulla per la sicurezza'],
    '(M1⊕K)⊕(M2⊕K) = M1⊕M2: chi indovina una parola di M1 recupera la parte corrispondente di M2.');
  sc(5, 'Che cosa richiede il principio di diffusione di Shannon?', 'Ogni bit del messaggio deve influenzare molti bit del cifrato',
    ['Il cifrato deve essere più corto del chiaro', 'La chiave deve essere pubblica', 'Ogni bit del cifrato deve dipendere da un solo bit del chiaro'],
    'La diffusione nasconde le statistiche (permutazioni e più round); la confusione complica il legame chiave-cifrato (S-box).');
  vf(5, 'Con l\'effetto valanga, cambiando un bit del messaggio cambia circa metà dei bit del cifrato.', true,
    'Un buon cifrario a blocchi si comporta così; con il solo XOR cambia invece esattamente un bit.');
  sc(5, 'Qual è la differenza principale tra cifrari a flusso e a blocchi?', 'Il flusso genera una sequenza di bit combinata con XOR; i blocchi cifrano porzioni di lunghezza fissa in più round',
    ['Il flusso usa due chiavi, i blocchi una', 'I blocchi non usano una chiave', 'Il flusso è sempre un one-time pad perfetto'],
    'Il cifrario a flusso è come un one-time pad con chiave pseudocasuale; il DES è a blocchi di 64 bit.');
  sc(5, 'Qual è l\'idea di base di una rete di Feistel?', 'Dividere il blocco in due metà e scambiarle a ogni round, applicando una funzione F a una delle due',
    ['Cifrare ogni bit con la sua chiave pubblica', 'Moltiplicare il blocco per un numero primo', 'Sostituire ogni lettera con una vicina'],
    'Con questa struttura la decifratura è lo stesso schema con le sottochiavi in ordine inverso.');

  /* ---------- Modulo 6: DES ---------- */
  num(6, 'Quanti round ha il DES?', 16,
    'Il DES alterna sostituzioni (S-box) e permutazioni per 16 round; S-DES, la versione didattica, ne ha 2.');
  num(6, 'Quanti bit ha un blocco del DES?', 64,
    'Blocco da 64 bit; la chiave è di 64 bit ma ne usa 56 (gli altri 8 sono di parità).');
  num(6, 'Quanti bit utili ha la chiave del DES?', 56,
    'Lo spazio delle chiavi è 2^56, circa 7,2 × 10^16: troppo poco per l\'hardware dedicato.');
  txt(6, 'Cifra con S-DES il blocco 01110010 con la chiave 1010000010.', function () { return C.sdes.cifra('01110010', '1010000010'); },
    'Il risultato si ottiene con IP, due round con le sottochiavi K1 e K2, SW e IP⁻¹.', 'Otto bit');
  num(6, 'Quante chiavi possibili ha S-DES (chiave di 10 bit)?', 1024,
    '2^10 = 1024: si provano tutte in un istante, quindi S-DES serve solo a capire.');
  sc(6, 'Quale macchina dell\'EFF nel 1998 ruppe il DES in circa 56 ore?', 'Deep Crack',
    ['Enigma', 'Colossus', 'Lucifer'],
    'Costò meno di 250.000 dollari: dimostrò che la forza bruta sul DES era alla portata di organizzazioni con pochi mezzi.');
  sc(6, 'Quale difetto ha la modalità ECB?', 'Blocchi in chiaro uguali producono blocchi cifrati uguali',
    ['Richiede una chiave pubblica', 'Cifra solo messaggi di un blocco', 'Rallenta il computer di 16 volte'],
    'Le strutture del messaggio restano visibili. CBC concatena i blocchi con un vettore di inizializzazione (IV).');
  vf(6, 'Per decifrare con una rete di Feistel basta lo stesso schema usando le sottochiavi in ordine inverso.', true,
    'È il motivo per cui la stessa struttura serve per cifrare e per decifrare.');
  vf(6, 'Il Triple DES (3DES) ha una sicurezza effettiva di circa 112 bit.', true,
    'La chiave è di 168 bit (3 × 56), ma l\'attacco meet-in-the-middle riduce la sicurezza a circa 112 bit. Oggi è sconsigliato.');
  sc(6, 'Quali sono le caratteristiche di AES?', 'Blocco da 128 bit, chiave da 128, 192 o 256 bit, rete di sostituzione-permutazione',
    ['Blocco da 64 bit, chiave da 56 bit, rete di Feistel', 'Blocco da 8 bit, chiave da 10 bit', 'Blocco variabile, chiave pubblica da 2048 bit'],
    'AES (Rijndael) è standard dal 2001. Non è Feistel: tutto il blocco viene trasformato a ogni round.');
  vf(6, 'AES è una rete di Feistel come il DES.', false,
    'AES è una rete di sostituzione-permutazione.');

  /* ---------- Modulo 7: matematica di RSA ---------- */
  num(7, 'Calcola l\'inverso di 7 modulo 26.', function () { return C.inversoModulare(7, 26); },
    '7 · 15 = 105 = 4 · 26 + 1, quindi 7⁻¹ ≡ 15 (mod 26). Si trova con l\'algoritmo di Euclide esteso.');
  num(7, 'Calcola 7^5 mod 13.', function () { return C.potenzaModulare(7, 5, 13); },
    '7² = 49 ≡ 10, 7⁴ ≡ 100 ≡ 9, 7⁵ ≡ 9 · 7 = 63 ≡ 11 (mod 13). Square-and-multiply evita numeri enormi.');
  num(7, 'Calcola MCD(48, 18).', function () { return C.mcd(48, 18); },
    '48 = 2·18 + 12; 18 = 1·12 + 6; 12 = 2·6 + 0: l\'ultimo resto non nullo è 6.');
  num(7, 'Calcola φ(15), la funzione di Eulero.', 8,
    'φ(3·5) = (3 − 1)(5 − 1) = 8. I coprimi con 15 tra 1 e 15 sono 1, 2, 4, 7, 8, 11, 13, 14.');
  num(7, 'Calcola −3 mod 26 (il resto va sempre tra 0 e 25).', 23,
    '−3 + 26 = 23. In molti linguaggi il resto di un numero negativo resta negativo: va corretto.');
  sc(7, 'Quando un numero a ha inverso moltiplicativo modulo m?', 'Quando MCD(a, m) = 1',
    ['Quando a è pari', 'Quando a è minore di m', 'Quando m è pari'],
    'Solo i numeri coprimi con il modulo hanno inverso, trovabile con Euclide esteso.');
  vf(7, 'Il numero 91 è primo.', false, '91 = 7 · 13.');
  vf(7, 'I numeri 6 e 35 sono coprimi, anche se nessuno dei due è primo.', true,
    'MCD(6, 35) = 1: non hanno fattori in comune. Coprimi non vuol dire primi.');
  sc(7, 'Che cosa afferma la proprietà di Eulero?', 'Se MCD(a, n) = 1 allora a elevato a φ(n) è congruo a 1 modulo n',
    ['Ogni numero ha un inverso modulo n', 'φ(n) = n − 1 per ogni n', 'a elevato a n è sempre uguale a a'],
    'Esempio: n = 15, φ = 8, 2^8 = 256 = 17 · 15 + 1. È il motore di RSA.');
  sc(7, 'Che cos\'è una funzione unidirezionale con botola?', 'Facile da calcolare, difficile da invertire senza un\'informazione segreta',
    ['Difficile da calcolare ma facile da invertire', 'Una funzione che dà sempre lo stesso risultato', 'Una funzione che cancella i dati'],
    'In RSA moltiplicare p e q è facile; fattorizzare n è difficile, a meno di conoscere p e q (la botola).');
  txt(7, 'Fattorizza 221: scrivi i due fattori primi in ordine crescente, separati da una virgola.', '13,17',
    '221 = 13 · 17. Con numeri di 2048 bit nessun computer classico riesce a fattorizzare.', 'Esempio di formato: 3,5');

  /* ---------- Modulo 8: RSA ---------- */
  num(8, 'Con p = 5, q = 11 ed e = 3 calcola l\'esponente privato d.', function () { return Number(C.rsa.genera(5n, 11n, 3n).d); },
    'n = 55, φ(n) = 4 · 10 = 40; d è l\'inverso di 3 modulo 40: 3 · 27 = 81 = 2 · 40 + 1, quindi d = 27.');
  num(8, 'Con p = 61 e q = 53 calcola n = p · q.', 3233,
    '61 · 53 = 3233: è il modulo pubblico dell\'esempio del corso.');
  num(8, 'Con p = 61 e q = 53 calcola φ(n).', 3120,
    'φ(n) = (p − 1)(q − 1) = 60 · 52 = 3120. Si calcola solo conoscendo p e q.');
  num(8, 'Con chiave pubblica (e, n) = (17, 3233) cifra m = 65.', function () { return Number(C.potenzaModulare(65n, 17n, 3233n)); },
    'c = 65^17 mod 3233 = 2790, calcolato con square-and-multiply.');
  num(8, 'Con chiave privata (d, n) = (2753, 3233) decifra c = 2790.', function () { return Number(C.potenzaModulare(2790n, 2753n, 3233n)); },
    'm = 2790^2753 mod 3233 = 65: torna il messaggio di partenza.');
  sc(8, 'Con quale chiave si cifra un messaggio destinato a Bob, con RSA?', 'Con la chiave pubblica di Bob',
    ['Con la chiave privata di Bob', 'Con la chiave privata di Alice', 'Con la chiave pubblica di Alice'],
    'Solo Bob, con la sua privata, può decifrare. Chiunque può cifrare con la pubblica.');
  sc(8, 'Con quale chiave si firma un documento con RSA?', 'Con la chiave privata del firmatario',
    ['Con la chiave pubblica del destinatario', 'Con la chiave pubblica del firmatario', 'Con una chiave di sessione'],
    'La verifica si fa con la chiave pubblica del firmatario: solo chi ha la privata può produrre una firma che torna.');
  vf(8, 'In RSA i numeri primi p e q devono restare segreti.', true,
    'Chi conosce p e q calcola φ(n) e quindi d. La sicurezza sta nella difficoltà di fattorizzare n.');
  vf(8, 'La firma digitale RSA nasconde il contenuto del documento.', false,
    'La firma prova autore e integrità, ma il documento resta leggibile. Per la riservatezza si cifra.');
  sc(8, 'Perché si firma l\'impronta (hash) del documento e non il documento intero?', 'RSA è lento e il documento può essere più lungo del modulo: l\'impronta ha lunghezza fissa',
    ['L\'hash è segreto', 'Il documento non si può leggere', 'La chiave pubblica non lo accetta'],
    'Chi riceve ricalcola l\'impronta, applica la chiave pubblica alla firma e confronta i due risultati.');
  sc(8, 'Perché «RSA da libro» (senza padding) è insicuro?', 'È deterministico: lo stesso messaggio dà sempre lo stesso cifrato; servono schemi con padding come OAEP',
    ['I numeri sono sempre troppo piccoli', 'Non usa il modulo n', 'Dipende dalla lunghezza della password'],
    'Nelle applicazioni reali si usano OAEP per cifrare e PSS per firmare.');
  vf(8, 'Un computer quantistico di grandi dimensioni potrebbe rompere RSA con l\'algoritmo di Shor.', true,
    'Shor fattorizza in tempo polinomiale: per questo si studiano algoritmi post-quantistici.');
  sc(8, 'Quale modulo RSA è considerato il minimo attuale (sicurezza equivalente a 112 bit)?', '2048 bit',
    ['512 bit', '1024 bit', '256 bit'],
    'Secondo NIST SP 800-57: 1024 bit non è più accettabile, 2048 è il minimo, 3072 è consigliato per i nuovi sistemi (128 bit).');

  /* ---------- Modulo 9: crittografia ibrida, firme, certificati ---------- */
  sc(9, 'Nella crittografia ibrida, che cosa fa RSA e che cosa fa AES?', 'RSA cifra la chiave di sessione, AES cifra i dati',
    ['RSA cifra i dati, AES cifra la chiave pubblica', 'Entrambi cifrano i dati con la stessa chiave', 'RSA calcola l\'hash, AES firma'],
    'RSA è lento ma risolve la distribuzione; AES è velocissimo sui dati. Si scambia una chiave casuale e usa e getta.');
  num(9, 'Quanti byte al massimo si cifrano con RSA a 2048 bit e padding OAEP-SHA256? (256 − 2·32 − 2)', 190,
    '256 byte di modulo meno 2 volte la lunghezza dell\'hash (32) meno 2: 190 byte. La chiave AES (32 byte) ci sta, un documento no.');
  vf(9, 'In TLS 1.3 il segreto di sessione viene trasportato cifrandolo con la chiave RSA del server.', false,
    'In TLS 1.3 il segreto nasce da Diffie-Hellman effimero; la chiave del certificato serve per firmare.');
  sc(9, 'Che cos\'è un hash come SHA-256?', 'Un\'impronta di lunghezza fissa da cui non si risale al dato; un solo carattere diverso ne cambia circa metà dei bit',
    ['Un cifrario con chiave segreta', 'Un modo per decifrare più in fretta', 'Una chiave pubblica abbreviata'],
    'Gli hash non sono cifrari: non hanno chiave e non si invertono. Servono per l\'integrità e per firmare.');
  sc(9, 'A che cosa serve un certificato digitale?', 'A legare una chiave pubblica a un\'identità, con la firma di un\'autorità di certificazione',
    ['A cifrare tutti i dati di una pagina', 'A sostituire la chiave privata', 'A calcolare l\'hash del sito'],
    'La chiave pubblica non è segreta, ma deve essere autentica: altrimenti un attaccante in mezzo può sostituirla (man-in-the-middle).');
  vf(9, 'Una firma digitale garantisce integrità, autenticità e non ripudio, ma non la riservatezza.', true,
    'Il documento firmato resta leggibile; per nasconderlo si cifra.');
  sc(9, 'Che cosa viene salvato nel file known_hosts di SSH?', 'L\'impronta della chiave dei server già visitati',
    ['Le password degli utenti', 'La chiave privata del client', 'L\'elenco dei certificati revocati'],
    'Al primo accesso il client salva la chiave del server (trust on first use) e dalle volte successive la confronta.');
  vf(9, 'Diffie-Hellman permette a due parti di accordarsi su un segreto senza trasmetterlo sul canale.', true,
    'Si scambiano solo valori pubblici da cui i due ricavano lo stesso segreto, mentre un osservatore non può calcolarlo facilmente.');
  sc(9, 'Perché non si cifra tutto il traffico direttamente con RSA?', 'RSA è lento e ha un limite di lunghezza del messaggio',
    ['RSA non è sicuro', 'RSA non funziona con i file', 'La chiave pubblica è segreta'],
    'La soluzione è la cifratura ibrida: RSA o Diffie-Hellman per accordarsi sulla chiave, AES per i dati.');
  sc(9, 'Quale debolezza principale ha il DES singolo?', 'La chiave troppo corta (56 bit): si prova con la forza bruta',
    ['Troppe poche lettere nell\'alfabeto', 'La chiave è sempre pubblica', 'Si rompe con l\'analisi delle frequenze'],
    'Cesare cade con la forza bruta e le frequenze, Vigenère con Kasiski, il DES con la forza bruta sui 56 bit.');

  G.DOMANDE = D;
})();
