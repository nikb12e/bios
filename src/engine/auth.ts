// Prijava: Google Identity Services (ID žeton), e-pošta s kodo ali e-pošta z geslom. Stanje prijave za React.
import { useSyncExternalStore } from 'react'
import { bindUser, unbindUser, flushRemote, setUnauthorizedHandler } from './store'

// Open source različica: brez strežnika in brez računov. Napredek se shrani samo v tem brskalniku.
export const OFFLINE = true
export const GOOGLE_CLIENT_ID = ''
const LOCAL_USER: User = { id: 'local', email: '', name: 'Učenec', hasPw: false, google: false }

export interface User { id: string; email: string; name: string; picture?: string; hasPw: boolean; google: boolean }
export interface AuthState { status: 'loading' | 'out' | 'in'; user: User | null; offline?: boolean; note?: string }

const CACHE = 'bios:user'
let st: AuthState = { status: 'loading', user: null }
const subs = new Set<() => void>()
const put = (s: AuthState) => { st = s; subs.forEach(f => f()) }

export const useAuth = () => useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb) }, () => st, () => st)
export const authState = () => st

async function api<T>(path: string, body?: unknown): Promise<T> {
  if (OFFLINE) throw Object.assign(new Error('Open source različica nima strežnika.'), { status: 503, data: null })
  const r = await fetch(path, body === undefined ? { credentials: 'same-origin' } : { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  const ct = r.headers.get('content-type') ?? ''
  const j = (ct.includes('application/json') ? await r.json().catch(() => null) : null) as (T & { error?: string }) | null
  if (!r.ok || !j) throw Object.assign(new Error(j?.error || 'Strežnik ni dosegljiv (' + r.status + ').'), { status: r.status || 500, data: j })
  return j
}

async function signedIn(user: User, note?: string) {
  try { localStorage.setItem(CACHE, JSON.stringify(user)) } catch { /* ignore */ }
  await bindUser(user)
  put({ status: 'in', user, note })
}

export async function boot() {
  if (OFFLINE) {
    let user = LOCAL_USER
    try { user = { ...LOCAL_USER, ...(JSON.parse(localStorage.getItem(CACHE) ?? 'null') as Partial<User> | null) } } catch { /* ignore */ }
    await bindUser(user, { offline: true })
    put({ status: 'in', user })
    return
  }
  try {
    const j = await api<{ user: User }>('/api/auth/me')
    await signedIn(j.user)
  } catch (e) {
    const status = (e as { status?: number }).status
    // brez povezave: nadaljuj z zadnjim znanim računom, napredek se uskladi pozneje
    if (!status) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE) ?? 'null') as User | null
        if (cached) { await bindUser(cached, { offline: true }); put({ status: 'in', user: cached, offline: true }); return }
      } catch { /* ignore */ }
    }
    put({ status: 'out', user: null })
  }
}

// ključ iz gesla: PBKDF2 v brskalniku, sol je e-naslov (strežnik nikoli ne vidi gesla)
export async function deriveKey(email: string, password: string) {
  const enc = new TextEncoder()
  const base = await crypto.subtle.importKey('raw', enc.encode(password.normalize('NFKC')), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('bios|' + email.trim().toLowerCase()), iterations: 310000 }, base, 256)
  return btoa(String.fromCharCode(...new Uint8Array(bits)))
}

export async function loginGoogle(credential: string) {
  const j = await api<{ user: User; note?: string }>('/api/auth/google', { credential })
  await signedIn(j.user, j.note)
}

export async function loginEmail(email: string, password: string) {
  const key = await deriveKey(email, password)
  const j = await api<{ user: User }>('/api/auth/login', { email, key })
  await signedIn(j.user)
}

export async function registerEmail(name: string, email: string, password: string) {
  const key = await deriveKey(email, password)
  const j = await api<{ user: User }>('/api/auth/register', { name, email, key })
  await signedIn(j.user)
}

/* ───────── e-pošta s kodo ───────── */
let cfgP: Promise<{ code: boolean }> | null = null
export function authConfig() {
  cfgP ??= api<{ code: boolean }>('/api/auth/config').catch(() => { cfgP = null; return { code: false } })
  return cfgP
}
export async function sendCode(email: string, name?: string) {
  return api<{ ok: true; isNew: boolean; ttl: number }>('/api/auth/code/send', { email, name })
}
export async function verifyCode(email: string, code: string, name?: string) {
  const j = await api<{ user: User; isNew?: boolean }>('/api/auth/code/verify', { email, code, name })
  await signedIn(j.user, j.isNew ? `Dobrodošel v Biosu, ${j.user.name.split(' ')[0]}. Začni z dnevnim treningom.` : undefined)
}

export async function setPassword(password: string) {
  if (!st.user) return
  const key = await deriveKey(st.user.email, password)
  const j = await api<{ user: User }>('/api/auth/password', { key })
  put({ ...st, user: j.user, note: undefined })
}

export async function rename(name: string) {
  if (OFFLINE) {
    if (!st.user) return
    const user = { ...st.user, name }
    put({ ...st, user })
    try { localStorage.setItem(CACHE, JSON.stringify(user)) } catch { /* ignore */ }
    return
  }
  const j = await api<{ user: User }>('/api/auth/name', { name })
  put({ ...st, user: j.user })
  try { localStorage.setItem(CACHE, JSON.stringify(j.user)) } catch { /* ignore */ }
}

export async function logout() {
  if (OFFLINE) { unbindUser(true); try { localStorage.removeItem(CACHE) } catch { /* ignore */ } await boot(); return }
  await flushRemote().catch(() => {})
  await api('/api/auth/logout', {}).catch(() => {})
  try { (window as unknown as { google?: GoogleNS }).google?.accounts.id.disableAutoSelect() } catch { /* ignore */ }
  unbindUser(true)
  try { localStorage.removeItem(CACHE) } catch { /* ignore */ }
  put({ status: 'out', user: null })
}

export async function deleteAccount() {
  if (OFFLINE) return logout()
  await api('/api/auth/delete', { confirm: 'IZBRIŠI' })
  unbindUser(true)
  try { localStorage.removeItem(CACHE) } catch { /* ignore */ }
  put({ status: 'out', user: null })
}

// ko strežnik vrne 401 med uporabo (seja potekla)
export function expired() {
  if (st.status !== 'in' || st.offline) return
  unbindUser(false)
  put({ status: 'out', user: null, note: 'Seja je potekla. Prijavi se znova.' })
}

setUnauthorizedHandler(expired)

export const clearNote = () => { if (st.note) put({ ...st, note: undefined }) }

/* ───────── Google Identity Services ───────── */
export interface GoogleNS {
  accounts: { id: {
    initialize: (o: Record<string, unknown>) => void
    renderButton: (el: HTMLElement, o: Record<string, unknown>) => void
    prompt: () => void
    cancel: () => void
    disableAutoSelect: () => void
  } }
}
let gisP: Promise<GoogleNS> | null = null
export function loadGis(): Promise<GoogleNS> {
  if (gisP) return gisP
  gisP = new Promise((res, rej) => {
    const w = window as unknown as { google?: GoogleNS }
    if (w.google?.accounts?.id) return res(w.google)
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => (w.google ? res(w.google) : rej(new Error('gis')))
    s.onerror = () => { gisP = null; rej(new Error('gis')) }
    document.head.appendChild(s)
  })
  return gisP
}
