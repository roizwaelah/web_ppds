<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

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

function sanitizeUrl($url)
{
    return filter_var($url, FILTER_VALIDATE_URL) ? $url : '';
}

switch ($method) {

    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare(
                'SELECT * FROM pengasuh WHERE id = ?'
            );
            $stmt->execute([$id]);
            jsonResponse($stmt->fetch() ?: null);
        }

        $stmt = $pdo->query(
            'SELECT * FROM pengasuh ORDER BY id DESC'
        );
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        requireAdmin(); // 🔥 WAJIB AUTH

        $input = getJsonInput();

        $name = trim($input['name'] ?? '');
        if (!$name) jsonError('Name is required', 400);

        $stmt = $pdo->prepare(
            'INSERT INTO pengasuh (name, role, image, bio)
             VALUES (?, ?, ?, ?)'
        );

        $stmt->execute([
            $name,
            trim($input['role'] ?? ''),
            sanitizeUrl($input['image'] ?? ''),
            sanitizeContent($input['bio'] ?? '')
        ]);

        jsonResponse(['success' => true]);
        break;

    case 'PUT':
        requireAdmin(); // 🔥 WAJIB AUTH

        if (!$id) jsonError('ID is required', 400);

        $input = getJsonInput();

        $name = trim($input['name'] ?? '');
        if (!$name) jsonError('Name is required', 400);

        $stmt = $pdo->prepare(
            'UPDATE pengasuh SET
             name = ?, role = ?, image = ?, bio = ?
             WHERE id = ?'
        );

        $stmt->execute([
            $name,
            trim($input['role'] ?? ''),
            sanitizeUrl($input['image'] ?? ''),
            sanitizeContent($input['bio'] ?? ''),
            $id
        ]);

        jsonResponse(['success' => true]);
        break;

    case 'DELETE':
        requireAdmin(); // 🔥 WAJIB AUTH

        if (!$id) jsonError('ID is required', 400);

        $stmt = $pdo->prepare(
            'DELETE FROM pengasuh WHERE id = ?'
        );
        $stmt->execute([$id]);

        jsonResponse(['success' => true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}
