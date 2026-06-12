<?php
// B23: Gemeinsame Zugriffsprüfung für alle Admin-Endpoints.
// Bricht mit einer Fehlermeldung ab, wenn der aktuelle User kein Admin ist.
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

function require_admin(): int {
    if (empty($_SESSION['user_id'])) {
        Response::error('Bitte zuerst einloggen.', 401);
    }

    // Rolle sicherheitshalber frisch aus der DB prüfen (nicht nur aus der Session),
    // damit ein entzogenes Admin-Recht sofort greift.
    $pdo = DBAccess::getInstance()->getConnection();
    $stmt = $pdo->prepare('SELECT is_admin, is_active FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user || (int)$user['is_active'] !== 1) {
        Response::error('Account nicht verfügbar.', 403);
    }
    if ((int)$user['is_admin'] !== 1) {
        Response::error('Kein Zugriff – Admin-Rechte erforderlich.', 403);
    }

    return (int)$_SESSION['user_id'];
}
