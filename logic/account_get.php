<?php
// B20: Stammdaten des eingeloggten Users zurückgeben
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

session_start();

try {
    if (empty($_SESSION['user_id'])) {
        Response::error('Bitte zuerst einloggen.', 401);
    }

    $pdo = DBAccess::getInstance()->getConnection();
    $stmt = $pdo->prepare(
        'SELECT salutation, first_name, last_name, address, zip, city, email, username
         FROM users WHERE id = ? LIMIT 1'
    );
    $stmt->execute([(int)$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        Response::error('Benutzer nicht gefunden.', 404);
    }

    Response::success($user);

} catch (Exception $e) {
    Response::error('Daten konnten nicht geladen werden.', 500);
}
