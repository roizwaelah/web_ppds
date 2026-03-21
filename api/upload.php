<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$user = requireRoleLevel(1);

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    jsonError('File tidak valid', 400);
}

$file = $_FILES['file'];

/* ============================= */
/* ===== CONFIG ================= */
/* ============================= */

$allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
];

$maxSize = 5 * 1024 * 1024; // 5MB

/* ============================= */
/* ===== SIZE CHECK ============ */
/* ============================= */

if ($file['size'] > $maxSize) {
    jsonError('Ukuran file maksimal 5MB', 400);
}

/* ============================= */
/* ===== MIME CHECK (OOP) ====== */
/* ============================= */

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

if (!in_array($mimeType, $allowedMimeTypes)) {
    jsonError('Tipe file tidak diizinkan', 400);
}

/* ============================= */
/* ===== VALIDASI GAMBAR ======= */
/* ============================= */

if (str_starts_with($mimeType, 'image/')) {
    if (!getimagesize($file['tmp_name'])) {
        jsonError('File bukan gambar valid', 400);
    }
}

/* ============================= */
/* ===== EXTENSION MAPPING ===== */
/* ============================= */

$extMap = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp',
    'application/pdf' => 'pdf'
];

$extension = $extMap[$mimeType];

/* ============================= */
/* ===== UPLOAD DIRECTORY ====== */
/* ============================= */

$uploadDir = dirname(__DIR__) . '/uploads/';

if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        jsonError('Gagal membuat folder upload', 500);
    }
}

/* ============================= */
/* ===== SAFE FILENAME ========= */
/* ============================= */

$filename = bin2hex(random_bytes(16)) . '.' . $extension;
$destination = $uploadDir . $filename;

/* ============================= */
/* ===== MOVE FILE ============= */
/* ============================= */

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    jsonError('Gagal menyimpan file', 500);
}

/* ============================= */
/* ===== RESPONSE ============== */
/* ============================= */

jsonResponse([
    'success' => true,
    'url' => '/uploads/' . $filename,
]);