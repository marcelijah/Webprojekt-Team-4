<?php
// B19: Bestellung validieren und in der DB ablegen (orders + order_items)
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

session_start();

try {
    // Nur eingeloggte User dürfen bestellen
    if (empty($_SESSION['user_id'])) {
        Response::error('Bitte zuerst einloggen.', 401);
    }

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $zahlungsart = trim($input['zahlungsart'] ?? '');

    // Erlaubte Zahlungsarten (keine Gutscheine – Bonus-Item, nicht umgesetzt)
    $erlaubt = ['kreditkarte', 'paypal', 'rechnung', 'vorkasse'];
    if (!in_array($zahlungsart, $erlaubt, true)) {
        Response::error('Bitte eine gültige Zahlungsart auswählen.');
    }

    // Warenkorb prüfen
    if (empty($_SESSION['warenkorb']) || !is_array($_SESSION['warenkorb'])) {
        Response::error('Dein Warenkorb ist leer.');
    }

    $pdo = DBAccess::getInstance()->getConnection();
    $pdo->beginTransaction();

    // Gesamtsumme nochmals serverseitig berechnen (Preise frisch aus DB)
    $gesamt = 0.0;
    $positionen = [];
    foreach ($_SESSION['warenkorb'] as $eintrag) {
        $produktId = (int)$eintrag['produkt_id'];
        $menge = (int)$eintrag['menge'];
        if ($produktId <= 0 || $menge <= 0) {
            $pdo->rollBack();
            Response::error('Ungültige Position im Warenkorb.');
        }
        $stmt = $pdo->prepare('SELECT price FROM products WHERE id = ? LIMIT 1');
        $stmt->execute([$produktId]);
        $produkt = $stmt->fetch();
        if (!$produkt) {
            $pdo->rollBack();
            Response::error('Ein Produkt existiert nicht mehr.');
        }
        $preis = (float)$produkt['price'];
        $gesamt += $preis * $menge;
        $positionen[] = [
            'produkt_id' => $produktId,
            'menge'      => $menge,
            'preis'      => $preis,
        ];
    }

    // Bestellung anlegen
    $stmt = $pdo->prepare(
        'INSERT INTO orders (user_id, total, payment_method, status) VALUES (?, ?, ?, ?)'
    );
    $stmt->execute([
        (int)$_SESSION['user_id'],
        $gesamt,
        $zahlungsart,
        'pending',
    ]);
    $bestellId = (int)$pdo->lastInsertId();

    // Positionen anlegen
    $stmt = $pdo->prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
    );
    foreach ($positionen as $p) {
        $stmt->execute([$bestellId, $p['produkt_id'], $p['menge'], $p['preis']]);
    }

    $pdo->commit();

    // Warenkorb leeren – Bestellung ist abgeschlossen
    $_SESSION['warenkorb'] = [];

    Response::success(['bestell_id' => $bestellId], 'Bestellung erfolgreich angelegt.');

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    Response::error('Bestellung konnte nicht abgeschlossen werden.', 500);
}
