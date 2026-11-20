import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Check, X, RotateCw } from 'lucide-react'
import type { Task } from '../data/bank'
import { ORG } from '../data/organelles'
import { DetailView } from '../art/Details'
import { matchAnswer } from '../engine/gen'
import { CheckBtn, useShuffled, type TaskProps } from './shared'
import { useAutoFocus } from '../ui/kit'

type T<K extends Task['t']> = Extract<Task, { t: K }>

function OrgVisual({ org }: { org?: string }) {
  const o = org ? ORG[org as keyof typeof ORG] : undefined
  if (!o?.detail || ['vakuola', 'centrioli', 'lizosom'].includes(o.detail)) return null
  return (
    <div className="stage" style={{ padding: 6, marginBottom: 16, maxWidth: 420 }}>
      <DetailView id={o.detail} mode="clean" />
    </div>
  )
}

export function MCTask({ task, done, onAnswer }: TaskProps<T<'mc'>>) {
  const order = useShuffled(task.opts.map((_, i) => i), task.id)
  const [pick, setPick] = useState<number | null>(null)
  const choose = (i: number) => {
    if (done || pick !== null) return
    setPick(i)
    const ok = i === task.a
    onAnswer({ ok, grade: ok ? 3 : 1, msg: task.why, answer: ok ? undefined : task.opts[task.a] })
  }
  return (
    <div>
      <OrgVisual org={task.org} />
      <h2 className="q">{task.q}</h2>
      <div className="opts">
        {order.map((i, k) => {
          let cls = 'opt'
          if (pick !== null) {
            if (i === task.a) cls += ' good'
            else if (i === pick) cls += ' bad'
            else cls += ' dim'
          }
          return (
            <motion.button key={i} className={cls} onClick={() => choose(i)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.04 }}>
              <span className="k">{'ABCD'[k]}</span><span className="grow">{task.opts[i]}</span>
              {pick !== null && i === task.a && <Check size={20} color="var(--accent)" />}
              {pick === i && i !== task.a && <X size={20} color="var(--bad)" />}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export function TFTask({ task, done, onAnswer }: TaskProps<T<'tf'>>) {
  const [first, setFirst] = useState<boolean | null>(null)
  const [fixPick, setFixPick] = useState<number | null>(null)
  const fixOrder = useShuffled(task.fix ? task.fix.opts.map((_, i) => i) : [], task.id + 'f')
  const answer = (v: boolean) => {
    if (done || first !== null) return
    setFirst(v)
    const right = v === task.a
    if (!right) {
      onAnswer({ ok: false, grade: 1, msg: task.why ?? (task.fix ? `Pravilno: ${task.fix.opts[task.fix.a]}.` : undefined), answer: task.a ? 'Trditev drži.' : 'Trditev ne drži.' })
    } else if (task.a || !task.fix) {
      onAnswer({ ok: true, grade: 3, msg: task.why })
    }
  }
  const fix = (i: number) => {
    if (!task.fix || fixPick !== null) return
    setFixPick(i)
    const ok = i === task.fix.a
    onAnswer({ ok: true, grade: ok ? 3 : 2, title: ok ? 'Odlično, tudi popravek je pravilen' : 'Prepoznal si napako, popravek pa ni pravi', msg: ok ? task.why : undefined, answer: ok ? undefined : task.fix.opts[task.fix.a] })
  }
  const needFix = first === false && task.a === false && !!task.fix
  return (
    <div>
      <OrgVisual org={task.org} />
      <div className="card" style={{ padding: '22px 20px', marginBottom: 16 }}>
        <div className="over" style={{ marginBottom: 8 }}>Trditev</div>
        <div style={{ fontSize: 21, lineHeight: 1.32, fontWeight: 650, letterSpacing: '-0.016em' }}>{task.s}</div>
      </div>
      <div className="grid2">
        {[true, false].map(v => {
          let cls = 'opt'
          if (first !== null) cls += v === task.a ? ' good' : v === first ? ' bad' : ' dim'
          return <button key={String(v)} className={cls} style={{ justifyContent: 'center', fontWeight: 700, fontSize: 17 }} onClick={() => answer(v)}>{v ? 'Drži' : 'Ne drži'}</button>
        })}
      </div>
      {needFix && task.fix && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 22 }}>
          <div className="hl" style={{ margin: '0 2px 10px' }}>{task.fix.q}</div>
          <div className="opts">
            {fixOrder.map(i => {
              let cls = 'opt'
              if (fixPick !== null) cls += i === task.fix!.a ? ' good' : i === fixPick ? ' bad' : ' dim'
              return <button key={i} className={cls} onClick={() => fix(i)}>{task.fix!.opts[i]}</button>
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export function OddTask({ task, done, onAnswer }: TaskProps<T<'odd'>>) {
  const order = useShuffled(task.items.map((_, i) => i), task.id)
  const [pick, setPick] = useState<number | null>(null)
  const choose = (i: number) => {
    if (done || pick !== null) return
    setPick(i)
    const ok = i === task.a
    onAnswer({ ok, grade: ok ? 3 : 1, msg: task.why, answer: ok ? undefined : task.items[task.a] })
  }
  return (
    <div>
      <h2 className="q">{task.q}</h2>
      <div className="grid2">
        {order.map(i => {
          let cls = 'opt'
          if (pick !== null) cls += i === task.a ? ' good' : i === pick ? ' bad' : ' dim'
          return <button key={i} className={cls} style={{ minHeight: 92, justifyContent: 'center', textAlign: 'center', fontWeight: 650 }} onClick={() => choose(i)}>{task.items[i]}</button>
        })}
      </div>
    </div>
  )
}

export function FixTask({ task, done, onAnswer }: TaskProps<T<'fix'>>) {
  // besedilo z [narobe|prav]
  const parts = useMemo(() => {
    const m = task.text.match(/^(.*)\[([^|\]]+)\|([^\]]+)\](.*)$/)!
    return { pre: m[1], wrong: m[2], right: m[3], post: m[4] }
  }, [task.text])
  const words = useMemo(() => {
    const w: { t: string; target: boolean }[] = []
    parts.pre.split(/(\s+)/).filter(Boolean).forEach(t => w.push({ t, target: false }))
    w.push({ t: parts.wrong, target: true })
    parts.post.split(/(\s+)/).filter(Boolean).forEach(t => w.push({ t, target: false }))
    return w
  }, [parts])
  const [tapped, setTapped] = useState<number | null>(null)
  const [stage, setStage] = useState<'find' | 'replace' | 'end'>('find')
  const [rep, setRep] = useState<string | null>(null)
  const opts = useShuffled(task.opts, task.id)
  const tap = (i: number) => {
    if (done || stage !== 'find' || /^\s+$/.test(words[i].t)) return
    setTapped(i)
    if (words[i].target) setStage('replace')
    else {
      setStage('end')
      onAnswer({ ok: false, grade: 1, msg: task.why, answer: <>Napačna beseda je <b>{parts.wrong}</b>, pravilno: <b>{parts.right}</b>.</> })
    }
  }
  const replace = (o: string) => {
    if (rep) return
    setRep(o)
    setStage('end')
    const ok = o === parts.right
    onAnswer({ ok, grade: ok ? 3 : 2, title: ok ? undefined : 'Napako si našel, zamenjava ni prava', msg: task.why, answer: ok ? undefined : <>Pravilno: <b>{parts.right}</b>.</> })
  }
  return (
    <div>
      <h2 className="q sm">Tapni besedo, ki je napačna.</h2>
      <div className="card" style={{ fontSize: 20, lineHeight: 1.7, fontWeight: 500, padding: '20px 18px' }}>
        {words.map((w, i) => /^\s+$/.test(w.t) ? <span key={i}>{w.t}</span> : (
          <span key={i} className={`word ${tapped === i ? (w.target ? 'good' : 'bad') : ''} ${stage === 'end' && w.target && tapped !== i ? 'sel' : ''}`} onClick={() => tap(i)}>
            {w.target && rep ? rep : w.t}
          </span>
        ))}
      </div>
      {stage === 'replace' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20 }}>
          <div className="hl" style={{ margin: '0 2px 10px' }}>S čim jo zamenjaš?</div>
          <div className="wrapchips">{opts.map(o => <button key={o} className="tok" onClick={() => replace(o)}>{o}</button>)}</div>
        </motion.div>
      )}
    </div>
  )
}

export function TypeTask({ task, done, onAnswer }: TaskProps<T<'type'>>) {
  const [v, setV] = useState('')
  const [st, setSt] = useState<'' | 'good' | 'bad'>('')
  const ref = useAutoFocus<HTMLInputElement>(!done)
  const submit = () => {
    if (done || !v.trim()) return
    const m = matchAnswer(v, task.a)
    setSt(m === 'no' ? 'bad' : 'good')
    if (m === 'exact') onAnswer({ ok: true, grade: 3, msg: task.why })
    else if (m === 'typo') onAnswer({ ok: true, grade: 2, title: 'Pravilno, pazi na zapis', answer: <>Pravilen zapis: <b>{task.a[0]}</b></>, msg: task.why })
    else onAnswer({ ok: false, grade: 1, answer: <b>{task.a[0]}</b>, msg: task.why })
  }
  return (
    <div>
      <div className="over" style={{ margin: '0 2px 8px' }}>Opis</div>
      <h2 className="q">{task.q}</h2>
      <input ref={ref} className={`field ${st}`} value={v} onChange={e => setV(e.target.value)} placeholder="Strokovni izraz" autoCapitalize="off" autoCorrect="off" spellCheck={false}
        onKeyDown={e => { if (e.key === 'Enter') submit() }} disabled={done} enterKeyHint="done" />
      {!done && <CheckBtn disabled={!v.trim()} onClick={submit} />}
    </div>
  )
}

export function RecallTask({ task, done, onAnswer }: TaskProps<T<'recall'>>) {
  const [flip, setFlip] = useState(false)
  const rate = (g: 1 | 2 | 3 | 4) => onAnswer({ ok: g >= 2, grade: g, title: g >= 3 ? 'Zabeleženo' : g === 2 ? 'Bo prišlo kmalu spet' : 'Ponovil boš kmalu', msg: undefined })
  return (
    <div>
      <h2 className="q sm">Najprej se spomni sam, nato obrni kartico.</h2>
      <div className="flip" onClick={() => !done && setFlip(true)}>
        <div className={`flip-in ${flip ? 'on' : ''}`}>
          <div className="flip-f" style={{ alignItems: 'center', textAlign: 'center' }}>
            <div className="t1">{task.front}</div>
            <div className="fn" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}><RotateCw size={15} /> Tapni za odgovor</div>
          </div>
          <div className="flip-b">
            <div className="over" style={{ marginBottom: 8 }}>{task.front}</div>
            <div style={{ fontSize: 18, lineHeight: 1.45, fontWeight: 500 }}>{task.back}</div>
          </div>
        </div>
      </div>
      {flip && !done && (
        <div className="grid2" style={{ marginTop: 16, gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {([[1, 'Nisem vedel'], [2, 'Težko'], [3, 'Vedel'], [4, 'Z lahkoto']] as const).map(([g, l]) => (
            <button key={g} className="opt" style={{ justifyContent: 'center', textAlign: 'center', fontSize: 14, padding: 10, minHeight: 64, fontWeight: 650, color: g === 1 ? 'var(--bad)' : g === 4 ? 'var(--accent-ink)' : undefined }} onClick={() => rate(g)}>{l}</button>
          ))}
        </div>
      )}
    </div>
  )
}
