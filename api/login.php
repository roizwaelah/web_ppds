<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$input = getJsonInput();
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

if (!$username || !$password) {
    jsonError('Username dan password wajib diisi', 400);
}

$maxAttempts = 5;
$lockMinutes = 15;

// ===== CHECK USERNAME LOCK =====
$stmt = $pdo->prepare('SELECT * FROM login_attempts WHERE username = ?');
$stmt->execute([$username]);
$attempt = $stmt->fetch();

if ($attempt && $attempt['locked_until'] && strtotime($attempt['locked_until']) > time()) {
    jsonError('Akun terkunci sementara. Coba lagi nanti.', 423);
}

// ===== CHECK IP LOCK =====
$stmt = $pdo->prepare('SELECT * FROM ip_login_attempts WHERE ip_address = ?');
$stmt->execute([$ip]);
$ipAttempt = $stmt->fetch();

if ($ipAttempt && $ipAttempt['locked_until'] && strtotime($ipAttempt['locked_until']) > time()) {
    jsonError('Terlalu banyak percobaan login dari IP ini.', 423);
}

// ===== CHECK USER (WITH ROLE JOIN) =====
$stmt = $pdo->prepare("
    SELECT u.id, u.name, u.username, u.password, r.name as role_name, r.level
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.username = ? AND u.deleted_at IS NULL
");
$stmt->execute([$username]);
$user = $stmt->fetch();

// Pastikan password diverifikasi sebelum lanjut
if (!$user || !password_verify($password, $user['password'])) {

    // Logic pencatatan login_attempts tetap sama...
    if (!$attempt) {
        $pdo->prepare('INSERT INTO login_attempts (username, attempts) VALUES (?, 1)')
            ->execute([$username]);
    } else {
        $newAttempts = $attempt['attempts'] + 1;
        if ($newAttempts >= $maxAttempts) {
            $lockUntil = date('Y-m-d H:i:s', time() + ($lockMinutes * 60));
            $pdo->prepare('UPDATE login_attempts SET attempts=?, locked_until=? WHERE username=?')
                ->execute([$newAttempts, $lockUntil, $username]);
        } else {
            $pdo->prepare('UPDATE login_attempts SET attempts=? WHERE username=?')
                ->execute([$newAttempts, $username]);
        }
    }

    if (!$ipAttempt) {
        $pdo->prepare('INSERT INTO ip_login_attempts (ip_address, attempts) VALUES (?, 1)')
            ->execute([$ip]);
    } else {
        $newIpAttempts = $ipAttempt['attempts'] + 1;
        if ($newIpAttempts >= $maxAttempts) {
            $lockUntil = date('Y-m-d H:i:s', time() + ($lockMinutes * 60));
            $pdo->prepare('UPDATE ip_login_attempts SET attempts=?, locked_until=? WHERE ip_address=?')
                ->execute([$newIpAttempts, $lockUntil, $ip]);
        } else {
            $pdo->prepare('UPDATE ip_login_attempts SET attempts=? WHERE ip_address=?')
                ->execute([$newIpAttempts, $ip]);
        }
    }

    jsonError('Username atau password salah', 401);
}

// ===== SUCCESS → CLEAR LOCK =====
$pdo->prepare('DELETE FROM login_attempts WHERE username=?')->execute([$username]);
$pdo->prepare('DELETE FROM ip_login_attempts WHERE ip_address=?')->execute([$ip]);

// ===== NEW PAYLOAD =====
$payload = [
    'id' => $user['id'],
    'name' => $user['name'],
    'username' => $user['username'],
    'role' => $user['role_name'],
    'level' => $user['level']
];

$token = createJWT($payload);
setAuthCookies($token);

jsonResponse([
    'success' => true,
    'user' => $payload
]);