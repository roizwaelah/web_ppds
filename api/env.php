<?php

/*
|--------------------------------------------------------------------------
| ENV LOADER - PRODUCTION HARDENED
|--------------------------------------------------------------------------
| - Shared hosting compatible
| - Prevent double load
| - Validate required variables
| - Safe for PHP 8.3
*/

if (!defined('ENV_LOADED')) {

    define('ENV_LOADED', true);

    $envPath = dirname(__DIR__) . '/.env';

    if (!file_exists($envPath)) {
        http_response_code(500);
        exit('Server configuration error.');
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {

        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        if (!str_contains($line, '=')) {
            continue;
        }

        [$name, $value] = explode('=', $line, 2);

        $name  = trim($name);
        $value = trim($value);
        $value = trim($value, "\"'");

        if (!getenv($name)) {
            putenv("$name=$value");
            $_ENV[$name] = $value;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | REQUIRED VARIABLES CHECK
    |--------------------------------------------------------------------------
    */

    $requiredVars = [
        'DB_HOST',
        'DB_NAME',
        'DB_USER',
        'DB_PASS',
        'JWT_SECRET'
    ];

    foreach ($requiredVars as $var) {
        if (getenv($var) === false) {
            http_response_code(500);
            exit('Server configuration error.');
        }
    }

}



