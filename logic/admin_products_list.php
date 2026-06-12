<?php
// B26: Alle Produkte für die Admin-Verwaltung auflisten.
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/admin_guard.php';

session_start();

try {
    require_admin();

    $pdo = DBAccess::getInstance()->getConnection();
    $stmt = $pdo->query(
        'SELECT id, name, description, price, category, image_path, stock
         FROM products ORDER BY category, name'
    );
    Response::success($stmt->fetchAll());

} catch (Exception $e) {
    Response::error('Produkte konnten nicht geladen werden.', 500);
}
