<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// GET boleh publik
if ($method !== 'GET') {
    require_once __DIR__ . '/jwt.php';
    requireAdmin(); // hanya admin/superadmin
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

function sanitizeUrl($url)
{
    return sanitizeUrlOrUploadPath($url, false);
}

switch ($method) {

    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare(
                'SELECT * FROM hero_slides WHERE id = ?'
            );
            $stmt->execute([$id]);
            jsonResponse($stmt->fetch() ?: null);
        } else {
            $stmt = $pdo->query(
                'SELECT * FROM hero_slides 
                 ORDER BY sort_order ASC, id ASC'
            );
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $input = getJsonInput();

        $title = trim($input['title'] ?? '');
        if (!$title) {
            jsonError('Title is required', 400);
        }

        $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;

        $stmt = $pdo->prepare(
            'INSERT INTO hero_slides 
             (title, subtitle, description, image_url, button_text, button_link, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );

        $stmt->execute([
            $title,
            trim($input['subtitle'] ?? ''),
            trim($input['description'] ?? ''),
            sanitizeUrl($input['image_url'] ?? null),
            trim($input['button_text'] ?? ''),
            sanitizeUrl($input['button_link'] ?? null),
            $sortOrder
        ]);

        jsonResponse(['success' => true]);
        break;

    case 'PUT':
        if (!$id) jsonError('ID is required', 400);

        $input = getJsonInput();

        $title = trim($input['title'] ?? '');
        if (!$title) {
            jsonError('Title is required', 400);
        }

        $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;

        $stmt = $pdo->prepare(
            'UPDATE hero_slides SET
             title = ?, subtitle = ?, description = ?,
             image_url = ?, button_text = ?, button_link = ?, sort_order = ?
             WHERE id = ?'
        );

        $stmt->execute([
            $title,
            trim($input['subtitle'] ?? ''),
            trim($input['description'] ?? ''),
            sanitizeUrl($input['image_url'] ?? null),
            trim($input['button_text'] ?? ''),
            sanitizeUrl($input['button_link'] ?? null),
            $sortOrder,
            $id
        ]);

        jsonResponse(['success' => true]);
        break;

    case 'DELETE':
        if (!$id) jsonError('ID is required', 400);

        $stmt = $pdo->prepare(
            'DELETE FROM hero_slides WHERE id = ?'
        );
        $stmt->execute([$id]);

        jsonResponse(['success' => true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}
