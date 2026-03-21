<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

requireRoleLevel(10);
$deleted = purgeExpiredRevokedTokens(true);

jsonResponse([
    'success' => true,
    'deleted' => $deleted
]);