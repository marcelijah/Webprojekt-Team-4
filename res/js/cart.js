// B17: Warenkorb-Ansicht – Positionen anzeigen, Menge ändern, Position entfernen
$(document).ready(function () {
    warenkorbLaden();

    // Event-Delegation für dynamisch erzeugte Buttons
    $('#warenkorb-container').on('click', '.btn-menge-plus', function () {
        const id = parseInt($(this).data('id'));
        const aktuell = parseInt($(this).closest('tr').find('.menge-anzeige').text());
        mengeAendern(id, aktuell + 1);
    });

    $('#warenkorb-container').on('click', '.btn-menge-minus', function () {
        const id = parseInt($(this).data('id'));
        const aktuell = parseInt($(this).closest('tr').find('.menge-anzeige').text());
        if (aktuell > 1) {
            mengeAendern(id, aktuell - 1);
        }
    });

    $('#warenkorb-container').on('click', '.btn-entfernen', function () {
        const id = parseInt($(this).data('id'));
        apiCall('cart_remove.php', { produkt_id: id }, function (success, _data, message) {
            if (!success) {
                alert(message);
                return;
            }
            warenkorbLaden();
        });
    });
});

function warenkorbLaden() {
    apiCall('cart_get.php', {}, function (success, data, message) {
        if (!success) {
            $('#warenkorb-container').html(
                '<div class="alert alert-danger">' + message + '</div>'
            );
            return;
        }
        rendere(data);
        $('#cart-count').text(data.anzahl);
    });
}

function mengeAendern(produktId, neueMenge) {
    apiCall('cart_update.php', { produkt_id: produktId, menge: neueMenge }, function (success, _data, message) {
        if (!success) {
            alert(message);
            return;
        }
        warenkorbLaden();
    });
}

function rendere(data) {
    if (!data.positionen || data.positionen.length === 0) {
        $('#warenkorb-container').html(
            '<div class="text-center text-secondary py-5">' +
            '<i class="bi bi-cart-x fs-1 mb-2"></i>' +
            '<p>Dein Warenkorb ist leer.</p>' +
            '<a href="../../index.html" class="btn btn-dark mt-2">Weiter einkaufen</a>' +
            '</div>'
        );
        return;
    }

    let html = '<div class="table-responsive"><table class="table align-middle">';
    html += '<thead><tr>';
    html += '<th>Produkt</th><th class="text-end">Preis</th>';
    html += '<th class="text-center">Menge</th>';
    html += '<th class="text-end">Zwischensumme</th>';
    html += '<th></th></tr></thead><tbody>';

    data.positionen.forEach(function (p) {
        const preis = p.preis.toFixed(2).replace('.', ',');
        const zwischen = p.zwischensumme.toFixed(2).replace('.', ',');
        const img = p.image_path || 'productpictures/placeholder.jpg';
        html += '<tr>';
        html += '<td>';
        html += '  <div class="d-flex align-items-center gap-3">';
        html += '    <img src="../../' + escapeHtml(img) + '" alt="' + escapeHtml(p.name) + '"';
        html += '         class="rounded border bg-white p-1"';
        html += '         style="width:72px;height:72px;object-fit:contain;"';
        html += '         onerror="this.src=\'../../productpictures/placeholder.jpg\'">';
        html += '    <span>' + escapeHtml(p.name) + '</span>';
        html += '  </div>';
        html += '</td>';
        html += '<td class="text-end">' + preis + ' €</td>';
        html += '<td class="text-center">';
        html += '  <button class="btn btn-sm btn-outline-dark btn-menge-minus" data-id="' + p.produkt_id + '">−</button>';
        html += '  <span class="menge-anzeige mx-2">' + p.menge + '</span>';
        html += '  <button class="btn btn-sm btn-outline-dark btn-menge-plus" data-id="' + p.produkt_id + '">+</button>';
        html += '</td>';
        html += '<td class="text-end fw-bold">' + zwischen + ' €</td>';
        html += '<td class="text-end">';
        html += '  <button class="btn btn-sm btn-outline-danger btn-entfernen" data-id="' + p.produkt_id + '" title="Entfernen">';
        html += '    <i class="bi bi-trash"></i></button>';
        html += '</td>';
        html += '</tr>';
    });

    const gesamt = data.gesamt.toFixed(2).replace('.', ',');
    html += '</tbody><tfoot><tr>';
    html += '<th colspan="3" class="text-end">Gesamtsumme:</th>';
    html += '<th class="text-end fs-5">' + gesamt + ' €</th>';
    html += '<th></th></tr></tfoot></table></div>';

    html += '<div class="d-flex justify-content-between mt-3">';
    html += '<a href="../../index.html" class="btn btn-outline-dark"><i class="bi bi-arrow-left me-1"></i>Weiter einkaufen</a>';
    html += '<a href="checkout.html" class="btn btn-dark">Zur Kasse<i class="bi bi-arrow-right ms-1"></i></a>';
    html += '</div>';

    $('#warenkorb-container').html(html);
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
}
