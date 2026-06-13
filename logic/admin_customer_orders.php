<?php
// B27: Bestelldetails eines bestimmten Kunden für den Admin-Bereich.
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/admin_guard.php';

session_start();

try {
    require_admin();

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $kundenId = (int)($input['user_id'] ?? 0);
    if ($kundenId <= 0) {
        Response::error('Ungültige Kunden-ID.');
    }

    $pdo = DBAccess::getInstance()->getConnection();

    // Bestellungen des Kunden, neueste zuerst
    $stmt = $pdo->prepare(
        'SELECT id, total, payment_method, status, created_at
         FROM orders WHERE user_id = ? ORDER BY created_at DESC'
    );
    $stmt->execute([$kundenId]);
    $bestellungen = $stmt->fetchAll();

    // Zu jeder Bestellung die Positionen laden
    $posStmt = $pdo->prepare(
        'SELECT oi.quantity, oi.price, p.name
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?'
    );
    foreach ($bestellungen as &$b) {
        $posStmt->execute([(int)$b['id']]);
        $b['positionen'] = $posStmt->fetchAll();
    }
    unset($b);

    Response::success($bestellungen);

} catch (Exception $e) {
    Response::error('Bestelldetails konnten nicht geladen werden.', 500);
}
