const L = require('./lib');
const { esc } = L;

const GLOSSARIO = [
  ['AES', 'Advanced Encryption Standard. Cifrario a blocchi simmetrico a 128 bit con chiave da 128, 192 o 256 bit, standard dal 2001 (FIPS 197).', 6],
  ['Algoritmo (cifrario)', 'La regola con cui si trasforma il testo in chiaro in testo cifrato. Per il principio di Kerckhoffs può essere pubblica.', 0],
  ['Asimmetrica (crittografia)', 'Sistema con una coppia di chiavi legate: una pubblica e una privata. Ciò che una cifra, solo l\'altra decifra.', 0],
  ['Attacco a testo noto', 'Attacco in cui l\'attaccante conosce una parte del testo in chiaro e il corrispondente cifrato (per esempio l\'inizio di un messaggio).', 5],
  ['Autorità di certificazione (CA)', 'Ente che emette certificati firmandoli; le CA radice sono già presenti nel browser.', 9],
  ['Effetto valanga', 'Proprietà per cui cambiando un solo bit in ingresso cambia circa metà dei bit in uscita.', 5],
  ['Blocco', 'Gruppo di bit di lunghezza fissa su cui lavora un cifrario a blocchi (64 bit nel DES, 128 nell\'AES).', 5],
  ['CBC (Cipher Block Chaining)', 'Modalità operativa in cui ogni blocco in chiaro è combinato con XOR con il cifrato del blocco precedente prima di essere cifrato.', 6],
  ['Certificato (X.509)', 'Documento firmato che lega una chiave pubblica a un nome (soggetto), con date di validità ed emittente.', 9],
  ['Chiave', 'Il dato segreto che governa il funzionamento di un algoritmo di cifratura.', 0],
  ['Cifrare / decifrare', 'Trasformare un testo in chiaro in testo cifrato (cifrare) e viceversa conoscendo la chiave (decifrare). Da non usare «criptare».', 0],
  ['Confusione', 'Proprietà di Shannon: il legame tra chiave e cifrato deve essere complicato. Si ottiene con la sostituzione (S-box).', 5],
  ['Congruenza', 'a ≡ b (mod n) significa che a e b hanno lo stesso resto nella divisione per n.', 7],
  ['Coprimi (numeri)', 'Due numeri senza fattori in comune, cioè con MCD uguale a 1.', 7],
  ['Crittoanalisi', 'Studio dei metodi per leggere o rompere un messaggio cifrato senza conoscere la chiave.', 0],
  ['DES', 'Data Encryption Standard. Cifrario a blocchi di 64 bit con chiave di 56 bit e 16 round di Feistel, standard dal 1977 (FIPS 46-3).', 6],
  ['Diffie-Hellman', 'Metodo con cui due parti costruiscono uno stesso segreto comunicando su un canale pubblico.', 9],
  ['Diffusione', 'Proprietà di Shannon: ogni bit del messaggio deve influenzare molti bit del cifrato. Si ottiene con permutazioni e più round.', 5],
  ['ECB (Electronic Codebook)', 'Modalità operativa in cui ogni blocco si cifra da solo: blocchi uguali producono cifrati uguali.', 6],
  ['Euclide (algoritmo di)', 'Metodo per calcolare il MCD con divisioni successive; nella versione estesa fornisce anche l\'inverso modulare.', 7],
  ['Feistel (rete di)', 'Struttura a round che divide il blocco in due metà L e R: L′ = R, R′ = L ⊕ F(R, K). Si decifra con le sottochiavi in ordine inverso.', 6],
  ['Firma digitale', 'Hash del documento cifrato con la chiave privata del firmatario; si verifica con la chiave pubblica.', 8],
  ['Forza bruta', 'Attacco che prova tutte le chiavi possibili.', 1],
  ['Forward secrecy', 'Proprietà per cui la violazione futura di una chiave non permette di decifrare le sessioni passate; ottenuta con Diffie-Hellman effimero.', 9],
  ['Frequenze (analisi delle)', 'Attacco che confronta la frequenza delle lettere del cifrato con quella del linguaggio.', 1],
  ['Funzione con botola', 'Funzione facile da calcolare, difficile da invertire, ma facile da invertire per chi conosce un\'informazione segreta (la botola).', 7],
  ['Hash', 'Funzione che associa a un dato qualsiasi un\'impronta di lunghezza fissa, non invertibile e molto sensibile alle modifiche (per esempio SHA-256).', 9],
  ['Ibrida (crittografia)', 'Uso combinato di crittografia asimmetrica per scambiare una chiave e simmetrica per cifrare i dati.', 9],
  ['Indice di coincidenza (IC)', 'Probabilità che due lettere prese a caso in un testo siano uguali: circa 0,074 per l\'italiano, circa 0,038 per lettere casuali.', 3],
  ['Inverso modulare', 'Per a modulo n, il numero x con a·x ≡ 1 (mod n); esiste se e solo se MCD(a, n) = 1.', 7],
  ['IV (vettore di inizializzazione)', 'Valore casuale, non segreto, usato per cifrare il primo blocco in CBC; va cambiato a ogni messaggio.', 6],
  ['Kasiski (metodo di)', 'Stima della lunghezza della chiave di Vigenère dalle distanze tra sequenze ripetute nel cifrato.', 3],
  ['Kerckhoffs (principio di)', 'La sicurezza di un cifrario deve dipendere solo dalla segretezza della chiave e non da quella dell\'algoritmo.', 0],
  ['MCD', 'Massimo comun divisore: il più grande numero che divide due numeri dati.', 7],
  ['Man-in-the-middle', 'Attacco in cui l\'attaccante si interpone tra le parti, sostituendo per esempio una chiave pubblica con la propria.', 9],
  ['Modulo (aritmetica modulare)', 'Aritmetica in cui i numeri «girano» come su un orologio: a mod n è il resto della divisione di a per n.', 7],
  ['Monoalfabetico / polialfabetico', 'Cifrario che usa un solo alfabeto di sostituzione (Cesare) oppure più alfabeti in rotazione (Vigenère).', 3],
  ['One-time pad', 'Cifrario XOR con chiave casuale, lunga quanto il messaggio e usata una sola volta: sicurezza perfetta.', 3],
  ['Padding', 'Riempimento aggiunto a un messaggio. In RSA (OAEP, PSS) aggiunge casualità e struttura; in un cifrario a blocchi completa l\'ultimo blocco.', 8],
  ['φ di Eulero', 'φ(n) è il numero di interi tra 1 e n coprimi con n; φ(p·q) = (p − 1)(q − 1) per p e q primi.', 7],
  ['Potenza modulare', 'Calcolo di m^e mod n; con square-and-multiply si fa riducendo modulo n a ogni passo.', 7],
  ['RSA', 'Cifrario asimmetrico di Rivest, Shamir e Adleman (1977) basato sulla difficoltà di fattorizzare n = p·q.', 8],
  ['S-box', 'Tabella di sostituzione non lineare: fonte di confusione nei cifrari a blocchi (8 S-box da 6 a 4 bit nel DES).', 6],
  ['S-DES', 'Versione semplificata del DES a scopo didattico (blocco 8 bit, chiave 10 bit, 2 round).', 6],
  ['Simmetrica (crittografia)', 'Sistema in cui cifratura e decifratura usano la stessa chiave segreta.', 0],
  ['Square-and-multiply', 'Algoritmo che scorre l\'esponente in binario elevando al quadrato e moltiplicando quando il bit è 1.', 7],
  ['Steganografia', 'Tecnica che nasconde l\'esistenza stessa di un messaggio.', 0],
  ['Sostituzione / trasposizione', 'Le due operazioni elementari dei cifrari: cambiare le lettere o cambiarne l\'ordine.', 0],
  ['TLS', 'Transport Layer Security: protocollo che protegge HTTPS; la versione 1.3 è descritta nella RFC 8446.', 9],
  ['Triple DES (3DES)', 'DES applicato tre volte (cifra-decifra-cifra) con due o tre chiavi; sicurezza effettiva circa 112 bit.', 6],
  ['Vigenère (cifrario di)', 'Cifrario polialfabetico con chiave a parola: ogni lettera si sposta del valore della lettera corrispondente della chiave.', 3],
  ['XOR (⊕)', 'OR esclusivo: dà 1 se i due bit sono diversi. A ⊕ K ⊕ K = A.', 5],
];

const FONTI = {
  standard: [
    'NIST, <i>FIPS PUB 46-3: Data Encryption Standard (DES)</i>, 25 ottobre 1999 (ritirato nel 2005).',
    'NIST, <i>FIPS PUB 197: Advanced Encryption Standard (AES)</i>, 2001 (aggiornato nel 2023).',
    'K. Moriarty, B. Kaliski, J. Jonsson, A. Rusch, <i>RFC 8017: PKCS #1: RSA Cryptography Specifications Version 2.2</i>, IETF, novembre 2016.',
    'E. Rescorla, <i>RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3</i>, IETF, agosto 2018.',
    'D. Cooper et al., <i>RFC 5280: Internet X.509 Public Key Infrastructure Certificate and CRL Profile</i>, IETF, maggio 2008.',
    'E. Barker, <i>NIST SP 800-57 Part 1: Recommendation for Key Management</i>, NIST (raccomandazioni sulle dimensioni delle chiavi).',
    'NIST, <i>FIPS 203, 204, 205</i> (algoritmi di crittografia post-quantistica), agosto 2024.',
  ],
  libri: [
    'W. Stallings, <i>Cryptography and Network Security: Principles and Practice</i>, Pearson (varie edizioni). Fonte dell\'esempio S-DES.',
    'S. Singh, <i>Codici &amp; segreti</i>, Rizzoli (edizione originale: <i>The Code Book</i>, 1999). Storia della crittografia dai cifrari antichi a RSA.',
    'Electronic Frontier Foundation, <i>Cracking DES: Secrets of Encryption Research, Wiretap Politics and Chip Design</i>, O\'Reilly, 1998 (la macchina «Deep Crack»).',
  ],
  articoli: [
    'A. Kerckhoffs, «La cryptographie militaire», <i>Journal des sciences militaires</i>, 1883.',
    'F. W. Kasiski, <i>Die Geheimschriften und die Dechiffrir-Kunst</i>, 1863.',
    'C. E. Shannon, «Communication Theory of Secrecy Systems», <i>Bell System Technical Journal</i>, 1949.',
    'W. Diffie, M. E. Hellman, «New Directions in Cryptography», <i>IEEE Transactions on Information Theory</i>, 1976.',
    'R. L. Rivest, A. Shamir, L. Adleman, «A Method for Obtaining Digital Signatures and Public-Key Cryptosystems», <i>Communications of the ACM</i>, 1978.',
  ],
};

function glossario() {
  const voci = GLOSSARIO.slice().sort((a, b) => a[0].localeCompare(b[0], 'it', { sensitivity: 'base' }));
  return `<section class="cap fine" id="glossario">
<header class="cap-head"><p class="cap-num">Appendice A</p><h2 class="cap-title">Glossario</h2></header>
<dl class="glossario">${voci.map(([t, d, c]) => `<dt>${esc(t)}</dt><dd>${esc(d)} <a class="rif" href="#cap-${c}">cap. ${c}</a></dd>`).join('')}</dl>
</section>`;
}
function fonti() {
  const lista = (t, v) => `<h3>${t}</h3><ul class="fonti">${v.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  return `<section class="cap fine" id="fonti">
<header class="cap-head"><p class="cap-num">Appendice B</p><h2 class="cap-title">Fonti e letture</h2><p class="cap-intro">Riferimenti essenziali. Gli esempi numerici della dispensa sono calcolati con il motore del progetto (<span class="m">assets/crypto.js</span>) e verificati sui vettori di prova ufficiali: per il DES, chiave 133457799BBCDFF1 e blocco 0123456789ABCDEF con cifrato atteso 85E813540F0AB405; per RSA, l'esempio a mano con p = 61, q = 53, e = 17.</p></header>
${lista('Standard e specifiche', FONTI.standard)}
${lista('Libri', FONTI.libri)}
${lista('Articoli originali', FONTI.articoli)}
</section>`;
}
module.exports = { glossario, fonti, GLOSSARIO };
