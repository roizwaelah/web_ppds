<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

// Logout tetap idempotent, tapi jika user masih aktif tetap wajib valid CSRF.
if (getAuthUser()) {
    requireCsrfToken();
    revokeCurrentToken();
}

clearAuthCookies();

jsonResponse(['success' => true]);
