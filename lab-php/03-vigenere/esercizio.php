<?php
/**
 * Laboratorio 03 — Il cifrario di Vigenère
 *
 * Questo file contiene SOLO funzioni: niente echo e niente codice fuori dalle funzioni.
 * Il file test.php lo include e prova le funzioni con dei casi noti.
 *
 * Come si lavora:
 *   1. Completa le funzioni seguendo i commenti TODO (la scheda spiega i tre livelli).
 *   2. Dalla cartella del laboratorio esegui:   php test.php
 *      (con XAMPP: apri test.php dal browser).
 *   3. Quando un livello è tutto OK, passa al successivo.
 */

declare(strict_types=1);

/* ---------------------------------------------------------------------------
 * LIVELLO 1 — completa la funzione
 *
 * Cifra $testo con la parola chiave $chiave.
 *  - Ogni lettera del testo si sposta di quanto vale la lettera corrispondente
 *    della chiave (A = 0, B = 1, ... Z = 25). La chiave si ripete.
 *  - La chiave avanza SOLO quando si cifra una lettera: spazi, cifre, punteggiatura
 *    e lettere accentate si copiano senza consumare lettere della chiave.
 *  - Maiuscole restano maiuscole, minuscole restano minuscole.
 *  - Dalla chiave si ignorano i caratteri che non sono lettere A-Z / a-z; le
 *    minuscole valgono come le maiuscole.
 *  - Se la chiave non contiene nemmeno una lettera, lancia
 *    InvalidArgumentException.
 * ------------------------------------------------------------------------- */
function vigenere(string $testo, string $chiave): string
{
    // TODO 1: ripulisci la chiave (solo lettere, maiuscole) e controlla che non sia vuota.
    $chiave = $chiave;
    $lunghezza = 1;

    $risultato = '';
    $j = 0;                                   // quante lettere sono state cifrate finora
    for ($i = 0; $i < strlen($testo); $i++) {
        $c = $testo[$i];

        if (ctype_alpha($c)) {
            // TODO 2: calcola la base (65 se maiuscola, 97 se minuscola), lo spostamento
            //         della lettera $j % $lunghezza della chiave, e cifra con ord(), % 26 e chr().
            //         Non dimenticare di far avanzare $j.
            $risultato .= $c;
        } else {
            // Spazi, numeri, punteggiatura: si copiano senza cambiarli.
            $risultato .= $c;
        }
    }
    return $risultato;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 2 — scrivi l'inversa (non c'è lo scheletro del corpo)
 *
 * Decifra un testo cifrato con la parola chiave $chiave.
 * Vincolo: usa la funzione vigenere() qui sopra, senza copiarne il codice.
 * Suggerimento: decifrare con lo spostamento s equivale a cifrare con lo
 * spostamento (26 - s) % 26.
 * ------------------------------------------------------------------------- */
function decifraVigenere(string $testo, string $chiave): string
{
    // TODO 3: scrivi il corpo della funzione.
    return $testo;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 3 — scrivi l'attacco
 *
 * Funzioni già scritte, che ti servono:
 *   frequenzeItaliane()      percentuali delle lettere in italiano, indice 0 = A ... 25 = Z
 *   punteggioItaliano($t)    quanto un testo NON assomiglia all'italiano (più basso = meglio)
 * ------------------------------------------------------------------------- */
function frequenzeItaliane(): array
{
    return [11.74, 0.92, 4.50, 3.73, 11.79, 0.95, 1.64, 1.54, 11.28, 0.01, 0.01, 6.51, 2.51,
            6.88, 9.83, 3.05, 0.51, 6.37, 4.98, 5.62, 3.01, 2.10, 0.01, 0.01, 0.01, 0.49];
}

function punteggioItaliano(string $testo): float
{
    $lettere = preg_replace('/[^A-Z]/', '', strtoupper($testo));
    $totale = strlen($lettere);
    if ($totale === 0) {
        return INF;
    }
    $attese = frequenzeItaliane();
    $punteggio = 0.0;
    for ($i = 0; $i < 26; $i++) {
        $atteso = $attese[$i] * $totale / 100;
        $trovate = substr_count($lettere, chr(65 + $i));
        $punteggio += ($trovate - $atteso) ** 2 / $atteso;
    }
    return $punteggio;
}

/**
 * indiceCoincidenza($testo): probabilità che due lettere prese a caso siano uguali.
 *   IC = somma di n_i * (n_i - 1)  /  (N * (N - 1))
 * dove n_i è il numero di volte che compare la lettera i e N il totale delle lettere.
 * Si contano solo le lettere A-Z / a-z (senza distinguere maiuscole e minuscole).
 * Con meno di due lettere restituisce 0.0.
 */
function indiceCoincidenza(string $testo): float
{
    // TODO 4: scrivi il corpo della funzione.
    return 0.0;
}

/**
 * stimaLunghezzaChiave($cifrato, $max): per n = 1, 2, ... $max divide le lettere del cifrato
 * in n colonne (la colonna j contiene le lettere in posizione j, j+n, j+2n, ...), calcola
 * la media degli indici di coincidenza delle colonne e restituisce la PRIMA n per cui la
 * media è almeno 0.062. Se nessuna n va bene restituisce 0.
 */
function stimaLunghezzaChiave(string $cifrato, int $max = 10): int
{
    // TODO 5: scrivi il corpo della funzione.
    return 0;
}

/**
 * trovaChiaveVigenere($cifrato, $lunghezza): per ogni colonna cerca lo spostamento (0..25)
 * che, applicato all'indietro, dà il punteggioItaliano() più basso. Restituisce la chiave
 * in maiuscolo (A = 0 ... Z = 25). Suggerimento: puoi riusare decifraVigenere() con una
 * chiave di una sola lettera.
 */
function trovaChiaveVigenere(string $cifrato, int $lunghezza): string
{
    // TODO 6: scrivi il corpo della funzione.
    return '';
}
