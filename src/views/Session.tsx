import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X, Check, ArrowRight, Flame, Sparkles, BookOpen, RotateCcw, Lightbulb, Play, HelpCircle, Target } from 'lucide-react'
import type { Task } from '../data/bank'
import { TYPE_INFO } from '../data/bank'
import { CON, TOP } from '../data/concepts'
import { ORG, type DetailId, type OrgId } from '../data/organelles'
import { buildSession, followUp, repickFor, diffOf, levelOfConcept, type Item, type SessionOpts } from '../engine/gen'
import { pSuccess, diffLabel, fmt1 } from '../engine/adapt'
import { taskAnswer, taskPrompt } from './Notebook'
import { ExplainCard } from './Explain'
import { sfx } from '../ui/sfx'
import { queueStat, requestFill } from '../engine/bank'
import { record, markLearned, get, set, useStore, saveSession, clearSession, flushRemote, type SavedSession } from '../engine/store'
import { level, LEVEL_NAME, mastery } from '../engine/fsrs'
import { TaskView } from '../tasks'
import type { Result } from '../tasks/shared'
import { Ring, useWide, Kbd, CountUp } from '../ui/kit'
import { Shape, WavyRing, burst, burstFrom, originClip, FULL_CLIP } from '../ui/flux'
import { CellView } from '../art/Cells'
import { DetailView } from '../art/Details'

export interface SessionProps { opts: SessionOpts; title: string; onClose: () => void; items?: Item[]; resume?: SavedSession | null }

const CONCEPT_VISUAL: Record<string, { detail?: DetailId; cell?: 'animal' | 'plant' | 'prok'; org?: OrgId }> = {
  'celica.def': { cell: 'animal' }, 'celica.delitev': { cell: 'animal', org: 'jedro' }, 'celica.vrste': { cell: 'prok' },
  'pe.velikost': { cell: 'prok' }, 'pe.dedni': { detail: 'prokariont' }, 'pe.jedro': { detail: 'jedro' }, 'pe.delitev': { cell: 'animal', org: 'centrioli' }, 'pe.organeli': { detail: 'prokariont' },
  'evk.zgradba': { cell: 'animal', org: 'membrana' }, 'organel.def': { cell: 'animal', org: 'mitohondrij' },
  'mikro.tem': { detail: 'tem' }, 'mikro.tem.deli': { detail: 'tem' }, 'teorija.mikroskop': { detail: 'svetlobni' },
  'svm.deli': { detail: 'svetlobni' }, 'svm.vijaka': { detail: 'svetlobni' }, 'svm.povecava': { detail: 'svetlobni' },
  'rz.razlike': { cell: 'plant' }, 'rz.prehrana': { cell: 'plant', org: 'kloroplast' }, 'rz.oblika': { cell: 'plant', org: 'stena' },
  'jedrce': { detail: 'jedro' }, 'skrobna': { cell: 'plant', org: 'skrobna' },
}

export function ConceptVisual({ id }: { id: string }) {
  const c = CON[id]
  const v = CONCEPT_VISUAL[id] ?? (c?.org ? (ORG[c.org].detail ? { detail: ORG[c.org].detail } : { cell: (ORG[c.org].presence.zival === true ? 'animal' : 'plant') as 'animal' | 'plant', org: c.org }) : undefined)
  if (!v) return null
  if (v.detail) return <div className="stage" style={{ padding: 8 }}><DetailView id={v.detail} mode="study" /></div>
  if (v.cell) return <div className="stage" style={{ padding: 8 }}><CellView kind={v.cell} focus={v.org ?? null} labels={!v.org} /></div>
  return null
}

export const hasConceptVisual = (id: string) => !!(CONCEPT_VISUAL[id] ?? CON[id]?.org)

// task difficulty 1 to 5 and your chance of success
function DiffBadge({ d, th }: { d: number; th: number }) {
  if (!d) return null
  const p = Math.round(pSuccess(th, d) * 100)
  const lv = Math.max(1, Math.min(5, Math.round(d)))
  return (
    <span className={`diff d${lv}`} title={`${diffLabel(d)} · difficulty ${fmt1(d)} of 5 · your chance of success about ${p} %`} aria-label={`Difficulty ${fmt1(d)} of 5`}>
      <DiffBars d={d} />
      <b>{fmt1(d)}</b>
    </span>
  )
}

// short correct answer (without the explanation, which is in the why field)
function shortAnswer(t: Task): string | null {
  if (t.t === 'odd') return t.items[t.a]
  if (t.t === 'cloze') return t.text.replace(/\{([^}]+)\}/g, '$1')
  if (t.t === 'fix') return t.text.replace(/\[[^|\]]+\|([^\]]+)\]/g, '$1')
  if (t.t === 'tf') return t.a ? `True: ${t.s}` : t.fix ? `False. ${t.fix.opts[t.fix.a]}` : `False: ${t.s}`
  return taskAnswer(t)
}

function DiffBars({ d }: { d: number }) {
  const lv = Math.max(1, Math.min(5, Math.round(d)))
  return <span className={`bars d${lv}`}>{[1, 2, 3, 4, 5].map(i => <i key={i} className={i <= lv ? 'on' : ''} />)}</span>
}

function LearnCard({ id, onNext }: { id: string; onNext: () => void }) {
  const c = CON[id]
  const o = c.org ? ORG[c.org] : undefined
  const isYear = id.startsWith('mejnik.')
  // the explanation unfolds in steps: label, title, picture, text, warning
  const st = (k: number) => ({ initial: { opacity: 0, y: 16, filter: 'blur(6px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' }, transition: { type: 'spring' as const, bounce: 0.2, duration: 0.7, delay: 0.05 + k * 0.12 } })
  return (
    <div>
      <motion.div className="qtype" {...st(0)}>
        <Shape kind="sunny" size={30} fill="var(--lime)" spin={14}><Lightbulb size={15} color="var(--on-lime)" /></Shape>
        <span className="hl" style={{ fontSize: 15 }}>New concept</span><span className="fn">· {TOP[c.topic].title} · p. {c.page}</span>
      </motion.div>
      <motion.h2 className="t1" style={{ margin: '4px 2px 16px' }} initial={{ opacity: 0, fontWeight: 360 }} animate={{ opacity: 1, fontWeight: 770 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.9, delay: 0.12 }}>{c.label}</motion.h2>
      {isYear ? (
        <motion.div className="tile t-amber" style={{ minHeight: 0, marginBottom: 14 }} initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.4, duration: 0.8, delay: 0.25 }}>
          <Shape kind="gem" size={140} spin={40} className="deco" style={{ right: -40, top: -40 }} />
          <div className="lbl">Milestone</div>
          <div className="big md">{c.label.match(/\d[\d/ do]*\d/)?.[0] ?? ''}</div>
        </motion.div>
      ) : <motion.div style={{ marginBottom: 14 }} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.3, duration: 0.8, delay: 0.25 }}><ConceptVisual id={id} /></motion.div>}
      <motion.div className="read" style={{ padding: '0 4px' }} {...st(3)}>{c.text}</motion.div>
      {o?.pazi && <motion.div className="pazi" style={{ marginTop: 12 }} {...st(4)}><b>Watch out</b><span>{o.pazi}</span></motion.div>}
      <Foot2><button className="btn full accent" onClick={onNext}>Got it, test me <ArrowRight size={18} /></button></Foot2>
    </div>
  )
}

function Foot2({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null)
  useEffect(() => { setEl(document.getElementById('s-foot-slot')) }, [])
  return el ? (<>{createPortalSafe(children, el)}</>) : null
}
import { createPortal } from 'react-dom'
const createPortalSafe = (c: ReactNode, el: HTMLElement) => createPortal(c, el)

interface Log { task: Task; ok: boolean; grade: number; d?: number; th?: number; idk?: boolean }

export default function Session({ opts, title, onClose, items: preset, resume }: SessionProps) {
  const [items, setItems] = useState<Item[]>(() => (resume?.items as Item[] | undefined) ?? preset ?? buildSession(opts))
  const [i, setI] = useState(resume?.i ?? 0)
  const [res, setRes] = useState<Result | null>(null)
  const [log, setLog] = useState<Log[]>(() => (resume?.log as Log[] | undefined) ?? [])
  // X during a session shows stats; the session stays saved until you finish it
  const [stopped, setStopped] = useState(false)
  const [flow, setFlow] = useState<0 | 1 | -1>(0)
  const [xp, setXp] = useState<{ n: number; k: number } | null>(null)
  const wide = useWide()
  const first = useRef(new Set<string>(((resume?.log as Log[] | undefined) ?? []).flatMap(l => l.task.c)))
  const t0 = useRef(Date.now())
  const startMem = useRef<Record<string, string>>(resume?.startMem ?? Object.fromEntries(Object.entries(get().mem).map(([k, m]) => [k, level(m)])))
  const used = useRef(new Set(items.filter(x => x.kind === 'task').map(x => (x as { task: Task }).task.id)))
  const cur = items[i]
  const finished = i >= items.length
  const total = items.length
  const showEnd = finished || stopped

  // session saved as you go: after every answer and step, so nothing is lost when the app closes
  useEffect(() => {
    if (finished) { clearSession(); return }
    if (i === 0 && log.length === 0) return
    saveSession({ opts: opts as unknown as SavedSession['opts'], title, items, i, log, startMem: startMem.current })
  }, [i, log, items, finished]) // eslint-disable-line react-hooks/exhaustive-deps

  const end = () => { clearSession(); void flushRemote(); onClose() }
  const requestClose = () => {
    if (showEnd) { end(); return }
    if (log.length === 0) { end(); return }
    void flushRemote()
    setRes(null)
    setStopped(true)
  }

  useEffect(() => { t0.current = Date.now() }, [i])
  useEffect(() => {
    const b = document.querySelector('.s-body')
    b?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [i])

  const explained = useRef(new Set<string>())
  // a session must not grow without limit: at most half again as many tasks and five explanations
  const baseN = useRef(items.filter(x => x.kind === 'task').length)
  const extra = useRef(0)
  const follow = useRef<Record<string, number>>({})
  const finalRound = useRef(false)
  const streak = useRef(0)
  const lvBefore = useRef<Record<string, number>>({})
  const [ab, setAb] = useState<{ from: number; to: number; d: number } | null>(null)
  const curDiff = cur?.kind === 'task' ? diffOf(cur.task) : 0
  const curTh = cur?.kind === 'task' ? levelOfConcept(cur.task.c[0]) : 0

  useEffect(() => { if (opts.mode !== 'test') requestFill(opts.topic) }, [])

  const onAnswer = (r: Result) => {
    if (!cur || cur.kind !== 'task' || res) return
    const ms = Date.now() - t0.current
    const c = cur.task.c[0]
    const d = diffOf(cur.task)
    const th = levelOfConcept(c)
    if (lvBefore.current[c] === undefined) lvBefore.current[c] = th
    const ok = r.ok && !r.idk
    let grade = r.grade
    if (ok && grade === 3 && ms < 6000 && ['mc', 'tf', 'locate', 'identify', 'type'].includes(cur.task.t) && !cur.retry) grade = 4
    // state before recording: the concept's last results (to notice when you struggle)
    const m = get().mem[c]
    const lv = level(m)
    const priorMiss = (m?.hist ?? []).slice(-3).filter(x => !x).length
    const sessMiss = log.filter(l => !l.ok && l.task.c[0] === c).length + (ok ? 0 : 1)
    record({ task: cur.task, concepts: cur.task.c, grade, ms, firstInSession: first.current, diff: d, idk: r.idk, xp: ok ? (cur.retry ? 4 : Math.round(6 + d * 4)) : 2 })
    streak.current = ok ? streak.current + 1 : 0
    if (!cur.retry) queueStat(cur.task.id, ok)
    setAb({ from: th, to: levelOfConcept(c), d })
    if (r.idk) sfx('idk'); else if (ok) sfx('good', { streak: streak.current, hard: d - th >= 0.8 }); else sfx('bad')
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    if (ok) setTimeout(() => burstFrom(document.querySelector('.s-inner .opt.good, .s-inner .good') ?? document.querySelector('.fbs .fbi'), d >= 3.5 ? 26 : 16), 90)
    setRes(r)
    if (ok) setXp({ n: cur.retry ? 4 : Math.round(6 + d * 4), k: Date.now() })
    const nl = [...log, { task: cur.task, ok, grade, d, th, idk: r.idk }]
    setLog(nl)
    // flow: the last 5 answers
    const last = nl.slice(-5)
    let fl = flow
    if (last.length >= 4) {
      const acc = last.filter(x => x.ok).length / last.length
      fl = acc >= 0.9 ? 1 : acc <= 0.5 ? -1 : 0
      setFlow(fl)
    }
    if (ok || opts.mode === 'test') return
    // mistake: when the app notices you are struggling, an explanation comes; otherwise the same concept in another format a few tasks later
    const struggle = !!r.idk || sessMiss >= 2 || ((lv === 'nov' || lv === 'ucim') && priorMiss >= 1) || (d <= 2.3 && lv !== 'obvladam') || fl === -1
    const room = extra.current < Math.max(4, Math.ceil(baseN.current * 0.5))
    setItems(arr => {
      const a = [...arr]
      if (struggle && !explained.current.has(c) && explained.current.size < 5) {
        explained.current.add(c)
        const ans = shortAnswer(cur.task)
        a.splice(i + 1, 0, { kind: 'explain', concept: c, key: 'ex:' + c + ':' + i, ctx: { taskId: cur.task.id, prompt: taskPrompt(cur.task), chosen: r.idk ? undefined : r.given, correct: ans ?? undefined, idk: r.idk, misses: sessMiss } })
        const chk = followUp(cur.task, used.current, opts, 0.8)
        if (chk && room) { extra.current++; used.current.add(chk.id); a.splice(Math.min(a.length, i + 3), 0, { kind: 'task', task: chk, key: chk.id + ':chk', label: 'Check your understanding', check: true }) }
      } else if ((follow.current[c] ?? 0) < 2 && room) {
        follow.current[c] = (follow.current[c] ?? 0) + 1
        const f = followUp(cur.task, used.current, opts, 0.72)
        if (f) { extra.current++; used.current.add(f.id); a.splice(Math.min(a.length, i + 3), 0, { kind: 'task', task: f, key: f.id + ':f', label: 'Another way' }) }
      }
      return a
    })
  }

  // "I don't know": counts as a mistake, shows the answer right away and opens an explanation
  const idk = () => {
    if (!cur || cur.kind !== 'task' || res) return
    const ans = shortAnswer(cur.task)
    onAnswer({ ok: false, grade: 1, idk: true, title: 'No problem, let\'s explain', answer: ans ?? undefined, msg: (cur.task as { why?: string }).why })
  }

  const next = () => {
    setRes(null)
    setItems(arr => {
      let a = arr
      // review round: tasks whose concept was not answered correctly by the end of the session
      if (i + 1 >= a.length && !finalRound.current && opts.mode !== 'test') {
        finalRound.current = true
        const fixedC = new Set<string>()
        const again: Item[] = []
        ;[...log].reverse().forEach(l => {
          const cc = l.task.c[0]
          if (l.ok) fixedC.add(cc)
          else if (!fixedC.has(cc) && !again.some(x => x.kind === 'task' && x.task.c[0] === cc)) again.push({ kind: 'task', task: l.task, key: l.task.id + ':end', retry: true, label: 'Review round' })
        })
        if (again.length) a = [...a, ...again.slice(0, 4)]
      }
      const nx = a[i + 1]
      if (!nx || nx.kind !== 'task' || nx.retry || nx.check) return a
      const re = repickFor(nx, used.current, opts, flow)
      if (re === nx) return a
      const b = [...a]; b[i + 1] = re
      return b
    })
    setI(x => x + 1)
  }

  const learnNext = () => {
    if (cur?.kind === 'learn') markLearned([cur.concept])
    sfx('tap')
    setI(x => x + 1)
  }

  useEffect(() => {
    if (!finished) return
    sfx('done', { acc: log.length ? log.filter(l => l.ok).length / log.length : 0 })
    if (opts.mode === 'test' && log.length) {
      const pct = log.filter(l => l.ok).length / log.length
      const grade = pct >= 0.89 ? 5 : pct >= 0.76 ? 4 : pct >= 0.63 ? 3 : pct >= 0.5 ? 2 : 1
      set(s => ({ ...s, tests: [...s.tests, { at: Date.now(), pct, grade, n: log.length, topic: opts.topic }].slice(-50) }))
    }
  }, [finished])

  const progress = Math.min(1, i / Math.max(1, total))
  const [from] = useState(() => originClip())

  const closeRef = useRef(requestClose)
  closeRef.current = requestClose
  // keyboard: Enter = Check or Next, 1 to 9 or A to D = choice, Esc = close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      const typing = t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable
      if (e.key === 'Escape') { closeRef.current(); return }
      if (e.key === 'Enter') {
        if (typing && !(e.metaKey || e.ctrlKey)) return
        if (!typing && t.tagName === 'BUTTON') return
        const btns = [...document.querySelectorAll<HTMLButtonElement>('.s-foot .btn.full')].filter(b => !b.disabled && b.offsetParent)
        const b = btns[btns.length - 1]
        if (b) { e.preventDefault(); b.click() }
        return
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === '?' || k === 'n') { const b = document.querySelector<HTMLButtonElement>('.s-foot .idk'); if (b) { e.preventDefault(); b.click() } return }
      const idx = /^[1-9]$/.test(k) ? Number(k) - 1 : 'abcd'.indexOf(k)
      if (idx < 0) return
      const opts = [...document.querySelectorAll<HTMLButtonElement>('.s-inner button.opt')].filter(b => !b.disabled && b.offsetParent)
      if (opts[idx]) { e.preventDefault(); opts[idx].click() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <motion.div className="session" initial={from ? { clipPath: from, opacity: 0.5 } : { y: '100%' }} animate={{ clipPath: FULL_CLIP, opacity: 1, y: 0 }} exit={{ y: '100%', transition: { type: 'spring', bounce: 0, duration: 0.4 } }} transition={{ type: 'spring', bounce: 0.1, duration: 0.6 }}
      onAnimationComplete={def => { if (def !== 'exit') { const el = document.querySelector<HTMLElement>('.session'); if (el) { el.style.clipPath = 'none'; el.style.transform = 'none' } } }}>
      <div className="s-top">
        <button className="iconbtn fill" onClick={requestClose} aria-label={showEnd ? 'Close' : 'Stop and show statistics'}><X size={19} strokeWidth={2.4} /></button>
        <div className="s-prog"><motion.i initial={false} animate={{ width: `${Math.max(3, progress * 100)}%` }} transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} /></div>
        <div className="fn num" style={{ minWidth: 40, textAlign: 'right', fontWeight: 600, color: 'var(--ink)' }}>{Math.min(i + 1, total)}/{total}</div>
        <AnimatePresence>
          {xp && <motion.div key={xp.k} className="xp" initial={{ opacity: 0, y: 6, scale: 0.8 }} animate={{ opacity: [0, 1, 1, 0], y: [6, 0, -4, -12], scale: [0.8, 1.08, 1, 1] }} transition={{ duration: 1.3, times: [0, 0.18, 0.7, 1] }} onAnimationComplete={() => setXp(null)}>+{xp.n} XP</motion.div>}
        </AnimatePresence>
      </div>
      <div className="s-body">
        <div className="s-inner">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={showEnd ? 'end' : cur?.key + ':' + i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: 'spring', bounce: 0, duration: 0.34 }}>
              {showEnd ? <Summary isTest={opts.mode === 'test'} log={log} title={title} startMem={startMem.current} lvBefore={lvBefore.current} onClose={end}
                stopped={stopped && !finished ? { at: i, total } : undefined} onResume={() => setStopped(false)} onRetry={() => {
                const wrong = log.filter(l => !l.ok).map(l => l.task)
                const uniq = wrong.filter((t, k) => wrong.findIndex(x => x.id === t.id) === k)
                first.current = new Set(); setLog([]); setI(0); setStopped(false)
                setItems(uniq.map(t => ({ kind: 'task', task: t, key: t.id + ':again' })))
              }} /> : cur.kind === 'learn' ? <LearnCard id={cur.concept} onNext={learnNext} /> : cur.kind === 'explain' ? <ExplainCard concept={cur.concept} ctx={cur.ctx} onNext={learnNext} /> : (
                <>
                  <div className="qtype">
                    <span className="fn" style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{TYPE_INFO[cur.task.t].name}</span>
                    {cur.label && <span className={`badge ${cur.label === 'Challenge' || cur.label === 'Check what you know' ? 'accent' : 'warn'}`}>{cur.label === 'Challenge' ? <Flame size={12} /> : cur.label === 'Review round' || cur.label === 'Another way' ? <RotateCcw size={12} /> : cur.label === 'Check what you know' ? <Target size={12} /> : null}{cur.label}</span>}
                    {cur.task.id.startsWith('ai:') && <span className="badge accent"><Sparkles size={12} /> AI</span>}
                    <DiffBadge d={curDiff} th={curTh} />
                  </div>
                  <motion.div animate={res ? (res.ok ? { scale: [1, 1.015, 1] } : { x: [0, -8, 8, -5, 5, 0] }) : { x: 0, scale: 1 }} transition={{ duration: res?.ok ? 0.32 : 0.4 }}>
                    <TaskView key={cur.key + i} task={cur.task} done={!!res} onAnswer={onAnswer} />
                  </motion.div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="s-foot">
        <AnimatePresence initial={false}>
          {res && cur?.kind === 'task' && !showEnd ? (
            <motion.div key="fb" className={`fbs ${res.ok ? 'good' : 'bad'}`} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%', transition: { duration: 0.18 } }} transition={{ type: 'spring', bounce: 0.22, duration: 0.5 }}>
              <Shape kind={res.ok ? 'sunny' : 'clover'} size={210} spin={res.ok ? 30 : 0} className="deco" />
              <div className="inner">
                <div className="fbh">
                  <motion.span className="fbi" initial={{ scale: 0.2, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6, duration: 0.6, delay: 0.05 }}>
                    <Shape kind={res.ok ? 'sunny' : 'clover'} size={44} fill={res.ok ? 'var(--good)' : 'var(--bad)'} spin={res.ok ? 10 : 0}>{res.ok ? <Check size={21} strokeWidth={3.4} color="#fff" /> : <X size={21} strokeWidth={3.4} color="#fff" />}</Shape>
                  </motion.span>
                  {res.title ?? (res.ok ? PRAISE[log.length % PRAISE.length] : 'Not correct')}
                </div>
                {res.answer && <div className="ans">{!res.ok && <b>Correct: </b>}{res.answer}</div>}
                {res.msg && <div className="why">{res.msg}</div>}
                {ab && (
                  <div className="fb-meta">
                    <span><DiffBars d={ab.d} /> {diffLabel(ab.d)} · {fmt1(ab.d)}/5</span>
                    <span className={ab.to >= ab.from ? 'up' : 'down'}>Concept level {fmt1(ab.from)} → <b>{fmt1(ab.to)}</b></span>
                  </div>
                )}
                <div className="cap src"><BookOpen size={12} /> {CON[cur.task.c[0]] ? `${TOP[CON[cur.task.c[0]].topic].src}, ${/^\d/.test(String(CON[cur.task.c[0]].page)) ? 'p. ' : ''}${CON[cur.task.c[0]].page} · ${CON[cur.task.c[0]].label}` : 'Notes'}</div>
                <button className={`btn full ${res.ok ? 'good' : 'bad'}`} style={{ marginTop: 14 }} onClick={next} autoFocus>Next{wide && <Kbd>Enter</Kbd>}</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="pad" className="pad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }}>
              <div className="inner">
                <div id="s-foot-slot" style={{ display: showEnd ? 'none' : undefined }} />
                {cur?.kind === 'task' && !showEnd && !res && cur.task.t !== 'recall' && (
                  <button className="idk" onClick={idk}><HelpCircle size={16} /> I don't know{wide && <Kbd>N</Kbd>}</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const PRAISE = ['Correct', 'Excellent', 'Exactly', 'Great', 'Well done']
const nalog = (n: number) => (n === 1 ? 'task' : 'tasks')
const pravilnih = (_n: number) => 'correct'

function Summary({ log, title, startMem, lvBefore, onClose, onRetry, isTest, stopped, onResume }: { log: Log[]; title: string; startMem: Record<string, string>; lvBefore: Record<string, number>; onClose: () => void; onRetry: () => void; isTest?: boolean; stopped?: { at: number; total: number }; onResume?: () => void }) {
  const mem = useStore(s => s.mem)
  const acc = log.length ? log.filter(l => l.ok).length / log.length : 0
  const testGrade = acc >= 0.89 ? 5 : acc >= 0.76 ? 4 : acc >= 0.63 ? 3 : acc >= 0.5 ? 2 : 1
  const concepts = useMemo(() => [...new Set(log.flatMap(l => l.task.c))], [log])
  const ups = concepts.filter(c => (startMem[c] ?? 'nov') !== level(mem[c]))
  const wrong = log.filter(l => !l.ok)
  const firstTry = log.filter(l => l.ok).length
  const ds = log.filter(l => l.d).map(l => l.d as number)
  const avgD = ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : 0
  const hardest = log.filter(l => l.ok && l.d).reduce((m, l) => Math.max(m, l.d as number), 0)
  const idks = log.filter(l => l.idk).length
  const moves = Object.entries(lvBefore).map(([c, f]) => ({ c, f, t: levelOfConcept(c) })).filter(x => Math.abs(x.t - x.f) >= 0.05).sort((a, b) => (b.t - b.f) - (a.t - a.f))
  return (
    <div style={{ paddingTop: 10 }}>
      <div style={{ display: 'grid', placeItems: 'center', margin: '28px 0 34px' }}>
        <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.45, duration: 0.9 }}
          onAnimationComplete={() => { if (acc >= 0.6) burst(window.innerWidth / 2, 200, 22, 190) }} style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
          <Shape kind={acc >= 0.85 ? 'sunny' : acc >= 0.6 ? 'cookie' : 'blob'} size={210} spin={40} fill="var(--lime)" style={{ position: 'absolute' }} />
          <WavyRing value={acc} size={168} stroke={12} color="var(--on-lime)" track="color-mix(in srgb, var(--on-lime) 16%, transparent)">
            <div style={{ color: 'var(--on-lime)', lineHeight: 1 }}><div className="big md"><CountUp to={Math.round(acc * 100)} duration={1.1} /><span className="unit">%</span></div><div className="cap" style={{ color: 'inherit', opacity: 0.7, marginTop: 4 }}>correct</div></div>
          </WavyRing>
        </motion.div>
      </div>
      {isTest && !stopped && <div style={{ textAlign: 'center', marginBottom: 6 }}><span className="badge accent" style={{ fontSize: 15, padding: '6px 14px' }}>Grade {testGrade}</span></div>}
      <h2 className="t2" style={{ textAlign: 'center' }}>{stopped ? 'Statistics so far' : acc >= 0.85 ? 'Excellent work' : acc >= 0.6 ? 'Good, the progress is there' : 'Worth it, the mistakes are now scheduled'}</h2>
      <div className="sub" style={{ textAlign: 'center', marginTop: 4 }}>{title} · {log.length} {nalog(log.length)} · {firstTry} {pravilnih(firstTry)}</div>
      {!stopped && ds.length > 0 && (
        <div className="sum-stats">
          <div><b className="num">{fmt1(avgD)}</b><span>average difficulty</span></div>
          <div><b className="num">{hardest ? fmt1(hardest) : '0'}</b><span>hardest solved</span></div>
          <div><b className="num">{idks}</b><span>I don't know</span></div>
        </div>
      )}
      {stopped && (
        <div className="sum-stats">
          <div><b className="num">{firstTry}</b><span>correct</span></div>
          <div><b className="num">{wrong.length}</b><span>wrong</span></div>
          <div><b className="num">{Math.min(stopped.at + 1, stopped.total)}/{stopped.total}</b><span>{isTest ? 'test not finished' : 'position in the session'}</span></div>
        </div>
      )}
      {moves.length > 0 && (
        <div className="sec">
          <span className="over">How your knowledge changed</span>
          <div className="list">
            {moves.slice(0, 8).map(m => (
              <div key={m.c} className="li nolead" style={{ minHeight: 50 }}>
                <span className="grow" style={{ fontWeight: 600, fontSize: 15.5 }}>{CON[m.c]?.label}</span>
                <span className="cap num">{fmt1(m.f)}</span>
                <ArrowRight size={14} color="var(--ink-3)" />
                <span className={`badge ${m.t >= m.f ? 'accent' : 'bad'}`}>{fmt1(m.t)}/5</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {ups.length > 0 && (
        <div className="sec">
          <span className="over">Concept progress</span>
          <div className="list">
            {ups.slice(0, 8).map(c => (
              <div key={c} className="li nolead" style={{ minHeight: 50 }}>
                <span className="grow" style={{ fontWeight: 600, fontSize: 15.5 }}>{CON[c]?.label}</span>
                <span className="cap">{LEVEL_NAME[(startMem[c] ?? 'nov') as keyof typeof LEVEL_NAME]}</span>
                <ArrowRight size={14} color="var(--ink-3)" />
                <span className="badge accent">{LEVEL_NAME[level(mem[c])]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {wrong.length > 0 && (
        <div className="sec">
          <span className="over">Where you went wrong</span>
          <div className="list">
            {wrong.slice(0, 8).map((w, k) => (
              <div key={k} className="li nolead" style={{ minHeight: 50 }}>
                <span className="badge">{TYPE_INFO[w.task.t].name}</span>
                <span className="grow fn" style={{ color: 'var(--ink)' }}>{CON[w.task.c[0]]?.label}</span>
                <Ring value={mastery(mem[w.task.c[0]])} size={26} stroke={4} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="stack" style={{ marginTop: 26 }}>
        {stopped && onResume && <button className="btn full accent" onClick={onResume}><Play size={17} fill="currentColor" /> Continue session</button>}
        {wrong.length > 0 && <button className="btn full ghost" onClick={onRetry}><RotateCcw size={18} /> Once more, only the mistakes</button>}
        <button className={`btn full ${stopped ? 'ghost' : ''}`} onClick={onClose}>{stopped ? 'End session' : 'Finish'}</button>
      </div>
      {stopped && <p className="cap" style={{ textAlign: 'center', marginTop: 12 }}>All answers are already saved.</p>}
    </div>
  )
}
