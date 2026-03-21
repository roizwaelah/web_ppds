<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

$user = requireRoleLevel(10);

function validatePassword($password) {
    return strlen($password) >= 8 &&
           preg_match('/[A-Z]/', $password) &&
           preg_match('/[a-z]/', $password) &&
           preg_match('/[0-9]/', $password);
}

function checkRoleHierarchy($pdo, $currentUserId, $targetRoleId) {

    // Ambil level target role
    $stmt = $pdo->prepare("SELECT level FROM roles WHERE id = ?");
    $stmt->execute([$targetRoleId]);
    $targetRole = $stmt->fetch();

    if (!$targetRole) {
        jsonError('Role tidak valid', 400);
    }

    // Ambil level current user
    $stmt = $pdo->prepare("
        SELECT r.level 
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.id = ?
    ");
    $stmt->execute([$currentUserId]);
    $current = $stmt->fetch();

    if (!$current || $targetRole['level'] > $current['level']) {
        jsonError('Tidak dapat membuat atau mengubah role lebih tinggi dari Anda', 403);
    }
}

switch ($method) {

    case 'GET':

        if ($id) {
            $stmt = $pdo->prepare("
                SELECT u.id, u.name, u.username, u.role_id, r.name as role, r.level
                FROM users u
                JOIN roles r ON r.id = u.role_id
                WHERE u.id = ?
            ");
            $stmt->execute([$id]);
            jsonResponse($stmt->fetch() ?: null);
        } else {
            $stmt = $pdo->query("
                SELECT u.id, u.name, u.username, u.role_id, r.name as role, r.level
                FROM users u
                JOIN roles r ON r.id = u.role_id
                ORDER BY u.id ASC
            ");
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':

        $input = getJsonInput();
        $name = trim($input['name'] ?? '');
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        $roleId = (int)($input['role_id'] ?? 1);

        if (!$name || !$username || !$password) {
            jsonError('Nama, username, dan password wajib diisi', 400);
        }

        if (!validatePassword($password)) {
            jsonError('Password tidak memenuhi standar keamanan', 400);
        }

        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            jsonError('Username sudah digunakan', 409);
        }

        checkRoleHierarchy($pdo, $user['id'], $roleId);

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("
            INSERT INTO users (name, username, password, role_id)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$name, $username, $hashedPassword, $roleId]);

        jsonResponse(['success'=>true]);
        break;

    case 'PUT':

        if (!$id) jsonError('ID is required', 400);

        $input = getJsonInput();
        $name = trim($input['name'] ?? '');
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        $roleId = (int)($input['role_id'] ?? 1);

        if (!$name || !$username) {
            jsonError('Nama dan username wajib diisi', 400);
        }

        checkRoleHierarchy($pdo, $user['id'], $roleId);

        if ($password) {

            if (!validatePassword($password)) {
                jsonError('Password tidak valid', 400);
            }

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $pdo->prepare("
                UPDATE users SET name=?, username=?, password=?, role_id=?
                WHERE id=?
            ");
            $stmt->execute([$name, $username, $hashedPassword, $roleId, $id]);

        } else {

            $stmt = $pdo->prepare("
                UPDATE users SET name=?, username=?, role_id=?
                WHERE id=?
            ");
            $stmt->execute([$name, $username, $roleId, $id]);
        }

        jsonResponse(['success'=>true]);
        break;

    case 'DELETE':

        if (!$id) jsonError('ID is required', 400);

        if ($user['id'] == $id) {
            jsonError('Tidak dapat menghapus akun sendiri', 400);
        }

        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$id]);

        jsonResponse(['success'=>true]);
        break;

    default:
        jsonError('Method not allowed', 405);
}