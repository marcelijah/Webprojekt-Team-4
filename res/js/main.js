$(document).ready(function () {
    // Warenkorb-Badge aus localStorage aktualisieren
    const anzahl = JSON.parse(localStorage.getItem('warenkorb') || '[]').length;
    $('#cart-count').text(anzahl);
});
