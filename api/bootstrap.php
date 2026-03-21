<?php
require_once __DIR__ . '/env.php';

// ===============================
// GLOBAL API BOOTSTRAP
// ===============================

// Dev-only: tampilkan error detail jika APP_ENV=local dan LOCAL_DEBUG=true
$appEnv = strtolower((string)(getenv('APP_ENV') ?: 'production'));
$localDebug = strtolower((string)(getenv('LOCAL_DEBUG') ?: 'false'));
$debugEnabled = ($appEnv === 'local') && in_array($localDebug, ['1', 'true', 'yes', 'on'], true);

if ($debugEnabled) {
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    error_reporting(0);
}

@ini_set('expose_php', '0');
if (function_exists('header_remove')) {
    @header_remove('X-Powered-By');
    @header_remove('Server');
}

// Pastikan tidak ada output sebelum header
if (headers_sent()) {
    exit('Headers already sent');
}

// JSON response
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
}

// Anti cache (penting untuk admin panel realtime)
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// CORS untuk dev local
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, Authorization');
header('Allow: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
