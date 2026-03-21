<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$statusFilter = $_GET['status'] ?? 'published';
$statusFilter = strtolower($statusFilter);

$allowedStatus = ['draft', 'published'];

/* ============================= */
/* ===== HELPER FUNCTIONS ===== */
/* ============================= */

function sanitizeContent($html)
{
    $html = trim((string)$html);
    if ($html === '') {
        return '';
    }

    // Buang tag berbahaya beserta isi.
    $html = preg_replace(
        '#<\s*(script|style|iframe|object|embed|form|meta|link)\b[^>]*>.*?<\s*/\s*\1\s*>#is',
        '',
        $html
    );
    $html = preg_replace(
        '#<\s*(script|style|iframe|object|embed|form|meta|link)\b[^>]*\/?\s*>#is',
        '',
        $html
    );

    // Batasi tag yang boleh lolos.
    $allowedTags = '<p><br><strong><em><u><ol><ul><li><h1><h2><h3><blockquote><a><img>';
    $html = strip_tags($html, $allowedTags);

    // Hapus inline event/style.
    $html = preg_replace('/\s+on[a-z]+\s*=\s*(".*?"|\'.*?\'|[^\s>]+)/iu', '', $html);
    $html = preg_replace('/\s+style\s*=\s*(".*?"|\'.*?\'|[^\s>]+)/iu', '', $html);

    // Sanitasi protocol href/src.
    $html = preg_replace_callback(
        '/\s(href|src)\s*=\s*("|\')(.*?)\2/iu',
        function ($matches) {
            $attr = strtolower($matches[1]);
            $value = trim(html_entity_decode($matches[3], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $lower = strtolower($value);

            if ($value === '') {
                return '';
            }

            $isSafeHref = preg_match('#^(https?://|/|#|mailto:|tel:)#i', $value) === 1;
            $isSafeSrc = preg_match('#^(https?://|/)#i', $value) === 1;

            if ($attr === 'href' && !$isSafeHref) {
                return '';
            }

            if ($attr === 'src' && !$isSafeSrc) {
                return '';
            }

            if (str_starts_with($lower, 'javascript:') || str_starts_with($lower, 'vbscript:') || str_starts_with($lower, 'data:')) {
                return '';
            }

            return ' ' . $attr . '="' . htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '"';
        },
        $html
    );

    return trim($html);
}

function sanitizeUrl($url)
{
    return filter_var($url, FILTER_VALIDATE_URL) ? $url : '';
}

function applyPublicSubmissionRateLimit($max = 5, $window = 600)
{
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $key = sys_get_temp_dir() . '/rl_pojok_public_' . md5($ip);
    $now = time();

    $data = ['count' => 0, 'start' => $now];

    if (file_exists($key)) {
        $decoded = json_decode((string)file_get_contents($key), true);
        if (is_array($decoded) && isset($decoded['count'], $decoded['start'])) {
            $data = [
                'count' => (int)$decoded['count'],
                'start' => (int)$decoded['start']
            ];
        }
    }

    if (($now - $data['start']) > $window) {
        $data = ['count' => 0, 'start' => $now];
    }

    $data['count']++;

    if ($data['count'] > $max) {
        jsonError('Terlalu banyak pengiriman. Coba lagi beberapa menit lagi.', 429);
    }

    file_put_contents($key, json_encode($data), LOCK_EX);
}

function hasStatusColumn(PDO $pdo): bool
{
    static $cached = null;

    if ($cached !== null) {
        return $cached;
    }

    $stmt = $pdo->query(
        "SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'pojok_santri'
           AND COLUMN_NAME = 'status'"
    );

    $cached = ((int)$stmt->fetchColumn() > 0);
    return $cached;
}

/* ============================= */
/* ===== MAIN ROUTER ========== */
/* ============================= */

switch ($method) {

    /* ============================= */
    /* ========== GET ============== */
    /* ============================= */

    case 'GET':

        $statusColumnExists = hasStatusColumn($pdo);

        // Jika request selain published => wajib admin
        if ($statusFilter !== 'published') {
            requireAdmin();
        }

        // Detail by ID
        if ($id) {
            $stmt = $pdo->prepare(
                'SELECT * FROM pojok_santri WHERE id = ? LIMIT 1'
            );
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                $row['authorRole'] = $row['author_role'];
                unset($row['author_role']);
            }

            jsonResponse($row ?: null);
        }

        // Pagination
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(50, max(1, (int)($_GET['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;

        // Validasi status
        if (!in_array($statusFilter, $allowedStatus, true) && $statusFilter !== 'all') {
            jsonError('Invalid status filter', 400);
        }

        if ($statusFilter === 'all' || !$statusColumnExists) {
            $stmt = $pdo->prepare(
                'SELECT * FROM pojok_santri
                 ORDER BY id DESC
                 LIMIT ? OFFSET ?'
            );
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->bindValue(2, $offset, PDO::PARAM_INT);
            $stmt->execute();

            $countStmt = $pdo->query(
                'SELECT COUNT(*) as total FROM pojok_santri'
            );
        } else {
            $stmt = $pdo->prepare(
                'SELECT * FROM pojok_santri
                 WHERE status = ?
                 ORDER BY id DESC
                 LIMIT ? OFFSET ?'
            );
            $stmt->bindValue(1, $statusFilter);
            $stmt->bindValue(2, $limit, PDO::PARAM_INT);
            $stmt->bindValue(3, $offset, PDO::PARAM_INT);
            $stmt->execute();

            $countStmt = $pdo->prepare(
                'SELECT COUNT(*) as total FROM pojok_santri WHERE status = ?'
            );
            $countStmt->execute([$statusFilter]);
        }

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$row) {
            $row['authorRole'] = $row['author_role'];
            unset($row['author_role']);
        }

        $total = (int)$countStmt->fetch()['total'];

        jsonResponse([
            'data' => $rows,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ]);

        break;

    /* ============================= */
    /* ========== POST ============= */
    /* ============================= */

    case 'POST':

        $authUser = getAuthUser();
        $isAdmin = (bool)$authUser;

        // Submit publik dibatasi agar tidak jadi spam endpoint.
        if (!$isAdmin) {
            applyPublicSubmissionRateLimit(5, 600);
        }

        $input = getJsonInput();

        $title = trim(strip_tags((string)($input['title'] ?? '')));
        $content = sanitizeContent($input['content'] ?? '');
        $author = trim(strip_tags((string)($input['author'] ?? '')));
        $authorRole = trim(strip_tags((string)($input['authorRole'] ?? '')));
        $category = trim(strip_tags((string)($input['category'] ?? 'Cerita')));

        if (mb_strlen($title) > 200) {
            jsonError('Judul maksimal 200 karakter', 422);
        }

        if (mb_strlen($author) > 120) {
            jsonError('Nama penulis maksimal 120 karakter', 422);
        }

        if (mb_strlen($authorRole) > 120) {
            jsonError('Kelas/Jabatan maksimal 120 karakter', 422);
        }

        if (mb_strlen($category) > 50) {
            jsonError('Kategori maksimal 50 karakter', 422);
        }

        if (mb_strlen(strip_tags($content)) > 50000) {
            jsonError('Isi artikel terlalu panjang', 422);
        }

        if ($title === '' || $content === '' || $author === '') {
            jsonError('Judul, isi, dan nama penulis wajib diisi', 422);
        }

        if ($isAdmin) {
            requireAdmin();
        }

        $status = $isAdmin && in_array($input['status'] ?? '', $allowedStatus, true)
            ? $input['status']
            : 'draft';

        if (hasStatusColumn($pdo)) {
            $stmt = $pdo->prepare(
                'INSERT INTO pojok_santri
                 (title, content, author, author_role, date, image, category, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );

            $stmt->execute([
                $title,
                $content,
                $author,
                $authorRole,
                $isAdmin ? ($input['date'] ?? date('Y-m-d')) : date('Y-m-d'),
                $isAdmin ? sanitizeUrl($input['image'] ?? '') : '',
                $category,
                $status
            ]);
        } else {
            $stmt = $pdo->prepare(
                'INSERT INTO pojok_santri
                 (title, content, author, author_role, date, image, category)
                 VALUES (?, ?, ?, ?, ?, ?, ?)'
            );

            $stmt->execute([
                $title,
                $content,
                $author,
                $authorRole,
                $isAdmin ? ($input['date'] ?? date('Y-m-d')) : date('Y-m-d'),
                $isAdmin ? sanitizeUrl($input['image'] ?? '') : '',
                $category
            ]);
        }

        jsonResponse([
            'success' => true,
            'id' => $pdo->lastInsertId()
        ]);

        break;

    /* ============================= */
    /* ========== PUT ============== */
    /* ============================= */

    case 'PUT':

        requireAdmin();

        if (!$id) {
            jsonError('ID is required', 400);
        }

        $input = getJsonInput();
        $title = trim(strip_tags((string)($input['title'] ?? '')));
        $content = sanitizeContent($input['content'] ?? '');
        $author = trim(strip_tags((string)($input['author'] ?? '')));
        $authorRole = trim(strip_tags((string)($input['authorRole'] ?? '')));
        $category = trim(strip_tags((string)($input['category'] ?? 'Kegiatan')));

        if ($title === '' || $content === '' || $author === '') {
            jsonError('Judul, isi, dan nama penulis wajib diisi', 422);
        }

        if (mb_strlen($title) > 200) {
            jsonError('Judul maksimal 200 karakter', 422);
        }

        if (mb_strlen($author) > 120) {
            jsonError('Nama penulis maksimal 120 karakter', 422);
        }

        if (mb_strlen($authorRole) > 120) {
            jsonError('Kelas/Jabatan maksimal 120 karakter', 422);
        }

        if (mb_strlen($category) > 50) {
            jsonError('Kategori maksimal 50 karakter', 422);
        }

        if (mb_strlen(strip_tags($content)) > 50000) {
            jsonError('Isi artikel terlalu panjang', 422);
        }

        $status = in_array($input['status'] ?? '', $allowedStatus, true)
            ? $input['status']
            : 'draft';

        if (hasStatusColumn($pdo)) {
            $stmt = $pdo->prepare(
                'UPDATE pojok_santri SET
                 title = ?, content = ?, author = ?, author_role = ?,
                 date = ?, image = ?, category = ?, status = ?
                 WHERE id = ?'
            );

            $stmt->execute([
                $title,
                $content,
                $author,
                $authorRole,
                $input['date'] ?? date('Y-m-d'),
                sanitizeUrl($input['image'] ?? ''),
                $category,
                $status,
                $id
            ]);
        } else {
            $stmt = $pdo->prepare(
                'UPDATE pojok_santri SET
                 title = ?, content = ?, author = ?, author_role = ?,
                 date = ?, image = ?, category = ?
                 WHERE id = ?'
            );

            $stmt->execute([
                $title,
                $content,
                $author,
                $authorRole,
                $input['date'] ?? date('Y-m-d'),
                sanitizeUrl($input['image'] ?? ''),
                $category,
                $id
            ]);
        }

        jsonResponse(['success' => true]);

        break;

    /* ============================= */
    /* ========== DELETE =========== */
    /* ============================= */

    case 'DELETE':

        requireAdmin();

        if (!$id) {
            jsonError('ID is required', 400);
        }

        $stmt = $pdo->prepare(
            'DELETE FROM pojok_santri WHERE id = ?'
        );
        $stmt->execute([$id]);

        jsonResponse(['success' => true]);

        break;

    default:
        jsonError('Method not allowed', 405);
}
