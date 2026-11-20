import { BANK, TYPE_INFO, type Task, type TaskType } from '../data/bank'
import { CONCEPTS, CON, type TopicId } from '../data/concepts'
import { ORGANELLES, ORG, ON_ANIMAL, ON_PLANT, type DetailId, type OrgId } from '../data/organelles'
import { level, retrievability, type Mem } from './fsrs'
import { get } from './store'

/* ───────── generated tasks ───────── */

const orgConcept = (id: OrgId) => ORG[id].concepts[0]

const LABEL_CONCEPTS: Partial<Record<DetailId, string[]>> = {
  mitohondrij: ['mito.zgradba'], kloroplast: ['kloro.zgradba'], jedro: ['jedro.ovoj', 'jedrce'], er: ['er.zgradba'],
  golgi: ['golgi.vloga'], membrana: ['mozaik.zgradba'], citoskelet: ['citoskelet.zgradba'], ribosom: ['ribosomi.zgradba'],
  prokariont: ['pe.organeli', 'pe.dedni'], svetlobni: ['svm.deli'], tem: ['mikro.tem.deli'], migetalke: ['migetalke'], stena: ['stena'],
}

function generated(): Task[] {
  const out: Task[] = []
  const skip: OrgId[] = ['citoplazma']
  ON_ANIMAL.filter(o => !skip.includes(o)).forEach(o => {
    out.push({ t: 'locate', id: `loc:a:${o}`, c: [orgConcept(o)], cell: 'animal', target: o })
    out.push({ t: 'identify', id: `idc:a:${o}`, c: [orgConcept(o)], cell: 'animal', target: o, mode: 'choose' })
    out.push({ t: 'identify', id: `idt:a:${o}`, c: [orgConcept(o)], cell: 'animal', target: o, mode: 'type' })
  })
  ON_PLANT.filter(o => !skip.includes(o) && !ON_ANIMAL.includes(o) || ['vakuola', 'jedro', 'golgi'].includes(o)).forEach(o => {
    out.push({ t: 'locate', id: `loc:p:${o}`, c: [orgConcept(o)], cell: 'plant', target: o })
    out.push({ t: 'identify', id: `idc:p:${o}`, c: [orgConcept(o)], cell: 'plant', target: o, mode: 'choose' })
  })
  ;(Object.keys(LABEL_CONCEPTS) as DetailId[]).forEach(d => out.push({ t: 'labels', id: `lab:${d}`, c: LABEL_CONCEPTS[d]!, diagram: d }))

  // match an organelle with its role: fixed sets so the coverage is even
  const roleOf: [OrgId, string, string][] = [
    ['ribosomi', 'protein synthesis', 'ribosomi.vloga'], ['mitohondrij', 'cellular respiration, ATP', 'mito.vloga'], ['lizosom', 'cellular digestion', 'lizosom'],
    ['golgi', 'prepares products for secretion', 'golgi.vloga'], ['jedrce', 'making ribosome subunits', 'jedrce'], ['kloroplast', 'photosynthesis', 'plastidi.def'],
    ['gladkiER', 'lipids, breakdown of toxins', 'er.gladki'], ['zrnatiER', 'proteins for secretion', 'er.zrnati'], ['centrioli', 'cell division', 'centrioli'],
    ['stena', 'strength, protection against turgor changes', 'stena'], ['membrana', 'controls what passes in and out', 'membrana.vloga'], ['citoskelet', 'cell shape and movement', 'citoskelet.vloga'],
    ['vakuola', 'water, pigments, support (plants)', 'vakuola.rastl'], ['skrobna', 'storing starch', 'skrobna'], ['migetalke', 'moving the cell', 'migetalke'],
  ]
  const sets = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 0], [1, 6, 9, 4], [3, 7, 10, 13], [2, 5, 8, 11]]
  sets.forEach((ix, i) => {
    const rows = ix.map(k => roleOf[k])
    out.push({ t: 'match', id: `mat:${i}`, c: rows.map(r => r[2]), q: 'Match the organelle with its role.', pairs: rows.map(r => [ORG[r[0]].name, r[1]] as [string, string]) })
  })

  CONCEPTS.filter(c => c.q && c.kp).forEach(c => out.push({ t: 'explain', id: `exp:${c.id}`, c: [c.id], q: c.q!, kp: c.kp!, ref: c.text }))

  const recall: [string, string, string][] = [
    ['1595', 'Zaharias Janssen: the first compound microscope with more than one lens.', 'mejnik.janssen'],
    ['1632 to 1723', 'Antoni van Leeuwenhoek: about 500 single lens microscopes; discovered bacteria, red blood cells, sperm cells, protozoa.', 'mejnik.leeuwenhoek'],
    ['1665 · Micrographia', 'Robert Hooke: the term cell for structures in cork.', 'mejnik.hooke'],
    ['1838/39', 'Schleiden (botanist) and Schwann (zoologist): cell theory, the cell is the basic unit of living things.', 'mejnik.schleiden'],
    ['1855', 'Rudolph Virchow: new cells only arise by division of existing cells.', 'mejnik.virchow'],
    ['1880', 'August Weismann: all present cells descend from cells of the distant past; link to evolution.', 'mejnik.weismann'],
    ['1938', 'Ernst Ruska: transmission electron microscope (TEM). At about the same time von Ardenne: scanning (SEM).', 'mikro.tem'],
  ]
  recall.forEach(([f, b, c], i) => out.push({ t: 'recall', id: `rec:${i}`, c: [c], front: f, back: b }))
  ORGANELLES.filter(o => o.id !== 'citoplazma').forEach(o => out.push({ t: 'recall', id: `reco:${o.id}`, c: [orgConcept(o.id)], front: o.name, back: o.vloga }))

  out.push({ t: 'table', id: 'tab:pe', c: ['pe.dedni', 'pe.delitev', 'pe.organeli', 'pe.velikost', 'pe.jedro'] })
  out.push({ t: 'scale', id: 'sc:zoom', c: ['svm.povecava'], kind: 'zoom' })
  out.push({ t: 'scale', id: 'sc:units', c: ['svm.enote'], kind: 'units' })
  out.push({ t: 'scale', id: 'sc:size', c: ['pe.velikost'], kind: 'size' })
  return out
}

const GEN = generated()
export const ALL: Task[] = [...BANK, ...GEN]

export const allTasks = () => [...ALL, ...get().ai]
export const taskById = (id: string) => allTasks().find(t => t.id === id)
export const topicOf = (t: Task): TopicId => CON[t.c[0]]?.topic ?? 'organeli'

/* ───────── choosing tasks (session) ───────── */

export type Item =
  | { kind: 'task'; task: Task; key: string; retry?: boolean; label?: string }
  | { kind: 'learn'; concept: string; key: string }

export interface SessionOpts {
  topic?: TopicId
  concepts?: string[]
  type?: TaskType
  size?: number
  mode: 'smart' | 'review' | 'weak' | 'type' | 'test' | 'org'
  org?: OrgId
}

const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]
export function shuffle<T>(a: T[]): T[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] }
  return b
}

function tiersFor(m?: Mem): (1 | 2 | 3)[] {
  const lv = level(m)
  if (lv === 'nov') return [1]
  if (lv === 'ucim') return [1, 2]
  if (lv === 'utrjujem') return [2, 3, 1]
  return [3, 2]
}

function pickTaskFor(concept: string, used: Set<string>, opts: SessionOpts, tierBias = 0): Task | undefined {
  const s = get()
  const m = s.mem[concept]
  let tiers = tiersFor(m)
  if (tierBias > 0) tiers = [Math.min(3, tiers[0] + 1) as 1 | 2 | 3, ...tiers]
  if (tierBias < 0) tiers = [1, ...tiers]
  const cands = allTasks().filter(t => t.c.includes(concept) && !used.has(t.id) && (!opts.type || t.t === opts.type) && (s.settings.ai || t.t !== 'explain'))
  if (!cands.length) return undefined
  const now = Date.now()
  for (const tier of tiers) {
    const inTier = cands.filter(t => TYPE_INFO[t.t].tier === tier)
    if (!inTier.length) continue
    // first the tasks not seen yet or not seen for a long time
    const scored = inTier.map(t => ({ t, w: (s.seenTask[t.id] ? Math.min(1, (now - s.seenTask[t.id]) / (3 * 86400000)) : 1.4) + Math.random() * 0.6 + (t.t === 'explain' && tier === 3 ? 0.2 : 0) }))
    scored.sort((a, b) => b.w - a.w)
    return scored[0].t
  }
  return rnd(cands)
}

export function buildSession(opts: SessionOpts): Item[] {
  const s = get()
  const now = Date.now()
  const size = opts.size ?? 14
  let pool = CONCEPTS.filter(c => (!opts.topic || c.topic === opts.topic) && (!opts.concepts || opts.concepts.includes(c.id)))
  if (opts.org) pool = pool.filter(c => c.org === opts.org || ORG[opts.org!].concepts.includes(c.id))
  if (opts.type) {
    const withType = new Set(allTasks().filter(t => t.t === opts.type).flatMap(t => t.c))
    pool = pool.filter(c => withType.has(c.id))
  }
  const used = new Set<string>()
  const items: Item[] = []

  if (opts.mode === 'test') {
    // test: mixed tasks of levels 2 and 3 (and a little of 1), no introductions
    const tasks = shuffle(allTasks().filter(t => (!opts.topic || topicOf(t) === opts.topic) && t.t !== 'recall' && t.t !== 'explain'))
    const want: TaskType[] = ['mc', 'tf', 'cloze', 'type', 'fix', 'odd', 'labels', 'sort', 'order', 'locate', 'identify', 'match', 'mc', 'type', 'cloze', 'tf', 'labels', 'fix']
    for (const ty of want) {
      if (items.length >= size) break
      const t = tasks.find(x => x.t === ty && !used.has(x.id) && !(x.t === 'identify' && x.mode === 'choose'))
      if (t) { used.add(t.id); items.push({ kind: 'task', task: t, key: t.id }) }
    }
    if (s.settings.ai) {
      const ex = shuffle(allTasks().filter(t => t.t === 'explain' && (!opts.topic || topicOf(t) === opts.topic))).slice(0, 2)
      ex.forEach(t => items.push({ kind: 'task', task: t, key: t.id }))
    }
    return items
  }

  const due = pool.filter(c => s.mem[c.id]?.reps && (s.mem[c.id].due <= now || opts.mode === 'review')).sort((a, b) => retrievability(s.mem[a.id], now) - retrievability(s.mem[b.id], now))
  const weak = pool.filter(c => {
    const h = s.mem[c.id]?.hist ?? []
    return h.length >= 2 && h.slice(-4).filter(x => !x).length >= 1
  }).sort((a, b) => (s.mem[a.id].hist.slice(-4).reduce((x, y) => x + y, 0)) - (s.mem[b.id].hist.slice(-4).reduce((x, y) => x + y, 0)))
  const unseen = pool.filter(c => !s.mem[c.id]?.reps)
  const learning = pool.filter(c => s.mem[c.id]?.reps && !due.includes(c))

  let targets: string[] = []
  if (opts.mode === 'weak') targets = [...weak, ...due].map(c => c.id)
  else if (opts.mode === 'review') targets = due.map(c => c.id)
  else {
    const nNew = opts.mode === 'type' || opts.mode === 'org' ? 99 : s.settings.newPerSession
    targets = [...due.slice(0, 9).map(c => c.id), ...unseen.slice(0, nNew).map(c => c.id), ...weak.slice(0, 3).map(c => c.id), ...shuffle(learning).map(c => c.id)]
  }
  targets = targets.filter((x, i) => targets.indexOf(x) === i)
  if (!targets.length) targets = shuffle(pool).map(c => c.id)

  for (const c of targets) {
    if (items.filter(i => i.kind === 'task').length >= size) break
    const isNew = !s.mem[c]?.reps
    if (isNew && opts.mode !== 'type' && !s.learned[c]) items.push({ kind: 'learn', concept: c, key: 'learn:' + c })
    const t = pickTaskFor(c, used, opts)
    if (!t) continue
    used.add(t.id)
    items.push({ kind: 'task', task: t, key: t.id })
  }
  // if there are too few tasks (e.g. all already seen), top up with tasks from the pool
  if (items.filter(i => i.kind === 'task').length < Math.min(size, 6)) {
    const extra = shuffle(allTasks().filter(t => !used.has(t.id) && t.c.some(c => pool.some(p => p.id === c)) && (!opts.type || t.t === opts.type) && (s.settings.ai || t.t !== 'explain')))
    for (const t of extra) { if (items.filter(i => i.kind === 'task').length >= size) break; used.add(t.id); items.push({ kind: 'task', task: t, key: t.id }) }
  }
  return interleave(items)
}

// the introduction of a concept stays right before its first task; tasks of the same type do not come three times in a row
function interleave(items: Item[]): Item[] {
  const blocks: Item[][] = []
  for (const it of items) {
    if (it.kind === 'learn') blocks.push([it])
    else if (blocks.length && blocks[blocks.length - 1].length === 1 && blocks[blocks.length - 1][0].kind === 'learn') blocks[blocks.length - 1].push(it)
    else blocks.push([it])
  }
  const out: Item[] = []
  const rest = [...blocks]
  while (rest.length) {
    const lastTypes = out.filter(i => i.kind === 'task').slice(-2).map(i => (i as { task: Task }).task.t)
    let k = rest.findIndex(b => { const t = b.find(i => i.kind === 'task') as { task: Task } | undefined; return !t || !(lastTypes.length === 2 && lastTypes.every(x => x === t.task.t)) })
    if (k < 0) k = 0
    out.push(...rest.splice(k, 1)[0])
  }
  return out
}

// after a mistake: a similar task for the same concept
export function similarTask(t: Task, exclude: Set<string>): Task | undefined {
  const c = t.c[0]
  const cands = allTasks().filter(x => x.c.includes(c) && x.id !== t.id && !exclude.has(x.id) && TYPE_INFO[x.t].tier <= TYPE_INFO[t.t].tier && x.t !== 'explain')
  return cands.length ? rnd(cands) : undefined
}

/* ───────── checking answers ───────── */

export function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9µ ]+/g, ' ').replace(/\s+/g, ' ').trim()
}

export function lev(a: string, b: string): number {
  const m = a.length, n = b.length
  if (!m) return n
  if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = cur
  }
  return prev[n]
}

export type Match = 'exact' | 'typo' | 'no'
export function matchAnswer(input: string, accepted: string[]): Match {
  const x = norm(input)
  if (!x) return 'no'
  let best: Match = 'no'
  for (const a of accepted) {
    const y = norm(a)
    if (x === y) return 'exact'
    const d = lev(x, y)
    const tol = y.length >= 10 ? 2 : y.length >= 5 ? 1 : 0
    if (d <= tol) best = 'typo'
  }
  return best
}

export function orgByName(input: string): OrgId | undefined {
  const x = norm(input)
  for (const o of ORGANELLES) {
    const names = [o.name, ...o.aliases]
    if (matchAnswer(x, names) !== 'no') return o.id
  }
  return undefined
}
