// FSRS 5 (privzete uteži). Spomin vsakega pojma: stabilnost S (dni) in težavnost D (1 do 10).

const W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621]
const DECAY = -0.5
const FACTOR = 19 / 81
const DAY = 86400000
export const RETENTION = 0.9

export type Grade = 1 | 2 | 3 | 4

export interface Mem {
  S: number
  D: number
  last: number
  due: number
  reps: number
  lapses: number
  seen: number
  ok: number
  hist: number[] // zadnji rezultati 0/1
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x))

export function retrievability(m: Mem | undefined, now = Date.now()): number {
  if (!m || !m.reps) return 0
  const t = Math.max(0, (now - m.last) / DAY)
  return Math.pow(1 + (FACTOR * t) / m.S, DECAY)
}

const initD = (g: Grade) => clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10)

function nextD(D: number, g: Grade) {
  const dD = -W[6] * (g - 3)
  const Dp = D + (dD * (10 - D)) / 9
  return clamp(W[7] * initD(4) + (1 - W[7]) * Dp, 1, 10)
}

function interval(S: number) {
  return (S / FACTOR) * (Math.pow(RETENTION, 1 / DECAY) - 1)
}

export function review(prev: Mem | undefined, g: Grade, now = Date.now()): Mem {
  const ok = g >= 2 ? 1 : 0
  if (!prev || !prev.reps) {
    const S = W[g - 1]
    const D = initD(g)
    return { S, D, last: now, due: now + Math.max(10 * 60000, interval(S) * DAY), reps: 1, lapses: g === 1 ? 1 : 0, seen: (prev?.seen ?? 0) + 1, ok: (prev?.ok ?? 0) + ok, hist: [...(prev?.hist ?? []), ok].slice(-10) }
  }
  const elapsed = (now - prev.last) / DAY
  const R = retrievability(prev, now)
  let S: number
  if (elapsed < 0.5) {
    // isti dan: kratkoročna posodobitev
    S = prev.S * Math.exp(W[17] * (g - 3 + W[18]))
  } else if (g === 1) {
    S = Math.min(prev.S, W[11] * Math.pow(prev.D, -W[12]) * (Math.pow(prev.S + 1, W[13]) - 1) * Math.exp(W[14] * (1 - R)))
  } else {
    const hard = g === 2 ? W[15] : 1
    const easy = g === 4 ? W[16] : 1
    S = prev.S * (Math.exp(W[8]) * (11 - prev.D) * Math.pow(prev.S, -W[9]) * (Math.exp(W[10] * (1 - R)) - 1) * hard * easy + 1)
  }
  S = clamp(S, 0.05, 36500)
  const D = nextD(prev.D, g)
  return {
    S, D, last: now, due: now + Math.max(10 * 60000, interval(S) * DAY), reps: prev.reps + 1, lapses: prev.lapses + (g === 1 ? 1 : 0),
    seen: prev.seen + 1, ok: prev.ok + ok, hist: [...prev.hist, ok].slice(-10),
  }
}

// Kratka okrepitev po popravku v isti seji (ne spreminja dolgoročnega razporeda).
export function reinforce(m: Mem | undefined, ok: boolean): Mem | undefined {
  if (!m) return m
  return { ...m, hist: [...m.hist, ok ? 1 : 0].slice(-10) }
}

export type Level = 'nov' | 'ucim' | 'utrjujem' | 'obvladam'
export function level(m?: Mem): Level {
  if (!m || !m.reps) return 'nov'
  if (m.S < 3) return 'ucim'
  if (m.S < 21) return 'utrjujem'
  return 'obvladam'
}
export const LEVEL_NAME: Record<Level, string> = { nov: 'Nov', ucim: 'Učim se', utrjujem: 'Utrjujem', obvladam: 'Obvladam' }

// Ocena znanja 0..1 za prikaz (stabilnost in trenutni priklic).
export function mastery(m?: Mem, now = Date.now()): number {
  if (!m || !m.reps) return 0
  const R = retrievability(m, now)
  const s = 0.15 + 0.85 * (1 - Math.exp(-m.S / 9))
  const acc = m.hist.length ? m.hist.reduce((a, b) => a + b, 0) / m.hist.length : 1
  return clamp(s * (0.55 + 0.45 * R) * (0.6 + 0.4 * acc), 0, 1)
}

export const isDue = (m?: Mem, now = Date.now()) => !!m && m.reps > 0 && m.due <= now
