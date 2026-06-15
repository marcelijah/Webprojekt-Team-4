<?php
// B20: Stammdaten ändern – Passwort muss bestätigt werden
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

session_start();

try {
    if (empty($_SESSION['user_id'])) {
        Response::error('Bitte zuerst einloggen.', 401);
    }

    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $username   = trim($input['username'] ?? '');
    $salutation = trim($input['salutation'] ?? '');
    $address    = trim($input['address'] ?? '');
    $zip        = trim($input['zip'] ?? '');
    $city       = trim($input['city'] ?? '');
    $email      = trim($input['email'] ?? '');
    $passwort   = (string)($input['passwort'] ?? '');

    // Pflichtfelder prüfen (Vor-/Nachname werden hier nicht geändert)
    if ($username === '' || $salutation === '' ||
        $address === '' || $zip === '' || $city === '' || $email === '') {
        Response::error('Bitte alle Pflichtfelder ausfüllen.');
    }
    if (strlen($username) < 3) {
        Response::error('Der Benutzername muss mindestens 3 Zeichen lang sein.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Response::error('Bitte eine gültige E-Mail-Adresse angeben.');
    }
    if ($passwort === '') {
        Response::error('Bitte aktuelles Passwort zur Bestätigung angeben.');
    }

    $pdo = DBAccess::getInstance()->getConnection();

    // Passwort prüfen
    $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$_SESSION['user_id']]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($passwort, $user['password_hash'])) {
        Response::error('Passwort ist falsch.');
    }

    // E-Mail darf nicht von anderem User belegt sein
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1');
    $stmt->execute([$email, (int)$_SESSION['user_id']]);
    if ($stmt->fetch()) {
        Response::error('Diese E-Mail-Adresse ist bereits vergeben.');
    }

    // Benutzername darf nicht von anderem User belegt sein
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1');
    $stmt->execute([$username, (int)$_SESSION['user_id']]);
    if ($stmt->fetch()) {
        Response::error('Dieser Benutzername ist bereits vergeben.');
    }

    $stmt = $pdo->prepare(
        'UPDATE users SET username = ?, salutation = ?,
                          address = ?, zip = ?, city = ?, email = ?
         WHERE id = ?'
    );
    $stmt->execute([
        $username, $salutation, $address, $zip, $city, $email,
        (int)$_SESSION['user_id'],
    ]);

    // Session aktualisieren, damit die Navbar-Begrüßung stimmt
    $_SESSION['username'] = $username;

    Response::success(null, 'Daten wurden gespeichert.');

} catch (Exception $e) {
    Response::error('Speichern fehlgeschlagen.', 500);
}
