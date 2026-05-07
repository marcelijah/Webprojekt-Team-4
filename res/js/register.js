$(document).ready(function () {
    const $form = $('#register-form');
    const $alert = $('#register-alert');

    $form.on('submit', function (e) {
        e.preventDefault();
        $alert.addClass('d-none');

        // HTML5-Validierung
        if (!this.checkValidity()) {
            this.reportValidity();
            return;
        }

        // Daten einsammeln
        const data = {};
        $.each($form.serializeArray(), function (_, f) { data[f.name] = f.value; });

        apiCall('register.php', data, function (success, _data, message) {
            if (success) {
                alert('Registrierung erfolgreich. Du wirst zum Login weitergeleitet.');
                window.location.href = 'login.html';
            } else {
                showError(message);
            }
        });
    });

    function showError(msg) {
        $alert.removeClass('d-none alert-success').addClass('alert-danger').text(msg);
    }
});
