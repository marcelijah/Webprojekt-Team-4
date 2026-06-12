<?php
// B24/B25/B26: Produkt anlegen oder bearbeiten (inkl. optionalem Bild-Upload).
// Wird per multipart/form-data aufgerufen (wegen Datei-Upload), daher $_POST/$_FILES.
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/admin_guard.php';

session_start();

try {
    require_admin();

    // Felder einlesen und säubern
    $id          = (int)($_POST['id'] ?? 0);          // 0 = neues Produkt
    $name        = trim($_POST['name'] ?? '');
    $beschreibung = trim($_POST['description'] ?? '');
    $preisRoh    = str_replace(',', '.', trim($_POST['price'] ?? ''));
    $kategorie   = trim($_POST['category'] ?? '');
    $stock       = (int)($_POST['stock'] ?? 0);

    // Validierung (serverseitig, B09-Stil)
    if ($name === '' || $kategorie === '') {
        Response::error('Name und Kategorie sind Pflichtfelder.');
    }
    if (!is_numeric($preisRoh) || (float)$preisRoh < 0) {
        Response::error('Bitte einen gültigen Preis angeben.');
    }
    if ($stock < 0) {
        Response::error('Der Lagerbestand darf nicht negativ sein.');
    }
    $preis = (float)$preisRoh;

    $pdo = DBAccess::getInstance()->getConnection();

    // Beim Bearbeiten: vorhandenes Produkt (und bisheriges Bild) laden
    $altesBild = '';
    if ($id > 0) {
        $stmt = $pdo->prepare('SELECT image_path FROM products WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $vorhanden = $stmt->fetch();
        if (!$vorhanden) {
            Response::error('Produkt nicht gefunden.', 404);
        }
        $altesBild = $vorhanden['image_path'];
    }

    // B25: Bild-Upload verarbeiten (optional)
    $bildPfad = $altesBild;
    if (!empty($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
        $bildPfad = bildHochladen($_FILES['image']);
    }
    // Neues Produkt ohne Bild -> Platzhalter
    if ($bildPfad === '') {
        $bildPfad = 'productpictures/placeholder.jpg';
    }

    if ($id > 0) {
        // B26: Bearbeiten
        $stmt = $pdo->prepare(
            'UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, image_path = ?
             WHERE id = ?'
        );
        $stmt->execute([$name, $beschreibung, $preis, $kategorie, $stock, $bildPfad, $id]);
        Response::success(['id' => $id], 'Produkt wurde aktualisiert.');
    } else {
        // B24: Anlegen
        $stmt = $pdo->prepare(
            'INSERT INTO products (name, description, price, category, image_path, stock)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([$name, $beschreibung, $preis, $kategorie, $bildPfad, $stock]);
        Response::success(['id' => (int)$pdo->lastInsertId()], 'Produkt wurde angelegt.');
    }

} catch (RuntimeException $e) {
    // Eigene, sprechende Upload-Fehler an das Frontend weitergeben
    Response::error($e->getMessage());
} catch (Exception $e) {
    Response::error('Produkt konnte nicht gespeichert werden.', 500);
}

/**
 * B25: Lädt ein Produktbild hoch, prüft es und gibt den relativen Pfad zurück.
 * Wirft eine RuntimeException mit verständlicher Meldung bei Problemen.
 */
function bildHochladen(array $datei): string {
    if ($datei['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Das Bild konnte nicht hochgeladen werden.');
    }
    // Maximal 5 MB
    if ($datei['size'] > 5 * 1024 * 1024) {
        throw new RuntimeException('Das Bild ist zu groß (max. 5 MB).');
    }

    // Echten Bildtyp prüfen (nicht nur die Endung)
    $info = getimagesize($datei['tmp_name']);
    if ($info === false) {
        throw new RuntimeException('Die Datei ist kein gültiges Bild.');
    }
    $erlaubt = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];
    $mime = $info['mime'];
    if (!isset($erlaubt[$mime])) {
        throw new RuntimeException('Nur JPG, PNG, WEBP oder GIF sind erlaubt.');
    }

    // Eindeutigen, sicheren Dateinamen erzeugen
    $endung = $erlaubt[$mime];
    $dateiname = 'produkt_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $endung;

    $zielordner = __DIR__ . '/../productpictures/';
    if (!is_dir($zielordner)) {
        mkdir($zielordner, 0775, true);
    }
    $ziel = $zielordner . $dateiname;

    if (!move_uploaded_file($datei['tmp_name'], $ziel)) {
        throw new RuntimeException('Das Bild konnte nicht gespeichert werden.');
    }

    // Pfad relativ zum Projekt-Root (wie bei den übrigen Produkten)
    return 'productpictures/' . $dateiname;
}
