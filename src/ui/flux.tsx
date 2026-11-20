/* ─────────────────────────── Bios · jezik »Živa« ───────────────────────────
   Gradniki izraznega oblikovnega jezika: oblike, ki se prelivajo ena v drugo
   (vse imajo isto število točk, zato se morfirajo), valovit napredek, tekoč
   indikator zavihkov, izbruh oblik ob uspehu in odpiranje iz mesta dotika. */
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'

/* ───────── oblike ───────── */
export type ShapeKind = 'circle' | 'cookie' | 'cookie12' | 'sunny' | 'flower' | 'clover' | 'blob' | 'squircle' | 'gem' | 'pill' | 'arch'

const N = 64
const RAD: Record<ShapeKind, (a: number) => number> = {
  circle: () => 1,
  cookie: a => 1 + 0.075 * Math.cos(9 * a),
  cookie12: a => 1 + 0.055 * Math.cos(12 * a),
  sunny: a => 1 + 0.11 * Math.cos(8 * a),
  flower: a => 1 + 0.2 * Math.cos(6 * a),
  clover: a => 1 + 0.27 * Math.cos(4 * a),
  blob: a => 1 + 0.075 * Math.sin(2 * a + 0.6) + 0.06 * Math.sin(3 * a + 1.9) + 0.03 * Math.sin(5 * a),
  squircle: a => (Math.abs(Math.cos(a)) ** 4 + Math.abs(Math.sin(a)) ** 4) ** -0.25,
  gem: a => 1 + 0.085 * Math.cos(5 * a),
  pill: a => (Math.abs(Math.cos(a)) ** 5 + Math.abs(Math.sin(a) / 0.62) ** 5) ** -0.2,
  arch: a => { const s = Math.sin(a); return s > 0 ? (Math.abs(Math.cos(a)) ** 5 + Math.abs(s) ** 5) ** -0.2 : 1 },
}
const cache = new Map<ShapeKind, string>()
export function shapePath(kind: ShapeKind): string {
  const hit = cache.get(kind)
  if (hit) return hit
  const f = RAD[kind]
  const raw = Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2 - Math.PI / 2; const r = f(a + Math.PI / 2); return [Math.cos(a) * r, Math.sin(a) * r] })
  const m = Math.max(...raw.map(([x, y]) => Math.hypot(x, y)))
  const p = raw.map(([x, y]) => [x / m, y / m])
  // Catmull Rom → kubične Bézierjeve krivulje; vedno enako število ukazov
  const q = (v: number) => v.toFixed(3)
  let d = `M${q(p[0][0])} ${q(p[0][1])}`
  for (let i = 0; i < N; i++) {
    const p0 = p[(i - 1 + N) % N], p1 = p[i], p2 = p[(i + 1) % N], p3 = p[(i + 2) % N]
    d += `C${q(p1[0] + (p2[0] - p0[0]) / 6)} ${q(p1[1] + (p2[1] - p0[1]) / 6)} ${q(p2[0] - (p3[0] - p1[0]) / 6)} ${q(p2[1] - (p3[1] - p1[1]) / 6)} ${q(p2[0])} ${q(p2[1])}`
  }
  d += 'Z'
  cache.set(kind, d)
  return d
}

export function Shape({ kind, size = 48, fill = 'currentColor', spin = 0, className, style, children, stroke }: {
  kind: ShapeKind; size?: number | string; fill?: string; spin?: number; className?: string; style?: CSSProperties; children?: ReactNode; stroke?: string
}) {
  const reduce = useReducedMotion()
  return (
    <span className={`shape ${className ?? ''}`} style={{ width: size, height: size, ...style }}>
      <motion.svg viewBox="-1.02 -1.02 2.04 2.04" aria-hidden animate={spin && !reduce ? { rotate: 360 } : { rotate: 0 }}
        transition={spin && !reduce ? { duration: spin, repeat: Infinity, ease: 'linear' } : { duration: 0 }}>
        <motion.path initial={false} animate={{ d: shapePath(kind) }} transition={{ type: 'spring', bounce: 0.3, duration: 0.7 }} fill={fill} stroke={stroke} strokeWidth={stroke ? 0.06 : 0} />
      </motion.svg>
      {children !== undefined && <span className="in">{children}</span>}
    </span>
  )
}

/* ───────── valovit napredek (linija) ───────── */
export function Wavy({ value, color, style, flat }: { value: number; color?: string; style?: CSSProperties; flat?: boolean }) {
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className={`wavy ${flat || v >= 1 ? 'flat' : ''}`} style={{ color, ...style }} role="progressbar" aria-valuenow={Math.round(v * 100)} aria-valuemin={0} aria-valuemax={100}>
      <motion.i className="f" initial={{ width: 0 }} animate={{ width: `calc(${v * 100}% - ${v > 0 && v < 1 ? 4 : 0}px)` }} transition={{ type: 'spring', bounce: 0, duration: 1.1 }} />
      {v < 1 && <i className="t" />}
    </div>
  )
}

/* ───────── valovit krog ───────── */
export function WavyRing({ value, size = 96, stroke = 8, color = 'currentColor', track, waves = 12, children }: {
  value: number; size?: number; stroke?: number; color?: string; track?: string; waves?: number; children?: ReactNode
}) {
  const id = useId().replace(/:/g, '')
  const v = Math.max(0, Math.min(1, value))
  const R = size / 2 - stroke / 2 - 3
  const amp = v >= 1 ? 0 : 2.6
  const pts: string[] = []
  for (let i = 0; i <= 240; i++) {
    const a = (i / 240) * Math.PI * 2
    const r = R + amp * Math.sin(waves * a)
    pts.push(`${(size / 2 + Math.cos(a) * r).toFixed(2)},${(size / 2 + Math.sin(a) * r).toFixed(2)}`)
  }
  const C = 2 * Math.PI * (R + 4)
  return (
    <div className="wring" style={{ width: size, height: size, color }}>
      <svg width={size} height={size}>
        <defs>
          <mask id={id}>
            <motion.circle cx={size / 2} cy={size / 2} r={R + 4} fill="none" stroke="#fff" strokeWidth={stroke + 12} strokeDasharray={C}
              transform={`rotate(-90 ${size / 2} ${size / 2})`} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - v) }} transition={{ type: 'spring', bounce: 0, duration: 1.3 }} />
          </mask>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={track ?? 'color-mix(in srgb, currentColor 18%, transparent)'} strokeWidth={stroke * 0.55} />
        <g mask={`url(#${id})`}>
          <polyline className="wring-w" points={pts.join(' ')} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ transformOrigin: `${size / 2}px ${size / 2}px` }} />
        </g>
      </svg>
      {children && <div className="in">{children}</div>}
    </div>
  )
}

/* ───────── tekoč indikator (zavihki): sprednji rob prehiti, zadnji ga dohiti ───────── */
export function useLiquid(index: number, slot: number) {
  const a = useMotionValue(index * slot)
  const b = useMotionValue((index + 1) * slot)
  const prev = useRef(index)
  const reduce = useReducedMotion()
  useEffect(() => {
    const right = index > prev.current
    prev.current = index
    const fast = { type: 'spring' as const, stiffness: 620, damping: 40 }
    const slow = { type: 'spring' as const, stiffness: 230, damping: 26 }
    if (reduce) { a.set(index * slot); b.set((index + 1) * slot); return }
    const c1 = animate(a, index * slot, right ? slow : fast)
    const c2 = animate(b, (index + 1) * slot, right ? fast : slow)
    return () => { c1.stop(); c2.stop() }
  }, [index, slot, a, b, reduce])
  const size = useTransform(() => b.get() - a.get())
  const squash = useTransform(() => 1 - Math.min(0.3, Math.max(0, (b.get() - a.get()) / slot - 1) * 0.32))
  return { start: a, size, squash }
}

/* ───────── izbruh oblik (uspeh) ───────── */
type Bit = { id: number; x: number; y: number; dx: number; dy: number; r: number; s: number; k: ShapeKind; c: string }
let bitId = 0
const subs = new Set<(b: Bit[]) => void>()
const BURST_C = ['var(--lime)', 'var(--coral)', 'var(--violet)', 'var(--sky)', 'var(--amber)', 'var(--pink)']
const BURST_K: ShapeKind[] = ['cookie', 'flower', 'clover', 'circle', 'sunny', 'gem']
export function burst(x: number, y: number, n = 16, spread = 150) {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const bits: Bit[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.6
    const d = spread * (0.45 + Math.random() * 0.6)
    return { id: ++bitId, x, y, dx: Math.cos(a) * d, dy: Math.sin(a) * d - 30, r: (Math.random() - 0.5) * 540, s: 10 + Math.random() * 14, k: BURST_K[i % BURST_K.length], c: BURST_C[(i * 7) % BURST_C.length] }
  })
  subs.forEach(f => f(bits))
}
export function burstFrom(el: Element | null, n?: number) {
  if (!el) return
  const r = el.getBoundingClientRect()
  burst(r.left + r.width / 2, r.top + r.height / 2, n)
}
export function BurstHost() {
  const [bits, setBits] = useState<Bit[]>([])
  useEffect(() => {
    const f = (b: Bit[]) => {
      setBits(x => [...x, ...b])
      setTimeout(() => setBits(x => x.filter(y => !b.includes(y))), 1300)
    }
    subs.add(f)
    return () => { subs.delete(f) }
  }, [])
  return (
    <div className="burst" aria-hidden>
      <AnimatePresence>
        {bits.map(b => (
          <motion.span key={b.id} style={{ position: 'fixed', left: b.x - b.s / 2, top: b.y - b.s / 2, width: b.s, height: b.s, color: b.c }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
            animate={{ x: b.dx, y: [0, b.dy, b.dy + 60], scale: [0, 1.15, 0.9], rotate: b.r, opacity: [1, 1, 0] }}
            transition={{ duration: 1.15, ease: [0.2, 0.8, 0.3, 1], times: [0, 0.55, 1] }}>
            <svg viewBox="-1 -1 2 2" width="100%" height="100%"><path d={shapePath(b.k)} fill="currentColor" /></svg>
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ───────── odpiranje iz mesta dotika (preoblikovanje vsebnika) ───────── */
let lastRect: DOMRect | null = null
let lastAt = 0
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', e => {
    const el = (e.target as Element | null)?.closest?.('[data-morph], .tile, .topic, .li, .btn, button')
    if (el) { lastRect = el.getBoundingClientRect(); lastAt = Date.now() }
  }, { capture: true })
}
export function originClip(): string | undefined {
  if (!lastRect || Date.now() - lastAt > 1500) return undefined
  const W = window.innerWidth, H = window.innerHeight, r = lastRect
  return `inset(${Math.max(0, r.top)}px ${Math.max(0, W - r.right)}px ${Math.max(0, H - r.bottom)}px ${Math.max(0, r.left)}px round 28px)`
}
export const FULL_CLIP = 'inset(0px 0px 0px 0px round 0px)'
