import { memo, useRef, type ReactNode } from 'react'
import { useInView } from 'motion/react'
import type { DetailId } from '../data/organelles'
import { capsule, cristae, smoothClosed, smoothOpen, squiggle, rng, deg, arcPath, type P } from './geo'
import { ProkInner, ANCHOR } from './Cells'

export interface Part { id: string; label: string; x: number; y: number; lx: number; ly: number }
export interface Detail { id: DetailId; title: string; caption: string; vb: [number, number]; ox?: number; parts: Part[]; art: () => ReactNode }

/* ───────────── risbe ───────────── */

function MitoArt() {
  const w = 400, h = 190, R = rng(3)
  const ribo: P[] = []
  ;[-81, -49, 16, 49, 81].forEach(x => { for (let k = 0; k < 3; k++) ribo.push([x + (R() - 0.5) * 8, -50 + k * 45 + (R() - 0.5) * 14]) })
  return (
    <g transform="translate(240,140)">
      <path d={capsule(w, h)} fill="var(--o-mito-f)" stroke="var(--o-mito)" strokeWidth={4} />
      <path d={cristae(w - 22, h - 22, 7, 0.6)} fill="var(--o-mito-m)" stroke="var(--o-mito)" strokeWidth={3} strokeLinejoin="round" />
      <path d={smoothClosed([[71, 0], [80, -9], [92, -6], [91, 8], [80, 11], [72, 7]])} fill="none" stroke="var(--o-jedro)" strokeWidth={2} transform="translate(0,-10)" />
      <path d={smoothClosed([[-24, 10], [-15, 2], [-6, 6], [-7, 18], [-18, 21]])} fill="none" stroke="var(--o-jedro)" strokeWidth={2} />
      {ribo.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="var(--o-ribo)" />)}
    </g>
  )
}

function ChloroArt() {
  const stacks: [number, number][] = [[118, 136], [182, 156], [248, 126], [314, 152], [372, 132]]
  const R = rng(8)
  return (
    <g>
      <ellipse cx={240} cy={140} rx={205} ry={105} fill="var(--o-kloro-f)" stroke="var(--o-kloro)" strokeWidth={4} />
      <ellipse cx={240} cy={140} rx={192} ry={92} fill="var(--o-kloro-s)" stroke="var(--o-kloro)" strokeWidth={2.5} />
      <g stroke="var(--o-kloro)" strokeWidth={3} fill="none" strokeLinecap="round">
        {stacks.slice(0, -1).map(([x, y], i) => {
          const [x2, y2] = stacks[i + 1]
          return <path key={i} d={`M${x + 17},${y + 6}C${x + 40},${y + 6} ${x2 - 40},${y2 - 4} ${x2 - 17},${y2 - 4}`} />
        })}
        <path d="M101,140C80,142 66,150 58,160" /><path d="M389,128C410,122 420,118 428,112" />
      </g>
      {stacks.map(([x, y], i) => {
        const n = 6 + (i % 2)
        const top = y - (n * 8.6) / 2
        return (
          <g key={i}>
            {Array.from({ length: n }, (_, k) => (
              <rect key={k} x={x - 18} y={top + k * 8.6} width={36} height={7} rx={3.5} fill="var(--o-kloro)" stroke="var(--o-kloro-d)" strokeWidth={1} />
            ))}
          </g>
        )
      })}
      <path d={smoothClosed([[196, 204], [210, 196], [224, 202], [222, 216], [206, 220]])} fill="none" stroke="var(--o-jedro)" strokeWidth={2} />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={90 + R() * 300} cy={i % 2 ? 196 + R() * 14 : 82 + R() * 12} r={2.8} fill="var(--o-ribo)" />)}
    </g>
  )
}

function NucleusArt() {
  const cx = 240, cy = 150, r = 115
  const pores = [20, 65, 115, 160, 205, 250, 300, 340]
  const ribo: P[] = []
  for (let a = 0; a < 360; a += 7) if (!pores.some(p => Math.abs(((a - p + 540) % 360) - 180) < 6)) ribo.push([cx + Math.cos(deg(a)) * (r + 7), cy + Math.sin(deg(a)) * (r + 7)])
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="var(--o-jedro-e)" stroke="var(--o-jedro)" strokeWidth={4} />
      <circle cx={cx} cy={cy} r={r - 12} fill="var(--o-jedro-f)" stroke="var(--o-jedro)" strokeWidth={3} />
      {pores.map(a => {
        const c = Math.cos(deg(a)), s = Math.sin(deg(a))
        return (
          <g key={a}>
            <line x1={cx + c * (r - 15)} y1={cy + s * (r - 15)} x2={cx + c * (r + 3)} y2={cy + s * (r + 3)} stroke="var(--o-jedro-f)" strokeWidth={9} />
            <line x1={cx + c * (r - 15) - s * 6} y1={cy + s * (r - 15) + c * 6} x2={cx + c * (r + 3) - s * 6} y2={cy + s * (r + 3) + c * 6} stroke="var(--o-jedro)" strokeWidth={2} />
            <line x1={cx + c * (r - 15) + s * 6} y1={cy + s * (r - 15) - c * 6} x2={cx + c * (r + 3) + s * 6} y2={cy + s * (r + 3) - c * 6} stroke="var(--o-jedro)" strokeWidth={2} />
          </g>
        )
      })}
      <g fill="none" stroke="var(--o-jedro)" strokeWidth={2} opacity={0.55} strokeLinecap="round">
        {[0, 1, 2, 3].map(i => <path key={i} d={squiggle(40 + i, 214 + (i % 2) * 14, 168, 66, 6)} />)}
      </g>
      <ellipse cx={272} cy={124} rx={30} ry={25} fill="var(--o-jedrce)" />
      {ribo.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="var(--o-ribo)" />)}
    </g>
  )
}

function ERArt() {
  const bands = [62, 100, 138, 176]
  const wave = (y: number, x0: number, x1: number) => smoothOpen([[x0, y], [x0 + 50, y - 6], [x0 + 100, y + 5], [x0 + 150, y - 4], [x1, y + 2]])
  const tubes: P[][] = [
    [[270, 70], [310, 92], [352, 76], [396, 100], [440, 84]], [[280, 150], [322, 132], [362, 156], [404, 140], [446, 162]],
    [[300, 210], [340, 192], [384, 214], [430, 196]], [[310, 92], [318, 132], [322, 132]], [[396, 100], [402, 140], [404, 140]], [[362, 156], [370, 190], [384, 214]],
  ]
  return (
    <g>
      {bands.map((y, i) => (
        <g key={i}>
          <path d={wave(y, 30, 236)} fill="none" stroke="var(--o-zer)" strokeWidth={22} strokeLinecap="round" />
          <path d={wave(y, 30, 236)} fill="none" stroke="var(--o-zer-f)" strokeWidth={12} strokeLinecap="round" />
          {Array.from({ length: 19 }, (_, k) => {
            const x = 36 + k * 11
            const yy = y + Math.sin(k * 0.9) * 3
            return <g key={k}><circle cx={x} cy={yy - 13.5} r={3.2} fill="var(--o-ribo)" /><circle cx={x + 5} cy={yy + 13.5} r={3.2} fill="var(--o-ribo)" /></g>
          })}
        </g>
      ))}
      {tubes.map((t, i) => (
        <g key={i}>
          <path d={smoothOpen(t)} fill="none" stroke="var(--o-ger)" strokeWidth={18} strokeLinecap="round" />
          <path d={smoothOpen(t)} fill="none" stroke="var(--o-ger-f)" strokeWidth={9} strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

function GolgiArt() {
  const cx = 110, cy = 140
  const radii = [86, 106, 126, 146, 166]
  const spans = [34, 36, 37, 35, 30]
  const ves: [number, number, number][] = [[cx + 172 * Math.cos(deg(-36)), cy + 172 * Math.sin(deg(-36)), 9], [cx + 150 * Math.cos(deg(-40)), cy + 150 * Math.sin(deg(-40)), 8], [cx + 175 * Math.cos(deg(33)), cy + 175 * Math.sin(deg(33)), 9], [330, 70, 10], [360, 120, 9], [345, 205, 10], [390, 165, 8]]
  return (
    <g>
      {radii.map((r, i) => (
        <g key={i}>
          <path d={arcPath(cx, cy, r, -spans[i], spans[i])} fill="none" stroke="var(--o-golgi)" strokeWidth={16} strokeLinecap="round" />
          <path d={arcPath(cx, cy, r, -spans[i], spans[i])} fill="none" stroke="var(--o-golgi-f)" strokeWidth={7} strokeLinecap="round" />
        </g>
      ))}
      {ves.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="var(--o-golgi-f)" stroke="var(--o-golgi)" strokeWidth={3} className={i > 2 ? `ves v${i}` : ''} />)}
      <g stroke="var(--ink-3)" strokeWidth={1.6} fill="none" strokeDasharray="3 5"><path d="M300,110C320,100 338,96 350,96" /><path d="M300,180C325,190 340,200 350,204" /></g>
    </g>
  )
}

function MembraneArt() {
  const xs: number[] = []
  for (let x = 24; x <= 444; x += 17) xs.push(x)
  const prot = [150, 330]
  const isProt = (x: number) => prot.some(p => Math.abs(x - p) < 26)
  return (
    <g>
      <rect x={0} y={0} width={480} height={86} fill="var(--o-vak-f)" opacity={0.5} />
      <rect x={0} y={214} width={480} height={86} fill="var(--o-cyto)" />
      <text x={16} y={40} className="dt-cap">zunanjost celice</text>
      <text x={16} y={290} className="dt-cap">citoplazma</text>
      {xs.filter(x => !isProt(x)).map(x => (
        <g key={x}>
          <path d={`M${x - 3},${117}L${x - 4},${146}M${x + 3},${117}L${x + 4},${146}`} stroke="var(--o-mem-t)" strokeWidth={2.4} strokeLinecap="round" />
          <path d={`M${x - 3},${183}L${x - 4},${154}M${x + 3},${183}L${x + 4},${154}`} stroke="var(--o-mem-t)" strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={x} cy={110} r={7.5} fill="var(--o-mem-h)" stroke="var(--o-mem)" strokeWidth={1.4} />
          <circle cx={x} cy={190} r={7.5} fill="var(--o-mem-h)" stroke="var(--o-mem)" strokeWidth={1.4} />
        </g>
      ))}
      {prot.map((x, i) => <path key={i} d={smoothClosed([[x - 18, 92], [x + 6, 84], [x + 22, 104], [x + 20, 150], [x + 24, 196], [x + 4, 216], [x - 20, 206], [x - 22, 150]])} fill="var(--o-prot)" stroke="var(--o-prot-d)" strokeWidth={2} />)}
      <path d={smoothClosed([[236, 96], [252, 80], [272, 84], [276, 98], [256, 104]])} fill="var(--o-prot)" stroke="var(--o-prot-d)" strokeWidth={2} />
      <path d="M458,103H466V197H458" fill="none" stroke="var(--ink-3)" strokeWidth={2} />
    </g>
  )
}

function CytoskeletonArt() {
  const helix = (y: number, amp: number, period: number, phase: number) => {
    const pts: P[] = []
    for (let x = 40; x <= 440; x += 8) pts.push([x, y + Math.sin((x / period) * 6.283 + phase) * amp])
    return smoothOpen(pts)
  }
  return (
    <g fill="none" strokeLinecap="round">
      <path d={helix(56, 5, 40, 0)} stroke="var(--o-cito-d)" strokeWidth={2.4} />
      <path d={helix(56, 5, 40, 3.14)} stroke="var(--o-cito-d)" strokeWidth={2.4} />
      {[0, 2.1, 4.2].map((p, i) => <path key={i} d={helix(128, 6, 70, p)} stroke="var(--o-cito)" strokeWidth={3.6} />)}
      <rect x={40} y={188} width={400} height={34} rx={17} fill="var(--o-cito-l)" stroke="var(--o-cito-d)" strokeWidth={2.4} />
      <rect x={52} y={198} width={376} height={14} rx={7} fill="var(--card)" stroke="var(--o-cito)" strokeWidth={1} />
      {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={56 + i * 16} cy={i % 2 ? 193 : 217} r={3.4} fill="var(--o-cito-d)" opacity={0.7} />)}
    </g>
  )
}

function RibosomeArt() {
  return (
    <g>
      <path d={smoothClosed([[160, 108], [180, 60], [240, 44], [306, 58], [326, 104], [300, 140], [240, 148], [180, 140]])} fill="var(--o-ribo-l)" stroke="var(--o-ribo)" strokeWidth={3} />
      <path d={smoothClosed([[178, 168], [206, 146], [272, 144], [302, 166], [282, 196], [212, 198]])} fill="var(--o-ribo-m)" stroke="var(--o-ribo)" strokeWidth={3} />
    </g>
  )
}

function ProkArt() {
  return <ProkInner kind="prok" />
}

function LightMicroscopeArt() {
  return (
    <g strokeLinejoin="round">
      {/* noga */}
      <path d="M70,428C70,410 90,404 120,404H250C280,404 300,412 300,430V440H70Z" fill="var(--m-body)" stroke="var(--m-edge)" strokeWidth={2.5} />
      {/* stativ */}
      <path d="M232,404C236,360 262,330 262,282C262,220 236,176 196,150L206,132C258,160 290,214 290,284C290,338 268,370 264,404Z" fill="var(--m-body)" stroke="var(--m-edge)" strokeWidth={2.5} />
      {/* vir svetlobe */}
      <ellipse cx={150} cy={392} rx={26} ry={9} fill="var(--m-metal)" stroke="var(--m-edge)" strokeWidth={2} />
      <path d="M150,382V356M136,380L124,362M164,380L176,362" stroke="var(--warn)" strokeWidth={2.5} strokeLinecap="round" />
      {/* predmetna mizica in preparat */}
      <rect x={66} y={330} width={196} height={14} rx={4} fill="var(--m-body)" stroke="var(--m-edge)" strokeWidth={2.5} />
      <rect x={104} y={322} width={92} height={8} rx={1.5} fill="var(--m-glass)" stroke="var(--m-edge)" strokeWidth={1.5} />
      <rect x={140} y={323} width={20} height={6} rx={1} fill="var(--o-lizo)" opacity={0.6} />
      {/* objektivi */}
      <rect x={140} y={252} width={20} height={56} rx={4} fill="var(--m-metal)" stroke="var(--m-edge)" strokeWidth={2} />
      <rect x={144} y={300} width={12} height={10} rx={2} fill="var(--m-edge)" />
      <rect x={106} y={250} width={16} height={40} rx={4} fill="var(--m-metal)" stroke="var(--m-edge)" strokeWidth={2} transform="rotate(16 114 250)" />
      <rect x={178} y={250} width={16} height={46} rx={4} fill="var(--m-metal)" stroke="var(--m-edge)" strokeWidth={2} transform="rotate(-16 186 250)" />
      {/* revolver */}
      <ellipse cx={150} cy={244} rx={52} ry={14} fill="var(--m-body)" stroke="var(--m-edge)" strokeWidth={2.5} />
      {/* tubus */}
      <rect x={134} y={96} width={32} height={138} rx={4} fill="var(--m-body)" stroke="var(--m-edge)" strokeWidth={2.5} />
      <path d="M166,150H200" stroke="var(--m-edge)" strokeWidth={6} strokeLinecap="round" />
      {/* okular */}
      <rect x={138} y={56} width={24} height={40} rx={3} fill="var(--m-metal)" stroke="var(--m-edge)" strokeWidth={2.5} />
      <rect x={132} y={48} width={36} height={10} rx={4} fill="var(--m-edge)" />
      {/* vijaka */}
      <circle cx={274} cy={300} r={22} fill="var(--m-metal)" stroke="var(--m-edge)" strokeWidth={2.5} />
      <circle cx={274} cy={300} r={9} fill="var(--m-body)" stroke="var(--m-edge)" strokeWidth={1.5} />
      <circle cx={276} cy={350} r={12} fill="var(--m-metal)" stroke="var(--m-edge)" strokeWidth={2.5} />
    </g>
  )
}

function TEMArt() {
  const lens = (y: number) => <g><rect x={98} y={y - 9} width={30} height={18} rx={3} fill="var(--m-edge)" /><rect x={172} y={y - 9} width={30} height={18} rx={3} fill="var(--m-edge)" /></g>
  return (
    <g>
      <rect x={92} y={40} width={116} height={392} rx={16} fill="var(--m-body)" stroke="var(--m-edge)" strokeWidth={2.5} />
      <path d="M126,52H174L166,80H134Z" fill="var(--m-metal)" stroke="var(--m-edge)" strokeWidth={2} />
      <path d="M150,82V400" stroke="var(--accent)" strokeWidth={3} strokeDasharray="4 6" />
      {lens(120)}
      <rect x={128} y={170} width={44} height={6} rx={2} fill="var(--o-lizo)" />
      {lens(214)}
      <path d="M92,250H48" stroke="var(--m-edge)" strokeWidth={6} /><path d="M58,240L44,250L58,260" fill="none" stroke="var(--m-edge)" strokeWidth={3} />
      {lens(292)}
      <rect x={236} y={344} width={36} height={22} rx={5} fill="var(--m-metal)" stroke="var(--m-edge)" strokeWidth={2} />
      <path d="M208,355H236" stroke="var(--m-edge)" strokeWidth={4} />
      <rect x={104} y={404} width={92} height={14} rx={3} fill="var(--accent)" opacity={0.75} />
    </g>
  )
}

function CiliaArt() {
  const base = (x: number) => 190 - Math.sin(x / 80) * 8
  const cil = [70, 110, 150, 190, 230, 270, 310]
  return (
    <g>
      <rect x={0} y={150} width={480} height={90} fill="var(--o-cyto)" />
      <path d={smoothOpen(Array.from({ length: 13 }, (_, i) => [i * 40, base(i * 40)] as P))} fill="none" stroke="var(--o-mem)" strokeWidth={5} />
      {cil.map((x, i) => {
        const y0 = base(x)
        const d = smoothOpen([[x, y0], [x + 10, y0 - 40], [x - 6, y0 - 85], [x + 14, y0 - 128]])
        return <g key={i}><path d={d} fill="none" stroke="var(--o-mig)" strokeWidth={9} strokeLinecap="round" className="cilium" style={{ animationDelay: `${i * -0.2}s` }} /><path d={d} fill="none" stroke="var(--o-cyto)" strokeWidth={3} strokeLinecap="round" opacity={0.7} /></g>
      })}
      <path d={smoothOpen([[380, base(380)], [400, 150], [384, 110], [410, 70], [396, 34], [424, 8]])} fill="none" stroke="var(--o-mig)" strokeWidth={9} strokeLinecap="round" />
      <path d={smoothOpen([[380, base(380)], [400, 150], [384, 110], [410, 70], [396, 34], [424, 8]])} fill="none" stroke="var(--o-cyto)" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
    </g>
  )
}

function WallArt() {
  const layers = [0, 1, 2]
  return (
    <g>
      <rect x={0} y={0} width={480} height={60} fill="var(--card-2)" />
      {layers.map(l => (
        <g key={l} clipPath={`url(#wl${l})`}>
          <defs><clipPath id={`wl${l}`}><rect x={0} y={60 + l * 30} width={480} height={30} /></clipPath></defs>
          <rect x={0} y={60 + l * 30} width={480} height={30} fill="var(--o-stena-f)" />
          {Array.from({ length: 40 }, (_, i) => {
            const x = i * 16 - 60
            const a = [24, -24, 8][l]
            return <line key={i} x1={x} y1={60 + l * 30} x2={x + Math.tan(deg(a)) * 30 + (l === 2 ? 0 : 0)} y2={90 + l * 30} stroke="var(--o-stena)" strokeWidth={3} strokeLinecap="round" />
          })}
        </g>
      ))}
      <rect x={0} y={150} width={480} height={7} fill="var(--o-mem)" />
      <rect x={0} y={157} width={480} height={83} fill="var(--o-cyto)" />
    </g>
  )
}

function LysoArt() {
  const R = rng(13)
  return (
    <g>
      <circle cx={240} cy={130} r={92} fill="var(--o-lizo-f)" stroke="var(--o-lizo)" strokeWidth={5} />
      {Array.from({ length: 22 }, (_, i) => {
        const a = R() * 6.283, d = Math.sqrt(R()) * 70
        return <path key={i} d={`M0,-5L5,4L-5,4Z`} transform={`translate(${240 + Math.cos(a) * d},${130 + Math.sin(a) * d}) rotate(${R() * 360})`} fill="var(--o-lizo)" />
      })}
    </g>
  )
}

function VacuoleArt() {
  return (
    <g>
      <rect x={40} y={20} width={400} height={240} rx={26} fill="var(--o-stena-f)" stroke="var(--o-stena)" strokeWidth={3} />
      <rect x={52} y={32} width={376} height={216} rx={18} fill="var(--o-cyto)" stroke="var(--o-mem)" strokeWidth={3} />
      <path d={smoothClosed([[120, 70], [240, 52], [380, 70], [400, 140], [372, 214], [240, 228], [110, 212], [92, 140]])} fill="var(--o-vak-f)" stroke="var(--o-vak)" strokeWidth={4} />
      <circle cx={76} cy={64} r={18} fill="var(--o-jedro-f)" stroke="var(--o-jedro)" strokeWidth={2.5} />
      <ellipse cx={410} cy={230} rx={14} ry={7} fill="var(--o-kloro-f)" stroke="var(--o-kloro)" strokeWidth={2} />
    </g>
  )
}

function CentriolesArt() {
  const ring = (cx: number, cy: number) => (
    <g>
      <circle cx={cx} cy={cy} r={50} fill="var(--o-centri-f)" stroke="var(--o-centri)" strokeWidth={2} opacity={0.6} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * 6.283
        return <g key={i} transform={`translate(${cx + Math.cos(a) * 38},${cy + Math.sin(a) * 38}) rotate(${(a * 180) / Math.PI + 70})`}>{[-9, 0, 9].map(o => <circle key={o} cx={o} cy={0} r={4.6} fill="var(--o-centri)" />)}</g>
      })}
    </g>
  )
  return (
    <g>
      {ring(150, 130)}
      <g transform="translate(330,130)">
        <rect x={-34} y={-70} width={68} height={140} rx={8} fill="var(--o-centri-f)" stroke="var(--o-centri)" strokeWidth={2.5} />
        {[-20, -7, 7, 20].map(x => <line key={x} x1={x} x2={x} y1={-62} y2={62} stroke="var(--o-centri)" strokeWidth={3} />)}
      </g>
    </g>
  )
}

/* ───────────── register ───────────── */

export const DETAILS: Record<DetailId, Detail> = {
  mitohondrij: {
    id: 'mitohondrij', title: 'Mitohondrij', caption: 'Celično dihanje: nastanek ATP (energija).', vb: [480, 280], art: MitoArt,
    parts: [
      { id: 'zm', label: 'zunanja membrana', x: 240, y: 46, lx: 200, ly: 20 },
      { id: 'nm', label: 'notranja nagubana membrana', x: 208, y: 102, lx: 200, ly: 266 },
      { id: 'mx', label: 'matriks', x: 159, y: 172, lx: 40, ly: 244 },
      { id: 'dnk', label: 'krožna DNK', x: 322, y: 131, lx: 420, ly: 22 },
      { id: 'rb', label: 'ribosomi', x: 289, y: 180, lx: 430, ly: 262 },
    ],
  },
  kloroplast: {
    id: 'kloroplast', title: 'Kloroplast', caption: 'Plastid, v katerem poteka fotosinteza.', vb: [480, 280], art: ChloroArt,
    parts: [
      { id: 'zm', label: 'zunanja membrana', x: 240, y: 36, lx: 100, ly: 16 },
      { id: 'nm', label: 'notranja membrana', x: 330, y: 53, lx: 400, ly: 16 },
      { id: 'st', label: 'stroma', x: 150, y: 196, lx: 60, ly: 262 },
      { id: 'tl', label: 'tilakoida', x: 266, y: 104, lx: 260, ly: 16 },
      { id: 'gr', label: 'granum', x: 314, y: 152, lx: 440, ly: 140 },
      { id: 'dnk', label: 'kloroplastna DNK', x: 210, y: 210, lx: 230, ly: 268 },
      { id: 'rb', label: 'ribosomi', x: 372, y: 200, lx: 410, ly: 262 },
    ],
  },
  jedro: {
    id: 'jedro', title: 'Jedro', caption: 'Večina DNK, dedni zapis za beljakovine.', vb: [480, 300], art: NucleusArt,
    parts: [
      { id: 'ov', label: 'jedrni ovoj (dve membrani)', x: 138, y: 113, lx: 80, ly: 30 },
      { id: 'po', label: 'jedrna pora', x: 295, y: 56, lx: 400, ly: 26 },
      { id: 'kr', label: 'kromatin', x: 205, y: 196, lx: 80, ly: 280 },
      { id: 'jc', label: 'jedrce', x: 272, y: 124, lx: 420, ly: 130 },
      { id: 'rb', label: 'ribosomi na ovoju', x: 135, y: 210, lx: 56, ly: 236 },
    ],
  },
  er: {
    id: 'er', title: 'Endoplazemski retikulum', caption: 'Splet membranskih prostorov: zrnati in gladki ER.', vb: [480, 260], art: ERArt,
    parts: [
      { id: 'zer', label: 'zrnati ER', x: 132, y: 100, lx: 132, ly: 16 },
      { id: 'rb', label: 'ribosomi', x: 80, y: 162, lx: 40, ly: 236 },
      { id: 'cis', label: 'cisterna', x: 190, y: 176, lx: 200, ly: 236 },
      { id: 'ger', label: 'gladki ER', x: 362, y: 156, lx: 370, ly: 246 },
    ],
  },
  golgi: {
    id: 'golgi', title: 'Golgijev aparat', caption: 'Pripravi produkte za izločanje in membrane za obnovo.', vb: [480, 280], art: GolgiArt,
    parts: [
      { id: 'cis', label: 'sploščene cisterne', x: 236, y: 140, lx: 110, ly: 268 },
      { id: 'ves', label: 'mehurček (vezikel)', x: 360, y: 120, lx: 420, ly: 40 },
    ],
  },
  membrana: {
    id: 'membrana', title: 'Model tekočega mozaika', caption: 'Dvosloj fosfolipidov s plavajočimi proteini.', vb: [480, 300], art: MembraneArt,
    parts: [
      { id: 'dv', label: 'dvosloj fosfolipidov', x: 466, y: 150, lx: 380, ly: 246 },
      { id: 'gl', label: 'glava fosfolipida', x: 92, y: 110, lx: 150, ly: 46 },
      { id: 'rp', label: 'hidrofobni rep', x: 77, y: 140, lx: 120, ly: 246 },
      { id: 'pr', label: 'protein', x: 330, y: 150, lx: 360, ly: 46 },
    ],
  },
  citoskelet: {
    id: 'citoskelet', title: 'Celično ogrodje', caption: 'Preplet beljakovinskih nitk in cevk.', vb: [480, 250], art: CytoskeletonArt,
    parts: [
      { id: 'mf', label: 'mikrofilamenti', x: 300, y: 56, lx: 300, ly: 22 },
      { id: 'if', label: 'intermediarni filamenti', x: 240, y: 128, lx: 240, ly: 94 },
      { id: 'mt', label: 'mikrotubuli', x: 200, y: 205, lx: 200, ly: 242 },
    ],
  },
  ribosom: {
    id: 'ribosom', title: 'Ribosom', caption: 'Iz RNK in beljakovin, dve podenoti.', vb: [480, 220], art: RibosomeArt,
    parts: [
      { id: 'vp', label: 'večja podenota', x: 240, y: 96, lx: 400, ly: 70 },
      { id: 'mp', label: 'manjša podenota', x: 240, y: 172, lx: 400, ly: 190 },
    ],
  },
  prokariont: {
    id: 'prokariont', title: 'Prokariontska celica', caption: 'Brez jedra in membranskih organelov.', vb: [760, 420], art: ProkArt,
    parts: [
      { id: 'stena', label: 'celična stena', x: ANCHOR.prok.stena![0], y: ANCHOR.prok.stena![1], lx: 380, ly: 40 },
      { id: 'membrana', label: 'celična membrana', x: ANCHOR.prok.membrana![0], y: ANCHOR.prok.membrana![1], lx: 640, ly: 50 },
      { id: 'citoplazma', label: 'citoplazma', x: ANCHOR.prok.citoplazma![0], y: ANCHOR.prok.citoplazma![1], lx: 140, ly: 380 },
      { id: 'dnk', label: 'krožna DNK', x: ANCHOR.prok.dnk![0], y: ANCHOR.prok.dnk![1], lx: 130, ly: 40 },
      { id: 'ribosomi', label: 'ribosomi (manjši)', x: ANCHOR.prok.ribosomi![0], y: ANCHOR.prok.ribosomi![1], lx: 600, ly: 385 },
    ],
  },
  svetlobni: {
    id: 'svetlobni', title: 'Svetlobni mikroskop', caption: 'Skupna povečava = okular × objektiv.', vb: [480, 460], ox: 20, art: LightMicroscopeArt,
    parts: [
      { id: 'ok', label: 'okular', x: 150, y: 70, lx: 40, ly: 64 },
      { id: 'tu', label: 'tubus', x: 150, y: 170, lx: 40, ly: 150 },
      { id: 're', label: 'revolver', x: 104, y: 244, lx: 30, ly: 200 },
      { id: 'ob', label: 'objektiv', x: 150, y: 285, lx: 30, ly: 262 },
      { id: 'pm', label: 'predmetna mizica', x: 80, y: 337, lx: 40, ly: 322 },
      { id: 'pr', label: 'preparat', x: 186, y: 326, lx: 200, ly: 300 },
      { id: 'st', label: 'stativ', x: 276, y: 230, lx: 400, ly: 196 },
      { id: 'mak', label: 'makrometrski vijak', x: 274, y: 300, lx: 400, ly: 286 },
      { id: 'mik', label: 'mikrometrski vijak', x: 276, y: 350, lx: 400, ly: 340 },
      { id: 'vs', label: 'vir svetlobe', x: 150, y: 392, lx: 40, ly: 400 },
      { id: 'no', label: 'noga', x: 200, y: 428, lx: 400, ly: 440 },
    ],
  },
  tem: {
    id: 'tem', title: 'Transmisijski elektronski mikroskop (TEM)', caption: 'Elektroni prodirajo skozi preparat.', vb: [480, 460], ox: 90, art: TEMArt,
    parts: [
      { id: 'ep', label: 'elektronska puška', x: 150, y: 64, lx: 300, ly: 36 },
      { id: 'lk', label: 'leče kondenzorja', x: 113, y: 120, lx: 10, ly: 96 },
      { id: 'vz', label: 'vzorec', x: 172, y: 173, lx: 300, ly: 160 },
      { id: 'lo', label: 'leče objektiva', x: 187, y: 214, lx: 300, ly: 214 },
      { id: 'vc', label: 'vakuumska črpalka', x: 52, y: 250, lx: 10, ly: 300 },
      { id: 'lp', label: 'leče projektorja', x: 187, y: 292, lx: 300, ly: 280 },
      { id: 'ok', label: 'okular', x: 254, y: 355, lx: 300, ly: 400 },
      { id: 'za', label: 'zaslon ali kamera', x: 150, y: 411, lx: 60, ly: 448 },
    ],
  },
  migetalke: {
    id: 'migetalke', title: 'Migetalke in bički', caption: 'Iz mikrotubulov, zasidrani v membrani.', vb: [480, 240], art: CiliaArt,
    parts: [
      { id: 'mg', label: 'migetalke', x: 154, y: 100, lx: 60, ly: 30 },
      { id: 'bi', label: 'biček', x: 404, y: 60, lx: 450, ly: 120 },
      { id: 'cm', label: 'celična membrana', x: 250, y: 196, lx: 120, ly: 228 },
    ],
  },
  stena: {
    id: 'stena', title: 'Celična stena', caption: 'Več plasti celuloze zunaj celične membrane.', vb: [480, 240], art: WallArt,
    parts: [
      { id: 'cs', label: 'celična stena (celuloza)', x: 240, y: 104, lx: 240, ly: 30 },
      { id: 'cm', label: 'celična membrana', x: 120, y: 153, lx: 120, ly: 200 },
      { id: 'ct', label: 'citoplazma', x: 360, y: 200, lx: 380, ly: 226 },
    ],
  },
  lizosom: { id: 'lizosom', title: 'Lizosom', caption: 'Prebavni encimi za razgradnjo snovi.', vb: [480, 260], art: LysoArt, parts: [{ id: 'en', label: 'prebavni encimi', x: 240, y: 130, lx: 400, ly: 40 }, { id: 'mb', label: 'membrana', x: 316, y: 78, lx: 400, ly: 230 }] },
  vakuola: { id: 'vakuola', title: 'Vakuola v rastlinski celici', caption: 'Ena velika: voda, snovi, opora.', vb: [480, 280], art: VacuoleArt, parts: [{ id: 'vk', label: 'vakuola', x: 240, y: 140, lx: 240, ly: 274 }] },
  centrioli: { id: 'centrioli', title: 'Centrioli', caption: 'V bližini jedra, sodelujejo pri delitvi.', vb: [480, 260], art: CentriolesArt, parts: [{ id: 'pr', label: 'prečni prerez', x: 150, y: 130, lx: 150, ly: 246 }, { id: 'vz', label: 'vzdolžni prerez', x: 330, y: 130, lx: 330, ly: 246 }] },
}

export interface DetailViewProps {
  id: DetailId
  mode?: 'study' | 'pins' | 'clean'
  placed?: Record<string, string | undefined> // partId -> label besedilo
  status?: Record<string, 'good' | 'bad' | undefined>
  active?: string | null
  onPin?: (partId: string) => void
}

export const DetailView = memo(function DetailView({ id, mode = 'study', placed, status, active, onPin }: DetailViewProps) {
  const d = DETAILS[id]
  const [W, H] = d.vb
  const ox = d.ox ?? 0
  const k = W / 480
  // razlaga se odvije, ko pride v pogled: slika se pojavi, nato se oznake zaporedoma narišejo
  const ref = useRef<SVGSVGElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className={`detail mode-${mode} ${mode === 'study' ? 'anim' : ''} ${seen ? 'in' : ''}`} role="img" aria-label={d.title}>
      <g transform={ox ? `translate(${ox},0)` : undefined}><g className="a-art"><g className="breathe">{d.art()}</g></g></g>
      {mode === 'study' && d.parts.map((p, i) => {
        const px = p.x + ox, lxRaw = p.lx + ox
        const tw = (p.label.length * 7.7 + 6) * k
        const lx = Math.max(tw / 2 + 4, Math.min(W - tw / 2 - 4, lxRaw))
        const above = p.ly < p.y
        return (
          <g key={p.id} className="lead" style={{ ['--i' as string]: i, ['--len' as string]: Math.ceil(Math.hypot(lx - px, p.ly - p.y)) + 2 }}>
            <line x1={px} y1={p.y} x2={lx} y2={p.ly} />
            <circle cx={px} cy={p.y} r={4 * k} />
            <text x={lx} y={p.ly} dy={above ? -6 * k : 15 * k} textAnchor="middle" style={k !== 1 ? { fontSize: 14 * k, strokeWidth: 4 * k } : undefined}>{p.label}</text>
          </g>
        )
      })}
      {mode === 'pins' && d.parts.map((p, i) => {
        const st = status?.[p.id]
        const txt = placed?.[p.id]
        return (
          <g key={p.id} className={`pin ${st ?? ''} ${active === p.id ? 'active' : ''} ${txt ? 'filled' : ''}`} transform={`translate(${p.x + ox},${p.y}) scale(${k})`}
            onClick={onPin ? () => onPin(p.id) : undefined}>
            <circle r={22} className="hit" />
            <circle r={13} className="bubble" />
            <text dy={4.5} textAnchor="middle" className="num">{i + 1}</text>
          </g>
        )
      })}
    </svg>
  )
})
