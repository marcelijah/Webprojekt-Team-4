<?php
class Response {

    public static function success($data = null, string $message = 'Erfolgreich'): void {
        self::send(true, $data, $message);
    }

    public static function error(string $message = 'Ein Fehler ist aufgetreten', int $code = 400): void {
        http_response_code($code);
        self::send(false, null, $message);
    }

    private static function send(bool $success, $data, string $message): void {
        header('Content-Type: application/json; charset=utf-8');
        // CORS-Header für lokale XAMPP-Entwicklung
        header('Access-Control-Allow-Origin: *');

        echo json_encode([
            'success' => $success,
            'data'    => $data,
            'message' => $message
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }
}
