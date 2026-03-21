<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// GET boleh publik, JWT hanya diperlukan untuk mutasi data admin.
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
    return trim($html); // Frontend sanitize, ini fallback minimal
}

function validateDate($date)
{
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

switch ($method) {

    case 'GET':

        if ($id) {
            $stmt = $pdo->prepare(
                'SELECT * FROM pengumuman WHERE id = ?'
            );
            $stmt->execute([$id]);
            $row = $stmt->fetch();

            if ($row) {
                $row['important'] = (bool)$row['important'];
            }

            jsonResponse($row ?: null);
        }

        // Optional pagination
        $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
        $page = max(1, (int)($_GET['page'] ?? 1));
        $offset = ($page - 1) * $limit;

        $stmt = $pdo->prepare(
            'SELECT * FROM pengumuman
             ORDER BY updated_at DESC, date DESC, id DESC
             LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll();

        foreach ($rows as &$row) {
            $row['important'] = (bool)$row['important'];
        }

        jsonResponse([
            'data' => $rows,
            'page' => $page,
            'limit' => $limit
        ]);
        break;

    case 'POST':
        requireAdmin();

        $input = getJsonInput();

        $title = trim($input['title'] ?? '');
        if (!$title) jsonError('Title is required', 400);

        $date = $input['date'] ?? date('Y-m-d');
        if (!validateDate($date)) {
            $date = date('Y-m-d');
        }

        $stmt = $pdo->prepare(
            'INSERT INTO pengumuman (title, content, date, important)
             VALUES (?, ?, ?, ?)'
        );

        $stmt->execute([
            $title,
            sanitizeContent($input['content'] ?? ''),
            $date,
            !empty($input['important']) ? 1 : 0
        ]);

        jsonResponse(['success' => true]);
        break;

    case 'PUT':
        requireAdmin();

        if (!$id) jsonError('ID is required', 400);

        $input = getJsonInput();

        $title = trim($input['title'] ?? '');
        if (!$title) jsonError('Title is required', 400);

        $date = $input['date'] ?? date('Y-m-d');
        if (!validateDate($date)) {
            $date = date('Y-m-d');
        }

        $stmt = $pdo->prepare(
            'UPDATE pengumuman SET
             title = ?, content = ?, date = ?, important = ?
             WHERE id = ?'
        );

        $stmt->execute([
            $title,
            sanitizeContent($input['content'] ?? ''),
            $date,
            !empty($input['important']) ? 1 : 0,
            $id
        ]);

        jsonResponse(['success' => true]);
        break;

    case 'DELETE':
        requireAdmin();

        if (!$id) jsonError('ID is required', 400);

        $stmt = $pdo->prepare(
            'DELETE FROM pengumuman WHERE id = ?'
        );
        $stmt->execute([$id]);

        jsonResponse(['success' => true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}
