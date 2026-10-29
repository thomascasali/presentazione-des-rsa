<?php
/**
 * Test del laboratorio 07 — DES e OpenSSL.
 *
 * Da terminale (dalla cartella del laboratorio):
 *     php test.php                          prova esercizio.php
 *     php test.php percorso/altro-file.php  prova un altro file (es. la soluzione del docente)
 * Con XAMPP: apri questa pagina dal browser (prova sempre esercizio.php).
 *
 * Convenzione comune a tutti i lab: vedi lab-php/README.md.
 */

declare(strict_types=1);

/* ------------------------- inizio harness comune (identico in ogni lab) ------------------------- */
$eCli = PHP_SAPI === 'cli';
$fileDaProvare = ($eCli && isset($argv[1])) ? $argv[1] : __DIR__ . '/esercizio.php';
$conteggio = ['ok' => 0, 'tot' => 0, 'livelli' => []];
$livelloCorrente = '';

function scrivi(string $riga): void
{
    global $eCli;
    echo ($eCli ? $riga : htmlspecialchars($riga, ENT_QUOTES, 'UTF-8')) . "\n";
}
function esporta(mixed $v): string
{
    return json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PARTIAL_OUTPUT_ON_ERROR) ?: var_export($v, true);
}
function livello(string $nome): void
{
    global $livelloCorrente, $conteggio;
    $livelloCorrente = $nome;
    $conteggio['livelli'][$nome] = ['ok' => 0, 'tot' => 0];
    scrivi('');
    scrivi("== $nome");
}
function verifica(string $nome, mixed $atteso, callable $prova): void
{
    global $conteggio, $livelloCorrente;
    $conteggio['tot']++;
    $conteggio['livelli'][$livelloCorrente]['tot']++;
    try {
        $ottenuto = $prova();
    } catch (Throwable $e) {
        scrivi("  ERRORE  $nome");
        scrivi('          la funzione ha generato un errore: ' . $e->getMessage());
        return;
    }
    if ($ottenuto === $atteso) {
        $conteggio['ok']++;
        $conteggio['livelli'][$livelloCorrente]['ok']++;
        scrivi("  OK      $nome");
    } else {
        scrivi("  ERRORE  $nome");
        scrivi('          atteso:   ' . esporta($atteso));
        scrivi('          ottenuto: ' . esporta($ottenuto));
    }
}
function riepilogo(): void
{
    global $conteggio, $eCli;
    scrivi('');
    scrivi('== Riepilogo');
    foreach ($conteggio['livelli'] as $nome => $c) {
        scrivi(sprintf('  %-42s %d / %d', $nome, $c['ok'], $c['tot']));
    }
    scrivi(sprintf('  %-42s %d / %d', 'TOTALE', $conteggio['ok'], $conteggio['tot']));
    scrivi($conteggio['ok'] === $conteggio['tot'] ? '  Tutto a posto, ottimo lavoro!' : '  Ci sono ancora dei test da sistemare.');
    if ($eCli) {
        exit($conteggio['ok'] === $conteggio['tot'] ? 0 : 1);
    }
}

if (!$eCli) {
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="it"><meta charset="utf-8"><title>Test — Lab 07 DES e OpenSSL</title><body style="background:#fff;color:#111"><pre style="font:15px/1.5 monospace">';
}
if (!is_file($fileDaProvare)) {
    scrivi("File non trovato: $fileDaProvare");
    exit(2);
}
require $fileDaProvare;
scrivi('Laboratorio 07 — DES e OpenSSL. File provato: ' . basename($fileDaProvare));
/* -------------------------- fine harness comune ---------------------------------------------- */


function esiste(string $nome): bool
{
    if (!function_exists($nome)) {
        scrivi("  Manca la funzione $nome(): scrivila in esercizio.php");
        return false;
    }
    return true;
}

// Chiavi e IV fissi, solo per i test (nei programmi veri la chiave è segreta e l'IV è casuale).
$chiave3des = '0123456789abcdef01234567';   // 24 byte
$iv3des = 'abcdefgh';                       // 8 byte
$chiaveAes = '0123456789abcdef';            // 16 byte

// ---------------------------------------------------------------- Livello 1
livello('Livello 1: 3DES con openssl_encrypt()');
if (esiste('cifra3des')) {
    verifica('cifra «Messaggio segreto» in 3DES-CBC (base64)', 'Kh3JLkSDF60XOrgEf8QUtM1UNFPY6CEQ', fn() => cifra3des('Messaggio segreto', $chiave3des, $iv3des));
    verifica('29 byte di testo diventano 32 (padding PKCS#7)', 32, fn() => strlen(base64_decode(cifra3des('Questo testo supera otto byte', $chiave3des, $iv3des))));
}
if (esiste('decifra3des')) {
    verifica('decifra il vettore di prova', 'Messaggio segreto', fn() => decifra3des('Kh3JLkSDF60XOrgEf8QUtM1UNFPY6CEQ', $chiave3des, $iv3des));
    if (function_exists('cifra3des')) {
        verifica('cifra e decifra tornano al testo', 'Ciao, è tutto a posto 123', fn() => decifra3des(cifra3des('Ciao, è tutto a posto 123', $chiave3des, $iv3des), $chiave3des, $iv3des));
    }
}
if (esiste('cifraDesSingolo')) {
    verifica('vettore ufficiale del DES', '85E813540F0AB405', fn() => cifraDesSingolo('0123456789ABCDEF', '133457799BBCDFF1'));
}

// ---------------------------------------------------------------- Livello 2
livello('Livello 2: AES-128, IV, ECB contro CBC');
if (esiste('cifraAesEcb')) {
    verifica('ECB: 16 byte di testo + 16 di padding = 32 byte', 32, fn() => strlen(cifraAesEcb('0123456789abcdef', $chiaveAes)));
}
if (esiste('contaBlocchiUguali')) {
    verifica('4 blocchi uguali: 3 sono ripetizioni', 3, fn() => contaBlocchiUguali(str_repeat('A', 64), 16));
    verifica('blocchi tutti diversi: 0', 0, fn() => contaBlocchiUguali('0123456789abcdefFEDCBA9876543210', 16));
    verifica('blocchi da 8 byte', 1, fn() => contaBlocchiUguali('ABCDEFGHABCDEFGHxyzxyzxy', 8));
}
if (esiste('cifraAesEcb') && esiste('contaBlocchiUguali')) {
    verifica('ECB su blocchi ripetuti lascia blocchi uguali', true, fn() => contaBlocchiUguali(cifraAesEcb(str_repeat('A', 64), $chiaveAes), 16) >= 3);
}
if (esiste('cifraAesCbc')) {
    verifica('CBC: l\'output è base64 di IV (16) + cifrato (48 per 33 byte)', 64, fn() => strlen(base64_decode(cifraAesCbc(str_repeat('A', 33), $chiaveAes))));
    verifica('CBC: due cifrature dello stesso testo sono diverse (IV casuale)', true, fn() => cifraAesCbc('stesso testo', $chiaveAes) !== cifraAesCbc('stesso testo', $chiaveAes));
    if (function_exists('contaBlocchiUguali')) {
        verifica('CBC su blocchi ripetuti: nessun blocco uguale', 0, fn() => contaBlocchiUguali(substr(base64_decode(cifraAesCbc(str_repeat('A', 64), $chiaveAes)), 16), 16));
    }
}
if (esiste('decifraAesCbc')) {
    verifica('decifra il vettore di prova (IV 1234567890abcdef)', 'Ciao classe 5A', fn() => decifraAesCbc('MTIzNDU2Nzg5MGFiY2RlZuDOCJMkMohaeAxr7dlWdTw=', $chiaveAes));
    verifica('base64 non valido: false', false, fn() => decifraAesCbc('@@@non-base64@@@', $chiaveAes));
    verifica('dati troppo corti: false', false, fn() => decifraAesCbc(base64_encode('corto'), $chiaveAes));
    if (function_exists('cifraAesCbc')) {
        verifica('cifra e decifra tornano al testo', 'Messaggio di prova per AES', fn() => decifraAesCbc(cifraAesCbc('Messaggio di prova per AES', $chiaveAes), $chiaveAes));
    }
}

// ---------------------------------------------------------------- Livello 3 (facoltativo)
livello('Livello 3: S-DES in PHP');
// Vettori calcolati con assets/crypto.js: [chiave, blocco, cifrato]
$vettoriSdes = [
    ['1010000010', '01110010', '01110111'], ['1010000010', '00000000', '11001110'], ['1010000010', '11111111', '00101010'],
    ['0000000000', '01110010', '00101000'], ['0000000000', '00000000', '11110000'], ['0000000000', '11111111', '00010100'],
    ['1111111111', '01110010', '10011011'], ['1111111111', '00000000', '11101011'], ['1111111111', '11111111', '00001111'],
    ['0110101101', '01110010', '11111000'], ['0110101101', '10010110', '11100111'], ['0110101101', '01011010', '00101010'],
];
if (esiste('sdesChiavi')) {
    verifica('sottochiavi di 1010000010', ['k1' => '10100100', 'k2' => '01000011'], fn() => sdesChiavi('1010000010'));
    verifica('sottochiavi di 0110101101', ['k1' => '01001110', 'k2' => '11011100'], fn() => sdesChiavi('0110101101'));
    verifica('sottochiavi di 1111111111', ['k1' => '11111111', 'k2' => '11111111'], fn() => sdesChiavi('1111111111'));
}
if (esiste('sdesCifra')) {
    foreach ($vettoriSdes as [$k, $b, $c]) {
        verifica("cifra $b con chiave $k", $c, fn() => sdesCifra($b, $k));
    }
}
if (esiste('sdesDecifra')) {
    foreach ([['1010000010', '01110111', '01110010'], ['0000000000', '11110000', '00000000'], ['0110101101', '11100111', '10010110']] as [$k, $c, $b]) {
        verifica("decifra $c con chiave $k", $b, fn() => sdesDecifra($c, $k));
    }
}

riepilogo();
