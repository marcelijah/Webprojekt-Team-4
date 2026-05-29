<?php
// B17: Eine Position aus dem Warenkorb entfernen
require_once __DIR__ . '/response.php';

session_start();

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $produktId = (int)($input['produkt_id'] ?? 0);

    if ($produktId <= 0) {
        Response::error('Ungültige Produkt-ID.');
    }

    if (isset($_SESSION['warenkorb'][$produktId])) {
        unset($_SESSION['warenkorb'][$produktId]);
    }

    Response::success(null, 'Produkt entfernt.');

} catch (Exception $e) {
    Response::error('Entfernen fehlgeschlagen.', 500);
}
