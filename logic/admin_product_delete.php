<?php
// B26: Bestehendes Produkt löschen.
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/admin_guard.php';

session_start();

try {
    require_admin();

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) {
        Response::error('Ungültige Produkt-ID.');
    }

    $pdo = DBAccess::getInstance()->getConnection();

    // Produkte, die bereits bestellt wurden, nicht löschen (Bestellhistorie/Rechnungen bleiben gültig)
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM order_items WHERE product_id = ?');
    $stmt->execute([$id]);
    if ((int)$stmt->fetchColumn() > 0) {
        Response::error('Produkt kann nicht gelöscht werden, da es bereits in Bestellungen vorkommt.');
    }

    $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        Response::error('Produkt nicht gefunden.', 404);
    }

    Response::success(null, 'Produkt wurde gelöscht.');

} catch (Exception $e) {
    Response::error('Produkt konnte nicht gelöscht werden.', 500);
}
