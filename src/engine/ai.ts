// Odjemalec za AI na Cloudflare (Workers AI prek /api). Vse ima rezervno pot, če AI ni na voljo.
import { expired } from './auth'

export interface GradeResult {
  covered: number[] // indeksi ključnih točk, ki so pokrite
  partial: number[]
  wrong: string[]
  verdict: 'pravilno' | 'delno' | 'napacna_formulacija' | 'ne_zna'
  feedback: string
  better?: string
  ai: boolean
}

// Open source različica nima strežnika za AI: vse naloge uporabljajo rezervno pot (lokalno preverjanje).
let downUntil = Number.POSITIVE_INFINITY
export const aiDown = () => Date.now() < downUntil

async function post<T>(path: string, body: unknown, ms = 30000): Promise<T> {
  if (aiDown()) throw new Error('down')
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), ms)
  try {
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal })
    if (!r.ok) {
      if (r.status === 401) expired()
      else if (r.status >= 500 || r.status === 429) downUntil = Date.now() + 45000
      throw new Error(String(r.status))
    }
    return (await r.json()) as T
  } finally { clearTimeout(t) }
}

export function grade(q: string, ref: string, kp: string[], answer: string) {
  return post<GradeResult>('/api/grade', { q, ref, kp, answer })
}

export interface OralTurn { role: 'ai' | 'me'; text: string }
export interface OralReply { say: string; verdict?: 'pravilno' | 'delno' | 'napacna_formulacija' | 'ne_zna'; missing?: string[]; concept?: string; done?: boolean }

export function oral(topic: string, history: OralTurn[], focus: string[]) {
  return post<OralReply>('/api/oral', { topic, history: history.slice(-14), focus }, 40000)
}

export async function stt(blob: Blob): Promise<string> {
  if (aiDown()) throw new Error('down')
  const r = await fetch('/api/stt', { method: 'POST', headers: { 'content-type': blob.type || 'audio/webm' }, body: blob })
  if (r.status === 401) expired()
  if (!r.ok) throw new Error(String(r.status))
  const j = (await r.json()) as { text: string }
  return j.text
}

export function genTasks(topic: string, n = 6) {
  return post<{ items: unknown[] }>('/api/gen', { topic, n }, 60000)
}

// Kadar AI ni dosegljiv: grobo ujemanje ključnih besed (samo kot pomoč pri samooceni).
export function localCoverage(kp: string[], answer: string): number[] {
  const strip = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const a = strip(answer)
  return kp.map((k, i) => {
    const words = strip(k).split(/[^a-z0-9]+/).filter(w => w.length >= 5).map(w => w.slice(0, Math.max(5, w.length - 2)))
    if (!words.length) return -1
    const hit = words.filter(w => a.includes(w)).length / words.length
    return hit >= 0.5 ? i : -1
  }).filter(i => i >= 0)
}
