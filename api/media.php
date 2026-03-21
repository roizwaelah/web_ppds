<?php
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/jwt.php';

$uploadDir = dirname(__DIR__) . '/uploads';
$uploadBase = '/uploads/';
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if (!is_dir($uploadDir)) {
    if ($method === 'GET') {
        requireRoleLevel(1);
        jsonResponse([]);
    }
    requireAdmin();
    jsonError('Folder uploads tidak ditemukan', 404);
}

function normalizeUploadFilename($raw)
{
    $decoded = rawurldecode((string)$raw);
    $filename = basename(trim($decoded));

    if ($filename === '' || $filename === '.' || $filename === '..') {
        jsonError('Nama file tidak valid', 400);
    }

    if ($filename !== $decoded && $filename !== basename(parse_url($decoded, PHP_URL_PATH) ?? '')) {
        jsonError('Nama file tidak valid', 400);
    }

    return $filename;
}

function listUploadMedia($uploadDir, $uploadBase)
{
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    $items = [];

    $iterator = new FilesystemIterator($uploadDir, FilesystemIterator::SKIP_DOTS);
    foreach ($iterator as $fileInfo) {
        if (!$fileInfo->isFile()) {
            continue;
        }

        $extension = strtolower($fileInfo->getExtension());
        if (!in_array($extension, $allowedExtensions, true)) {
            continue;
        }

        $items[] = [
            'name' => $fileInfo->getFilename(),
            'url' => $uploadBase . rawurlencode($fileInfo->getFilename()),
            'size' => $fileInfo->getSize(),
            'modified_at' => gmdate('c', $fileInfo->getMTime()),
            'extension' => $extension,
        ];
    }

    usort($items, function ($a, $b) {
        return strcmp($b['modified_at'], $a['modified_at']);
    });

    return $items;
}

if ($method === 'GET') {
    requireRoleLevel(1);
    jsonResponse(listUploadMedia($uploadDir, $uploadBase));
}

if ($method === 'DELETE') {
    $user = requireAdmin();
    $payload = getJsonInput();
    $filename = normalizeUploadFilename($payload['filename'] ?? '');
    $target = $uploadDir . DIRECTORY_SEPARATOR . $filename;

    if (!is_file($target)) {
        jsonError('File tidak ditemukan', 404);
    }

    if (!unlink($target)) {
        jsonError('Gagal menghapus file', 500);
    }

    jsonResponse([
        'success' => true,
        'message' => 'File berhasil dihapus',
        'filename' => $filename,
        'deleted_by' => $user['username'] ?? null,
    ]);
}

jsonError('Method not allowed', 405);
