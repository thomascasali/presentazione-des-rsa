<?php
/**
 * Test del laboratorio 04 — Trasposizione.
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
    echo '<!DOCTYPE html><html lang="it"><meta charset="utf-8"><title>Test — Lab 04 Trasposizione</title><body style="background:#fff;color:#111"><pre style="font:15px/1.5 monospace">';
}
if (!is_file($fileDaProvare)) {
    scrivi("File non trovato: $fileDaProvare");
    exit(2);
}
require $fileDaProvare;
scrivi('Laboratorio 04 — Trasposizione. File provato: ' . basename($fileDaProvare));
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
livello('Livello 1: ordineColonne() e trasposizione()');
if (esiste('ordineColonne')) {
    verifica('ZEBRA: lettere tutte diverse', [4, 2, 1, 3, 0], fn() => ordineColonne('ZEBRA'));
    verifica('CASA: lettere ripetute, prima la più a sinistra', [1, 3, 0, 2], fn() => ordineColonne('CASA'));
    verifica('LUNA', [3, 0, 2, 1], fn() => ordineColonne('LUNA'));
    verifica('minuscole come maiuscole', [4, 2, 1, 3, 0], fn() => ordineColonne('zebra'));
    verifica('una sola lettera', [0], fn() => ordineColonne('Q'));
}
if (esiste('trasposizione')) {
    verifica('ATTACCOALLALBADOMANI con ZEBRA', 'CLDITABATOLMALANACAO', fn() => trasposizione('ATTACCOALLALBADOMANI', 'ZEBRA'));
    verifica('chiave con lettere ripetute (CASA)', 'TCLAAAALOIACLBMTOADN', fn() => trasposizione('ATTACCOALLALBADOMANI', 'CASA'));
    verifica('riempimento con X (14 lettere, 4 colonne)', 'AALXACLBTOAXTCLA', fn() => trasposizione('ATTACCOALLALBA', 'LUNA'));
    verifica('spazi, punteggiatura e minuscole vengono ripuliti', 'DDIOXVMALOIAMLTEONEXCIOAT', fn() => trasposizione('Ci vediamo domani alle otto', 'Zebra'));
    verifica('chiave più lunga del testo', 'IXXCXAOX', fn() => trasposizione('CIAO', 'PASSWORD'));
    verifica('chiave di una lettera: il testo non cambia', 'ABCDEF', fn() => trasposizione('abc def', 'K'));
    verifica('la chiave ignora gli spazi', 'CLDITABATOLMALANACAO', fn() => trasposizione('ATTACCOALLALBADOMANI', 'ZE BRA'));
    verifica('chiave senza lettere: InvalidArgumentException', true, function () {
        try {
            trasposizione('ciao', '123');
        } catch (InvalidArgumentException $e) {
            return true;
        }
        return false;
    });
}

// ---------------------------------------------------------------- Livello 2
livello('Livello 2: decifraTrasposizione()');
if (esiste('decifraTrasposizione')) {
    verifica('decifra ZEBRA', 'ATTACCOALLALBADOMANI', fn() => decifraTrasposizione('CLDITABATOLMALANACAO', 'ZEBRA'));
    verifica('decifra CASA', 'ATTACCOALLALBADOMANI', fn() => decifraTrasposizione('TCLAAAALOIACLBMTOADN', 'CASA'));
    verifica('le X di riempimento restano in fondo', 'ATTACCOALLALBAXX', fn() => decifraTrasposizione('AALXACLBTOAXTCLA', 'LUNA'));
    verifica('chiave minuscola', 'ATTACCOALLALBADOMANI', fn() => decifraTrasposizione('CLDITABATOLMALANACAO', 'zebra'));
    verifica('lunghezza non multipla della chiave: InvalidArgumentException', true, function () {
        try {
            decifraTrasposizione('ABCDE', 'LUNA');
        } catch (InvalidArgumentException $e) {
            return true;
        }
        return false;
    });
    $andataRitorno = true;
    if (function_exists('trasposizione')) {
        $m = 'DOMANIVERIFICADISISTEMIEEETI';
        try {
            foreach (['A', 'ZEBRA', 'CASA', 'LUNA', 'PASSWORDLUNGA', 'BANANA'] as $k) {
                $dec = decifraTrasposizione(trasposizione($m, $k), $k);
                if (substr($dec, 0, strlen($m)) !== $m || trim(substr($dec, strlen($m)), 'X') !== '') {
                    $andataRitorno = false;
                }
            }
        } catch (Throwable $e) {
            $andataRitorno = false;
        }
    }
    verifica('cifra e decifra con chiavi diverse', true, fn() => $andataRitorno);
}

// ---------------------------------------------------------------- Livello 3
livello('Livello 3: attaccoTrasposizione()');
if (esiste('attaccoTrasposizione')) {
    $c1 = 'IMSNOCAAOEILILXDLZLOEAAATVOTET';
    $c2 = 'AIIEBOUEELAOROTIORLNSNATININRI';
    $c3 = 'ARLCIXPITEAROLAEVERPTIOTTOILDE';
    verifica('parola probabile STAZIONE', ['CIVEDIAMOALLASTAZIONEALLEOTTOX'], fn() => attaccoTrasposizione($c1, 'STAZIONE'));
    verifica('parola in minuscolo', ['LARIUNIONESITIENEINLABORATORIO'], fn() => attaccoTrasposizione($c2, 'laboratorio'));
    verifica('parola PORTATILE (con riempimento X)', ['PORTAILPORTATILEEILCAVODIRETEX'], fn() => attaccoTrasposizione($c3, 'PORTATILE'));
    verifica('parola che non c\'è: elenco vuoto', [], fn() => attaccoTrasposizione($c1, 'QUARANTA'));
    verifica('con maxColonne troppo piccolo: elenco vuoto', [], fn() => attaccoTrasposizione($c1, 'STAZIONE', 5));
}

riepilogo();
