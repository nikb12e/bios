import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X, Check, ArrowRight, Flame, Sparkles, BookOpen, RotateCcw, Lightbulb, Play } from 'lucide-react'
import type { Task } from '../data/bank'
import { TYPE_INFO } from '../data/bank'
import { CON, TOP } from '../data/concepts'
import { ORG, type DetailId, type OrgId } from '../data/organelles'
import { buildSession, similarTask, allTasks, type Item, type SessionOpts } from '../engine/gen'
import { record, markLearned, get, set, useStore, saveSession, clearSession, flushRemote, type SavedSession } from '../engine/store'
import { level, LEVEL_NAME, mastery } from '../engine/fsrs'
import { TaskView } from '../tasks'
import type { Result } from '../tasks/shared'
import { sound, Ring, useWide, Kbd, CountUp } from '../ui/kit'
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

function LearnCard({ id, onNext }: { id: string; onNext: () => void }) {
  const c = CON[id]
  const o = c.org ? ORG[c.org] : undefined
  const isYear = id.startsWith('mejnik.')
  // razlaga se odvije v korakih: oznaka, naslov, slika, besedilo, opozorilo
  const st = (k: number) => ({ initial: { opacity: 0, y: 16, filter: 'blur(6px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' }, transition: { type: 'spring' as const, bounce: 0.2, duration: 0.7, delay: 0.05 + k * 0.12 } })
  return (
    <div>
      <motion.div className="qtype" {...st(0)}>
        <Shape kind="sunny" size={30} fill="var(--lime)" spin={14}><Lightbulb size={15} color="var(--on-lime)" /></Shape>
        <span className="hl" style={{ fontSize: 15 }}>Nov pojem</span><span className="fn">· {TOP[c.topic].title} · str. {c.page}</span>
      </motion.div>
      <motion.h2 className="t1" style={{ margin: '4px 2px 16px' }} initial={{ opacity: 0, fontWeight: 360 }} animate={{ opacity: 1, fontWeight: 770 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.9, delay: 0.12 }}>{c.label}</motion.h2>
      {isYear ? (
        <motion.div className="tile t-amber" style={{ minHeight: 0, marginBottom: 14 }} initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.4, duration: 0.8, delay: 0.25 }}>
          <Shape kind="gem" size={140} spin={40} className="deco" style={{ right: -40, top: -40 }} />
          <div className="lbl">Mejnik</div>
          <div className="big md">{c.label.match(/\d[\d/ do]*\d/)?.[0] ?? ''}</div>
        </motion.div>
      ) : <motion.div style={{ marginBottom: 14 }} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.3, duration: 0.8, delay: 0.25 }}><ConceptVisual id={id} /></motion.div>}
      <motion.div className="read" style={{ padding: '0 4px' }} {...st(3)}>{c.text}</motion.div>
      {o?.pazi && <motion.div className="pazi" style={{ marginTop: 12 }} {...st(4)}><b>Pazi</b><span>{o.pazi}</span></motion.div>}
      <Foot2><button className="btn full accent" onClick={onNext}>Razumem, preizkusi me <ArrowRight size={18} /></button></Foot2>
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

interface Log { task: Task; ok: boolean; grade: number }

export default function Session({ opts, title, onClose, items: preset, resume }: SessionProps) {
  const [items, setItems] = useState<Item[]>(() => (resume?.items as Item[] | undefined) ?? preset ?? buildSession(opts))
  const [i, setI] = useState(resume?.i ?? 0)
  const [res, setRes] = useState<Result | null>(null)
  const [log, setLog] = useState<Log[]>(() => (resume?.log as Log[] | undefined) ?? [])
  // X med sejo pokaže statistiko; seja ostane shranjena, dokler je ne končaš
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

  // sproti shranjena seja: po vsakem odgovoru in koraku, da se ob zaprtju aplikacije nič ne izgubi
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

  const onAnswer = (r: Result) => {
    if (!cur || cur.kind !== 'task') return
    const ms = Date.now() - t0.current
    let grade = r.grade
    if (r.ok && grade === 3 && ms < 6000 && ['mc', 'tf', 'locate', 'identify', 'type'].includes(cur.task.t) && !cur.retry) grade = 4
    record({ task: cur.task, concepts: cur.task.c, grade, ms, firstInSession: first.current, xp: r.ok ? (cur.retry ? 4 : 10 + (TYPE_INFO[cur.task.t].tier - 1) * 5) : 2 })
    sound(r.ok ? 'good' : 'bad')
    // zapre tipkovnico na telefonu, da gumb Naprej ni skrit pod njo
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    if (r.ok) setTimeout(() => burstFrom(document.querySelector('.s-inner .opt.good, .s-inner .good') ?? document.querySelector('.fbs .fbi'), 16), 90)
    setRes(r)
    if (r.ok) setXp({ n: cur.retry ? 4 : 10 + (TYPE_INFO[cur.task.t].tier - 1) * 5, k: Date.now() })
    const nl = [...log, { task: cur.task, ok: r.ok, grade }]
    setLog(nl)
    // tok: zadnjih 5 odgovorov
    const last = nl.slice(-5)
    if (last.length >= 4) {
      const acc = last.filter(x => x.ok).length / last.length
      setFlow(acc >= 0.9 ? 1 : acc <= 0.5 ? -1 : 0)
    }
    // napaka: ista naloga čez 3, podobna čez 6
    if (!r.ok && !cur.retry && opts.mode !== 'test') {
      setItems(arr => {
        const a = [...arr]
        a.splice(Math.min(a.length, i + 4), 0, { kind: 'task', task: cur.task, key: cur.task.id + ':r', retry: true, label: 'Ponovno' })
        const sim = similarTask(cur.task, used.current)
        if (sim) { used.current.add(sim.id); a.splice(Math.min(a.length, i + 7), 0, { kind: 'task', task: sim, key: sim.id, label: 'Podobna' }) }
        return a
      })
    }
  }

  const next = () => {
    setRes(null)
    // prilagodi naslednjo nalogo glede na tok
    setItems(arr => {
      const nx = arr[i + 1]
      if (!nx || nx.kind !== 'task' || nx.retry || opts.mode === 'test' || opts.mode === 'type') return arr
      const tier = TYPE_INFO[nx.task.t].tier
      if ((flow === 1 && tier === 1) || (flow === -1 && tier === 3)) {
        const want = flow === 1 ? [2, 3] : [1]
        const alt = allTasks().filter(t => t.c.includes(nx.task.c[0]) && want.includes(TYPE_INFO[t.t].tier) && !used.current.has(t.id) && (get().settings.ai || t.t !== 'explain'))
        if (alt.length) {
          const pick = alt[Math.floor(Math.random() * alt.length)]
          used.current.add(pick.id)
          const a = [...arr]
          a[i + 1] = { kind: 'task', task: pick, key: pick.id, label: flow === 1 ? 'Izziv' : 'Malo lažje' }
          return a
        }
      }
      return arr
    })
    setI(x => x + 1)
  }

  const learnNext = () => {
    if (cur?.kind === 'learn') markLearned([cur.concept])
    sound('tap')
    setI(x => x + 1)
  }

  useEffect(() => {
    if (!finished) return
    sound('done')
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
  // tipkovnica: Enter = Preveri ali Naprej, 1 do 9 ali A do D = izbira, Esc = zapri
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
        <button className="iconbtn fill" onClick={requestClose} aria-label={showEnd ? 'Zapri' : 'Ustavi in pokaži statistiko'}><X size={19} strokeWidth={2.4} /></button>
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
              {showEnd ? <Summary isTest={opts.mode === 'test'} log={log} title={title} startMem={startMem.current} onClose={end}
                stopped={stopped && !finished ? { at: i, total } : undefined} onResume={() => setStopped(false)} onRetry={() => {
                const wrong = log.filter(l => !l.ok).map(l => l.task)
                const uniq = wrong.filter((t, k) => wrong.findIndex(x => x.id === t.id) === k)
                first.current = new Set(); setLog([]); setI(0); setStopped(false)
                setItems(uniq.map(t => ({ kind: 'task', task: t, key: t.id + ':again' })))
              }} /> : cur.kind === 'learn' ? <LearnCard id={cur.concept} onNext={learnNext} /> : (
                <>
                  <div className="qtype">
                    <span className="fn" style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{TYPE_INFO[cur.task.t].name}</span>
                    {cur.label && <span className={`badge ${cur.label === 'Izziv' ? 'accent' : 'warn'}`}>{cur.label === 'Izziv' ? <Flame size={12} /> : cur.label === 'Ponovno' ? <RotateCcw size={12} /> : null}{cur.label}</span>}
                    {cur.task.id.startsWith('ai:') && <span className="badge accent"><Sparkles size={12} /> AI</span>}
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
                  {res.title ?? (res.ok ? PRAISE[log.length % PRAISE.length] : 'Ni pravilno')}
                </div>
                {res.answer && <div className="ans">{!res.ok && <b>Pravilno: </b>}{res.answer}</div>}
                {res.msg && <div className="why">{res.msg}</div>}
                <div className="cap src"><BookOpen size={12} /> {CON[cur.task.c[0]] ? `Zapiski, str. ${CON[cur.task.c[0]].page} · ${CON[cur.task.c[0]].label}` : 'Zapiski'}</div>
                <button className={`btn full ${res.ok ? 'good' : 'bad'}`} style={{ marginTop: 14 }} onClick={next} autoFocus>Naprej{wide && <Kbd>Enter</Kbd>}</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="pad" className="pad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }}>
              <div className="inner"><div id="s-foot-slot" style={{ display: showEnd ? 'none' : undefined }} /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const PRAISE = ['Pravilno', 'Odlično', 'Točno tako', 'Super', 'Bravo']
const nalog = (n: number) => (n % 100 === 1 ? 'naloga' : n % 100 === 2 ? 'nalogi' : n % 100 === 3 || n % 100 === 4 ? 'naloge' : 'nalog')
const pravilnih = (n: number) => (n % 100 === 1 ? 'pravilna' : n % 100 === 2 ? 'pravilni' : n % 100 === 3 || n % 100 === 4 ? 'pravilne' : 'pravilnih')

function Summary({ log, title, startMem, onClose, onRetry, isTest, stopped, onResume }: { log: Log[]; title: string; startMem: Record<string, string>; onClose: () => void; onRetry: () => void; isTest?: boolean; stopped?: { at: number; total: number }; onResume?: () => void }) {
  const mem = useStore(s => s.mem)
  const acc = log.length ? log.filter(l => l.ok).length / log.length : 0
  const testGrade = acc >= 0.89 ? 5 : acc >= 0.76 ? 4 : acc >= 0.63 ? 3 : acc >= 0.5 ? 2 : 1
  const concepts = useMemo(() => [...new Set(log.flatMap(l => l.task.c))], [log])
  const ups = concepts.filter(c => (startMem[c] ?? 'nov') !== level(mem[c]))
  const wrong = log.filter(l => !l.ok)
  const firstTry = log.filter(l => l.ok).length
  return (
    <div style={{ paddingTop: 10 }}>
      <div style={{ display: 'grid', placeItems: 'center', margin: '28px 0 34px' }}>
        <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.45, duration: 0.9 }}
          onAnimationComplete={() => { if (acc >= 0.6) burst(window.innerWidth / 2, 200, 22, 190) }} style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
          <Shape kind={acc >= 0.85 ? 'sunny' : acc >= 0.6 ? 'cookie' : 'blob'} size={210} spin={40} fill="var(--lime)" style={{ position: 'absolute' }} />
          <WavyRing value={acc} size={168} stroke={12} color="var(--on-lime)" track="color-mix(in srgb, var(--on-lime) 16%, transparent)">
            <div style={{ color: 'var(--on-lime)', lineHeight: 1 }}><div className="big md"><CountUp to={Math.round(acc * 100)} duration={1.1} /><span className="unit">%</span></div><div className="cap" style={{ color: 'inherit', opacity: 0.7, marginTop: 4 }}>pravilno</div></div>
          </WavyRing>
        </motion.div>
      </div>
      {isTest && !stopped && <div style={{ textAlign: 'center', marginBottom: 6 }}><span className="badge accent" style={{ fontSize: 15, padding: '6px 14px' }}>Ocena {testGrade}</span></div>}
      <h2 className="t2" style={{ textAlign: 'center' }}>{stopped ? 'Statistika do zdaj' : acc >= 0.85 ? 'Odlično delo' : acc >= 0.6 ? 'Dobro, napredek je tu' : 'Vredno je bilo, napake so zdaj na sporedu'}</h2>
      <div className="sub" style={{ textAlign: 'center', marginTop: 4 }}>{title} · {log.length} {nalog(log.length)} · {firstTry} {pravilnih(firstTry)}</div>
      {stopped && (
        <div className="sum-stats">
          <div><b className="num">{firstTry}</b><span>pravilno</span></div>
          <div><b className="num">{wrong.length}</b><span>napačno</span></div>
          <div><b className="num">{Math.min(stopped.at + 1, stopped.total)}/{stopped.total}</b><span>{isTest ? 'preizkus ni končan' : 'položaj v seji'}</span></div>
        </div>
      )}
      {ups.length > 0 && (
        <div className="sec">
          <span className="over">Napredek pojmov</span>
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
          <span className="over">Kje si se zmotil</span>
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
        {stopped && onResume && <button className="btn full accent" onClick={onResume}><Play size={17} fill="currentColor" /> Nadaljuj sejo</button>}
        {wrong.length > 0 && <button className="btn full ghost" onClick={onRetry}><RotateCcw size={18} /> Še enkrat samo napake</button>}
        <button className={`btn full ${stopped ? 'ghost' : ''}`} onClick={onClose}>{stopped ? 'Končaj sejo' : 'Končaj'}</button>
      </div>
      {stopped && <p className="cap" style={{ textAlign: 'center', marginTop: 12 }}>Vsi odgovori so že shranjeni.</p>}
    </div>
  )
}
