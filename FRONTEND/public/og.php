<?php
// Serves index.html for every page of the React site with that page's own <head> already in
// the HTML: canonical, title, description, robots and Open Graph / Twitter tags. So "view
// source", SEO audit tools, search engines and link-preview bots all see the right tags without
// running JavaScript. (React keeps them in sync while you browse: src/components/Seo.jsx.)
//
//   - public pages: title/description from seo-pages.json, canonical https://aicardly.com/<path>
//   - card pages (/<username>, old /c/<username>): canonical /<username>; the card's own title,
//     description and share image come from the Node backend (bots wait for it; people get the
//     cached copy if there is one, so a visit is never slowed down)
//   - dashboard/admin/unknown pages: noindex, no canonical
// The tags replace the block between <!-- seo:start --> and <!-- seo:end --> in index.html.
// If anything fails, index.html is served unchanged.

const BACKEND = 'https://backend-nine-omega-26.vercel.app';

$index = @file_get_contents(__DIR__ . '/index.html');
if ($index === false) {
  http_response_code(500);
  exit;
}
header('Content-Type: text/html; charset=utf-8');
// Same as index.html: always fresh, so a new upload is picked up at once.
header('Cache-Control: no-cache, must-revalidate');

$isBot = (bool) preg_match('/bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|meta-externalagent|whatsapp|linkedin|telegram|discord|pinterest|skypeuripreview|embedly|iframely|vkshare|snapchat|lighthouse|screaming frog|ahrefs|semrush|inspectiontool/i', $_SERVER['HTTP_USER_AGENT'] ?? '');

$seo = json_decode(@file_get_contents(__DIR__ . '/seo-pages.json') ?: '{}', true) ?: [];
$site = rtrim($seo['site'] ?? 'https://aicardly.com', '/');
$pages = $seo['pages'] ?? [];

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = rtrim($path, '/');
if ($path === '' || $path === '/index.html') $path = '/';

function e($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); }

function tags($title, $desc, $url, $site, $type = 'website') {
  $img = $site . '/og-image.jpg';
  $alt = 'Aicardly – AI digital business card for modern professionals';
  return implode("\n    ", [
    '<title>' . e($title) . '</title>',
    '<meta name="description" content="' . e($desc) . '" />',
    '<meta name="robots" content="index, follow" />',
    '<link rel="canonical" href="' . e($url) . '" />',
    '<meta property="og:type" content="' . e($type) . '" />',
    '<meta property="og:site_name" content="Aicardly" />',
    '<meta property="og:locale" content="en_IN" />',
    '<meta property="og:url" content="' . e($url) . '" />',
    '<meta property="og:title" content="' . e($title) . '" />',
    '<meta property="og:description" content="' . e($desc) . '" />',
    '<meta property="og:image" content="' . e($img) . '" />',
    '<meta property="og:image:secure_url" content="' . e($img) . '" />',
    '<meta property="og:image:type" content="image/jpeg" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="' . e($alt) . '" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:title" content="' . e($title) . '" />',
    '<meta name="twitter:description" content="' . e($desc) . '" />',
    '<meta name="twitter:image" content="' . e($img) . '" />',
    '<meta name="twitter:image:alt" content="' . e($alt) . '" />',
  ]);
}

function noindex($title) {
  return '<title>' . e($title) . "</title>\n    " . '<meta name="robots" content="noindex, follow" />';
}

// Card tags from the backend, cached on disk for 10 minutes. Without $wait, only the cache is
// used (null on a miss), so people opening a card never wait for the backend.
function fetch_card($username, $wait, $kind = '') {
  $cacheFile = sys_get_temp_dir() . '/aicardly-og-' . ($kind ? $kind . '-' : '') . $username . '.json';
  if (is_file($cacheFile) && time() - filemtime($cacheFile) < 600) {
    $cached = json_decode(@file_get_contents($cacheFile), true);
    if (is_array($cached) && isset($cached['status'])) return $cached['status'] === 404 ? 404 : $cached['head'];
  }
  if (!$wait) return null;
  $url = BACKEND . '/api/og/' . ($kind ? $kind . '/' : '') . rawurlencode($username);
  $body = false;
  $status = 0;
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_FOLLOWLOCATION => true]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
  } elseif (ini_get('allow_url_fopen')) {
    $ctx = stream_context_create(['http' => ['timeout' => 8, 'ignore_errors' => true]]);
    $body = @file_get_contents($url, false, $ctx);
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) $status = (int) $m[1];
  }
  if ($status === 404) {
    @file_put_contents($cacheFile, json_encode(['status' => 404]));
    return 404;
  }
  if ($status !== 200 || !$body) return null;
  $data = json_decode($body, true);
  if (!is_array($data) || empty($data['head'])) return null;
  @file_put_contents($cacheFile, json_encode(['status' => 200, 'head' => $data['head']]));
  return $data['head'];
}

$head = null;
$isPrivate = false;
foreach (($seo['privatePrefixes'] ?? []) as $p) {
  if ($path === $p || strpos($path, $p . '/') === 0) $isPrivate = true;
}

if ($isPrivate) {
  $head = noindex('Dashboard | Aicardly');
} elseif (isset($pages[$path])) {
  $pg = $pages[$path];
  $head = !empty($pg['noindex'])
    ? noindex($pg['title'])
    : tags($pg['title'], $pg['description'], $site . ($path === '/' ? '/' : $path), $site);
  // Page-specific structured data (e.g. BreadcrumbList on /metal-nfc-card).
  foreach (($pg['jsonld'] ?? []) as $ld) {
    // "<" escaped so text inside the JSON can never close the script tag.
    $head .= "\n    " . '<script type="application/ld+json">' . str_replace('<', '<', json_encode($ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) . '</script>';
  }
} elseif (preg_match('#^/invite/([A-Za-z0-9-]{3,50})$#', $path, $m)) {
  // Wedding invitation: the couple's names, date and photo for WhatsApp / social previews.
  $inv = fetch_card(strtolower($m[1]), $isBot, 'invite');
  if ($inv === 404) {
    if ($isBot) http_response_code(404);
    $head = noindex('Invitation not found | Aicardly');
  } elseif ($inv !== null) {
    $head = $inv;
  } else {
    $head = tags('You are invited! | Aicardly', 'You are invited! Tap to see the details, venue and RSVP.', $site . '/invite/' . strtolower($m[1]), $site);
  }
} elseif (preg_match('#^/(?:wedding|invites)/([a-z0-9-]{3,60})$#', $path, $m)) {
  // A Digital Invite design (template preview).
  $head = tags('Digital Invitation Design | Aicardly', 'Preview this invitation design and make yours free on Aicardly: names, programme, venue map, photos, music, RSVP and an AI host.', $site . $path, $site);
} elseif ($path === '/wedding-preview') {
  $head = noindex('Invitation preview | Aicardly');
} elseif (preg_match('#^/(?:c/)?([A-Za-z0-9-]{3,30})$#', $path, $m)) {
  $card = fetch_card(strtolower($m[1]), $isBot);
  if ($card === 404) {
    if ($isBot) http_response_code(404);
    $head = noindex('Card not found | Aicardly');
  } elseif ($card !== null) {
    $head = $card;
  } else {
    // Backend unreachable: generic card tags, but still this card's own canonical.
    $head = tags('Digital Business Card | Aicardly', 'View this digital business card on Aicardly: save the contact, see their work and chat with their AI assistant.', $site . '/' . strtolower($m[1]), $site, 'profile');
  }
} else {
  if ($isBot) http_response_code(404);
  $head = noindex('Page not found | Aicardly');
}

if ($head !== null) {
  // Callback, so "$" or "\" in page text is never read as a regex back-reference.
  $index = preg_replace_callback('/<!-- seo:start.*?<!-- seo:end -->/s', function () use ($head) {
    return "<!-- seo:start -->\n    " . $head . "\n    <!-- seo:end -->";
  }, $index, 1);
}
// Homepage structured data (Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList)
// belongs to the homepage only; the FAQ it marks up is shown there.
if ($path !== '/') {
  $index = preg_replace('/\s*<!-- schema:home:start -->.*?<!-- schema:home:end -->/s', '', $index, 1);
  // The prerendered homepage markup (scripts/prerender.mjs) is only for "/"; other pages start
  // from an empty root.
  $index = preg_replace('/<!-- home:start -->.*?<!-- home:end -->/s', '<div id="root"></div>', $index, 1);
}
echo $index;
