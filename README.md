# Crittografia: dai cifrari classici a DES e RSA

Percorso didattico interattivo per la classe 5ª ITIS Informatica (Sistemi e Reti).
Ci sono slide, simulatori, giochi da smartphone, schede da stampare, laboratori PHP e OpenSSL, una dispensa e un quiz.

**Sito:** https://thomascasali.github.io/presentazione-des-rsa/

## Dispensa

- [Dispensa online](https://thomascasali.github.io/presentazione-des-rsa/dispensa/dispensa.html), con indice navigabile
- [Dispensa PDF](https://thomascasali.github.io/presentazione-des-rsa/dispensa/dispensa.pdf), A4 da stampare

## Moduli

| # | Argomento | Slide | Attività |
|---|-----------|-------|----------|
| 0 | Introduzione alla crittografia | [slide](https://thomascasali.github.io/presentazione-des-rsa/modulo-0-introduzione/slide.html) | [doppio lucchetto](https://thomascasali.github.io/presentazione-des-rsa/modulo-0-introduzione/simulazione-lucchetti.html) |
| 1 | Cifrario di Cesare | [slide](https://thomascasali.github.io/presentazione-des-rsa/modulo-1-cesare/slide.html) | [ruota](https://thomascasali.github.io/presentazione-des-rsa/modulo-1-cesare/simulazione-ruota.html) · [rompi Cesare](https://thomascasali.github.io/presentazione-des-rsa/modulo-1-cesare/gioco-rompi-cesare.html) |
| 2 | Cesare generalizzato (chiave numerica) | [slide](https://thomascasali.github.io/presentazione-des-rsa/modulo-2-cesare-generalizzato/slide.html) | [simulazione](https://thomascasali.github.io/presentazione-des-rsa/modulo-2-cesare-generalizzato/simulazione-chiave-numerica.html) |
| 3 | Cifrario di Vigenère | [slide](https://thomascasali.github.io/presentazione-des-rsa/modulo-3-vigenere/slide.html) | [tavola](https://thomascasali.github.io/presentazione-des-rsa/modulo-3-vigenere/simulazione-vigenere.html) · [rompi Vigenère](https://thomascasali.github.io/presentazione-des-rsa/modulo-3-vigenere/gioco-rompi-vigenere.html) |
| 4 | Trasposizione a colonne | [slide](https://thomascasali.github.io/presentazione-des-rsa/modulo-4-trasposizione/slide.html) | [griglia](https://thomascasali.github.io/presentazione-des-rsa/modulo-4-trasposizione/simulazione-colonne.html) |
| 5 | Dai caratteri ai bit, XOR | [slide](https://thomascasali.github.io/presentazione-des-rsa/modulo-5-cifrari-moderni/slide.html) | [XOR](https://thomascasali.github.io/presentazione-des-rsa/modulo-5-cifrari-moderni/simulazione-xor.html) |
| 6 | DES | [slide](https://thomascasali.github.io/presentazione-des-rsa/modulo-6-des/slide.html) | [S-DES](https://thomascasali.github.io/presentazione-des-rsa/modulo-6-des/simulazione-sdes.html) · [DES](https://thomascasali.github.io/presentazione-des-rsa/modulo-6-des/simulazione-des.html) · [S-DES a mano](https://thomascasali.github.io/presentazione-des-rsa/modulo-6-des/gioco-sdes-a-mano.html) |
| 7 | Matematica per RSA | [slide](https://thomascasali.github.io/presentazione-des-rsa/modulo-7-matematica-rsa/slide.html) | [Euclide](https://thomascasali.github.io/presentazione-des-rsa/modulo-7-matematica-rsa/simulazione-euclide.html) · [potenza modulare](https://thomascasali.github.io/presentazione-des-rsa/modulo-7-matematica-rsa/simulazione-potenza-modulare.html) |
| 8 | RSA | [slide](https://thomascasali.github.io/presentazione-des-rsa/modulo-8-rsa/slide.html) | [simulatore](https://thomascasali.github.io/presentazione-des-rsa/modulo-8-rsa/simulazione-rsa.html) · [RSA di classe](https://thomascasali.github.io/presentazione-des-rsa/modulo-8-rsa/gioco-rsa-di-classe.html) |
| 9 | Crittografia ibrida, TLS, SSH | [slide](https://thomascasali.github.io/presentazione-des-rsa/modulo-9-ibrida/slide.html) | [protocollo ibrido](https://thomascasali.github.io/presentazione-des-rsa/modulo-9-ibrida/simulazione-ibrida.html) |

Quiz di autovalutazione per modulo e verifica finale: [quiz](https://thomascasali.github.io/presentazione-des-rsa/quiz/quiz.html).

## Laboratori

- **PHP:** [01 Cesare](lab-php/01-cesare/), [02 chiave numerica](lab-php/02-cesare-generalizzato/), [03 Vigenère](lab-php/03-vigenere/), [04 trasposizione](lab-php/04-trasposizione/), [05 frequenze](lab-php/05-frequenze/), [06 RSA giocattolo](lab-php/06-rsa-giocattolo/), [07 DES con OpenSSL](lab-php/07-des-openssl/). Ogni lab ha una scheda, un `esercizio.php` da completare e un `test.php`. Convenzioni in [lab-php/README.md](lab-php/README.md).
- **OpenSSL:** [scheda](https://thomascasali.github.io/presentazione-des-rsa/lab-openssl/scheda.html) per cifrare con AES/3DES, generare chiavi RSA, firmare e ispezionare certificati.

Schede da stampare in [schede/](schede/): bigliettini, S-DES a mano, RSA di classe, esercizi di matematica.

## Comandi delle slide

Frecce o spazio per avanzare · Home/End · **N** note per il docente · **I** elenco delle slide · **F** schermo intero.
Le pagine di simulazioni e giochi sono pensate per lo smartphone.

## Per chi sviluppa

Sono pagine HTML autonome, senza build: React, ReactDOM e Babel arrivano da CDN con versioni fisse.
Le parti in comune stanno in `assets/`: `crypto.js` è il motore crittografico, `deck.js` il guscio delle slide, `style.css` lo stile.

```bash
npm install
npm test                          # test del motore (DES, S-DES, RSA, cifrari classici)
node tests/verifica.js            # verifica Playwright: console, scroll, overflow, link
node scripts/genera-dispensa.js   # rigenera la dispensa
php lab-php/01-cesare/test.php    # prova un lab PHP
```

Le specifiche sono in [DESIGN.md](DESIGN.md) e [CONVENZIONI.md](CONVENZIONI.md). Le soluzioni stanno in `docente/`, una cartella esclusa dal repository.
