const L = require('./lib');
const { C, A, capitolo, sez, sub, p, ul, ol, m, ev, formula, tabella, ricorda, errore, nota, esempio, codice, codiceDa, domande, rimandi, it, raw } = L;

module.exports = () => capitolo(9, 'Crittografia ibrida, firme e certificati',
  'Come si mettono insieme cifrari simmetrici e RSA per costruire HTTPS, SSH e la firma digitale.', () => {
  const R = C.rsa.genera(61, 53, 17);
  const KBIT = '1010011010', KNUM = parseInt(KBIT, 2);
  const KCIF = C.rsa.cifra(KNUM, R.pub);
  if (C.rsa.decifra(KCIF, R.priv) !== BigInt(KNUM)) throw new Error('cap9: chiave di sessione');
  const MSG = 'CIAO';
  const enc = C.ecb(C.testoABit(MSG), KBIT, { cifrario: 'sdes' }).output;
  const dec = C.bitATesto(C.ecb(enc, KBIT, { cifrario: 'sdes', decifra: true }).output);
  if (dec !== MSG) throw new Error('cap9: sdes ecb');
  const encHex = C.bitAHex(enc);
  const hash = (t) => [...t].reduce((s, x) => s + x.charCodeAt(0), 0) % 256;
  const DOC = 'PAGA 100', DOC2 = 'PAGA 900';
  const H1 = hash(DOC), H2 = hash(DOC2);
  const F = C.rsa.firma(H1, R.priv);
  const okF = C.rsa.verifica(F, H1, R.pub), koF = C.rsa.verifica(F, H2, R.pub);
  if (!okF || koF) throw new Error('cap9: firma');
  const DH = { p: 23, g: 5, a: 6, b: 15 };
  const modpow = (b, e, mm) => Number(C.potenzaModulare(BigInt(b), BigInt(e), BigInt(mm)));
  const Aa = modpow(DH.g, DH.a, DH.p), Bb = modpow(DH.g, DH.b, DH.p);
  const sA = modpow(Bb, DH.a, DH.p), sB = modpow(Aa, DH.b, DH.p);
  if (sA !== sB) throw new Error('cap9: dh');
  const COMANDI_SSH = codiceDa('modulo-9-ibrida/slide.html', 'COMANDI_SSH');
  const SSH_AVVISO = codiceDa('modulo-9-ibrida/slide.html', 'SSH_AVVISO');
  const OSSL = `# 1. Alice crea la coppia di chiavi RSA (una volta)
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out alice_priv.pem
openssl pkey -in alice_priv.pem -pubout -out alice_pub.pem

# 2. Bob cifra il documento con una chiave di sessione casuale (AES)
openssl rand -hex 32 > sessione.key
openssl enc -aes-256-cbc -pbkdf2 -in documento.txt -out documento.enc -pass file:sessione.key

# 3. Bob cifra la sola chiave di sessione con la pubblica di Alice (RSA)
openssl pkeyutl -encrypt -pubin -inkey alice_pub.pem -pkeyopt rsa_padding_mode:oaep -in sessione.key -out sessione.enc

# 4. Alice recupera la chiave con la sua privata e decifra il documento
openssl pkeyutl -decrypt -inkey alice_priv.pem -pkeyopt rsa_padding_mode:oaep -in sessione.enc -out sessione.key
openssl enc -d -aes-256-cbc -pbkdf2 -in documento.enc -pass file:sessione.key

# 5. Firma e verifica (SHA-256 e RSA)
openssl dgst -sha256 -sign alice_priv.pem -out documento.sig documento.txt
openssl dgst -sha256 -verify alice_pub.pem -signature documento.sig documento.txt`;
  return [
    sez('Due famiglie, due difetti'),
    tabella(['', 'Simmetrica (DES, AES)', 'Asimmetrica (RSA)'], [
      ['Chiavi', 'Una sola per cifrare e decifrare', 'Coppia: pubblica per cifrare, privata per decifrare'],
      ['Velocità', 'Molto veloce, anche in hardware', 'Lenta e adatta solo a dati piccoli (meno di n)'],
      ['Problema', 'Come si scambia la chiave in sicurezza? Per n persone servono n(n−1)/2 chiavi', 'Nessun segreto da scambiare prima; ogni utente ha una sola coppia'],
    ]),
    tabella(['Persone', 'Chiavi simmetriche', 'Coppie RSA'], [10, 100, 1000].map((n) => [String(n), it(n * (n - 1) / 2), String(n)]), { mono: true, center: true }),

    sez('L\'idea: RSA per la chiave, AES per i dati'),
    p('La soluzione è usare i due sistemi insieme. Si genera una <b>chiave di sessione</b> casuale e usa-e-getta; RSA cifra soltanto quella chiave (pochi byte, quindi il costo è trascurabile); il cifrario simmetrico (AES, o DES nei nostri esempi didattici) cifra tutti i dati, con velocità di centinaia di MB al secondo su un PC. La chiave cifrata viaggia insieme ai dati cifrati.'),
    p('Con RSA a 2048 bit e padding OAEP-SHA256 si possono cifrare al massimo 190 byte: la chiave AES (32 byte) ci sta di sicuro, un documento no.'),
    esempio('Alice e Bob con numeri piccoli', [
      p(`Alice ha la coppia RSA dei capitoli precedenti: pubblica (e = ${R.e}, n = ${R.n}), privata d = ${R.d}. Bob vuole mandarle il messaggio «${MSG}». Come cifrario simmetrico usiamo S-DES, che ha una chiave di 10 bit (quindi un numero minore di n).`),
      tabella(['Passo', 'Chi', 'Che cosa'], [
        ['1', 'Alice', `Crea la coppia di chiavi RSA e pubblica la chiave pubblica (${R.e}, ${R.n}).`],
        ['2', 'Bob', `Inventa una chiave di sessione casuale: ${KBIT} (in decimale ${KNUM}).`],
        ['3', 'Bob', `Cifra la chiave di sessione con la pubblica di Alice: c = ${KNUM}^${R.e} mod ${R.n} = ${KCIF}.`],
        ['4', 'Bob', `Cifra i dati con S-DES e la chiave di sessione: «${MSG}» → ${encHex} (esadecimale).`],
        ['5', 'Bob', `Invia ad Alice la chiave cifrata (${KCIF}) e i dati cifrati (${encHex}).`],
        ['6', 'Alice', `Con la sua privata ricava la chiave: ${KCIF}^${R.d} mod ${R.n} = ${C.rsa.decifra(KCIF, R.priv)} (cioè ${KBIT}).`],
        ['7', 'Alice', `Decifra i dati con la chiave di sessione e legge «${dec}».`],
      ], { mono: false }),
      p('Eve vede passare solo numeri senza senso: la chiave di sessione cifrata e i dati cifrati. Per leggerli dovrebbe rompere RSA o provare le chiavi del cifrario simmetrico.'),
    ].join('')),

    sez('Hash: l\'impronta digitale di un dato'),
    p('Una <b>funzione hash</b> trasforma un dato di qualunque lunghezza in un\'impronta di lunghezza fissa. Le proprietà che servono sono tre:'),
    ul([
      '<b>Lunghezza fissa</b>: SHA-256 dà sempre 256 bit, qualunque sia il dato.',
      '<b>Un solo verso</b>: dall\'impronta non si risale al testo.',
      '<b>Effetto valanga</b>: un carattere diverso cambia circa metà dei bit dell\'impronta.',
    ]),
    nota(`Nei nostri esempi numerici usiamo un hash <i>giocattolo</i>: la somma dei codici dei caratteri modulo 256. Non è sicuro (serve solo a far tornare i conti con n = 3233). Per «${DOC}» vale ${H1}, per «${DOC2}» vale ${H2}. Nella realtà si usa SHA-256.`, 'Hash giocattolo'),

    sez('La firma digitale: RSA al contrario'),
    p('Per firmare si <b>cifra l\'hash con la chiave privata</b>; chiunque verifica con la chiave pubblica.'),
    esempio('firma di «' + DOC + '»', [
      ol([
        `Alice calcola l'hash del documento: «${DOC}» → ${H1}.`,
        `Alice cifra l'hash con la sua chiave privata (è la formula della decifratura RSA usata al contrario): firma = ${H1}^${R.d} mod ${R.n} = ${ev(String(F))}. Invia documento e firma.`,
        `Bob ricalcola l'hash di «${DOC}» (${H1}) e applica la chiave pubblica alla firma: ${F}^${R.e} mod ${R.n} = ${ev(String(C.potenzaModulare(F, R.e, R.n)))}. I due numeri coincidono: <b>firma valida</b>.`,
        `Se Mallory cambia il documento in «${DOC2}», Bob ricalcola l'hash ${H2}, ma la firma restituisce ${H1}: non coincidono, <b>firma non valida</b>. Mallory non può rifare la firma perché non ha la chiave privata di Alice.`,
      ]),
    ].join('')),
    sub('Che cosa garantisce una firma'),
    tabella(['Garanzia', 'Perché'], [
      ['Integrità', 'Se un bit del documento cambia, l\'hash non coincide più'],
      ['Autenticità', 'Solo chi ha la chiave privata poteva produrre quella firma'],
      ['Non ripudio', 'Il firmatario non può negare, perché la privata è solo sua'],
    ]),
    errore('La firma non nasconde il contenuto (il documento resta leggibile) e non dice <i>chi è</i> il proprietario della chiave pubblica: lo dimostra solo se sei sicuro che quella pubblica sia davvero di Alice.', 'Che cosa NON fa'),

    sez('Di chi è questa chiave pubblica?'),
    p('La chiave pubblica non è segreta, ma deve essere <b>autentica</b>. Un attaccante che si mette in mezzo (Mallory) può sostituirla: è l\'attacco <b>man-in-the-middle</b>.'),
    ol([
      'Alice chiede la chiave pubblica di Bob; Mallory intercetta la richiesta.',
      'Mallory risponde con la <i>sua</i> chiave pubblica; Alice crede che sia di Bob e conserva la vera pubblica di Bob per sé.',
      'Alice cifra la chiave di sessione con la pubblica sbagliata: apre Mallory con la sua privata e conosce la chiave.',
      'Mallory ricifra la chiave con la vera pubblica di Bob e la inoltra: legge e può modificare tutto, e nessuno dei due se ne accorge.',
    ]),
    sub('Certificati e autorità di certificazione'),
    p('Il rimedio è il <b>certificato</b> (standard X.509), un documento firmato che lega una chiave pubblica a un nome. Contiene:'),
    ul(['il nome del soggetto (per esempio <span class="m">www.example.it</span>);', 'la sua <b>chiave pubblica</b>;', 'le date di inizio e fine validità;', 'chi l\'ha emesso;', 'la <b>firma</b> dell\'emittente.']),
    p('Il certificato è firmato da una <b>autorità di certificazione</b> (CA). Le CA formano una <b>catena di fiducia</b>: la CA radice, le cui chiavi pubbliche sono già nel browser, firma una CA intermedia, che firma il certificato del sito. Il browser conosce in anticipo le chiavi pubbliche di poche CA radice: un certificato firmato da una CA fidata dimostra che quella chiave è del sito, e Mallory non può fabbricarne uno valido.'),

    sez('HTTPS: il protocollo TLS 1.3 in sintesi'),
    p('TLS è il protocollo che protegge HTTPS (specifica: RFC 8446). Ecco la sintesi dell\'handshake, cioè dello scambio iniziale:'),
    tabella(['Direzione', 'Messaggio'], [
      ['Client → Server', 'ClientHello: algoritmi supportati, numero casuale, parte pubblica Diffie-Hellman'],
      ['Server → Client', 'ServerHello: algoritmo scelto + parte pubblica DH del server'],
      ['Server → Client (cifrato)', 'Certificate + CertificateVerify (firma con la chiave del certificato) + Finished'],
      ['Client → Server (cifrato)', 'Finished (il client ha verificato catena, nome e firma)'],
      ['Client ⇄ Server (cifrato)', 'Dati HTTP cifrati con la chiave simmetrica derivata (AES-GCM o ChaCha20-Poly1305)'],
    ]),
    errore('Nelle vecchie versioni (TLS 1.2 con suite RSA) il client cifrava il segreto con la chiave RSA del server. In TLS 1.3 questo metodo non esiste più: il segreto nasce da Diffie-Hellman effimero. La chiave del certificato (RSA o curve ellittiche) serve soltanto a <b>firmare</b> e provare l\'identità.', 'Attenzione: RSA non trasporta più la chiave'),
    sub('Diffie-Hellman: accordarsi senza trasmettere'),
    p(`Diffie-Hellman permette ad Alice e Bob di costruire lo stesso segreto parlando in pubblico. Con numeri piccoli: p = ${DH.p} (primo) e g = ${DH.g} sono pubblici.`),
    tabella(['Passo', 'Alice', 'Bob'], [
      ['1. Segreto', `sceglie a = ${DH.a}`, `sceglie b = ${DH.b}`],
      ['2. Parte pubblica', `A = g^a mod p = ${DH.g}^${DH.a} mod ${DH.p} = ${Aa}`, `B = g^b mod p = ${DH.g}^${DH.b} mod ${DH.p} = ${Bb}`],
      ['3. Si scambiano A e B', `riceve B = ${Bb}`, `riceve A = ${Aa}`],
      ['4. Segreto comune', `B^a mod p = ${Bb}^${DH.a} mod ${DH.p} = ${sA}`, `A^b mod p = ${Aa}^${DH.b} mod ${DH.p} = ${sB}`],
    ]),
    p(`Il segreto comune è ${ev(String(sA))}, mai trasmesso. Eve conosce ${DH.p}, ${DH.g}, ${Aa} e ${Bb}, ma per trovare il segreto dovrebbe risolvere il <i>logaritmo discreto</i>, difficile con numeri grandi. Il valore è <b>effimero</b>: per ogni connessione si generano numeri nuovi e si buttano, quindi se il server viene violato in futuro le sessioni passate restano al sicuro (<i>forward secrecy</i>). Diffie-Hellman da solo non autentica: un Mallory in mezzo farebbe due scambi. Per questo in TLS la parte del server è firmata e il certificato la lega al nome del sito.`),
    sub('Che cosa c\'è dietro il lucchetto'),
    ul([
      'catena di certificati fino a una radice fidata;',
      'nome del sito uguale a quello del certificato;',
      'date di validità e revoca;',
      'firma sull\'handshake (CertificateVerify).',
    ]),
    p('Un esempio reale, ottenibile con <code>openssl s_client</code>: protocollo TLSv1.3, suite TLS_AES_256_GCM_SHA384, chiave del server ECDSA a 256 bit, scambio X25519 effimero. I siti moderni spesso usano certificati con <b>curve ellittiche</b> (ECDSA), con chiavi di 256 bit equivalenti a un RSA molto più grande: la logica (firma e verifica) è la stessa vista con RSA.'),

    sez('SSH: chiavi in ~/.ssh e known_hosts'),
    codice(COMANDI_SSH, 'terminale'),
    ul([
      '<b>Server → utente</b>: al primo accesso il client mostra l\'impronta della chiave del server e la salva in <code>known_hosts</code>. Dalle volte successive la confronta.',
      '<b>Utente → server</b>: il server sfida il client, che firma con la chiave privata. La privata non viaggia mai.',
    ]),
    p('Se la chiave del server cambia, il client lo segnala con un avviso: può essere una reinstallazione, ma anche un attacco man-in-the-middle.'),
    codice(SSH_AVVISO, 'se la chiave del server cambia'),

    sez('Email cifrata e firma digitale qualificata'),
    ul([
      '<b>PGP / OpenPGP e S/MIME</b>: schema ibrido (una chiave di sessione cifra il testo, la chiave pubblica del destinatario cifra la chiave di sessione) e firma sull\'hash del messaggio. Fiducia: in PGP si verificano le impronte (<i>web of trust</i>), in S/MIME si usano certificati emessi da CA.',
      '<b>Firma digitale qualificata</b> (Italia): certificato qualificato di un prestatore di servizi fiduciari e dispositivo sicuro (smart card, token o firma remota). Per il regolamento europeo eIDAS ha il valore giuridico della firma autografa. Formati comuni: .p7m (CAdES) e PDF firmati (PAdES).',
      '<b>SPID e CIE</b> servono soprattutto a <i>identificarsi</i> online, cioè autenticarsi, e non sono di per sé una firma qualificata.',
    ]),

    sez('Mappa: chi fa che cosa nei protocolli'),
    tabella(['Protocollo', 'Accordo sulla chiave', 'Identità / firma', 'Dati'], [
      ['HTTPS (TLS 1.3)', 'Diffie-Hellman effimero (X25519)', 'Certificato (RSA o ECDSA) + firma', 'AES-GCM, ChaCha20-Poly1305'],
      ['SSH', 'Diffie-Hellman (curve25519)', 'Chiave del server e chiave utente', 'AES o ChaCha20'],
      ['Email OpenPGP', 'Chiave di sessione cifrata con RSA / ECC', 'Firma sull\'hash', 'AES'],
      ['Firma qualificata', '—', 'RSA o ECDSA sull\'hash (SHA-256)', 'documento in chiaro + firma'],
    ]),

    sez('Dai bigliettini di Cesare a HTTPS'),
    p('Il percorso del corso si legge come una sequenza di rimedi: ogni passo corregge una debolezza del precedente.'),
    ul([
      'Troppe poche chiavi (Cesare: 25) → chiavi più lunghe (Vigenère, trasposizione).',
      'Lettere con frequenze visibili → bit e diffusione (DES, AES).',
      'Chiave da scambiare in segreto → coppia di chiavi (RSA).',
      'Chiave pubblica di cui fidarsi → certificati.',
    ]),
    ricorda('Gli algoritmi sono pubblici e studiati da tutti; la sicurezza sta solo nelle chiavi, che non si inventano: si generano casuali con strumenti collaudati.', 'Principio di Kerckhoffs'),
    tabella(['Cifrario', 'Tipo', 'Chiave', 'Debolezza'], [
      ['Cesare', 'sostituzione', '1 numero (25 utili)', 'forza bruta, frequenze'],
      ['Cesare a chiave numerica', 'polialfabetico', 'serie di numeri', 'chiave ripetuta: colonne di Cesare'],
      ['Vigenère', 'polialfabetico', 'una parola', 'chiave ripetuta: Kasiski, indice di coincidenza'],
      ['Trasposizione', 'permutazione', 'ordine delle colonne', 'le lettere restano quelle: anagrammi'],
      ['XOR con chiave ripetuta', 'a flusso', 'bit ripetuti', 'testo noto, chiave riusata'],
      ['S-DES', 'a blocchi (didattico)', '10 bit', 'solo 1024 chiavi'],
      ['DES / 3DES', 'a blocchi 64 bit', '56 bit / fino a 168', 'DES: forza bruta; 3DES: lento, blocco piccolo'],
      ['AES', 'a blocchi 128 bit', '128-256 bit', 'nessuna nota in pratica; ECB espone i pattern'],
      ['RSA', 'asimmetrico', 'coppia, n = p·q', 'se n si fattorizza; serve ≥ 2048 bit e padding'],
    ]),

    sez('Dal foglio al terminale: la traccia del laboratorio OpenSSL'),
    p('Con OpenSSL si ripete al computer, con strumenti veri, quanto visto con numeri piccoli. Questa è la sequenza essenziale (la scheda del laboratorio la guida passo per passo, con il confronto tra ECB e CBC, il tentativo di cifrare un file con RSA, i certificati dei siti con <code>openssl s_client</code>).'),
    codice(OSSL, 'openssl.sh'),
    nota('Si cifra con RSA la sola chiave di sessione; il documento, che è molto più grande di n, viaggia cifrato con AES. Provando a cifrare direttamente un file grande con RSA, OpenSSL risponde con un errore: il dato supera la dimensione massima. È la dimostrazione pratica del perché esiste la crittografia ibrida.'),

    ricorda(ul([
      'La <b>simmetrica</b> è veloce ma serve una chiave condivisa; l\'<b>asimmetrica</b> è lenta ma risolve lo scambio: si usano insieme (<b>schema ibrido</b>).',
      'L\'<b>hash</b> dà un\'impronta; la <b>firma</b> la cifra con la privata e garantisce integrità e autenticità.',
      'I <b>certificati</b> legano una chiave pubblica a un nome e fermano il man-in-the-middle.',
      '<b>TLS 1.3</b> usa Diffie-Hellman effimero per la chiave e la firma per l\'identità; <b>SSH</b> segue la stessa logica.',
    ])),

    domande([
      'Perché non si cifra un intero file con RSA? Descrivi i passaggi della cifratura ibrida.',
      'Che cosa si firma in una firma digitale e perché? Chi usa quale chiave per firmare e per verificare?',
      'Descrivi l\'attacco man-in-the-middle sulla chiave pubblica e spiega come i certificati lo bloccano.',
      'Con p = 23, g = 5, a = 4 e b = 3 calcola A, B e il segreto condiviso di Diffie-Hellman.',
      'Che cosa significa «effimero» in Diffie-Hellman effimero e quale proprietà garantisce?',
      'Che differenza c\'è tra una firma digitale qualificata e l\'accesso con SPID o CIE?',
      'Collega ogni debolezza della tabella finale al cifrario che la corregge.',
    ]),
    rimandi([
      ['../modulo-9-ibrida/slide.html', 'Slide del modulo 9', ''],
      ['../modulo-9-ibrida/simulazione-ibrida.html', 'Simulazione: crittografia ibrida', 'con la tua chiave e il tuo messaggio'],
      ['../lab-openssl/scheda.html', 'Lab OpenSSL', 'simmetrica, asimmetrica, ibrida, firme e certificati dei siti'],
      ['../quiz/quiz.html?modulo=9', 'Quiz del modulo 9', ''],
    ]),
  ].join('\n');
});
