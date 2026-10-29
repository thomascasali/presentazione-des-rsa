<?php
/**
 * Laboratorio 01 — Il cifrario di Cesare
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
 * Cifra $testo spostando ogni lettera di $k posti nell'alfabeto.
 *  - Maiuscole restano maiuscole, minuscole restano minuscole.
 *  - Tutto ciò che non è una lettera A-Z / a-z (spazi, cifre, punteggiatura,
 *    lettere accentate) resta invariato.
 *  - $k può essere negativo oppure maggiore di 25.
 * ------------------------------------------------------------------------- */
function cesare(string $testo, int $k): string
{
    // TODO 1: porta $k nell'intervallo 0..25.
    //         Attenzione: in PHP il resto (%) di un numero negativo è negativo!
    $k = $k;

    $risultato = '';
    for ($i = 0; $i < strlen($testo); $i++) {
        $c = $testo[$i];

        if ($c >= 'A' && $c <= 'Z') {
            // TODO 2: cifra la lettera maiuscola con ord(), % 26 e chr().
            //         'A' ha codice 65.
            $risultato .= $c;
        } elseif ($c >= 'a' && $c <= 'z') {
            // TODO 3: stessa cosa per le minuscole ('a' ha codice 97).
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
 * Decifra un testo cifrato con la chiave $k.
 * Vincolo: usa la funzione cesare() qui sopra, senza copiarne il codice.
 * ------------------------------------------------------------------------- */
function decifraCesare(string $testo, int $k): string
{
    // TODO 4: scrivi il corpo della funzione.
    return $testo;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 3 — scrivi l'attacco a forza bruta
 *
 * forzaBruta($cifrato) prova tutte le chiavi da 1 a 25 e restituisce un array
 * che ha la chiave come indice e il testo decifrato come valore:
 *     [1 => '...', 2 => '...', ..., 25 => '...']
 *
 * trovaChiave($cifrato, $parola) usa forzaBruta() per trovare la chiave che
 * produce un testo contenente $parola (senza distinguere maiuscole e
 * minuscole). Se nessuna chiave va bene restituisce null.
 * ------------------------------------------------------------------------- */
function forzaBruta(string $cifrato): array
{
    // TODO 5: scrivi il corpo della funzione.
    return [];
}

function trovaChiave(string $cifrato, string $parola): ?int
{
    // TODO 6: scrivi il corpo della funzione (suggerimento: stripos()).
    return null;
}
