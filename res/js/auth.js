// Aktualisiert die Navigation je nach Login-Status (B11, B12, B20)
function initAuthNav() {
    apiCall('session_status.php', {}, function (success, data) {
        if (!success || !data) return;

        const $authItem = $('#auth-link').parent();
        if ($authItem.length === 0) return;

        if (data.loggedIn) {
            // "Mein Konto"-Link vor dem Warenkorb-Eintrag einfügen
            const $cartItem = $('a[href$="cart.html"]').parent();
            if ($cartItem.length && $('#meinkonto-link').length === 0) {
                const accountHref = $('a[href="res/sites/cart.html"]').length
                    ? 'res/sites/account.html'
                    : 'account.html';
                $cartItem.before(
                    '<li class="nav-item">' +
                    '<a class="nav-link" id="meinkonto-link" href="' + accountHref + '">' +
                    '<i class="bi bi-person-circle me-1"></i>Mein Konto</a></li>'
                );
            }

            $authItem.html(
                '<span class="navbar-text text-light me-2">' +
                'Hallo, ' + escapeHtml(data.username) +
                '</span>' +
                '<a href="#" class="nav-link d-inline" id="logout-link">' +
                '<i class="bi bi-box-arrow-right me-1"></i>Logout</a>'
            );
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
