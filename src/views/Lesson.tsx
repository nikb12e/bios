import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence, useDragControls } from 'motion/react'
import { ChevronRight, Dumbbell, Sparkles, BookOpen, Check, List, Play, Pause, ChevronLeft } from 'lucide-react'
import type { Nav } from '../App'
import { TOP, CON, conceptsOf, type TopicId } from '../data/concepts'
import { ORG, type OrgId, type DetailId } from '../data/organelles'
import { BANK, type Task } from '../data/bank'
import { useStore, record } from '../engine/store'
import { topicMastery, levelCounts } from '../engine/stats'
import { Dot, ORG_COLOR, sound, PushBar, useScrolledPast, Sheet, Title, TOPIC_LOOK } from '../ui/kit'
import { Shape, Wavy, burstFrom, originClip, FULL_CLIP, shapePath, type ShapeKind } from '../ui/flux'
import { CellView, AnimalCell, PlantCell, ProkCell, PROTEIN_STEPS } from '../art/Cells'
import { DetailView, DETAILS } from '../art/Details'
import { MCTask, TFTask, OddTask } from '../tasks/basic'
import type { Result } from '../tasks/shared'
import { OrgSheet } from './OrgSheet'
import { PROCS, type ProcId } from '../art/procs'
import { fmtUm } from '../tasks/visual'

/* ───────── lesson building blocks ───────── */

const LookCtx = createContext<ShapeKind>('cookie')

function Section({ n, title, page, children }: { n: number; title: string; page?: string | number; children: ReactNode }) {
  const shape = useContext(LookCtx)
  return (
    <section className="lsec" id={'s-' + n}>
      <div className="lh">
        <motion.span className="n" initial={{ scale: 0.3, rotate: -120, opacity: 0 }} whileInView={{ scale: 1, rotate: 0, opacity: 1 }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ type: 'spring', bounce: 0.45, duration: 0.8 }}>
          <svg viewBox="-1.02 -1.02 2.04 2.04" aria-hidden><path d={shapePath(shape)} fill="currentColor" /></svg>
          <span>{n}</span>
        </motion.span>
        <h2 className="t2">{title}</h2>
        {page !== undefined && <span className="pg">p. {page}</span>}
      </div>
      <div className="stack">{children}</div>
    </section>
  )
}

function Note({ children }: { children: ReactNode }) {
  return <div className="read note">{children}</div>
}

function MiniCheck({ id }: { id: string }) {
  const task = useMemo(() => BANK.find(t => t.id === id), [id]) as Task | undefined
  const [res, setRes] = useState<Result | null>(null)
  const first = useRef(new Set<string>())
  if (!task) return null
  const box = useRef<HTMLDivElement>(null)
  const onAnswer = (r: Result) => {
    setRes(r)
    sound(r.ok ? 'good' : 'bad')
    if (r.ok) burstFrom(box.current?.querySelector('.opt.good') ?? box.current, 14)
    record({ task, concepts: task.c, grade: r.grade, ms: 8000, firstInSession: first.current })
  }
  const p = { task, done: !!res, onAnswer }
  return (
    <div className="check" ref={box}>
      <div className="ck"><Check size={14} strokeWidth={3} /> Quick check</div>
      {task.t === 'mc' ? <MCTask {...p} task={task} /> : task.t === 'tf' ? <TFTask {...p} task={task} /> : task.t === 'odd' ? <OddTask {...p} task={task} /> : null}
      {res && (
        <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} className={`fb ${res.ok ? 'good' : 'bad'}`} style={{ marginTop: 12 }}>
          <div className="fbh">{res.ok ? 'Correct' : 'Not correct'}</div>
          {res.answer && <p>{res.answer}</p>}
          {res.msg && <p>{res.msg}</p>}
        </motion.div>
      )}
    </div>
  )
}

function OrgCard({ id, onOpen }: { id: OrgId; onOpen: (id: OrgId) => void }) {
  const o = ORG[id]
  return (
    <div className="card" style={{ padding: 16 }}>
      <button className="row" style={{ width: '100%', textAlign: 'left', marginBottom: 12 }} onClick={() => onOpen(id)}>
        <Dot color={ORG_COLOR[id]} size={12} />
        <span className="t3 grow">{o.name}</span>
        <span className="cap">p. {o.page}</span>
        <ChevronRight size={17} color="var(--ink-3)" />
      </button>
      <div className="sub" style={{ margin: '-6px 0 12px' }}>{o.short}</div>
      {o.detail && !['vakuola', 'centrioli'].includes(o.detail) && <div style={{ margin: '0 -6px 12px' }}><DetailView id={o.detail} mode="study" /></div>}
      <dl className="kv">
        {o.mesto && <><dt>Location</dt><dd>{o.mesto}</dd></>}
        {o.zgradba && <><dt>Structure</dt><dd>{o.zgradba}</dd></>}
        <dt>Role</dt><dd>{o.vloga}</dd>
      </dl>
      {o.pazi && <div className="pazi" style={{ marginTop: 12 }}><b>Watch out</b><span>{o.pazi}</span></div>}
    </div>
  )
}

function DetailCard({ id, note }: { id: DetailId; note?: ReactNode }) {
  const d = DETAILS[id]
  return (
    <figure className="figure" style={{ margin: 0 }}>
      <div className="row" style={{ padding: '4px 8px 6px' }}><span className="hl grow">{d.title}</span><span className="fn">{d.caption}</span></div>
      <DetailView id={id} mode="study" />
      {note && <figcaption className="fn" style={{ padding: '8px 8px 4px', fontSize: 14, lineHeight: 1.45 }}>{note}</figcaption>}
    </figure>
  )
}

const TIMELINE: { y: string; who: string; what: string; c: string }[] = [
  { y: 'around 1595', who: 'Zaharias Janssen', what: 'The first compound microscope with more than one lens (three tubes with lenses).', c: 'mejnik.janssen' },
  { y: '1632 to 1723', who: 'Antoni van Leeuwenhoek', what: 'About 500 single lens microscopes, up to 270× magnification. Discovered bacteria, red blood cells, sperm cells and protozoa.', c: 'mejnik.leeuwenhoek' },
  { y: '1665', who: 'Robert Hooke', what: 'The term cell for structures in cork. The book Micrographia (the textbook line says 1662).', c: 'mejnik.hooke' },
  { y: '18th century', who: '', what: 'Few important works were published.', c: '' },
  { y: '1838/39', who: 'Schleiden and Schwann', what: 'Cell theory: plants and animals are made of cells, and the cell is the basic unit of living things.', c: 'mejnik.schleiden' },
  { y: '1855', who: 'Rudolph Virchow', what: 'New cells only arise by division of existing cells.', c: 'mejnik.virchow' },
  { y: '1880', who: 'August Weismann', what: 'All present cells descend from cells of the distant past. Link to evolution.', c: 'mejnik.weismann' },
  { y: '1938', who: 'Ernst Ruska, Manfred von Ardenne', what: 'TEM: electrons through the specimen. At the same time SEM: the surface of objects.', c: 'mikro.tem' },
]

function Timeline() {
  const [open, setOpen] = useState(4)
  return (
    <div className="card">
      <div className="tl">
        {TIMELINE.map((e, i) => (
          <motion.button key={e.y} className={`tl-i ${open === i ? 'on' : ''}`} style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => setOpen(i)} layout>
            <div className="row"><span className="y">{e.y}</span><span className="hl grow" style={{ fontSize: 15.5 }}>{e.who}</span></div>
            <motion.div initial={false} animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }} style={{ overflow: 'hidden' }}>
              <div className="sub" style={{ paddingTop: 4, color: 'var(--ink)' }}>{e.what}</div>
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function ZoomLab() {
  const [ok, setOk] = useState(10)
  const [ob, setOb] = useState(40)
  const total = ok * ob
  const field = 18000 / total // approximate field of view in µm
  return (
    <div className="card">
      <div className="hl" style={{ marginBottom: 10 }}>Total magnification = eyepiece × objective</div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}><span className="fn" style={{ width: 70 }}>Eyepiece</span>{[5, 10, 15].map(v => <button key={v} className={`chip ${ok === v ? 'on' : ''}`} onClick={() => setOk(v)}>{v}×</button>)}</div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginTop: 8 }}><span className="fn" style={{ width: 70 }}>Objective</span>{[4, 10, 40, 100].map(v => <button key={v} className={`chip ${ob === v ? 'on' : ''}`} onClick={() => setOb(v)}>{v}×</button>)}</div>
      <div className="row" style={{ marginTop: 16, alignItems: 'center' }}>
        <div className="grow"><div className="cap">Total magnification</div><div className="t1 num">{ok} · {ob} = {total}×</div><div className="fn">Field of view about {fmtUm(field)}</div></div>
        <div style={{ width: 110, height: 110, borderRadius: 99, overflow: 'hidden', background: 'var(--o-cyto)', boxShadow: 'inset 0 0 0 3px var(--ink)', position: 'relative' }}>
          <motion.div animate={{ scale: total / 400 }} transition={{ type: 'spring', bounce: 0, duration: 0.5 }} style={{ width: 110, height: 110, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--o-jedro-f)', boxShadow: '0 0 0 2px var(--o-jedro)' }} />
          </motion.div>
        </div>
      </div>
      <div className="cap" style={{ marginTop: 10 }}>The field of view is an estimate for illustration (at 400× about 45 µm).</div>
    </div>
  )
}

function Units() {
  const rows = [
    { t: '1 mm', v: '= 1000 µm', s: 'a grain of salt' },
    { t: '1 µm', v: '= 1000 nm', s: 'bacteria measure 0.5 to 8 µm' },
    { t: '1 nm', v: '= 0.001 µm', s: 'molecules' },
  ]
  return (
    <div className="list">
      {rows.map(r => <div key={r.t} className="li nolead"><span className="t3 num" style={{ width: 64 }}>{r.t}</span><span className="hl grow">{r.v}</span><span className="fn">{r.s}</span></div>)}
    </div>
  )
}

function CompareRZ() {
  const rows: { k: string; r: string; z: string; org?: OrgId }[] = [
    { k: 'Cell wall', r: 'a cellulose cell wall covers the membrane', z: 'no cellulose wall', org: 'stena' },
    { k: 'Chloroplasts', r: 'ima', z: 'does not contain', org: 'kloroplast' },
    { k: 'Vacuoles', r: 'has (usually one large)', z: 'only in some cells', org: 'vakuola' },
    { k: 'Nutrition', r: 'avtotrofna', z: 'heterotrofna' },
    { k: 'Shape', r: 'regular', z: 'irregular' },
  ]
  const [sel, setSel] = useState(0)
  const org = rows[sel].org ?? null
  return (
    <>
      <div className="grid2">
        <div className="stage" style={{ padding: 6 }}><PlantCell kind="plant" focus={org} /><div className="cap" style={{ textAlign: 'center', padding: 4 }}>Plant</div></div>
        <div className="stage" style={{ padding: 6 }}><AnimalCell kind="animal" focus={org === 'kloroplast' || org === 'stena' ? 'membrana' : org} /><div className="cap" style={{ textAlign: 'center', padding: 4 }}>Animal</div></div>
      </div>
      <div className="list">
        {rows.map((r, i) => (
          <button key={r.k} className="li nolead" onClick={() => setSel(i)} style={{ background: sel === i ? 'var(--card-2)' : undefined, alignItems: 'flex-start' }}>
            <span className="hl" style={{ width: 110, fontSize: 15 }}>{r.k}</span>
            <span className="grow fn" style={{ color: 'var(--ink)' }}>{r.r}</span>
            <span className="grow fn" style={{ color: 'var(--ink)' }}>{r.z}</span>
          </button>
        ))}
      </div>
    </>
  )
}

function Functions() {
  const f = ['energy conversion', 'transport of molecules', 'breakdown and synthesis of new molecules', 'removal of waste', 'storage and expression of genetic information']
  const orgs: OrgId[] = ['mitohondrij', 'membrana', 'ribosomi', 'lizosom', 'jedro']
  return (
    <div className="list">
      {f.map((x, i) => <div key={x} className="li nolead"><Dot color={ORG_COLOR[orgs[i]]} /><span className="grow" style={{ fontWeight: 500 }}>{x}</span><span className="cap">npr. {ORG[orgs[i]].name.toLowerCase()}</span></div>)}
    </div>
  )
}

/* ───────── lesson ───────── */

export function LessonView({ nav, id, onBack }: { nav: Nav; id: TopicId; onBack: () => void }) {
  const t = TOP[id]
  const [org, setOrg] = useState<OrgId | null>(null)
  const [toc, setToc] = useState(false)
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const past = useScrolledPast(70, scroller)
  const drag = useDragControls()
  const s = useStore(x => x)
  const m = topicMastery(s, id)
  const lv = levelCounts(s, id)
  let n = 0
  const items: { n: number; title: string }[] = []
  const S = (title: string, page: string | number | undefined, children: ReactNode) => { items.push({ n: n + 1, title }); return <Section n={++n} title={title} page={page}>{children}</Section> }
  const practice = () => nav.start({ mode: 'smart', topic: id, size: 14 }, t.title)
  const look = TOPIC_LOOK[id]
  const [from] = useState(() => originClip())

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && !org && !toc) onBack() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onBack, org, toc])

  return (
    <LookCtx.Provider value={look.shape}>
      <motion.div className="push-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
      <motion.div className={`push t-${look.tone}`} style={{ ['--nb' as string]: 'var(--bg)' }}
        initial={from ? { clipPath: from, opacity: 0.6 } : { x: '100%' }} animate={{ clipPath: FULL_CLIP, opacity: 1, x: 0 }}
        exit={from ? { clipPath: from, opacity: 0, transition: { type: 'spring', bounce: 0, duration: 0.42 } } : { x: '100%' }} transition={{ type: 'spring', bounce: 0.12, duration: 0.62 }}
        onAnimationComplete={def => { if (def !== 'exit' && typeof def === 'object' && def && 'clipPath' in def) { const el = document.querySelector<HTMLElement>('.push'); if (el) el.style.clipPath = 'none' } }}
        drag="x" dragListener={false} dragControls={drag} dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: 1 }} dragMomentum={false}
        onDragEnd={(_, i) => { if (i.offset.x > window.innerWidth * 0.28 || i.velocity.x > 500) onBack() }}>
        <PushBar back={{ label: 'Learn', onClick: onBack }} title={t.title} show={past}
          right={<button className="iconbtn fill" onClick={() => setToc(true)} aria-label="Contents"><List size={18} /></button>} />
        <div className="scroll" ref={setScroller}>
          <div className="page">
            <header className={`band t-${look.tone}`} style={{ paddingTop: 'calc(var(--safe-t) + 74px)' }}>
              <Shape kind={look.shape} size={260} spin={70} className="deco" style={{ right: -80, top: -40 }} />
              <div className="kick">{t.pages}</div>
              <Title>{t.title}</Title>
              <div className="bsub">{t.sub}</div>
              <div className="row" style={{ marginTop: 16, gap: 12 }}>
                <div className="grow"><Wavy value={m} /></div>
                <span className="num" style={{ fontWeight: 800, fontSize: 15 }}>{Math.round(m * 100)} %</span>
              </div>
              <div className="fn" style={{ color: 'inherit', opacity: 0.75, marginTop: 6 }}>{lv.obvladam + lv.utrjujem} of {conceptsOf(id).length} concepts mastered</div>
              <button className="btn onc full" style={{ marginTop: 16 }} onClick={practice}><Dumbbell size={18} strokeWidth={2.4} /> Practise this topic</button>
            </header>

      {id === 'osnove' && <>
        {S('What a cell is', 1, <>
          <Note><b>The cell is the basic structural and functional unit of living things.</b> Cell division passes genetic information from the mother cell to the daughter cell.</Note>
          <MiniCheck id="mc1" />
        </>)}
        {S('Two types of cells', '1 and 2', <>
          <Note>How a cell works is linked to its inner structure. <b>Prokaryotic</b> cells belong to bacteria. <b>Eukaryotic</b> cells have a true nucleus and organelles: fungi, plants, animals.</Note>
          <div className="grid2">
            <div className="stage" style={{ padding: 6 }}><ProkCell kind="prok" labels /><div className="cap" style={{ textAlign: 'center' }}>Prokaryotic · 0.5 to 8 µm</div></div>
            <div className="stage" style={{ padding: 6 }}><AnimalCell kind="animal" /><div className="cap" style={{ textAlign: 'center' }}>Eukaryotic · 10 to 100 µm</div></div>
          </div>
          <SizeCompare />
          <DetailCard id="prokariont" />
          <MiniCheck id="tf22" />
        </>)}
        {S('Comparison table', 2, <>
          <div className="card" style={{ padding: 6 }}>
            <table className="cmp">
              <thead><tr><th></th><th>Prokaryotic</th><th>Eukaryotic</th></tr></thead>
              <tbody>
                {[['size', 'mostly 0.5 to 8 µm', 'mostly 10 to 100 µm'], ['genetic material', 'one circular DNA, not bound to proteins', 'many linear DNA molecules bound to special proteins'], ['nuclear envelope', 'not present', 'present'], ['nucleus', 'not present', 'present'], ['division', 'without a spindle (fission)', 'with a spindle (mitosis, meiosis)'], ['ribosomes', 'smaller', 'larger'], ['ER, Golgi, mitochondria', 'not present', 'present'], ['plastids (chloroplasts)', 'not present', 'present in plants']].map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}
              </tbody>
            </table>
          </div>
          <MiniCheck id="mc5" />
        </>)}
        {S('Structure of the eukaryotic cell', 3, <>
          <Note>The cell is surrounded by a <b>selectively permeable biological membrane</b> that regulates its interaction with the environment. Structures in the cell carry out cell functions:</Note>
          <Functions />
          <Note><b>Cytoplasm = cytosol + cell organelles.</b> Cytosol is the fluid part of the cytoplasm, mostly water and the substances dissolved in it (proteins, fats, salts …).</Note>
          <div className="pazi"><b>Watch out</b><span>Do not write «organelles float in the cytoplasm» or «the cytoplasm moistens the organelles». Scientifically: the cytoplasm is made of cytosol and cell organelles.</span></div>
          <MiniCheck id="tf1" />
        </>)}
      </>}

      {id === 'teorija' && <>
        {S('Milestones in cell biology', 4, <><Timeline /><MiniCheck id="mc42" /></>)}
        {S('Cell theory', 4, <>
          <div className="list">
            {['All living things are made of cells and cell products.', 'New cells can only arise by division of existing cells.', 'Cells contain genetic material with instructions for the growth, function and development of cells.', 'The cell is the functional unit of life: chemical reactions essential for life take place in the cell.'].map((x, i) => (
              <div key={i} className="li nolead" style={{ alignItems: 'flex-start' }}><span className="t3 num" style={{ width: 28, color: 'var(--accent-ink)' }}>{i + 1}</span><span className="grow" style={{ fontWeight: 500 }}>{x}</span></div>
            ))}
          </div>
          <MiniCheck id="mc41" />
        </>)}
        {S('Microscopes', 4, <>
          <Note><b>Janssen's microscope (around 1595)</b>: the first compound one, three tubes with lenses, focused by changing the distance between the lenses. <b>Leeuwenhoek's (around 1673)</b>: simple, one lens, up to 270× magnification.</Note>
          <DetailCard id="tem" note="Ernst Ruska, 1938. Electrons that pass through the specimen are focused by electromagnetic lenses. The short wavelength of accelerated electrons lets us see very small structures. SEM (von Ardenne) shows the surface of objects." />
          <MiniCheck id="mc47" />
        </>)}
        {S('Spontaneous generation', 4, <>
          <Note>Before the cell theory people believed that living organisms could arise <b>spontaneously, from nonliving matter</b>. This was disproved by <b>Pasteur</b>. Your answer on the sheet: the microscope helped develop the cell theory, microbiology and genetics.</Note>
          <MiniCheck id="od7" />
        </>)}
      </>}

      {id === 'organeli' && <>
        {S('What organelles are', 5, <>
          <Note><b>Cell organelles</b> are membrane bound structures in which chemical processes run separately from the cytosol.</Note>
          <figure className="figure" style={{ margin: 0 }}><CellView kind="animal" labels onPick={p => p !== 'dnk' && setOrg(p as OrgId)} /><figcaption className="fc">Tap an organelle for details.</figcaption></figure>
        </>)}
        {S('Endoplasmic reticulum', 5, <><OrgCard id="zrnatiER" onOpen={setOrg} /><OrgCard id="gladkiER" onOpen={setOrg} /><MiniCheck id="mc12" /></>)}
        {S('Ribosomes', 6, <><OrgCard id="ribosomi" onOpen={setOrg} /><MiniCheck id="tf6" /></>)}
        {S('Golgi apparatus', 6, <><OrgCard id="golgi" onOpen={setOrg} /><ProteinPath /><Proc3D id="protein" nav={nav} /><MiniCheck id="mc16" /></>)}
        {S('Vacuole and lysosomes', 7, <><OrgCard id="vakuola" onOpen={setOrg} /><OrgCard id="lizosom" onOpen={setOrg} /><Proc3D id="prebava" nav={nav} /><Proc3D id="turgor" nav={nav} /><MiniCheck id="mc20" /></>)}
        {S('Nucleus and nucleolus', 8, <><OrgCard id="jedro" onOpen={setOrg} /><OrgCard id="jedrce" onOpen={setOrg} /><MiniCheck id="mc22" /></>)}
        {S('Mitochondrion', 9, <><OrgCard id="mitohondrij" onOpen={setOrg} /><Proc3D id="dihanje" nav={nav} /><MiniCheck id="tf13" /></>)}
        {S('Plastids and the chloroplast', '9 and 10', <><OrgCard id="kloroplast" onOpen={setOrg} /><OrgCard id="skrobna" onOpen={setOrg} /><Proc3D id="fotosinteza" nav={nav} /><MiniCheck id="mc27" /></>)}
        {S('Centrioles', 10, <><OrgCard id="centrioli" onOpen={setOrg} /><MiniCheck id="tf16" /></>)}
      </>}

      {id === 'ovoj' && <>
        {S('Cytoskeleton', 10, <><OrgCard id="citoskelet" onOpen={setOrg} /><MiniCheck id="od2" /></>)}
        {S('Cilia and flagella', 11, <><OrgCard id="migetalke" onOpen={setOrg} /><Proc3D id="migetalke" nav={nav} /><MiniCheck id="mc34" /></>)}
        {S('Cell membrane and the fluid mosaic', 11, <><OrgCard id="membrana" onOpen={setOrg} /><MiniCheck id="mc36" /></>)}
        {S('Cell wall', 12, <><OrgCard id="stena" onOpen={setOrg} /><MiniCheck id="tf21" /></>)}
      </>}

      {id === 'primerjava' && <>
        {S('Five differences', 13, <><CompareRZ /><MiniCheck id="od3" /></>)}
      </>}

      {id === 'mikroskop' && <>
        {S('Parts of a light microscope', 'earlier lessons', <><DetailCard id="svetlobni" note="Coarse focus knob: rough focusing. Fine focus knob: fine focusing." /><MiniCheck id="mc51" /></>)}
        {S('Magnification', 'earlier lessons', <><ZoomLab /><MiniCheck id="mc52" /></>)}
        {S('Units', 'earlier lessons', <><Units /></>)}
        <div className="cap" style={{ marginTop: 10 }}>This topic is not in Cell.pdf. The parts and units come from earlier lessons, the focus knob descriptions are added from standard material.</div>
      </>}

            <div className="stack" style={{ marginTop: 44 }}>
              <button className="btn accent full" onClick={practice}><Dumbbell size={18} /> Practise this topic</button>
              <button className="btn full ghost" onClick={() => nav.oral(id)}><Sparkles size={18} /> Oral exam on this topic</button>
              <div className="cap" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 4 }}><BookOpen size={12} /> All texts come from the Cell.pdf notes.</div>
            </div>
          </div>
        </div>
        <div className="edge" onPointerDown={e => drag.start(e)} />
      </motion.div>

      <Sheet open={toc} onClose={() => setToc(false)} title={<span className="t3">Contents</span>}>
        <div className="list toc">
          {items.map(x => (
            <a key={x.n} href={'#s-' + x.n} onClick={e => { e.preventDefault(); setToc(false); setTimeout(() => document.getElementById('s-' + x.n)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 280) }}>
              <span className="n">{String(x.n).padStart(2, '0')}</span><span className="grow">{x.title}</span>
            </a>
          ))}
        </div>
      </Sheet>
      <OrgSheet id={org} onClose={() => setOrg(null)} onPractice={o => { setOrg(null); nav.start({ mode: 'org', org: o, size: 8 }, ORG[o].name) }} />
    </LookCtx.Provider>
  )
}

/* link to the animated explanation in the 3D cell */
function Proc3D({ id, nav }: { id: ProcId; nav: Nav }) {
  const p = PROCS.find(x => x.id === id)!
  return (
    <button className={`proc3d ${p.tone}`} onClick={() => nav.process(id)}>
      <Shape kind={p.shape} size={42} fill="var(--st)" spin={26}><Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 2 }} /></Shape>
      <span className="grow" style={{ minWidth: 0 }}>
        <span className="k">3D animation</span>
        <span className="n">{p.name}</span>
      </span>
      <ChevronRight size={18} className="chev" />
    </button>
  )
}

/* the path of a protein the cell secretes */
function ProteinPath() {
  const [step, setStep] = useState(0)
  const [auto, setAuto] = useState(false)
  useEffect(() => {
    if (!auto) return
    const tm = setInterval(() => setStep(x => { if (x >= PROTEIN_STEPS.length) { setAuto(false); return x } return x + 1 }), 2400)
    return () => clearInterval(tm)
  }, [auto])
  const cur = step > 0 ? PROTEIN_STEPS[step - 1] : null
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row" style={{ marginBottom: 8 }}>
        <div className="grow">
          <div className="hl">The path of a protein the cell secretes</div>
          <div className="fn">Nucleus, rough ER, vesicle, Golgi apparatus, membrane.</div>
        </div>
        <button className="iconbtn fill" style={{ width: 40, height: 40 }} onClick={() => { if (step >= PROTEIN_STEPS.length) setStep(0); setAuto(a => !a); if (step === 0) setStep(1) }} aria-label="Play">{auto ? <Pause size={18} /> : <Play size={18} />}</button>
      </div>
      <div className="stage plain"><CellView kind="animal" focus={cur?.org ?? null} protein={step} /></div>
      <div className="row" style={{ marginTop: 8 }}>
        <button className="iconbtn fill" disabled={step <= 1} onClick={() => { setAuto(false); setStep(x => Math.max(1, x - 1)) }} aria-label="Back"><ChevronLeft size={18} /></button>
        <AnimatePresence mode="wait">
          <motion.div key={step} className="grow" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ textAlign: 'center', fontSize: 15, fontWeight: 500, minHeight: 42 }}>
            {cur ? <><span className="badge accent" style={{ marginRight: 6 }}>{step}/{PROTEIN_STEPS.length}</span>{cur.t}</> : <span className="fn">Press play or next.</span>}
          </motion.div>
        </AnimatePresence>
        <button className="iconbtn fill" disabled={step >= PROTEIN_STEPS.length} onClick={() => { setAuto(false); setStep(x => x + 1) }} aria-label="Next"><ChevronRight size={18} /></button>
      </div>
    </div>
  )
}

function SizeCompare() {
  // logarithmic scale: a bacterium versus a eukaryotic cell
  const W = 320
  const x = (um: number) => ((Math.log10(um) + 1) / 3.2) * W
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="hl" style={{ marginBottom: 8 }}>Size on a logarithmic scale</div>
      <svg viewBox={`0 0 ${W} 74`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <rect x={x(0.5)} y={18} width={x(8) - x(0.5)} height={14} rx={7} fill="var(--o-prokw)" opacity={0.55} />
        <rect x={x(10)} y={38} width={x(100) - x(10)} height={14} rx={7} fill="var(--o-jedro)" opacity={0.55} />
        <text x={x(0.5)} y={12} fontSize={10} fill="var(--ink-2)" fontWeight={600}>prokaryotic</text>
        <text x={x(10)} y={64} fontSize={10} fill="var(--ink-2)" fontWeight={600} dy={4}>eukaryotic</text>
        {[0.1, 1, 10, 100, 1000].map(u => <g key={u}><line x1={x(u)} x2={x(u)} y1={14} y2={56} stroke="var(--line-2)" /><text x={x(u)} y={74} fontSize={9} textAnchor="middle" fill="var(--ink-3)">{fmtUm(u)}</text></g>)}
      </svg>
    </div>
  )
}

export { CON }
