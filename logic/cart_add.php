<?php
// B15: Produkt via AJAX zum Warenkorb hinzufügen (ohne Reload)
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

session_start();

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $produktId = (int)($input['produkt_id'] ?? 0);

    if ($produktId <= 0) {
        Response::error('Ungültige Produkt-ID.');
    }

    // Produkt aus DB laden (Preis nie vom Client übernehmen)
    $pdo = DBAccess::getInstance()->getConnection();
    $stmt = $pdo->prepare('SELECT id, name, price FROM products WHERE id = ? LIMIT 1');
    $stmt->execute([$produktId]);
    $produkt = $stmt->fetch();

    if (!$produkt) {
        Response::error('Produkt nicht gefunden.');
    }

    // Warenkorb in der Session: array mit produkt_id => menge/name/preis
    if (!isset($_SESSION['warenkorb']) || !is_array($_SESSION['warenkorb'])) {
        $_SESSION['warenkorb'] = [];
    }

    $id = (int)$produkt['id'];
    if (isset($_SESSION['warenkorb'][$id])) {
        $_SESSION['warenkorb'][$id]['menge'] += 1;
    } else {
        $_SESSION['warenkorb'][$id] = [
            'produkt_id' => $id,
            'name'       => $produkt['name'],
            'preis'      => (float)$produkt['price'],
            'menge'      => 1,
        ];
    }

    // Gesamtanzahl der Artikel im Warenkorb berechnen
    $anzahl = 0;
    foreach ($_SESSION['warenkorb'] as $eintrag) {
        $anzahl += (int)$eintrag['menge'];
    }

    Response::success(
        ['anzahl' => $anzahl, 'name' => $produkt['name']],
        'Produkt wurde zum Warenkorb hinzugefügt.'
    );

} catch (Exception $e) {
    Response::error('Hinzufügen zum Warenkorb fehlgeschlagen.', 500);
}
