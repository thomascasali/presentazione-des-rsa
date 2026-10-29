<?php
/**
 * Test del laboratorio 03 — Vigenère.
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
    echo '<!DOCTYPE html><html lang="it"><meta charset="utf-8"><title>Test — Lab 03 Vigenère</title><body style="background:#fff;color:#111"><pre style="font:15px/1.5 monospace">';
}
if (!is_file($fileDaProvare)) {
    scrivi("File non trovato: $fileDaProvare");
    exit(2);
}
require $fileDaProvare;
scrivi('Laboratorio 03 — Vigenère. File provato: ' . basename($fileDaProvare));
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
livello('Livello 1: vigenere()');
if (esiste('vigenere')) {
    verifica('maiuscole, chiave LUNA', 'LNGANWB', fn() => vigenere('ATTACCO', 'LUNA'));
    verifica('spazi, punteggiatura e cifre non consumano la chiave', 'Uw givwlqg, rzqsbt edzp 8!', fn() => vigenere('Ci vediamo, domani alle 8!', 'Sole'));
    verifica('lettere accentate restano invariate', 'Oikxà è necpm', fn() => vigenere('Città è bella', 'Mare'));
    verifica('la chiave ignora spazi e trattini', 'lnganwb', fn() => vigenere('attacco', 'l u-n a'));
    verifica('chiave A = nessuno spostamento', 'Hello World', fn() => vigenere('Hello World', 'A'));
    verifica('chiave di una lettera = Cesare', 'Khoor Zruog', fn() => vigenere('Hello World', 'D'));
    verifica('la Z torna alla A', 'ABC abc', fn() => vigenere('ZZZ zzz', 'BCD'));
    verifica('frase più lunga', 'Fwrrnk djiihqhr dk Anjtgun v Rgbn', fn() => vigenere('Domani verifica di Sistemi e Reti', 'Cifra'));
    verifica('testo vuoto', '', fn() => vigenere('', 'LUNA'));
    verifica('chiave senza lettere: InvalidArgumentException', true, function () {
        try {
            vigenere('ciao', '123 -');
        } catch (InvalidArgumentException $e) {
            return true;
        }
        return false;
    });
}

// ---------------------------------------------------------------- Livello 2
livello('Livello 2: decifraVigenere()');
if (esiste('decifraVigenere')) {
    verifica('decifra con chiave Sole', 'Ci vediamo, domani alle 8!', fn() => decifraVigenere('Uw givwlqg, rzqsbt edzp 8!', 'Sole'));
    verifica('decifra LNGANWB con LUNA', 'ATTACCO', fn() => decifraVigenere('LNGANWB', 'LUNA'));
    verifica('A con chiave B torna a Z', 'Z', fn() => decifraVigenere('A', 'B'));
    verifica('chiave A = nessuno spostamento', 'Ciao', fn() => decifraVigenere('Ciao', 'AAA'));
    $andataRitorno = true;
    if (function_exists('vigenere')) {
        $m = 'Domani, alle 8:30, verifica di Sistemi e Reti!';
        try {
            foreach (['A', 'Z', 'LUNA', 'chiave', 'Ti piace? No!', 'PASSWORDLUNGA'] as $k) {
                if (decifraVigenere(vigenere($m, $k), $k) !== $m) {
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
livello('Livello 3: indice di coincidenza e attacco');
$testoCifrato1 = 'Aye qfufi elr spwblt cy ctzeaccb dt Pvgphrrp zh czhfioyeaei vmaifstvvlp xn vtiyacy. Vl dytrpnb seuia yyyll wuilpr: uyu caciya nbr st lvppnr szngo tf zedmngrcb e nuzbtu yo djbseuzeynb a zaai wygtpln. Ml uacsy hnl jnrzfn rtjrtfnn llmpil xrlwy grlwpe, ayecsy qup zeaxgrnec hgfuyi oyy tpmgo, ncsrlnv czh ya dnrsdu cacnr dpfya nbvagy, crzxhczhb fcuzmphgi fahawc. Phllyed Vnbmute alvml y Srtyqrtwu Klmvsvc cot wnptlbnz wbmp ofacy dupmge ccceecmizhv ppl fczjeicy ya woagsymzl xrlwu phtuie.';
$testoCifrato2 = 'Ul cmbfdakarza dz unwardmtzoa ju tiavr ml jqcfzdf birzo uqlcm stgocm. Oxzi gaskmzzanv ta lz cfyplfei oocxexmtf mlcm rvfe zztvdnr q ue mrdmdza cfz i tmvz bei xe gdomq dz oasxaxsif. Brzya uu ieuzzmrv x\'ejqrtutrlifze susfsnr mctqnuqrv ul jqrmqr, tankdocxaiq cyq gcu snuttt szmnf un wgnquoeq e mqrzritmrv ohv fukfi z oodbukqr iuejoaea a tamlzitmrv frr xoia. Acxa wunv pecxa cqzzanv ei jbexze kgtka cfz akfeelifze.';
$testoCifrato3 = 'Zvo iiym wejtzarxnko v ys qbjmjus um hwagyymf tsqtsxeyq hie qwff tjz gterjwrvxq rrxn. Wuem rmgjelowf znmbv hndwjs nv dzghwzz tfkqyiybw tlj ihkvfdsiwfvc iszbsi i xewkgm nwes f zoxkncbxiwm wc hjahzrfboimt. Kvz wn bffzf vsc qjhnf tzw zvklmfv m uiqtljbhz wj vce wtvc gvtbskxn, mr v tjz elixbc tlj aw lwfvc gvtbctsqtw tmkzokm hwav mq awtyww VKXUA s ce hwbeixawfrj zsdsyi GJL. Qi qzjwihlvf bfrwkwfde nt qfrymblxt qb lrf ashyjvnr hn tskxjzs jisho jisac.';
if (esiste('indiceCoincidenza')) {
    verifica('26 lettere diverse: 0', 0.0, fn() => round(indiceCoincidenza('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 4));
    verifica('lettere tutte uguali: 1', 1.0, fn() => round(indiceCoincidenza('aaaa'), 4));
    verifica('AABB: 2/6', 0.3333, fn() => round(indiceCoincidenza('AABB'), 4));
    verifica('meno di due lettere: 0', 0.0, fn() => indiceCoincidenza('A'));
    verifica('un testo italiano (maiuscole e minuscole insieme)', 0.0708, fn() => round(indiceCoincidenza('Per quasi tre secoli il cifrario di Vigenere fu considerato impossibile da violare. Il segreto stava nella chiave: una parola che si ripete sotto il messaggio e cambia lo spostamento a ogni lettera. Ma anche una parola ripetuta lascia delle tracce, perche due frammenti uguali del testo, cifrati con la stessa parte della chiave, producono frammenti uguali. Charles Babbage prima e Friedrich Kasiski poi capirono come usare queste ripetizioni per scoprire la lunghezza della chiave.'), 4));
    verifica('il cifrato Vigenère ha IC basso', 0.0459, fn() => round(indiceCoincidenza($testoCifrato1), 4));
}
if (esiste('stimaLunghezzaChiave')) {
    verifica('chiave LUNA: lunghezza 4', 4, fn() => stimaLunghezzaChiave($testoCifrato1));
    verifica('chiave MAR: lunghezza 3', 3, fn() => stimaLunghezzaChiave($testoCifrato2));
    verifica('chiave FIORE: lunghezza 5', 5, fn() => stimaLunghezzaChiave($testoCifrato3));
    verifica('con max troppo piccolo: 0', 0, fn() => stimaLunghezzaChiave($testoCifrato3, 3));
}
if (esiste('trovaChiaveVigenere')) {
    verifica('trova la chiave LUNA', 'LUNA', fn() => trovaChiaveVigenere($testoCifrato1, 4));
    verifica('trova la chiave MAR', 'MAR', fn() => trovaChiaveVigenere($testoCifrato2, 3));
    verifica('trova la chiave FIORE', 'FIORE', fn() => trovaChiaveVigenere($testoCifrato3, 5));
    verifica('con la lunghezza doppia: chiave ripetuta', 'LUNALUNA', fn() => trovaChiaveVigenere($testoCifrato1, 8));
}

riepilogo();
