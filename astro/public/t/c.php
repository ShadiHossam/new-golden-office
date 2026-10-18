<?php
// First-party analytics collector for /js/ngo-track.js.
// Appends one JSON line per request to <ANALYTICS_DIR>/YYYY-MM-DD.ndjson.
// No database, no Node: roughly 1 ms of Apache+PHP per visit. The admin CMS
// (admin/lib/analytics-store.js) reads these files only when the owner opens
// the Analytics page. Bad or foreign requests get a silent 204.

header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    exit;
}

function done() {
    http_response_code(204);
    exit;
}

$max = 32768;
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > $max) done();

// Only accept beacons sent from our own pages.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === '' || $origin === 'null') $origin = $_SERVER['HTTP_REFERER'] ?? '';
$host = strtolower((string)parse_url($origin, PHP_URL_HOST));
$allowed = preg_match('/(^|\.)newgoldenoffice\.com$/', $host)
    || (getenv('NGO_ANALYTICS_DEV') && in_array($host, ['localhost', '127.0.0.1'], true));
if (!$allowed) done();

$ua = substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 200);
if ($ua === '' || preg_match('/bot|crawl|spider|slurp|lighthouse|headless|pagespeed|preview|curl|wget|python|httpclient/i', $ua)) done();

$raw = file_get_contents('php://input', false, null, 0, $max);
if ($raw === false || $raw === '') done();
$d = json_decode($raw, true);
if (!is_array($d)) done();

$k = $d['k'] ?? '';
if (!in_array($k, ['visit', 'lead', 'optout'], true)) done();
if (!is_string($d['uid'] ?? null) || !preg_match('/^u_[a-z0-9]{8,24}$/', $d['uid'])) done();
if ($k !== 'optout' && (!is_string($d['vid'] ?? null) || !preg_match('/^s_[a-z0-9]{8,24}$/', $d['vid']))) done();

$dir = getenv('NGO_ANALYTICS_DIR');
if (!$dir) $dir = dirname(rtrim($_SERVER['DOCUMENT_ROOT'] ?? __DIR__, '/')) . '/ngo-analytics';
if (!is_dir($dir) || !is_writable($dir)) done();

// Server-side fields. The raw IP is never stored, only a salted hash.
$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? ($_SERVER['REMOTE_ADDR'] ?? '');
$salt = @file_get_contents($dir . '/.salt');
$d['ts'] = gmdate('Y-m-d\TH:i:s\Z');
$d['ip'] = substr(hash('sha256', ($salt ?: 'ngo') . $ip), 0, 12);
$d['ua'] = $ua;
$d['cc'] = substr((string)($_SERVER['HTTP_CF_IPCOUNTRY'] ?? ''), 0, 4);
if (!empty($_SERVER['HTTP_CF_IPCITY'])) $d['city'] = substr($_SERVER['HTTP_CF_IPCITY'], 0, 60);
if (!empty($_SERVER['HTTP_CF_REGION'])) $d['reg'] = substr($_SERVER['HTTP_CF_REGION'], 0, 60);

$line = json_encode($d, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
if ($line === false || strlen($line) > $max + 2048) done();

@file_put_contents($dir . '/' . gmdate('Y-m-d') . '.ndjson', $line . "\n", FILE_APPEND | LOCK_EX);
done();
