import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Rotate3d, Tag, Scissors, List, X, Box, Square, Clapperboard, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Dumbbell, ChevronRight as Chev } from 'lucide-react'
import type { Nav, CellReq } from '../App'
import Cell3D from '../art/Cell3D'
import { CellView, PARTS_ON, partName, type PartId, type CellKind } from '../art/Cells'
import { PROCS, PROC_TEXT, type ProcId } from '../art/procs'
import { ORG, ON_ANIMAL, type OrgId } from '../data/organelles'
import { Seg, ORG_COLOR, Dot, useWide, Sheet } from '../ui/kit'
import { Shape } from '../ui/flux'
import { OrgSheet, OrgInfo } from './OrgSheet'

type ProcState = { id: ProcId; step: number; auto: boolean; n: number; end: boolean }
const STEP_S = 7

// The cell full screen: the model is the main thing, the controls are floating glass layers.
export default function Explore({ nav, req }: { nav: Nav; req?: CellReq | null }) {
  const [kind, setKind] = useState<CellKind>('animal')
  const [mode, setMode] = useState<'3d' | '2d'>('3d')
  const [focus, setFocus] = useState<PartId | null>(null)
  const [sel, setSel] = useState<OrgId | null>(null)
  const [list, setList] = useState(false)
  const [procList, setProcList] = useState(false)
  const [proc, setProc] = useState<ProcState | null>(null)
  const [labels, setLabels] = useState(false)
  const [cut, setCut] = useState(true)
  const [spin, setSpin] = useState(true)
  const [pad, setPad] = useState(0)
  const card = useRef<HTMLDivElement>(null)
  const [scheme, setScheme] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const wide = useWide()
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const f = () => setScheme(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])
  const is3d = mode === '3d'
  const parts = PARTS_ON[kind].filter(p => p !== 'dnk')

  const pick = (id: PartId | null) => {
    if (proc) return
    setFocus(id)
    setSel(id && id !== 'dnk' ? (id as OrgId) : null)
    if (id) setSpin(false)
  }
  const practice = (id: OrgId) => { setSel(null); nav.start({ mode: 'org', org: id, size: 8 }, ORG[id].name) }

  const startProc = (id: ProcId) => {
    const meta = PROCS.find(p => p.id === id)!
    setProcList(false)
    setFocus(null); setSel(null); setList(false)
    setMode('3d'); setKind(meta.kind); setSpin(false); setCut(true)
    setProc({ id, step: 0, auto: true, n: Date.now(), end: false })
  }
  const stopProc = () => { setProc(null); setSpin(false) }
  useEffect(() => {
    if (!req) return
    if (req.proc) { startProc(req.proc); return }
    if (req.org) {
      const o = req.org
      setProc(null); setMode('3d')
      setKind(ON_ANIMAL.includes(o) ? 'animal' : 'plant')
      setFocus(o); setSel(o); setSpin(false)
    }
  }, [req?.k]) // eslint-disable-line react-hooks/exhaustive-deps

  const steps = proc ? PROC_TEXT[proc.id] : []
  const go = (k: number) => setProc(p => p && { ...p, step: Math.max(0, Math.min(PROC_TEXT[p.id].length - 1, k)), n: Date.now(), end: false })
  const onStepDone = () => setProc(p => {
    if (!p || !p.auto) return p
    const last = PROC_TEXT[p.id].length - 1
    return p.step < last ? { ...p, step: p.step + 1, n: Date.now() } : { ...p, end: true, auto: false }
  })
  const toggle = () => setProc(p => p && (p.end ? { ...p, step: 0, auto: true, end: false, n: Date.now() } : { ...p, auto: !p.auto }))

  // keyboard: arrows for steps, space to play, Esc to exit
  useEffect(() => {
    if (!proc) return
    const f = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowRight') go(proc.step + 1)
      else if (e.key === 'ArrowLeft') go(proc.step - 1)
      else if (e.key === ' ') { e.preventDefault(); toggle() }
      else if (e.key === 'Escape') stopProc()
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [proc]) // eslint-disable-line react-hooks/exhaustive-deps

  // card height: the highlighted part of the cell sits above it
  useLayoutEffect(() => {
    const c = card.current
    if (!proc || !c) { setPad(0); return }
    const f = () => {
      const host = c.closest('.explore-full')!.getBoundingClientRect()
      const r = c.getBoundingClientRect()
      setPad(wide ? 0 : Math.max(0, host.bottom - r.top + 8))
    }
    f()
    const ro = new ResizeObserver(f)
    ro.observe(c)
    return () => ro.disconnect()
  }, [!!proc, wide]) // eslint-disable-line react-hooks/exhaustive-deps

  const meta = proc ? PROCS.find(p => p.id === proc.id)! : null
  const st = proc ? steps[proc.step] : null

  return (
    <div className={`explore-full ${proc ? 'in-proc' : ''}`}>
      {is3d
        ? <Cell3D key={kind + String(scheme)} kind={kind} focus={focus} onPick={id => pick(id)} labels={labels} cut={cut} spin={spin}
            proc={proc && { id: proc.id, step: proc.step, auto: proc.auto, n: proc.n }} onStepDone={onStepDone} padBottom={pad} padRight={wide && proc ? 420 : 0} />
        : <div className="flat2d"><div><CellView kind={kind} focus={focus} onPick={id => pick(focus === id ? null : id)} labels={labels} /></div></div>}

      <div className="ex-top" style={wide && (sel || proc) ? { right: 420 } : undefined}>
        <div className="ttl">
          <h1 className="lt">{meta ? meta.name : 'Cell'}</h1>
          {!proc && (
            <div className="seg glass" style={{ width: 118 }}>
              <motion.div className="thumb" layout transition={{ type: 'spring', bounce: 0, duration: 0.32 }} style={{ left: mode === '3d' ? 2 : 'calc(50% + 0px)', width: 'calc(50% - 2px)' }} />
              <button className={mode === '3d' ? 'on' : ''} onClick={() => setMode('3d')}><Box size={14} style={{ verticalAlign: -2 }} /> 3D</button>
              <button className={mode === '2d' ? 'on' : ''} onClick={() => setMode('2d')}><Square size={13} style={{ verticalAlign: -2 }} /> 2D</button>
            </div>
          )}
          {proc && <button className="iconbtn solid ex-close" onClick={stopProc} aria-label="Close explanation"><X size={18} /></button>}
        </div>
        {!proc && (
          <div className="glass" style={{ borderRadius: 999, maxWidth: 420 }}>
            <Seg value={kind} onChange={k => { setKind(k); pick(null) }} options={[{ v: 'animal', label: 'Animal' }, { v: 'plant', label: 'Plant' }, { v: 'prok', label: 'Prokaryotic' }]} />
          </div>
        )}
      </div>

      {!proc && <div className="ex-hint" style={wide && sel ? { right: 400 } : undefined}>{is3d ? 'Drag to rotate · tap an organelle' : 'Tap an organelle'}</div>}

      {!proc && (
        <div className="ex-tools glass c3d-ctl" style={wide && sel ? { left: 'calc(50% - 200px)' } : undefined}>
          <button className={labels ? 'on' : ''} onClick={() => setLabels(l => !l)} aria-label="Labels" title="Labels"><Tag size={16} /><span className="lbl">Labels</span></button>
          {is3d && <button className={cut ? 'on' : ''} onClick={() => setCut(c => !c)} aria-label="Cutaway" title="Cutaway"><Scissors size={16} /><span className="lbl">Cutaway</span></button>}
          {is3d && <button className={spin ? 'on' : ''} onClick={() => setSpin(c => !c)} aria-label="Rotate" title="Rotate"><Rotate3d size={17} /></button>}
          <button onClick={() => setList(true)} aria-label="List of parts" title="List of parts"><List size={17} /></button>
          <button className="ex-proc" onClick={() => setProcList(true)}><Clapperboard size={16} /> Explanations</button>
        </div>
      )}

      <AnimatePresence>
        {proc && meta && st && (
          <motion.div ref={card} key="pc" className={`proc-card glass ${meta.tone}`} initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} transition={{ type: 'spring', bounce: 0, duration: 0.42 }}>
            <div className="pc-bars" role="tablist" aria-label="Steps">
              {steps.map((s, i) => (
                <button key={i} role="tab" aria-selected={i === proc.step} aria-label={`Step ${i + 1}: ${s.title}`} onClick={() => go(i)} className="pc-bar">
                  <i className={i < proc.step || (i === proc.step && proc.end) ? 'full' : i === proc.step ? 'run' : ''}
                    key={i === proc.step ? proc.n : i}
                    style={i === proc.step && !proc.end ? ({ '--d': STEP_S + 's', '--ps': proc.auto ? 'running' : 'paused' } as CSSProperties) : undefined} />
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={proc.step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="pc-body" aria-live="polite">
                <div className="pc-k">
                  <span>Step {proc.step + 1} of {steps.length}</span>
                  {st.d && <span className="pc-chip" title="This goes beyond the Cell notes">Extra explanation</span>}
                </div>
                <div className="pc-t">{st.title}</div>
                <p className="pc-p">{st.text}</p>
              </motion.div>
            </AnimatePresence>
            {proc.end ? (
              <div className="pc-end">
                <button className="btn ghost" onClick={toggle}><RotateCcw size={17} /> Replay</button>
                <button className="btn accent" onClick={() => { stopProc(); practice(meta.org) }}><Dumbbell size={17} /> Practise: {ORG[meta.org].name}</button>
              </div>
            ) : (
              <div className="pc-ctl">
                <button className="iconbtn fill" onClick={() => go(proc.step - 1)} disabled={proc.step === 0} aria-label="Previous step"><ChevronLeft size={20} /></button>
                <button className="pc-play" onClick={toggle} aria-label={proc.auto ? 'Pause' : 'Play'}>{proc.auto ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: 2 }} />}</button>
                <button className="iconbtn fill" onClick={() => (proc.step === steps.length - 1 ? setProc(p => p && { ...p, end: true, auto: false }) : go(proc.step + 1))} aria-label="Next step"><ChevronRight size={20} /></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {wide ? (
        <AnimatePresence>
          {sel && !proc && (
            <motion.aside key={sel} className="ex-panel glass" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ type: 'spring', bounce: 0, duration: 0.36 }}>
              <div className="row" style={{ marginBottom: 12 }}>
                <Dot color={ORG_COLOR[sel]} size={12} />
                <span className="t3 grow">{ORG[sel].name}</span>
                <button className="iconbtn fill" onClick={() => pick(null)} aria-label="Close"><X size={17} /></button>
              </div>
              <OrgInfo id={sel} onPractice={practice} compact />
            </motion.aside>
          )}
        </AnimatePresence>
      ) : (
        <OrgSheet id={proc ? null : sel} onClose={() => pick(null)} onPractice={practice} />
      )}

      <Sheet open={list} onClose={() => setList(false)} title={<span className="t3">Parts of the cell</span>}>
        <div className="list">
          {parts.map(p => (
            <button key={p} className="li" onClick={() => { setList(false); pick(p) }}>
              <span style={{ width: 30, display: 'grid', placeItems: 'center' }}><Dot color={ORG_COLOR[p]} size={12} /></span>
              <span className="grow t">{partName(p)}</span>
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={procList} onClose={() => setProcList(false)} title={<span className="t3">Animated explanations</span>}>
        <p className="sub" style={{ margin: '0 4px 14px' }}>The 3D cell shows how a process runs, step by step.</p>
        <div className="list">
          {PROCS.map(p => (
            <button key={p.id} className="li proc-li" onClick={() => startProc(p.id)}>
              <Shape kind={p.shape} size={40} fill={p.color} spin={30}><Play size={15} color="#fff" fill="#fff" style={{ marginLeft: 2 }} /></Shape>
              <span className="grow" style={{ minWidth: 0 }}>
                <span className="t" style={{ display: 'block' }}>{p.name}</span>
                <span className="cap" style={{ display: 'block' }}>{p.sub} · {PROC_TEXT[p.id].length} steps · {p.kind === 'plant' ? 'plant' : 'animal'}</span>
              </span>
              <Chev size={18} className="chev" />
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
