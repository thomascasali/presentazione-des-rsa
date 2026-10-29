# Presentazione DES e RSA — specifica di design

Target: 5ª ITIS Informatica, Sistemi e Reti. Prodotto autosufficiente, non legato a un numero di lezioni,
nessun riferimento cronologico ("nella scorsa lezione", "oggi"). Lingua: italiano.

## Stack (come corso-ia-scuola)

- HTML autonomi, zero build. React 18.3.1 + ReactDOM 18.3.1 + @babel/standalone 7.26.4 da
  jsDelivr con versioni fisse (`https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js` ecc.).
- Google Fonts: Fraunces (titoli), Public Sans (testo), IBM Plex Mono (codice e bit).
- Tema unico scuro caldo come corso-ia-scuola (`--bg #15120f`, card più chiare), contrasto WCAG:
  testo ≥ 4.5:1, testo grande/icone ≥ 3:1, mai bianco su colori medio-chiari, target tocco ≥ 44px.
- Responsive: LIM 1920x1080 / 1366x768 senza scroll; smartphone 390x844 senza overflow orizzontale.
- Deve funzionare anche aperto da `file://`: niente `<script type="text/babel" src=...>` esterni
  (Babel li scarica via XHR). I file condivisi sono **JS puro** (niente JSX) o CSS.

## File condivisi (`assets/`)

- `assets/style.css` — token colore, tipografia, layout slide, componenti CSS.
- `assets/crypto.js` — motore crittografico puro, UMD (`window.Cripto` nel browser, `module.exports`
  in Node). Funzioni con passi intermedi per i simulatori (ogni funzione può restituire la traccia).
  Contenuto: cesare, cesareGeneralizzato, vigenere, trasposizioneColonne (cifra/decifra + griglia),
  frequenze lettere italiane, forzaBruta, xor, sdes (chiave 10 bit, traccia completa: P10, LS, P8,
  IP, F, E/P, S0/S1, P4, SW, IP⁻¹), des (64 bit, 16 round, traccia per round, sottochiavi), ecb,
  mcd, euclideEsteso, inversoModulare, potenzaModulare (traccia square-and-multiply), isPrimo,
  rsa (genera chiavi da p,q,e; cifra/decifra/firma/verifica con BigInt).
- `assets/deck.js` — guscio presentazione in JS puro con `React.createElement`: `window.Deck.mount(slides, opts)`.
  Navigazione frecce/swipe/click, indice slide, tasto N note, F schermo intero, hash `#n` nell'URL,
  intestazione "Modulo N — nome · sezione", barra di avanzamento, link a indice.
  Componenti esportati (`window.UI`): Box(type), Glow, Chip, Code (evidenziazione righe e
  rivelazione progressiva riga per riga), BitRow (bit cliccabili/evidenziati), Grid, Steps
  (stepper avanti/indietro), ActivityBadge (link ad attività/simulazione), CompareTwo.
- Ogni `slide.html` contiene solo le slide del modulo (JSX inline) e i simulatori specifici.

## Struttura cartelle

```
index.html                       indice generale (moduli, simulazioni, giochi, dispensa, quiz, lab)
assets/                          style.css, crypto.js, deck.js
modulo-0-introduzione/slide.html
modulo-1-cesare/slide.html  + simulazione-*.html (pagine da smartphone)
modulo-2-cesare-generalizzato/
modulo-3-vigenere/
modulo-4-trasposizione/
modulo-5-cifrari-moderni/        bit, XOR, confusione/diffusione, cifrari a blocchi
modulo-6-des/                    Feistel, S-DES a mano, DES reale, ECB, 3DES, AES
modulo-7-matematica-rsa/         mod, MCD, Euclide esteso, inverso, potenza modulare, primi
modulo-8-rsa/                    chiavi, cifratura, firma, sicurezza/fattorizzazione
modulo-9-ibrida/                 crittografia ibrida, TLS/SSH, ponte verso lab OpenSSL
lab-php/NN-nome/                 scheda.html (3 livelli), esercizio.php (scheletro), test.php
lab-openssl/scheda.html
dispensa/dispensa.html           testo completo stampabile (CSS print), esempi svolti
schede/                          schede attività stampabili (bigliettini, esercizi carta)
quiz/quiz.html                   quiz per modulo + verifica finale
docente/                         PRIVATO, mai pubblicato: soluzioni PHP, soluzioni schede, note
tests/                           test Node del motore, verifica Playwright
```

## Ogni modulo dei cifrari classici

1. Idea e storia (breve). 2. Come funziona, con esempio svolto passo passo. 3. Simulatore.
4. Gioco/attività (smartphone o carta). 5. Codice PHP spiegato (rivelazione riga per riga,
affiancato al simulatore). 6. Attacco (forza bruta / frequenze / Kasiski) e debolezze.
7. Riepilogo + rimando al lab PHP e al quiz.

## Giochi (smartphone + carta, nessun server)

- Pagine `simulazione-*.html` o `gioco-*.html` mobile-first, aperte dal telefono via QR/URL.
- Gioco bigliettini: generatore di messaggi cifrati con chiave casuale + schede stampabili.
- Sfide: "rompi il messaggio" (forza bruta, frequenze), "S-DES a mano" con verifica, "RSA di classe"
  (ogni studente genera la coppia di chiavi, pubblica la pubblica, riceve un messaggio cifrato).
- Stato solo in `localStorage` (con try/catch), nessun dato personale.

## Lab PHP (PHP 8, CLI o XAMPP)

Cesare, Cesare generalizzato, Vigenère, trasposizione, analisi frequenze, RSA giocattolo
(MCD, Euclide esteso, square-and-multiply con int piccoli), DES via `openssl_encrypt()`.
Tre livelli: completa / scrivi l'inversa / scrivi l'attacco. `test.php` con vettori attesi.
Soluzioni complete in `docente/lab-php/` (devono passare i test). Codice PHP commentato in italiano.

## Correttezza

- DES verificato con vettori ufficiali (es. chiave `133457799BBCDFF1`, testo `0123456789ABCDEF`
  → `85E813540F0AB405`), S-DES con esempi noti di Stallings, RSA con esempi a mano (p=61, q=53, e=17).
- Ogni esempio numerico nelle slide/dispensa è generato o verificato con `assets/crypto.js`.

## Note per il docente

Pannello note (tasto N) in ogni slide. Pubbliche: nessuna soluzione delle sfide nelle note.
