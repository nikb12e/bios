/* Animated explanations of processes for the "Let's explain" card.
   Each visual is a short story in SVG: it plays by itself, and the buttons replay it or change the conditions. */
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { sfx } from '../ui/sfx'

const spring = { type: 'spring' as const, stiffness: 160, damping: 20 }

function Seg<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="xv-seg" role="tablist">
      {options.map(o => (
        <button key={o.v} role="tab" aria-selected={o.v === value} className={o.v === value ? 'on' : ''} onClick={() => { sfx('tap'); onChange(o.v) }}>{o.label}</button>
      ))}
    </div>
  )
}
function Frame({ children, controls, caption }: { children: ReactNode; controls?: ReactNode; caption?: ReactNode }) {
  return (
    <div className="xv">
      <div className="xv-art">{children}</div>
      {caption && <div className="xv-cap">{caption}</div>}
      {controls && <div className="xv-ctl">{controls}</div>}
    </div>
  )
}
// pseudo random points (stable between renders)
function pts(n: number, seed: number, x0: number, y0: number, w: number, h: number) {
  let s = seed
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  return Array.from({ length: n }, () => [x0 + r() * w, y0 + r() * h] as [number, number])
}

/* ───────── Osmosis: a plant and an animal cell in three solutions ───────── */
type Env = 'hiper' | 'izo' | 'hipo'
export function OsmosisViz({ start = 'hiper', cell: c0 = 'plant' }: { start?: Env; cell?: 'plant' | 'animal' }) {
  const [env, setEnv] = useState<Env>(start)
  const [cell, setCell] = useState<'plant' | 'animal'>(c0)
  const [k, setK] = useState(0)
  const [rep, setRep] = useState(0)
  useEffect(() => { setK(0); const t = setTimeout(() => setK(1), 500); return () => clearTimeout(t) }, [env, cell, rep])
  // the animal cell bursting repeats, so the whole process can be seen
  useEffect(() => { if (cell === 'animal' && env === 'hipo' && k === 1) { const t = setTimeout(() => setRep(r => r + 1), 4600); return () => clearTimeout(t) } }, [cell, env, k])
  const solOut = env === 'hiper' ? 26 : env === 'izo' ? 10 : 2
  const out = useMemo(() => pts(solOut, 7 + solOut, 14, 14, 332, 192).filter(([x, y]) => !(x > 92 && x < 268 && y > 36 && y < 184)), [solOut])
  const inside = useMemo(() => pts(10, 3, 130, 74, 100, 72), [])
  // size factor of the protoplast or the animal cell
  const sc = env === 'hiper' ? (cell === 'plant' ? 0.66 : 0.72) : env === 'hipo' ? (cell === 'plant' ? 1 : 1.2) : (cell === 'plant' ? 0.96 : 1)
  const burst = cell === 'animal' && env === 'hipo'
  const dir = env === 'hiper' ? -1 : env === 'hipo' ? 1 : 0
  const result = cell === 'plant'
    ? env === 'hiper' ? 'Plasmolysis: the membrane pulls away from the wall' : env === 'hipo' ? 'Turgor: the vacuole presses on the wall, the cell does not burst' : 'Balance: water moves equally both ways'
    : env === 'hiper' ? 'The cell loses water and shrivels' : env === 'hipo' ? 'The cell swells and bursts: cytolysis' : 'Balance: the shape stays the same'
  return (
    <Frame
      caption={<><b>{env === 'hiper' ? 'Hypertonic' : env === 'hipo' ? 'Hypotonic' : 'Isotonic'} solution.</b> Water moves to where there are more dissolved substances. <span className="xv-res">{result}</span></>}
      controls={<>
        <Seg value={cell} onChange={setCell} options={[{ v: 'plant', label: 'Plant' }, { v: 'animal', label: 'Animal' }]} />
        <Seg value={env} onChange={setEnv} options={[{ v: 'hiper', label: 'Salty' }, { v: 'izo', label: 'Isotonic' }, { v: 'hipo', label: 'Distilled' }]} />
      </>}>
      <svg viewBox="0 0 360 220" role="img" aria-label="Osmosis">
        <rect x="4" y="4" width="352" height="212" rx="22" fill={env === 'hiper' ? 'var(--amber-c)' : env === 'hipo' ? 'var(--sky-c)' : 'var(--fill-2)'} style={{ transition: 'fill .6s' }} />
        {out.map(([x, y], i) => <motion.circle key={'o' + solOut + i} cx={x} cy={y} r={4.2} fill="var(--amber)" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.85, scale: 1 }} transition={{ delay: i * 0.015 }} />)}
        {cell === 'plant' ? (
          <g>
            <rect x="96" y="40" width="168" height="140" rx="10" fill="var(--o-stena-f)" stroke="var(--o-stena)" strokeWidth="8" />
            <motion.g style={{ originX: 0.5, originY: 0.5 }} animate={{ scale: k ? sc : 0.96 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}>
              <rect x="104" y="48" width="152" height="124" rx="16" fill="var(--o-cyto)" stroke="var(--o-mem)" strokeWidth="2.4" />
              <rect x="122" y="64" width="116" height="92" rx="26" fill="var(--o-vak-f)" stroke="var(--o-vak)" strokeWidth="2" />
              {[[116, 60], [238, 64], [114, 158], [242, 154], [180, 54]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="7" ry="4.5" fill="var(--o-kloro)" />)}
              {inside.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.6} fill="var(--amber)" opacity={0.85} />)}
            </motion.g>
          </g>
        ) : (
          <motion.g style={{ originX: 0.5, originY: 0.5 }} animate={burst && k ? { scale: [1, 1.24, 1.3, 0], opacity: [1, 1, 1, 0] } : { scale: k ? sc : 1, opacity: 1 }} transition={{ duration: burst ? 2.6 : 1.6, times: burst ? [0, 0.6, 0.8, 1] : undefined }}>
            <path d={env === 'hiper' && k ? 'M120 110 q8 -42 30 -46 q14 10 30 -4 q16 12 30 2 q24 8 30 48 q-8 40 -32 46 q-14 -10 -28 4 q-16 -12 -30 -2 q-22 -8 -30 -48z' : 'M120 110 a60 52 0 1 0 120 0 a60 52 0 1 0 -120 0z'} fill="var(--o-mito-f)" stroke="var(--o-mem)" strokeWidth="2.6" style={{ transition: 'd 1.2s' }} />
            <circle cx="180" cy="110" r="16" fill="var(--o-jedro-f)" stroke="var(--o-jedro)" strokeWidth="2" />
            {inside.slice(0, 7).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.6} fill="var(--amber)" opacity={0.85} />)}
          </motion.g>
        )}
        <AnimatePresence>
          {burst && k === 1 && (
            <motion.g key="frag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }}>
              {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <motion.path key={i} d="M0 0 q6 -4 12 0" stroke="var(--o-mem)" strokeWidth="2.4" fill="none" initial={{ x: 180, y: 110 }} animate={{ x: 180 + Math.cos(a) * 92, y: 110 + Math.sin(a) * 70, rotate: i * 40 }} transition={{ delay: 2.1, duration: 0.9 }} /> })}
            </motion.g>
          )}
        </AnimatePresence>
        {/* water molecules moving through the membrane */}
        {dir !== 0 && k === 1 && Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + 0.3
          const rIn = 40, rOut = 104
          const from = dir > 0 ? rOut : rIn, to = dir > 0 ? rIn : rOut
          return (
            <motion.circle key={env + cell + i} r={4.4} fill="var(--sky)" stroke="#fff" strokeWidth="1.4"
              initial={{ cx: 180 + Math.cos(a) * from, cy: 110 + Math.sin(a) * from * 0.8, opacity: 0 }}
              animate={{ cx: 180 + Math.cos(a) * to, cy: 110 + Math.sin(a) * to * 0.8, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.8, delay: (i % 4) * 0.35, repeat: Infinity, repeatDelay: 0.4 }} />
          )
        })}
        {dir === 0 && k === 1 && [0, 1].map(i => (
          <motion.circle key={'eq' + i} r={4.4} fill="var(--sky)" stroke="#fff" strokeWidth="1.4" initial={{ cx: i ? 290 : 70, cy: 110 }} animate={{ cx: i ? [290, 250, 290] : [70, 110, 70] }} transition={{ duration: 2.2, repeat: Infinity }} />
        ))}
        <g fontSize="11" fontWeight="700" fill="var(--ink-2)">
          <circle cx="22" cy="200" r="4.4" fill="var(--sky)" /><text x="30" y="204">water</text>
          <circle cx="76" cy="200" r="4" fill="var(--amber)" /><text x="84" y="204">dissolved substances</text>
        </g>
      </svg>
    </Frame>
  )
}

/* ───────── Passive and active transport ───────── */
export function TransportViz({ start = 'pasivni' }: { start?: 'pasivni' | 'aktivni' }) {
  const [m, setM] = useState(start)
  const top = useMemo(() => pts(m === 'pasivni' ? 16 : 5, m === 'pasivni' ? 5 : 9, 20, 14, 320, 58), [m])
  const bot = useMemo(() => pts(m === 'pasivni' ? 4 : 15, m === 'pasivni' ? 11 : 13, 20, 152, 320, 54), [m])
  const heads = Array.from({ length: 22 }, (_, i) => 12 + i * 16)
  return (
    <Frame
      caption={m === 'pasivni'
        ? <><b>Passive transport:</b> from a higher to a lower concentration, <b>no energy needed</b>. Through the lipid bilayer, channel proteins or carrier proteins.</>
        : <><b>Active transport:</b> from a lower to a higher concentration (against the gradient), so it <b>uses energy (ATP)</b>. Membrane pumps do it.</>}
      controls={<Seg value={m} onChange={setM} options={[{ v: 'pasivni', label: 'Passive' }, { v: 'aktivni', label: 'Active' }]} />}>
      <svg viewBox="0 0 360 220" role="img" aria-label="Transport across the membrane">
        <text x="14" y="12" fontSize="10.5" fontWeight="700" fill="var(--ink-3)">{m === 'pasivni' ? 'HIGHER CONCENTRATION' : 'LOWER CONCENTRATION'}</text>
        <text x="14" y="214" fontSize="10.5" fontWeight="700" fill="var(--ink-3)">{m === 'pasivni' ? 'LOWER CONCENTRATION' : 'HIGHER CONCENTRATION'}</text>
        {/* lipid bilayer */}
        {heads.map(x => (x < 150 || x > 210) && (
          <g key={x}>
            <circle cx={x} cy={94} r={6} fill="var(--o-mem-h)" /><circle cx={x} cy={130} r={6} fill="var(--o-mem-h)" />
            <path d={`M${x - 2} 100 v10 M${x + 2} 100 v10 M${x - 2} 114 v10 M${x + 2} 114 v10`} stroke="var(--o-mem-t)" strokeWidth="1.6" />
          </g>
        ))}
        {/* protein: channel or pump */}
        <motion.rect x="152" y="84" width="56" height="56" rx="16" fill={m === 'pasivni' ? 'var(--o-prot)' : 'var(--violet-c)'} stroke={m === 'pasivni' ? 'var(--o-prot-d)' : 'var(--violet)'} strokeWidth="2.4"
          animate={m === 'aktivni' ? { scaleY: [1, 0.86, 1] } : { scaleY: 1 }} style={{ originX: 0.5, originY: 0.5 }} transition={{ duration: 1.3, repeat: Infinity }} />
        <rect x="172" y="88" width="16" height="48" rx="8" fill="var(--surface)" opacity=".8" />
        {top.map(([x, y], i) => <circle key={'t' + m + i} cx={x} cy={y} r={5} fill="var(--coral)" opacity={0.85} />)}
        {bot.map(([x, y], i) => <circle key={'b' + m + i} cx={x} cy={y} r={5} fill="var(--coral)" opacity={0.85} />)}
        {Array.from({ length: 3 }, (_, i) => (
          <motion.circle key={m + 'mv' + i} r={5.4} fill="var(--coral)" stroke="#fff" strokeWidth="1.6" cx={180}
            initial={{ cy: m === 'pasivni' ? 58 : 168, opacity: 0 }}
            animate={{ cy: m === 'pasivni' ? [58, 112, 170] : [168, 112, 56], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.1, delay: i * 0.7, repeat: Infinity, repeatDelay: 0 }} />
        ))}
        {m === 'aktivni' && (
          <motion.g animate={{ opacity: [0, 1, 0], scale: [0.6, 1.1, 0.8] }} style={{ originX: 0.5, originY: 0.5 }} transition={{ duration: 1.3, repeat: Infinity }}>
            <path d="M246 96 l-8 18 h8 l-4 16 l14 -22 h-8 l6 -12z" fill="var(--amber)" stroke="var(--on-amber)" strokeWidth="1.2" />
            <text x="264" y="117" fontSize="13" fontWeight="800" fill="var(--on-amber)">ATP</text>
          </motion.g>
        )}
        <motion.path d={m === 'pasivni' ? 'M326 40 v130' : 'M326 170 v-130'} stroke="var(--ink-2)" strokeWidth="2.4" strokeLinecap="round" markerEnd="url(#xvArr)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} key={m} transition={{ duration: 0.9 }} />
        <defs><marker id="xvArr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="var(--ink-2)" /></marker></defs>
      </svg>
    </Frame>
  )
}

/* ───────── The microscope turns the image by 180° ───────── */
export function FlipViz() {
  const [dx, setDx] = useState(0)
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 600); return () => clearTimeout(t) }, [])
  const move = (d: number) => { sfx('tap'); setDx(x => Math.max(-36, Math.min(36, x + d))) }
  return (
    <Frame
      caption={<>The image is <b>rotated by 180°</b>: top is bottom, left is right. When you move the slide <b>left</b>, the image moves <b>right</b>.</>}
      controls={<div className="xv-row">
        <button className="btn xs ghost" onClick={() => move(-18)}>Slide left</button>
        <button className="btn xs ghost" onClick={() => move(18)}>Slide right</button>
      </div>}>
      <svg viewBox="0 0 360 200" role="img" aria-label="Inverted image">
        <text x="86" y="20" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink-3)">SLIDE ON THE STAGE</text>
        <text x="270" y="20" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink-3)">IMAGE IN THE EYEPIECE</text>
        <rect x="16" y="64" width="140" height="80" rx="8" fill="var(--m-glass)" stroke="var(--m-edge)" strokeWidth="1.6" />
        <motion.text x={86} y={120} textAnchor="middle" fontSize="54" fontWeight="900" fill="var(--violet)" animate={{ x: dx }} transition={spring}>F</motion.text>
        <circle cx="270" cy="104" r="72" fill="#0f1114" stroke="var(--line-2)" strokeWidth="2" />
        <circle cx="270" cy="104" r="66" fill="var(--o-cyto)" />
        <motion.text x={270} y={122} textAnchor="middle" fontSize="54" fontWeight="900" fill="var(--violet)"
          style={{ originX: 0.5, originY: 0.5 }} initial={{ rotate: 0, opacity: 0.25 }} animate={{ rotate: show ? 180 : 0, opacity: 1, x: -dx * 1.4 }} transition={{ ...spring, delay: show && dx === 0 ? 0.1 : 0 }}>F</motion.text>
        <motion.path d="M176 104 h40" stroke="var(--ink-3)" strokeWidth="2" strokeDasharray="4 5" />
        <AnimatePresence>
          {dx !== 0 && (
            <motion.g key={Math.sign(dx)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <path d={dx < 0 ? 'M110 168 h-40' : 'M62 168 h40'} stroke="var(--coral)" strokeWidth="3" markerEnd="url(#xvArr2)" />
              <path d={dx < 0 ? 'M250 186 h40' : 'M290 186 h-40'} stroke="var(--coral)" strokeWidth="3" markerEnd="url(#xvArr2)" />
            </motion.g>
          )}
        </AnimatePresence>
        <defs><marker id="xvArr2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="var(--coral)" /></marker></defs>
      </svg>
    </Frame>
  )
}

/* ───────── Magnification and working out cell size ───────── */
export function FieldViz() {
  const [n, setN] = useState(0)
  const N = 10
  useEffect(() => {
    if (n >= N) return
    const t = setTimeout(() => { setN(x => x + 1); sfx('tick') }, n === 0 ? 700 : 230)
    return () => clearTimeout(t)
  }, [n])
  const done = n >= N
  return (
    <Frame
      caption={<>Magnification = eyepiece × objective: <b>10 × 40 = 400×</b>. At 400× the field of view is <b>420 µm</b> across. You count 10 cells across it, so one cell is <b>420 µm ÷ 10 = 42 µm</b> long.</>}
      controls={<button className="btn xs ghost" onClick={() => { sfx('tap'); setN(0) }}>Count again</button>}>
      <svg viewBox="0 0 360 236" role="img" aria-label="Field of view">
        <circle cx="130" cy="104" r="96" fill="#0f1114" stroke="var(--line-2)" strokeWidth="2" />
        <circle cx="130" cy="104" r="90" fill="var(--o-cyto)" />
        <clipPath id="xvFov"><circle cx="130" cy="104" r="90" /></clipPath>
        <g clipPath="url(#xvFov)">
          {Array.from({ length: N }, (_, i) => (
            <motion.rect key={i} x={40 + i * 18} y={86} width={17} height={36} rx={4} fill={i < n ? 'var(--o-stena-f)' : 'transparent'} stroke="var(--o-stena)" strokeWidth="1.6"
              initial={false} animate={{ scale: i === n - 1 ? [1, 1.2, 1] : 1 }} style={{ originX: 0.5, originY: 0.5 }} />
          ))}
          {[66, 140].map(y => Array.from({ length: N }, (_, i) => <rect key={y + '-' + i} x={40 + i * 18 + (y === 66 ? 9 : -6)} y={y - 18} width={17} height={36} rx={4} fill="none" stroke="var(--o-stena)" strokeWidth="1.2" opacity=".45" />))}
        </g>
        <motion.path d="M40 212 h180" stroke="var(--violet)" strokeWidth="2.4" initial={{ pathLength: 0 }} animate={{ pathLength: done ? 1 : n / N }} />
        <path d="M40 206 v12 M220 206 v12" stroke="var(--violet)" strokeWidth="2.4" />
        <text x="130" y="232" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--violet)">diameter 420 µm</text>
        <text x="250" y="60" fontSize="12" fontWeight="700" fill="var(--ink-3)">CELLS COUNTED</text>
        <text x="250" y="100" fontSize="40" fontWeight="900" fill="var(--ink)">{n}</text>
        <AnimatePresence>
          {done && (
            <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <text x="250" y="136" fontSize="13" fontWeight="700" fill="var(--ink-2)">420 µm ÷ 10</text>
              <text x="250" y="164" fontSize="24" fontWeight="900" fill="var(--green)">= 42 µm</text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </Frame>
  )
}

/* ───────── Depth of field: two crossed hairs ───────── */
export function FocusViz() {
  const [z, setZ] = useState(0.15)
  useEffect(() => {
    let t = 0, raf = 0, start = performance.now()
    const f = (now: number) => { t = (now - start) / 1000; if (t < 3.2) { setZ(0.15 + 0.7 * (0.5 - 0.5 * Math.cos(t * Math.PI / 1.6))); raf = requestAnimationFrame(f) } }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [])
  const blurA = Math.abs(z - 0.25) * 14, blurB = Math.abs(z - 0.75) * 14
  return (
    <Frame
      caption={<>The hairs lie at <b>different heights</b>. At high magnification only <b>one plane</b> is sharp, so with the <b>fine focus knob</b> you focus on one or the other.</>}
      controls={<label className="xv-slider">Fine focus knob<input type="range" min={0} max={1} step={0.01} value={z} onChange={e => setZ(+e.target.value)} /></label>}>
      <svg viewBox="0 0 360 200" role="img" aria-label="Depth of field">
        <defs>
          <filter id="xvBa"><feGaussianBlur stdDeviation={blurA} /></filter>
          <filter id="xvBb"><feGaussianBlur stdDeviation={blurB} /></filter>
        </defs>
        <circle cx="118" cy="100" r="88" fill="#0f1114" stroke="var(--line-2)" strokeWidth="2" /><circle cx="118" cy="100" r="82" fill="var(--o-cyto)" />
        <clipPath id="xvF2"><circle cx="118" cy="100" r="82" /></clipPath>
        <g clipPath="url(#xvF2)">
          <path d="M30 40 L210 160" stroke="#4a3426" strokeWidth="10" strokeLinecap="round" filter="url(#xvBa)" />
          <path d="M30 160 L210 40" stroke="#7a5236" strokeWidth="10" strokeLinecap="round" filter="url(#xvBb)" />
        </g>
        <g transform="translate(240 30)">
          <text x="0" y="0" fontSize="11" fontWeight="700" fill="var(--ink-3)">FROM THE SIDE</text>
          <rect x="0" y="120" width="100" height="10" rx="3" fill="var(--m-glass)" stroke="var(--m-edge)" />
          <rect x="10" y="104" width="80" height="8" rx="4" fill="#4a3426" />
          <rect x="10" y="94" width="80" height="8" rx="4" fill="#7a5236" />
          <motion.line x1="-6" x2="106" y1={112 - z * 22} y2={112 - z * 22} stroke="var(--violet)" strokeWidth="2.4" strokeDasharray="5 4" />
          <text x="0" y="150" fontSize="11" fontWeight="700" fill="var(--violet)">plane in focus</text>
        </g>
      </svg>
    </Frame>
  )
}

/* ───────── Objectives: a longer objective, a smaller distance ───────── */
export function ObjectiveViz() {
  const [o, setO] = useState<4 | 10 | 40>(4)
  useEffect(() => { const ts = [setTimeout(() => setO(10), 1100), setTimeout(() => setO(40), 2300)]; return () => ts.forEach(clearTimeout) }, [])
  const len = o === 4 ? 46 : o === 10 ? 72 : 112
  return (
    <Frame
      caption={<>The 40× objective is the <b>longest</b> and, when in focus, is <b>very close to the slide</b>. That is why at high magnification you use <b>only the fine focus knob</b>; with the coarse focus knob you could hit the cover slip.</>}
      controls={<Seg value={String(o) as '4' | '10' | '40'} onChange={v => setO(+v as 4 | 10 | 40)} options={[{ v: '4', label: '4×' }, { v: '10', label: '10×' }, { v: '40', label: '40×' }]} />}>
      <svg viewBox="0 0 360 200" role="img" aria-label="Objectives">
        <rect x="140" y="10" width="80" height="22" rx="8" fill="var(--m-body)" stroke="var(--m-edge)" strokeWidth="2" />
        <motion.rect x="158" y="30" width="44" rx="6" fill="var(--m-metal)" stroke="var(--m-edge)" strokeWidth="2" animate={{ height: len }} transition={spring} />
        <motion.rect x="164" width="32" height="10" rx="3" fill="var(--o-zer)" animate={{ y: 30 + len - 2 }} transition={spring} />
        <text x="232" y="40" fontSize="13" fontWeight="800" fill="var(--ink)">{o}×</text>
        <rect x="80" y="160" width="200" height="12" rx="3" fill="var(--m-glass)" stroke="var(--m-edge)" strokeWidth="1.6" />
        <rect x="150" y="155" width="60" height="5" rx="1" fill="#fff" stroke="var(--m-edge)" strokeWidth="1" />
        <motion.path stroke="var(--coral)" strokeWidth="2" animate={{ d: `M250 ${30 + len + 8} V153` }} transition={spring} />
        <motion.text x="258" fontSize="12" fontWeight="800" fill={o === 40 ? 'var(--bad)' : 'var(--ink-2)'} animate={{ y: (30 + len + 153) / 2 + 8 }} transition={spring}>{o === 40 ? 'very close!' : 'distance'}</motion.text>
        <rect x="60" y="172" width="240" height="14" rx="4" fill="var(--m-body)" stroke="var(--m-edge)" strokeWidth="1.6" />
      </svg>
    </Frame>
  )
}

/* ───────── The steps of scientific research ───────── */
const STEPS = ['Defining the problem', 'Hypothesis (assumption)', 'Collecting data', 'Methods: observation, measurement, experiment, fieldwork', 'Analysing the data and conclusion']
export function StepsViz({ focus = -1 }: { focus?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => { if (n < STEPS.length) { const t = setTimeout(() => { setN(x => x + 1); sfx('tick') }, n ? 420 : 400); return () => clearTimeout(t) } }, [n])
  return (
    <Frame caption={<>Scientific research goes <b>step by step</b>. A hypothesis is an untested conclusion that is only then checked with data and an experiment.</>}
      controls={<button className="btn xs ghost" onClick={() => { sfx('tap'); setN(0) }}>Replay</button>}>
      <div className="xv-steps">
        {STEPS.map((s, i) => (
          <motion.div key={s} className={`xv-step${i === focus ? ' on' : ''}`} initial={false} animate={{ opacity: i < n ? 1 : 0.15, x: i < n ? 0 : -12 }} transition={spring}>
            <span className="n">{i + 1}</span><span>{s}</span>
          </motion.div>
        ))}
      </div>
    </Frame>
  )
}

/* ───────── General: key points that build up into an answer ───────── */
export function KeyViz({ title, points }: { title: string; points: string[] }) {
  const [n, setN] = useState(0)
  useEffect(() => { if (n < points.length) { const t = setTimeout(() => { setN(x => x + 1); sfx('reveal') }, n ? 650 : 350); return () => clearTimeout(t) } }, [n, points.length])
  return (
    <div className="xv xv-key">
      <div className="xv-keyt">{title}</div>
      <div className="xv-keys">
        {points.map((p, i) => (
          <motion.div key={p} className="xv-kp" initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={i < n ? { opacity: 1, y: 0, scale: 1 } : {}} transition={spring}>
            <span className="n">{i + 1}</span>{p}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// which concept has which animation
export function explainerFor(id: string): ReactNode | null {
  switch (id) {
    case 'osmoza': case 'membrana.izbirna': return <OsmosisViz start="hiper" />
    case 'raztopine': return <OsmosisViz start="hipo" cell="animal" />
    case 'plazmoliza': case 'ld.plazmoliza': return <OsmosisViz start="hiper" />
    case 'deplazmoliza': return <OsmosisViz start="hipo" />
    case 'zival.okolja': return <OsmosisViz start="hipo" cell="animal" />
    case 'transport.pasivni': return <TransportViz start="pasivni" />
    case 'transport.aktivni': return <TransportViz start="aktivni" />
    case 'mik.slika': return <FlipViz />
    case 'mik.velikost': case 'mik.povecave': return <FieldViz />
    case 'mik.globina': return <FocusViz />
    case 'mik.velika': return <ObjectiveViz />
    case 'razisk.stopnje': return <StepsViz />
    case 'hipoteza': return <StepsViz focus={1} />
    case 'metode': case 'poskus': return <StepsViz focus={3} />
    case 'podatki.vrste': case 'podatki.dejstvo': return <StepsViz focus={2} />
    default: return null
  }
}
