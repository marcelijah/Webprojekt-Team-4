// B16: Holt die aktuelle Warenkorb-Anzahl per AJAX und zeigt sie im #cart-count Badge
$(document).ready(function () {
    if ($('#cart-count').length === 0) return;
    apiCall('cart_count.php', {}, function (success, data) {
        if (success && data) {
            $('#cart-count').text(data.anzahl);
        }
    });
});
