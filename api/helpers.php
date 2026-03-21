<?php

@ini_set('expose_php', '0');
if (function_exists('header_remove')) {
    @header_remove('X-Powered-By');
}

// ===== SECURITY HEADERS =====
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');

// ===== CORS WHITELIST =====
$allowedOrigins = [
    'https://darussalampanusupan.net',
    'https://www.darussalampanusupan.net'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');
header('Vary: Origin');
header('Access-Control-Allow-Credentials: true');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ===== RESPONSE HELPERS =====
function jsonResponse($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError($message, $code = 400)
{
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ===== JSON INPUT SAFE =====
function getJsonInput()
{
    $input = file_get_contents('php://input');
    $decoded = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        jsonError('Invalid JSON format', 400);
    }

    return $decoded ?: [];
}

function safeJsonDecode($value, $fallback = [])
{
    if ($value === null || $value === '') return $fallback;
    if (is_array($value)) return $value;

    $decoded = json_decode($value, true);
    return (json_last_error() === JSON_ERROR_NONE) ? $decoded : $fallback;
}

function sanitizeUrlOrUploadPath($url, $allowEmpty = true)
{
    $url = trim((string)$url);

    if ($url === '') {
        return $allowEmpty ? '' : null;
    }

    if (preg_match('#^/uploads/[A-Za-z0-9._%\\-/]+$#', $url) === 1) {
        return $url;
    }

    if (filter_var($url, FILTER_VALIDATE_URL)) {
        return $url;
    }

    return $allowEmpty ? '' : null;
}
