<?php
/**
 * Test del laboratorio 01 — Cesare.
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
    echo '<!DOCTYPE html><html lang="it"><meta charset="utf-8"><title>Test — Lab 01 Cesare</title><body style="background:#fff;color:#111"><pre style="font:15px/1.5 monospace">';
}
if (!is_file($fileDaProvare)) {
    scrivi("File non trovato: $fileDaProvare");
    exit(2);
}
require $fileDaProvare;
scrivi('Laboratorio 01 — Cesare. File provato: ' . basename($fileDaProvare));
/* -------------------------- fine harness comune ---------------------------------------------- */

function esiste(string $nome): bool
{
    if (!function_exists($nome)) {
        scrivi("  Manca la funzione $nome(): scrivila in esercizio.php");
        return false;
    }
    return true;
}

// ---------------------------------------------------------------- Livello 1
livello('Livello 1: cesare()');
if (esiste('cesare')) {
    verifica('maiuscole, chiave 3', 'DWWDFFR', fn() => cesare('ATTACCO', 3));
    verifica('minuscole che tornano all\'inizio (xyz)', 'abc', fn() => cesare('xyz', 3));
    verifica('maiuscole e minuscole miste con punteggiatura', 'Fldr, Prqgr!', fn() => cesare('Ciao, Mondo!', 3));
    verifica('lettere accentate restano invariate', 'Hnyyà è', fn() => cesare('Città è', 5));
    verifica('cifre e spazi invariati', 'Zp 123 Zp', fn() => cesare('Si 123 Si', 7));
    verifica('chiave 26 = nessun cambiamento', 'Abc', fn() => cesare('Abc', 26));
    verifica('chiave maggiore di 25 (29 = 3)', 'Khoor', fn() => cesare('Hello', 29));
    verifica('chiave negativa (-3)', 'Ebiil', fn() => cesare('Hello', -3));
    verifica('Z con chiave 1', 'AAaa', fn() => cesare('ZZzz', 1));
    verifica('testo vuoto', '', fn() => cesare('', 5));
}

// ---------------------------------------------------------------- Livello 2
livello('Livello 2: decifraCesare()');
if (esiste('decifraCesare')) {
    verifica('decifra con chiave 3', 'Ciao, Mondo!', fn() => decifraCesare('Fldr, Prqgr!', 3));
    verifica('decifra con chiave 7', 'Perche non lo prendi? Si', fn() => decifraCesare('Wlyjol uvu sv wylukp? Zp', 7));
    verifica('A con chiave 1 torna indietro fino a Z', 'Z', fn() => decifraCesare('A', 1));
    verifica('chiave negativa (-3)', 'Khoor', fn() => decifraCesare('Hello', -3));
    $andataRitorno = true;
    if (function_exists('cesare')) {
        $m = 'Domani, alle 8:30, verifica di Sistemi e Reti!';
        try {
            for ($k = -30; $k <= 30; $k++) {
                if (decifraCesare(cesare($m, $k), $k) !== $m) {
                    $andataRitorno = false;
                }
            }
        } catch (Throwable $e) {
            $andataRitorno = false;
        }
    }
    verifica('cifra e decifra con tutte le chiavi da -30 a 30', true, fn() => $andataRitorno);
}

// ---------------------------------------------------------------- Livello 3
livello('Livello 3: forzaBruta() e trovaChiave()');
if (esiste('forzaBruta')) {
    verifica('restituisce 25 tentativi', 25, fn() => count(forzaBruta('Khoor Zruog')));
    verifica('le chiavi vanno da 1 a 25', range(1, 25), fn() => array_keys(forzaBruta('Khoor Zruog')));
    verifica('con chiave 3 compare il testo giusto', 'Hello World', fn() => forzaBruta('Khoor Zruog')[3] ?? null);
    verifica('con chiave 1 si sposta di una sola lettera', 'Jgnnq Yqtnf', fn() => forzaBruta('Khoor Zruog')[1] ?? null);
    verifica('con chiave 25', 'Lipps Asvph', fn() => forzaBruta('Khoor Zruog')[25] ?? null);
}
if (esiste('trovaChiave')) {
    verifica('trova la chiave con una parola nota', 3, fn() => trovaChiave('DWWDFFR', 'attacco'));
    verifica('senza distinguere maiuscole e minuscole', 3, fn() => trovaChiave('DWWDFFR', 'ATTACCO'));
    verifica('parola che non compare: null', null, fn() => trovaChiave('Khoor', 'qwerty'));
}

riepilogo();
