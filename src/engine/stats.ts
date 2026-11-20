import { CONCEPTS, type TopicId } from '../data/concepts'
import { ORGANELLES, type OrgId } from '../data/organelles'
import { mastery, level, isDue, type Level } from './fsrs'
import { dayKey, type State } from './store'

export function topicMastery(s: State, t?: TopicId) {
  const cs = CONCEPTS.filter(c => !t || c.topic === t)
  const now = Date.now()
  return cs.reduce((a, c) => a + mastery(s.mem[c.id], now), 0) / Math.max(1, cs.length)
}

export function orgMastery(s: State): Partial<Record<OrgId | 'dnk', number>> {
  const out: Partial<Record<OrgId | 'dnk', number>> = {}
  const now = Date.now()
  ORGANELLES.forEach(o => {
    const cs = CONCEPTS.filter(c => c.org === o.id || o.concepts.includes(c.id))
    out[o.id] = cs.length ? cs.reduce((a, c) => a + mastery(s.mem[c.id], now), 0) / cs.length : 0
  })
  return out
}

export function levelCounts(s: State, t?: TopicId): Record<Level, number> {
  const r: Record<Level, number> = { nov: 0, ucim: 0, utrjujem: 0, obvladam: 0 }
  CONCEPTS.filter(c => !t || c.topic === t).forEach(c => { r[level(s.mem[c.id])]++ })
  return r
}

export function dueCount(s: State, t?: TopicId) {
  const now = Date.now()
  return CONCEPTS.filter(c => (!t || c.topic === t) && isDue(s.mem[c.id], now)).length
}

export function newCount(s: State, t?: TopicId) {
  return CONCEPTS.filter(c => (!t || c.topic === t) && !s.mem[c.id]?.reps).length
}

export function weakest(s: State, n = 4) {
  return CONCEPTS.filter(c => (s.mem[c.id]?.hist.length ?? 0) >= 2)
    .map(c => ({ c, acc: s.mem[c.id].hist.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, s.mem[c.id].hist.length) }))
    .filter(x => x.acc < 0.8)
    .sort((a, b) => a.acc - b.acc)
    .slice(0, n)
}

export function accuracy(s: State, days = 7) {
  let n = 0, ok = 0
  for (let i = 0; i < days; i++) {
    const d = s.days[dayKey(Date.now() - i * 86400000)]
    if (d) { n += d.n; ok += d.ok }
  }
  return n ? ok / n : 0
}

export function forecast(s: State, days = 7) {
  const now = Date.now()
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const out = Array.from({ length: days }, () => 0)
  CONCEPTS.forEach(c => {
    const m = s.mem[c.id]
    if (!m?.reps) return
    const d = Math.floor((Math.max(m.due, now) - start.getTime()) / 86400000)
    if (d >= 0 && d < days) out[d]++
  })
  return out
}
