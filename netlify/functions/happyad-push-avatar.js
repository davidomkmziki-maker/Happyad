'use strict';

/* HAPPYAD V786 — relais image strict pour les icônes Web Push Android.
   La photo reste publique, mais elle est servie depuis le domaine HAPPYAD afin
   que Samsung Internet, Chrome et les WebView OEM puissent la décoder comme
   icône de notification quand la PWA est fermée. */

const ALLOWED_HOSTS = new Set([
  'txjjyhupbejgjcianrmr.supabase.co',
  'lh3.googleusercontent.com',
  'googleusercontent.com'
]);

function allowedHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  if (ALLOWED_HOSTS.has(host)) return true;
  if (host.endsWith('.googleusercontent.com')) return true;
  return false;
}

function response(statusCode, body, headers = {}, isBase64Encoded = false) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      ...headers
    },
    body,
    isBase64Encoded
  };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    return response(405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
  }

  const raw = String((event.queryStringParameters && event.queryStringParameters.src) || '').trim();
  if (!raw || raw.length > 3000) return response(400, 'Missing avatar source');

  let url;
  try { url = new URL(raw); } catch (_) { return response(400, 'Invalid avatar source'); }
  if (url.protocol !== 'https:' || !allowedHost(url.hostname)) {
    return response(403, 'Avatar host not allowed');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const upstream = await fetch(url.href, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { Accept: 'image/avif,image/webp,image/apng,image/png,image/jpeg,image/*,*/*;q=0.8' }
    });
    if (!upstream.ok) return response(upstream.status, 'Avatar unavailable', { 'Cache-Control': 'no-store' });

    const type = String(upstream.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!type.startsWith('image/')) return response(415, 'Not an image', { 'Cache-Control': 'no-store' });

    const bytes = Buffer.from(await upstream.arrayBuffer());
    if (!bytes.length || bytes.length > 6 * 1024 * 1024) {
      return response(413, 'Avatar size rejected', { 'Cache-Control': 'no-store' });
    }

    const headers = {
      'Content-Type': type,
      'Content-Length': String(bytes.length),
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
    };
    if (event.httpMethod === 'HEAD') return response(200, '', headers);
    return response(200, bytes.toString('base64'), headers, true);
  } catch (error) {
    const message = String(error && error.name || error && error.message || error || 'fetch failed');
    return response(504, message.slice(0, 160), { 'Cache-Control': 'no-store' });
  } finally {
    clearTimeout(timer);
  }
};
