<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET publik tidak perlu inisialisasi JWT.
if ($method !== 'GET') {
    require_once __DIR__ . '/jwt.php';
}

function sanitizeUrl($url)
{
    return sanitizeUrlOrUploadPath($url);
}

function sanitizeArray($value)
{
    return is_array($value) ? $value : [];
}

function sanitizeContent($html)
{
    return trim($html);
}

function mapSekilasPandang($row)
{
    return [
        'id' => (int)$row['id'],
        'title' => $row['title'] ?? '',
        'content' => $row['content'] ?? '',
        'image' => $row['image'] ?? '',
        'stats' => safeJsonDecode($row['stats'], [])
    ];
}

try {

    switch ($method) {

        // ==========================
        // GET
        // ==========================
        case 'GET':

            $stmt = $pdo->query("SELECT * FROM sekilas_pandang WHERE id = 1 LIMIT 1");
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$data) {
                // Auto-create default row jika belum ada
                $pdo->prepare("
                    INSERT INTO sekilas_pandang
                    (id, title, content, image, stats)
                    VALUES (1, '', '', '', '[]')
                ")->execute();

                $stmt = $pdo->query("SELECT * FROM sekilas_pandang WHERE id = 1 LIMIT 1");
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            jsonResponse(mapSekilasPandang($data));
            break;

        // ==========================
        // PUT (Update Single Page)
        // ==========================
        case 'PUT':

            requireAdmin(); // 🔥 WAJIB LOGIN ADMIN

            $input = getJsonInput();

            $title = trim($input['title'] ?? '');
            $content = sanitizeContent($input['content'] ?? '');
            $image = sanitizeUrl($input['image'] ?? '');
            $stats = json_encode(sanitizeArray($input['stats'] ?? []));

            if ($title === '') {
                jsonError('Title is required', 422);
            }

            // Cek apakah row sudah ada
            $check = $pdo->query("SELECT id FROM sekilas_pandang WHERE id = 1");
            $exists = $check->fetch();

            if (!$exists) {
                // INSERT jika belum ada
                $stmt = $pdo->prepare("
                    INSERT INTO sekilas_pandang
                    (id, title, content, image, stats)
                    VALUES (1, ?, ?, ?, ?)
                ");
            } else {
                // UPDATE jika sudah ada
                $stmt = $pdo->prepare("
                    UPDATE sekilas_pandang
                    SET title = ?, content = ?, image = ?, stats = ?
                    WHERE id = 1
                ");
            }

            $stmt->execute([$title, $content, $image, $stats]);

            // Ambil data terbaru
            $stmt = $pdo->query("SELECT * FROM sekilas_pandang WHERE id = 1 LIMIT 1");
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            jsonResponse(mapSekilasPandang($data));
            break;

        default:
            jsonError('Method not allowed', 405);
    }

} catch (Throwable $e) {

    http_response_code(500);

    jsonResponse([
        'error' => 'Server error',
        'message' => $e->getMessage() // bisa dihapus jika production strict
    ]);
}
