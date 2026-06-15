<?php
// B22: Druckbare Rechnung in einem neuen Fenster (HTML statt JSON)
require_once __DIR__ . '/../config/dbaccess.php';

session_start();

// Hilfsfunktion zum sicheren Ausgeben
function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo 'Bitte zuerst einloggen.';
    exit;
}

$bestellId = (int)($_GET['id'] ?? 0);
if ($bestellId <= 0) {
    http_response_code(400);
    echo 'Ungültige Bestell-ID.';
    exit;
}

try {
    $pdo = DBAccess::getInstance()->getConnection();

    // Bestellung + zugehöriger User – User-ID muss mit Session übereinstimmen (Schutz!)
    $stmt = $pdo->prepare(
        'SELECT o.id, o.total, o.payment_method, o.status, o.created_at,
                u.salutation, u.first_name, u.last_name, u.address, u.zip, u.city, u.email
         FROM orders o
         INNER JOIN users u ON u.id = o.user_id
         WHERE o.id = ? AND o.user_id = ? LIMIT 1'
    );
    $stmt->execute([$bestellId, (int)$_SESSION['user_id']]);
    $b = $stmt->fetch();

    if (!$b) {
        http_response_code(404);
        echo 'Bestellung nicht gefunden.';
        exit;
    }

    // Positionen laden
    $stmt = $pdo->prepare(
        'SELECT oi.quantity, oi.price, p.name, p.image_path
         FROM order_items oi
         INNER JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?'
    );
    $stmt->execute([$bestellId]);
    $positionen = $stmt->fetchAll();

    // Rechnungsnummer aus Bestell-ID + Jahr generieren
    $rechnungsNr = date('Y', strtotime($b['created_at'])) . '-' . str_pad((string)$b['id'], 5, '0', STR_PAD_LEFT);

} catch (Exception $e) {
    http_response_code(500);
    echo 'Rechnung konnte nicht erstellt werden.';
    exit;
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Rechnung <?= h($rechnungsNr) ?> – JustInCase</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: #fff; }
        .invoice { max-width: 800px; margin: 30px auto; padding: 30px; }
        .firma h1 { font-weight: 700; }
        @media print {
            .no-print { display: none !important; }
            .invoice { margin: 0; padding: 0; }
        }
    </style>
</head>
<body>
<div class="invoice">

    <div class="d-flex justify-content-between align-items-start mb-4">
        <div class="firma">
            <h1 class="mb-0">JustInCase</h1>
            <p class="text-muted small mb-0">Premium Handyhüllen<br>Höchstädtplatz 6, 1200 Wien</p>
        </div>
        <div class="text-end">
            <h3 class="mb-0">Rechnung</h3>
            <p class="text-muted small mb-0">
                Nr.: <strong><?= h($rechnungsNr) ?></strong><br>
                Datum: <?= h(date('d.m.Y', strtotime($b['created_at']))) ?>
            </p>
        </div>
    </div>

    <hr>

    <div class="row mb-4">
        <div class="col-6">
            <h6 class="text-muted">Rechnungsadresse:</h6>
            <p class="mb-0">
                <?= h($b['salutation']) ?> <?= h($b['first_name']) ?> <?= h($b['last_name']) ?><br>
                <?= h($b['address']) ?><br>
                <?= h($b['zip']) ?> <?= h($b['city']) ?><br>
                <?= h($b['email']) ?>
            </p>
        </div>
        <div class="col-6 text-end">
            <h6 class="text-muted">Zahlungsart:</h6>
            <p class="mb-0"><?= h(ucfirst($b['payment_method'])) ?></p>
        </div>
    </div>

    <table class="table align-middle">
        <thead class="table-light">
            <tr>
                <th>Pos.</th>
                <th></th>
                <th>Artikel</th>
                <th class="text-end">Menge</th>
                <th class="text-end">Einzelpreis</th>
                <th class="text-end">Summe</th>
            </tr>
        </thead>
        <tbody>
            <?php $pos = 1; foreach ($positionen as $p): ?>
                <?php
                    $summe = (float)$p['price'] * (int)$p['quantity'];
                    $img = $p['image_path'] !== '' ? $p['image_path'] : 'productpictures/placeholder.jpg';
                ?>
                <tr>
                    <td><?= $pos++ ?></td>
                    <td>
                        <img src="../<?= h($img) ?>" alt=""
                             class="rounded border bg-white p-1"
                             style="width:60px;height:60px;object-fit:contain;"
                             onerror="this.src='../productpictures/placeholder.jpg'">
                    </td>
                    <td><?= h($p['name']) ?></td>
                    <td class="text-end"><?= (int)$p['quantity'] ?></td>
                    <td class="text-end"><?= number_format((float)$p['price'], 2, ',', '.') ?> €</td>
                    <td class="text-end"><?= number_format($summe, 2, ',', '.') ?> €</td>
                </tr>
            <?php endforeach; ?>
        </tbody>
        <tfoot>
            <tr>
                <th colspan="5" class="text-end">Gesamtsumme:</th>
                <th class="text-end fs-5"><?= number_format((float)$b['total'], 2, ',', '.') ?> €</th>
            </tr>
        </tfoot>
    </table>

    <p class="text-muted small mt-4">
        Vielen Dank für deinen Einkauf bei JustInCase!
    </p>

    <div class="no-print text-center mt-4">
        <button onclick="window.print()" class="btn btn-dark">
            <i class="bi bi-printer me-1"></i>Drucken
        </button>
    </div>

</div>
</body>
</html>
