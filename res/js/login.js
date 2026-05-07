$(document).ready(function () {
    const $form = $('#login-form');
    const $alert = $('#login-alert');

    $form.on('submit', function (e) {
        e.preventDefault();
        $alert.addClass('d-none');

        if (!this.checkValidity()) {
            this.reportValidity();
            return;
        }

        const data = {
            login:    $form.find('[name=login]').val().trim(),
            password: $form.find('[name=password]').val(),
            remember: $form.find('[name=remember]').is(':checked')
        };

        apiCall('login.php', data, function (success, _data, message) {
            if (success) {
                window.location.href = '../../index.html';
            } else {
                $alert.removeClass('d-none').text(message);
            }
        });
    });
});
