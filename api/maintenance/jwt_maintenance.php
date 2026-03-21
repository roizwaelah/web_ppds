<?php
// JWT maintenance script (shared-hosting friendly)
require_once dirname(__DIR__) . '/env.php';

$isCli = (PHP_SAPI === 'cli');
$maintenanceToken = getenv('MAINTENANCE_TOKEN') ?: '';
$allowHttp = in_array(strtolower((string)(getenv('MAINTENANCE_ALLOW_HTTP') ?: 'true')), ['1', 'true', 'yes', 'on'], true);
$envPath = dirname(__DIR__, 2) . '/.env';

$messages = [];
$hasError = false;

function addMessage(&$messages, $text)
{
    $messages[] = '[' . gmdate('Y-m-d H:i:s') . ' UTC] ' . $text;
}

function failHttp($code, $message)
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function parseEnvFile($path)
{
    if (!file_exists($path)) {
        return [];
    }
    return file($path, FILE_IGNORE_NEW_LINES);
}

function writeEnvFile($path, array $lines)
{
    $out = implode(PHP_EOL, $lines) . PHP_EOL;
    file_put_contents($path, $out, LOCK_EX);
}

function getEnvValueFromLines(array $lines, $key)
{
    $prefix = $key . '=';
    foreach ($lines as $line) {
        $trim = trim($line);
        if ($trim === '' || str_starts_with($trim, '#')) continue;
        if (str_starts_with($trim, $prefix)) {
            return substr($trim, strlen($prefix));
        }
    }
    return null;
}

function removeEnvKeys(array $lines, array $keys)
{
    $result = [];
    foreach ($lines as $line) {
        $keep = true;
        foreach ($keys as $key) {
            if (preg_match('/^' . preg_quote($key, '/') . '=/', trim($line))) {
                $keep = false;
                break;
            }
        }
        if ($keep) {
            $result[] = $line;
        }
    }
    return $result;
}

function getPdo()
{
    $host = getenv('DB_HOST');
    $db = getenv('DB_NAME');
    $user = getenv('DB_USER');
    $pass = getenv('DB_PASS');

    $dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";
    return new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

function purgeExpiredDenylist(PDO $pdo)
{
    $stmt = $pdo->prepare('DELETE FROM jwt_denylist WHERE exp_at <= UTC_TIMESTAMP()');
    $stmt->execute();
    return (int)$stmt->rowCount();
}

if (!$isCli) {
    if (!$allowHttp) {
        failHttp(403, 'HTTP maintenance disabled');
    }

    if ($maintenanceToken === '') {
        failHttp(500, 'MAINTENANCE_TOKEN not configured');
    }

    $providedToken = $_SERVER['HTTP_X_MAINTENANCE_TOKEN'] ?? ($_GET['token'] ?? '');
    if (!is_string($providedToken) || $providedToken === '' || !hash_equals($maintenanceToken, $providedToken)) {
        failHttp(401, 'Invalid maintenance token');
    }
}

try {
    $pdo = getPdo();
    $deleted = purgeExpiredDenylist($pdo);
    addMessage($messages, "Purged expired denylist rows: {$deleted}");
} catch (Throwable $e) {
    $hasError = true;
    addMessage($messages, 'Denylist purge failed: ' . $e->getMessage());
}

try {
    $lines = parseEnvFile($envPath);
    if (empty($lines)) {
        addMessage($messages, 'Env file missing or empty; skip rotation finalization.');
    } else {
        $untilRaw = getEnvValueFromLines($lines, 'JWT_PREVIOUS_SECRET_UNTIL');
        $prevRaw = getEnvValueFromLines($lines, 'JWT_PREVIOUS_SECRET');

        if ($untilRaw === null || $prevRaw === null || trim($prevRaw) === '') {
            addMessage($messages, 'No active previous secret transition; nothing to finalize.');
        } else {
            $until = (int)$untilRaw;
            $now = time();

            if ($until > 0 && $now > $until) {
                $updated = removeEnvKeys($lines, ['JWT_PREVIOUS_SECRET', 'JWT_PREVIOUS_SECRET_UNTIL']);
                writeEnvFile($envPath, $updated);
                addMessage($messages, 'Rotation finalized: removed JWT_PREVIOUS_SECRET and JWT_PREVIOUS_SECRET_UNTIL from .env');
            } else {
                addMessage($messages, 'Rotation grace still active; finalize skipped.');
            }
        }
    }
} catch (Throwable $e) {
    $hasError = true;
    addMessage($messages, 'Rotation finalization failed: ' . $e->getMessage());
}

if ($isCli) {
    foreach ($messages as $line) {
        echo $line . PHP_EOL;
    }
    exit($hasError ? 1 : 0);
}

http_response_code($hasError ? 500 : 200);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => !$hasError,
    'messages' => $messages,
], JSON_UNESCAPED_UNICODE);