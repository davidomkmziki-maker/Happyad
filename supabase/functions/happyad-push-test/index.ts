// HAPPYAD V785 — Push Messages : avatar expéditeur réel, source traçable et fallback sans perdre la livraison
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function clean(value: unknown): string {
  return String(value ?? '').trim()
}

function isUuid(value: unknown): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean(value))
}

function boolValue(value: unknown): boolean {
  if (value === true || value === 1) return true
  return ['1', 'true', 'yes', 'on'].includes(clean(value).toLowerCase())
}

function finite(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}


function profileNameCandidate(profile: Record<string, unknown>): string {
  const metadata = profile.user_metadata && typeof profile.user_metadata === 'object'
    ? profile.user_metadata as Record<string, unknown>
    : {}
  return clean(
    profile.full_name || profile.display_name || profile.name || profile.user_name ||
    profile.username || profile.handle || metadata.full_name || metadata.name || metadata.user_name,
  )
}

function profileName(profile: Record<string, unknown>): string {
  return profileNameCandidate(profile) || 'Utilisateur HAPPYAD'
}

function unwrapAvatarValue(value: unknown): string {
  const raw = clean(value)
  const match = raw.match(/^url\(["']?(.*?)["']?\)$/i)
  return match ? clean(match[1]) : raw
}

function safeDecode(value: string): string {
  try { return decodeURIComponent(value) } catch (_) { return value }
}

function encodeStoragePath(path: string): string {
  return path
    .split('/')
    .filter((part) => part !== '')
    .map((part) => encodeURIComponent(safeDecode(part)))
    .join('/')
}

function isRejectedAvatarValue(value: string): boolean {
  const lower = value.toLowerCase()
  if (!value || value.length > 4096 || /^data:|^blob:/i.test(value)) return true
  if (['none', 'null', 'undefined', 'default', 'avatar', 'user', '👤', '🧑'].includes(lower)) return true
  return lower.includes('placeholder') || lower.includes('default-avatar') || lower.includes('avatar-default')
}

type AvatarFieldCandidate = {
  raw: string
  field: string
}

type AvatarUrlCandidate = {
  url: string
  method: string
  bucket?: string
  path?: string
}

type IdentityRow = {
  row: Record<string, unknown>
  source: string
  table: string
  match: string
  priority: number
}

function profileAvatarFields(profile: Record<string, unknown>): AvatarFieldCandidate[] {
  const metadata = profile.user_metadata && typeof profile.user_metadata === 'object'
    ? profile.user_metadata as Record<string, unknown>
    : {}
  const rawMetadata = profile.raw_user_meta_data && typeof profile.raw_user_meta_data === 'object'
    ? profile.raw_user_meta_data as Record<string, unknown>
    : {}
  const fields: Array<[string, unknown]> = [
    ['avatar_url', profile.avatar_url], ['avatarUrl', profile.avatarUrl], ['avatar', profile.avatar],
    ['user_avatar', profile.user_avatar], ['creator_avatar', profile.creator_avatar], ['author_avatar', profile.author_avatar],
    ['profile_photo_url', profile.profile_photo_url], ['profile_photo', profile.profile_photo],
    ['profile_picture_url', profile.profile_picture_url], ['profile_picture', profile.profile_picture],
    ['profile_pic_url', profile.profile_pic_url], ['profile_pic', profile.profile_pic],
    ['photo_url', profile.photo_url], ['photo', profile.photo], ['picture', profile.picture],
    ['image_url', profile.image_url], ['profile_image_url', profile.profile_image_url], ['profile_avatar_url', profile.profile_avatar_url],
    ['user_photo_url', profile.user_photo_url], ['avatar_image_url', profile.avatar_image_url],
    ['photo_profil_url', profile.photo_profil_url], ['photo_profil', profile.photo_profil],
    ['profil_photo_url', profile.profil_photo_url], ['profil_photo', profile.profil_photo],
    ['profil_image_url', profile.profil_image_url], ['profil_image', profile.profil_image],
    ['photo_de_profil_url', profile.photo_de_profil_url], ['photo_de_profil', profile.photo_de_profil],
    ['sender_avatar', profile.sender_avatar], ['author_photo', profile.author_photo],
    ['avatar_path', profile.avatar_path], ['photo_path', profile.photo_path],
    ['profile_photo_path', profile.profile_photo_path], ['profile_picture_path', profile.profile_picture_path],
    ['profile_image_path', profile.profile_image_path],
    ['user_metadata.avatar_url', metadata.avatar_url], ['user_metadata.avatar', metadata.avatar],
    ['user_metadata.picture', metadata.picture], ['user_metadata.photo_url', metadata.photo_url],
    ['raw_user_meta_data.avatar_url', rawMetadata.avatar_url], ['raw_user_meta_data.avatar', rawMetadata.avatar],
    ['raw_user_meta_data.picture', rawMetadata.picture], ['raw_user_meta_data.photo_url', rawMetadata.photo_url],
  ]
  const seen = new Set<string>()
  const out: AvatarFieldCandidate[] = []
  for (const [field, value] of fields) {
    const raw = unwrapAvatarValue(value)
    if (isRejectedAvatarValue(raw) || seen.has(raw)) continue
    seen.add(raw)
    out.push({ raw, field })
  }
  return out
}

function avatarUrlCandidates(value: string, supabaseUrl: string): AvatarUrlCandidate[] {
  const raw = unwrapAvatarValue(value)
  if (isRejectedAvatarValue(raw)) return []
  const base = clean(supabaseUrl).replace(/\/+$/, '')
  const out: AvatarUrlCandidate[] = []
  const seen = new Set<string>()
  const add = (candidate: AvatarUrlCandidate) => {
    const url = clean(candidate.url)
    if (!url || seen.has(url)) return
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'https:') return
    } catch (_) { return }
    seen.add(url)
    out.push({ ...candidate, url })
  }
  if (/^\/\//.test(raw)) {
    add({ url: 'https:' + raw, method: 'protocol-relative' })
    return out
  }
  if (/^https:\/\//i.test(raw)) {
    add({ url: raw, method: 'absolute-https' })
    return out
  }
  if (/^http:\/\//i.test(raw) || !base) return out

  if (/^\/?storage\/v1\/object\/(?:public|sign)\//i.test(raw)) {
    add({ url: base + '/' + raw.replace(/^\/+/, ''), method: 'supabase-storage-url' })
    return out
  }

  let path = raw.replace(/^\/+/, '').split(/[?#]/)[0]
  path = safeDecode(path)
  if (!path) return out

  const addPublic = (bucket: string, objectPath: string, method: string) => {
    const encodedBucket = encodeURIComponent(bucket)
    const encodedPath = encodeStoragePath(objectPath)
    if (!encodedPath) return
    add({
      url: base + '/storage/v1/object/public/' + encodedBucket + '/' + encodedPath,
      method,
      bucket,
      path: objectPath,
    })
  }

  const explicitHappyad = path.match(/^happyad-media\/(.+)$/i)
  if (explicitHappyad) {
    addPublic('happyad-media', explicitHappyad[1], 'happyad-media-explicit')
    return out
  }

  /* Dans HAPPYAD, `avatars/...`, `profile-photos/...` et `profile-images/...`
     sont d'abord des DOSSIERS du bucket officiel `happyad-media`. Les versions
     précédentes les traitaient comme des buckets séparés, ce qui fabriquait
     une URL 404 et forçait le logo HAPPYAD dans la notification. */
  const folderPrefix = path.match(/^(avatars|profile-photos|profile-images)\/(.+)$/i)
  if (folderPrefix) {
    addPublic('happyad-media', path, 'happyad-media-folder')
    addPublic(folderPrefix[1], folderPrefix[2], 'legacy-separate-bucket')
    return out
  }

  addPublic('happyad-media', path, 'happyad-media-default')
  return out
}

function likelyImageUrl(url: string): boolean {
  try { return /\.(png|jpe?g|webp|gif|avif)(?:$|[?#])/i.test(new URL(url).pathname) } catch (_) { return false }
}

async function probeAvatarUrl(url: string): Promise<{ ok: boolean; reason: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3200)
  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' },
    })
    let contentType = clean(response.headers.get('content-type')).toLowerCase()
    if (response.ok && (contentType.startsWith('image/') || (!contentType && likelyImageUrl(response.url || url)))) {
      try { await response.body?.cancel() } catch (_) {}
      return { ok: true, reason: 'head-ok' }
    }
    if ([405, 501].includes(response.status) || (response.ok && !contentType)) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
        signal: controller.signal,
        headers: { Range: 'bytes=0-2047', Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' },
      })
      contentType = clean(response.headers.get('content-type')).toLowerCase()
      const ok = (response.ok || response.status === 206) &&
        (contentType.startsWith('image/') || (!contentType && likelyImageUrl(response.url || url)))
      try { await response.body?.cancel() } catch (_) {}
      return { ok, reason: ok ? 'get-ok' : 'get-' + response.status }
    }
    try { await response.body?.cancel() } catch (_) {}
    return { ok: false, reason: 'head-' + response.status }
  } catch (error) {
    const message = clean((error as { name?: string; message?: string })?.name || (error as { message?: string })?.message || error)
    return { ok: false, reason: message.toLowerCase().includes('abort') ? 'timeout' : 'network-error' }
  } finally {
    clearTimeout(timer)
  }
}

async function signedAvatarUrl(
  admin: ReturnType<typeof createClient>,
  candidate: AvatarUrlCandidate,
): Promise<string> {
  if (!candidate.bucket || !candidate.path) return ''
  try {
    const result = await admin.storage.from(candidate.bucket).createSignedUrl(candidate.path, 604800)
    return clean(result?.data?.signedUrl)
  } catch (_) { return '' }
}

async function resolveAvatarFromRows(
  admin: ReturnType<typeof createClient>,
  supabaseUrl: string,
  rows: IdentityRow[],
) {
  const expanded: Array<AvatarUrlCandidate & { source: string; field: string; raw: string; table: string; match: string }> = []
  const seen = new Set<string>()
  for (const entry of rows) {
    for (const field of profileAvatarFields(entry.row)) {
      for (const candidate of avatarUrlCandidates(field.raw, supabaseUrl)) {
        if (seen.has(candidate.url)) continue
        seen.add(candidate.url)
        expanded.push({ ...candidate, source: entry.source, field: field.field, raw: field.raw, table: entry.table, match: entry.match })
        if (expanded.length >= 18) break
      }
      if (expanded.length >= 18) break
    }
    if (expanded.length >= 18) break
  }

  if (!expanded.length) {
    return { avatar: '', source: '', field: '', status: 'missing', fallbackReason: 'NO_AVATAR_VALUE', table: '', match: '' }
  }

  const checks = await Promise.all(expanded.map(async (candidate) => ({
    candidate,
    probe: await probeAvatarUrl(candidate.url),
  })))
  const verified = checks.find((item) => item.probe.ok)
  if (verified) {
    return {
      avatar: verified.candidate.url,
      source: verified.candidate.source + ':' + verified.candidate.method,
      field: verified.candidate.field,
      status: 'verified',
      fallbackReason: '',
      table: verified.candidate.table,
      match: verified.candidate.match,
    }
  }

  /* Si le bucket est privé, générer une URL signée longue durée. */
  for (const candidate of expanded.slice(0, 6)) {
    const signed = await signedAvatarUrl(admin, candidate)
    if (!signed) continue
    const probe = await probeAvatarUrl(signed)
    if (!probe.ok) continue
    return {
      avatar: signed,
      source: candidate.source + ':signed-' + candidate.method,
      field: candidate.field,
      status: 'verified-signed',
      fallbackReason: '',
      table: candidate.table,
      match: candidate.match,
    }
  }

  /* Ne pas supprimer une vraie valeur uniquement parce qu'un contrôle réseau
     temporaire a expiré : le Service Worker la vérifie encore une fois. */
  const first = expanded[0]
  const firstReason = checks[0]?.probe?.reason || 'unverified'
  return {
    avatar: first.url,
    source: first.source + ':' + first.method,
    field: first.field,
    status: 'unverified',
    fallbackReason: 'PROBE_' + firstReason.toUpperCase().replace(/[^A-Z0-9]+/g, '_'),
    table: first.table,
    match: first.match,
  }
}

async function collectIdentityRows(
  admin: ReturnType<typeof createClient>,
  userId: string,
  message: Record<string, unknown>,
): Promise<IdentityRow[]> {
  const specs = [
    { table: 'profiles', column: 'id', priority: 10 },
    { table: 'profiles', column: 'user_id', priority: 20 },
    { table: 'profiles', column: 'uid', priority: 30 },
    { table: 'profiles', column: 'auth_user_id', priority: 35 },
    { table: 'profiles', column: 'auth_id', priority: 40 },
    { table: 'profiles', column: 'account_uid', priority: 45 },
    { table: 'profiles', column: 'profile_id', priority: 50 },
    { table: 'happyad_profiles', column: 'id', priority: 55 },
    { table: 'happyad_profiles', column: 'user_id', priority: 58 },
    { table: 'happyad_profiles', column: 'uid', priority: 59 },
    { table: 'happyad_presence', column: 'user_id', priority: 60 },
  ]
  const found: IdentityRow[] = []
  await Promise.all(specs.map(async (spec) => {
    try {
      const result = await admin.from(spec.table).select('*').eq(spec.column, userId).limit(4)
      if (result.error || !Array.isArray(result.data)) return
      for (const row of result.data) {
        if (!row || typeof row !== 'object') continue
        found.push({
          row: row as Record<string, unknown>,
          source: spec.table + '.' + spec.column,
          table: spec.table,
          match: spec.column,
          priority: spec.priority,
        })
      }
    } catch (_) {}
  }))

  try {
    const authResult = await admin.auth.admin.getUserById(userId)
    const authUser = authResult.data?.user
    if (authUser) {
      found.push({
        row: {
          ...(authUser.user_metadata || {}),
          user_metadata: authUser.user_metadata || {},
          raw_user_meta_data: authUser.user_metadata || {},
          email: authUser.email || '',
        } as Record<string, unknown>,
        source: 'auth.user_metadata',
        table: 'auth.users',
        match: 'id',
        priority: 80,
      })
    }
  } catch (_) {}

  if (message && typeof message === 'object') {
    found.push({ row: message, source: 'message.snapshot', table: 'happyad_msg_messages', match: 'sender_id', priority: 100 })
  }

  found.sort((a, b) => a.priority - b.priority)
  const unique: IdentityRow[] = []
  const keys = new Set<string>()
  for (const entry of found) {
    const rowId = clean(entry.row.id || entry.row.user_id || entry.row.uid || entry.row.auth_user_id || entry.row.account_uid)
    const avatarKey = profileAvatarFields(entry.row)[0]?.raw || ''
    const key = [entry.table, rowId, avatarKey, profileNameCandidate(entry.row)].join('|')
    if (keys.has(key)) continue
    keys.add(key)
    unique.push(entry)
  }
  return unique
}

const senderIdentityCache = new Map<string, { expires: number; value: Record<string, string> }>()

async function resolveSenderIdentity(
  admin: ReturnType<typeof createClient>,
  supabaseUrl: string,
  userId: string,
  message: Record<string, unknown>,
) {
  const cached = senderIdentityCache.get(userId)
  if (cached && cached.expires > Date.now() && clean(cached.value.avatar)) return cached.value

  const rows = await collectIdentityRows(admin, userId, message)
  let name = ''
  let nameSource = ''
  let badge = ''
  let handle = ''
  for (const entry of rows) {
    if (!name) {
      const candidate = profileNameCandidate(entry.row)
      if (candidate) { name = candidate; nameSource = entry.source }
    }
    if (!badge) badge = profileBadge(entry.row)
    if (!handle) handle = profileHandle(entry.row)
  }

  const avatarResult = await resolveAvatarFromRows(admin, supabaseUrl, rows)
  const value = {
    name: name || 'Utilisateur HAPPYAD',
    nameSource,
    avatar: avatarResult.avatar,
    avatarSource: avatarResult.source,
    avatarField: avatarResult.field,
    avatarStatus: avatarResult.status,
    avatarFallbackReason: avatarResult.fallbackReason,
    profileTable: avatarResult.table,
    profileMatch: avatarResult.match,
    badge,
    handle,
  }
  if (value.avatar) senderIdentityCache.set(userId, { expires: Date.now() + 90000, value })
  console.log('HAPPYAD_PUSH_SENDER_IDENTITY', JSON.stringify({
    sender_id: userId,
    rows: rows.length,
    name_source: value.nameSource,
    avatar_resolved: !!value.avatar,
    avatar_source: value.avatarSource,
    avatar_field: value.avatarField,
    avatar_status: value.avatarStatus,
    avatar_fallback_reason: value.avatarFallbackReason,
    profile_table: value.profileTable,
    profile_match: value.profileMatch,
  }))
  return value
}

function profileBadge(profile: Record<string, unknown>): string {
  return clean(profile.badge || profile.user_badge || profile.badge_type || profile.certification || profile.verification_badge)
}

function profileHandle(profile: Record<string, unknown>): string {
  return clean(profile.username || profile.handle).replace(/^@+/, '')
}

function normalizedKind(message: Record<string, unknown>): string {
  return clean(message.kind || message.message_kind || message.message_type || 'text').toLowerCase() || 'text'
}

function notificationPreview(message: Record<string, unknown>): string {
  const kind = normalizedKind(message)
  const viewOnce = boolValue(message.view_once || message.is_view_once)
  const metadata = (message.metadata && typeof message.metadata === 'object')
    ? message.metadata as Record<string, unknown>
    : {}
  const forwarded = boolValue(metadata.forwarded)
  const prefix = forwarded ? 'Transféré · ' : ''

  if (viewOnce) {
    if (kind === 'photo') return 'Photo à vue unique'
    if (kind === 'video') return 'Vidéo à vue unique'
    if (kind === 'audio' || kind === 'voice' || kind === 'vocal') return 'Audio à vue unique'
    return 'Nouveau message à vue unique'
  }
  if (kind === 'photo') return prefix + 'Photo'
  if (kind === 'video') return prefix + 'Vidéo'
  if (kind === 'audio' || kind === 'voice' || kind === 'vocal') {
    const source = clean(metadata.source).toLowerCase()
    return prefix + (source.includes('recorder') ? 'Message vocal' : 'Audio')
  }
  if (kind === 'file') return prefix + 'Fichier'

  const text = clean(message.body || message.message_body || message.message_caption)
    .replace(/\s+/g, ' ')
    .slice(0, 120)
  return prefix + (text || 'Nouveau message')
}

function newestRowByUser(rows: Array<Record<string, unknown>>) {
  const selected = new Map<string, Record<string, unknown>>()
  for (const row of rows || []) {
    const uid = clean(row.user_id)
    if (!uid) continue
    const previous = selected.get(uid)
    if (!previous) {
      selected.set(uid, row)
      continue
    }
    const previousTime = Date.parse(clean(previous.updated_at)) || 0
    const currentTime = Date.parse(clean(row.updated_at)) || 0
    if (currentTime >= previousTime) selected.set(uid, row)
  }
  return selected
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const vapidPublic = Deno.env.get('HAPPYAD_VAPID_PUBLIC_KEY') ?? ''
  const vapidPrivate = Deno.env.get('HAPPYAD_VAPID_PRIVATE_KEY') ?? ''
  const vapidSubject = Deno.env.get('HAPPYAD_VAPID_SUBJECT') ?? 'mailto:admin@happyad.app'
  const authorization = req.headers.get('Authorization') ?? ''

  if (!supabaseUrl || !anonKey || !serviceRole || !vapidPublic || !vapidPrivate) {
    return json({ ok: false, error: 'PUSH_SERVER_NOT_CONFIGURED' }, 500)
  }
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return json({ ok: false, error: 'AUTH_REQUIRED' }, 401)
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await userClient.auth.getUser()
  const user = authData?.user
  if (authError || !user) return json({ ok: false, error: 'INVALID_SESSION' }, 401)

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch (_) {}
  const action = clean(body.action || (body.delay_seconds != null ? 'test' : 'message')).toLowerCase()

  const admin = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)

  async function disableEndpoint(endpoint: string) {
    try { await admin.rpc('happyad_push_disable_expired', { p_endpoint: endpoint }) } catch (_) {}
  }

  async function sendToRow(row: Record<string, unknown>, payload: string, topic = '') {
    const endpoint = clean(row.endpoint)
    if (!endpoint) return { sent: 0, failed: 1 }
    try {
      await webpush.sendNotification(
        {
          endpoint,
          keys: { p256dh: clean(row.p256dh), auth: clean(row.auth_key) },
        },
        payload,
        {
          TTL: 604800,
          urgency: 'high',
          topic: clean(topic).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) || undefined,
          contentEncoding: 'aes128gcm',
          timeout: 15000,
        },
      )
      return { sent: 1, failed: 0 }
    } catch (error) {
      const statusCode = Number((error as { statusCode?: number })?.statusCode ?? 0)
      if (statusCode === 403 || statusCode === 404 || statusCode === 410) {
        await disableEndpoint(endpoint)
      }
      console.error('HAPPYAD push send failed', statusCode, error)
      return { sent: 0, failed: 1 }
    }
  }

  if (action === 'test') {
    const requestedDelay = finite(body.delay_seconds, 0)
    const delaySeconds = Math.max(0, Math.min(30, Math.floor(requestedDelay)))
    const task = async () => {
      if (delaySeconds > 0) await sleep(delaySeconds * 1000)
      const { data: subscriptions, error } = await admin
        .from('happyad_push_subscriptions')
        .select('endpoint,p256dh,auth_key,updated_at')
        .eq('user_id', user.id)
        .eq('enabled', true)
        .order('updated_at', { ascending: false })
        .limit(1)
      if (error) throw error
      const row = subscriptions?.[0]
      if (!row) return { sent: 0, failed: 0 }
      return sendToRow(row, JSON.stringify({
        type: 'happyad_test',
        title: 'HAPPYAD',
        body: 'Les notifications HAPPYAD fonctionnent même lorsque l’application est fermée.',
        icon: './icons/happyad-icon-v535center1-192.png',
        badge: './icons/happyad-notification-badge-96.png',
        tag: 'happyad-push-test',
        renotify: true,
        url: './index.html?source=push-test',
        push_id: crypto.randomUUID(),
        sent_at: new Date().toISOString(),
        timestamp: Date.now(),
      }), 'happyad-push-test')
    }
    if (delaySeconds > 0) {
      EdgeRuntime.waitUntil(task().catch((error) => console.error('HAPPYAD delayed test failed', error)))
      return json({ ok: true, scheduled: true, delay_seconds: delaySeconds })
    }
    try { return json({ ok: true, ...(await task()) }) }
    catch (error) {
      console.error(error)
      return json({ ok: false, error: 'PUSH_SEND_FAILED' }, 500)
    }
  }

  if (action !== 'message') return json({ ok: false, error: 'UNKNOWN_ACTION' }, 400)

  const requestedMessageId = clean(body.message_id)
  const conversationId = clean(body.conversation_id)
  const clientMessageId = clean(body.client_message_id)
  if (!isUuid(conversationId) || (!isUuid(requestedMessageId) && !clientMessageId)) {
    return json({ ok: false, error: 'INVALID_MESSAGE_REFERENCE' }, 400)
  }

  let messageQuery = admin
    .from('happyad_msg_messages')
    .select('*')
    .eq('sender_id', user.id)
    .eq('conversation_id', conversationId)
  if (isUuid(requestedMessageId)) messageQuery = messageQuery.eq('id', requestedMessageId)
  else messageQuery = messageQuery.eq('client_message_id', clientMessageId)

  const { data: message, error: messageError } = await messageQuery.maybeSingle()
  if (messageError) {
    console.error('HAPPYAD message lookup failed', messageError)
    return json({ ok: false, error: 'MESSAGE_LOOKUP_FAILED' }, 500)
  }
  if (!message) return json({ ok: false, error: 'MESSAGE_NOT_FOUND' }, 404)
  if (clean(message.sender_id) !== user.id) return json({ ok: false, error: 'MESSAGE_NOT_OWNED' }, 403)

  const createdAt = new Date(clean(message.created_at) || Date.now()).getTime()
  if (Number.isFinite(createdAt) && Date.now() - createdAt > 172800000) {
    return json({ ok: false, error: 'MESSAGE_TOO_OLD' }, 409)
  }

  const { data: members, error: memberError } = await admin
    .from('happyad_msg_conversation_members')
    .select('*')
    .eq('conversation_id', conversationId)
  if (memberError) {
    console.error('HAPPYAD members lookup failed', memberError)
    return json({ ok: false, error: 'RECIPIENT_LOOKUP_FAILED' }, 500)
  }

  const recipients = (members || [])
    .map((row: Record<string, unknown>) => clean(row.user_id || row.member_id || row.profile_id))
    .filter((id: string, index: number, all: string[]) => isUuid(id) && id !== user.id && all.indexOf(id) === index)
  if (!recipients.length) return json({ ok: true, sent: 0, failed: 0, recipients: 0 })

  /* V781 : l'identité ne doit jamais bloquer la livraison. La recherche
     complète les anciens comptes `user_id` et les métadonnées Auth, mais
     toutes les erreurs restent silencieuses et le Push continue. */
  const senderIdentity = await resolveSenderIdentity(admin, supabaseUrl, user.id, message as Record<string, unknown>)
  const senderName = senderIdentity.name
  const senderAvatar = senderIdentity.avatar
  const senderBadge = senderIdentity.badge
  const senderHandle = senderIdentity.handle
  const senderAvatarSource = senderIdentity.avatarSource
  const senderAvatarField = senderIdentity.avatarField
  const senderAvatarStatus = senderIdentity.avatarStatus
  const senderAvatarFallbackReason = senderIdentity.avatarFallbackReason
  const senderProfileTable = senderIdentity.profileTable
  const senderProfileMatch = senderIdentity.profileMatch
  const messageId = clean(message.id)
  const serverSeq = Math.max(0, finite(message.server_seq, 0))
  const preview = notificationPreview(message)
  const kind = normalizedKind(message)
  const viewOnce = boolValue(message.view_once || message.is_view_once)

  const { data: subscriptionRows, error: subscriptionError } = await admin
    .from('happyad_push_subscriptions')
    .select('endpoint,p256dh,auth_key,user_id,updated_at')
    .in('user_id', recipients)
    .eq('enabled', true)
  if (subscriptionError) {
    console.error('HAPPYAD subscriptions lookup failed', subscriptionError)
    return json({ ok: false, error: 'SUBSCRIPTION_LOOKUP_FAILED' }, 500)
  }
  const subscriptionByUser = newestRowByUser((subscriptionRows || []) as Array<Record<string, unknown>>)

  const { data: existingDeliveries } = await admin
    .from('happyad_push_deliveries')
    .select('recipient_id,status')
    .eq('event_type', 'message')
    .eq('event_id', messageId)
  const deliveryMap = new Map((existingDeliveries || []).map((row: Record<string, unknown>) => [clean(row.recipient_id), clean(row.status)]))
  const memberMap = new Map((members || []).map((row: Record<string, unknown>) => [clean(row.user_id || row.member_id || row.profile_id), row]))

  let sent = 0
  let failed = 0
  let skipped = 0

  for (const recipientId of recipients) {
    if (deliveryMap.get(recipientId) === 'sent') {
      skipped += 1
      continue
    }

    const activeSubscription = subscriptionByUser.get(recipientId)
    const member = (memberMap.get(recipientId) || {}) as Record<string, unknown>
    const lastReadSeq = Math.max(0, finite(member.last_read_seq || member.read_through_seq, 0))
    const unreadCount = Math.max(1, serverSeq > 0 ? serverSeq - lastReadSeq : 1)

    await admin.from('happyad_push_deliveries').upsert({
      event_type: 'message',
      event_id: messageId,
      recipient_id: recipientId,
      status: activeSubscription ? 'pending' : 'no_subscription',
      attempts: 0,
      last_attempt_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'event_type,event_id,recipient_id' })

    if (!activeSubscription) {
      skipped += 1
      continue
    }

    const url = './index.html?happyad_push=message'
      + '&conversation_id=' + encodeURIComponent(conversationId)
      + '&message_id=' + encodeURIComponent(messageId)
      + '&sender_id=' + encodeURIComponent(user.id)
      + '&sender_name=' + encodeURIComponent(senderName)
      + '&sender_avatar=' + encodeURIComponent(senderAvatar)
      + '&sender_avatar_source=' + encodeURIComponent(senderAvatarSource)
      + '&sender_avatar_status=' + encodeURIComponent(senderAvatarStatus)
      + '&sender_badge=' + encodeURIComponent(senderBadge)
      + '&sender_handle=' + encodeURIComponent(senderHandle)

    const payload = JSON.stringify({
      type: 'happyad_message',
      app_name: 'HAPPYAD',
      push_id: crypto.randomUUID(),
      sent_at: new Date().toISOString(),
      title: senderName,
      body: preview,
      icon: senderAvatar || './icons/happyad-icon-v535center1-192.png',
      badge: './icons/happyad-notification-badge-96.png',
      tag: 'happyad-message-' + conversationId,
      renotify: true,
      requireInteraction: false,
      vibrate: [180, 80, 180],
      url,
      conversation_id: conversationId,
      message_id: messageId,
      sender_id: user.id,
      sender_name: senderName,
      sender_avatar: senderAvatar,
      sender_avatar_source: senderAvatarSource,
      sender_avatar_field: senderAvatarField,
      sender_avatar_status: senderAvatarStatus,
      sender_avatar_fallback_reason: senderAvatarFallbackReason,
      sender_profile_table: senderProfileTable,
      sender_profile_match: senderProfileMatch,
      sender_badge: senderBadge,
      sender_handle: senderHandle,
      message_kind: kind,
      view_once: viewOnce,
      unread_count: unreadCount,
      timestamp: Date.now(),
    })

    const result = await sendToRow(
      activeSubscription,
      payload,
      'msg-' + messageId.replace(/-/g, '').slice(0, 28),
    )
    sent += result.sent
    failed += result.failed

    await admin.from('happyad_push_deliveries').update({
      status: result.sent > 0 ? 'sent' : 'failed',
      attempts: 1,
      sent_at: result.sent > 0 ? new Date().toISOString() : null,
      last_attempt_at: new Date().toISOString(),
      last_error: result.sent > 0 ? null : 'ACTIVE_ENDPOINT_FAILED',
      updated_at: new Date().toISOString(),
    })
      .eq('event_type', 'message')
      .eq('event_id', messageId)
      .eq('recipient_id', recipientId)
  }

  return json({
    ok: true,
    action: 'message',
    message_id: messageId,
    recipients: recipients.length,
    sent,
    failed,
    skipped,
    sender_avatar_resolved: !!senderAvatar,
    sender_avatar_source: senderAvatarSource,
    sender_avatar_field: senderAvatarField,
    sender_avatar_status: senderAvatarStatus,
    sender_avatar_fallback_reason: senderAvatarFallbackReason,
  })
})
