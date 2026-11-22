// Adaptive learning: task difficulty on a scale from 1 to 5 and a knowledge level per concept on the same scale.
// The model is Rasch (as in computer adaptive testing): P(correct) = σ(k · (level minus difficulty)).
// Task difficulty: an estimate from the task type and content, calibrated with answers (yours; in the hosted app also everyone's).

import type { Task } from '../data/bank'
import { level, mastery, type Mem } from './fsrs'

export const K = 1.15
const sig = (x: number) => 1 / (1 + Math.exp(-x))
const logit = (p: number) => Math.log(p / (1 - p))
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x))

/* ───────── task difficulty ───────── */

const avg = (a: string[]) => (a.length ? a.reduce((x, y) => x + y.length, 0) / a.length : 0)

/** estimate before any answer: task type, length, number of parts, reasoning */
export function priorDiff(t: Task): number {
  let d = 2.5
  switch (t.t) {
    case 'mc': {
      d = 2
      if (t.q.length > 95) d += 0.6 // a scenario or use in a new situation
      if (avg(t.opts) > 42) d += 0.4 // long, similar options
      if (/(why|what does this mean|what does this show|justify|which way|how (big|large|long|much))/i.test(t.q)) d += 0.4
      break
    }
    case 'tf': d = t.fix && !t.a ? 2.1 : 1.5; break
    case 'locate': d = 1.6; break
    case 'identify': d = t.mode === 'type' ? 3.2 : 1.7; break
    case 'recall': d = 1.8; break
    case 'match': d = 2 + Math.max(0, t.pairs.length - 4) * 0.3 + (avg(t.pairs.map(p => p[1])) > 24 ? 0.4 : 0); break
    case 'sort': d = 2.4 + Math.max(0, t.items.length - 5) * 0.12 + (t.bins.length > 2 ? 0.4 : 0); break
    case 'cloze': d = 2.4 + ((t.text.match(/\{/g) ?? []).length - 1) * 0.35; break
    case 'odd': d = 2.9; break
    case 'fix': d = 3; break
    case 'order': d = 2.5 + Math.max(0, t.items.length - 4) * 0.3; break
    case 'labels': d = 3.5; break
    case 'table': d = 3.6; break
    case 'scale': d = t.kind === 'zoom' ? 3.3 : 3.8; break
    case 'type': d = 3.4 + (/^\d|number|calculate|how many|how much/i.test(t.q) ? 0.4 : 0); break
    case 'explain': d = 4.4 + Math.min(0.5, (t.kp.length - 2) * 0.12); break
  }
  if (t.id.startsWith('ai:') && (t as { d?: number }).d) d = (d + (t as { d?: number }).d!) / 2
  return clamp(d, 1, 5)
}

export interface Stat { n: number; ok: number }
let GLOBAL: Record<string, Stat> = {}
export const setGlobalStats = (g: Record<string, Stat>) => { GLOBAL = g || {} }

/** calibrated difficulty: the expected success of an average student from the estimate, corrected with real answers (Bayes, 5 pseudo answers) */
export function taskDiff(t: Task, local?: Stat): number {
  const d0 = priorDiff(t)
  const g = GLOBAL[t.id]
  const n = (g?.n ?? 0) + (local?.n ?? 0) * 0.5
  if (n < 1) return d0
  const ok = (g?.ok ?? 0) + (local?.ok ?? 0) * 0.5
  const p0 = sig(-K * (d0 - 3))
  const p = (ok + p0 * 5) / (n + 5)
  return clamp(3 - logit(clamp(p, 0.03, 0.97)) / K, 1, 5)
}

/* ───────── knowledge level ───────── */

export interface Abil { th: number; n: number }

/** concept level: from the Elo estimate when there is one, otherwise from memory (FSRS) */
export function abilityOf(c: string, abil: Record<string, Abil> | undefined, m?: Mem, base = 2.6): number {
  const a = abil?.[c]
  if (a && a.n > 0) return a.th
  if (!m || !m.reps) return base
  return clamp(1 + mastery(m) * 4, 1, 5)
}

export const pSuccess = (th: number, d: number) => sig(K * (th - d))

/** level update after an answer; the step gets smaller with experience */
export function updateAbil(prev: Abil | undefined, th0: number, d: number, ok: boolean, idk = false): Abil {
  const n = prev?.n ?? 0
  const th = prev?.th ?? th0
  const k = Math.max(0.22, 0.75 / Math.sqrt(1 + n * 0.6))
  const target = idk ? 0 : ok ? 1 : 0
  return { th: clamp(th + k * (target - pSuccess(th, d)) * (idk ? 1.15 : 1), 0.5, 5.5), n: n + 1 }
}

/** FSRS grade from the result and how hard the task was for your level */
export function fsrsGrade(base: 1 | 2 | 3 | 4, ok: boolean, th: number, d: number, mem?: Mem, idk = false): 1 | 2 | 3 | 4 {
  if (idk) return 1
  if (ok) return d - th >= 0.9 && base >= 3 ? 4 : base
  // a mistake on a task well above your level, for a concept you are already consolidating: a smaller penalty
  const lv = level(mem)
  if (pSuccess(th, d) < 0.35 && (lv === 'utrjujem' || lv === 'obvladam')) return 2
  return 1
}

export const diffLabel = (d: number) => (d < 1.75 ? 'Easy' : d < 2.6 ? 'Fairly easy' : d < 3.4 ? 'Medium' : d < 4.25 ? 'Hard' : 'Very hard')
export const fmt1 = (x: number) => x.toFixed(1)
