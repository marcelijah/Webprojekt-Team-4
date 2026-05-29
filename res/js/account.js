// B20/B21: Mein Konto – Stammdaten + Bestellhistorie
$(document).ready(function () {
    // Bestell-Bestätigung anzeigen, wenn nach Checkout hierher geleitet
    const params = new URLSearchParams(window.location.search);
    if (params.get('bestellt')) {
        $('#bestell-erfolg').removeClass('d-none');
    }

    // Login prüfen
    apiCall('session_status.php', {}, function (success, data) {
        if (!success || !data || !data.loggedIn) {
            $('#account-container').html(
                '<div class="alert alert-warning">Bitte zuerst einloggen.</div>' +
                '<a href="login.html" class="btn btn-dark">Zum Login</a>'
            );
            return;
        }
        rendereTabs();
        ladeStammdaten();
        ladeBestellungen();
    });
});

function rendereTabs() {
    const html =
        '<ul class="nav nav-tabs mb-3" role="tablist">' +
        '  <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-daten" type="button">Stammdaten</button></li>' +
        '  <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-bestellungen" type="button">Bestellungen</button></li>' +
        '</ul>' +
        '<div class="tab-content">' +
        '  <div class="tab-pane fade show active" id="tab-daten"><div id="stammdaten-bereich"></div></div>' +
        '  <div class="tab-pane fade" id="tab-bestellungen"><div id="bestellungen-bereich"></div></div>' +
        '</div>';
    $('#account-container').html(html);
}

// ---------- B20: Stammdaten ----------
function ladeStammdaten() {
    apiCall('account_get.php', {}, function (success, data, message) {
        if (!success) {
            $('#stammdaten-bereich').html('<div class="alert alert-danger">' + message + '</div>');
            return;
        }
        rendereStammdatenFormular(data);
    });
}

function rendereStammdatenFormular(u) {
    // Username read-only anzeigen (Spec: sensible Infos nicht voll editierbar)
    const html =
        '<form id="stammdaten-form" class="card card-body">' +
        '<div class="row g-3">' +
        feld('username', 'Benutzername', u.username) +
        feld('salutation', 'Anrede', u.salutation) +
        feld('first_name', 'Vorname', u.first_name, 'text', true) +
        feld('last_name', 'Nachname', u.last_name, 'text', true) +
        feld('email', 'E-Mail', u.email, 'email') +
        feld('address', 'Adresse', u.address) +
        feld('zip', 'PLZ', u.zip) +
        feld('city', 'Ort', u.city) +
        '</div>' +
        '<hr class="my-4">' +
        '<div class="mb-3">' +
        '  <label class="form-label">Aktuelles Passwort (zur Bestätigung)</label>' +
        '  <input type="password" class="form-control" name="passwort" required>' +
        '</div>' +
        '<div id="stammdaten-fehler" class="alert alert-danger d-none"></div>' +
        '<div id="stammdaten-erfolg" class="alert alert-success d-none"></div>' +
        '<button type="submit" class="btn btn-dark"><i class="bi bi-save me-1"></i>Speichern</button>' +
        '</form>';

    $('#stammdaten-bereich').html(html);

    $('#stammdaten-form').on('submit', function (e) {
        e.preventDefault();
        speichern();
    });
}

function feld(name, label, value, typ, disabled) {
    typ = typ || 'text';
    return (
        '<div class="col-md-6">' +
        '<label class="form-label">' + label + '</label>' +
        '<input type="' + typ + '" class="form-control" name="' + name + '"' +
        ' value="' + escapeHtml(value || '') + '"' +
        (disabled ? ' disabled' : ' required') + '>' +
        '</div>'
    );
}

function speichern() {
    const $f = $('#stammdaten-form');
    const daten = {
        username:   $f.find('[name="username"]').val(),
        salutation: $f.find('[name="salutation"]').val(),
        email:      $f.find('[name="email"]').val(),
        address:    $f.find('[name="address"]').val(),
        zip:        $f.find('[name="zip"]').val(),
        city:       $f.find('[name="city"]').val(),
        passwort:   $f.find('[name="passwort"]').val(),
    };

    $('#stammdaten-fehler, #stammdaten-erfolg').addClass('d-none').text('');

    apiCall('account_update.php', daten, function (success, _data, message) {
        if (!success) {
            $('#stammdaten-fehler').removeClass('d-none').text(message);
            return;
        }
        $('#stammdaten-erfolg').removeClass('d-none').text(message);
        $f.find('[name="passwort"]').val('');
    });
}

// ---------- B21: Bestellhistorie ----------
function ladeBestellungen() {
    apiCall('orders_list.php', {}, function (success, data, message) {
        if (!success) {
            $('#bestellungen-bereich').html('<div class="alert alert-danger">' + message + '</div>');
            return;
        }
        rendereBestellungen(data);
    });
}

function rendereBestellungen(bestellungen) {
    if (!bestellungen || bestellungen.length === 0) {
        $('#bestellungen-bereich').html(
            '<div class="text-center text-secondary py-4"><p>Du hast noch keine Bestellungen.</p></div>'
        );
        return;
    }

    let html = '<div class="table-responsive"><table class="table align-middle">';
    html += '<thead><tr>';
    html += '<th>Bestell-Nr.</th><th>Datum</th><th>Artikel</th><th class="text-end">Gesamt</th>';
    html += '<th>Zahlungsart</th><th>Status</th><th></th>';
    html += '</tr></thead><tbody>';

    bestellungen.forEach(function (b) {
        const total = parseFloat(b.total).toFixed(2).replace('.', ',');
        const datum = formatDatum(b.created_at);
        html += '<tr>';
        html += '<td>#' + b.id + '</td>';
        html += '<td>' + datum + '</td>';
        html += '<td>' + b.anzahl_artikel + '</td>';
        html += '<td class="text-end">' + total + ' €</td>';
        html += '<td>' + escapeHtml(b.payment_method) + '</td>';
        html += '<td><span class="badge bg-secondary">' + escapeHtml(b.status) + '</span></td>';
        html += '<td class="text-end">' +
                '<a class="btn btn-sm btn-outline-dark" target="_blank" href="../../logic/invoice.php?id=' + b.id + '">' +
                '<i class="bi bi-receipt me-1"></i>Rechnung</a></td>';
        html += '</tr>';
    });

    html += '</tbody></table></div>';
    $('#bestellungen-bereich').html(html);
}

function formatDatum(s) {
    // Erwartetes Format: "YYYY-MM-DD HH:MM:SS"
    if (!s) return '';
    const t = s.split(' ');
    if (t.length < 2) return s;
    const d = t[0].split('-');
    return d[2] + '.' + d[1] + '.' + d[0] + ' ' + t[1].substring(0, 5);
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
}
