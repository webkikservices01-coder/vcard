// A small fetch helper with axios-style results ({ data, status }) and errors (err.response =
// { status, data }), for the public card pages: they make a handful of simple calls, and axios
// (~35 KB) made every card visitor download and run it before the card could show.
async function request(method, url, body, { headers = {}, timeout } = {}) {
  const hasBody = body !== undefined;
  const res = await fetch(url, {
    method,
    headers: { ...(hasBody ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: hasBody ? JSON.stringify(body) : undefined,
    signal: timeout && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(timeout) : undefined,
  });
  const text = await res.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* not JSON: keep the text */
  }
  if (!res.ok) {
    const err = new Error(`Request failed with status code ${res.status}`);
    err.response = { status: res.status, data };
    throw err;
  }
  return { data, status: res.status };
}

export const http = {
  get: (url, options) => request('GET', url, undefined, options),
  post: (url, body, options) => request('POST', url, body, options),
};
