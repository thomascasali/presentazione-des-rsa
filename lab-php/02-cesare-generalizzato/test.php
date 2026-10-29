<?php
/**
 * Test del laboratorio 02 — Cesare generalizzato (chiave a serie di numeri).
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
    echo '<!DOCTYPE html><html lang="it"><meta charset="utf-8"><title>Test — Lab 02 Cesare generalizzato</title><body style="background:#fff;color:#111"><pre style="font:15px/1.5 monospace">';
}
if (!is_file($fileDaProvare)) {
    scrivi("File non trovato: $fileDaProvare");
    exit(2);
}
require $fileDaProvare;
scrivi('Laboratorio 02 — Cesare generalizzato. File provato: ' . basename($fileDaProvare));
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
livello('Livello 1: cesareGeneralizzato()');
if (esiste('cesareGeneralizzato')) {
    verifica('chiave 3-1-4 su ATTACCO', 'DUXDDGR', fn() => cesareGeneralizzato('ATTACCO', [3, 1, 4]));
    verifica('la chiave ricomincia: xyz xyz con 3-1-4', 'azd azd', fn() => cesareGeneralizzato('xyz xyz', [3, 1, 4]));
    verifica('maiuscole, minuscole e punteggiatura', 'Fjer, Nsqes!', fn() => cesareGeneralizzato('Ciao, Mondo!', [3, 1, 4]));
    verifica('chiave di due numeri', 'Igmnp Yptmf', fn() => cesareGeneralizzato('Hello World', [1, 2]));
    verifica('gli spazi non consumano la chiave', 'Gpqdom, dmph 8:30, wiujjlde gj Wltxhnm h Siwj!', fn() => cesareGeneralizzato('Domani, alle 8:30, verifica di Sistemi e Reti!', [3, 1, 4]));
    verifica('lettere accentate invariate e senza consumare la chiave', 'Hivyà è', fn() => cesareGeneralizzato('Città è', [5, 0, 2]));
    verifica('chiave di un solo numero = Cesare', 'Zp 123 Zp', fn() => cesareGeneralizzato('Si 123 Si', [7]));
    verifica('numeri 26 e 52 valgono 0', 'Abc', fn() => cesareGeneralizzato('Abc', [26, 52]));
    verifica('numeri negativi e maggiori di 25', 'Ehiol', fn() => cesareGeneralizzato('Hello', [-3, 29]));
    verifica('Z con spostamenti 1-2-3', 'ABca', fn() => cesareGeneralizzato('ZZzz', [1, 2, 3]));
    verifica('chiave 0: testo invariato', 'ATTACCO', fn() => cesareGeneralizzato('ATTACCO', [0]));
    verifica('testo vuoto', '', fn() => cesareGeneralizzato('', [3, 1, 4]));
    verifica('chiave vuota: testo invariato', 'Ciao', fn() => cesareGeneralizzato('Ciao', []));
}

// ---------------------------------------------------------------- Livello 2
livello('Livello 2: decifraCesareGeneralizzato()');
if (esiste('decifraCesareGeneralizzato')) {
    verifica('decifra con 3-1-4', 'Ciao, Mondo!', fn() => decifraCesareGeneralizzato('Fjer, Nsqes!', [3, 1, 4]));
    verifica('decifra con 1-2', 'Hello World', fn() => decifraCesareGeneralizzato('Igmnp Yptmf', [1, 2]));
    verifica('A con 1-2 torna indietro fino a Z', 'ZY', fn() => decifraCesareGeneralizzato('AA', [1, 2]));
    verifica('numeri negativi e grandi', 'Hello', fn() => decifraCesareGeneralizzato('Ehiol', [-3, 29]));
    verifica('chiave vuota: testo invariato', 'Ciao', fn() => decifraCesareGeneralizzato('Ciao', []));
    $andataRitorno = true;
    if (function_exists('cesareGeneralizzato')) {
        $m = 'Domani, alle 8:30, verifica di Sistemi e Reti: porta il portatile!';
        try {
            foreach ([[3, 1, 4], [7], [0, 13], [-5, 30, 2, 25], [10, 20, 3, 8, 1]] as $chiave) {
                if (decifraCesareGeneralizzato(cesareGeneralizzato($m, $chiave), $chiave) !== $m) {
                    $andataRitorno = false;
                }
            }
        } catch (Throwable $e) {
            $andataRitorno = false;
        }
    }
    verifica('cifra e decifra con chiavi di lunghezza diversa', true, fn() => $andataRitorno);
}

// ---------------------------------------------------------------- Livello 3
livello('Livello 3: forzaBruta2() e trovaChiave2()');
if (esiste('forzaBruta2')) {
    $cifr = 'Igmnp Yptmf';
    verifica('restituisce 676 tentativi (26 x 26)', 676, fn() => count(forzaBruta2($cifr)));
    verifica('le chiavi sono scritte "a-b", da 0-0 a 25-25', ['0-0', '25-25'], function () use ($cifr) {
        $k = array_keys(forzaBruta2($cifr));
        return [$k[0] ?? null, $k[count($k) - 1] ?? null];
    });
    verifica('con la chiave 1-2 compare il testo giusto', 'Hello World', fn() => forzaBruta2($cifr)['1-2'] ?? null);
    verifica('con la chiave 0-0 il testo non cambia', $cifr, fn() => forzaBruta2($cifr)['0-0'] ?? null);
}
if (esiste('trovaChiave2')) {
    verifica('parola nota "domani"', [7, 2], fn() => trovaChiave2('Pn iqukmkjq wcyvl fvohpp ohvakuc, jquvyqsnh ks evpaq!', 'domani'));
    verifica('senza distinguere maiuscole e minuscole', [19, 4], fn() => trovaChiave2('TXMEVGH EEP TPUE', 'attacco'));
    verifica('un altro messaggio e un\'altra parola', [12, 5], fn() => trovaChiave2('Ejszu nx hasulxna gufzha', 'CONIGLIO'));
    verifica('parola che non compare: null', null, fn() => trovaChiave2('Igmnp Yptmf', 'qwerty'));
}

// ---------------------------------------------------------------- Livello 3 bonus
livello('Livello 3 bonus: frequenze per colonna');
if (esiste('colonna')) {
    verifica('colonna 0 di 3', 'CON', fn() => colonna('Ciao, Mondo!', 3, 0));
    verifica('colonna 1 di 3', 'IMD', fn() => colonna('Ciao, Mondo!', 3, 1));
    verifica('colonna 2 di 3', 'AOO', fn() => colonna('Ciao, Mondo!', 3, 2));
}
if (esiste('chiavePerFrequenze')) {
    verifica('chiave 5-12 da un testo lungo', [5, 12], fn() => chiavePerFrequenze('Qm hdnfyaldfrnm è q\'mwfj pn zfehaspjdj uq enssukuhmya iu zz rqxefslut. Omu xowuaq ydfekawyf xj bfdtxj otz zzf djstxf q zzf omufhj, omu qqlsj gxm qm xfjexm htnmaq uqw ftdsmwq fx yqxft awulusmqq. Sqn ejotxn czqxff uiqf è eymym zefff bjd udtfjslqwq qqyfjdj, awpnzn ynxnffdn q xqldjfn pn eymya, rm fzhtj bjd lutofdj otz lxn mruhu. Nz zzf djfj ytpjdsm tssu harbzfjd xofyguf otzyusgfyjzyq nzkawyflnasu has mqfwu harbzfjd, j ytxyq iu vgjeyq nzkawyflnasu iqaasa wqxffdj dnejdamyq igwmsfj uq hnmlsna ffydfhjdxa n ofhn q qq tziq wmiut. Czmspt ehdnhnmra zzf bfexitdi aubzdj ushnmra zz rqxefslut m zz fynot, u imyu ffydfhjdxmsa raqfn pneuaxuyuau htj ztz hasaxonmra j omq uaydjngqwa qqlsjdqu. Uqw czqxft ytfnht xf dnejdamyqelf ztz è zz qgxet yf gsm sqhqxenfà, j omu udtsjfym zz xuxfjyf pjhj bjzxmwon rnz imqx\'nznlna.', 2));
    verifica('chiave 20-3 da un testo lungo', [20, 3], fn() => chiavePerFrequenze('Fd wucwnrauuicd è f\'dlwy gc quvwrhgyuy lf vcjhlzlwdnr xl oq ghmvujali. Fbl mfllph nuuvzrlpu oy suuioy fiq oqu uyjiou h oqu fbluyy, fbl fhajy xmd fd mwyvmd wkcdph jhl wiuhdlh uo nhmwi rllalhdfh. Hhc vyfioc tohmwu lxhu è vndnd ovuwu syu juiwyjahlh fhnwyuy, rlgcqc pcocwuuc h mhauywc gc vndnr, gd uqwky syu alifuuy fiq aoc dglwl. Cq oqu uywy pigyuhd ijhl wrgsowyu mfupvlu fiqnlhxupyqnh cqzrlpuccrhl wrh dfwll wrgsowyu, y pionh xl kxyvnh cqzrlpuccrhl xhprhr lhmwuuy ucvyupdnh xxldhwy lf ycdajcr uwnuuyyumr c fuyc h fh iqxh ldxli. Todhgi vwucycdgr oqu suvmziux rjsouy lhycdgr oq ghmvujali d oq upcfi, l xdnl uwnuuyyumdhr grfwc gcvjrmlnlpl wky qiq wrhrmfcdgr y fbh jrnuyevhlr fhajyufl. Jhl tohmwi piwcyi ou ucvyupdnhtcu qiq è oq fxmvi pu xhd hhwhmvcwà, y fbl juijywnd oq mlmwypu gyyy syqmdlfc icq xdfo\'cqcccr.', 2));
}

riepilogo();
