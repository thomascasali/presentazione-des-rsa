<?php
/**
 * Laboratorio 02 — Cesare generalizzato (chiave a serie di numeri)
 *
 * La chiave non è più un numero solo ma una serie, per esempio [3, 1, 4]:
 * la prima lettera si sposta di 3, la seconda di 1, la terza di 4, poi si ricomincia da 3.
 *
 * Questo file contiene SOLO funzioni: niente echo e niente codice fuori dalle funzioni.
 * Il file test.php lo include e prova le funzioni con dei casi noti.
 *
 * Come si lavora:
 *   1. Completa le funzioni seguendo i commenti TODO (la scheda spiega i livelli).
 *   2. Dalla cartella del laboratorio esegui:   php test.php
 *      (con XAMPP: apri test.php dal browser).
 *   3. Quando un livello è tutto OK, passa al successivo.
 *
 * Convenzione (la stessa delle slide): la chiave avanza SOLO quando si cifra una lettera A-Z / a-z.
 * Spazi, cifre, punteggiatura e lettere accentate si copiano e NON consumano la chiave.
 */

declare(strict_types=1);

/* ---------------------------------------------------------------------------
 * LIVELLO 1 — completa la funzione
 *
 * Cifra $testo con la serie di spostamenti $chiave (array di interi).
 *  - Maiuscole restano maiuscole, minuscole restano minuscole.
 *  - I numeri della chiave possono essere negativi oppure maggiori di 25.
 *  - Se $chiave è vuota il testo resta invariato.
 * ------------------------------------------------------------------------- */
function cesareGeneralizzato(string $testo, array $chiave): string
{
    $n = count($chiave);
    if ($n === 0) {
        return $testo;
    }

    // TODO 1: porta ogni numero della chiave nell'intervallo 0..25 (suggerimento: array_map).
    //         Attenzione: in PHP il resto (%) di un numero negativo è negativo!
    $chiave = $chiave;

    $risultato = '';
    $j = 0;                                   // quante lettere sono già state cifrate
    for ($i = 0; $i < strlen($testo); $i++) {
        $c = $testo[$i];

        if ($c >= 'A' && $c <= 'Z') {
            $base = 65;
        } elseif ($c >= 'a' && $c <= 'z') {
            $base = 97;
        } else {
            $risultato .= $c;                 // non è una lettera: copia e la chiave NON avanza
            continue;
        }

        // TODO 2: sposta la lettera $c di $chiave[$j % $n] posti, partendo dalla base $base,
        //         con ord(), % 26 e chr(). Qui sotto c'è la lettera non cifrata.
        $risultato .= $c;

        // TODO 3: fai avanzare l'indice $j della chiave.
    }
    return $risultato;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 2 — scrivi l'inversa (non c'è lo scheletro del corpo)
 *
 * Decifra un testo cifrato con la serie $chiave.
 * Vincolo: usa la funzione cesareGeneralizzato() qui sopra, senza copiarne il codice.
 * ------------------------------------------------------------------------- */
function decifraCesareGeneralizzato(string $testo, array $chiave): string
{
    // TODO 4: scrivi il corpo della funzione.
    return $testo;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 3 — attacco con chiave di lunghezza nota (2 numeri)
 *
 * forzaBruta2($cifrato) prova tutte le chiavi [a, b] con a e b da 0 a 25 (676 coppie)
 * e restituisce un array che ha la chiave scritta "a-b" come indice e il testo
 * decifrato come valore, nell'ordine 0-0, 0-1, ..., 0-25, 1-0, ..., 25-25:
 *     ['0-0' => '...', '0-1' => '...', ..., '25-25' => '...']
 *
 * trovaChiave2($cifrato, $parola) usa forzaBruta2() e restituisce la prima chiave,
 * nella forma [a, b], per cui il testo decifrato contiene $parola (senza distinguere
 * maiuscole e minuscole). Se nessuna chiave va bene restituisce null.
 * ------------------------------------------------------------------------- */
function forzaBruta2(string $cifrato): array
{
    // TODO 5: scrivi il corpo della funzione (due cicli annidati).
    return [];
}

function trovaChiave2(string $cifrato, string $parola): ?array
{
    // TODO 6: scrivi il corpo della funzione (suggerimenti: stripos(), explode('-', ...)).
    return null;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 3 BONUS — frequenze per colonna
 *
 * Se si conosce la lunghezza $n della chiave, le lettere in posizione 0, n, 2n, ...
 * sono state tutte spostate dello stesso numero: ogni "colonna" è un Cesare semplice.
 *
 * colonna($cifrato, $n, $i) restituisce, in maiuscolo, le sole lettere A-Z / a-z del
 * testo che stanno nella colonna $i (la prima lettera del testo è nella colonna 0,
 * la seconda nella 1, ... e dopo la colonna $n - 1 si torna alla 0).
 *     colonna('Ciao, Mondo!', 3, 0)  →  'CON'
 *
 * chiavePerFrequenze($cifrato, $n) restituisce la chiave probabile, un array di $n numeri.
 * Per ogni colonna si prova ogni spostamento s da 0 a 25 e si calcola il punteggio
 *     somma, su tutte le lettere L della colonna, di frequenzeItaliane()[(L - s) mod 26]
 * (L = posizione della lettera, A=0). Lo spostamento con punteggio massimo è quello
 * della colonna; a parità vince il più piccolo.
 * ------------------------------------------------------------------------- */

// Percentuale di ciascuna lettera A..Z in italiano (già scritta, non va modificata).
function frequenzeItaliane(): array
{
    return [11.74, 0.92, 4.50, 3.73, 11.79, 0.95, 1.64, 1.54, 11.28, 0.01, 0.01, 6.51, 2.51,
            6.88, 9.83, 3.05, 0.51, 6.37, 4.98, 5.62, 3.01, 2.10, 0.01, 0.01, 0.01, 0.49];
}

function colonna(string $cifrato, int $n, int $i): string
{
    // TODO 7: scrivi il corpo della funzione.
    return '';
}

function chiavePerFrequenze(string $cifrato, int $n): array
{
    // TODO 8: scrivi il corpo della funzione (usa colonna() e frequenzeItaliane()).
    return [];
}
