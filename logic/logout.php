<?php
// Logout-Endpoint (B11)
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

session_start();

try {
    // Remember-Token in DB löschen, falls User eingeloggt
    if (!empty($_SESSION['user_id'])) {
        $pdo = DBAccess::getInstance()->getConnection();
        $stmt = $pdo->prepare('UPDATE users SET remember_token = NULL WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
    }

    // Session zerstören
    $_SESSION = [];
    session_destroy();

    // Remember-Cookie löschen
    if (isset($_COOKIE['remember_token'])) {
        setcookie('remember_token', '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    Response::success(null, 'Logout erfolgreich.');

} catch (Exception $e) {
    Response::error('Logout fehlgeschlagen.', 500);
}
