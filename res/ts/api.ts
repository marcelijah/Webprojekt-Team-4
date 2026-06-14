//Zentrale AJAX-Hilfsdatei für die JSON-Kommunikation mit dem Backend (TypeScript).
declare const $: any;

//Interface: einheitliche Antwortstruktur des Backends (Folie: Interfaces)
interface ApiResponse {
    success: boolean;
    data: any;
    message: string;
}

//Union-/Literal-Type: erlaubte HTTP-Methoden (Folie: Union Types)
type HttpMethod = 'GET' | 'POST';

//Funktions-/Callback-Typ (Folie: Function Type & Callbacks)
type ApiCallback = (success: boolean, data: any, message: string) => void;

const BASE_URL: string = (window as any).API_BASE_URL || 'logic/';

function apiCall(endpoint: string, data: object, callback: ApiCallback, method: HttpMethod = 'POST'): void {
    $.ajax({
        url: BASE_URL + endpoint,
        type: method,
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (response: ApiResponse): void {
            //Rückruf aufrufen
            callback(response.success, response.data, response.message);
        },
        error: function (xhr: any, status: string, error: string): void {
            //Netzwerk- oder Serverfehler
            console.error('API-Fehler [' + endpoint + ']:', status, error, xhr.responseText);
            //Falls Server JSON mit message geschickt hat, diese anzeigen
            const serverMsg = xhr.responseJSON && xhr.responseJSON.message;
            callback(false, null, serverMsg || ('Verbindungsfehler: ' + error));
        }
    });
}
