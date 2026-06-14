//Login-Formular absenden und bei Erfolg zur Startseite weiterleiten.
import { istLeer } from './types.js';
$(document).ready(function () {
    const $form = $('#login-form');
    const $alert = $('#login-alert');
    $form.on('submit', function (e) {
        e.preventDefault();
        $alert.addClass('d-none');
        //HTML5-Validierung
        if (!this.checkValidity()) {
            this.reportValidity();
            return;
        }
        const benutzer = $form.find('[name=login]').val().trim();
        const passwort = $form.find('[name=password]').val();
        //Zusätzliche clientseitige Prüfung mit der importierten Hilfsfunktion
        if (istLeer(benutzer) || istLeer(passwort)) {
            $alert.removeClass('d-none').text('Bitte Benutzername und Passwort angeben.');
            return;
        }
        const data = {
            login: benutzer,
            password: passwort,
            remember: $form.find('[name=remember]').is(':checked')
        };
        apiCall('login.php', data, function (success, _data, message) {
            if (success) {
                window.location.href = '../../index.html';
            }
            else {
                $alert.removeClass('d-none').text(message);
            }
        });
    });
});
