<?phpclass DBAccess {

    // Datenbankverbindungsparameter
    private const DB_HOST    = 'localhost';
    private const DB_NAME    = 'webshop_team04';
    private const DB_USER    = 'root';
    private const DB_PASS    = '';
    private const DB_CHARSET = 'utf8mb4';

    private static ?DBAccess $instance = null;
    private PDO $connection;

    private function __construct() {
        // DSN zusammensetzen
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            self::DB_HOST,
            self::DB_NAME,
            self::DB_CHARSET
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->connection = new PDO($dsn, self::DB_USER, self::DB_PASS, $options);
        } catch (PDOException $e) {
            throw new RuntimeException(
                'Datenbankverbindung fehlgeschlagen. Bitte versuchen Sie es später erneut.',
                500,
                $e
            );
        }
    }

    public static function getInstance(): DBAccess {
        if (self::$instance === null) {
            self::$instance = new DBAccess();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->connection;
    }

    }

    private function __clone() {}
}