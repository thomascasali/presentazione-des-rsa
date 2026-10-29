<?php
/**
 * Laboratorio 06 — RSA giocattolo
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
 * ATTENZIONE: si usano gli interi nativi di PHP (64 bit). Il prodotto di due numeri
 * minori del modulo deve stare in un int: va bene per moduli fino a circa 3 miliardi.
 * Con chiavi vere servono numeri molto più grandi (estensioni GMP o bcmath).
 */

declare(strict_types=1);

/* ---------------------------------------------------------------------------
 * LIVELLO 1 — completa le funzioni
 * ------------------------------------------------------------------------- */

/**
 * Massimo comun divisore con l'algoritmo di Euclide.
 * mcd(3120, 17) = 1;  mcd(252, 105) = 21;  mcd(0, 5) = 5.
 */
function mcd(int $a, int $b): int
{
    // TODO 1: finché $b è diverso da 0, sostituisci ($a, $b) con ($b, $a % $b).
    //         Alla fine il risultato è $a.
    return 0;
}

/**
 * Calcola base^esp mod mod con square-and-multiply (mai la potenza completa!).
 * potenzaModulare(65, 17, 3233) = 2790.
 * Si scorrono i bit dell'esponente dal meno significativo: se il bit è 1 si moltiplica
 * il risultato per la base; a ogni giro si eleva la base al quadrato. Sempre % $mod.
 */
function potenzaModulare(int $base, int $esp, int $mod): int
{
    $risultato = 1;
    $base = $base % $mod;
    // TODO 2: while ($esp > 0) { ... }
    //         - se ($esp & 1) moltiplica $risultato per $base (e riduci con % $mod)
    //         - eleva al quadrato $base (e riduci con % $mod)
    //         - scorri l'esponente a destra: $esp >>= 1
    return $risultato;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 2 — scrivi le funzioni (non c'è lo scheletro del corpo)
 * ------------------------------------------------------------------------- */

/**
 * Euclide esteso: restituisce [g, x, y] con g = mcd($a, $b) e $a * x + $b * y = g.
 * Esempio: euclideEsteso(3120, 17) restituisce g = 1 e due interi x, y (anche negativi)
 * tali che 3120 * x + 17 * y = 1.
 */
function euclideEsteso(int $a, int $b): array
{
    // TODO 3: tieni traccia dei resti (r0, r1) e dei coefficienti (x0, x1) e (y0, y1);
    //         a ogni passo q = intdiv(r0, r1) e ogni coppia si aggiorna come (r1, r0 - q * r1).
    return [0, 0, 0];
}

/**
 * Inverso moltiplicativo di $a modulo $m: il numero x tra 0 e $m-1 con ($a * x) % $m == 1.
 * Se non esiste (mcd diverso da 1) restituisce null. $a può essere negativo.
 * inversoModulare(17, 3120) = 2753;  inversoModulare(4, 12) = null.
 */
function inversoModulare(int $a, int $m): ?int
{
    // TODO 4: usa euclideEsteso() e riporta il coefficiente nell'intervallo 0..$m-1
    //         (attenzione ai numeri negativi: ((x % m) + m) % m).
    return null;
}

/**
 * Genera le chiavi RSA da due primi $p e $q e da un esponente pubblico $e.
 * Restituisce ['n' => ..., 'phi' => ..., 'e' => ..., 'd' => ...]
 * oppure null se $e non è coprimo con phi (non esiste l'inverso).
 * generaChiavi(61, 53, 17) = ['n' => 3233, 'phi' => 3120, 'e' => 17, 'd' => 2753].
 */
function generaChiavi(int $p, int $q, int $e): ?array
{
    // TODO 5: n = p * q;  phi = (p - 1) * (q - 1);  d = inversoModulare(e, phi).
    return null;
}

/**
 * Cifra il numero $m (minore di $n) con la chiave pubblica ($e, $n):  c = m^e mod n.
 */
function cifra(int $m, int $e, int $n): int
{
    // TODO 6: usa potenzaModulare().
    return 0;
}

/**
 * Decifra $c con la chiave privata ($d, $n):  m = c^d mod n.
 * (La firma è la stessa operazione: si "decifra" il messaggio con la chiave privata.)
 */
function decifra(int $c, int $d, int $n): int
{
    // TODO 7: usa potenzaModulare().
    return 0;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 3 — scrivi l'attacco per fattorizzazione
 *
 * fattorizza($n) restituisce [p, q] con p <= q e p * q == $n (p è il più piccolo
 * divisore maggiore di 1). Se $n è primo (o minore di 4) restituisce [].
 *
 * attaccoRSA($n, $e) simula l'attaccante che conosce solo la chiave pubblica:
 * fattorizza $n, calcola phi e restituisce l'esponente privato d.
 * Se $n non si può fattorizzare in due fattori restituisce null.
 * ------------------------------------------------------------------------- */
function fattorizza(int $n): array
{
    // TODO 8: prova i divisori da 2 fino a quando $p * $p <= $n.
    return [];
}

function attaccoRSA(int $n, int $e): ?int
{
    // TODO 9: usa fattorizza() e inversoModulare().
    return null;
}
