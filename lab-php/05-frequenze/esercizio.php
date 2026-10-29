<?php
/**
 * Laboratorio 05 — Analisi delle frequenze
 *
 * Questo file contiene SOLO funzioni: niente echo e niente codice fuori dalle funzioni.
 * Il file test.php lo include e prova le funzioni con dei casi noti.
 *
 * Come si lavora:
 *   1. Completa le funzioni seguendo i commenti TODO (la scheda spiega i tre livelli).
 *   2. Dalla cartella del laboratorio esegui:   php test.php
 *      (con XAMPP: apri test.php dal browser).
 *   3. Quando un livello è tutto OK, passa al successivo.
 *
 * Convenzione: si contano solo le lettere A-Z / a-z (maiuscole e minuscole insieme).
 * Tutto il resto (spazi, cifre, punteggiatura, lettere accentate) viene ignorato.
 */

declare(strict_types=1);

/* ---------------------------------------------------------------------------
 * LIVELLO 1 — completa le funzioni
 *
 * contaLettere($testo) restituisce un array con 26 elementi, una chiave per lettera
 * maiuscola, e come valore quante volte compare:
 *     ['A' => 3, 'B' => 0, ..., 'Z' => 1]
 *
 * percentuali($conteggi) trasforma i conteggi in percentuali sul totale delle lettere
 * (somma dei conteggi). Se il totale è 0 restituisce tutte le percentuali a 0.0.
 * ------------------------------------------------------------------------- */
function contaLettere(string $testo): array
{
    $conteggi = [];
    foreach (range('A', 'Z') as $lettera) {
        $conteggi[$lettera] = 0;
    }

    // TODO 1: conta le lettere del testo. Suggerimento: strtoupper(), poi un ciclo
    //         oppure count_chars($testo, 1), che restituisce [codice ASCII => volte].
    return $conteggi;
}

function percentuali(array $conteggi): array
{
    // TODO 2: dividi ogni conteggio per il totale e moltiplica per 100.
    return $conteggi;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 2 — scrivi una variante: l'istogramma testuale
 *
 * istogramma($conteggi, $larghezza = 20) disegna un istogramma con il carattere #.
 *  - una riga per ogni elemento con conteggio maggiore di 0, nell'ordine dell'array,
 *    nel formato "A ####" (lettera, uno spazio, le barre);
 *  - la lettera più frequente ha $larghezza barre; le altre sono in proporzione,
 *    arrotondate con round() all'intero più vicino, ma sempre almeno 1;
 *  - le righe sono separate da "\n" (nessun "\n" finale). Nessuna lettera: stringa vuota.
 * Esempio:  istogramma(['A' => 4, 'B' => 2, 'C' => 0], 8)  restituisce
 *     "A ########\nB ####"
 * ------------------------------------------------------------------------- */
function istogramma(array $conteggi, int $larghezza = 20): string
{
    // TODO 3: scrivi il corpo della funzione.
    return '';
}

/* ---------------------------------------------------------------------------
 * LIVELLO 3 — scrivi l'attacco: rompere Cesare con le frequenze
 *
 * Funzioni già scritte, che ti servono:
 *   frequenzeItaliane()   percentuali delle lettere in italiano, indice 0 = A ... 25 = Z
 *   decifraCesare($t, $k) decifra con il cifrario di Cesare (lettere A-Z / a-z)
 *
 * chiQuadro($testo) misura quanto un testo NON assomiglia all'italiano:
 *     somma su A..Z di (trovate - attese)^2 / attese
 * dove "attese" = percentuale italiana della lettera x numero totale di lettere / 100.
 * Più è basso, più il testo è simile all'italiano. Senza lettere restituisce INF.
 *
 * rompiCesare($cifrato) prova le chiavi da 0 a 25, sceglie quella con il chiQuadro più
 * basso della decifratura (a parità, la chiave più piccola) e restituisce
 *     ['chiave' => int, 'testo' => string]
 * ------------------------------------------------------------------------- */
function frequenzeItaliane(): array
{
    return [11.74, 0.92, 4.50, 3.73, 11.79, 0.95, 1.64, 1.54, 11.28, 0.01, 0.01, 6.51, 2.51,
            6.88, 9.83, 3.05, 0.51, 6.37, 4.98, 5.62, 3.01, 2.10, 0.01, 0.01, 0.01, 0.49];
}

function decifraCesare(string $testo, int $k): string
{
    $k = (26 - (($k % 26) + 26) % 26) % 26;
    $risultato = '';
    for ($i = 0; $i < strlen($testo); $i++) {
        $c = $testo[$i];
        if ($c >= 'A' && $c <= 'Z') {
            $risultato .= chr((ord($c) - 65 + $k) % 26 + 65);
        } elseif ($c >= 'a' && $c <= 'z') {
            $risultato .= chr((ord($c) - 97 + $k) % 26 + 97);
        } else {
            $risultato .= $c;
        }
    }
    return $risultato;
}

function chiQuadro(string $testo): float
{
    // TODO 4: scrivi il corpo della funzione (puoi usare contaLettere() e frequenzeItaliane()).
    return 0.0;
}

function rompiCesare(string $cifrato): array
{
    // TODO 5: scrivi il corpo della funzione.
    return ['chiave' => 0, 'testo' => $cifrato];
}
