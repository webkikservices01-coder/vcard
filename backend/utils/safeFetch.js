// Fetches a public web page for the user (e.g. to import their services). Guards against SSRF:
// only http(s) on the normal ports, every address the name resolves to (also after each redirect)
// must be a public one, at most 3 redirects, a size limit and a time limit. HTML only.
const http = require('http');
const https = require('https');
const dns = require('dns');
const net = require('net');

const UA = 'Mozilla/5.0 (compatible; AicardlyBot/1.0; +https://aicardly.com)';

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b, c] = ip.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) || // 192.0.0.0/24 and TEST-NET-1 only (192.0.66.x is WordPress.com)
      (a === 198 && (b === 18 || b === 19))
    );
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return isPrivateIp(v.slice(7));
  return v === '::' || v === '::1' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe8') || v.startsWith('fe9') || v.startsWith('fea') || v.startsWith('feb') || v.startsWith('ff');
}

// dns.lookup that refuses private addresses (used for every connection, including redirects).
function publicLookup(hostname, options, callback) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    if (!addresses.length || addresses.some((a) => isPrivateIp(a.address))) {
      return callback(Object.assign(new Error('That address is not a public website.'), { code: 'PRIVATE_ADDRESS' }));
    }
    if (options && options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
}

const fail = (msg) => Object.assign(new Error(msg), { status: 400 });

function checkUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    throw fail('Please enter a valid web address.');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw fail('Only http and https links can be read.');
  if (u.port && u.port !== '80' && u.port !== '443') throw fail('Only standard web ports are allowed.');
  if (u.username || u.password) throw fail('Links with a username or password are not allowed.');
  if (net.isIP(u.hostname.replace(/^\[|\]$/g, '')) && isPrivateIp(u.hostname.replace(/^\[|\]$/g, ''))) throw fail('That address is not a public website.');
  return u;
}

// types: which content types are accepted (default: HTML pages only).
function getOnce(u, { timeoutMs, maxBytes, types = /text\/html|application\/xhtml/i }) {
  return new Promise((resolve, reject) => {
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.get(
      u,
      { headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml', 'accept-encoding': 'identity', 'accept-language': 'en-IN,en;q=0.9' }, lookup: publicLookup, timeout: timeoutMs },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve({ redirect: new URL(res.headers.location, u).href });
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(fail(`The website answered with an error (${res.statusCode}).`));
        }
        const type = String(res.headers['content-type'] || '');
        if (type && !types.test(type)) {
          res.resume();
          return reject(fail('That link is not a web page.'));
        }
        let size = 0;
        const chunks = [];
        res.on('data', (c) => {
          size += c.length;
          if (size > maxBytes) {
            req.destroy();
            reject(fail('That page is too large to read.'));
          } else chunks.push(c);
        });
        res.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8'), type }));
        res.on('error', reject);
      }
    );
    req.on('timeout', () => req.destroy(fail('The website took too long to answer.')));
    req.on('error', (err) => reject(err.status ? err : fail(err.code === 'PRIVATE_ADDRESS' ? err.message : "Couldn't open that website. Please check the link.")));
  });
}

async function fetchPage(raw, { timeoutMs = 8000, maxBytes = 3 * 1024 * 1024, maxRedirects = 3, types } = {}) {
  let u = checkUrl(raw);
  for (let i = 0; i <= maxRedirects; i++) {
    const r = await getOnce(u, { timeoutMs, maxBytes, types });
    if (!r.redirect) return { url: u.href, html: r.html, type: r.type };
    u = checkUrl(r.redirect);
  }
  throw fail('That link redirects too many times.');
}

module.exports = { fetchPage, isPrivateIp, checkUrl };
