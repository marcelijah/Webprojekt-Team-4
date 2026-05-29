// B18/B19: Checkout-Maske – Login prüfen, Bestellung absenden
$(document).ready(function () {
    // Zuerst Login-Status prüfen (Bestellung nur für angemeldete User)
    apiCall('session_status.php', {}, function (success, data) {
        if (!success || !data || !data.loggedIn) {
            zeigeLoginHinweis();
            return;
        }
        ladeWarenkorb();
    });
});

function zeigeLoginHinweis() {
    $('#checkout-container').html(
        '<div class="alert alert-warning">' +
        '<i class="bi bi-exclamation-triangle me-2"></i>' +
        'Für eine Bestellung musst du eingeloggt sein.' +
        '</div>' +
        '<a href="login.html" class="btn btn-dark">Zum Login</a>'
    );
}

function ladeWarenkorb() {
    apiCall('cart_get.php', {}, function (success, data, message) {
        if (!success) {
            $('#checkout-container').html('<div class="alert alert-danger">' + message + '</div>');
            return;
        }
        if (!data.positionen || data.positionen.length === 0) {
            $('#checkout-container').html(
                '<div class="alert alert-info">Dein Warenkorb ist leer.</div>' +
                '<a href="../../index.html" class="btn btn-dark">Weiter einkaufen</a>'
            );
            return;
        }
        rendereCheckout(data);
    });
}

function rendereCheckout(data) {
    let html = '<div class="row g-4">';

    // Linke Spalte: Bestellübersicht
    html += '<div class="col-md-7"><div class="card"><div class="card-body">';
    html += '<h5 class="card-title">Bestellübersicht</h5>';
    html += '<ul class="list-group list-group-flush mb-3">';
    data.positionen.forEach(function (p) {
        const zwischen = p.zwischensumme.toFixed(2).replace('.', ',');
        const img = p.image_path || 'productpictures/placeholder.jpg';
        html += '<li class="list-group-item d-flex justify-content-between align-items-center">';
        html += '<span class="d-flex align-items-center gap-2">';
        html += '  <img src="../../' + escapeHtml(img) + '" alt=""';
        html += '       class="rounded border bg-white p-1"';
        html += '       style="width:48px;height:48px;object-fit:contain;"';
        html += '       onerror="this.src=\'../../productpictures/placeholder.jpg\'">';
        html += '  <span>' + escapeHtml(p.name) + ' <span class="text-muted">× ' + p.menge + '</span></span>';
        html += '</span>';
        html += '<span>' + zwischen + ' €</span>';
        html += '</li>';
    });
    html += '</ul>';
    const gesamt = data.gesamt.toFixed(2).replace('.', ',');
    html += '<div class="d-flex justify-content-between fs-5"><strong>Gesamt:</strong><strong>' + gesamt + ' €</strong></div>';
    html += '</div></div></div>';

    // Rechte Spalte: Zahlungsart wählen
    html += '<div class="col-md-5"><div class="card"><div class="card-body">';
    html += '<h5 class="card-title">Zahlungsart</h5>';
    html += '<form id="checkout-form">';
    html += zahlungOption('kreditkarte', 'Kreditkarte', 'bi-credit-card-2-front', true);
    html += zahlungOption('paypal',      'PayPal',      'bi-paypal',              false);
    html += zahlungOption('rechnung',    'Auf Rechnung','bi-receipt',             false);
    html += zahlungOption('vorkasse',    'Vorkasse',    'bi-bank',                false);
    html += '<div id="checkout-fehler" class="alert alert-danger mt-3 d-none"></div>';
    html += '<button type="submit" class="btn btn-dark w-100 mt-3" id="btn-bestellen">';
    html += '<i class="bi bi-check2-circle me-1"></i>Jetzt bestellen</button>';
    html += '</form>';
    html += '</div></div></div>';

    html += '</div>';

    $('#checkout-container').html(html);

    $('#checkout-form').on('submit', function (e) {
        e.preventDefault();
        bestellungAbsenden();
    });
}

function zahlungOption(wert, label, icon, checked) {
    return (
        '<div class="form-check mb-2">' +
        '<input class="form-check-input" type="radio" name="zahlung" id="zahlung-' + wert + '"' +
        ' value="' + wert + '"' + (checked ? ' checked' : '') + ' required>' +
        '<label class="form-check-label" for="zahlung-' + wert + '">' +
        '<i class="bi ' + icon + ' me-1"></i>' + label +
        '</label></div>'
    );
}

function bestellungAbsenden() {
    const zahlung = $('input[name="zahlung"]:checked').val();
    const $fehler = $('#checkout-fehler');
    $fehler.addClass('d-none').text('');

    if (!zahlung) {
        $fehler.removeClass('d-none').text('Bitte Zahlungsart auswählen.');
        return;
    }

    const $btn = $('#btn-bestellen');
    $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Bestellung wird gesendet...');

    apiCall('checkout.php', { zahlungsart: zahlung }, function (success, data, message) {
        if (!success) {
            $fehler.removeClass('d-none').text(message);
            $btn.prop('disabled', false).html('<i class="bi bi-check2-circle me-1"></i>Jetzt bestellen');
            return;
        }
        // Bei Erfolg auf Bestätigungsseite leiten
        window.location.href = 'account.html?bestellt=' + data.bestell_id;
    });
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
}
