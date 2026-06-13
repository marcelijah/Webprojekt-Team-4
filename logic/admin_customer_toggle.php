<?php
// B28: Kunden-Account aktivieren oder deaktivieren.
// Deaktivierte Kunden können sich nicht mehr einloggen (siehe login.php).
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

    // Nur echte Kunden dürfen umgeschaltet werden, keine Admin-Accounts
    $stmt = $pdo->prepare('SELECT is_admin, is_active FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$kundenId]);
    $kunde = $stmt->fetch();
    if (!$kunde) {
        Response::error('Kunde nicht gefunden.', 404);
    }
    if ((int)$kunde['is_admin'] === 1) {
        Response::error('Admin-Accounts können nicht deaktiviert werden.');
    }

    // Status umschalten
    $neu = (int)$kunde['is_active'] === 1 ? 0 : 1;
    $stmt = $pdo->prepare('UPDATE users SET is_active = ? WHERE id = ?');
    $stmt->execute([$neu, $kundenId]);

    $meldung = $neu === 1 ? 'Account wurde aktiviert.' : 'Account wurde deaktiviert.';
    Response::success(['is_active' => $neu], $meldung);

} catch (Exception $e) {
    Response::error('Status konnte nicht geändert werden.', 500);
}
