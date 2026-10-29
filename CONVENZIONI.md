# Convenzioni di sviluppo (vincolanti)

Modello da copiare: `modulo-1-cesare/` (slide, simulazione, gioco), `lab-php/01-cesare/`, `schede/bigliettini-cesare.html`.
Specifica generale: `DESIGN.md`.

## Pagine

- Head: copiare quello di `modulo-1-cesare/slide.html` (font, `../assets/style.css`, React/ReactDOM 18.3.1,
  Babel 7.26.4 da jsDelivr, poi `../assets/crypto.js` e `../assets/deck.js` come script normali).
  Script inline `type="text/babel"` con JSX.
- `Deck.mount(slides, {modulo, nome, sottotitolo, indice})`. Slide = `{sezione, titolo, contenuto: () => <jsx/>,
  note: stringa|array, copertina?, senzaTitolo?}`. `contenuto` è montato come componente (hook nei figli).
  Il font radice si riduce da solo se la slide non entra: tenere slide leggere, `verifica.js` segnala scroll.
- Tasti: frecce/spazio, Home/End, N note, I elenco, F fullscreen; hash `#n` (1-based).
- Pagine mobile (simulazioni, giochi): `UI.PaginaGioco{titolo, indietro, indietroEtichetta, largo}` + `UI.render(<App/>)`.
- Stampabili (schede, dispensa): `assets/print.css` (tema chiaro).

## window.UI (props in inglese, testi in italiano)

Box{type: info|warn|danger|tip|success, title} · Glow · Chip{color} · Grid{cols, gap, stretch, keep2, className}
(1 colonna sotto 900px) · Card{tone, light} · Btn{variant: primary|info|success|danger|ghost, small} ·
Field{label, htmlFor} · Table{head, rows, mono, center, hlRow} · Flow{steps:[{icon,label,sub,color}]} ·
CompareTwo{left, right} · ActivityBadge{href, label, icon, stesso} · Kbd ·
BitRow{bits, group, marks:{i:'info|warn|success|danger'}, onToggle(i), label, compact} ·
Steps{steps:[{title, content}], mode: single|cumulative, start, keys} ·
Code{code, lang, title, reveal, explain (array per riga 0-based), highlight, keys} ·
UI.salva(k, v) / UI.carica(k, def) (localStorage sicuro, prefisso `des-rsa:`) ·
Deck.usaPassi({avanti, indietro}) per stepper interni che consumano le frecce.

Classi CSS: .stack .stack-lg .row .row-between .grow .card .sim/.sim-title .out .input .feedback.ok|ko .mono .hl
.muted .small .xs .lead .t-info|success|danger|warn|purple .hide-mobile .scrollx.
Testo colorato: usare le varianti `-t`, non `--danger` puro.

## window.Cripto (assets/crypto.js)

cesare/cesareDecifra/cesareTraccia · cesareGeneralizzato/…Decifra/…Traccia · vigenere/vigenereDecifra/vigenereTraccia ·
trasposizioneColonne/…Decifra/trasposizioneGriglia · frequenze, punteggioItaliano, forzaBruta, indovinaChiaveCesare,
indiceCoincidenza, kasiski · normalizza, senzaAccenti, testoABit/bitATesto, hexABit/bitAHex, testoAHex/hexATesto,
xor, xorCiclico · sdes.{chiavi,F,cifra,decifra,traccia} · des.{sottochiavi,F,cifra,decifra,traccia,tripleCifra,tripleDecifra}
· ecb(dati, chiave, {cifrario:'des'|'sdes', decifra, padding}) · mcd, euclideEsteso (tabella passi), inversoModulare,
potenzaModulare, potenzaModularePassi, isPrimo, fattorizza · rsa.{genera,cifra,decifra,firma,verifica}.
Cesare/Vigenère/affine preservano maiuscole e simboli; trasposizione normalizza A-Z con padding X.
Bit come stringhe '0101', hex maiuscolo; aritmetica BigInt se un argomento è BigInt, rsa.* sempre BigInt.

## Lab PHP

Vedi `lab-php/README.md`. `esercizio.php` solo funzioni con strict_types; `test.php` include `$argv[1] ?? esercizio.php`,
harness copiato da `lab-php/01-cesare/test.php`. Soluzione in `docente/lab-php/NN-nome/soluzione.php`,
deve passare `php test.php ../../docente/lab-php/NN-nome/soluzione.php`.

## Regole di contenuto

Italiano corretto con accenti · nessun riferimento cronologico tra lezioni · esempi numerici calcolati con crypto.js ·
nessuna soluzione delle sfide in slide/note/schede pubbliche (soluzioni solo in `docente/`, esclusa da git) ·
note docente su ogni slide · `node tests/verifica.js` a 0 errori · `node --test` verde.
