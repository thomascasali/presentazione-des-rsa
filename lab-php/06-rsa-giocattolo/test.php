<?php
/**
 * Test del laboratorio 06 — RSA giocattolo.
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
    echo '<!DOCTYPE html><html lang="it"><meta charset="utf-8"><title>Test — Lab 06 RSA giocattolo</title><body style="background:#fff;color:#111"><pre style="font:15px/1.5 monospace">';
}
if (!is_file($fileDaProvare)) {
    scrivi("File non trovato: $fileDaProvare");
    exit(2);
}
require $fileDaProvare;
scrivi('Laboratorio 06 — RSA giocattolo. File provato: ' . basename($fileDaProvare));
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
livello('Livello 1: mcd() e potenzaModulare()');
if (esiste('mcd')) {
    verifica('mcd(3120, 17): numeri coprimi', 1, fn() => mcd(3120, 17));
    verifica('mcd(252, 105) = 21', 21, fn() => mcd(252, 105));
    verifica('mcd(1071, 462) = 21', 21, fn() => mcd(1071, 462));
    verifica('mcd è simmetrico', 21, fn() => mcd(105, 252));
    verifica('mcd(0, 5) = 5', 5, fn() => mcd(0, 5));
    verifica('mcd(12, 12) = 12', 12, fn() => mcd(12, 12));
}
if (esiste('potenzaModulare')) {
    verifica('65^17 mod 3233 = 2790 (cifratura dell\'esempio)', 2790, fn() => potenzaModulare(65, 17, 3233));
    verifica('2790^2753 mod 3233 = 65 (decifratura)', 65, fn() => potenzaModulare(2790, 2753, 3233));
    verifica('2^10 mod 1000 = 24', 24, fn() => potenzaModulare(2, 10, 1000));
    verifica('esponente 0 dà 1', 1, fn() => potenzaModulare(5, 0, 13));
    verifica('esponente 1 dà la base ridotta', 7, fn() => potenzaModulare(7, 1, 13));
    verifica('base maggiore del modulo', 752575, fn() => potenzaModulare(123456789, 65537, 1000003));
    verifica('esponente grande, modulo grande', 235042059, fn() => potenzaModulare(2, 1000000, 1000000007));
}

// ---------------------------------------------------------------- Livello 2
livello('Livello 2: euclideEsteso(), inversoModulare(), generaChiavi(), cifra(), decifra()');
if (esiste('euclideEsteso')) {
    verifica('il primo elemento è il MCD (3120, 17)', 1, fn() => euclideEsteso(3120, 17)[0]);
    verifica('il primo elemento è il MCD (252, 105)', 21, fn() => euclideEsteso(252, 105)[0]);
    $identita = true;
    try {
        foreach ([[3120, 17], [252, 105], [240, 46], [99, 78], [17, 3120], [1071, 462]] as [$a, $b]) {
            [$g, $x, $y] = euclideEsteso($a, $b);
            if ($a * $x + $b * $y !== $g) {
                $identita = false;
            }
        }
    } catch (Throwable $e) {
        $identita = false;
    }
    verifica('a·x + b·y = MCD per più coppie', true, fn() => $identita);
}
if (esiste('inversoModulare')) {
    verifica('inverso di 17 modulo 3120', 2753, fn() => inversoModulare(17, 3120));
    verifica('inverso di 3 modulo 7', 5, fn() => inversoModulare(3, 7));
    verifica('inverso di 7 modulo 15', 13, fn() => inversoModulare(7, 15));
    verifica('inverso di un numero negativo (-4 modulo 7)', 5, fn() => inversoModulare(-4, 7));
    verifica('4 modulo 12 non ha inverso', null, fn() => inversoModulare(4, 12));
    verifica('inverso di 3 modulo 1000000007', 333333336, fn() => inversoModulare(3, 1000000007));
}
if (esiste('generaChiavi')) {
    verifica('chiavi dell\'esempio (61, 53, 17)', ['n' => 3233, 'phi' => 3120, 'e' => 17, 'd' => 2753], fn() => generaChiavi(61, 53, 17));
    verifica('altre chiavi (17, 11, 7)', ['n' => 187, 'phi' => 160, 'e' => 7, 'd' => 23], fn() => generaChiavi(17, 11, 7));
    verifica('e non coprimo con phi: null', null, fn() => generaChiavi(61, 53, 15));
}
if (esiste('cifra')) {
    verifica('cifra 65 con (17, 3233)', 2790, fn() => cifra(65, 17, 3233));
    verifica('cifra 100 con (7, 187)', 144, fn() => cifra(100, 7, 187));
}
if (esiste('decifra')) {
    verifica('decifra 2790 con (2753, 3233)', 65, fn() => decifra(2790, 2753, 3233));
    $tutti = true;
    if (function_exists('cifra')) {
        try {
            for ($m = 0; $m < 187; $m++) {
                if (decifra(cifra($m, 7, 187), 23, 187) !== $m) {
                    $tutti = false;
                    break;
                }
            }
        } catch (Throwable $e) {
            $tutti = false;
        }
    }
    verifica('cifra e decifra tutti i messaggi da 0 a 186 (n = 187)', true, fn() => $tutti);
    verifica('la firma: 65 con la privata dà 588', 588, fn() => decifra(65, 2753, 3233));
    verifica('la verifica: 588 con la pubblica torna a 65', 65, fn() => cifra(588, 17, 3233));
}

// ---------------------------------------------------------------- Livello 3
livello('Livello 3: attacco per fattorizzazione');
if (esiste('fattorizza')) {
    verifica('3233 = 53 · 61', [53, 61], fn() => fattorizza(3233));
    verifica('187 = 11 · 17', [11, 17], fn() => fattorizza(187));
    verifica('un numero primo non si fattorizza', [], fn() => fattorizza(97));
    verifica('n più grande (1000003 · 1000033)', [1000003, 1000033], fn() => fattorizza(1000036000099));
}
if (esiste('attaccoRSA')) {
    verifica('trova d per (n = 3233, e = 17)', 2753, fn() => attaccoRSA(3233, 17));
    verifica('trova d per (n = 187, e = 7)', 23, fn() => attaccoRSA(187, 7));
    verifica('n primo: null', null, fn() => attaccoRSA(97, 5));
    verifica('con d trovato si decifra il messaggio intercettato', 65, function () {
        $d = attaccoRSA(3233, 17);
        return $d === null ? null : decifra(2790, $d, 3233);
    });
    verifica('e·d ≡ 1 (mod phi) per n di 13 cifre', 1, function () {
        $d = attaccoRSA(1000036000099, 65537);
        return $d === null ? null : ($d * 65537) % (1000002 * 1000032);
    });
}

riepilogo();
