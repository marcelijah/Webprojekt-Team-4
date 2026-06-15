//Produkte anlegen, bearbeiten, löschen und Bild upload

let alleProdukte = [];   // zwischengespeicherte Produktliste für "Bearbeiten"

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
        rendereLayout();
        ladeProdukte();
    });
});

function zeigeSperre(text, href, linkText) {
    $('#admin-container').html(
        '<div class="alert alert-warning">' + escapeHtml(text) + '</div>' +
        '<a href="' + href + '" class="btn btn-dark">' + escapeHtml(linkText) + '</a>'
    );
}

// Grundgerüst: Formular-Karte + Produktliste
function rendereLayout() {
    const html =
        '<div class="card card-body mb-4">' +
        '  <h5 id="form-titel" class="mb-3">Neues Produkt anlegen</h5>' +
        '  <form id="produkt-form">' +
        '    <input type="hidden" name="id" value="">' +
        '    <div class="row g-3">' +
        '      <div class="col-md-6">' +
        '        <label class="form-label">Name *</label>' +
        '        <input type="text" class="form-control" name="name" required>' +
        '      </div>' +
        '      <div class="col-md-6">' +
        '        <label class="form-label">Kategorie *</label>' +
        '        <input type="text" class="form-control" name="category" list="kategorie-liste" required>' +
        '        <datalist id="kategorie-liste">' +
        '          <option value="iPhone 14"></option><option value="iPhone 14 Plus"></option>' +
        '          <option value="iPhone 14 Pro"></option><option value="iPhone 14 Pro Max"></option>' +
        '          <option value="iPhone 15"></option><option value="iPhone 15 Plus"></option>' +
        '          <option value="iPhone 15 Pro"></option><option value="iPhone 15 Pro Max"></option>' +
        '          <option value="iPhone 16"></option><option value="iPhone 16 Plus"></option>' +
        '          <option value="iPhone 16 Pro"></option><option value="iPhone 16 Pro Max"></option>' +
        '          <option value="iPhone 17"></option><option value="iPhone 17 Air"></option>' +
        '          <option value="iPhone 17 Pro"></option><option value="iPhone 17 Pro Max"></option>' +
        '        </datalist>' +
        '      </div>' +
        '      <div class="col-md-3">' +
        '        <label class="form-label">Preis (€) *</label>' +
        '        <input type="number" step="0.01" min="0" class="form-control" name="price" required>' +
        '      </div>' +
        '      <div class="col-md-3">' +
        '        <label class="form-label">Lagerbestand</label>' +
        '        <input type="number" min="0" class="form-control" name="stock" value="0">' +
        '      </div>' +
        '      <div class="col-md-6">' +
        '        <label class="form-label">Produktbild</label>' +
        '        <input type="file" class="form-control" name="image" accept="image/*">' +
        '        <div class="form-text">JPG, PNG, WEBP oder GIF (max. 5 MB). Beim Bearbeiten optional.</div>' +
        '      </div>' +
        '    </div>' +
        '    <div id="form-fehler" class="alert alert-danger d-none mt-3"></div>' +
        '    <div id="form-erfolg" class="alert alert-success d-none mt-3"></div>' +
        '    <div class="mt-3">' +
        '      <button type="submit" class="btn btn-dark"><i class="bi bi-save me-1"></i>Speichern</button>' +
        '      <button type="button" id="abbrechen-btn" class="btn btn-outline-secondary d-none">Abbrechen</button>' +
        '    </div>' +
        '  </form>' +
        '</div>' +
        '<div id="produkt-liste"></div>';

    $('#admin-container').html(html);

    $('#produkt-form').on('submit', function (e) {
        e.preventDefault();
        speichereProdukt();
    });
    $('#abbrechen-btn').on('click', formularZuruecksetzen);
}

// B24/B25/B26: Produkt speichern (Anlegen oder Bearbeiten) per FormData (wegen Bild-Upload)
function speichereProdukt() {
    $('#form-fehler, #form-erfolg').addClass('d-none').text('');

    const formular = document.getElementById('produkt-form');
    const daten = new FormData(formular);

    $.ajax({
        url: (window.API_BASE_URL || 'logic/') + 'admin_product_save.php',
        type: 'POST',
        data: daten,
        processData: false,   // FormData nicht in Query-String umwandeln
        contentType: false,   // Browser setzt multipart/form-data inkl. boundary selbst
        dataType: 'json',
        success: function (response) {
            if (!response.success) {
                $('#form-fehler').removeClass('d-none').text(response.message);
                return;
            }
            $('#form-erfolg').removeClass('d-none').text(response.message);
            formularZuruecksetzen();
            ladeProdukte();
        },
        error: function (xhr) {
            const msg = (xhr.responseJSON && xhr.responseJSON.message) || 'Speichern fehlgeschlagen.';
            $('#form-fehler').removeClass('d-none').text(msg);
        }
    });
}

function formularZuruecksetzen() {
    const f = document.getElementById('produkt-form');
    f.reset();
    $(f).find('[name="id"]').val('');
    $('#form-titel').text('Neues Produkt anlegen');
    $('#abbrechen-btn').addClass('d-none');
    $('#form-fehler, #form-erfolg').addClass('d-none').text('');
}

// B26: Produktliste laden und anzeigen
function ladeProdukte() {
    apiCall('admin_products_list.php', {}, function (success, data, message) {
        if (!success) {
            $('#produkt-liste').html('<div class="alert alert-danger">' + escapeHtml(message) + '</div>');
            return;
        }
        alleProdukte = data || [];
        rendereProdukte(alleProdukte);
    });
}

function rendereProdukte(produkte) {
    if (!produkte || produkte.length === 0) {
        $('#produkt-liste').html('<div class="text-center text-secondary py-4">Noch keine Produkte vorhanden.</div>');
        return;
    }

    let html = '<div class="table-responsive"><table class="table align-middle">';
    html += '<thead><tr><th>Bild</th><th>Name</th><th>Kategorie</th>';
    html += '<th class="text-end">Preis</th><th class="text-end">Bestand</th><th></th></tr></thead><tbody>';

    produkte.forEach(function (p) {
        const bild = p.image_path || 'productpictures/placeholder.jpg';
        const preis = parseFloat(p.price).toFixed(2).replace('.', ',');
        html += '<tr>';
        html += '<td><img src="../../' + escapeHtml(bild) + '" alt="' + escapeHtml(p.name) + '"' +
                ' style="width:48px;height:48px;object-fit:contain;"' +
                ' onerror="this.src=\'../../productpictures/placeholder.jpg\'"></td>';
        html += '<td>' + escapeHtml(p.name) + '</td>';
        html += '<td>' + escapeHtml(p.category) + '</td>';
        html += '<td class="text-end">' + preis + ' €</td>';
        html += '<td class="text-end">' + parseInt(p.stock, 10) + '</td>';
        html += '<td class="text-end text-nowrap">' +
                '<button class="btn btn-sm btn-outline-dark me-1" onclick="bearbeiteProdukt(' + p.id + ')">' +
                '<i class="bi bi-pencil"></i></button>' +
                '<button class="btn btn-sm btn-outline-danger" onclick="loescheProdukt(' + p.id + ')">' +
                '<i class="bi bi-trash"></i></button></td>';
        html += '</tr>';
    });

    html += '</tbody></table></div>';
    $('#produkt-liste').html(html);
}

// B26: Produkt zum Bearbeiten ins Formular laden
function bearbeiteProdukt(id) {
    const p = alleProdukte.find(function (x) { return parseInt(x.id, 10) === id; });
    if (!p) return;

    const $f = $('#produkt-form');
    $f.find('[name="id"]').val(p.id);
    $f.find('[name="name"]').val(p.name);
    $f.find('[name="category"]').val(p.category);
    $f.find('[name="price"]').val(p.price);
    $f.find('[name="stock"]').val(p.stock);
    $f.find('[name="image"]').val('');   // vorhandenes Bild bleibt, falls keins neu gewählt wird

    $('#form-titel').text('Produkt bearbeiten: ' + p.name);
    $('#abbrechen-btn').removeClass('d-none');
    $('#form-fehler, #form-erfolg').addClass('d-none').text('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// B26: Produkt löschen
function loescheProdukt(id) {
    if (!confirm('Dieses Produkt wirklich löschen?')) return;

    apiCall('admin_product_delete.php', { id: id }, function (success, _data, message) {
        if (!success) {
            alert(message);
            return;
        }
        ladeProdukte();
    });
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
}
