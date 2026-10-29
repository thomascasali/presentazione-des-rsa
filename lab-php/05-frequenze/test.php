<?php
/**
 * Test del laboratorio 05 — Frequenze.
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
    echo '<!DOCTYPE html><html lang="it"><meta charset="utf-8"><title>Test — Lab 05 Frequenze</title><body style="background:#fff;color:#111"><pre style="font:15px/1.5 monospace">';
}
if (!is_file($fileDaProvare)) {
    scrivi("File non trovato: $fileDaProvare");
    exit(2);
}
require $fileDaProvare;
scrivi('Laboratorio 05 — Frequenze. File provato: ' . basename($fileDaProvare));
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
livello('Livello 1: contaLettere() e percentuali()');
if (esiste('contaLettere')) {
    verifica('Ciao Mondo: maiuscole e minuscole insieme, resto ignorato', ['A' => 1, 'B' => 0, 'C' => 1, 'D' => 1, 'E' => 0, 'F' => 0, 'G' => 0, 'H' => 0, 'I' => 1, 'J' => 0, 'K' => 0, 'L' => 0, 'M' => 1, 'N' => 1, 'O' => 3, 'P' => 0, 'Q' => 0, 'R' => 0, 'S' => 0, 'T' => 0, 'U' => 0, 'V' => 0, 'W' => 0, 'X' => 0, 'Y' => 0, 'Z' => 0], fn() => contaLettere('Ciao Mondo'));
    verifica('cifre, punteggiatura e accenti ignorati', ['A' => 1, 'B' => 0, 'C' => 1, 'D' => 1, 'E' => 0, 'F' => 0, 'G' => 0, 'H' => 0, 'I' => 1, 'J' => 0, 'K' => 0, 'L' => 0, 'M' => 1, 'N' => 1, 'O' => 3, 'P' => 0, 'Q' => 0, 'R' => 0, 'S' => 0, 'T' => 0, 'U' => 0, 'V' => 0, 'W' => 0, 'X' => 0, 'Y' => 0, 'Z' => 0], fn() => contaLettere('Ciao Mondo, 2024! àèì'));
    verifica('testo vuoto: 26 zeri', ['A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'E' => 0, 'F' => 0, 'G' => 0, 'H' => 0, 'I' => 0, 'J' => 0, 'K' => 0, 'L' => 0, 'M' => 0, 'N' => 0, 'O' => 0, 'P' => 0, 'Q' => 0, 'R' => 0, 'S' => 0, 'T' => 0, 'U' => 0, 'V' => 0, 'W' => 0, 'X' => 0, 'Y' => 0, 'Z' => 0], fn() => contaLettere(''));
    verifica('le chiavi sono le 26 lettere in ordine', range('A', 'Z'), fn() => array_keys(contaLettere('x')));
    verifica('un testo lungo', ['A' => 36, 'B' => 3, 'C' => 21, 'D' => 8, 'E' => 39, 'F' => 4, 'G' => 7, 'H' => 4, 'I' => 39, 'J' => 0, 'K' => 0, 'L' => 23, 'M' => 6, 'N' => 27, 'O' => 34, 'P' => 8, 'Q' => 0, 'R' => 25, 'S' => 12, 'T' => 21, 'U' => 9, 'V' => 5, 'W' => 1, 'X' => 0, 'Y' => 0, 'Z' => 6], fn() => contaLettere('Il laboratorio di informatica si trova al secondo piano della scuola. Ogni postazione ha un computer collegato alla rete interna e un armadio con i cavi per le prove di cablaggio. Prima di iniziare l\'esercitazione bisogna accendere il server, controllare che gli switch siano in funzione e verificare che tutti i computer riescano a comunicare tra loro. Alla fine della lezione si spegne tutto con attenzione.'));
}
if (esiste('percentuali')) {
    verifica('percentuali di Ciao Mondo', ['A' => 11.111111, 'B' => 0.000000, 'C' => 11.111111, 'D' => 11.111111, 'E' => 0.000000, 'F' => 0.000000, 'G' => 0.000000, 'H' => 0.000000, 'I' => 11.111111, 'J' => 0.000000, 'K' => 0.000000, 'L' => 0.000000, 'M' => 11.111111, 'N' => 11.111111, 'O' => 33.333333, 'P' => 0.000000, 'Q' => 0.000000, 'R' => 0.000000, 'S' => 0.000000, 'T' => 0.000000, 'U' => 0.000000, 'V' => 0.000000, 'W' => 0.000000, 'X' => 0.000000, 'Y' => 0.000000, 'Z' => 0.000000], fn() => array_map(fn($x) => round((float) $x, 6), percentuali(contaLettere('Ciao Mondo'))));
    verifica('totale 0: tutte a 0.0', ['A' => 0.0, 'B' => 0.0, 'C' => 0.0, 'D' => 0.0, 'E' => 0.0, 'F' => 0.0, 'G' => 0.0, 'H' => 0.0, 'I' => 0.0, 'J' => 0.0, 'K' => 0.0, 'L' => 0.0, 'M' => 0.0, 'N' => 0.0, 'O' => 0.0, 'P' => 0.0, 'Q' => 0.0, 'R' => 0.0, 'S' => 0.0, 'T' => 0.0, 'U' => 0.0, 'V' => 0.0, 'W' => 0.0, 'X' => 0.0, 'Y' => 0.0, 'Z' => 0.0], fn() => percentuali(contaLettere('123')));
    verifica('la somma delle percentuali è 100', 100.0, fn() => round(array_sum(percentuali(contaLettere('Il laboratorio di informatica si trova al secondo piano della scuola. Ogni postazione ha un computer collegato alla rete interna e un armadio con i cavi per le prove di cablaggio. Prima di iniziare l\'esercitazione bisogna accendere il server, controllare che gli switch siano in funzione e verificare che tutti i computer riescano a comunicare tra loro. Alla fine della lezione si spegne tutto con attenzione.'))), 6));
}

// ---------------------------------------------------------------- Livello 2
livello('Livello 2: istogramma()');
if (esiste('istogramma')) {
    verifica('A=4 B=2 C=0 con larghezza 8', "A ########\nB ####", fn() => istogramma(['A' => 4, 'B' => 2, 'C' => 0], 8));
    verifica('arrotondamento all\'intero più vicino', "A ##########\nB ######\nC ###", fn() => istogramma(['A' => 10, 'B' => 6, 'C' => 3], 10) );
    verifica('almeno una barra per le lettere presenti', "A ####################\nB #", fn() => istogramma(['A' => 100, 'B' => 1], 20));
    verifica('larghezza predefinita 20', "E ####################\nO ##########", fn() => istogramma(['E' => 8, 'O' => 4]));
    verifica('nessuna lettera: stringa vuota', '', fn() => istogramma(['A' => 0, 'B' => 0], 10));
    verifica('con contaLettere()', "A #######\nC ###\nI ##########", fn() => istogramma(contaLettere('aaaaaccIIIII ii'), 10));
}

// ---------------------------------------------------------------- Livello 3
livello('Livello 3: chiQuadro() e rompiCesare()');
if (esiste('chiQuadro')) {
    verifica('un testo italiano ha chi-quadro basso', 50.82, fn() => round(chiQuadro('Il laboratorio di informatica si trova al secondo piano della scuola. Ogni postazione ha un computer collegato alla rete interna e un armadio con i cavi per le prove di cablaggio. Prima di iniziare l\'esercitazione bisogna accendere il server, controllare che gli switch siano in funzione e verificare che tutti i computer riescano a comunicare tra loro. Alla fine della lezione si spegne tutto con attenzione.'), 2));
    verifica('lo stesso testo cifrato con Cesare ha chi-quadro alto', 81965.12, fn() => round(chiQuadro('Nq qfgtwfytwnt in nsktwrfynhf xn ywtaf fq xjhtsit unfst ijqqf xhztqf. Tlsn utxyfentsj mf zs htruzyjw htqqjlfyt fqqf wjyj nsyjwsf j zs fwrfint hts n hfan ujw qj uwtaj in hfgqfllnt. Uwnrf in nsnenfwj q\'jxjwhnyfentsj gnxtlsf fhhjsijwj nq xjwajw, htsywtqqfwj hmj lqn xbnyhm xnfst ns kzsentsj j ajwnknhfwj hmj yzyyn n htruzyjw wnjxhfst f htrzsnhfwj ywf qtwt. Fqqf knsj ijqqf qjentsj xn xujlsj yzyyt hts fyyjsentsj.'), 2));
    verifica('maiuscole e minuscole contano allo stesso modo', 15.86, fn() => round(chiQuadro('DOMANI verifica DI reti'), 2));
    verifica('senza lettere: INF', INF, fn() => chiQuadro('1234 !?'));
}
if (esiste('rompiCesare')) {
    verifica('rompe Cesare con chiave 3 (testo di 130 caratteri)', ['chiave' => 3, 'testo' => 'Il laboratorio di informatica si trova al secondo piano della scuola. Ogni postazione ha un computer collegato alla rete interna e'], fn() => rompiCesare('Lo oderudwrulr gl lqirupdwlfd vl wuryd do vhfrqgr sldqr ghood vfxrod. Rjql srvwdclrqh kd xq frpsxwhu froohjdwr dood uhwh lqwhuqd h'));
    verifica('rompe Cesare con chiave 11 (testo di 130 caratteri)', ['chiave' => 11, 'testo' => 'Giulio Cesare spostava ogni lettera di tre posti, ma un nemico paziente poteva provare tutte le chiavi in pochi minuti. Per questo'], fn() => rompiCesare('Rtfwtz Npdlcp dazdelgl zryt wpeepcl ot ecp azdet, xl fy ypxtnz alktpyep azepgl aczglcp efeep wp nstlgt ty aznst xtyfet. Apc bfpdez'));
    verifica('rompe Cesare con chiave 20 (testo di 120 caratteri)', ['chiave' => 20, 'testo' => 'Immagina di dover mandare un segreto a un amico che non hai mai incontrato. Se vi accordate su una chiave, qualcuno potr'], fn() => rompiCesare('Cgguachu xc xipyl guhxuly oh myalyni u oh ugcwi wby hih buc guc chwihnluni. My pc uwwilxuny mo ohu wbcupy, koufwohi jinl'));
    verifica('un testo già in chiaro: chiave 0', 0, fn() => rompiCesare('Il laboratorio di informatica si trova al secondo piano della scuola. Ogni postazione ha un computer collegato alla rete interna e')['chiave']);
}

riepilogo();
