// Question bank for the live Arena. It is built at build time (scripts/post.mjs) into dist/data/arena.json
// and read by the server. Everything is based on the same material as the practice (data/bank.ts, organelles, the cell notes).
import { BANK } from '../data/bank'
import { CON } from '../data/concepts'
import { ORG, ON_ANIMAL, ON_PLANT, type OrgId } from '../data/organelles'

export type AUi = 'opts' | 'tf' | 'type' | 'cell' | 'point'
export type AKind = 'mc' | 'tf' | 'type' | 'identify' | 'locate' | 'odd' | 'fix' | 'cloze' | 'order' | 'zoom' | 'role' | 'ai'
export type ACell = 'animal' | 'plant' | 'prok'

/** question with its answer (server only) */
export interface AQ {
  id: string
  k: AKind
  ui: AUi
  q: string
  sub?: string
  opts?: string[]
  a: number | boolean | string
  acc?: string[]
  alt?: string[]
  cell?: ACell
  mark?: string
  topic: string
  d: number
  why?: string
}

export const KIND_NAME: Record<AKind, string> = {
  mc: 'Choice', tf: 'True or false', type: 'Type the term', identify: 'What is marked', locate: 'Point on the cell',
  odd: 'Odd one out', fix: 'Find the mistake', cloze: 'Fill in', order: 'What came first', zoom: 'Magnification', role: 'Role of the organelle', ai: 'New from AI',
}

const PROK_PARTS = ['stena', 'membrana', 'dnk', 'ribosomi'] as const
const pname = (id: string) => (id === 'dnk' ? 'Circular DNA' : ORG[id as OrgId]?.name ?? id)
const topicOf = (c?: string) => CON[c ?? '']?.topic ?? 'organeli'

// deterministic shuffle for the build
function rng(seed: number) {
  let t = seed >>> 0
  return () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296 }
}
const R = rng(20261119)
const pickN = <T,>(a: T[], n: number) => { const c = [...a]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [c[i], c[j]] = [c[j], c[i]] } return c.slice(0, n) }

// convincing mix ups for recognising organelles
const NEAR: Partial<Record<string, string[]>> = {
  jedro: ['jedrce', 'vakuola', 'lizosom'], jedrce: ['jedro', 'ribosomi', 'centrioli'], zrnatiER: ['gladkiER', 'golgi', 'ribosomi'], gladkiER: ['zrnatiER', 'golgi', 'citoskelet'],
  golgi: ['zrnatiER', 'gladkiER', 'mitohondrij'], mitohondrij: ['kloroplast', 'lizosom', 'golgi'], lizosom: ['vakuola', 'ribosomi', 'centrioli'], vakuola: ['lizosom', 'jedro', 'skrobna'],
  kloroplast: ['mitohondrij', 'skrobna', 'vakuola'], skrobna: ['kloroplast', 'vakuola', 'lizosom'], ribosomi: ['jedrce', 'lizosom', 'centrioli'], centrioli: ['ribosomi', 'citoskelet', 'golgi'],
  membrana: ['stena', 'citoskelet', 'migetalke'], stena: ['membrana', 'citoskelet', 'vakuola'], citoskelet: ['migetalke', 'gladkiER', 'membrana'], migetalke: ['citoskelet', 'membrana', 'centrioli'],
  dnk: ['ribosomi', 'membrana', 'stena'],
}

export function buildArenaBank(): AQ[] {
  const out: AQ[] = []
  for (const t of BANK) {
    const topic = topicOf(t.c[0])
    if (t.t === 'mc') out.push({ id: 'a:' + t.id, k: 'mc', ui: 'opts', q: t.q, opts: t.opts, a: t.a, topic, d: 1, why: t.why })
    else if (t.t === 'tf') out.push({ id: 'a:' + t.id, k: 'tf', ui: 'tf', q: t.s, a: t.a, topic, d: 1, why: t.why ?? (t.fix ? t.fix.opts[t.fix.a] : undefined) })
    else if (t.t === 'type') out.push({ id: 'a:' + t.id, k: 'type', ui: 'type', q: t.q, a: t.a[0], acc: t.a, topic, d: 1, why: t.why })
    else if (t.t === 'odd') out.push({ id: 'a:' + t.id, k: 'odd', ui: 'opts', q: t.q, opts: t.items, a: t.a, topic, d: 1, why: t.why })
    else if (t.t === 'fix') {
      const m = t.text.match(/\[([^|\]]+)\|([^\]]+)\]/)
      if (!m) continue
      const sentence = t.text.replace(m[0], `«${m[1]}»`)
      const opts = [...new Set(t.opts)]
      const a = opts.indexOf(m[2])
      if (a < 0 || opts.length < 3) continue
      out.push({ id: 'a:' + t.id, k: 'fix', ui: 'opts', q: sentence, sub: `Which word is correct instead of «${m[1]}»?`, opts, a, topic, d: 1, why: t.why })
    } else if (t.t === 'cloze') {
      const gaps = [...t.text.matchAll(/\{([^}]+)\}/g)].map(x => x[1])
      gaps.slice(0, 2).forEach((g, gi) => {
        let k = 0
        const q = t.text.replace(/\{([^}]+)\}/g, (_, w) => (k++ === gi ? '___' : w))
        const ex = [...new Set([g, ...(t.extra ?? [])])]
        const opts = (ex.length >= 3 ? ex : [...new Set([...ex, ...gaps.filter(x => x !== g)])]).slice(0, 4)
        if (opts.length < 3) return
        out.push({ id: `a:${t.id}:${gi}`, k: 'cloze', ui: 'opts', q, opts, a: 0, topic, d: 1, why: t.why })
      })
    } else if (t.t === 'order' && (t.id === 'or1' || t.id === 'or4')) {
      // pairs: what came first / what is smaller
      for (let i = 0; i < t.items.length; i++) for (let j = i + 1; j < t.items.length; j++) {
        const swap = R() < 0.5
        const opts = swap ? [t.items[j], t.items[i]] : [t.items[i], t.items[j]]
        out.push({ id: `a:${t.id}:${i}${j}`, k: 'order', ui: 'opts', q: t.id === 'or1' ? 'What happened first?' : 'Which is smaller?', opts, a: swap ? 1 : 0, topic, d: 1 })
      }
    }
  }

  // what is marked and point at it on the cell
  const cells: [ACell, string[]][] = [
    ['animal', ON_ANIMAL.filter(o => o !== 'citoplazma')],
    ['plant', ON_PLANT.filter(o => o !== 'citoplazma')],
    ['prok', [...PROK_PARTS]],
  ]
  for (const [cell, parts] of cells) {
    const nameCell = cell === 'animal' ? 'animal' : cell === 'plant' ? 'plant' : 'prokaryotic'
    for (const target of parts) {
      const topic = cell === 'prok' ? 'primerjava' : target === 'membrana' || target === 'stena' ? 'ovoj' : 'organeli'
      const pool = parts.filter(p => p !== target)
      const near = (NEAR[target] ?? []).filter(p => pool.includes(p))
      const distract = [...near, ...pickN(pool.filter(p => !near.includes(p)), 3)].slice(0, 3)
      out.push({ id: `a:id:${cell}:${target}`, k: 'identify', ui: 'cell', q: 'What is marked?', sub: `On the ${nameCell} cell`, cell, mark: target, opts: [pname(target), ...distract.map(pname)], a: 0, topic, d: 1 })
      out.push({ id: `a:loc:${cell}:${target}`, k: 'locate', ui: 'point', q: `Tap: ${pname(target)}`, sub: `On the ${nameCell} cell`, cell, a: target, alt: distract, topic, d: 1 })
    }
  }

  // role of an organelle, in both directions
  const roles: [OrgId, string][] = [
    ['ribosomi', 'protein synthesis'], ['mitohondrij', 'cellular respiration, ATP production'], ['lizosom', 'cellular digestion'], ['golgi', 'preparing products for secretion'],
    ['jedrce', 'making ribosome subunits'], ['kloroplast', 'photosynthesis'], ['gladkiER', 'lipid synthesis, breakdown of toxins'], ['zrnatiER', 'proteins for secretion, membrane synthesis'],
    ['centrioli', 'taking part in cell division'], ['stena', 'strength, protection against changes in turgor'], ['membrana', 'controls what passes in and out'], ['citoskelet', 'cell shape and movement'],
    ['vakuola', 'storing water and substances, support of the plant cell'], ['skrobna', 'storing starch'], ['migetalke', 'moving the cell or the fluid around it'],
  ]
  roles.forEach(([o, role], i) => {
    const others = pickN(roles.filter((_, j) => j !== i), 3)
    out.push({ id: `a:role:o:${o}`, k: 'role', ui: 'opts', q: `Which organelle is responsible for: ${role}?`, opts: [ORG[o].name, ...others.map(r => ORG[r[0]].name)], a: 0, topic: 'organeli', d: 1 })
    out.push({ id: `a:role:r:${o}`, k: 'role', ui: 'opts', q: `What is the role of: ${ORG[o].name}?`, opts: [role, ...others.map(r => r[1])], a: 0, topic: 'organeli', d: 1 })
  })

  // microscope magnification
  for (const ok of [5, 10, 15]) for (const ob of [4, 10, 40, 100]) {
    const right = ok * ob
    const opts = [...new Set([right, ok + ob, right * 10, Math.max(2, Math.round(right / 10)), ob * 10 === right ? ok * ob * 2 : ob * 10])].slice(0, 4)
    if (opts.length < 4) continue
    out.push({ id: `a:zoom:${ok}:${ob}`, k: 'zoom', ui: 'opts', q: `Eyepiece ${ok}×, objective ${ob}×. What is the total magnification?`, opts: opts.map(n => `${n}×`), a: 0, topic: 'teorija', d: 1, why: 'Total magnification = eyepiece magnification × objective magnification.' })
  }
  return out
}

/** text for Jev (difficulty estimate) */
export function describe(q: AQ): string {
  const ans = q.ui === 'tf' ? (q.a ? 'true' : 'false') : q.ui === 'point' ? pname(String(q.a)) : q.ui === 'type' ? String(q.a) : q.opts?.[q.a as number]
  const vis = q.ui === 'cell' ? ` (in the picture of ${q.cell === 'animal' ? 'an animal' : q.cell === 'plant' ? 'a plant' : 'a prokaryotic'} cell, the marked part is ${pname(q.mark!)})` : q.ui === 'point' ? ' (the student must find the organelle on the cell drawing and tap it)' : ''
  const kind = q.ui === 'type' ? 'The student must type the answer, with no options.' : q.ui === 'tf' ? 'The student chooses true or false.' : q.opts ? `Options: ${q.opts.join(' | ')}.` : ''
  return `Live quiz on cell biology for first year high school, timed (6 to 12 seconds). Task (${KIND_NAME[q.k]}): ${q.q}${q.sub ? ' ' + q.sub : ''}${vis}. ${kind} Correct: ${ans}.`
}
