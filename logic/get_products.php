<?php
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $kategorie = trim($input['kategorie'] ?? '');
    $suche = trim($input['suche'] ?? '');

    $pdo = DBAccess::getInstance()->getConnection();

    // Dynamische WHERE-Bedingungen je nach übergebenen Filtern
    $bedingungen = [];
    $parameter = [];

    if ($kategorie !== '') {
        $bedingungen[] = 'category LIKE ?';
        $parameter[] = '%' . $kategorie . '%';
    }
    if ($suche !== '') {
        $bedingungen[] = 'name LIKE ?';
        $parameter[] = '%' . $suche . '%';
    }

    $sql = 'SELECT id, name, description, price, category, image_path, stock FROM products';
    if (!empty($bedingungen)) {
        $sql .= ' WHERE ' . implode(' AND ', $bedingungen);
    }
    $sql .= ' ORDER BY category, name';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($parameter);

    $products = $stmt->fetchAll();
    Response::success($products);

} catch (Exception $e) {
    Response::error('Produkte konnten nicht geladen werden.', 500);
}
