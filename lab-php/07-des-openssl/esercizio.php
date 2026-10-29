<?php
/**
 * Laboratorio 07 — DES e cifrari a blocchi con OpenSSL
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
 * LIVELLO 1 — completa le funzioni
 *
 * 3DES in modalità CBC. $chiave è di 24 byte, $iv di 8 byte (il blocco del DES).
 * Il cifrato si restituisce in base64, così si può stampare e trasmettere.
 * ------------------------------------------------------------------------- */
function cifra3des(string $testo, string $chiave, string $iv): string
{
    // TODO 1: chiama openssl_encrypt() con l'algoritmo 'des-ede3-cbc', la chiave,
    //         il flag OPENSSL_RAW_DATA e l'IV. Poi converti il risultato in base64.
    return '';
}

function decifra3des(string $base64, string $chiave, string $iv): string
{
    // TODO 2: decodifica il base64 e usa openssl_decrypt() con gli stessi parametri.
    //         Se openssl_decrypt() restituisce false, restituisci la stringa vuota.
    return '';
}

/*
 * DES singolo. Con OpenSSL 3 l'algoritmo 'DES-ECB' può non essere disponibile
 * (provider "legacy"). Trucco: il 3DES con tre chiavi uguali coincide con il DES.
 * $bloccoHex e $chiaveHex sono di 16 cifre esadecimali; il risultato è in esadecimale maiuscolo.
 */
function cifraDesSingolo(string $bloccoHex, string $chiaveHex): string
{
    // TODO 3: converti con hex2bin(); usa 'des-ede-ecb' con la chiave ripetuta due volte ($k . $k),
    //         OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING (così non si aggiunge il padding);
    //         converti il risultato con bin2hex() e strtoupper().
    return '';
}

/* ---------------------------------------------------------------------------
 * LIVELLO 2 — scrivi le funzioni (solo firma e TODO)
 *
 * AES-128-CBC con IV casuale a ogni messaggio. Chiave di 16 byte, IV di 16 byte.
 * ------------------------------------------------------------------------- */

// Restituisce base64( IV . cifrato ): l'IV non è segreto e viaggia davanti al cifrato.
function cifraAesCbc(string $testo, string $chiave): string
{
    // TODO 4: genera l'IV con random_bytes(16), cifra con 'aes-128-cbc' e restituisci base64($iv . $cifrato).
    return '';
}

// L'inversa: separa l'IV (primi 16 byte) e decifra. Restituisce false se i dati non sono validi.
function decifraAesCbc(string $dati, string $chiave): string|false
{
    // TODO 5: decodifica base64 (con la modalità rigorosa), controlla che i byte siano almeno 32,
    //         estrai l'IV con substr() e chiama openssl_decrypt().
    return false;
}

// AES-128 in modalità ECB: nessun IV, stesso blocco in chiaro = stesso blocco cifrato. Byte grezzi.
function cifraAesEcb(string $testo, string $chiave): string
{
    // TODO 6: openssl_encrypt() con 'aes-128-ecb' e OPENSSL_RAW_DATA.
    return '';
}

// Quanti blocchi da $dim byte sono identici a un blocco già incontrato? (str_split() ti aiuta)
function contaBlocchiUguali(string $dati, int $dim = 16): int
{
    // TODO 7: scorri i blocchi, tieni un array dei blocchi già visti e conta i ripetuti.
    return 0;
}

/* ---------------------------------------------------------------------------
 * LIVELLO 3 (facoltativo) — implementa S-DES in PHP
 *
 * Bit come stringhe di '0' e '1'. Le tabelle sono già qui; la numerazione dei bit parte da 1
 * (il bit 1 è $stringa[0]). Segui i passi della scheda e della slide sul S-DES.
 * ------------------------------------------------------------------------- */
function sdesTabelle(): array
{
    return [
        'P10' => [3, 5, 2, 7, 4, 10, 1, 9, 8, 6],
        'P8' => [6, 3, 7, 4, 8, 5, 10, 9],
        'IP' => [2, 6, 3, 1, 4, 8, 5, 7],
        'IP_INV' => [4, 1, 3, 5, 7, 2, 8, 6],
        'EP' => [4, 1, 2, 3, 2, 3, 4, 1],
        'P4' => [2, 4, 3, 1],
        'S0' => [[1, 0, 3, 2], [3, 2, 1, 0], [0, 2, 1, 3], [3, 1, 3, 2]],
        'S1' => [[0, 1, 2, 3], [2, 0, 1, 3], [3, 0, 1, 0], [2, 1, 0, 3]],
    ];
}

// Applica una tabella di permutazione: l'uscita j prende il bit $tabella[j] dell'ingresso.
function sdesPermuta(string $bit, array $tabella): string
{
    // TODO 8: costruisci la stringa di uscita scorrendo la tabella ($bit[$n - 1]).
    return '';
}

// Restituisce ['k1' => 8 bit, 'k2' => 8 bit] a partire dalla chiave di 10 bit.
function sdesChiavi(string $chiave): array
{
    // TODO 9: P10, poi due metà da 5 bit; rotazione a sinistra di 1 (LS-1) e P8 → k1;
    //         altre 2 rotazioni (LS-2) sulle metà già ruotate e P8 → k2.
    return ['k1' => '', 'k2' => ''];
}

function sdesCifra(string $blocco, string $chiave): string
{
    // TODO 10: IP; round 1 con k1 (E/P, XOR, S0/S1, P4, XOR con L); scambio delle metà (SW);
    //          round 2 con k2 (senza scambio dopo); IP⁻¹. Puoi aggiungere funzioni di supporto.
    return '';
}

function sdesDecifra(string $blocco, string $chiave): string
{
    // TODO 11: stesso schema di sdesCifra(), ma usando prima k2 e poi k1.
    return '';
}
