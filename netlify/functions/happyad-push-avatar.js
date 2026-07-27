'use strict';

/* HAPPYAD V787 — avatar de notification normalisé pour Android.
   Le relais ne renvoie plus le format original au téléphone. Chaque photo est
   décodée côté Netlify, recadrée au centre, puis servie en PNG 192 x 192.
   Cela évite les rejets silencieux de certains moteurs Samsung/Chrome pour les
   JPEG très grands, WebP/AVIF, orientations EXIF ou réponses sans dimensions
   immédiatement décodables. */

const sharp = require('sharp');

const ALLOWED_HOSTS = new Set([
  'txjjyhupbejgjcianrmr.supabase.co',
  'lh3.googleusercontent.com',
  'googleusercontent.com'
]);

function allowedHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  if (ALLOWED_HOSTS.has(host)) return true;
  if (host.endsWith('.supabase.co')) return true;
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

function clean(value){ return String(value == null ? '' : value).trim(); }

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    return response(405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
  }

  const raw = clean(event.queryStringParameters && event.queryStringParameters.src);
  if (!raw || raw.length > 3000) return response(400, 'Missing avatar source');

  let url;
  try { url = new URL(raw); } catch (_) { return response(400, 'Invalid avatar source'); }
  if (url.protocol !== 'https:' || !allowedHost(url.hostname)) {
    return response(403, 'Avatar host not allowed', { 'Cache-Control': 'no-store' });
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

    const upstreamType = clean(upstream.headers.get('content-type')).split(';')[0].toLowerCase();
    if (upstreamType && !upstreamType.startsWith('image/')) {
      return response(415, 'Not an image', { 'Cache-Control': 'no-store' });
    }

    const input = Buffer.from(await upstream.arrayBuffer());
    if (!input.length || input.length > 8 * 1024 * 1024) {
      return response(413, 'Avatar size rejected', { 'Cache-Control': 'no-store' });
    }

    const output = await sharp(input, { failOn: 'none', limitInputPixels: 80_000_000 })
      .rotate()
      .resize(192, 192, {
        fit: 'cover',
        position: 'centre',
        withoutEnlargement: false
      })
      .png({ quality: 92, compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();

    const headers = {
      'Content-Type': 'image/png',
      'Content-Length': String(output.length),
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      'Content-Disposition': 'inline; filename="happyad-sender-avatar.png"'
    };
    if (event.httpMethod === 'HEAD') return response(200, '', headers);
    return response(200, output.toString('base64'), headers, true);
  } catch (error) {
    const message = clean(error && (error.name || error.message) || error || 'fetch failed');
    return response(504, message.slice(0, 160), { 'Cache-Control': 'no-store' });
  } finally {
    clearTimeout(timer);
  }
};
