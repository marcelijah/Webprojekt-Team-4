<?php
// B21: Alle Bestellungen des eingeloggten Users, nach Datum aufwärts (= neueste zuerst)
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

session_start();

try {
    if (empty($_SESSION['user_id'])) {
        Response::error('Bitte zuerst einloggen.', 401);
    }

    $pdo = DBAccess::getInstance()->getConnection();
    $stmt = $pdo->prepare(
        'SELECT o.id, o.total, o.payment_method, o.status, o.created_at,
                COALESCE(SUM(oi.quantity), 0) AS anzahl_artikel
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.user_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC'
    );
    $stmt->execute([(int)$_SESSION['user_id']]);
    $bestellungen = $stmt->fetchAll();

    Response::success($bestellungen);

} catch (Exception $e) {
    Response::error('Bestellungen konnten nicht geladen werden.', 500);
}
