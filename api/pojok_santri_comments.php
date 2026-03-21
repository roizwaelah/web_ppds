<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$articleId = isset($_GET['article_id']) ? (int)$_GET['article_id'] : 0;
$statusFilter = strtolower(trim((string)($_GET['status'] ?? 'approved')));
$allowedStatus = ['pending', 'approved', 'rejected'];

function ensureCommentsTable(PDO $pdo): void
{
    static $ensured = false;
    if ($ensured) {
        return;
    }

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS pojok_santri_comments (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            article_id INT NOT NULL,
            parent_id INT UNSIGNED DEFAULT NULL,
            commenter_name VARCHAR(120) NOT NULL,
            commenter_email VARCHAR(190) DEFAULT NULL,
            comment TEXT NOT NULL,
            status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_article_status_created (article_id, status, created_at),
            INDEX idx_status_created (status, created_at),
            INDEX idx_parent_id (parent_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    $columns = $pdo->query("SHOW COLUMNS FROM pojok_santri_comments LIKE 'parent_id'")->fetchAll(PDO::FETCH_ASSOC);
    if (count($columns) === 0) {
        $pdo->exec("ALTER TABLE pojok_santri_comments ADD COLUMN parent_id INT UNSIGNED DEFAULT NULL AFTER article_id");
        $pdo->exec("ALTER TABLE pojok_santri_comments ADD INDEX idx_parent_id (parent_id)");
    }

    $ensured = true;
}

function appendReplies(array $comments): array
{
    $byParent = [];
    foreach ($comments as $comment) {
        $parentKey = (int)($comment['parent_id'] ?? 0);
        $comment['replies'] = [];
        $byParent[$parentKey][] = $comment;
    }

    $build = function ($parentId) use (&$build, &$byParent) {
        $items = $byParent[$parentId] ?? [];
        foreach ($items as &$item) {
            $item['replies'] = $build((int)$item['id']);
        }
        unset($item);
        return $items;
    };

    return $build(0);
}

function sanitizeCommentText($text): string
{
    $text = trim((string)$text);
    $text = preg_replace('/\R{3,}/u', "\n\n", $text);
    return strip_tags($text);
}

function applyCommentRateLimit($max = 5, $window = 600): void
{
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $key = sys_get_temp_dir() . '/rl_pojok_comment_' . md5($ip);
    $now = time();
    $data = ['count' => 0, 'start' => $now];

    if (file_exists($key)) {
        $decoded = json_decode((string)file_get_contents($key), true);
        if (is_array($decoded) && isset($decoded['count'], $decoded['start'])) {
            $data = [
                'count' => (int)$decoded['count'],
                'start' => (int)$decoded['start'],
            ];
        }
    }

    if (($now - $data['start']) > $window) {
        $data = ['count' => 0, 'start' => $now];
    }

    $data['count']++;

    if ($data['count'] > $max) {
        jsonError('Terlalu banyak komentar. Coba lagi beberapa menit lagi.', 429);
    }

    file_put_contents($key, json_encode($data), LOCK_EX);
}

ensureCommentsTable($pdo);

switch ($method) {
    case 'GET':
        if ($statusFilter !== 'approved') {
            requireEditor();
        }

        if ($statusFilter !== 'all' && !in_array($statusFilter, $allowedStatus, true)) {
            jsonError('Status komentar tidak valid', 400);
        }

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $where = [];
        $params = [];

        if ($articleId > 0) {
            $where[] = 'c.article_id = ?';
            $params[] = $articleId;
        }

        if ($statusFilter !== 'all') {
            $where[] = 'c.status = ?';
            $params[] = $statusFilter;
        }

        if ($id) {
            $where[] = 'c.id = ?';
            $params[] = $id;
        }

        $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

        $sql = "SELECT c.*, p.title AS article_title, parent.commenter_name AS parent_commenter_name
                FROM pojok_santri_comments c
                LEFT JOIN pojok_santri p ON p.id = c.article_id
                LEFT JOIN pojok_santri_comments parent ON parent.id = c.parent_id
                $whereSql
                ORDER BY COALESCE(c.parent_id, c.id) DESC, c.parent_id IS NOT NULL ASC, c.created_at ASC, c.id ASC";

        if (!$id) {
            $sql .= ' LIMIT ? OFFSET ?';
            $params[] = $limit;
            $params[] = $offset;
        }

        $stmt = $pdo->prepare($sql);
        foreach ($params as $index => $value) {
            $paramIndex = $index + 1;
            $stmt->bindValue($paramIndex, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($id) {
            jsonResponse($rows[0] ?? null);
        }

        $countSql = "SELECT COUNT(*) FROM pojok_santri_comments c $whereSql";
        $countStmt = $pdo->prepare($countSql);
        foreach (array_slice($params, 0, count($where)) as $index => $value) {
            $countStmt->bindValue($index + 1, $value, is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        $summaryStmt = $pdo->query("SELECT status, COUNT(*) AS total FROM pojok_santri_comments GROUP BY status");
        $summaryRows = $summaryStmt->fetchAll(PDO::FETCH_ASSOC);
        $summary = ['pending' => 0, 'approved' => 0, 'rejected' => 0];
        foreach ($summaryRows as $summaryRow) {
            $status = $summaryRow['status'] ?? '';
            if (isset($summary[$status])) {
                $summary[$status] = (int)$summaryRow['total'];
            }
        }

        $publicRows = $statusFilter === 'approved' ? appendReplies($rows) : $rows;

        jsonResponse([
            'data' => $publicRows,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'summary' => $summary,
        ]);
        break;

    case 'POST':
        applyCommentRateLimit(5, 600);
        $input = getJsonInput();
        $articleId = (int)($input['articleId'] ?? 0);
        $name = trim(strip_tags((string)($input['name'] ?? '')));
        $email = trim((string)($input['email'] ?? ''));
        $comment = sanitizeCommentText($input['comment'] ?? '');
        $parentId = max(0, (int)($input['parentId'] ?? 0));

        if ($articleId <= 0) {
            jsonError('Artikel tujuan tidak valid', 422);
        }

        if ($name === '' || $comment === '') {
            jsonError('Nama dan komentar wajib diisi', 422);
        }

        if (mb_strlen($name) > 120) {
            jsonError('Nama maksimal 120 karakter', 422);
        }

        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonError('Format email tidak valid', 422);
        }

        if (mb_strlen($email) > 190) {
            jsonError('Email maksimal 190 karakter', 422);
        }

        if (mb_strlen($comment) < 5) {
            jsonError('Komentar minimal 5 karakter', 422);
        }

        if (mb_strlen($comment) > 1500) {
            jsonError('Komentar maksimal 1500 karakter', 422);
        }

        $articleStmt = $pdo->prepare('SELECT id, status FROM pojok_santri WHERE id = ? LIMIT 1');
        $articleStmt->execute([$articleId]);
        $article = $articleStmt->fetch(PDO::FETCH_ASSOC);

        if (!$article || (($article['status'] ?? 'published') !== 'published')) {
            jsonError('Artikel tidak ditemukan atau belum dipublikasikan', 404);
        }

        if ($parentId > 0) {
            $parentStmt = $pdo->prepare('SELECT id, article_id FROM pojok_santri_comments WHERE id = ? LIMIT 1');
            $parentStmt->execute([$parentId]);
            $parentComment = $parentStmt->fetch(PDO::FETCH_ASSOC);

            if (!$parentComment || (int)$parentComment['article_id'] !== $articleId) {
                jsonError('Komentar yang dibalas tidak valid', 422);
            }
        }

        $stmt = $pdo->prepare(
            'INSERT INTO pojok_santri_comments (article_id, parent_id, commenter_name, commenter_email, comment, status)
             VALUES (?, ?, ?, ?, ?, ?)' 
        );
        $stmt->execute([
            $articleId,
            $parentId > 0 ? $parentId : null,
            $name,
            $email !== '' ? $email : null,
            $comment,
            'pending',
        ]);

        jsonResponse([
            'success' => true,
            'message' => 'Komentar berhasil dikirim dan menunggu moderasi admin.',
            'id' => (int)$pdo->lastInsertId(),
        ], 201);
        break;

    case 'PUT':
        requireEditor();

        if (!$id) {
            jsonError('ID komentar wajib diisi', 400);
        }

        $input = getJsonInput();
        $status = strtolower(trim((string)($input['status'] ?? 'pending')));

        if (!in_array($status, $allowedStatus, true)) {
            jsonError('Status komentar tidak valid', 422);
        }

        $stmt = $pdo->prepare('UPDATE pojok_santri_comments SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
        jsonResponse(['success' => true]);
        break;

    case 'DELETE':
        requireEditor();

        if (!$id) {
            jsonError('ID komentar wajib diisi', 400);
        }

        $stmt = $pdo->prepare('DELETE FROM pojok_santri_comments WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['success' => true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}
