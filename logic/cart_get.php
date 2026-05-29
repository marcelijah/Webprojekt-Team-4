<?php
// B17: Liefert alle Positionen im Warenkorb + Gesamtsumme
require_once __DIR__ . '/response.php';

session_start();

$positionen = [];
$gesamt = 0.0;
$anzahl = 0;

if (!empty($_SESSION['warenkorb']) && is_array($_SESSION['warenkorb'])) {
    foreach ($_SESSION['warenkorb'] as $eintrag) {
        $menge = (int)$eintrag['menge'];
        $preis = (float)$eintrag['preis'];
        $zwischensumme = $menge * $preis;
        $positionen[] = [
            'produkt_id'    => (int)$eintrag['produkt_id'],
            'name'          => $eintrag['name'],
            'preis'         => $preis,
            'image_path'    => $eintrag['image_path'] ?? 'productpictures/placeholder.jpg',
            'menge'         => $menge,
            'zwischensumme' => $zwischensumme,
        ];
        $gesamt += $zwischensumme;
        $anzahl += $menge;
    }
}

Response::success([
    'positionen' => $positionen,
    'gesamt'     => $gesamt,
    'anzahl'     => $anzahl,
]);
