import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, animate, useInView, useReducedMotion } from 'motion/react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { get } from '../engine/store'
import { Shape, type ShapeKind } from './flux'

export const spring = { type: 'spring' as const, bounce: 0, duration: 0.42 }
export const springSoft = { type: 'spring' as const, bounce: 0.18, duration: 0.5 }

export function Ring({ value, size = 64, stroke = 7, color = 'var(--accent)', track = 'var(--bg-2)', children }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div style={{ width: size, height: size, position: 'relative', flex: 'none' }}>
      <svg width={size} height={size} className="ring">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.max(0, Math.min(1, value))) }} transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }} />
      </svg>
      {children && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>}
    </div>
  )
}

export function Sheet({ open, onClose, children, title, wide }: { open: boolean; onClose: () => void; children: ReactNode; title?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [open, onClose])
  // portal: the sheet is always above the tabs, even when opened by a view with its own layer (transform creates a new stacking context)
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} onClick={onClose} />
          <motion.div className="sheet" style={wide ? { maxWidth: 760 } : undefined} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%', transition: { type: 'spring', bounce: 0, duration: 0.32 } }} transition={{ type: 'spring', bounce: 0.06, duration: 0.42 }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0.05, bottom: 0.6 }} dragSnapToOrigin
            onDragEnd={(_, i) => { if (i.offset.y > 120 || i.velocity.y > 600) onClose() }} role="dialog" aria-modal="true">
            <div className="grab" />
            <div className="stop">
              <div className="grow">{title}</div>
              <button className="iconbtn fill" onClick={onClose} aria-label="Close"><X size={18} strokeWidth={2.4} /></button>
            </div>
            <div className="sbody" onPointerDown={e => e.stopPropagation()}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  const i = Math.max(0, options.findIndex(o => o.v === value))
  return (
    <div className="seg" role="tablist">
      <motion.div className="thumb" layout transition={spring} style={{ left: `calc(${(i / options.length) * 100}% + 3px)`, width: `calc(${100 / options.length}% - 6px)` }} />
      {options.map(o => (
        <button key={o.v} role="tab" aria-selected={o.v === value} className={o.v === value ? 'on' : ''} onClick={() => onChange(o.v)}>{o.label}</button>
      ))}
    </div>
  )
}

/* sound: a small, soft confirmation (WebAudio, no files) */
let ac: AudioContext | undefined
export function sound(kind: 'good' | 'bad' | 'tap' | 'done') {
  if (!get().settings.sound) return
  try {
    ac = ac ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const t = ac.currentTime
    const seq: [number, number][] = kind === 'good' ? [[659.3, 0], [987.8, 0.07]] : kind === 'bad' ? [[220, 0], [196, 0.09]] : kind === 'done' ? [[523.3, 0], [659.3, 0.08], [784, 0.16], [1046.5, 0.24]] : [[880, 0]]
    seq.forEach(([f, d]) => {
      const o = ac!.createOscillator(), g = ac!.createGain()
      o.type = kind === 'bad' ? 'triangle' : 'sine'
      o.frequency.value = f
      g.gain.setValueAtTime(0.0001, t + d)
      g.gain.exponentialRampToValueAtTime(kind === 'tap' ? 0.03 : 0.07, t + d + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + (kind === 'done' ? 0.3 : 0.18))
      o.connect(g).connect(ac!.destination)
      o.start(t + d); o.stop(t + d + 0.35)
    })
  } catch { /* no sound */ }
  if (kind !== 'tap' && 'vibrate' in navigator) navigator.vibrate?.(kind === 'bad' ? [18, 40, 18] : 12)
}

export function useAutoFocus<T extends HTMLElement>(on = true) {
  const r = useRef<T>(null)
  useEffect(() => { if (on) setTimeout(() => r.current?.focus({ preventScroll: true }), 260) }, [on])
  return r
}

export function Dot({ color, size = 10 }: { color: string; size?: number }) {
  return <span className="legend-dot" style={{ background: color, width: size, height: size }} />
}

export const ORG_COLOR: Record<string, string> = {
  membrana: 'var(--o-mem)', citoplazma: 'var(--o-skrob)', jedro: 'var(--o-jedro)', jedrce: 'var(--o-jedrce)', zrnatiER: 'var(--o-zer)', gladkiER: 'var(--o-ger)',
  ribosomi: 'var(--o-ribo)', golgi: 'var(--o-golgi)', mitohondrij: 'var(--o-mito)', kloroplast: 'var(--o-kloro)', vakuola: 'var(--o-vak)', lizosom: 'var(--o-lizo)',
  centrioli: 'var(--o-centri)', citoskelet: 'var(--o-cito-d)', migetalke: 'var(--o-mig)', stena: 'var(--o-stena)', skrobna: 'var(--o-skrob)', dnk: 'var(--o-jedro)',
}

/* ───────── responsiveness and motion ───────── */

// wide screen (computer): side navigation, panels at the side
export function useWide(min = 1024) {
  const q = `(min-width: ${min}px)`
  const [w, setW] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const f = () => setW(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [q])
  return w
}

// content appears when it comes into view (one after another with a delay)
export function Reveal({ children, i = 0, className, style, as = 'div' }: { children: ReactNode; i?: number; className?: string; style?: CSSProperties; as?: 'div' | 'section' }) {
  const C = as === 'section' ? motion.section : motion.div
  return (
    <C className={className} style={style} initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ type: 'spring', bounce: 0, duration: 0.6, delay: Math.min(i, 8) * 0.05 }}>
      {children}
    </C>
  )
}

// a number that counts up to its value
export function CountUp({ to, suffix = '', duration = 0.9 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const from = useRef(0)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduce || !inView) { el.textContent = Math.round(to) + suffix; from.current = to; return }
    // counts from the previous value, not from zero (points in the Arena grow live)
    const c = animate(from.current, to, { duration, ease: [0.32, 0.72, 0, 1], onUpdate: v => { el.textContent = Math.round(v) + suffix; from.current = v } })
    return () => c.stop()
  }, [to, suffix, inView, reduce, duration])
  return <span ref={ref} className="num">{Math.round(to) + suffix}</span>
}

export function Avatar({ name, src, size = 34 }: { name: string; src?: string; size?: number }) {
  const [bad, setBad] = useState(false)
  const ini = name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase() || '?'
  return src && !bad
    ? <img className="avatar" src={src} alt="" width={size} height={size} referrerPolicy="no-referrer" onError={() => setBad(true)} style={{ width: size, height: size }} />
    : <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>{ini}</span>
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>
}

/* ───────── iOS building blocks: large title, grouped lists, switch ───────── */

export function useScrolledPast(px = 40, el?: HTMLElement | null) {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const target: HTMLElement | Window = el ?? window
    const get = () => (el ? el.scrollTop : window.scrollY)
    const on = () => setPast(get() > px)
    on()
    target.addEventListener('scroll', on, { passive: true })
    return () => target.removeEventListener('scroll', on)
  }, [px, el])
  return past
}

export type Tone = 'lime' | 'green' | 'violet' | 'coral' | 'sky' | 'amber' | 'pink' | 'ink'

// a title that “tightens” when shown: the font weight grows from thin to full
export function Title({ children, className = 'lt', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <motion.h1 className={className} style={style} initial={{ fontWeight: 380, letterSpacing: '-0.01em', opacity: 0.4 }} animate={{ fontWeight: 790, letterSpacing: '-0.04em', opacity: 1 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.9 }}>{children}</motion.h1>
  )
}

// a coloured band at the top of the screen with living shapes in the background
export function Band({ tone, kicker, title, sub, right, deco = ['cookie', 'flower'], children }: {
  tone: Tone; kicker?: ReactNode; title: ReactNode; sub?: ReactNode; right?: ReactNode; deco?: [ShapeKind, ShapeKind]; children?: ReactNode
}) {
  return (
    <header className={`band t-${tone}`}>
      <Shape kind={deco[0]} size={250} spin={70} className="deco" style={{ right: -70, top: -60 }} />
      {right && <div className="r">{right}</div>}
      {kicker && <div className="kick">{kicker}</div>}
      <Title>{title}</Title>
      {sub && <div className="bsub">{sub}</div>}
      {children}
    </header>
  )
}

// Tab screen: a coloured band with a large title, a compact bar appears on scroll
export function Screen({ title, kicker, right, children, wide, tone, sub, deco }: { title: string; kicker?: ReactNode; right?: ReactNode; children: ReactNode; wide?: boolean; tone?: Tone; sub?: ReactNode; deco?: [ShapeKind, ShapeKind] }) {
  const past = useScrolledPast(tone ? 120 : 44)
  return (
    <div className={`page ${wide ? 'wide' : ''} ${tone ? 'banded' : ''}`}>
      <motion.div className={`navbar ${past ? 'show' : ''}`} initial={false} animate={{ opacity: past ? 1 : 0, y: past ? 0 : -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }} aria-hidden={!past}>
        <div className="bg" />
        <div className="ttl">{title}</div>
        {right && <div className="r">{right}</div>}
      </motion.div>
      {tone ? <Band tone={tone} kicker={kicker} title={title} sub={sub} right={right} deco={deco} /> : (
        <header className="lthead">
          {kicker && <div className="kick">{kicker}</div>}
          <div className="row"><h1 className="lt grow">{title}</h1>{right}</div>
        </header>
      )}
      {children}
    </div>
  )
}

// section title
export function SH({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="sh"><h2>{children}</h2>{action}</div>
}

// push view bar: back on the left, the title appears when the large title leaves
export function PushBar({ back, title, show, right }: { back: { label: string; onClick: () => void }; title: string; show: boolean; right?: ReactNode }) {
  return (
    <div className="navbar show">
      <motion.div className="bg" initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.18 }} />
      <button className="l backbtn" onClick={back.onClick}><ChevronLeft size={24} strokeWidth={2.6} />{back.label}</button>
      <motion.div className="ttl" initial={false} animate={{ opacity: show ? 1 : 0, y: show ? 0 : 4 }} transition={{ duration: 0.18 }}>{title}</motion.div>
      {right && <div className="r">{right}</div>}
    </div>
  )
}

export function Group({ header, footer, action, children, style }: { header?: ReactNode; footer?: ReactNode; action?: ReactNode; children: ReactNode; style?: CSSProperties }) {
  return (
    <section className="group" style={style}>
      {header && <div className="gh"><span>{header}</span>{action}</div>}
      <div className="list">{children}</div>
      {footer && <div className="gf">{footer}</div>}
    </section>
  )
}

export function Row({ icon, tint, lead, title, sub, value, right, onClick, chevron = true, danger, style }: {
  icon?: ReactNode; tint?: string; lead?: ReactNode; title: ReactNode; sub?: ReactNode; value?: ReactNode; right?: ReactNode
  onClick?: () => void; chevron?: boolean; danger?: boolean; style?: CSSProperties
}) {
  const cls = `li ${icon || lead ? '' : 'nolead'} ${danger ? 'danger' : ''}`
  const inner = (
    <>
      {lead ?? (icon ? <span className="ico" style={{ background: tint }}>{icon}</span> : null)}
      <span className="grow"><span className="t">{title}</span>{sub && <span className="s">{sub}</span>}</span>
      {value !== undefined && <span className="val num">{value}</span>}
      {right}
      {onClick && chevron && <ChevronRight size={18} className="chev" />}
    </>
  )
  return onClick ? <button className={cls} onClick={onClick} style={style}>{inner}</button> : <div className={cls} style={style}>{inner}</div>
}

export function Toggle({ on }: { on: boolean }) {
  return (
    <span style={{ width: 54, height: 32, borderRadius: 99, background: on ? 'var(--ink)' : 'var(--fill)', boxShadow: on ? 'none' : 'inset 0 0 0 2px var(--line-2)', position: 'relative', transition: 'background .25s', flex: 'none' }}>
      <motion.span initial={false} animate={{ x: on ? 22 : 0, width: on ? 24 : 16, height: on ? 24 : 16, top: on ? 4 : 8, left: on ? 4 : 8, background: on ? 'var(--lime)' : 'var(--ink-2)' }} transition={{ type: 'spring', bounce: 0.35, duration: 0.45 }} style={{ position: 'absolute', borderRadius: 99 }} />
    </span>
  )
}

/* every section has its own colour and shape */
export const TOPIC_LOOK: Record<string, { tone: Tone; shape: ShapeKind }> = {
  osnove: { tone: 'violet', shape: 'cookie' },
  teorija: { tone: 'amber', shape: 'gem' },
  organeli: { tone: 'coral', shape: 'flower' },
  ovoj: { tone: 'sky', shape: 'clover' },
  primerjava: { tone: 'green', shape: 'sunny' },
  mikroskop: { tone: 'pink', shape: 'blob' },
}
