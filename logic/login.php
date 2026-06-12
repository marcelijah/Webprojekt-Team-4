<?php
// Login-Endpoint (B10, B12)
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

session_start();

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $loginName = trim($input['login']    ?? '');
    $password  = (string)($input['password'] ?? '');
    $remember  = !empty($input['remember']);

    if ($loginName === '' || $password === '') {
        Response::error('Bitte Benutzername und Passwort angeben.');
    }

    $pdo = DBAccess::getInstance()->getConnection();

    // Login per Username
    $stmt = $pdo->prepare('SELECT id, username, password_hash, is_admin, is_active FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$loginName]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        Response::error('Ungültige Zugangsdaten.');
    }

    // B28: Deaktivierte Accounts dürfen sich nicht mehr einloggen
    if ((int)$user['is_active'] !== 1) {
        Response::error('Dieser Account wurde deaktiviert. Bitte wende dich an den Support.', 403);
    }

    // Session setzen
    $_SESSION['user_id']  = (int)$user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['is_admin'] = (int)$user['is_admin'];

    // Remember-Me Cookie (B12)
    if ($remember) {
        $token = bin2hex(random_bytes(32));
        $stmt = $pdo->prepare('UPDATE users SET remember_token = ? WHERE id = ?');
        $stmt->execute([$token, $user['id']]);
        // 30 Tage gültig, HttpOnly
        setcookie('remember_token', $token, [
            'expires'  => time() + 60 * 60 * 24 * 30,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    Response::success(['username' => $user['username']], 'Login erfolgreich.');

} catch (Exception $e) {
    Response::error('Login fehlgeschlagen.', 500);
}
