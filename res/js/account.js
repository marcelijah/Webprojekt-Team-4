// B20: Mein Konto – Stammdaten anzeigen und ändern
$(document).ready(function () {
    // Login prüfen
    apiCall('session_status.php', {}, function (success, data) {
        if (!success || !data || !data.loggedIn) {
            $('#account-container').html(
                '<div class="alert alert-warning">Bitte zuerst einloggen.</div>' +
                '<a href="login.html" class="btn btn-dark">Zum Login</a>'
            );
            return;
        }
        ladeStammdaten();
    });
});

// ---------- B20: Stammdaten ----------
function ladeStammdaten() {
    apiCall('account_get.php', {}, function (success, data, message) {
        if (!success) {
            $('#account-container').html('<div class="alert alert-danger">' + message + '</div>');
            return;
        }
        rendereStammdatenFormular(data);
    });
}

function rendereStammdatenFormular(u) {
    // Benutzername editierbar, Vor-/Nachname schreibgeschützt
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

    $('#account-container').html(html);

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

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
}
