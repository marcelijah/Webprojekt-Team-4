<?php
// B16: Aktuelle Anzahl der Artikel im Warenkorb (Session) zurückgeben
require_once __DIR__ . '/response.php';

session_start();

$anzahl = 0;
if (!empty($_SESSION['warenkorb']) && is_array($_SESSION['warenkorb'])) {
    foreach ($_SESSION['warenkorb'] as $eintrag) {
        $anzahl += (int)($eintrag['menge'] ?? 0);
    }
}

Response::success(['anzahl' => $anzahl]);
