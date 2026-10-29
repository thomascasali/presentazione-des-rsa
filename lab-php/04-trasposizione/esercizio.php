<?php
/**
 * Laboratorio 04 — La trasposizione a colonne
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
 * Convenzioni (le stesse delle slide):
 *   - il testo viene ridotto alle sole lettere A-Z maiuscole (spazi, punteggiatura,
 *     cifre e lettere accentate vengono scartati);
 *   - il testo si scrive nella griglia per righe, largo quanto la chiave;
 *   - se l'ultima riga è incompleta si aggiunge la lettera X fino a riempirla;
 *   - le colonne si leggono nell'ordine alfabetico delle lettere della chiave;
 *     a parità di lettera, prima la colonna più a sinistra.
 */

declare(strict_types=1);

/* ---------------------------------------------------------------------------
 * LIVELLO 1 — completa le funzioni
 *
 * ordineColonne($chiave) restituisce le posizioni delle colonne (da 0) nell'ordine in
 * cui vanno lette. La chiave può essere in minuscolo: portala in maiuscolo.
 *   ordineColonne('ZEBRA')  ->  [4, 2, 1, 3, 0]
 *   ordineColonne('CASA')   ->  [1, 3, 0, 2]
 *
 * trasposizione($testo, $chiave) cifra il testo.
 * Se la chiave non contiene lettere A-Z / a-z, lancia InvalidArgumentException.
 * ------------------------------------------------------------------------- */
function ordineColonne(string $chiave): array
{
    // TODO 1: restituisci le posizioni 0..n-1 ordinate per lettera della chiave
    //         (a parità di lettera, per posizione). Suggerimento: usort() oppure
    //         array_multisort().
    return [];
}

function trasposizione(string $testo, string $chiave): string
{
    // TODO 2: ripulisci chiave e testo (solo A-Z, maiuscole) e controlla che la chiave non sia vuota.
    $chiave = $chiave;
    $testo = $testo;
    $n = 1;

    // TODO 3: aggiungi X in fondo finché la lunghezza del testo non è un multiplo di $n.

    $righe = intdiv(strlen($testo), $n);
    $cifrato = '';
    // TODO 4: per ogni colonna, nell'ordine di ordineColonne($chiave), accoda le sue
    //         lettere dall'alto in basso. La lettera in riga $r e colonna $col sta in
    //         posizione $r * $n + $col del testo.
    return $cifrato;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 2 — scrivi l'inversa (non c'è lo scheletro del corpo)
 *
 * decifraTrasposizione($cifrato, $chiave) rimette in ordine il testo cifrato con
 * trasposizione(). Restituisce il testo con le eventuali X di riempimento ancora in fondo.
 *  - Il cifrato (ridotto alle lettere A-Z maiuscole) deve avere lunghezza multipla di quella
 *    della chiave: altrimenti lancia InvalidArgumentException.
 *  - Ripassa la slide sulla decifratura: righe = lunghezza / colonne; il cifrato si divide in
 *    blocchi da "righe" lettere; il blocco p va nella colonna ordineColonne($chiave)[p].
 * ------------------------------------------------------------------------- */
function decifraTrasposizione(string $cifrato, string $chiave): string
{
    // TODO 5: scrivi il corpo della funzione.
    return $cifrato;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 3 — scrivi l'attacco
 *
 * permutazioni($v) è già scritta: restituisce tutti i riordinamenti di un array.
 * Ogni riordinamento di [0, 1, ..., n-1] è un possibile ordine di lettura delle colonne.
 *
 * attaccoTrasposizione($cifrato, $parola, $maxColonne = 7) prova tutte le larghezze n da 2 a
 * $maxColonne che dividono la lunghezza del cifrato e, per ciascuna, tutti gli ordini delle
 * colonne. Restituisce l'elenco dei testi in chiaro (maiuscole, con le X finali) che
 * contengono $parola (senza distinguere maiuscole e minuscole), senza doppioni e in ordine
 * alfabetico (sort()). Se nessun testo contiene la parola restituisce [].
 * ------------------------------------------------------------------------- */
function permutazioni(array $v): array
{
    if (count($v) <= 1) {
        return [$v];
    }
    $risultato = [];
    foreach ($v as $i => $primo) {
        $resto = $v;
        unset($resto[$i]);
        foreach (permutazioni(array_values($resto)) as $p) {
            $risultato[] = array_merge([$primo], $p);
        }
    }
    return $risultato;
}

function attaccoTrasposizione(string $cifrato, string $parola, int $maxColonne = 7): array
{
    // TODO 6: scrivi il corpo della funzione.
    return [];
}
