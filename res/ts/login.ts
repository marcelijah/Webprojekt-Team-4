//Login-Formular absenden und bei Erfolg zur Startseite weiterleiten.
import { LoginDaten, istLeer } from './types.js';

//jQuery ist untypisiert -> 'any'
declare const $: any;

//apiCall stammt aus der global geladenen api.js (klassisches Script, läuft vorher).
//Hier wird nur die Signatur deklariert, damit TypeScript sie kennt.
declare function apiCall(
    endpoint: string,
    data: object,
    callback: (success: boolean, data: any, message: string) => void,
    method?: string
): void;

$(document).ready(function (): void {
    const $form = $('#login-form');
    const $alert = $('#login-alert');

    $form.on('submit', function (this: any, e: any): void {
        e.preventDefault();
        $alert.addClass('d-none');

        //HTML5-Validierung
        if (!this.checkValidity()) {
            this.reportValidity();
            return;
        }

        const benutzer: string = $form.find('[name=login]').val().trim();
        const passwort: string = $form.find('[name=password]').val();

        //Zusätzliche clientseitige Prüfung mit der importierten Hilfsfunktion
        if (istLeer(benutzer) || istLeer(passwort)) {
            $alert.removeClass('d-none').text('Bitte Benutzername und Passwort angeben.');
            return;
        }

        const data: LoginDaten = {
            login: benutzer,
            password: passwort,
            remember: $form.find('[name=remember]').is(':checked')
        };

        apiCall('login.php', data, function (success: boolean, _data: any, message: string): void {
            if (success) {
                window.location.href = '../../index.html';
            } else {
                $alert.removeClass('d-none').text(message);
            }
        });
    });
});
