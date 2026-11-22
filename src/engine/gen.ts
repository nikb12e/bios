import { BANK, type Task, type TaskType } from '../data/bank'
import { CONCEPTS, CON, type TopicId } from '../data/concepts'
import { ORGANELLES, ORG, ON_ANIMAL, ON_PLANT, type DetailId, type OrgId } from '../data/organelles'
import { level, retrievability, mastery } from './fsrs'
import { taskDiff, abilityOf, pSuccess } from './adapt'
import { EXAM_FOCUS } from '../data/concepts2'
import { BANK2 } from '../data/bank2'
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
export const ALL: Task[] = [...BANK, ...BANK2, ...GEN]

// AI tasks from the shared bank (src/data/aibank.json), loaded at start
let SHARED: Task[] = []
export const setShared = (t: Task[]) => { SHARED = t }
export const sharedCount = () => SHARED.length

export const allTasks = () => [...ALL, ...SHARED, ...get().ai]
export const taskById = (id: string) => allTasks().find(t => t.id === id)
export const topicOf = (t: Task): TopicId => CON[t.c[0]]?.topic ?? 'organeli'

/* ───────── choosing tasks (session) ───────── */

export interface ExplainCtx { taskId: string; prompt: string; chosen?: string; correct?: string; idk?: boolean; misses: number }
export type Item =
  | { kind: 'task'; task: Task; key: string; retry?: boolean; label?: string; check?: boolean; repick?: boolean }
  | { kind: 'learn'; concept: string; key: string }
  | { kind: 'explain'; concept: string; key: string; ctx: ExplainCtx }

export interface SessionOpts {
  topic?: TopicId
  concepts?: string[]
  type?: TaskType
  size?: number
  mode: 'smart' | 'review' | 'weak' | 'type' | 'test' | 'org'
  org?: OrgId
}

export function shuffle<T>(a: T[]): T[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] }
  return b
}

const HOUR = 3600000
export const diffOf = (t: Task) => taskDiff(t, get().tstat?.[t.id])
export const levelOfConcept = (c: string) => abilityOf(c, get().abil, get().mem[c], baseAbility())

// overall level: the average level of concepts already practised (the starting point for new concepts)
export function baseAbility() {
  const a = Object.values(get().abil ?? {}).filter(x => x.n > 0)
  if (a.length < 3) return 2.6
  return Math.min(4, Math.max(1.8, a.reduce((x, y) => x + y.th, 0) / a.length - 0.25))
}

export interface PickCtx { used: Set<string>; typeCount: Partial<Record<TaskType, number>>; avoidType?: TaskType; target: number; opts: SessionOpts }

/** picks a task for a concept: chance of success close to the target, varied formats, nothing seen recently */
export function pickTask(concept: string, ctx: PickCtx): Task | undefined {
  const s = get()
  const th = levelOfConcept(concept)
  const now = Date.now()
  const cands = allTasks().filter(t => t.c.includes(concept) && !ctx.used.has(t.id) && (!ctx.opts.type || t.t === ctx.opts.type) && (s.settings.ai || t.t !== 'explain'))
  if (!cands.length) return undefined
  const lastType = s.ctype?.[concept]
  // mix: about half the tasks from the hand written bank (visual, sorting, pairs), half AI
  const usedN = ctx.used.size
  const aiShare = usedN >= 4 ? [...ctx.used].filter(x => x.startsWith('ai:')).length / usedN : 0.5
  const mix = (aiShare - 0.5) * 2.2
  let best: Task | undefined, bw = -1e9
  for (const t of cands) {
    const d = diffOf(t)
    const p = pSuccess(th, d)
    let w = -Math.abs(p - ctx.target) * 4
    const ts = s.tstat?.[t.id]
    const seen = ts?.last ?? s.seenTask[t.id]
    if (seen) {
      const h = (now - seen) / HOUR
      // the same task comes back only after a break; a correctly solved one even later
      w -= h < 20 ? 3 : h < 72 ? (ts?.lastOk ? 1.4 : 0.6) : h < 240 ? (ts?.lastOk ? 0.5 : 0.1) : 0
    } else w += 0.5
    if (t.t === lastType || t.t === ctx.avoidType) w -= 0.9
    w -= Math.min(3, ctx.typeCount[t.t] ?? 0) * 0.28
    // a free explanation graded by AI: only once you know the concept a little (deeper checking), never as the first task
    if (t.t === 'explain') { if (!s.mem[concept]?.reps) continue; w -= th < 3 ? 1.6 : 0.3 }
    if (t.c[0] === concept) w += 0.25 // the task really is about this concept
    w += t.id.startsWith('ai:') ? 0.1 - mix : mix
    w += Math.random() * 0.45
    if (w > bw) { bw = w; best = t }
  }
  return best
}

function pool(opts: SessionOpts) {
  let pool = CONCEPTS.filter(c => (!opts.topic || c.topic === opts.topic) && (!opts.concepts || opts.concepts.includes(c.id)))
  if (opts.org) pool = pool.filter(c => c.org === opts.org || ORG[opts.org!].concepts.includes(c.id))
  if (opts.type) {
    const withType = new Set(allTasks().filter(t => t.t === opts.type).flatMap(t => t.c))
    pool = pool.filter(c => withType.has(c.id))
  }
  return pool.filter(c => allTasks().some(t => t.c.includes(c.id)))
}

/** concept priority: what you do not know gets the most time; new concepts are tested right away (testing before learning); known ones are checked now and then with a harder task */
function conceptPlan(opts: SessionOpts) {
  const s = get()
  const now = Date.now()
  return pool(opts).map(c => {
    const m = s.mem[c.id]
    const lv = level(m)
    const recentMiss = (m?.hist ?? []).slice(-4).filter(x => !x).length
    const R = retrievability(m, now)
    const exam = EXAM_FOCUS[c.id] ?? 1
    let role: 'new' | 'weak' | 'due' | 'probe' | 'learn'
    let pr: number
    if (!m?.reps) { role = 'new'; pr = 0.75 }
    else if (recentMiss >= 1 || lv === 'ucim') { role = 'weak'; pr = 1.1 + recentMiss * 0.3 + (1 - mastery(m, now)) * 0.5 }
    else if (m.due <= now) { role = 'due'; pr = 0.8 + (1 - R) }
    else if (lv === 'obvladam') { role = 'probe'; pr = 0.18 }
    else { role = 'learn'; pr = 0.45 + (1 - mastery(m, now)) * 0.4 }
    if (opts.mode === 'review' && role !== 'due' && role !== 'weak') pr *= 0.15
    if (opts.mode === 'weak' && role !== 'weak') pr *= role === 'due' ? 0.5 : 0.1
    return { id: c.id, role, pr: pr * exam, topic: c.topic }
  })
}

const TARGET = { new: 0.72, weak: 0.66, due: 0.72, learn: 0.62, probe: 0.45 } as const

export function buildSession(opts: SessionOpts): Item[] {
  const s = get()
  const size = opts.size ?? 14
  const used = new Set<string>()
  const typeCount: Partial<Record<TaskType, number>> = {}
  const items: Item[] = []
  const push = (t: Task, label?: string) => { used.add(t.id); typeCount[t.t] = (typeCount[t.t] ?? 0) + 1; items.push({ kind: 'task', task: t, key: t.id, label, repick: true }) }

  if (opts.mode === 'test') {
    // test: mixed tasks of difficulty 2 to 5 from the whole topic, like a school test
    const tasks = shuffle(allTasks().filter(t => (!opts.topic || topicOf(t) === opts.topic) && t.t !== 'recall' && t.t !== 'explain' && diffOf(t) >= 2))
    const want: TaskType[] = ['mc', 'type', 'cloze', 'sort', 'fix', 'odd', 'tf', 'labels', 'order', 'locate', 'match', 'mc', 'type', 'cloze', 'tf', 'labels', 'fix', 'mc']
    for (const ty of want) {
      if (items.length >= size) break
      const t = tasks.find(x => x.t === ty && !used.has(x.id) && !(x.t === 'identify' && x.mode === 'choose'))
      if (t) push(t)
    }
    if (s.settings.ai) shuffle(allTasks().filter(t => t.t === 'explain' && (!opts.topic || topicOf(t) === opts.topic))).slice(0, 2).forEach(t => push(t))
    return items.map(i => ({ ...i, repick: false }) as Item)
  }

  // concepts are drawn in proportion to their priority (without replacement), so topics interleave
  const plan = conceptPlan(opts)
  const chosen: typeof plan = []
  const bag = [...plan]
  // within a topic, test as many concepts as possible first (what do you already know); in mixed practice limit new concepts
  const roleCap = { new: opts.topic ? Math.round(size * 0.65) : Math.max(s.settings.newPerSession ?? 3, Math.round(size * (opts.mode === 'smart' ? 0.3 : 0.2))), probe: Math.max(1, Math.round(size * 0.15)) }
  const roleN = { new: 0, probe: 0 }
  while (chosen.length < size && bag.length) {
    const tot = bag.reduce((x, y) => x + y.pr, 0)
    let r = Math.random() * tot, k = 0
    for (; k < bag.length - 1; k++) { r -= bag[k].pr; if (r <= 0) break }
    const c = bag.splice(k, 1)[0]
    if ((c.role === 'new' || c.role === 'probe') && roleN[c.role] >= roleCap[c.role]) continue
    if (c.role === 'new' || c.role === 'probe') roleN[c.role]++
    chosen.push(c)
  }
  // weak concepts get a second task in another format later in the session
  const weakTwice = chosen.filter(c => c.role === 'weak').slice(0, Math.max(1, Math.round(size * 0.2)))
  const order = [...chosen, ...weakTwice.map(c => ({ ...c, second: true }))]
  for (const c of order) {
    if (items.length >= size) break
    const t = pickTask(c.id, { used, typeCount, target: TARGET[c.role], opts, avoidType: (c as { second?: boolean }).second ? (items.find(i => i.kind === 'task' && i.task.c[0] === c.id) as { task: Task } | undefined)?.task.t : undefined })
    if (t) push(t, c.role === 'probe' ? 'Check what you know' : undefined)
  }
  // small topic: another round over the same concepts (another format), weak and new first
  for (let round = 0; round < 3 && items.length < size; round++) {
    const again = [...chosen].sort((x, y) => y.pr - x.pr)
    for (const c of again) {
      if (items.length >= size) break
      const prev = items.filter(i => i.kind === 'task' && i.task.c[0] === c.id).map(i => (i as { task: Task }).task.t)
      const t = pickTask(c.id, { used, typeCount, target: TARGET[c.role], opts, avoidType: prev[prev.length - 1] })
      if (t) push(t)
    }
  }
  if (items.length < Math.min(size, 6)) {
    const extra = shuffle(allTasks().filter(t => !used.has(t.id) && t.c.some(c => plan.some(p => p.id === c)) && (!opts.type || t.t === opts.type) && t.t !== 'explain'))
    for (const t of extra) { if (items.length >= size) break; push(t) }
  }
  return interleave(items)
}

// tasks of the same type never come three times in a row; the same concept never twice in a row
function interleave(items: Item[]): Item[] {
  const rest = shuffle(items)
  const out: Item[] = []
  while (rest.length) {
    const last = out.slice(-2).map(i => (i as { task: Task }).task)
    let k = rest.findIndex(it => {
      const t = (it as { task: Task }).task
      return !(last.length && last[last.length - 1].c[0] === t.c[0]) && !(last.length === 2 && last.every(x => x.t === t.t))
    })
    if (k < 0) k = 0
    out.push(rest.splice(k, 1)[0])
  }
  return out
}

/** after a mistake: another format for the same concept, a little easier (learning from the mistake without repeating the same task) */
export function followUp(t: Task, used: Set<string>, opts: SessionOpts, target = 0.74): Task | undefined {
  return pickTask(t.c[0], { used, typeCount: {}, target, opts: { ...opts, type: undefined }, avoidType: t.t })
}

/** when moving on, the next task is picked again with the new level estimate (adaptive within a session) */
export function repickFor(it: Item, used: Set<string>, opts: SessionOpts, flow: number): Item {
  if (it.kind !== 'task' || !it.repick || opts.mode === 'test') return it
  const c = it.task.c[0]
  const s = get()
  const m = s.mem[c]
  const base = !m?.reps ? TARGET.new : level(m) === 'obvladam' ? TARGET.probe : TARGET.weak
  const target = Math.min(0.85, Math.max(0.4, base + (flow < 0 ? 0.1 : flow > 0 ? -0.08 : 0)))
  const u = new Set(used); u.delete(it.task.id)
  const t = pickTask(c, { used: u, typeCount: {}, target, opts })
  if (!t || t.id === it.task.id) return it
  used.add(t.id)
  return { ...it, task: t, key: t.id, label: flow > 0 && diffOf(t) >= 3.5 ? 'Challenge' : it.label }
}

// compatibility with the older name
export const similarTask = (t: Task, exclude: Set<string>) => followUp(t, exclude, { mode: 'smart' })

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
