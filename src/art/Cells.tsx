import { memo, type ReactNode } from 'react'
import type { OrgId } from '../data/organelles'
import { ORG } from '../data/organelles'
import {
  blob, blobPoint, capsule, cristae, arcPath, pointsOnArc, squiggle, scatter, smoothOpen, smoothClosed, deg, rng, type P,
} from './geo'

export type CellKind = 'animal' | 'plant' | 'prok'
export type PartId = OrgId | 'dnk'

export interface CellProps {
  kind: CellKind
  focus?: PartId | null
  mark?: PartId | null
  good?: PartId | null
  bad?: PartId | null
  onPick?: (id: PartId) => void
  labels?: boolean
  mastery?: Partial<Record<PartId, number>>
  hideLabelsOf?: PartId[]
  className?: string
  title?: string
  protein?: number // animation step of the protein path (0 = off)
}

/* ───────────── helper parts ───────────── */

function Cisterna({ d, c, f, w = 11 }: { d: string; c: string; f: string; w?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <path d={d} fill="none" stroke={f} strokeWidth={w - 5.5} strokeLinecap="round" />
    </g>
  )
}

function Ribos({ pts, r = 2.4, hit = 0 }: { pts: P[]; r?: number; hit?: number }) {
  return (
    <g fill="var(--o-ribo)">
      {hit > 0 && pts.map((p, i) => <circle key={'h' + i} cx={p[0]} cy={p[1]} r={hit} fill="transparent" />)}
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={r} />)}
    </g>
  )
}

export function Mito({ x, y, rot, w, h, folds = 5 }: { x: number; y: number; rot: number; w: number; h: number; folds?: number }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <path d={capsule(w, h)} fill="var(--o-mito-f)" stroke="var(--o-mito)" strokeWidth={3} />
      <path d={cristae(w - 9, h - 9, folds, 0.6)} fill="var(--o-mito-m)" stroke="var(--o-mito)" strokeWidth={1.8} strokeLinejoin="round" />
    </g>
  )
}

export function Chloro({ x, y, rot, w = 80, h = 38, seed = 1 }: { x: number; y: number; rot: number; w?: number; h?: number; seed?: number }) {
  const stacks = [-0.3, 0, 0.3].map(t => t * w)
  const R = rng(seed)
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <ellipse rx={w / 2} ry={h / 2} fill="var(--o-kloro-f)" stroke="var(--o-kloro)" strokeWidth={3} />
      <ellipse rx={w / 2 - 4} ry={h / 2 - 4} fill="none" stroke="var(--o-kloro)" strokeWidth={1.2} opacity={0.5} />
      <path d={`M${-w * 0.36},0H${w * 0.36}`} stroke="var(--o-kloro)" strokeWidth={1.4} opacity={0.7} />
      {stacks.map((sx, i) => {
        const n = 4 + Math.round(R())
        const top = -(n * 4.2) / 2
        return (
          <g key={i}>
            {Array.from({ length: n }, (_, k) => (
              <rect key={k} x={sx - 7.5} y={top + k * 4.2} width={15} height={3.4} rx={1.7} fill="var(--o-kloro)" />
            ))}
          </g>
        )
      })}
    </g>
  )
}

function Golgi({ cx, cy, radii, spans, dir = 1 }: { cx: number; cy: number; radii: number[]; spans: number[]; dir?: 1 | -1 }) {
  const base = dir === 1 ? 0 : 180
  return (
    <g>
      {radii.map((r, i) => (
        <Cisterna key={i} d={arcPath(cx, cy, r, base - spans[i], base + spans[i])} c="var(--o-golgi)" f="var(--o-golgi-f)" w={8.5} />
      ))}
    </g>
  )
}

function Vesicle({ x, y, r = 5.5, cls }: { x: number; y: number; r?: number; cls?: string }) {
  return <circle className={cls} cx={x} cy={y} r={r} fill="var(--o-golgi-f)" stroke="var(--o-golgi)" strokeWidth={2} />
}

function Centrioles({ x, y }: { x: number; y: number }) {
  const barrel = (w: number, h: number) => (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={3} fill="var(--o-centri-f)" stroke="var(--o-centri)" strokeWidth={2} />
      {[-0.25, 0, 0.25].map((t, i) => <line key={i} x1={-w / 2 + 3} x2={w / 2 - 3} y1={t * h} y2={t * h} stroke="var(--o-centri)" strokeWidth={1.2} />)}
    </g>
  )
  return (
    <g transform={`translate(${x},${y})`}>
      <g transform="translate(-8,4)">{barrel(26, 11)}</g>
      <g transform="translate(10,-7) rotate(90)">{barrel(26, 11)}</g>
    </g>
  )
}

function Lyso({ x, y, r, seed }: { x: number; y: number; r: number; seed: number }) {
  const R = rng(seed)
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--o-lizo-f)" stroke="var(--o-lizo)" strokeWidth={2.5} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = R() * 6.28, d = R() * r * 0.55
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d} r={1.8} fill="var(--o-lizo)" />
      })}
    </g>
  )
}

function Starch({ x, y, rx, ry, rot = 0 }: { x: number; y: number; rx: number; ry: number; rot?: number }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <ellipse rx={rx} ry={ry} fill="var(--o-skrob-f)" stroke="var(--o-skrob)" strokeWidth={2} />
      <ellipse rx={rx * 0.62} ry={ry * 0.62} fill="none" stroke="var(--o-skrob)" strokeWidth={1} opacity={0.7} />
      <ellipse rx={rx * 0.28} ry={ry * 0.28} fill="none" stroke="var(--o-skrob)" strokeWidth={1} opacity={0.7} />
    </g>
  )
}

function Nucleus({ x, y, r, nx, ny, nr, seed, pores = [20, 80, 140, 200, 265, 320], riboFrom = -60, riboTo = 200 }: {
  x: number; y: number; r: number; nx: number; ny: number; nr: number; seed: number; pores?: number[]; riboFrom?: number; riboTo?: number
}) {
  const ribo = pointsOnArc(x, y, r + 6, riboFrom, riboTo, Math.round(((riboTo - riboFrom) / 360) * r * 0.55))
    .filter(p => !pores.some(a => {
      const pa = (Math.atan2(p[1] - y, p[0] - x) * 180) / Math.PI
      const d = Math.abs(((pa - a + 540) % 360) - 180)
      return d < 7
    }))
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--o-jedro-f)" stroke="var(--o-jedro)" strokeWidth={3} />
      <circle cx={x} cy={y} r={r - 7} fill="none" stroke="var(--o-jedro)" strokeWidth={2} />
      {pores.map(a => {
        const c = Math.cos(deg(a)), s = Math.sin(deg(a))
        return <line key={a} x1={x + c * (r - 9.5)} y1={y + s * (r - 9.5)} x2={x + c * (r + 1.8)} y2={y + s * (r + 1.8)} stroke="var(--o-jedro-f)" strokeWidth={5.5} />
      })}
      <g fill="none" stroke="var(--o-jedro)" strokeWidth={1.5} opacity={0.5} strokeLinecap="round">
        {[0, 1, 2].map(i => <path key={i} d={squiggle(seed + i, x - r * 0.15 + i * 6, y + r * 0.12, r * 0.55, 6)} />)}
      </g>
      <Ribos pts={ribo} r={2.2} />
    </g>
  )
}

/* ───────────── animal cell ───────────── */

const A = {
  W: 760, H: 560,
  mem: { cx: 380, cy: 282, rx: 334, ry: 238, wob: [0.022, -0.018, 0.014], ph: 0.6 },
  N: { x: 318, y: 292, r: 86 },
}

const animalGeom = (() => {
  const m = A.mem
  const memD = blob(m.cx, m.cy, m.rx, m.ry, m.wob, m.ph, 24)
  const inside = (p: P) => ((p[0] - m.cx) / (m.rx * 0.9)) ** 2 + ((p[1] - m.cy) / (m.ry * 0.88)) ** 2 < 1
  const N = A.N
  const er = [
    { r: 106, a0: -112, a1: 14 }, { r: 122, a0: -100, a1: 24 }, { r: 138, a0: -112, a1: 8 }, { r: 154, a0: -94, a1: -6 },
  ]
  const erRibo: P[] = []
  er.forEach(e => {
    const n = Math.round(((e.a1 - e.a0) / 360) * 2 * Math.PI * e.r / 9)
    erRibo.push(...pointsOnArc(N.x, N.y, e.r + 7.2, e.a0, e.a1, n))
    erRibo.push(...pointsOnArc(N.x, N.y, e.r - 7.2, e.a0 + 4, e.a1 - 4, n - 1))
  })
  const smooth: P[][] = [
    [[452, 318], [462, 345], [458, 380]],
    [[418, 396], [452, 381], [488, 393], [520, 381], [552, 396]],
    [[430, 428], [466, 419], [500, 431], [536, 422]],
    [[488, 393], [480, 410], [466, 419]],
    [[520, 381], [512, 408], [500, 431]],
  ]
  const excl: [number, number, number][] = [
    [N.x, N.y, 98], [590, 215, 64], [175, 172, 50], [602, 376, 52], [160, 368, 50], [455, 148, 22], [384, 470, 20],
    [240, 470, 26], [662, 300, 22], [230, 258, 28], [486, 405, 62],
  ]
  const free = scatter(7, 46, p => inside(p) && !excl.some(([x, y, r]) => (p[0] - x) ** 2 + (p[1] - y) ** 2 < r * r) && !(() => {
    const dx = p[0] - N.x, dy = p[1] - N.y, d = Math.hypot(dx, dy), a = (Math.atan2(dy, dx) * 180) / Math.PI
    return d < 170 && a > -120 && a < 32
  })(), [40, 40, 720, 520], 17)
  // a cluster of free ribosomes (for the label)
  const cluster: P[] = [[548, 470], [556, 476], [565, 471], [573, 477], [582, 472]]
  const cilia = [208, 216, 224, 232, 240, 248, 256].map(a => {
    const p = blobPoint(m.cx, m.cy, m.rx, m.ry, deg(a), m.wob, m.ph)
    const nx = Math.cos(deg(a)), ny = Math.sin(deg(a))
    const tx = -ny, ty = nx
    const L = 28
    const pts: P[] = [p, [p[0] + nx * L * 0.35 + tx * 4, p[1] + ny * L * 0.35 + ty * 4], [p[0] + nx * L * 0.7 - tx * 3, p[1] + ny * L * 0.7 - ty * 3], [p[0] + nx * L + tx * 2, p[1] + ny * L + ty * 2]]
    return smoothOpen(pts)
  })
  const cyto = [10, 42, 100, 172, 300, 330].map(a => {
    const c: P = [230, 258]
    const e = blobPoint(m.cx, m.cy, m.rx * 0.95, m.ry * 0.94, deg(a + 0), m.wob, m.ph)
    // pointing from the centrioles towards the edge
    const dir = Math.atan2(e[1] - c[1], e[0] - c[0])
    const end: P = [c[0] + Math.cos(dir) * 900, c[1] + Math.sin(dir) * 900]
    // intersection with an ellipse, roughly: shorten to the edge
    let t = 0
    for (let k = 0; k < 200; k++) { const q: P = [c[0] + (end[0] - c[0]) * (k / 200), c[1] + (end[1] - c[1]) * (k / 200)]; if (!inside(q)) break; t = k / 200 }
    return [c, [c[0] + (end[0] - c[0]) * t, c[1] + (end[1] - c[1]) * t]] as [P, P]
  })
  return { memD, er, erRibo, smooth, free, cluster, cilia, cyto }
})()

/* prokaryotic cell: one circular DNA (a twisted ring in the nucleoid, with no envelope), ribosomes around it */
const prokGeom = (() => {
  const W = 760, H = 420, cx = 390, cy = 212
  const at = (t: number): P => {
    const r = 21 + 7 * Math.sin(5 * t)
    return [cx + 128 * Math.cos(t) + r * Math.cos(13 * t), cy + 44 * Math.sin(t) + r * 0.85 * Math.sin(13 * t + 0.5 * Math.sin(3 * t))]
  }
  const dnaPts = Array.from({ length: 420 }, (_, i) => at((i / 420) * Math.PI * 2))
  const nearDna = (p: P) => dnaPts.some(q => (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 < 100)
  const inCyto = (p: P) => ((p[0] - 380) / 268) ** 2 + ((p[1] - 210) / 98) ** 2 < 1 && ((p[0] - cx) / 112) ** 2 + ((p[1] - cy) / 26) ** 2 > 1 && !nearDna(p)
  const ribo = scatter(4, 96, inCyto, [100, 100, 660, 320], 12)
  const near = (x: number, y: number) => ribo.reduce((b, q) => ((q[0] - x) ** 2 + (q[1] - y) ** 2 < (b[0] - x) ** 2 + (b[1] - y) ** 2 ? q : b), ribo[0])
  return { W, H, dna: smoothClosed(dnaPts), ribo, dnaAt: at(-1.9), riboAt: near(600, 285) }
})()

export const ANCHOR: Record<CellKind, Partial<Record<PartId, P>>> = {
  animal: {
    membrana: [646, 128], citoplazma: [540, 300], jedro: [292, 345], jedrce: [338, 272], zrnatiER: [416, 196], gladkiER: [488, 405],
    ribosomi: [566, 474], golgi: [598, 215], mitohondrij: [602, 376], vakuola: [662, 300], lizosom: [455, 148], centrioli: [232, 258],
    citoskelet: [302, 150], migetalke: [150, 82],
  },
  plant: {
    stena: [390, 34], membrana: [226, 50], citoplazma: [596, 438], jedro: [128, 196], jedrce: [160, 168], zrnatiER: [214, 214], gladkiER: [112, 438],
    ribosomi: [250, 420], golgi: [98, 318], mitohondrij: [402, 82], kloroplast: [300, 90], vakuola: [410, 300], skrobna: [600, 84], citoskelet: [656, 500],
  },
  prok: { stena: [380, 86], membrana: [645, 146], citoplazma: [175, 265], dnk: prokGeom.dnaAt, ribosomi: prokGeom.riboAt },
}

const PART_NAME: Partial<Record<PartId, string>> = { dnk: 'Circular DNA' }
export const partName = (id: PartId) => PART_NAME[id] ?? ORG[id as OrgId]?.name ?? id

function Group({ id, p, children }: { id: PartId; p: GroupCtx; children: ReactNode }) {
  const cls = ['org']
  if (p.focus === id) cls.push('on')
  if (p.good === id) cls.push('good')
  if (p.bad === id) cls.push('bad')
  const m = p.mastery?.[id]
  const style = m !== undefined ? { opacity: 0.28 + 0.72 * m } : undefined
  return (
    <g className={cls.join(' ')} data-org={id} style={style}
      onClick={p.onPick ? e => { e.stopPropagation(); p.onPick!(id) } : undefined}>
      {children}
    </g>
  )
}

type GroupCtx = Pick<CellProps, 'focus' | 'good' | 'bad' | 'onPick' | 'mastery'>

function Labels({ kind, show, hide, focus }: { kind: CellKind; show?: boolean; hide?: PartId[]; focus?: PartId | null }) {
  const anchors = ANCHOR[kind]
  const [W, H] = kind === 'prok' ? [760, 420] : [760, 560]
  const ids = (Object.keys(anchors) as PartId[]).filter(id => (show || focus === id) && !hide?.includes(id))
  if (!ids.length) return null
  return (
    <div className="lbl-host" aria-hidden>
      {ids.map(id => {
        const [x, y] = anchors[id]!
        return <div key={id} className={`l3d ${focus === id ? 'on' : ''}`} style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, transform: 'translate(-50%, calc(-100% - 6px))' }}>{partName(id)}</div>
      })}
    </div>
  )
}

function Marker({ kind, id, tone }: { kind: CellKind; id?: PartId | null; tone: 'mark' | 'good' | 'bad' }) {
  if (!id) return null
  const p = ANCHOR[kind][id]
  if (!p) return null
  return (
    <g className={`marker ${tone}`} pointerEvents="none" transform={`translate(${p[0]},${p[1]})`}>
      <circle r={34} />
      <circle r={34} className="pulse" />
    </g>
  )
}

/* ───────────── components ───────────── */

export const AnimalCell = memo(function AnimalCell(props: CellProps) {
  const g = animalGeom
  const N = A.N
  const ctx: GroupCtx = props
  return (
    <div className="cellwrap">
    <svg viewBox={`0 0 ${A.W} ${A.H}`} className={`cell ${props.focus ? 'focus' : ''} ${props.className ?? ''}`} role="img" aria-label={props.title ?? 'Animal cell'}>
      <Group id="citoplazma" p={ctx}>
        <path d={g.memD} fill="var(--o-cyto)" />
      </Group>
      <Group id="citoskelet" p={ctx}>
        <g stroke="var(--o-cito)" strokeWidth={1.6} strokeLinecap="round" opacity={0.8}>
          {g.cyto.map(([a, b], i) => <g key={i}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="transparent" strokeWidth={16} /><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeDasharray={i % 2 ? '1 0' : '7 4'} /></g>)}
        </g>
      </Group>
      <Group id="membrana" p={ctx}>
        <path d={g.memD} fill="none" stroke="transparent" strokeWidth={24} />
        <path d={g.memD} fill="none" stroke="var(--o-mem)" strokeWidth={4.5} />
        <path d={g.memD} fill="none" stroke="var(--o-cyto)" strokeWidth={1.3} />
      </Group>
      <Group id="migetalke" p={ctx}>
        <g fill="none" stroke="var(--o-mig)" strokeWidth={2.6} strokeLinecap="round">
          {g.cilia.map((d, i) => <g key={i}><path d={d} stroke="transparent" strokeWidth={16} /><path d={d} className="cilium" style={{ animationDelay: `${i * -0.18}s` }} /></g>)}
        </g>
      </Group>
      <Group id="zrnatiER" p={ctx}>
        {g.er.map((e, i) => <Cisterna key={i} d={arcPath(N.x, N.y, e.r, e.a0, e.a1)} c="var(--o-zer)" f="var(--o-zer-f)" />)}
        <Ribos pts={g.erRibo} r={2.1} />
      </Group>
      <Group id="gladkiER" p={ctx}>
        {g.smooth.map((pts, i) => <Cisterna key={i} d={smoothOpen(pts)} c="var(--o-ger)" f="var(--o-ger-f)" w={10} />)}
      </Group>
      <Group id="jedro" p={ctx}>
        <Nucleus x={N.x} y={N.y} r={N.r} nx={338} ny={272} nr={22} seed={3} />
      </Group>
      <Group id="jedrce" p={ctx}>
        <ellipse cx={338} cy={272} rx={24} ry={20} fill="var(--o-jedrce)" />
        <ellipse cx={333} cy={267} rx={8} ry={6} fill="var(--o-jedro-f)" opacity={0.25} />
      </Group>
      <Group id="golgi" p={ctx}>
        <Golgi cx={528} cy={215} radii={[50, 61, 72, 83, 94]} spans={[36, 40, 41, 37, 30]} />
        {[[620, 160], [633, 182], [646, 252], [624, 270], [602, 292], [656, 214]].map(([x, y], i) => <Vesicle key={i} x={x} y={y} r={i % 2 ? 5 : 6} cls={`ves v${i}`} />)}
      </Group>
      <Group id="mitohondrij" p={ctx}>
        <Mito x={175} y={172} rot={-24} w={90} h={40} />
        <Mito x={602} y={376} rot={14} w={94} h={42} />
        <Mito x={160} y={368} rot={68} w={86} h={38} />
      </Group>
      <Group id="lizosom" p={ctx}>
        <Lyso x={455} y={148} r={15} seed={2} />
        <Lyso x={384} y={470} r={13} seed={5} />
      </Group>
      <Group id="vakuola" p={ctx}>
        <circle cx={240} cy={470} r={18} fill="var(--o-vak-f)" stroke="var(--o-vak)" strokeWidth={2.5} />
        <circle cx={662} cy={300} r={15} fill="var(--o-vak-f)" stroke="var(--o-vak)" strokeWidth={2.5} />
      </Group>
      <Group id="centrioli" p={ctx}>
        <Centrioles x={232} y={258} />
      </Group>
      <Group id="ribosomi" p={ctx}>
        <Ribos pts={[...g.free, ...g.cluster]} r={2.7} hit={9} />
        <circle cx={566} cy={474} r={22} fill="transparent" />
      </Group>
      {props.protein ? <ProteinPath step={props.protein} /> : null}
      <Marker kind="animal" id={props.mark} tone="mark" />
      <Marker kind="animal" id={props.good} tone="good" />
      <Marker kind="animal" id={props.bad} tone="bad" />
          </svg>
      <Labels kind="animal" show={props.labels} hide={props.hideLabelsOf} focus={props.focus} />
    </div>
  )
})

// The path of a protein for secretion (animation in the explanation): nucleus, rough ER, vesicle, Golgi, vesicle, membrane.
export const PROTEIN_STEPS: { p: P; t: string; org: OrgId }[] = [
  { p: [318, 292], t: 'DNA in the nucleus carries the genetic code for the protein.', org: 'jedro' },
  { p: [400, 214], t: 'Ribosomes on the rough ER synthesise the protein the cell will secrete.', org: 'zrnatiER' },
  { p: [480, 196], t: 'The protein travels in a vesicle to the Golgi apparatus.', org: 'golgi' },
  { p: [598, 215], t: 'The Golgi apparatus prepares the product the cell secretes.', org: 'golgi' },
  { p: [672, 168], t: 'A vesicle carrying the substance buds off the cisternae.', org: 'golgi' },
  { p: [700, 150], t: 'The vesicle fuses with the cell membrane and the cell secretes the substance.', org: 'membrana' },
]

function ProteinPath({ step }: { step: number }) {
  const pts = PROTEIN_STEPS.slice(0, step).map(s => s.p)
  const cur = PROTEIN_STEPS[Math.min(step, PROTEIN_STEPS.length) - 1].p
  return (
    <g pointerEvents="none" className="ppath">
      {pts.length > 1 && <path d={smoothOpen(pts)} fill="none" stroke="var(--accent)" strokeWidth={3} strokeDasharray="2 7" strokeLinecap="round" />}
      <circle cx={cur[0]} cy={cur[1]} r={9} fill="var(--accent)" className="pbead" />
      <circle cx={cur[0]} cy={cur[1]} r={9} fill="none" stroke="var(--accent)" strokeWidth={2} className="pulse" />
    </g>
  )
}

/* ───────────── plant cell ───────────── */

const plantGeom = (() => {
  const W = 760, H = 560
  const vac = { cx: 410, cy: 300, rx: 212, ry: 156 }
  const vacD = blob(vac.cx, vac.cy, vac.rx, vac.ry, [0.03, -0.02, 0.012], 1.4, 20)
  const inMem = (p: P) => p[0] > 56 && p[0] < 704 && p[1] > 56 && p[1] < 504
  const inVac = (p: P) => ((p[0] - vac.cx) / (vac.rx + 14)) ** 2 + ((p[1] - vac.cy) / (vac.ry + 14)) ** 2 < 1
  const excl: [number, number, number][] = [
    [148, 178, 92], [100, 320, 44], [300, 88, 44], [500, 82, 44], [668, 170, 44], [672, 380, 44], [520, 492, 44], [300, 498, 44],
    [402, 82, 36], [410, 500, 36], [690, 280, 36], [600, 84, 16], [224, 476, 16], [640, 466, 16], [112, 438, 46], [596, 438, 26],
  ]
  const free = scatter(11, 40, p => inMem(p) && !inVac(p) && !excl.some(([x, y, r]) => (p[0] - x) ** 2 + (p[1] - y) ** 2 < r * r), [56, 56, 704, 504], 15)
  const cluster: P[] = [[236, 418], [244, 424], [253, 419], [261, 425], [270, 420]]
  const N = { x: 148, y: 178, r: 58 }
  const er = [{ r: 72, a0: -8, a1: 96 }, { r: 86, a0: 2, a1: 88 }]
  const erRibo: P[] = []
  er.forEach(e => {
    const n = Math.round(((e.a1 - e.a0) / 360) * 2 * Math.PI * e.r / 9)
    erRibo.push(...pointsOnArc(N.x, N.y, e.r + 7, e.a0, e.a1, n))
    erRibo.push(...pointsOnArc(N.x, N.y, e.r - 7, e.a0 + 4, e.a1 - 4, n - 1))
  })
  const smooth: P[][] = [[[78, 420], [104, 410], [132, 422], [152, 412]], [[86, 450], [116, 442], [146, 452]], [[104, 410], [110, 428], [116, 442]]]
  // cellulose fibres in the wall
  const fibers: string[] = []
  for (let i = 0; i < 46; i++) {
    const t = i / 46
    // rectangle outline
    const per = 2 * (712 + 512)
    let s = t * per, x = 0, y = 0
    if (s < 712) { x = 24 + s; y = 34 } else if ((s -= 712) < 512) { x = 726; y = 24 + s } else if ((s -= 512) < 712) { x = 736 - s; y = 526 } else { s -= 712; x = 34; y = 536 - s }
    fibers.push(`M${x - 6},${y - 6}L${x + 6},${y + 6}`)
  }
  return { W, H, vacD, free, cluster, N, er, erRibo, smooth, fibers }
})()

export const PlantCell = memo(function PlantCell(props: CellProps) {
  const g = plantGeom
  const ctx: GroupCtx = props
  const N = g.N
  return (
    <div className="cellwrap">
    <svg viewBox={`0 0 ${g.W} ${g.H}`} className={`cell ${props.focus ? 'focus' : ''} ${props.className ?? ''}`} role="img" aria-label={props.title ?? 'Plant cell'}>
      <Group id="stena" p={ctx}>
        <rect x={20} y={20} width={720} height={520} rx={48} fill="var(--o-stena-f)" stroke="var(--o-stena)" strokeWidth={3} />
        <rect x={34} y={34} width={692} height={492} rx={38} fill="none" stroke="var(--o-stena)" strokeWidth={1.2} opacity={0.6} />
        <g stroke="var(--o-stena)" strokeWidth={1.3} opacity={0.55} clipPath="url(#wallclip)">{g.fibers.map((d, i) => <path key={i} d={d} />)}</g>
      </Group>
      <defs>
        <clipPath id="wallclip"><path d="M20,68A48,48 0 0 1 68,20H692A48,48 0 0 1 740,68V492A48,48 0 0 1 692,540H68A48,48 0 0 1 20,492ZM44,76V484A32,32 0 0 0 76,516H684A32,32 0 0 0 716,484V76A32,32 0 0 0 684,44H76A32,32 0 0 0 44,76Z" clipRule="evenodd" /></clipPath>
      </defs>
      <Group id="citoplazma" p={ctx}>
        <rect x={44} y={44} width={672} height={472} rx={32} fill="var(--o-cyto)" />
      </Group>
      <Group id="membrana" p={ctx}>
        <rect x={44} y={44} width={672} height={472} rx={32} fill="none" stroke="transparent" strokeWidth={16} />
        <rect x={44} y={44} width={672} height={472} rx={32} fill="none" stroke="var(--o-mem)" strokeWidth={4} />
        <rect x={44} y={44} width={672} height={472} rx={32} fill="none" stroke="var(--o-cyto)" strokeWidth={1.2} />
      </Group>
      <Group id="citoskelet" p={ctx}>
        <g stroke="var(--o-cito)" strokeWidth={1.6} strokeLinecap="round" opacity={0.8}>
          {[[612, 510, 700, 430, 1], [64, 250, 64, 380, 0], [560, 60, 690, 110, 1], [170, 500, 60, 470, 0]].map(([a, b, c, d, dash], i) => (
            <g key={i}><line x1={a} y1={b} x2={c} y2={d} stroke="transparent" strokeWidth={16} /><line x1={a} y1={b} x2={c} y2={d} strokeDasharray={dash ? '7 4' : undefined} /></g>
          ))}
        </g>
      </Group>
      <Group id="vakuola" p={ctx}>
        <path d={g.vacD} fill="var(--o-vak-f)" stroke="var(--o-vak)" strokeWidth={3} />
      </Group>
      <Group id="zrnatiER" p={ctx}>
        {g.er.map((e, i) => <Cisterna key={i} d={arcPath(N.x, N.y, e.r, e.a0, e.a1)} c="var(--o-zer)" f="var(--o-zer-f)" />)}
        <Ribos pts={g.erRibo} r={2} />
      </Group>
      <Group id="gladkiER" p={ctx}>
        {g.smooth.map((pts, i) => <Cisterna key={i} d={smoothOpen(pts)} c="var(--o-ger)" f="var(--o-ger-f)" w={10} />)}
      </Group>
      <Group id="jedro" p={ctx}>
        <Nucleus x={N.x} y={N.y} r={N.r} nx={160} ny={168} nr={15} seed={9} pores={[30, 100, 170, 240, 305]} riboFrom={-80} riboTo={110} />
      </Group>
      <Group id="jedrce" p={ctx}>
        <ellipse cx={160} cy={168} rx={16} ry={13} fill="var(--o-jedrce)" />
      </Group>
      <Group id="golgi" p={ctx}>
        <Golgi cx={148} cy={320} radii={[36, 46, 56, 66]} spans={[34, 36, 34, 28]} dir={-1} />
        {[[72, 290], [70, 350], [84, 372]].map(([x, y], i) => <Vesicle key={i} x={x} y={y} r={5} cls={`ves v${i}`} />)}
      </Group>
      <Group id="kloroplast" p={ctx}>
        <Chloro x={300} y={88} rot={-4} seed={1} />
        <Chloro x={500} y={82} rot={6} seed={2} />
        <Chloro x={668} y={170} rot={84} seed={3} />
        <Chloro x={672} y={380} rot={-82} seed={4} />
        <Chloro x={520} y={492} rot={4} seed={5} />
        <Chloro x={300} y={498} rot={-6} seed={6} />
      </Group>
      <Group id="mitohondrij" p={ctx}>
        <Mito x={402} y={82} rot={4} w={62} h={28} folds={4} />
        <Mito x={410} y={500} rot={-6} w={62} h={28} folds={4} />
        <Mito x={690} y={280} rot={90} w={58} h={26} folds={3} />
      </Group>
      <Group id="skrobna" p={ctx}>
        <Starch x={600} y={84} rx={13} ry={10} rot={20} />
        <Starch x={224} y={476} rx={12} ry={9} rot={-15} />
        <Starch x={640} y={466} rx={11} ry={9} rot={30} />
      </Group>
      <Group id="ribosomi" p={ctx}>
        <Ribos pts={[...g.free, ...g.cluster]} r={2.6} hit={9} />
        <circle cx={252} cy={421} r={22} fill="transparent" />
      </Group>
      <Marker kind="plant" id={props.mark} tone="mark" />
      <Marker kind="plant" id={props.good} tone="good" />
      <Marker kind="plant" id={props.bad} tone="bad" />
          </svg>
      <Labels kind="plant" show={props.labels} hide={props.hideLabelsOf} focus={props.focus} />
    </div>
  )
})

/* ───────────── prokaryotic cell ───────────── */

export function ProkInner(props: CellProps) {
  const g = prokGeom
  const ctx: GroupCtx = props
  return (
    <>
      <g transform="translate(380,210)">
        <Group id="stena" p={ctx}>
          <path d={capsule(612, 262)} fill="var(--o-prokw-f)" stroke="var(--o-prokw)" strokeWidth={3} />
          <path d={capsule(588, 238)} fill="none" stroke="var(--o-prokw)" strokeWidth={1.2} opacity={0.6} />
        </Group>
        <Group id="citoplazma" p={ctx}>
          <path d={capsule(572, 222)} fill="var(--o-cyto)" />
        </Group>
        <Group id="membrana" p={ctx}>
          <path d={capsule(572, 222)} fill="none" stroke="transparent" strokeWidth={16} />
          <path d={capsule(572, 222)} fill="none" stroke="var(--o-mem)" strokeWidth={3.5} />
          <path d={capsule(564, 214)} fill="none" stroke="var(--o-mem)" strokeWidth={1} opacity={0.45} />
        </Group>
      </g>
      <Group id="ribosomi" p={ctx}>
        <Ribos pts={g.ribo} r={2.6} hit={9} />
      </Group>
      <Group id="dnk" p={ctx}>
        <path d={g.dna} fill="none" stroke="transparent" strokeWidth={14} />
        <path d={g.dna} fill="none" stroke="var(--o-jedro)" strokeWidth={3.2} strokeLinejoin="round" strokeLinecap="round" />
      </Group>
    </>
  )
}

export const ProkCell = memo(function ProkCell(props: CellProps) {
  const g = prokGeom
  return (
    <div className="cellwrap">
    <svg viewBox={`0 0 ${g.W} ${g.H}`} className={`cell ${props.focus ? 'focus' : ''} ${props.className ?? ''}`} role="img" aria-label={props.title ?? 'Prokaryotic cell'}>
      <ProkInner {...props} />
      <Marker kind="prok" id={props.mark} tone="mark" />
      <Marker kind="prok" id={props.good} tone="good" />
      <Marker kind="prok" id={props.bad} tone="bad" />
    </svg>
      <Labels kind="prok" show={props.labels} hide={props.hideLabelsOf} focus={props.focus} />
    </div>
  )
})

export function CellView(props: CellProps) {
  if (props.kind === 'plant') return <PlantCell {...props} />
  if (props.kind === 'prok') return <ProkCell {...props} />
  return <AnimalCell {...props} />
}

export const PARTS_ON: Record<CellKind, PartId[]> = {
  animal: Object.keys(ANCHOR.animal) as PartId[],
  plant: Object.keys(ANCHOR.plant) as PartId[],
  prok: Object.keys(ANCHOR.prok) as PartId[],
}
