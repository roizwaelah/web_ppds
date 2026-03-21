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

function sanitizeArray($value)
{
    return is_array($value) ? $value : [];
}

function mapPendidikan($row)
{
    if (!$row) return null;

    return [
        'id' => $row['id'],
        'formal' => safeJsonDecode($row['formal'], []),
        'nonFormal' => safeJsonDecode($row['non_formal'], []),
        'extracurriculars' => safeJsonDecode($row['extracurriculars'], []),
        'schedule' => safeJsonDecode($row['schedule'], [])
    ];
}

switch ($method) {

    case 'GET':
        $stmt = $pdo->query('SELECT * FROM pendidikan WHERE id = 1');
        jsonResponse(mapPendidikan($stmt->fetch()));
        break;

    case 'PUT':
        requireAdmin(); // 🔥 WAJIB AUTH

        $input = getJsonInput();

        $stmt = $pdo->prepare(
            'INSERT INTO pendidikan (id, formal, non_formal, extracurriculars, schedule)
             VALUES (1, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             formal = VALUES(formal),
             non_formal = VALUES(non_formal),
             extracurriculars = VALUES(extracurriculars),
             schedule = VALUES(schedule)'
        );

        $stmt->execute([
            json_encode(sanitizeArray($input['formal'] ?? [])),
            json_encode(sanitizeArray($input['nonFormal'] ?? [])),
            json_encode(sanitizeArray($input['extracurriculars'] ?? [])),
            json_encode(sanitizeArray($input['schedule'] ?? []))
        ]);

        $stmt = $pdo->query('SELECT * FROM pendidikan WHERE id = 1');
        jsonResponse(mapPendidikan($stmt->fetch()));
        break;

    default:
        jsonError('Method not allowed', 405);
}
