// Aktualisiert die Navigation je nach Login-Status (B11, B12, B20)
function initAuthNav() {
    apiCall('session_status.php', {}, function (success, data) {
        if (!success || !data) return;

        const $authItem = $('#auth-link').parent();
        if ($authItem.length === 0) return;

        if (data.loggedIn) {
            // WICHTIG: nur in der Navbar suchen – sonst wird "Mein Konto" auch in
            // Breadcrumb-Listen eingefügt, die ebenfalls einen cart.html-Link enthalten.
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

            // B23: Admin sieht zusätzliche Menüpunkte für die Verwaltung
            if (data.isAdmin) {
                const istRoot = $('.navbar a[href="res/sites/cart.html"]').length > 0;
                const basis = istRoot ? 'res/sites/' : '';
                const $cartItem2 = $('.navbar a[href$="cart.html"]').closest('.nav-item');
                if ($cartItem2.length && $('#admin-produkte-link').length === 0) {
                    $cartItem2.before(
                        '<li class="nav-item">' +
                        '<a class="nav-link" id="admin-produkte-link" href="' + basis + 'admin_products.html">' +
                        '<i class="bi bi-box-seam me-1"></i>Produkte bearbeiten</a></li>' +
                        '<li class="nav-item">' +
                        '<a class="nav-link" id="admin-kunden-link" href="' + basis + 'admin_customers.html">' +
                        '<i class="bi bi-people me-1"></i>Kunden bearbeiten</a></li>'
                    );
                }
            }

            // Begrüßung als eigenes nav-item davor einfügen –
            // dadurch gleiche vertikale Höhe wie die anderen nav-links
            if ($('#greeting-item').length === 0) {
                $authItem.before(
                    '<li class="nav-item d-flex align-items-center me-lg-2 my-1 my-lg-0" id="greeting-item">' +
                    '<span class="greeting-badge">' +
                    '<i class="bi bi-person-circle me-1"></i>Hallo, ' + escapeHtml(data.username) +
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
