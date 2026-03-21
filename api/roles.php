<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

requireRoleLevel(5);

$stmt = $pdo->query("SELECT id, name, level FROM roles ORDER BY level ASC");

jsonResponse($stmt->fetchAll());