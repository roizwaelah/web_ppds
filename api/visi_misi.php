<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET publik tidak perlu inisialisasi JWT.
if ($method !== 'GET') {
    require_once __DIR__ . '/jwt.php';
}

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

function sanitizeContent($html)
{
    return trim($html); // fallback minimal
}

function sanitizeArray($value)
{
    return is_array($value) ? $value : [];
}

function mapVisiMisi($row)
{
    if (!$row) {
        return [
            'id' => 1,
            'visi' => '',
            'misi' => []
        ];
    }

    return [
        'id' => $row['id'],
        'visi' => $row['visi'],
        'misi' => safeJsonDecode($row['misi'], [])
    ];
}

switch ($method) {

    case 'GET':
        $stmt = $pdo->query(
            'SELECT * FROM visi_misi WHERE id = 1'
        );
        jsonResponse(mapVisiMisi($stmt->fetch()));
        break;

    case 'PUT':
        requireAdmin(); // 🔥 WAJIB AUTH

        $input = getJsonInput();
        $visi = sanitizeContent($input['visi'] ?? '');
        $misi = json_encode(sanitizeArray($input['misi'] ?? []));

        $stmt = $pdo->prepare(
            'INSERT INTO visi_misi (id, visi, misi)
             VALUES (1, ?, ?)
             ON DUPLICATE KEY UPDATE
             visi = VALUES(visi),
             misi = VALUES(misi)'
        );

        $stmt->execute([$visi, $misi]);

        $stmt = $pdo->query(
            'SELECT * FROM visi_misi WHERE id = 1'
        );

        jsonResponse(mapVisiMisi($stmt->fetch()));
        break;

    default:
        jsonError('Method not allowed', 405);
}
