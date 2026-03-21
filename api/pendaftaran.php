<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

function rateLimit($max = 100, $window = 60)
{
    $ip = $_SERVER['REMOTE_ADDR'];
    $key = sys_get_temp_dir() . '/rl_' . md5($ip);

    $data = file_exists($key) ? json_decode(file_get_contents($key), true) : ['count' => 0, 'start' => time()];

    if (time() - $data['start'] > $window) {
        $data = ['count' => 0, 'start' => time()];
    }

    $data['count']++;

    if ($data['count'] > $max) {
        http_response_code(429);
        exit(json_encode(['error' => 'Too many requests']));
    }

    file_put_contents($key, json_encode($data));
}

function sanitizeUrl($url)
{
    if (!$url) return '';
    return filter_var($url, FILTER_VALIDATE_URL) ? $url : '';
}

function sanitizeArray($value)
{
    return is_array($value) ? $value : [];
}

function mapPendaftaran($row)
{
    if (!$row) return null;

    return [
        'id' => $row['id'],
        'isOpen' => (bool)$row['is_open'],
        'description' => $row['description'],
        'descriptionExtra' => $row['description_extra'],
        'requirements' => safeJsonDecode($row['requirements'], []),
        'waves' => safeJsonDecode($row['waves'], []),
        'registrationUrl' => $row['registration_url'],
        'brochureUrl' => $row['brochure_url'] ?? ''
    ];
}

switch ($method) {

    case 'GET':
        $stmt = $pdo->query('SELECT * FROM pendaftaran WHERE id = 1');
        jsonResponse(mapPendaftaran($stmt->fetch()));
        break;

    case 'PUT':
        requireAdmin(); // 🔥 WAJIB AUTH

        $input = getJsonInput();

        $description = trim($input['description'] ?? '');
        $descriptionExtra = trim($input['descriptionExtra'] ?? '');

        // Optional: bisa tambahkan strip_tags basic jika mau double layer
        // $description = strip_tags($description, '<p><br><strong><em><ul><ol><li><h1><h2><h3><blockquote><a><img>');

        $stmt = $pdo->prepare(
            'UPDATE pendaftaran SET
             is_open = ?, 
             description = ?, 
             description_extra = ?, 
             requirements = ?, 
             waves = ?, 
             registration_url = ?, 
             brochure_url = ?
             WHERE id = 1'
        );

        $stmt->execute([
            !empty($input['isOpen']) ? 1 : 0,
            $description,
            $descriptionExtra,
            json_encode(sanitizeArray($input['requirements'] ?? [])),
            json_encode(sanitizeArray($input['waves'] ?? [])),
            sanitizeUrl($input['registrationUrl'] ?? ''),
            sanitizeUrl($input['brochureUrl'] ?? '')
        ]);

        $stmt = $pdo->query('SELECT * FROM pendaftaran WHERE id = 1');
        jsonResponse(mapPendaftaran($stmt->fetch()));
        break;

    default:
        jsonError('Method not allowed', 405);
}
