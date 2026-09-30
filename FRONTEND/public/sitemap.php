<?php
// sitemap.xml (via .htaccess): the public pages from seo-pages.json plus every public card
// (aicardly.com/<username>) from the Node backend, minus cards whose owner turned off
// "Search Engine Indexing". The card list is cached for an hour; if the backend can't be reached
// the last cached list (or just the pages) is used.

const BACKEND = 'https://backend-nine-omega-26.vercel.app';

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$seo = json_decode(@file_get_contents(__DIR__ . '/seo-pages.json') ?: '{}', true) ?: [];
$site = rtrim($seo['site'] ?? 'https://aicardly.com', '/');
$today = gmdate('Y-m-d');

function cards() {
  $cache = sys_get_temp_dir() . '/aicardly-sitemap-cards.json';
  if (is_file($cache) && time() - filemtime($cache) < 3600) return json_decode(file_get_contents($cache), true) ?: [];
  $body = false;
  if (function_exists('curl_init')) {
    $ch = curl_init(BACKEND . '/api/og/_sitemap');
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_CONNECTTIMEOUT => 5]);
    $body = curl_exec($ch);
    if ((int) curl_getinfo($ch, CURLINFO_HTTP_CODE) !== 200) $body = false;
    curl_close($ch);
  } elseif (ini_get('allow_url_fopen')) {
    $body = @file_get_contents(BACKEND . '/api/og/_sitemap', false, stream_context_create(['http' => ['timeout' => 15]]));
  }
  $list = $body ? json_decode($body, true) : null;
  if (is_array($list)) {
    @file_put_contents($cache, json_encode($list));
    return $list;
  }
  return is_file($cache) ? (json_decode(file_get_contents($cache), true) ?: []) : [];
}

$e = function ($s) { return htmlspecialchars($s, ENT_XML1 | ENT_QUOTES, 'UTF-8'); };
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach (($seo['pages'] ?? []) as $path => $p) {
  if (!empty($p['noindex'])) continue;
  $priority = $path === '/' ? '1.0' : (in_array($path, ['/register', '/metal-nfc-card', '/features', '/pricing'], true) ? '0.8' : '0.5');
  echo '  <url><loc>' . $e($site . ($path === '/' ? '/' : $path)) . '</loc><lastmod>' . $today . '</lastmod><priority>' . $priority . "</priority></url>\n";
}
foreach (cards() as $c) {
  if (empty($c['u']) || !preg_match('/^[a-z0-9-]{3,30}$/', $c['u'])) continue;
  echo '  <url><loc>' . $e($site . '/' . $c['u']) . '</loc><lastmod>' . $e($c['t'] ?? $today) . "</lastmod><priority>0.6</priority></url>\n";
}
echo "</urlset>\n";
