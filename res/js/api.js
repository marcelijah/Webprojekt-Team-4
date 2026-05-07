/* Zentrale AJAX-Hilfsdatei für die JSON-Kommunikation mit dem Backend. */
const BASE_URL = window.API_BASE_URL || 'logic/';

function apiCall(endpoint, data, callback, method = 'POST') {
    $.ajax({
        url: BASE_URL + endpoint,
        type: method,
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (response) {
            // Rückruf aufrufen
            callback(response.success, response.data, response.message);
        },
        error: function (xhr, status, error) {
            // Netzwerk- oder Serverfehler
            console.error('API-Fehler [' + endpoint + ']:', status, error, xhr.responseText);
            // Falls Server JSON mit message geschickt hat, diese anzeigen
            const serverMsg = xhr.responseJSON && xhr.responseJSON.message;
            callback(false, null, serverMsg || ('Verbindungsfehler: ' + error));
        }
    });
}