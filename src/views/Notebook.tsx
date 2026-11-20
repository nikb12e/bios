import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search, X, Dumbbell, Box, Play, ChevronDown, CheckCircle2, Eye, Trash2, BookOpen } from 'lucide-react'
import type { Nav } from '../App'
import { useStore, clearFixedMisses } from '../engine/store'
import { allTasks, type Item } from '../engine/gen'
import { level } from '../engine/fsrs'
import { CONCEPTS, CON, TOP, type Concept } from '../data/concepts'
import { ORG, ORGANELLES, type OrgId } from '../data/organelles'
import type { Task } from '../data/bank'
import { PROCS } from '../art/procs'
import { Sheet, Seg, TOPIC_LOOK } from '../ui/kit'

/* ───────── besedilo naloge za pregled ───────── */

const CELL = { animal: 'živalski celici', plant: 'rastlinski celici', prok: 'bakteriji' } as Record<string, string>
export function taskPrompt(t: Task): string {
  switch (t.t) {
    case 'mc': case 'type': case 'odd': case 'match': case 'sort': case 'order': case 'explain': return t.q
    case 'tf': return `Drži ali ne drži: ${t.s}`
    case 'cloze': return t.text.replace(/\{[^}]+\}/g, '___')
    case 'fix': return `Popravi napako: ${t.text.replace(/\[([^|\]]+)\|[^\]]+\]/g, '$1')}`
    case 'locate': return `Pokaži ${ORG[t.target].name.toLowerCase()} na ${CELL[t.cell] ?? 'celici'}.`
    case 'identify': return `Kateri del je označen na ${CELL[t.cell] ?? 'celici'}?`
    case 'labels': return 'Označi dele na shemi.'
    case 'table': return 'Primerjalna tabela celic.'
    case 'scale': return t.kind === 'units' ? 'Pretvarjanje enot za velikost.' : 'Velikosti celic in povečava.'
    case 'recall': return t.front
  }
}
export function taskAnswer(t: Task): string | null {
  switch (t.t) {
    case 'mc': return t.opts[t.a]
    case 'tf': return t.a ? 'Drži.' : `Ne drži.${t.fix ? ' ' + t.fix.opts[t.fix.a] : ''}`
    case 'type': return t.a[0]
    case 'odd': return `${t.items[t.a]}. ${t.why}`
    case 'cloze': return (t.text.match(/\{([^}]+)\}/g) ?? []).map(x => x.slice(1, -1)).join(', ')
    case 'fix': return (t.text.match(/\[[^|\]]+\|([^\]]+)\]/g) ?? []).map(x => x.replace(/\[[^|\]]+\|([^\]]+)\]/, '$1')).join(', ')
    case 'order': return t.items.join(' → ')
    case 'match': return t.pairs.map(p => `${p[0]}: ${p[1]}`).join(' · ')
    case 'locate': case 'identify': return ORG[t.target].name
    case 'recall': return t.back
    case 'explain': return t.kp.join(', ')
    default: return null
  }
}
const fmtAgo = (t: number) => {
  const d = Math.floor((Date.now() - t) / 86400000)
  if (d <= 0) return 'danes'
  if (d === 1) return 'včeraj'
  if (d < 7) return `pred ${d} dnevi`
  return new Date(t).toLocaleDateString('sl-SI', { day: 'numeric', month: 'numeric' })
}

/* ───────── Zvezek napak ───────── */

export function MissBook({ open, onClose, nav }: { open: boolean; onClose: () => void; nav: Nav }) {
  const misses = useStore(s => s.misses ?? {})
  const aiN = useStore(s => s.ai.length)
  const [view, setView] = useState<'odprte' | 'popravljene'>('odprte')
  const [shown, setShown] = useState<Set<string>>(new Set())
  const byId = useMemo(() => new Map(allTasks().map(t => [t.id, t])), [aiN]) // eslint-disable-line react-hooks/exhaustive-deps
  const rows = Object.entries(misses)
    .map(([id, m]) => ({ id, m, t: byId.get(id) }))
    .filter((r): r is { id: string; m: typeof r.m; t: Task } => !!r.t)
  const openRows = rows.filter(r => !r.m.fixed).sort((a, b) => b.m.n - a.m.n || b.m.at - a.m.at)
  const fixedRows = rows.filter(r => r.m.fixed).sort((a, b) => (b.m.fixed ?? 0) - (a.m.fixed ?? 0))
  const list = view === 'odprte' ? openRows : fixedRows

  const practice = () => {
    const pick = openRows.slice(0, 15)
    const items: Item[] = pick.map(r => ({ kind: 'task', task: r.t, key: 'm:' + r.id, label: 'Iz zvezka napak' }))
    onClose()
    nav.start({ mode: 'review', size: items.length }, 'Zvezek napak', items)
  }

  return (
    <Sheet open={open} onClose={onClose} title={<span className="t3">Zvezek napak</span>}>
      <p className="sub" style={{ margin: '0 4px 12px' }}>Vsaka napačno rešena naloga pride sem. Ko jo pozneje rešiš pravilno, se premakne med popravljene.</p>
      <div style={{ marginBottom: 12 }}>
        <Seg value={view} onChange={setView} options={[{ v: 'odprte', label: `Odprte ${openRows.length}` }, { v: 'popravljene', label: `Popravljene ${fixedRows.length}` }]} />
      </div>
      {view === 'odprte' && openRows.length > 0 && (
        <button className="btn accent full" style={{ marginBottom: 14 }} onClick={practice}><Dumbbell size={18} /> Vadi napake ({Math.min(15, openRows.length)})</button>
      )}
      {view === 'popravljene' && fixedRows.length > 0 && (
        <button className="btn ghost full" style={{ marginBottom: 14 }} onClick={clearFixedMisses}><Trash2 size={17} /> Počisti popravljene</button>
      )}
      {list.length === 0 ? (
        <div className="empty-note">
          <CheckCircle2 size={30} />
          <div className="hl">{view === 'odprte' ? 'Ni odprtih napak' : 'Še nič popravljenega'}</div>
          <div className="cap">{view === 'odprte' ? 'Napačni odgovori iz vaj, preizkusov in hitrih preverjanj v snovi se zbirajo tukaj.' : 'Ko napako popraviš, jo najdeš tukaj.'}</div>
        </div>
      ) : (
        <div className="miss-list">
          {list.map(r => {
            const c = CON[r.t.c[0]]
            const ans = taskAnswer(r.t)
            const on = shown.has(r.id)
            return (
              <div key={r.id} className={`miss ${r.m.fixed ? 'fixed' : ''}`}>
                <div className="mk">
                  {c && <span className={`mchip t-${TOPIC_LOOK[c.topic].tone}`}>{c.label}</span>}
                  <span className="cap">{r.m.fixed ? `popravljeno ${fmtAgo(r.m.fixed)}` : `${r.m.n}× napačno · ${fmtAgo(r.m.at)}`}</span>
                </div>
                <div className="mq">{taskPrompt(r.t)}</div>
                {ans && (on
                  ? <motion.div className="ma" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}><b>Pravilno:</b> {ans}</motion.div>
                  : <button className="mshow" onClick={() => setShown(s => new Set(s).add(r.id))}><Eye size={15} /> Pokaži odgovor</button>)}
              </div>
            )
          })}
        </div>
      )}
    </Sheet>
  )
}

/* ───────── Slovar pojmov ───────── */

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
interface Entry { key: string; label: string; text: string; c?: Concept; org?: OrgId; aliases: string[]; topic?: string }

function entries(): Entry[] {
  const out: Entry[] = CONCEPTS.map(c => ({ key: c.id, label: c.label, text: c.text, c, org: c.org, aliases: c.org ? ORG[c.org].aliases ?? [] : [], topic: c.topic }))
  // organeli, ki nimajo pojma z istim imenom
  const have = new Set(out.map(e => norm(e.label)))
  ORGANELLES.forEach(o => {
    if (have.has(norm(o.name))) return
    out.push({ key: 'org:' + o.id, label: o.name, text: o.vloga, org: o.id, aliases: o.aliases ?? [], c: o.concepts[0] ? CON[o.concepts[0]] : undefined, topic: o.concepts[0] ? CON[o.concepts[0]]?.topic : undefined })
  })
  return out.sort((a, b) => a.label.localeCompare(b.label, 'sl'))
}

export function Glossary({ open, onClose, nav }: { open: boolean; onClose: () => void; nav: Nav }) {
  const [q, setQ] = useState('')
  const [exp, setExp] = useState<string | null>(null)
  const mem = useStore(s => s.mem)
  const all = useMemo(entries, [])
  const nq = norm(q.trim())
  const list = !nq ? all : all
    .map(e => {
      const l = norm(e.label), al = e.aliases.map(norm), tx = norm(e.text)
      const score = l.startsWith(nq) ? 0 : l.includes(nq) || al.some(a => a.includes(nq)) ? 1 : tx.includes(nq) ? 2 : 9
      return { e, score }
    })
    .filter(x => x.score < 9)
    .sort((a, b) => a.score - b.score || a.e.label.localeCompare(b.e.label, 'sl'))
    .map(x => x.e)

  // skupine po začetnici, ko ni iskanja
  const groups: [string, Entry[]][] = []
  list.forEach(e => {
    const L = nq ? '' : e.label[0].toUpperCase()
    const g = groups[groups.length - 1]
    if (g && g[0] === L) g[1].push(e)
    else groups.push([L, [e]])
  })

  return (
    <Sheet open={open} onClose={onClose} title={<span className="t3">Slovar pojmov</span>}>
      <div className="gl-search">
        <Search size={18} />
        <input type="search" placeholder="Išči pojem, organel ali besedo" value={q} onChange={e => setQ(e.target.value)} aria-label="Išči po slovarju" />
        {q && <button onClick={() => setQ('')} aria-label="Počisti"><X size={16} /></button>}
      </div>
      <div className="cap" style={{ margin: '0 6px 10px' }}>{nq ? `${list.length} ${list.length === 1 ? 'zadetek' : list.length === 2 ? 'zadetka' : list.length < 5 ? 'zadetki' : 'zadetkov'}` : `${all.length} pojmov iz zapiskov Celica`}</div>
      {list.length === 0 && <div className="empty-note"><BookOpen size={28} /><div className="hl">Ni zadetkov</div><div className="cap">Poskusi z drugo besedo, npr. »membrana« ali »ATP«.</div></div>}
      {groups.map(([L, es]) => (
        <section key={L || 'r'}>
          {L && <div className="gl-l">{L}</div>}
          <div className="gl-list">
            {es.map(e => {
              const on = exp === e.key
              const lv = e.c ? level(mem[e.c.id]) : null
              const proc = e.org ? PROCS.find(p => p.org === e.org) : undefined
              return (
                <div key={e.key} className={`gl ${on ? 'on' : ''}`}>
                  <button className="gl-h" onClick={() => setExp(on ? null : e.key)} aria-expanded={on}>
                    <span className="grow" style={{ minWidth: 0 }}>
                      <span className="gl-t">{e.label}</span>
                      {!on && <span className="gl-s">{e.text}</span>}
                    </span>
                    {lv && lv !== 'nov' && <span className={`gl-lv lv-${lv}`} title={lv} />}
                    <ChevronDown size={18} className="chev" style={{ transform: on ? 'rotate(180deg)' : undefined, transition: 'transform .3s' }} />
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div className="gl-b" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.34 }}>
                        <p>{e.text}</p>
                        {e.c?.kp && <ul>{e.c.kp.map(k => <li key={k}>{k}</li>)}</ul>}
                        <div className="cap" style={{ marginTop: 6 }}>{e.topic ? TOP[e.topic as keyof typeof TOP]?.title : ''}{e.c ? ` · str. ${e.c.page}` : ''}</div>
                        <div className="gl-a">
                          {e.c && <button className="btn ghost" onClick={() => { onClose(); nav.start({ mode: 'smart', concepts: [e.c!.id], size: 6 }, e.label) }}><Dumbbell size={16} /> Vadi</button>}
                          {e.org && e.org !== 'citoplazma' && <button className="btn ghost" onClick={() => { onClose(); nav.cell(e.org!) }}><Box size={16} /> V celici</button>}
                          {proc && <button className="btn ghost" onClick={() => { onClose(); nav.process(proc.id) }}><Play size={15} /> Animacija</button>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </Sheet>
  )
}
