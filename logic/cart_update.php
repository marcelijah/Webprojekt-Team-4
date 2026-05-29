<?php
// B17: Menge einer Position im Warenkorb ändern (Menge <= 0 entfernt die Position)
require_once __DIR__ . '/response.php';

session_start();

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $produktId = (int)($input['produkt_id'] ?? 0);
    $menge     = (int)($input['menge'] ?? 0);

    if ($produktId <= 0) {
        Response::error('Ungültige Produkt-ID.');
    }

    if (!isset($_SESSION['warenkorb'][$produktId])) {
        Response::error('Produkt nicht im Warenkorb.');
    }

    if ($menge <= 0) {
        unset($_SESSION['warenkorb'][$produktId]);
    } else {
        $_SESSION['warenkorb'][$produktId]['menge'] = $menge;
    }

    Response::success(null, 'Warenkorb aktualisiert.');

} catch (Exception $e) {
    Response::error('Aktualisierung fehlgeschlagen.', 500);
}
