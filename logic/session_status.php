<?php
// Liefert aktuellen Login-Status für die Navigation (B11, B12)
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

session_start();

try {
    // Falls keine Session aktiv, aber Remember-Cookie vorhanden -> Auto-Login
    if (empty($_SESSION['user_id']) && !empty($_COOKIE['remember_token'])) {
        $pdo = DBAccess::getInstance()->getConnection();
        $stmt = $pdo->prepare('SELECT id, username FROM users WHERE remember_token = ? LIMIT 1');
        $stmt->execute([$_COOKIE['remember_token']]);
        $user = $stmt->fetch();
        if ($user) {
            $_SESSION['user_id']  = (int)$user['id'];
            $_SESSION['username'] = $user['username'];
        }
    }

    if (!empty($_SESSION['user_id'])) {
        Response::success(['loggedIn' => true, 'username' => $_SESSION['username']]);
    } else {
        Response::success(['loggedIn' => false, 'username' => null]);
    }

} catch (Exception $e) {
    Response::error('Statusabfrage fehlgeschlagen.', 500);
}
