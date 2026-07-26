// HAPPYAD V782 — Push production : livraison stable, avatar réel vérifié et endpoint actif unique
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
  return clean(profile.full_name || profile.display_name || profile.name || profile.username || profile.handle)
}

function profileName(profile: Record<string, unknown>): string {
  return profileNameCandidate(profile) || 'Utilisateur HAPPYAD'
}

function unwrapAvatarValue(value: unknown): string {
  const raw = clean(value)
  const match = raw.match(/^url\(["']?(.*?)["']?\)$/i)
  return match ? clean(match[1]) : raw
}

function nestedObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function avatarValues(profile: Record<string, unknown>): unknown[] {
  const nested = [
    nestedObject(profile.profile), nestedObject(profile.user), nestedObject(profile.author),
    nestedObject(profile.creator), nestedObject(profile.owner), nestedObject(profile.metadata),
    nestedObject(profile.user_metadata), nestedObject(profile.raw_user_meta_data),
  ]
  const keys = [
    'avatar_url','avatarUrl','avatar','user_avatar','userAvatar','sender_avatar','senderAvatar',
    'sender_avatar_url','senderAvatarUrl','creator_avatar','creatorAvatar','author_avatar','authorAvatar',
    'profile_photo_url','profilePhotoUrl','profile_photo','profilePhoto','profile_picture_url',
    'profilePictureUrl','profile_picture','profilePicture','profile_image_url','profileImageUrl',
    'profile_image','profileImage','photo_url','photoUrl','photo','picture','picture_url','image_url',
    'imageUrl','profile_avatar_url','profileAvatarUrl','profile_pic_url','profilePicUrl','profile_pic',
    'profilePic','user_photo_url','userPhotoUrl','user_photo','userPhoto','photo_profil_url',
    'photoProfilUrl','photo_profil','photoProfil','profil_photo_url','profilPhotoUrl','profil_photo',
    'profilPhoto','photo_de_profil_url','photoDeProfilUrl','photo_de_profil','photoDeProfil',
    'avatar_path','avatarPath','photo_path','photoPath','profile_photo_path','profilePhotoPath',
    'profile_picture_path','profilePicturePath','profile_image_path','profileImagePath',
  ]
  const out: unknown[] = []
  for (const key of keys) out.push(profile[key])
  for (const row of nested) for (const key of keys) out.push(row[key])
  return out
}

function normalizeAvatarUrl(value: unknown, supabaseUrl: string): string {
  const raw = unwrapAvatarValue(value)
  const lower = raw.toLowerCase()
  if (!raw || raw.length > 8192 || /^data:|^blob:/i.test(raw)) return ''
  if (['none', 'null', 'undefined', 'default', 'avatar', 'user', '👤', '🧑'].includes(lower)) return ''
  if (lower.includes('placeholder') || lower.includes('default-avatar') || lower.includes('profile-placeholder')) return ''
  if (/^https:\/\//i.test(raw)) return raw
  if (/^http:\/\//i.test(raw)) return ''

  const base = clean(supabaseUrl).replace(/\/+$/, '')
  if (!base) return ''
  if (/^\/storage\/v1\/object\//i.test(raw)) return base + raw

  let path = raw.replace(/^\/+/, '')
  let bucket = 'happyad-media'
  const bucketMatch = path.match(/^(happyad-media|avatars|profile-photos|profile-images)\/(.+)$/i)
  if (bucketMatch) {
    bucket = bucketMatch[1]
    path = bucketMatch[2]
  }
  if (path.indexOf('/') < 0 && !/\.(png|jpe?g|webp|gif|avif)(?:[?#]|$)/i.test(path)) return ''
  const encodedPath = path.split('/').map((part) => encodeURIComponent(part)).join('/')
  return base + '/storage/v1/object/public/' + encodeURIComponent(bucket) + '/' + encodedPath
}

function storageLocation(value: string, supabaseUrl: string): { bucket: string; path: string } | null {
  const raw = clean(value)
  if (!raw) return null
  const base = clean(supabaseUrl).replace(/\/+$/, '')
  try {
    const url = new URL(raw, base || undefined)
    if (base && url.origin === new URL(base).origin) {
      const match = url.pathname.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/i)
      if (match) return { bucket: decodeURIComponent(match[1]), path: match[2].split('/').map(decodeURIComponent).join('/') }
    }
  } catch (_) {}
  let path = raw.replace(/^\/+/, '')
  const match = path.match(/^(happyad-media|avatars|profile-photos|profile-images)\/(.+)$/i)
  if (match) return { bucket: match[1], path: match[2] }
  if (!/^https?:/i.test(path) && path.includes('/')) return { bucket: 'happyad-media', path }
  return null
}

async function reachableAvatar(
  admin: ReturnType<typeof createClient>,
  value: unknown,
  supabaseUrl: string,
): Promise<string> {
  const normalized = normalizeAvatarUrl(value, supabaseUrl)
  if (!normalized) return ''
  try {
    const response = await fetch(normalized, {
      method: 'GET',
      redirect: 'follow',
      headers: { Range: 'bytes=0-2047', 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(4500),
    })
    const contentType = clean(response.headers.get('content-type')).toLowerCase()
    if ((response.ok || response.status === 206) && (!contentType || contentType.startsWith('image/'))) return normalized
  } catch (_) {}

  const location = storageLocation(normalized || clean(value), supabaseUrl)
  if (!location) return ''
  try {
    const signed = await admin.storage.from(location.bucket).createSignedUrl(location.path, 60 * 60 * 24 * 7)
    const signedUrl = clean(signed.data?.signedUrl)
    if (signed.error || !signedUrl) return ''
    return signedUrl
  } catch (_) {
    return ''
  }
}

function profileAvatarCandidate(profile: Record<string, unknown>, supabaseUrl: string): string {
  for (const candidate of avatarValues(profile)) {
    const resolved = normalizeAvatarUrl(candidate, supabaseUrl)
    if (resolved) return resolved
  }
  return ''
}

async function queryIdentityRows(
  admin: ReturnType<typeof createClient>,
  userId: string,
): Promise<Array<Record<string, unknown>>> {
  const rows: Array<Record<string, unknown>> = []
  const seen = new Set<string>()
  const add = (row: unknown) => {
    if (!row || typeof row !== 'object') return
    const record = row as Record<string, unknown>
    let key = ''
    try { key = JSON.stringify(record) } catch (_) {}
    if (key && seen.has(key)) return
    if (key) seen.add(key)
    rows.push(record)
  }
  const attempts: Array<Promise<void>> = []
  const lookup = (table: string, column: string) => {
    attempts.push((async () => {
      try {
        const result = await admin.from(table).select('*').eq(column, userId).limit(3)
        if (!result.error) for (const row of result.data || []) add(row)
      } catch (_) {}
    })())
  }
  for (const column of ['id','user_id','uid','auth_id','auth_user_id','account_uid']) lookup('profiles', column)
  for (const column of ['id','user_id','uid']) lookup('happyad_profiles', column)
  lookup('happyad_presence', 'user_id')
  await Promise.all(attempts)
  return rows
}

async function resolveSenderIdentity(
  admin: ReturnType<typeof createClient>,
  supabaseUrl: string,
  userId: string,
  message: Record<string, unknown>,
) {
  const rows = await queryIdentityRows(admin, userId)

  try {
    const authResult = await admin.auth.admin.getUserById(userId)
    const authUser = authResult.data?.user
    if (authUser?.user_metadata) rows.push({
      ...authUser.user_metadata,
      user_metadata: authUser.user_metadata,
      raw_user_meta_data: authUser.user_metadata,
    } as Record<string, unknown>)
  } catch (_) {}

  if (message && typeof message === 'object') rows.push(message)

  let name = ''
  let badge = ''
  let handle = ''
  const avatarCandidates: string[] = []
  for (const row of rows) {
    if (!name) name = profileNameCandidate(row)
    if (!badge) badge = profileBadge(row)
    if (!handle) handle = profileHandle(row)
    for (const value of avatarValues(row)) {
      const candidate = normalizeAvatarUrl(value, supabaseUrl)
      if (candidate && !avatarCandidates.includes(candidate)) avatarCandidates.push(candidate)
    }
  }

  let avatar = ''
  let avatarSource = ''
  for (const candidate of avatarCandidates.slice(0, 24)) {
    const valid = await reachableAvatar(admin, candidate, supabaseUrl)
    if (valid) {
      avatar = valid
      avatarSource = candidate === valid ? 'public-url' : 'signed-storage-url'
      break
    }
  }

  return {
    name: name || 'Utilisateur HAPPYAD',
    avatar,
    avatar_source: avatarSource || (avatarCandidates.length ? 'unreachable' : 'missing'),
    badge,
    handle,
  }
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
  const senderAvatarSource = senderIdentity.avatar_source
  const senderHandle = senderIdentity.handle
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
  })
})
