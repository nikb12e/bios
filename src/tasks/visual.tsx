import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import type { Task } from '../data/bank'
import { ORG, type OrgId } from '../data/organelles'
import { CellView, PARTS_ON, partName, type PartId } from '../art/Cells'
import { DETAILS, DetailView } from '../art/Details'
import { matchAnswer, shuffle } from '../engine/gen'
import { CheckBtn, gradeFrac, useShuffled, type TaskProps } from './shared'
import { useAutoFocus, sound } from '../ui/kit'

type T<K extends Task['t']> = Extract<Task, { t: K }>

/* ───────── Pokaži na celici ───────── */
export function LocateTask({ task, done, onAnswer }: TaskProps<T<'locate'>>) {
  const [good, setGood] = useState<PartId | null>(null)
  const [bad, setBad] = useState<PartId | null>(null)
  const pick = (id: PartId) => {
    if (done || good) return
    const ok = id === task.target
    setGood(task.target)
    if (!ok) setBad(id)
    const o = ORG[task.target]
    onAnswer({ ok, grade: ok ? 3 : 1, msg: <><b>{o.name}</b>: {o.short}</>, answer: ok ? undefined : <>Tapnil si: {partName(id)}</> })
  }
  return (
    <div>
      <h2 className="q">Pokaži: <span style={{ color: 'var(--accent-ink)' }}>{ORG[task.target].name}</span></h2>
      <div className="stage">
        <CellView kind={task.cell} onPick={pick} good={good} bad={bad} focus={good} />
      </div>
      <div className="fn" style={{ marginTop: 10, textAlign: 'center' }}>{task.cell === 'plant' ? 'Rastlinska celica' : 'Živalska celica'} · tapni pravi del</div>
    </div>
  )
}

/* ───────── Kaj je označeno ───────── */
export function IdentifyTask({ task, done, onAnswer }: TaskProps<T<'identify'>>) {
  const opts = useMemo(() => {
    const pool = PARTS_ON[task.cell].filter(p => p !== task.target && p !== 'citoplazma' && p !== 'dnk') as OrgId[]
    // prepričljivi distraktorji: podobni organeli imajo prednost
    const near: Partial<Record<OrgId, OrgId[]>> = {
      jedro: ['jedrce', 'vakuola', 'lizosom'], jedrce: ['jedro', 'ribosomi', 'centrioli'], zrnatiER: ['gladkiER', 'golgi', 'ribosomi'], gladkiER: ['zrnatiER', 'golgi', 'citoskelet'],
      golgi: ['zrnatiER', 'gladkiER', 'mitohondrij'], mitohondrij: ['kloroplast', 'lizosom', 'golgi'], lizosom: ['vakuola', 'ribosomi', 'centrioli'], vakuola: ['lizosom', 'jedro', 'citoplazma' as OrgId],
      kloroplast: ['mitohondrij', 'skrobna', 'vakuola'], skrobna: ['kloroplast', 'vakuola', 'lizosom'], ribosomi: ['jedrce', 'lizosom', 'centrioli'], centrioli: ['ribosomi', 'citoskelet', 'golgi'],
      membrana: ['stena', 'citoskelet', 'migetalke'], stena: ['membrana', 'citoskelet', 'vakuola'], citoskelet: ['migetalke', 'gladkiER', 'membrana'], migetalke: ['citoskelet', 'membrana', 'centrioli'],
    }
    const pref = (near[task.target] ?? []).filter(p => pool.includes(p) || p === 'citoplazma')
    const rest = shuffle(pool.filter(p => !pref.includes(p)))
    return shuffle([task.target, ...[...pref, ...rest].slice(0, 3)])
  }, [task])
  const [pick, setPick] = useState<OrgId | null>(null)
  const [v, setV] = useState('')
  const [st, setSt] = useState<'' | 'good' | 'bad'>('')
  const ref = useAutoFocus<HTMLInputElement>(task.mode === 'type' && !done)
  const o = ORG[task.target]
  const finish = (ok: boolean, typo = false) => onAnswer({ ok, grade: ok ? (typo ? 2 : 3) : 1, title: typo ? 'Pravilno, pazi na zapis' : undefined, msg: <><b>{o.name}</b>: {o.short}</>, answer: ok && !typo ? undefined : <b>{o.name}</b> })
  const choose = (id: OrgId) => { if (done || pick) return; setPick(id); finish(id === task.target) }
  const submit = () => {
    if (done || !v.trim()) return
    const m = matchAnswer(v, [o.name, ...o.aliases])
    setSt(m === 'no' ? 'bad' : 'good')
    finish(m !== 'no', m === 'typo')
  }
  return (
    <div>
      <h2 className="q">Kaj je označeno?</h2>
      <div className="stage" style={{ marginBottom: 16 }}>
        <CellView kind={task.cell} className="soft" focus={task.target} mark={done ? null : task.target} good={done ? task.target : null} labels={false} hideLabelsOf={done ? [] : [task.target]} />
      </div>
      {task.mode === 'choose' ? (
        <div className="grid2">
          {opts.map(id => {
            let cls = 'opt'
            if (pick) cls += id === task.target ? ' good' : id === pick ? ' bad' : ' dim'
            return <button key={id} className={cls} style={{ justifyContent: 'center', textAlign: 'center', fontWeight: 650 }} onClick={() => choose(id)}>{ORG[id]?.name ?? partName(id)}</button>
          })}
        </div>
      ) : (
        <>
          <input ref={ref} className={`field ${st}`} value={v} onChange={e => setV(e.target.value)} placeholder="Ime organela" autoCapitalize="off" autoCorrect="off" spellCheck={false} onKeyDown={e => { if (e.key === 'Enter') submit() }} disabled={done} />
          {!done && <CheckBtn disabled={!v.trim()} onClick={submit} />}
        </>
      )}
    </div>
  )
}

/* ───────── Označi sliko ───────── */
export function LabelsTask({ task, done, onAnswer }: TaskProps<T<'labels'>>) {
  const d = DETAILS[task.diagram]
  const chips = useShuffled(d.parts.map(p => p.label), task.id)
  const [slots, setSlots] = useState<Record<string, string | undefined>>({})
  const [active, setActive] = useState<string>(d.parts[0].id)
  const [checked, setChecked] = useState(false)
  const status = useMemo(() => {
    if (!checked) return undefined
    const s: Record<string, 'good' | 'bad'> = {}
    d.parts.forEach(p => { s[p.id] = slots[p.id] === p.label ? 'good' : 'bad' })
    return s
  }, [checked, slots, d.parts])
  const used = new Set(Object.values(slots).filter(Boolean) as string[])
  const place = (label: string) => {
    if (checked) return
    const ns = { ...slots }
    // če je oznaka že kje drugje, jo premakni
    Object.keys(ns).forEach(k => { if (ns[k] === label) ns[k] = undefined })
    ns[active] = label
    setSlots(ns); sound('tap')
    const next = d.parts.find(p => !ns[p.id])
    if (next) setActive(next.id)
  }
  const check = () => {
    setChecked(true)
    const right = d.parts.filter(p => slots[p.id] === p.label).length
    const frac = right / d.parts.length
    onAnswer({ ok: frac === 1, grade: gradeFrac(frac), title: frac === 1 ? 'Vse oznake so prave' : `Pravilnih oznak ${right} od ${d.parts.length}`, msg: d.caption })
  }
  return (
    <div>
      <h2 className="q sm">Označi: {d.title.toLowerCase()}</h2>
      <div className="stage" style={{ marginBottom: 14 }}>
        <DetailView id={task.diagram} mode={checked ? 'study' : 'pins'} placed={slots} status={status} active={checked ? null : active} onPin={id => !checked && setActive(id)} />
      </div>
      <div className="list" style={{ marginBottom: 14 }}>
        {d.parts.map((p, i) => {
          const val = slots[p.id]
          const st = status?.[p.id]
          return (
            <button key={p.id} className="li nolead" style={{ minHeight: 50, padding: '9px 14px', background: active === p.id && !checked ? 'var(--card-2)' : undefined }} onClick={() => { if (checked) return; if (val) { setSlots(s => ({ ...s, [p.id]: undefined })) } setActive(p.id) }}>
              <span style={{ width: 26, height: 26, borderRadius: 99, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, flex: 'none', background: st === 'good' ? 'var(--accent)' : st === 'bad' ? 'var(--bad)' : active === p.id ? 'var(--accent)' : 'var(--ink)', color: '#fff' }}>{i + 1}</span>
              <span className="grow" style={{ fontWeight: 600, color: val ? 'var(--ink)' : 'var(--ink-3)' }}>{val ?? (active === p.id ? 'izberi oznako spodaj' : '...')}</span>
              {st === 'bad' && <span className="fn" style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>{p.label}</span>}
            </button>
          )
        })}
      </div>
      {!checked && <div className="wrapchips">{chips.map(c => <button key={c} className={`tok ${used.has(c) ? 'used' : ''}`} onClick={() => place(c)}>{c}</button>)}</div>}
      {!done && <CheckBtn disabled={d.parts.some(p => !slots[p.id])} onClick={check} />}
    </div>
  )
}

/* ───────── Velikost in povečava ───────── */
const fmt = (n: number) => (Math.round(n * 1000) / 1000).toString().replace('.', ',')
const parseNum = (s: string) => Number(s.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.]/g, ''))

export function ScaleTask({ task, done, onAnswer }: TaskProps<T<'scale'>>) {
  const q = useMemo(() => {
    if (task.kind === 'zoom') {
      const ok = [5, 10, 15][Math.floor(Math.random() * 3)]
      const ob = [4, 10, 40, 100][Math.floor(Math.random() * 4)]
      return { kind: 'zoom' as const, text: `Okular ima povečavo ${ok}×, objektiv ${ob}×. Kolikšna je skupna povečava?`, ans: ok * ob, unit: '×', expl: `${ok} · ${ob} = ${ok * ob}×. Skupna povečava je zmnožek povečave okularja in objektiva.` }
    }
    if (task.kind === 'units') {
      const cases = [
        { v: [0.2, 0.5, 0.8, 1.5][Math.floor(Math.random() * 4)], from: 'mm', to: 'µm', k: 1000 },
        { v: [2500, 800, 4000, 150][Math.floor(Math.random() * 4)], from: 'nm', to: 'µm', k: 0.001 },
        { v: [40, 250, 10, 600][Math.floor(Math.random() * 4)], from: 'µm', to: 'mm', k: 0.001 },
        { v: [3, 0.5, 8, 12][Math.floor(Math.random() * 4)], from: 'µm', to: 'nm', k: 1000 },
      ]
      const c = cases[Math.floor(Math.random() * cases.length)]
      const ans = c.v * c.k
      return { kind: 'units' as const, text: `${fmt(c.v)} ${c.from} = ? ${c.to}`, ans, unit: c.to, expl: `1 mm = 1000 µm, 1 µm = 1000 nm. Torej ${fmt(c.v)} ${c.from} = ${fmt(ans)} ${c.to}.` }
    }
    const which = Math.random() < 0.5 ? 'prok' : 'evk'
    return { kind: 'size' as const, text: which === 'prok' ? 'Postavi drsnik na tipično velikost prokariontske celice (bakterije).' : 'Postavi drsnik na tipično velikost evkariontske celice.', lo: which === 'prok' ? 0.5 : 10, hi: which === 'prok' ? 8 : 100, expl: 'Prokariontske celice merijo večinoma 0,5 do 8 µm, evkariontske 10 do 100 µm (zapiski, stran 2).' }
  }, [task])
  const [v, setV] = useState('')
  const [pos, setPos] = useState(50) // 0..100 → 10 nm .. 1 mm (log)
  const um = Math.pow(10, -2 + (pos / 100) * 5) // 0,01 µm .. 1000 µm
  const ref = useAutoFocus<HTMLInputElement>(q.kind !== 'size' && !done)
  const [st, setSt] = useState<'' | 'good' | 'bad'>('')
  const submit = () => {
    if (done) return
    if (q.kind === 'size') {
      const ok = um >= q.lo * 0.85 && um <= q.hi * 1.15
      setSt(ok ? 'good' : 'bad')
      onAnswer({ ok, grade: ok ? 3 : 1, msg: q.expl, answer: ok ? undefined : <>Tvoja izbira: {fmtUm(um)}</> })
      return
    }
    const n = parseNum(v)
    const ok = Math.abs(n - q.ans) < 1e-9 + q.ans * 0.001
    setSt(ok ? 'good' : 'bad')
    onAnswer({ ok, grade: ok ? 3 : 1, msg: q.expl, answer: ok ? undefined : <b>{fmt(q.ans)} {q.unit}</b> })
  }
  return (
    <div>
      <h2 className="q">{q.text}</h2>
      {q.kind === 'size' ? (
        <div className="card">
          <SizeRuler um={um} lo={done ? q.lo : undefined} hi={done ? q.hi : undefined} />
          <input type="range" min={0} max={100} step={0.5} value={pos} onChange={e => setPos(Number(e.target.value))} className="slider" disabled={done} style={{ marginTop: 18 }} />
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}><span className="cap">10 nm</span><span className="hl num">{fmtUm(um)}</span><span className="cap">1 mm</span></div>
        </div>
      ) : (
        <div className="row">
          <input ref={ref} className={`field ${st}`} inputMode="decimal" value={v} onChange={e => setV(e.target.value)} placeholder="Odgovor" onKeyDown={e => { if (e.key === 'Enter') submit() }} disabled={done} />
          <span className="t3" style={{ minWidth: 34 }}>{q.unit}</span>
        </div>
      )}
      {!done && <CheckBtn disabled={q.kind !== 'size' && !v.trim()} onClick={submit} />}
    </div>
  )
}

export function fmtUm(um: number) {
  if (um < 1) return `${fmt(Math.round(um * 1000))} nm`
  if (um >= 1000) return `${fmt(um / 1000)} mm`
  return `${fmt(um < 10 ? Math.round(um * 10) / 10 : Math.round(um))} µm`
}

function SizeRuler({ um, lo, hi }: { um: number; lo?: number; hi?: number }) {
  const x = (u: number) => ((Math.log10(u) + 2) / 5) * 100
  const marks = [0.01, 0.1, 1, 10, 100, 1000]
  const r = Math.max(4, Math.min(60, 8 + (Math.log10(um) + 2) * 10))
  return (
    <svg viewBox="0 0 100 40" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <line x1={0} x2={100} y1={30} y2={30} stroke="var(--line-2)" strokeWidth={0.6} />
      {marks.map(m => <g key={m}><line x1={x(m)} x2={x(m)} y1={27} y2={33} stroke="var(--ink-3)" strokeWidth={0.5} /><text x={x(m)} y={39} fontSize={3.2} textAnchor="middle" fill="var(--ink-3)">{fmtUm(m)}</text></g>)}
      {lo && hi && <rect x={x(lo)} width={x(hi) - x(lo)} y={26} height={8} rx={2} fill="var(--accent)" opacity={0.25} />}
      <motion.circle cx={x(um)} cy={30} r={1.8} fill="var(--ink)" />
      <motion.g animate={{ x: x(um) }} transition={{ type: 'spring', bounce: 0, duration: 0.2 }}>
        <circle cx={0} cy={13} r={r / 6} fill="var(--o-mito-f)" stroke="var(--o-mito)" strokeWidth={0.5} />
      </motion.g>
    </svg>
  )
}
