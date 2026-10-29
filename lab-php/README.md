# Laboratori PHP — convenzioni comuni

Valgono per tutti i lab (`lab-php/NN-nome/`). Chi crea un nuovo lab le deve rispettare alla lettera.
PHP 8.x, da terminale (`php`) o con XAMPP. Commenti e messaggi in italiano.

## Struttura di una cartella

```
lab-php/NN-nome/
  scheda.html      scheda stampabile, 3 livelli (usa ../../assets/print.css)
  esercizio.php    file dello studente: SOLO funzioni, scheletro con TODO numerati
  test.php         include il file da provare e verifica le funzioni con vettori attesi
docente/lab-php/NN-nome/
  soluzione.php    soluzione completa (privata, mai pubblicata); stesse funzioni di esercizio.php
```

## Regole per `esercizio.php` e `soluzione.php`

- Iniziano con `<?php` e `declare(strict_types=1);`; contengono solo definizioni di funzioni
  (niente `echo`, niente codice fuori dalle funzioni): così `test.php` può includerli senza effetti.
- I nomi e le firme delle funzioni sono fissati dalla scheda e sono identici in scheletro e soluzione.
- Lo scheletro deve essere sintatticamente valido e restituire un valore neutro del tipo giusto
  (stringa invariata, `[]`, `null`): i test falliscono con un messaggio chiaro, senza errori fatali.
- Livello 1: completare una funzione (TODO nel corpo). Livello 2: scrivere l'inversa o una variante
  (solo firma e TODO). Livello 3: scrivere l'attacco (forza bruta, frequenze, fattorizzazione...).

## Come `test.php` carica il codice

```php
$eCli = PHP_SAPI === 'cli';
$fileDaProvare = ($eCli && isset($argv[1])) ? $argv[1] : __DIR__ . '/esercizio.php';
require $fileDaProvare;
```

- Senza argomenti prova `esercizio.php` (lo studente esegue `php test.php`, oppure apre `test.php` in XAMPP).
- Con un argomento prova un altro file: il docente verifica la soluzione con
  `cd lab-php/NN-nome && php test.php ../../docente/lab-php/NN-nome/soluzione.php`.
- Da browser non si accetta nessun parametro: prova sempre `esercizio.php`.
- Codice di uscita CLI: `0` se tutti i test passano, `1` altrimenti, `2` se il file non esiste.

## Harness comune (copiare da `lab-php/01-cesare/test.php`)

Il blocco tra `inizio harness comune` e `fine harness comune` è identico in ogni lab e fornisce:

| Funzione | Uso |
|---|---|
| `livello('Livello 1: cesare()')` | apre un gruppo di test (compare nel riepilogo) |
| `verifica('descrizione', $atteso, fn() => funzione(...))` | confronto con `===`; le eccezioni diventano ERRORE leggibile |
| `esiste('nomeFunzione')` | falso (e messaggio) se la funzione non è stata scritta |
| `riepilogo()` | conteggio per livello, totale, codice di uscita |

Schema di un test.php: harness comune, poi per ogni livello `livello(...)`, `if (esiste('f')) { verifica(...); ... }`,
e in fondo `riepilogo();`. I valori attesi si calcolano con `assets/crypto.js` (mai a mano) oppure
sono vettori noti; i test sono deterministici (niente `rand()` nei casi verificati).

Output: righe `OK` / `ERRORE` con atteso e ottenuto; da browser è racchiuso in `<pre>` ed escapato.

## Scheda stampabile

`scheda.html` usa `../../assets/print.css` e le classi `.sheet`, `.livello`, `.nota`, `.righe`, `.vuoto`.
Deve contenere: obiettivo, come eseguire i test (terminale e XAMPP), i tre livelli con lo scheletro
nelle parti utili, ma **nessuna soluzione**. Il codice mostrato nelle slide non deve anticipare i livelli 2 e 3.

## Verifica prima di consegnare un lab

```
cd lab-php/NN-nome
php test.php ../../docente/lab-php/NN-nome/soluzione.php   # deve dare 0 errori, exit code 0
php test.php                                               # lo scheletro deve fallire senza errori fatali
```
