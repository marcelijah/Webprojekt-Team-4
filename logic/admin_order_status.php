<?php
// Admin schaltet den Status einer Bestellung zwischen "pending" und "done" um.
// Reversibler Toggle – Vorbild: admin_customer_toggle.php
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/admin_guard.php';

session_start();

try {
    require_admin();

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $bestellId = (int)($input['order_id'] ?? 0);
    if ($bestellId <= 0) {
        Response::error('Ungültige Bestell-ID.');
    }

    $pdo = DBAccess::getInstance()->getConnection();

    // Aktuellen Status laden
    $stmt = $pdo->prepare('SELECT status FROM orders WHERE id = ? LIMIT 1');
    $stmt->execute([$bestellId]);
    $bestellung = $stmt->fetch();
    if (!$bestellung) {
        Response::error('Bestellung nicht gefunden.', 404);
    }

    // Status umschalten
    $neu = $bestellung['status'] === 'done' ? 'pending' : 'done';
    $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
    $stmt->execute([$neu, $bestellId]);

    Response::success(['status' => $neu], 'Bestellstatus aktualisiert.');

} catch (Exception $e) {
    Response::error('Bestellstatus konnte nicht geändert werden.', 500);
}
