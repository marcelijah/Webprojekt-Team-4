// Aktualisiert die Navigation je nach Login-Status (B11, B12)
function initAuthNav() {
    apiCall('session_status.php', {}, function (success, data) {
        if (!success || !data) return;

        const $authItem = $('#auth-link').parent();
        if ($authItem.length === 0) return;

        if (data.loggedIn) {
            $authItem.html(
                '<span class="navbar-text text-light me-2">' +
                '<i class="bi bi-person-circle me-1"></i>Hallo, ' + escapeHtml(data.username) +
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
