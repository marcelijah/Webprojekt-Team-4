// Aktualisiert die Navigation je nach Login-Status (B11, B12, B20)
function initAuthNav() {
    apiCall('session_status.php', {}, function (success, data) {
        if (!success || !data) return;

        const $authItem = $('#auth-link').parent();
        if ($authItem.length === 0) return;

        if (data.loggedIn) {
            // WICHTIG: nur in der Navbar suchen – sonst wird "Mein Konto" auch in
            // Listen eingefügt, die ebenfalls einen cart.html-Link enthalten.
            const $cartItem = $('.navbar a[href$="cart.html"]').closest('.nav-item');
            if ($cartItem.length && $('#meinkonto-link').length === 0) {
                const accountHref = $('.navbar a[href="res/sites/cart.html"]').length
                    ? 'res/sites/account.html'
                    : 'account.html';
                $cartItem.before(
                    '<li class="nav-item">' +
                    '<a class="nav-link" id="meinkonto-link" href="' + accountHref + '">' +
                    '<i class="bi bi-person-circle me-1"></i>Mein Konto</a></li>'
                );
            }

            // Begrüßung als eigenes nav-item davor einfügen –
            // dadurch gleiche vertikale Höhe wie die anderen nav-links
            if ($('#greeting-item').length === 0) {
                $authItem.before(
                    '<li class="nav-item" id="greeting-item">' +
                    '<span class="nav-link disabled text-light">' +
                    'Hallo, ' + escapeHtml(data.username) +
                    '</span></li>'
                );
            }

            $authItem.html(
                '<a href="#" class="nav-link" id="logout-link">' +
                '<i class="bi bi-box-arrow-right me-1"></i>Logout</a>'
            );

            // Footer-Link "Anmelden" durch "Mein Konto" ersetzen, wenn eingeloggt
            $('.footer-link[href$="login.html"]').each(function () {
                const accountHref = $(this).attr('href').replace('login.html', 'account.html');
                $(this).attr('href', accountHref).text('Mein Konto');
            });
            $('#logout-link').on('click', function (e) {
                e.preventDefault();
                apiCall('logout.php', {}, function () {
                    window.location.reload();
                });
            });
        }
    });
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
}

$(document).ready(initAuthNav);
