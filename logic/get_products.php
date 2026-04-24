<?php
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $kategorie = trim($input['kategorie'] ?? '');

    $pdo = DBAccess::getInstance()->getConnection();

    if ($kategorie !== '') {
        // Kategorie-Filter: Treffersuche auf den Seriennamen (z.B. "iPhone 15")
        $stmt = $pdo->prepare(
            'SELECT id, name, description, price, category, image_path, stock
             FROM products
             WHERE category LIKE ?
             ORDER BY category, name'
        );
        $stmt->execute(['%' . $kategorie . '%']);
    } else {
        $stmt = $pdo->query(
            'SELECT id, name, description, price, category, image_path, stock
             FROM products
             ORDER BY category, name'
        );
    }

    $products = $stmt->fetchAll();
    Response::success($products);

} catch (Exception $e) {
    Response::error('Produkte konnten nicht geladen werden.', 500);
}
