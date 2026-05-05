<?php
// Serve OG-friendly image (jpeg) for social crawlers.

function badRequest()
{
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Bad request';
    exit;
}

function notFound()
{
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not found';
    exit;
}

$src = (string)($_GET['src'] ?? '');
if ($src === '' || !str_starts_with($src, '/')) {
    badRequest();
}

if (!str_starts_with($src, '/uploads/') && $src !== '/header_ppds.webp') {
    badRequest();
}

$root = dirname(__DIR__);
$real = realpath($root . $src);
if ($real === false || !is_file($real)) {
    notFound();
}

$realRoot = realpath($root);
if ($realRoot === false || strpos($real, $realRoot) !== 0) {
    badRequest();
}

$info = @getimagesize($real);
if ($info === false) {
    notFound();
}

$mime = (string)($info['mime'] ?? '');
$width = (int)($info[0] ?? 0);
$height = (int)($info[1] ?? 0);
if ($width < 1 || $height < 1) {
    notFound();
}

$canGd = function_exists('imagecreatetruecolor') && function_exists('imagejpeg');
if (!$canGd) {
    header('Content-Type: ' . ($mime !== '' ? $mime : 'application/octet-stream'));
    header('Cache-Control: public, max-age=604800');
    readfile($real);
    exit;
}

switch ($mime) {
    case 'image/jpeg':
        $srcImage = @imagecreatefromjpeg($real);
        break;
    case 'image/png':
        $srcImage = @imagecreatefrompng($real);
        break;
    case 'image/gif':
        $srcImage = @imagecreatefromgif($real);
        break;
    case 'image/webp':
        $srcImage = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($real) : false;
        break;
    default:
        $srcImage = false;
        break;
}

if (!$srcImage) {
    header('Content-Type: ' . ($mime !== '' ? $mime : 'application/octet-stream'));
    header('Cache-Control: public, max-age=604800');
    readfile($real);
    exit;
}

$targetW = 1200;
$targetH = 630;
$target = imagecreatetruecolor($targetW, $targetH);
$bg = imagecolorallocate($target, 255, 255, 255);
imagefill($target, 0, 0, $bg);

$scale = max($targetW / $width, $targetH / $height);
$cropW = (int)round($targetW / $scale);
$cropH = (int)round($targetH / $scale);
$srcX = max(0, (int)floor(($width - $cropW) / 2));
$srcY = max(0, (int)floor(($height - $cropH) / 2));

imagecopyresampled(
    $target,
    $srcImage,
    0,
    0,
    $srcX,
    $srcY,
    $targetW,
    $targetH,
    $cropW,
    $cropH
);

header('Content-Type: image/jpeg');
header('Cache-Control: public, max-age=604800');
imagejpeg($target, null, 84);

imagedestroy($srcImage);
imagedestroy($target);
