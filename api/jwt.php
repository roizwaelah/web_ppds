<?php
require_once __DIR__ . '/env.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';


function envValue($name, $default = null)
{
    $value = getenv($name);
    if ($value !== false && $value !== null && $value !== '') {
        return $value;
    }

    if (array_key_exists($name, $_ENV) && $_ENV[$name] !== '') {
        return $_ENV[$name];
    }

    if (array_key_exists($name, $_SERVER) && $_SERVER[$name] !== '') {
        return $_SERVER[$name];
    }

    return $default;
}

$jwtSecret = envValue('JWT_SECRET');
$jwtPreviousSecret = envValue('JWT_PREVIOUS_SECRET') ?: null;
$jwtPreviousSecretUntil = (int)(envValue('JWT_PREVIOUS_SECRET_UNTIL', 0) ?: 0);
$jwtIssuer = envValue('JWT_ISSUER', 'ppds-api') ?: 'ppds-api';
$jwtAudience = envValue('JWT_AUDIENCE', 'ppds-client') ?: 'ppds-client';
$jwtClockSkew = max(0, (int)(envValue('JWT_CLOCK_SKEW', 30) ?: 30));
if (!$jwtSecret) {
    http_response_code(500);
    exit('JWT secret not configured.');
}

function base64UrlEncode($data)
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data)
{
    return base64_decode(strtr($data, '-_', '+/'), true);
}

function envBool($name, $default = false)
{
    $value = envValue($name, null);
    if ($value === false || $value === null || $value === '') {
        return (bool)$default;
    }

    $value = strtolower(trim((string)$value));
    return in_array($value, ['1', 'true', 'yes', 'on'], true);
}

function isHttpsRequest()
{
    if (envBool('FORCE_SECURE_COOKIE', false)) {
        return true;
    }

    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }

    if (($_SERVER['SERVER_PORT'] ?? null) === '443') {
        return true;
    }

    $forwardedProto = strtolower((string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));
    if ($forwardedProto === 'https') {
        return true;
    }

    $forwardedSsl = strtolower((string)($_SERVER['HTTP_X_FORWARDED_SSL'] ?? ''));
    if ($forwardedSsl === 'on') {
        return true;
    }

    $frontEndHttps = strtolower((string)($_SERVER['HTTP_FRONT_END_HTTPS'] ?? ''));
    if ($frontEndHttps === 'on') {
        return true;
    }

    return false;
}

function buildCookieOptions($expires)
{
    return [
        'expires' => $expires,
        'path' => '/',
        'secure' => isHttpsRequest(),
        'httponly' => true,
        'samesite' => 'Strict'
    ];
}

function getAuthPdo()
{
    global $pdo;
    return ($pdo instanceof PDO) ? $pdo : null;
}

function purgeExpiredRevokedTokens($force = false)
{
    $pdo = getAuthPdo();
    if (!$pdo) {
        return 0;
    }

    // Jalankan purge berkala untuk menjaga tabel tetap kecil.
    if (!$force && random_int(1, 100) !== 1) {
        return 0;
    }

    $stmt = $pdo->prepare('DELETE FROM jwt_denylist WHERE exp_at <= UTC_TIMESTAMP()');
    $stmt->execute();

    return (int)$stmt->rowCount();
}

function isJtiRevoked($jti)
{
    $pdo = getAuthPdo();
    if (!$pdo || !is_string($jti) || $jti === '') {
        return false;
    }

    purgeExpiredRevokedTokens();

    $stmt = $pdo->prepare('SELECT 1 FROM jwt_denylist WHERE jti = ? AND exp_at > UTC_TIMESTAMP() LIMIT 1');
    $stmt->execute([$jti]);

    return (bool)$stmt->fetchColumn();
}

function revokeJtiUntil($jti, $exp)
{
    $pdo = getAuthPdo();
    if (!$pdo || !is_string($jti) || $jti === '') {
        return;
    }

    $expInt = (int)$exp;
    if ($expInt <= time()) {
        return;
    }

    $expUtc = gmdate('Y-m-d H:i:s', $expInt);

    $stmt = $pdo->prepare(
        'INSERT INTO jwt_denylist (jti, exp_at, revoked_at)
         VALUES (?, ?, UTC_TIMESTAMP())
         ON DUPLICATE KEY UPDATE
         exp_at = GREATEST(exp_at, VALUES(exp_at)),
         revoked_at = UTC_TIMESTAMP()'
    );

    $stmt->execute([$jti, $expUtc]);
}

function verifyJwtSignature($headerEncoded, $payloadEncoded, $signatureEncoded, $secret)
{
    if (!$secret) {
        return false;
    }

    $expectedSignature = base64UrlEncode(
        hash_hmac(
            'sha256',
            "$headerEncoded.$payloadEncoded",
            $secret,
            true
        )
    );

    return hash_equals($expectedSignature, $signatureEncoded);
}

function createJWT($payload, $expiry = 3600)
{
    global $jwtSecret, $jwtIssuer, $jwtAudience;

    $now = time();
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];

    $subject = (string)($payload['id'] ?? $payload['sub'] ?? '');
    if ($subject === '') {
        jsonError('Invalid token subject', 500);
    }

    $payload['sub'] = $subject;
    $payload['jti'] = bin2hex(random_bytes(16));
    $payload['iat'] = $now;
    $payload['nbf'] = $now;
    $payload['exp'] = $now + (int)$expiry;
    $payload['iss'] = $jwtIssuer;
    $payload['aud'] = $jwtAudience;

    $headerEncoded = base64UrlEncode(json_encode($header));
    $payloadEncoded = base64UrlEncode(json_encode($payload));

    $signature = hash_hmac(
        'sha256',
        "$headerEncoded.$payloadEncoded",
        $jwtSecret,
        true
    );

    $signatureEncoded = base64UrlEncode($signature);

    return "$headerEncoded.$payloadEncoded.$signatureEncoded";
}

function verifyJWT($token)
{
    global $jwtSecret, $jwtPreviousSecret, $jwtPreviousSecretUntil, $jwtIssuer, $jwtAudience, $jwtClockSkew;

    if (!is_string($token) || $token === '') {
        return false;
    }

    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;

    $headerJson = base64UrlDecode($headerEncoded);
    $payloadJson = base64UrlDecode($payloadEncoded);
    if ($headerJson === false || $payloadJson === false) return false;

    $header = json_decode($headerJson, true);
    $payload = json_decode($payloadJson, true);

    if (!is_array($header) || !is_array($payload)) return false;
    if (($header['alg'] ?? '') !== 'HS256') return false;
    if (($header['typ'] ?? '') !== 'JWT') return false;

    $usePreviousSecret = $jwtPreviousSecret && ($jwtPreviousSecretUntil <= 0 || time() <= $jwtPreviousSecretUntil);

    $isValidSignature = verifyJwtSignature($headerEncoded, $payloadEncoded, $signatureEncoded, $jwtSecret)
        || ($usePreviousSecret && verifyJwtSignature($headerEncoded, $payloadEncoded, $signatureEncoded, $jwtPreviousSecret));

    if (!$isValidSignature) return false;

    $requiredClaims = ['sub', 'jti', 'iat', 'nbf', 'exp', 'iss', 'aud'];
    foreach ($requiredClaims as $claim) {
        if (!isset($payload[$claim])) {
            return false;
        }
    }

    if (!is_string($payload['sub']) || trim($payload['sub']) === '') return false;
    if (!is_string($payload['jti']) || strlen($payload['jti']) < 16) return false;

    $iat = (int)$payload['iat'];
    $nbf = (int)$payload['nbf'];
    $exp = (int)$payload['exp'];
    $now = time();

    if ($iat > $now + $jwtClockSkew) return false;
    if ($nbf > $now + $jwtClockSkew) return false;
    if ($exp <= $now - $jwtClockSkew) return false;

    if (($payload['iss'] ?? '') !== $jwtIssuer) return false;
    if (($payload['aud'] ?? '') !== $jwtAudience) return false;

    if (isJtiRevoked($payload['jti'])) return false;

    return $payload;
}

function setAuthCookies($token)
{
    $authOptions = buildCookieOptions(time() + 3600);

    // Bersihkan kemungkinan cookie legacy (path /api)
    // agar tidak terjadi duplikasi nama cookie dengan path berbeda.
    $legacyExpired = buildCookieOptions(time() - 3600);
    $legacyExpired['path'] = '/api';
    setcookie('ppds_token', '', $legacyExpired);

    setcookie('ppds_token', $token, $authOptions);

    $csrfToken = bin2hex(random_bytes(32));

    setcookie(
        'ppds_csrf',
        '',
        [
            'expires' => $legacyExpired['expires'],
            'path' => '/api',
            'secure' => $authOptions['secure'],
            'httponly' => false,
            'samesite' => 'Strict'
        ]
    );

    setcookie(
        'ppds_csrf',
        $csrfToken,
        [
            'expires' => $authOptions['expires'],
            'path' => '/',
            'secure' => $authOptions['secure'],
            'httponly' => false,
            'samesite' => 'Strict'
        ]
    );
}

function clearAuthCookies()
{
    $expired = time() - 3600;
    $options = buildCookieOptions($expired);
    $legacyOptions = $options;
    $legacyOptions['path'] = '/api';

    setcookie('ppds_token', '', $options);
    setcookie('ppds_token', '', $legacyOptions);

    setcookie(
        'ppds_csrf',
        '',
        [
            'expires' => $expired,
            'path' => '/',
            'secure' => $options['secure'],
            'httponly' => false,
            'samesite' => 'Strict'
        ]
    );

    setcookie(
        'ppds_csrf',
        '',
        [
            'expires' => $expired,
            'path' => '/api',
            'secure' => $options['secure'],
            'httponly' => false,
            'samesite' => 'Strict'
        ]
    );
}

function revokeCurrentToken()
{
    $token = $_COOKIE['ppds_token'] ?? '';
    if (!$token) {
        return;
    }

    $payload = verifyJWT($token);
    if (!$payload) {
        return;
    }

    revokeJtiUntil((string)$payload['jti'], (int)$payload['exp']);
}

function requireCsrfToken()
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

    if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
        return;
    }

    $cookieToken = $_COOKIE['ppds_csrf'] ?? '';
    $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

    if (
        !$cookieToken ||
        !$headerToken ||
        !hash_equals($cookieToken, $headerToken)
    ) {
        jsonError('Invalid CSRF token', 419);
    }
}

function getAuthUser()
{
    if (!empty($_COOKIE['ppds_token'])) {
        return verifyJWT($_COOKIE['ppds_token']);
    }
    return null;
}

function requireAuth($enforceCsrf = true)
{
    $user = getAuthUser();
    if (!$user) {
        jsonError('Unauthorized', 401);
    }

    if ($enforceCsrf) {
        requireCsrfToken();
    }

    return $user;
}

function requireRoleLevel($minimumLevel)
{
    $user = requireAuth();
    $userLevel = (int)($user['level'] ?? 0);

    if ($userLevel < (int)$minimumLevel) {
        jsonError('Forbidden', 403);
    }

    return $user;
}

function requireAdmin()
{
    return requireRoleLevel(5);
}

function requireEditor()
{
    return requireRoleLevel(1);
}
