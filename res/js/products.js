// Geladene Produkte der aktuellen Serie – für client-seitigen Modell-Filter
let allProdukte = [];

$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    let aktiveSerie = params.get('serie') || 'iPhone 14';

    seiteTitel(aktiveSerie);
    aktiveSerieMarkieren(aktiveSerie);

    const anzahl = JSON.parse(localStorage.getItem('warenkorb') || '[]').length;
    $('#cart-count').text(anzahl);

    ladeProdukte(aktiveSerie);

    // Serien-Navigation: Kategoriewechsel per AJAX
    $('#serien-nav').on('click', '.serien-btn', function () {
        aktiveSerie = $(this).data('serie');
        aktiveSerieMarkieren(aktiveSerie);
        seiteTitel(aktiveSerie);
        history.pushState(null, '', '?serie=' + encodeURIComponent(aktiveSerie));
        ladeProdukte(aktiveSerie);
    });

    // Browser-Zurück-Button unterstützen
    window.addEventListener('popstate', function () {
        const p = new URLSearchParams(window.location.search);
        aktiveSerie = p.get('serie') || 'iPhone 14';
        aktiveSerieMarkieren(aktiveSerie);
        seiteTitel(aktiveSerie);
        ladeProdukte(aktiveSerie);
    });
});

function seiteTitel(serie) {
    const titel = serie + ' Serie';
    document.title = titel + ' – JustInCase';
    $('#serien-titel').text(titel);
    $('#breadcrumb-serie').text(titel);
}

function aktiveSerieMarkieren(serie) {
    $('.serien-btn').removeClass('btn-dark active').addClass('btn-outline-dark');
    $('.serien-btn[data-serie="' + serie + '"]').removeClass('btn-outline-dark').addClass('btn-dark active');
}

// Lädt Produkte einer Serie per AJAX – Modell-Filter danach nur client-seitig
function ladeProdukte(serie) {
    $('#filter-container').empty();
    $('#produkte-container').html(
        '<div class="col-12 text-center text-secondary py-5">' +
        '<div class="spinner-border mb-2" role="status"></div>' +
        '<p>Produkte werden geladen...</p></div>'
    );

    apiCall('get_products.php', { kategorie: serie }, function (success, data, message) {
        if (!success) {
            $('#produkte-container').html(
                '<div class="col-12"><div class="alert alert-danger">' + message + '</div></div>'
            );
            return;
        }
        if (!data || data.length === 0) {
            $('#produkte-container').html(
                '<div class="col-12 text-center text-secondary py-5"><p>Keine Produkte gefunden.</p></div>'
            );
            return;
        }

        allProdukte = data;
        renderFilterButtons(data, serie);
        renderProdukte(data);
    });
}

// Rendert Filter-Buttons und filtert danach nur client-seitig (kein AJAX)
function renderFilterButtons(alle, serie) {
    const modelle = [...new Set(alle.map(p => p.category))].sort();

    let html = '<button class="btn btn-sm filter-btn btn-dark active" data-modell="">Alle</button>';
    modelle.forEach(function (modell) {
        html += '<button class="btn btn-sm filter-btn btn-outline-dark" data-modell="' + modell + '">' + modell + '</button>';
    });

    $('#filter-container').html(html);

    // .off() verhindert Handler-Stau bei wiederholtem Rendern
    $('#filter-container').off('click').on('click', '.filter-btn', function () {
        const modell = $(this).data('modell');
        $('#filter-container .filter-btn').removeClass('btn-dark active').addClass('btn-outline-dark');
        $(this).removeClass('btn-outline-dark').addClass('btn-dark active');

        // Nur client-seitig filtern – kein neuer AJAX-Call
        const gefiltert = modell ? allProdukte.filter(p => p.category === modell) : allProdukte;
        renderProdukte(gefiltert);
    });
}

function renderProdukte(produkte) {
    if (produkte.length === 0) {
        $('#produkte-container').html(
            '<div class="col-12 text-center text-secondary py-5"><p>Keine Produkte für dieses Modell.</p></div>'
        );
        return;
    }
    let html = '';
    produkte.forEach(p => { html += produktKarte(p); });
    $('#produkte-container').html(html);
}

function produktKarte(produkt) {
    const preis = parseFloat(produkt.price).toFixed(2).replace('.', ',');
    const img = produkt.image_path || 'res/img/placeholder.jpg';

    return `
        <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="card product-card">
                <img src="../../${img}" alt="${produkt.name}"
                     onerror="this.src='../../res/img/placeholder.jpg'">
                <div class="card-body">
                    <span class="badge bg-secondary mb-1 small">${produkt.category}</span>
                    <h5 class="card-title">${produkt.name}</h5>
                    <div class="text-warning mb-2 small">
                        <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-half"></i>
                        <span class="text-muted ms-1">(4.5)</span>
                    </div>
                    <p class="price mb-3">${preis} €</p>
                    <button class="btn btn-cart btn-sm w-100"
                            onclick="zumWarenkorb(${produkt.id}, '${produkt.name.replace(/'/g, "\\'")}', ${produkt.price})">
                        <i class="bi bi-cart-plus me-1"></i>In den Warenkorb
                    </button>
                </div>
            </div>
        </div>`;
}

function zumWarenkorb(id, name, preis) {
    const warenkorb = JSON.parse(localStorage.getItem('warenkorb') || '[]');
    warenkorb.push({ id, name, preis });
    localStorage.setItem('warenkorb', JSON.stringify(warenkorb));
    $('#cart-count').text(warenkorb.length);
    alert(name + ' wurde zum Warenkorb hinzugefügt.');
}
