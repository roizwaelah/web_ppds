<?php
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$sessionUser = requireAuth();

$stmt = $pdo->prepare(
    "SELECT u.id, u.name, u.username, r.name AS role, r.level
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = ? AND u.deleted_at IS NULL
     LIMIT 1"
);
$stmt->execute([(int)($sessionUser['id'] ?? 0)]);
$user = $stmt->fetch();

if (!$user) {
    clearAuthCookies();
    jsonError('Unauthorized', 401);
}

jsonResponse([
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'username' => $user['username'],
        'role' => $user['role'],
        'level' => $user['level']
    ]
]);
