// B27/B28: Kundenverwaltung im Admin-Bereich
// (Kundenliste, Bestelldetails ansehen, Accounts aktivieren/deaktivieren)

let alleKunden = [];
let aktuelleKundenId = 0;   // gemerkt, um das Bestell-Modal nach Status-Änderung neu zu laden

$(document).ready(function () {
    // Nur Admins dürfen diese Seite nutzen
    apiCall('session_status.php', {}, function (success, data) {
        if (!success || !data || !data.loggedIn) {
            zeigeSperre('Bitte zuerst einloggen.', 'login.html', 'Zum Login');
            return;
        }
        if (!data.isAdmin) {
            zeigeSperre('Kein Zugriff – dieser Bereich ist nur für Administratoren.',
                        '../../index.html', 'Zur Startseite');
            return;
        }
        ladeKunden();
    });
});

function zeigeSperre(text, href, linkText) {
    $('#kunden-container').html(
        '<div class="alert alert-warning">' + escapeHtml(text) + '</div>' +
        '<a href="' + href + '" class="btn btn-dark">' + escapeHtml(linkText) + '</a>'
    );
}

// B27: Kundenliste laden
function ladeKunden() {
    apiCall('admin_customers_list.php', {}, function (success, data, message) {
        if (!success) {
            $('#kunden-container').html('<div class="alert alert-danger">' + escapeHtml(message) + '</div>');
            return;
        }
        alleKunden = data || [];
        rendereKunden(alleKunden);
    });
}

function rendereKunden(kunden) {
    if (!kunden || kunden.length === 0) {
        $('#kunden-container').html('<div class="text-center text-secondary py-4">Noch keine Kunden vorhanden.</div>');
        return;
    }

    let html = '<div class="table-responsive"><table class="table align-middle">';
    html += '<thead><tr><th>Name</th><th>Benutzername</th><th>E-Mail</th><th>Ort</th>';
    html += '<th class="text-end">Bestellungen</th><th>Status</th><th></th></tr></thead><tbody>';

    kunden.forEach(function (k) {
        const aktiv = parseInt(k.is_active, 10) === 1;
        const statusBadge = aktiv
            ? '<span class="badge bg-success">aktiv</span>'
            : '<span class="badge bg-secondary">deaktiviert</span>';
        const toggleBtn = aktiv
            ? '<button class="btn btn-sm btn-outline-danger" onclick="schalteKunde(' + k.id + ')">' +
              '<i class="bi bi-person-x me-1"></i>Deaktivieren</button>'
            : '<button class="btn btn-sm btn-outline-success" onclick="schalteKunde(' + k.id + ')">' +
              '<i class="bi bi-person-check me-1"></i>Aktivieren</button>';

        html += '<tr>';
        html += '<td>' + escapeHtml((k.first_name || '') + ' ' + (k.last_name || '')) + '</td>';
        html += '<td>' + escapeHtml(k.username) + '</td>';
        html += '<td>' + escapeHtml(k.email) + '</td>';
        html += '<td>' + escapeHtml(k.city || '') + '</td>';
        html += '<td class="text-end">' +
                '<button class="btn btn-sm btn-link p-0" onclick="zeigeBestellungen(' + k.id + ')">' +
                parseInt(k.anzahl_bestellungen, 10) + ' ansehen</button></td>';
        html += '<td>' + statusBadge + '</td>';
        html += '<td class="text-end">' + toggleBtn + '</td>';
        html += '</tr>';
    });

    html += '</tbody></table></div>';
    $('#kunden-container').html(html);
}

// B27: Bestelldetails eines Kunden im Modal anzeigen
function zeigeBestellungen(kundenId) {
    aktuelleKundenId = kundenId;
    const kunde = alleKunden.find(function (k) { return parseInt(k.id, 10) === kundenId; });
    const name = kunde ? (kunde.first_name + ' ' + kunde.last_name) : '';
    $('#bestell-modal-titel').text('Bestellungen von ' + name);
    $('#bestell-modal-body').html(
        '<div class="text-center text-secondary py-3"><div class="spinner-border"></div></div>'
    );

    const modal = new bootstrap.Modal(document.getElementById('bestell-modal'));
    modal.show();   // Modal nur einmal öffnen

    ladeBestellungen(kundenId);
}

// Bestelldaten laden und in den Modal-Body rendern (ohne das Modal erneut zu öffnen).
// Getrennt von zeigeBestellungen(), damit ein Refresh nach dem Umschalten keinen
// zusätzlichen Bootstrap-Backdrop stapelt.
function ladeBestellungen(kundenId) {
    apiCall('admin_customer_orders.php', { user_id: kundenId }, function (success, data, message) {
        if (!success) {
            $('#bestell-modal-body').html('<div class="alert alert-danger">' + escapeHtml(message) + '</div>');
            return;
        }
        rendereBestellungen(data);
    });
}

function rendereBestellungen(bestellungen) {
    if (!bestellungen || bestellungen.length === 0) {
        $('#bestell-modal-body').html('<p class="text-secondary mb-0">Dieser Kunde hat noch keine Bestellungen.</p>');
        return;
    }

    let html = '';
    bestellungen.forEach(function (b) {
        const total = parseFloat(b.total).toFixed(2).replace('.', ',');
        html += '<div class="card mb-3"><div class="card-body">';
        html += '<div class="d-flex justify-content-between mb-2">';
        html += '<strong>Bestellung #' + b.id + '</strong>';
        html += '<span class="text-secondary">' + escapeHtml(formatDatum(b.created_at)) + '</span>';
        html += '</div>';
        const badgeClass = b.status === 'done' ? 'bg-success' : 'bg-secondary';
        const toggleLabel = b.status === 'done' ? 'Auf offen setzen' : 'Als done markieren';
        html += '<div class="d-flex justify-content-between align-items-center mb-2">';
        html += '<div><span class="badge ' + badgeClass + ' me-1">' + escapeHtml(b.status) + '</span>';
        html += 'Zahlungsart: ' + escapeHtml(b.payment_method) + '</div>';
        html += '<button class="btn btn-sm btn-outline-dark" onclick="schalteBestellung(' + b.id + ')">' +
                escapeHtml(toggleLabel) + '</button>';
        html += '</div>';

        html += '<table class="table table-sm mb-2"><tbody>';
        (b.positionen || []).forEach(function (pos) {
            const preis = parseFloat(pos.price).toFixed(2).replace('.', ',');
            html += '<tr><td>' + escapeHtml(pos.name || '(gelöschtes Produkt)') + '</td>';
            html += '<td class="text-end">' + parseInt(pos.quantity, 10) + ' ×</td>';
            html += '<td class="text-end">' + preis + ' €</td></tr>';
        });
        html += '</tbody></table>';

        html += '<div class="text-end fw-bold">Gesamt: ' + total + ' €</div>';
        html += '</div></div>';
    });

    $('#bestell-modal-body').html(html);
}

// B28: Account aktivieren/deaktivieren
function schalteKunde(kundenId) {
    if (!confirm('Status dieses Kunden-Accounts wirklich ändern?')) return;

    apiCall('admin_customer_toggle.php', { user_id: kundenId }, function (success, _data, message) {
        if (!success) {
            alert(message);
            return;
        }
        ladeKunden();   // Liste neu laden, damit Status/Button stimmen
    });
}

// Bestellstatus umschalten (pending <-> done) und Modal neu laden
function schalteBestellung(orderId) {
    apiCall('admin_order_status.php', { order_id: orderId }, function (success, _data, message) {
        if (!success) {
            alert(message);
            return;
        }
        ladeBestellungen(aktuelleKundenId);   // nur Modal-Inhalt neu rendern, Modal bleibt offen (kein neuer Backdrop)
    });
}

function formatDatum(s) {
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
