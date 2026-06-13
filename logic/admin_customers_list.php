<?php
// B27: Kundenliste für den Admin-Bereich (ohne Admin-Accounts).
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/admin_guard.php';

session_start();

try {
    require_admin();

    $pdo = DBAccess::getInstance()->getConnection();
    // Pro Kunde auch die Anzahl der Bestellungen mitliefern
    $stmt = $pdo->query(
        'SELECT u.id, u.salutation, u.first_name, u.last_name, u.email, u.username,
                u.city, u.is_active, u.created_at,
                COUNT(o.id) AS anzahl_bestellungen
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id
         WHERE u.is_admin = 0
         GROUP BY u.id
         ORDER BY u.last_name, u.first_name'
    );
    Response::success($stmt->fetchAll());

} catch (Exception $e) {
    Response::error('Kundenliste konnte nicht geladen werden.', 500);
}
