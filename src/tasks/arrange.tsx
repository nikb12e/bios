import { useMemo, useRef, useState } from 'react'
import { motion, Reorder, useDragControls } from 'motion/react'
import { GripVertical, ArrowLeftRight } from 'lucide-react'
import type { Task } from '../data/bank'
import { norm } from '../engine/gen'
import { CheckBtn, gradeFrac, useShuffled, type TaskProps } from './shared'
import { sound } from '../ui/kit'

type T<K extends Task['t']> = Extract<Task, { t: K }>

/* ───────── Fill in ───────── */
export function ClozeTask({ task, done, onAnswer }: TaskProps<T<'cloze'>>) {
  const segs = useMemo(() => task.text.split(/(\{[^}]+\})/).filter(Boolean), [task.text])
  const answers = useMemo(() => segs.filter(s => s.startsWith('{')).map(s => s.slice(1, -1)), [segs])
  const bank = useShuffled([...answers.map((a, i) => ({ id: 'a' + i, t: a })), ...(task.extra ?? []).map((e, i) => ({ id: 'e' + i, t: e }))], task.id)
  const [fill, setFill] = useState<(string | null)[]>(() => answers.map(() => null)) // token id
  const [active, setActive] = useState(0)
  const [checked, setChecked] = useState(false)
  const tokText = (id: string | null) => bank.find(b => b.id === id)?.t ?? ''
  const put = (id: string) => {
    if (checked) return
    const slot = fill[active] === null ? active : fill.findIndex(f => f === null)
    if (slot < 0) return
    const nf = [...fill]; nf[slot] = id
    setFill(nf)
    const nxt = nf.findIndex(f => f === null)
    setActive(nxt < 0 ? slot : nxt)
    sound('tap')
  }
  const clear = (i: number) => {
    if (checked) return
    const nf = [...fill]; nf[i] = null; setFill(nf); setActive(i)
  }
  const check = () => {
    setChecked(true)
    const right = fill.map((id, i) => norm(tokText(id)) === norm(answers[i]))
    const frac = right.filter(Boolean).length / answers.length
    onAnswer({ ok: frac === 1, grade: gradeFrac(frac), msg: task.why, answer: frac === 1 ? undefined : <>{segs.map((s, i) => s.startsWith('{') ? <b key={i}>{s.slice(1, -1)}</b> : <span key={i}>{s}</span>)}</> })
  }
  let gi = -1
  return (
    <div>
      <h2 className="q sm">Fill in the right terms.</h2>
      <div className="card cloze">
        {segs.map((s, i) => {
          if (!s.startsWith('{')) return <span key={i}>{s}</span>
          gi++
          const k = gi
          const id = fill[k]
          let cls = 'gap'
          if (id) cls += ' filled'
          if (checked) cls += norm(tokText(id)) === norm(answers[k]) ? ' good' : ' bad'
          if (!checked && active === k && !id) cls += ' filled'
          return <button key={i} className={cls} onClick={() => (id ? clear(k) : setActive(k))} style={!id && active === k && !checked ? { boxShadow: 'inset 0 0 0 2px var(--accent)' } : undefined}>{id ? tokText(id) : ' '}</button>
        })}
      </div>
      <div className="wrapchips" style={{ marginTop: 18 }}>
        {bank.map(b => <button key={b.id} className={`tok ${fill.includes(b.id) ? 'used' : ''}`} onClick={() => put(b.id)}>{b.t}</button>)}
      </div>
      {!done && <CheckBtn disabled={fill.some(f => f === null)} onClick={check} />}
    </div>
  )
}

/* ───────── Match pairs ───────── */
export function MatchTask({ task, done, onAnswer }: TaskProps<T<'match'>>) {
  const right = useShuffled(task.pairs.map((_, i) => i), task.id)
  const [sel, setSel] = useState<number | null>(null)
  const [solved, setSolved] = useState<number[]>([])
  const [bad, setBad] = useState<[number, number] | null>(null)
  const errs = useRef(0)
  const pickRight = (j: number) => {
    if (done || sel === null || solved.includes(j)) return
    if (sel === j) {
      const ns = [...solved, j]
      setSolved(ns); setSel(null); sound('tap')
      if (ns.length === task.pairs.length) {
        const e = errs.current
        onAnswer({ ok: e <= 1, grade: e === 0 ? 3 : e === 1 ? 2 : 1, title: e === 0 ? 'All pairs without a mistake' : `Matched, mistakes: ${e}`, msg: undefined })
      }
    } else {
      errs.current++
      setBad([sel, j]); sound('bad')
      setTimeout(() => setBad(null), 450)
      setSel(null)
    }
  }
  return (
    <div>
      <h2 className="q sm">{task.q}</h2>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <div className="stack" style={{ gap: 10 }}>
          {task.pairs.map((p, i) => (
            <button key={i} className={`pair ${sel === i ? 'sel' : ''} ${solved.includes(i) ? 'done' : ''} ${bad?.[0] === i ? 'bad' : ''}`} onClick={() => !solved.includes(i) && setSel(i)}>{p[0]}</button>
          ))}
        </div>
        <div className="stack" style={{ gap: 10 }}>
          {right.map(j => (
            <button key={j} className={`pair ${solved.includes(j) ? 'done' : ''} ${bad?.[1] === j ? 'bad' : ''}`} style={{ fontWeight: 500 }} onClick={() => pickRight(j)}>{task.pairs[j][1]}</button>
          ))}
        </div>
      </div>
      {!done && <div className="fn" style={{ marginTop: 14, textAlign: 'center' }}>Tap one on the left, then its match on the right.</div>}
    </div>
  )
}

/* ───────── Sort into groups ───────── */
export function SortTask({ task, done, onAnswer }: TaskProps<T<'sort'>>) {
  const items = useShuffled(task.items.map((it, i) => ({ i, t: it[0], bin: it[1] })), task.id)
  const [place, setPlace] = useState<Record<number, number>>({})
  const [sel, setSel] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [hot, setHot] = useState<number | null>(null)
  const binRefs = useRef<(HTMLDivElement | null)[]>([])
  const binAt = (x: number, y: number) => binRefs.current.findIndex(el => { if (!el) return false; const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom })
  const drop = (i: number, b: number) => { setPlace(p => ({ ...p, [i]: b })); setSel(null); sound('tap') }
  const tapBin = (b: number) => { if (sel !== null && !checked) drop(sel, b) }
  const unplace = (i: number) => { if (checked) return; setPlace(p => { const n = { ...p }; delete n[i]; return n }) }
  const check = () => {
    setChecked(true)
    const right = items.filter(it => place[it.i] === it.bin).length
    const frac = right / items.length
    onAnswer({ ok: frac === 1, grade: gradeFrac(frac), title: frac === 1 ? undefined : `Sorted correctly ${right} of ${items.length}`, msg: task.why })
  }
  const pool = items.filter(it => place[it.i] === undefined)
  const chip = (it: typeof items[number], inBin: boolean) => {
    const st = checked ? (place[it.i] === it.bin ? 'var(--accent)' : 'var(--bad)') : undefined
    return (
      <motion.button key={it.i} layout layoutId={`s${task.id}${it.i}`} className={`tok ${sel === it.i ? 'sel' : ''}`} style={{ ...(st ? { boxShadow: `inset 0 0 0 2px ${st}` } : {}), fontSize: 14.5, height: 'auto', minHeight: 38, padding: '8px 12px', textAlign: 'left' }}
        drag={!checked && !inBin} dragSnapToOrigin dragElastic={0.9} whileDrag={{ scale: 1.06, zIndex: 20, boxShadow: '0 12px 30px rgba(0,0,0,.18)' }}
        onDrag={(_, info) => setHot(binAt(info.point.x - window.scrollX, info.point.y - window.scrollY))}
        onDragEnd={(_, info) => { const b = binAt(info.point.x - window.scrollX, info.point.y - window.scrollY); setHot(null); if (b >= 0) drop(it.i, b) }}
        onClick={() => (inBin ? unplace(it.i) : setSel(sel === it.i ? null : it.i))}>
        {it.t}
        {checked && place[it.i] !== it.bin && <span style={{ marginLeft: 6, color: 'var(--bad)', fontSize: 12 }}>→ {task.bins[it.bin]}</span>}
      </motion.button>
    )
  }
  return (
    <div>
      <h2 className="q sm">{task.q}</h2>
      <div className="wrapchips" style={{ minHeight: 44, marginBottom: 16 }}>
        {pool.map(it => chip(it, false))}
        {!pool.length && !checked && <span className="fn">Everything is sorted. Check or move.</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${task.bins.length}, 1fr)`, gap: 10 }}>
        {task.bins.map((b, k) => (
          <div key={k} ref={el => { binRefs.current[k] = el }} className={`bin ${hot === k || (sel !== null && !checked) ? 'hot' : ''}`} onClick={() => tapBin(k)}>
            <span className="over">{b}</span>
            <div className="wrapchips" style={{ gap: 6 }}>{items.filter(it => place[it.i] === k).map(it => chip(it, true))}</div>
          </div>
        ))}
      </div>
      {!done && <div className="fn" style={{ marginTop: 12, textAlign: 'center' }}>Drag or tap a term, then a group.</div>}
      {!done && <CheckBtn disabled={pool.length > 0} onClick={check} />}
    </div>
  )
}

/* ───────── Order ───────── */
function OrdRow({ item, idx, status }: { item: string; idx: number; status?: 'good' | 'bad' }) {
  const ctl = useDragControls()
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={ctl} className={`ord ${status ?? ''}`} whileDrag={{ scale: 1.03, boxShadow: '0 14px 34px rgba(0,0,0,.16)' }}>
      <span className="n">{idx + 1}</span>
      <span className="grow">{item}</span>
      <span className="h" style={{ touchAction: 'none', padding: 6, margin: -6, cursor: 'grab' }} onPointerDown={e => ctl.start(e)}><GripVertical size={20} /></span>
    </Reorder.Item>
  )
}

export function OrderTask({ task, done, onAnswer }: TaskProps<T<'order'>>) {
  const [list, setList] = useState<string[]>(() => {
    let s = [...task.items]
    for (let k = 0; k < 8 && s.every((x, i) => x === task.items[i]); k++) s = [...task.items].sort(() => Math.random() - 0.5)
    return s
  })
  const [checked, setChecked] = useState(false)
  const check = () => {
    setChecked(true)
    const right = list.filter((x, i) => x === task.items[i]).length
    const frac = right / list.length
    onAnswer({ ok: frac === 1, grade: gradeFrac(frac), title: frac === 1 ? undefined : `In the right place ${right} of ${list.length}`, msg: task.why, answer: frac === 1 ? undefined : <ol style={{ margin: '4px 0 0', paddingLeft: 20 }}>{task.items.map(x => <li key={x}>{x}</li>)}</ol> })
  }
  return (
    <div>
      <h2 className="q sm">{task.q}</h2>
      <Reorder.Group axis="y" values={list} onReorder={checked ? () => {} : setList} className="stack" style={{ gap: 9, listStyle: 'none', padding: 0, margin: 0 }}>
        {list.map((x, i) => <OrdRow key={x} item={x} idx={i} status={checked ? (x === task.items[i] ? 'good' : 'bad') : undefined} />)}
      </Reorder.Group>
      {!done && <div className="fn" style={{ marginTop: 12, textAlign: 'center' }}>Grab the handle on the right and move it.</div>}
      {!done && <CheckBtn onClick={check} />}
    </div>
  )
}

/* ───────── Comparison table: prokaryotic versus eukaryotic ───────── */
const PE_ROWS: [string, string, string][] = [
  ['size', '0.5 to 8 µm', '10 to 100 µm'],
  ['genetic material', 'one circular DNA, not bound to proteins', 'many linear DNAs bound to special proteins'],
  ['nuclear envelope', 'not present', 'present'],
  ['nucleus', 'not present', 'present'],
  ['division', 'without a spindle (fission)', 'with a spindle (mitosis, meiosis)'],
  ['ribosomes', 'smaller', 'larger'],
  ['ER, Golgi, mitochondria', 'not present', 'present'],
  ['plastids (chloroplasts)', 'not present', 'present in plants'],
]
export function TableTask({ done, onAnswer }: TaskProps<T<'table'>>) {
  const [swap, setSwap] = useState<boolean[]>(() => {
    const s = PE_ROWS.map(() => Math.random() < 0.5)
    if (s.every(x => !x)) s[1] = true
    return s
  })
  const [checked, setChecked] = useState(false)
  const check = () => {
    setChecked(true)
    const right = swap.filter(x => !x).length
    const frac = right / PE_ROWS.length
    onAnswer({ ok: frac === 1, grade: gradeFrac(frac), title: frac === 1 ? 'The table is correct' : `Correct rows ${right} of ${PE_ROWS.length}`, msg: 'Source: notes, page 2.' })
  }
  return (
    <div>
      <h2 className="q sm">Put every row right: the arrows swap the columns.</h2>
      <div className="row" style={{ margin: '0 2px 8px', gap: 6 }}>
        <span className="over grow" style={{ textAlign: 'center' }}>Prokaryotic</span><span style={{ width: 40 }} /><span className="over grow" style={{ textAlign: 'center' }}>Eukaryotic</span>
      </div>
      <div className="stack" style={{ gap: 8 }}>
        {PE_ROWS.map(([k, a, b], i) => {
          const [l, r] = swap[i] ? [b, a] : [a, b]
          const st = checked ? (swap[i] ? 'bad' : 'good') : 'filled'
          return (
            <div key={k} className="pe-row">
              <div className="k">{k}</div>
              <div className="cells">
                <motion.div layout className={`cell-btn ${st}`}>{l}</motion.div>
                <button className="iconbtn" disabled={checked} style={{ background: 'var(--card-2)', width: 40, height: 40, alignSelf: 'center' }} onClick={() => { setSwap(s => s.map((x, j) => (j === i ? !x : x))); sound('tap') }} aria-label="Swap"><ArrowLeftRight size={16} /></button>
                <motion.div layout className={`cell-btn ${st}`}>{r}</motion.div>
              </div>
            </div>
          )
        })}
      </div>
      {!done && <CheckBtn onClick={check} />}
    </div>
  )
}
