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
            console.error('API-Fehler [' + endpoint + ']:', status, error);
            callback(false, null, 'Verbindungsfehler: ' + error);
        }
    });
}