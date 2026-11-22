import { useSyncExternalStore } from 'react'
import { review, type Grade, type Mem } from './fsrs'
import type { Task, TaskType } from '../data/bank'
import { updateAbil, abilityOf, fsrsGrade, type Abil } from './adapt'

export interface DayStat { n: number; ok: number; xp: number; ms: number }
export interface Settings { sound: boolean; ai: boolean; name: string; newPerSession: number; voice?: boolean }
export interface Miss { n: number; at: number; fixed?: number }
export interface TStat { n: number; ok: number; last: number; lastOk: 0 | 1 }
export interface TestResult { at: number; pct: number; grade: number; n: number; topic?: string }

export interface State {
  v: 2
  mem: Record<string, Mem>
  seenTask: Record<string, number> // task id -> last time
  types: Partial<Record<TaskType, { n: number; ok: number }>>
  days: Record<string, DayStat>
  tests: TestResult[]
  ai: Task[] // saved AI tasks
  settings: Settings
  learned: Record<string, number> // concept -> when it was first introduced
  /** mistake notebook: task -> how many times wrong, when last, when fixed */
  misses?: Record<string, Miss>
  /** knowledge level per concept (1 to 5, Elo) */
  abil?: Record<string, Abil>
  /** results per task: n, correct, last time, last result */
  tstat?: Record<string, TStat>
  /** last task type per concept (for variety) */
  ctype?: Record<string, TaskType>
  arena?: { games: number; hist: { at: number; place: number; of: number; pts: number; correct: number; n: number; dr: number }[] }
  updated: number
}

// Progress is tied to an account. The open source version has no server, so the only copy is in this browser.
const LOCAL_ONLY = true
const LEGACY = 'bios:v2'
let KEY: string | null = null

const fresh = (name = 'Learner'): State => ({
  v: 2, mem: {}, seenTask: {}, types: {}, days: {}, tests: [], ai: [], learned: {},
  settings: { sound: true, ai: true, name, newPerSession: 5 }, updated: 0,
})

function load(key: string): State | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const s = JSON.parse(raw) as State
      if (s && s.v === 2) return { ...fresh(), ...s, settings: { ...fresh().settings, ...s.settings } }
    }
  } catch { /* private mode or full storage */ }
  return null
}

let state: State = fresh()
const subs = new Set<() => void>()
let saveT: ReturnType<typeof setTimeout> | undefined
let syncT: ReturnType<typeof setTimeout> | undefined
let dirty = false
let onUnauthorized: () => void = () => {}
export const setUnauthorizedHandler = (f: () => void) => { onUnauthorized = f }

function emit() { subs.forEach(f => f()) }

// every answer is written to the device immediately, and to the cloud at most 1.2 s after the last change
function persist() {
  if (!KEY) return
  clearTimeout(saveT)
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* private mode or full storage */ }
  dirty = true
  clearTimeout(syncT)
  syncT = setTimeout(() => { void pushRemote() }, 1200)
}

export function set(fn: (s: State) => State) {
  state = { ...fn(state), updated: Date.now() }
  emit()
  persist()
}

export const get = () => state

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb) }, () => sel(state), () => sel(state))
}

export const dayKey = (t = Date.now()) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Records an answer: FSRS only on the first encounter of the concept in a session (firstInSession), otherwise a short boost.
export function record(opts: { task: Task; concepts: string[]; grade: Grade; ms: number; firstInSession: Set<string>; xp?: number; diff?: number; idk?: boolean }) {
  const { task, concepts, ms, firstInSession } = opts
  const ok = opts.grade >= 2 && !opts.idk
  set(s => {
    const mem = { ...s.mem }
    const abil = { ...s.abil }
    const d = opts.diff ?? 2.5
    // the level is updated for every concept of the task (the main concept fully, the others by half)
    concepts.forEach((c, i) => {
      const th0 = abilityOf(c, s.abil, s.mem[c])
      const nx = updateAbil(abil[c], th0, d, ok, opts.idk)
      abil[c] = i === 0 ? nx : { th: (th0 + nx.th) / 2, n: nx.n }
    })
    const grade = fsrsGrade(opts.grade, ok, abilityOf(concepts[0], s.abil, s.mem[concepts[0]]), d, s.mem[concepts[0]], opts.idk)
    concepts.forEach(c => {
      if (!firstInSession.has(c)) {
        mem[c] = review(mem[c], grade)
        firstInSession.add(c)
      } else if (mem[c]) {
        mem[c] = { ...mem[c], hist: [...mem[c].hist, ok ? 1 : 0].slice(-10) }
      }
    })
    const k = dayKey()
    const day = s.days[k] ?? { n: 0, ok: 0, xp: 0, ms: 0 }
    const ts = s.tstat?.[task.id]
    const ty = s.types[task.t] ?? { n: 0, ok: 0 }
    // mistake notebook: a wrong answer records the task, a correct answer to a recorded task marks it as fixed
    let misses = s.misses
    const prev = misses?.[task.id]
    const track = !task.id.startsWith('oral:')
    if (!track) { /* the oral exam has its own review */ }
    else if (!ok) misses = trimMisses({ ...misses, [task.id]: { n: (prev?.n ?? 0) + 1, at: Date.now() } })
    else if (prev && !prev.fixed) misses = { ...misses, [task.id]: { ...prev, fixed: Date.now() } }
    return {
      ...s, mem, misses, abil,
      tstat: { ...s.tstat, [task.id]: { n: (ts?.n ?? 0) + 1, ok: (ts?.ok ?? 0) + (ok ? 1 : 0), last: Date.now(), lastOk: ok ? 1 : 0 } },
      ctype: { ...s.ctype, [concepts[0]]: task.t },
      seenTask: { ...s.seenTask, [task.id]: Date.now() },
      days: { ...s.days, [k]: { n: day.n + 1, ok: day.ok + (ok ? 1 : 0), xp: day.xp + (opts.xp ?? (ok ? 10 : 2)), ms: day.ms + Math.min(ms, 180000) } },
      types: { ...s.types, [task.t]: { n: ty.n + 1, ok: ty.ok + (ok ? 1 : 0) } },
    }
  })
}

function trimMisses(m: Record<string, Miss>): Record<string, Miss> {
  const ks = Object.keys(m)
  if (ks.length <= 240) return m
  // first remove the oldest fixed ones, then the oldest
  const order = ks.sort((a, b) => (m[a].fixed ? 0 : 1) - (m[b].fixed ? 0 : 1) || m[a].at - m[b].at)
  const out = { ...m }
  order.slice(0, ks.length - 240).forEach(k => delete out[k])
  return out
}

export function clearFixedMisses() {
  set(s => {
    const out: Record<string, Miss> = {}
    Object.entries(s.misses ?? {}).forEach(([k, v]) => { if (!v.fixed) out[k] = v })
    return { ...s, misses: out }
  })
}

export function markLearned(ids: string[]) {
  set(s => {
    const learned = { ...s.learned }
    ids.forEach(id => { if (!learned[id]) learned[id] = Date.now() })
    return { ...s, learned }
  })
}

export function streak(s: State): number {
  let n = 0
  const t = new Date()
  for (let i = 0; i < 400; i++) {
    const k = dayKey(t.getTime() - i * 86400000)
    if (s.days[k]?.n) n++
    else if (i > 0) break
  }
  return n
}

/* ───────── progress on the account (Cloudflare D1) ───────── */

const payload = () => { const { ai, ...rest } = state; return JSON.stringify({ ...rest, ai: ai.slice(-60) }) }

export async function pushRemote(keepalive = false) {
  if (LOCAL_ONLY) { dirty = false; return }
  if (!KEY || !dirty) return
  dirty = false
  const body = payload()
  try {
    const r = await fetch('/api/progress', { method: 'PUT', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body, keepalive: keepalive && body.length < 60000 })
    if (r.status === 401) { onUnauthorized(); return }
    if (!r.ok) dirty = true
  } catch { dirty = true /* offline: try again on the next change or return */ }
}

export async function flushRemote() {
  clearTimeout(syncT)
  await pushRemote()
}

function mergeMem(a: Record<string, Mem>, b: Record<string, Mem>) {
  const out = { ...a }
  for (const [k, m] of Object.entries(b)) if (!out[k] || (m.last ?? 0) > (out[k].last ?? 0)) out[k] = m
  return out
}

function merge(local: State, remote: State): State {
  const days = { ...remote.days }
  for (const [k, d] of Object.entries(local.days)) if (!days[k] || d.n > days[k].n) days[k] = d
  const types = { ...remote.types }
  for (const [k, v] of Object.entries(local.types) as [TaskType, { n: number; ok: number }][]) if (!types[k] || v.n > types[k]!.n) types[k] = v
  const tests = [...remote.tests, ...local.tests].filter((t, i, arr) => arr.findIndex(x => x.at === t.at) === i).sort((x, y) => x.at - y.at)
  const ai = [...remote.ai, ...local.ai].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i).slice(-200)
  // mistake notebook: the newer record for every task
  const misses: Record<string, Miss> = { ...remote.misses }
  for (const [k, m] of Object.entries(local.misses ?? {})) {
    const r = misses[k]
    if (!r || Math.max(m.at, m.fixed ?? 0) >= Math.max(r.at, r.fixed ?? 0)) misses[k] = m
  }
  const la = local.arena, ra = remote.arena
  const arena = !la ? ra : !ra ? la : la.games >= ra.games ? la : ra
  const abil: Record<string, Abil> = { ...remote.abil }
  for (const [k, a] of Object.entries(local.abil ?? {})) if (!abil[k] || a.n >= abil[k].n) abil[k] = a
  const tstat: Record<string, TStat> = { ...remote.tstat }
  for (const [k, t] of Object.entries(local.tstat ?? {})) if (!tstat[k] || t.last >= tstat[k].last) tstat[k] = t
  return {
    ...local,
    misses, arena, abil, tstat, ctype: { ...remote.ctype, ...local.ctype },
    mem: mergeMem(local.mem, remote.mem),
    seenTask: { ...remote.seenTask, ...local.seenTask },
    learned: { ...remote.learned, ...local.learned },
    days, types, tests, ai,
    settings: local.updated >= remote.updated ? local.settings : { ...local.settings, ...remote.settings },
    updated: Math.max(local.updated, remote.updated),
  }
}

export async function pullRemote(): Promise<'ok' | 'empty' | 'err'> {
  if (LOCAL_ONLY) return 'empty'
  if (!KEY) return 'err'
  try {
    const r = await fetch('/api/progress', { credentials: 'same-origin' })
    if (r.status === 401) { onUnauthorized(); return 'err' }
    if (r.status === 404) { dirty = Object.keys(state.mem).length > 0 || state.updated > 0; if (dirty) await pushRemote(); return 'empty' }
    if (!r.ok) return 'err'
    const j = (await r.json()) as { updated: number; data: State }
    const remote = j.data
    if (!remote || remote.v !== 2) return 'err'
    const before = payload()
    state = merge(state, { ...fresh(), ...remote, settings: { ...fresh().settings, ...remote.settings } })
    emit()
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
    // if the device had anything new, send the merged state back
    if (payload() !== before || state.updated > (j.updated ?? 0)) { dirty = true; void pushRemote() }
    return 'ok'
  } catch { return 'err' }
}

// On sign in: load this user's progress on the device, move old (no account) progress over, merge with the server.
export async function bindUser(user: { id: string; name: string }, o: { offline?: boolean } = {}) {
  KEY = 'bios:v2:' + user.id
  let s = load(KEY)
  if (!s) {
    const legacy = load(LEGACY)
    if (legacy) {
      s = legacy
      try { localStorage.removeItem(LEGACY) } catch { /* ignore */ }
    }
  }
  const first = user.name.split(' ')[0] || 'Learner'
  state = s ?? fresh(first)
  if (!s) state = { ...state, settings: { ...state.settings, name: first } }
  emit()
  if (!o.offline) await pullRemote()
}

export function unbindUser(wipe: boolean) {
  clearTimeout(syncT); clearTimeout(saveT)
  if (wipe && KEY) { try { localStorage.removeItem(KEY) } catch { /* ignore */ } }
  KEY = null
  dirty = false
  state = fresh()
  emit()
}

// refresh when returning to the app, send when leaving
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!KEY) return
    if (document.visibilityState === 'hidden') { clearTimeout(syncT); void pushRemote(true) }
    else void pullRemote()
  })
  window.addEventListener('online', () => { if (KEY) { dirty = true; void pushRemote() } })
}

/* ───────── unfinished session (this device only) ───────── */

export interface SavedSession { v: 1; at: number; opts: SessionOptsLite; title: string; items: unknown[]; i: number; log: unknown[]; startMem: Record<string, string> }
export type SessionOptsLite = { mode: string; [k: string]: unknown }
const sessSubs = new Set<() => void>()
const sessKey = () => (KEY ? KEY.replace('bios:v2:', 'bios:sess:') : null)
export function saveSession(x: Omit<SavedSession, 'v' | 'at'>) {
  const k = sessKey()
  if (!k) return
  try { localStorage.setItem(k, JSON.stringify({ v: 1, at: Date.now(), ...x })) } catch { /* ignore */ }
  sessSubs.forEach(f => f())
}
export function loadSession(): SavedSession | null {
  const k = sessKey()
  if (!k) return null
  try {
    const s = JSON.parse(localStorage.getItem(k) ?? 'null') as SavedSession | null
    // older than three days is no longer worth continuing
    if (!s || s.v !== 1 || Date.now() - s.at > 3 * 86400000 || !Array.isArray(s.items) || s.i >= s.items.length) return null
    return s
  } catch { return null }
}
export function clearSession() {
  const k = sessKey()
  if (k) { try { localStorage.removeItem(k) } catch { /* ignore */ } }
  sessSubs.forEach(f => f())
}
export function useSavedSession() {
  return useSyncExternalStore(f => { sessSubs.add(f); subs.add(f); return () => { sessSubs.delete(f); subs.delete(f) } }, loadSessionCached)
}
let sessCache: { raw: string | null; val: SavedSession | null } = { raw: null, val: null }
function loadSessionCached() {
  const k = sessKey()
  const raw = k ? (() => { try { return localStorage.getItem(k) } catch { return null } })() : null
  if (raw !== sessCache.raw) sessCache = { raw, val: loadSession() }
  return sessCache.val
}

export function resetAll() {
  set(() => ({ ...fresh(state.settings.name), updated: Date.now() }))
}
