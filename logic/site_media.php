<?php
// Liefert die dynamischen Pfade fuer Homepage-Video und
// Seiten-Hintergrundbild aus der Tabelle site_media (analog zu products.image_path).
// Damit lassen sich die Medien tauschen, ohne HTML/CSS anzufassen.
require_once __DIR__ . '/../config/dbaccess.php';
require_once __DIR__ . '/response.php';

try {
    $pdo = DBAccess::getInstance()->getConnection();
    $stmt = $pdo->query('SELECT media_key, path FROM site_media');

    // In ein einfaches Key-Value-Objekt umformen (zb {home_video: "..."})
    $medien = [];
    foreach ($stmt->fetchAll() as $eintrag) {
        $medien[$eintrag['media_key']] = $eintrag['path'];
    }

    Response::success($medien);

} catch (Exception $e) {
    Response::error('Medienpfade konnten nicht geladen werden.', 500);
}
