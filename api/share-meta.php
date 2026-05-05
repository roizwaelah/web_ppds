<?php
require_once __DIR__ . '/db.php';

const SITE_NAME = 'Pondok Pesantren Darussalam Panusupan';
const DEFAULT_DESCRIPTION = 'Website resmi Pondok Pesantren Darussalam Panusupan yang memuat profil pesantren, program pendidikan, pengumuman, pendaftaran, dan artikel santri.';
const DEFAULT_IMAGE = '/header_ppds.webp';
const DEFAULT_IMAGE_WIDTH = '1200';
const DEFAULT_IMAGE_HEIGHT = '630';

function escapeHtml($value = '')
{
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function slugifyTitle($value = '')
{
    $value = (string)$value;
    $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
    $value = strtolower($value);
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    $value = trim((string)$value, '-');
    $value = preg_replace('/-+/', '-', (string)$value);
    return $value !== '' ? $value : 'item';
}

function stripHtmlText($html = '')
{
    $text = preg_replace('/<(br|\/p|\/li|\/ol|\/ul|\/h[1-6])>/i', "\n", (string)$html);
    $text = preg_replace('/<style[^>]*>[\s\S]*?<\/style>/i', ' ', (string)$text);
    $text = preg_replace('/<script[^>]*>[\s\S]*?<\/script>/i', ' ', (string)$text);
    $text = strip_tags((string)$text);
    $text = html_entity_decode((string)$text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = preg_replace('/\s+/u', ' ', (string)$text);
    return trim((string)$text);
}

function extractContentImage($html = '')
{
    $content = (string)$html;
    if ($content === '') {
        return '';
    }

    $decoded = html_entity_decode($content, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $normalized = preg_replace('/\\\\([\"\'])/', '$1', $decoded);

    if (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', (string)$normalized, $matches) === 1) {
        return trim((string)($matches[1] ?? ''));
    }

    if (preg_match('/<img[^>]+src=([^\s>]+)/i', (string)$normalized, $matches) === 1) {
        return trim((string)($matches[1] ?? ''), "\"' ");
    }

    if (preg_match('#https?://[^\s"\']+/uploads/[^\s"\']+\.(?:png|jpe?g|gif|webp|svg)#i', (string)$normalized, $matches) === 1) {
        return trim((string)($matches[0] ?? ''));
    }

    if (preg_match('#/uploads/[^\s"\']+\.(?:png|jpe?g|gif|webp|svg)#i', (string)$normalized, $matches) === 1) {
        return trim((string)($matches[0] ?? ''));
    }

    return '';
}

function originUrl()
{
    $proto = (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']))
        ? $_SERVER['HTTP_X_FORWARDED_PROTO']
        : ((!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') ? 'https' : 'http');
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $proto . '://' . $host;
}

function normalizeImage($url, $origin)
{
    $normalized = trim((string)$url);
    if ($normalized === '') {
        return $origin . DEFAULT_IMAGE;
    }
    if (str_starts_with($normalized, 'data:')) {
        return $normalized;
    }
    if (preg_match('#^https?://#i', $normalized) === 1) {
        return preg_replace('#^http://#i', 'https://', $normalized);
    }
    if (str_starts_with($normalized, '//')) {
        return 'https:' . $normalized;
    }
    if (str_starts_with($normalized, '/')) {
        return $origin . $normalized;
    }
    if (str_starts_with($normalized, 'uploads/')) {
        return $origin . '/' . $normalized;
    }
    if (strpos($normalized, '/') === false) {
        return $origin . '/uploads/' . $normalized;
    }
    return $origin . DEFAULT_IMAGE;
}

function materializeDataImage($imageUrl, $origin)
{
    $value = trim((string)$imageUrl);
    if (!str_starts_with($value, 'data:image/')) {
        return $imageUrl;
    }

    if (!preg_match('#^data:image/([a-zA-Z0-9.+-]+);base64,(.+)$#s', $value, $matches)) {
        return $origin . DEFAULT_IMAGE;
    }

    $extRaw = strtolower((string)$matches[1]);
    $extMap = [
        'jpeg' => 'jpg',
        'jpg' => 'jpg',
        'png' => 'png',
        'gif' => 'gif',
        'webp' => 'webp',
    ];
    $ext = $extMap[$extRaw] ?? 'jpg';

    $binary = base64_decode((string)$matches[2], true);
    if ($binary === false || strlen($binary) < 32) {
        return $origin . DEFAULT_IMAGE;
    }

    $hash = sha1($binary);
    $relativeDir = '/uploads/og-inline';
    $dir = dirname(__DIR__) . $relativeDir;
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    if (!is_dir($dir)) {
        return $origin . DEFAULT_IMAGE;
    }

    $filename = $hash . '.' . $ext;
    $fullPath = $dir . '/' . $filename;
    if (!is_file($fullPath)) {
        @file_put_contents($fullPath, $binary, LOCK_EX);
    }

    if (!is_file($fullPath)) {
        return $origin . DEFAULT_IMAGE;
    }

    return $origin . $relativeDir . '/' . $filename;
}

function resolveLocalImageInfo($imageUrl, $origin)
{
    $result = [
        'imageWidth' => DEFAULT_IMAGE_WIDTH,
        'imageHeight' => DEFAULT_IMAGE_HEIGHT,
        'imageType' => '',
    ];

    $prefix = $origin . '/';
    if (!str_starts_with($imageUrl, $prefix)) {
        return $result;
    }

    $relativePath = substr($imageUrl, strlen($origin));
    if (!is_string($relativePath) || !str_starts_with($relativePath, '/')) {
        return $result;
    }

    $localPath = dirname(__DIR__) . $relativePath;
    if (!is_file($localPath)) {
        return $result;
    }

    $imageSize = @getimagesize($localPath);
    if ($imageSize !== false) {
        $result['imageWidth'] = (string)($imageSize[0] ?? DEFAULT_IMAGE_WIDTH);
        $result['imageHeight'] = (string)($imageSize[1] ?? DEFAULT_IMAGE_HEIGHT);
        if (!empty($imageSize['mime'])) {
            $result['imageType'] = (string)$imageSize['mime'];
        }
    }

    return $result;
}

function buildOgImageUrl($imageUrl, $origin)
{
    $prefix = $origin . '/';
    if (!str_starts_with($imageUrl, $prefix)) {
        return $imageUrl;
    }

    $relativePath = substr($imageUrl, strlen($origin));
    if (!is_string($relativePath) || !str_starts_with($relativePath, '/')) {
        return $imageUrl;
    }

    if (!str_starts_with($relativePath, '/uploads/') && $relativePath !== '/header_ppds.webp') {
        return $imageUrl;
    }

    return $origin . '/api/og-image.php?src=' . rawurlencode($relativePath);
}

function readIndexHtml()
{
    $root = dirname(__DIR__);
    $candidates = [
        $root . '/dist/index.html',
        $root . '/index.html',
    ];

    foreach ($candidates as $file) {
        if (is_file($file)) {
            return file_get_contents($file);
        }
    }

    throw new RuntimeException('index.html not found');
}

function injectMeta($html, $meta)
{
    $imageAlt = $meta['imageAlt'] ?: $meta['title'];
    $titleTag = '<title>' . escapeHtml($meta['title']) . '</title>';
    $metaBlock = "\n"
        . '    <meta name="description" content="' . escapeHtml($meta['description']) . "\" />\n"
        . '    <meta name="theme-color" content="#065f46" />' . "\n"
        . '    <meta name="robots" content="index, follow, max-image-preview:large" />' . "\n"
        . '    <meta property="og:type" content="' . escapeHtml($meta['type']) . "\" />\n"
        . '    <meta property="og:title" content="' . escapeHtml($meta['title']) . "\" />\n"
        . '    <meta property="og:description" content="' . escapeHtml($meta['description']) . "\" />\n"
        . '    <meta property="og:url" content="' . escapeHtml($meta['url']) . "\" />\n"
        . '    <meta property="og:site_name" content="' . escapeHtml(SITE_NAME) . "\" />\n"
        . '    <meta property="og:locale" content="id_ID" />' . "\n"
        . '    <meta property="og:image" content="' . escapeHtml($meta['image']) . "\" />\n"
        . '    <meta property="og:image:url" content="' . escapeHtml($meta['image']) . "\" />\n"
        . '    <meta property="og:image:secure_url" content="' . escapeHtml($meta['image']) . "\" />\n"
        . '    <meta property="og:image:width" content="' . escapeHtml($meta['imageWidth']) . "\" />\n"
        . '    <meta property="og:image:height" content="' . escapeHtml($meta['imageHeight']) . "\" />\n"
        . (!empty($meta['imageType']) ? '    <meta property="og:image:type" content="' . escapeHtml($meta['imageType']) . "\" />\n" : '')
        . '    <meta property="og:image:alt" content="' . escapeHtml($imageAlt) . "\" />\n"
        . '    <meta name="twitter:card" content="summary_large_image" />' . "\n"
        . '    <meta name="twitter:title" content="' . escapeHtml($meta['title']) . "\" />\n"
        . '    <meta name="twitter:description" content="' . escapeHtml($meta['description']) . "\" />\n"
        . '    <meta name="twitter:url" content="' . escapeHtml($meta['url']) . "\" />\n"
        . '    <meta name="twitter:image" content="' . escapeHtml($meta['image']) . "\" />\n"
        . '    <meta name="twitter:image:alt" content="' . escapeHtml($imageAlt) . "\" />\n"
        . '    <link rel="canonical" href="' . escapeHtml($meta['url']) . "\" />\n";

    $output = (string)$html;
    $output = preg_replace('/<title>[\s\S]*?<\/title>/i', $titleTag, $output, 1);
    $output = preg_replace('/<meta\s+name="description"[^>]*>\s*/i', '', $output);
    $output = preg_replace('/<meta\s+name="robots"[^>]*>\s*/i', '', $output);
    $output = preg_replace('/<link\s+rel="canonical"[^>]*>\s*/i', '', $output);
    $output = preg_replace('/<meta\s+(?:property|name)="og:[^"]*"[^>]*>\s*/i', '', $output);
    $output = preg_replace('/<meta\s+(?:property|name)="twitter:[^"]*"[^>]*>\s*/i', '', $output);
    $output = preg_replace('/<meta\s+property="article:[^"]*"[^>]*>\s*/i', '', $output);
    return str_replace('</head>', $metaBlock . "  </head>", (string)$output);
}

function getRequestPath()
{
    $rewritten = $_GET['path'] ?? '';
    if (is_string($rewritten) && str_starts_with($rewritten, '/')) {
        return $rewritten;
    }

    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    $path = parse_url($uri, PHP_URL_PATH);
    return is_string($path) && $path !== '' ? $path : '/';
}

function isDebugRequest()
{
    $appEnv = strtolower((string)(getenv('APP_ENV') ?: 'production'));
    $localDebug = strtolower((string)(getenv('LOCAL_DEBUG') ?: 'false'));
    $debugEnabled = ($appEnv === 'local') && in_array($localDebug, ['1', 'true', 'yes', 'on'], true);
    if (!$debugEnabled) {
        return false;
    }

    $flag = strtolower((string)($_GET['__meta_debug'] ?? ''));
    return in_array($flag, ['1', 'true', 'yes', 'on'], true);
}

function collectOgInlineReferences($text, &$set)
{
    if (!is_string($text) || $text === '') {
        return;
    }

    if (preg_match_all('#/uploads/og-inline/([a-f0-9]{40}\.(?:jpg|jpeg|png|gif|webp))#i', $text, $matches) !== false) {
        foreach (($matches[1] ?? []) as $name) {
            $set[strtolower((string)$name)] = true;
        }
    }
}

function maybeCleanupOgInlineFiles($pdo)
{
    if (mt_rand(1, 200) !== 1) {
        return;
    }

    $lockFile = sys_get_temp_dir() . '/ppds_og_inline_cleanup.lock';
    $lastRun = is_file($lockFile) ? (int)@file_get_contents($lockFile) : 0;
    $now = time();
    if (($now - $lastRun) < 21600) {
        return;
    }
    @file_put_contents($lockFile, (string)$now, LOCK_EX);

    $dir = dirname(__DIR__) . '/uploads/og-inline';
    if (!is_dir($dir)) {
        return;
    }

    $referenced = [];

    try {
        $stmt = $pdo->query("SELECT content FROM pengumuman WHERE content LIKE '%/uploads/og-inline/%'");
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            collectOgInlineReferences((string)($row['content'] ?? ''), $referenced);
        }
    } catch (Throwable $e) {
        // ignore cleanup query failure
    }

    try {
        $stmt = $pdo->query("SELECT content, image FROM pojok_santri WHERE content LIKE '%/uploads/og-inline/%' OR image LIKE '%/uploads/og-inline/%'");
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            collectOgInlineReferences((string)($row['content'] ?? ''), $referenced);
            collectOgInlineReferences((string)($row['image'] ?? ''), $referenced);
        }
    } catch (Throwable $e) {
        // ignore cleanup query failure
    }

    $graceSeconds = 14 * 86400;
    $entries = @scandir($dir);
    if (!is_array($entries)) {
        return;
    }

    foreach ($entries as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        $full = $dir . '/' . $entry;
        if (!is_file($full)) {
            continue;
        }
        $name = strtolower((string)$entry);
        if (isset($referenced[$name])) {
            continue;
        }
        $mtime = (int)@filemtime($full);
        if ($mtime > 0 && ($now - $mtime) < $graceSeconds) {
            continue;
        }
        @unlink($full);
    }
}

function resolveMeta($pdo, $pathname, $origin)
{
    $pageUrl = $origin . $pathname;

    if (str_starts_with($pathname, '/pojok-santri/')) {
        $slug = trim((string)urldecode(substr($pathname, strlen('/pojok-santri/'))));
        $slug = strtolower($slug);
        $stmt = $pdo->query("SELECT id, title, content, image FROM pojok_santri WHERE status = 'published' ORDER BY id DESC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $row) {
            $idMatch = (string)($row['id'] ?? '') === $slug;
            $slugMatch = slugifyTitle($row['title'] ?? '') === $slug;
            if ($idMatch || $slugMatch) {
                $description = mb_substr(stripHtmlText($row['content'] ?? ''), 0, 155) ?: 'Baca artikel terbaru dari santri Pondok Pesantren Darussalam Panusupan.';
                $imageCandidate = ($row['image'] ?? '') !== '' ? $row['image'] : extractContentImage($row['content'] ?? '');
                $image = normalizeImage($imageCandidate, $origin);
                $image = materializeDataImage($image, $origin);
                $ogImage = buildOgImageUrl($image, $origin);
                return [
                    'title' => ($row['title'] ?? SITE_NAME) . ' | ' . SITE_NAME,
                    'description' => $description,
                    'image' => $ogImage,
                    'imageAlt' => $row['title'] ?? SITE_NAME,
                    'url' => $pageUrl,
                    'type' => 'article',
                    'imageWidth' => '1200',
                    'imageHeight' => '630',
                    'imageType' => 'image/jpeg',
                ];
            }
        }
    }

    if (str_starts_with($pathname, '/pengumuman/')) {
        $slug = trim((string)urldecode(substr($pathname, strlen('/pengumuman/'))));
        $slug = strtolower($slug);
        $stmt = $pdo->query('SELECT id, title, content FROM pengumuman ORDER BY updated_at DESC, date DESC, id DESC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $row) {
            $idMatch = (string)($row['id'] ?? '') === $slug;
            $slugMatch = slugifyTitle($row['title'] ?? '') === $slug;
            if ($idMatch || $slugMatch) {
                $description = mb_substr(stripHtmlText($row['content'] ?? ''), 0, 155) ?: 'Informasi pengumuman resmi Pondok Pesantren Darussalam Panusupan.';
                $imageCandidate = extractContentImage($row['content'] ?? '');
                $image = normalizeImage($imageCandidate, $origin);
                $image = materializeDataImage($image, $origin);
                $ogImage = buildOgImageUrl($image, $origin);
                return [
                    'title' => ($row['title'] ?? SITE_NAME) . ' | ' . SITE_NAME,
                    'description' => $description,
                    'image' => $ogImage,
                    'imageAlt' => $row['title'] ?? SITE_NAME,
                    'url' => $pageUrl,
                    'type' => 'article',
                    'imageWidth' => '1200',
                    'imageHeight' => '630',
                    'imageType' => 'image/jpeg',
                ];
            }
        }
    }

    return [
        'title' => SITE_NAME,
        'description' => DEFAULT_DESCRIPTION,
        'image' => $origin . DEFAULT_IMAGE,
        'imageAlt' => SITE_NAME,
        'url' => $pageUrl,
        'type' => 'website',
        'imageWidth' => DEFAULT_IMAGE_WIDTH,
        'imageHeight' => DEFAULT_IMAGE_HEIGHT,
        'imageType' => 'image/webp',
    ];
}

try {
    $origin = originUrl();
    $pathname = getRequestPath();
    $html = readIndexHtml();
    maybeCleanupOgInlineFiles($pdo);
    $meta = resolveMeta($pdo, $pathname, $origin);

    if (isDebugRequest()) {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
        echo json_encode([
            'ok' => true,
            'origin' => $origin,
            'pathname' => $pathname,
            'meta' => $meta,
            'timestamp' => gmdate('c'),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    $output = injectMeta($html, $meta);

    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    echo $output;
} catch (Throwable $e) {
    header('Content-Type: text/plain; charset=utf-8');
    http_response_code(500);
    echo 'Failed to render share metadata.';
}
