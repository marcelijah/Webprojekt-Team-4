<?php
// Registrierungs-Endpoint (B08, B09)
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $salutation = trim($input['salutation'] ?? '');
    $firstName  = trim($input['first_name'] ?? '');
    $lastName   = trim($input['last_name']  ?? '');
    $address    = trim($input['address']    ?? '');
    $zip        = trim($input['zip']        ?? '');
    $city       = trim($input['city']       ?? '');
    $email      = trim($input['email']      ?? '');
    $username   = trim($input['username']   ?? '');
    $password   = (string)($input['password'] ?? '');

    // Pflichtfelder prüfen
    if ($salutation === '' || $firstName === '' || $lastName === '' || $address === ''
        || $zip === '' || $city === '' || $email === '' || $username === '' || $password === '') {
        Response::error('Bitte alle Pflichtfelder ausfüllen.');
    }

    $pdo = DBAccess::getInstance()->getConnection();

    // Username/Email-Eindeutigkeit prüfen
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        Response::error('Username oder E-Mail bereits vergeben.');
    }

    // Passwort verschlüsseln und User anlegen
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare(
        'INSERT INTO users (salutation, first_name, last_name, address, zip, city, email, username, password_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([$salutation, $firstName, $lastName, $address, $zip, $city, $email, $username, $hash]);

    Response::success(null, 'Registrierung erfolgreich.');

} catch (Exception $e) {
    Response::error('Registrierung fehlgeschlagen.', 500);
}
