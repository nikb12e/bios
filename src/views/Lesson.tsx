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

/* ───────── gradniki lekcije ───────── */

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
        {page !== undefined && <span className="pg">str. {page}</span>}
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
      <div className="ck"><Check size={14} strokeWidth={3} /> Hitro preverjanje</div>
      {task.t === 'mc' ? <MCTask {...p} task={task} /> : task.t === 'tf' ? <TFTask {...p} task={task} /> : task.t === 'odd' ? <OddTask {...p} task={task} /> : null}
      {res && (
        <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} className={`fb ${res.ok ? 'good' : 'bad'}`} style={{ marginTop: 12 }}>
          <div className="fbh">{res.ok ? 'Pravilno' : 'Ni pravilno'}</div>
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
        <span className="cap">str. {o.page}</span>
        <ChevronRight size={17} color="var(--ink-3)" />
      </button>
      <div className="sub" style={{ margin: '-6px 0 12px' }}>{o.short}</div>
      {o.detail && !['vakuola', 'centrioli'].includes(o.detail) && <div style={{ margin: '0 -6px 12px' }}><DetailView id={o.detail} mode="study" /></div>}
      <dl className="kv">
        {o.mesto && <><dt>Mesto</dt><dd>{o.mesto}</dd></>}
        {o.zgradba && <><dt>Zgradba</dt><dd>{o.zgradba}</dd></>}
        <dt>Vloga</dt><dd>{o.vloga}</dd>
      </dl>
      {o.pazi && <div className="pazi" style={{ marginTop: 12 }}><b>Pazi</b><span>{o.pazi}</span></div>}
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
  { y: 'ok. 1595', who: 'Zaharias Janssen', what: 'Prvi sestavljeni mikroskop z več kot eno lečo (trije tubusi z lečami).', c: 'mejnik.janssen' },
  { y: '1632 do 1723', who: 'Antoni van Leeuwenhoek', what: 'Okrog 500 mikroskopov z eno lečo, do 270-kratna povečava. Odkril bakterije, rdeče krvničke, spermije in praživali.', c: 'mejnik.leeuwenhoek' },
  { y: '1665', who: 'Robert Hooke', what: 'Izraz celica za strukture v pluti. Knjiga Mikrografija (v učbeniku vrstica 1662).', c: 'mejnik.hooke' },
  { y: '18. stoletje', who: '', what: 'Izšlo je le malo pomembnih del.', c: '' },
  { y: '1838/39', who: 'Schleiden in Schwann', what: 'Celična teorija: rastline in živali sestavljajo celice, celica je osnovna enota živih bitij.', c: 'mejnik.schleiden' },
  { y: '1855', who: 'Rudolph Virchow', what: 'Nove celice nastanejo le z delitvijo obstoječih celic.', c: 'mejnik.virchow' },
  { y: '1880', who: 'August Weismann', what: 'Vse današnje celice so potomke celic iz pradavnine. Povezava z evolucijo.', c: 'mejnik.weismann' },
  { y: '1938', who: 'Ernst Ruska, Manfred von Ardenne', what: 'TEM: elektroni skozi preparat. Sočasno SEM: površina objektov.', c: 'mikro.tem' },
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
  const field = 18000 / total // približno vidno polje v µm
  return (
    <div className="card">
      <div className="hl" style={{ marginBottom: 10 }}>Skupna povečava = okular × objektiv</div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}><span className="fn" style={{ width: 70 }}>Okular</span>{[5, 10, 15].map(v => <button key={v} className={`chip ${ok === v ? 'on' : ''}`} onClick={() => setOk(v)}>{v}×</button>)}</div>
      <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginTop: 8 }}><span className="fn" style={{ width: 70 }}>Objektiv</span>{[4, 10, 40, 100].map(v => <button key={v} className={`chip ${ob === v ? 'on' : ''}`} onClick={() => setOb(v)}>{v}×</button>)}</div>
      <div className="row" style={{ marginTop: 16, alignItems: 'center' }}>
        <div className="grow"><div className="cap">Skupna povečava</div><div className="t1 num">{ok} · {ob} = {total}×</div><div className="fn">Vidno polje približno {fmtUm(field)}</div></div>
        <div style={{ width: 110, height: 110, borderRadius: 99, overflow: 'hidden', background: 'var(--o-cyto)', boxShadow: 'inset 0 0 0 3px var(--ink)', position: 'relative' }}>
          <motion.div animate={{ scale: total / 400 }} transition={{ type: 'spring', bounce: 0, duration: 0.5 }} style={{ width: 110, height: 110, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--o-jedro-f)', boxShadow: '0 0 0 2px var(--o-jedro)' }} />
          </motion.div>
        </div>
      </div>
      <div className="cap" style={{ marginTop: 10 }}>Vidno polje je ocena za ponazoritev (pri 400× okrog 45 µm).</div>
    </div>
  )
}

function Units() {
  const rows = [
    { t: '1 mm', v: '= 1000 µm', s: 'zrno soli' },
    { t: '1 µm', v: '= 1000 nm', s: 'bakterije merijo 0,5 do 8 µm' },
    { t: '1 nm', v: '= 0,001 µm', s: 'molekule' },
  ]
  return (
    <div className="list">
      {rows.map(r => <div key={r.t} className="li nolead"><span className="t3 num" style={{ width: 64 }}>{r.t}</span><span className="hl grow">{r.v}</span><span className="fn">{r.s}</span></div>)}
    </div>
  )
}

function CompareRZ() {
  const rows: { k: string; r: string; z: string; org?: OrgId }[] = [
    { k: 'Celična stena', r: 'celulozna celična stena prekriva membrano', z: 'brez celulozne stene', org: 'stena' },
    { k: 'Kloroplasti', r: 'ima', z: 'ne vsebuje', org: 'kloroplast' },
    { k: 'Vakuole', r: 'ima (navadno ena velika)', z: 'le v nekaterih celicah', org: 'vakuola' },
    { k: 'Prehrana', r: 'avtotrofna', z: 'heterotrofna' },
    { k: 'Oblika', r: 'pravilna', z: 'nepravilna' },
  ]
  const [sel, setSel] = useState(0)
  const org = rows[sel].org ?? null
  return (
    <>
      <div className="grid2">
        <div className="stage" style={{ padding: 6 }}><PlantCell kind="plant" focus={org} /><div className="cap" style={{ textAlign: 'center', padding: 4 }}>Rastlinska</div></div>
        <div className="stage" style={{ padding: 6 }}><AnimalCell kind="animal" focus={org === 'kloroplast' || org === 'stena' ? 'membrana' : org} /><div className="cap" style={{ textAlign: 'center', padding: 4 }}>Živalska</div></div>
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
  const f = ['pretvorba energije', 'transport molekul', 'razgradnja in sinteza novih molekul', 'odstranjevanje odpadnih snovi', 'shranjevanje in izražanje genetske informacije']
  const orgs: OrgId[] = ['mitohondrij', 'membrana', 'ribosomi', 'lizosom', 'jedro']
  return (
    <div className="list">
      {f.map((x, i) => <div key={x} className="li nolead"><Dot color={ORG_COLOR[orgs[i]]} /><span className="grow" style={{ fontWeight: 500 }}>{x}</span><span className="cap">npr. {ORG[orgs[i]].name.toLowerCase()}</span></div>)}
    </div>
  )
}

/* ───────── lekcija ───────── */

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
        <PushBar back={{ label: 'Učenje', onClick: onBack }} title={t.title} show={past}
          right={<button className="iconbtn fill" onClick={() => setToc(true)} aria-label="Vsebina"><List size={18} /></button>} />
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
              <div className="fn" style={{ color: 'inherit', opacity: 0.75, marginTop: 6 }}>{lv.obvladam + lv.utrjujem} od {conceptsOf(id).length} pojmov utrjenih</div>
              <button className="btn onc full" style={{ marginTop: 16 }} onClick={practice}><Dumbbell size={18} strokeWidth={2.4} /> Vadi ta sklop</button>
            </header>

      {id === 'osnove' && <>
        {S('Kaj je celica', 1, <>
          <Note><b>Celica je osnovna gradbena in dejavna enota živih bitij.</b> Delitev celic omogoča prenos dednih informacij iz materinske v hčerinsko celico.</Note>
          <MiniCheck id="mc1" />
        </>)}
        {S('Dve vrsti celic', '1 in 2', <>
          <Note>Delovanje celice je povezano z njeno notranjo zgradbo. <b>Prokariontske (predjedrne)</b> celice imajo bakterije. <b>Evkariontske</b> celice imajo pravo jedro in organele: glive, rastline, živali.</Note>
          <div className="grid2">
            <div className="stage" style={{ padding: 6 }}><ProkCell kind="prok" labels /><div className="cap" style={{ textAlign: 'center' }}>Prokariontska · 0,5 do 8 µm</div></div>
            <div className="stage" style={{ padding: 6 }}><AnimalCell kind="animal" /><div className="cap" style={{ textAlign: 'center' }}>Evkariontska · 10 do 100 µm</div></div>
          </div>
          <SizeCompare />
          <DetailCard id="prokariont" />
          <MiniCheck id="tf22" />
        </>)}
        {S('Primerjava v tabeli', 2, <>
          <div className="card" style={{ padding: 6 }}>
            <table className="cmp">
              <thead><tr><th></th><th>Prokariontska</th><th>Evkariontska</th></tr></thead>
              <tbody>
                {[['velikost', 'večinoma 0,5 do 8 µm', 'večinoma 10 do 100 µm'], ['dedni zapis', 'ena krožno oblikovana DNK, ni povezana z beljakovinami', 'številne linearno oblikovane molekule DNK, povezane s posebnimi beljakovinami'], ['jedrni ovoj', 'ni prisoten', 'prisoten'], ['jedro', 'ni prisotno', 'prisotno'], ['delitev', 'brez delitvenega vretena (cepitev)', 's sodelovanjem delitvenega vretena (mitoza, mejoza)'], ['ribosomi', 'manjši', 'večji'], ['ER, GA, mitohondriji', 'niso prisotni', 'prisotni'], ['plastidi (kloroplasti)', 'niso prisotni', 'prisotni pri rastlinah']].map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}
              </tbody>
            </table>
          </div>
          <MiniCheck id="mc5" />
        </>)}
        {S('Zgradba evkariontske celice', 3, <>
          <Note>Celica je obdana z <b>izbirno prepustno biotsko membrano</b>, ki uravnava njeno interakcijo z okoljem. Strukture v celici opravljajo celične funkcije:</Note>
          <Functions />
          <Note><b>Citoplazma = citosol + celični organeli.</b> Citosol je tekoči del citoplazme, pretežno iz vode in v njej raztopljenih snovi (beljakovin, maščob, soli …).</Note>
          <div className="pazi"><b>Pazi</b><span>Ne piši »organeli plavajo v citoplazmi« ali »citoplazma navlaži organele«. Strokovno: citoplazmo sestavljata citosol in celični organeli.</span></div>
          <MiniCheck id="tf1" />
        </>)}
      </>}

      {id === 'teorija' && <>
        {S('Mejniki v celični biologiji', 4, <><Timeline /><MiniCheck id="mc42" /></>)}
        {S('Celična teorija', 4, <>
          <div className="list">
            {['Vsa živa bitja so sestavljena iz celic in celičnih produktov.', 'Nove celice lahko nastanejo le z delitvijo obstoječih celic.', 'Celice vsebujejo dedni zapis z navodili za rast, delovanje in razvoj celic.', 'Celica je funkcionalna enota živega: v celici potekajo kemične reakcije, pomembne za življenje.'].map((x, i) => (
              <div key={i} className="li nolead" style={{ alignItems: 'flex-start' }}><span className="t3 num" style={{ width: 28, color: 'var(--accent-ink)' }}>{i + 1}</span><span className="grow" style={{ fontWeight: 500 }}>{x}</span></div>
            ))}
          </div>
          <MiniCheck id="mc41" />
        </>)}
        {S('Mikroskopi', 4, <>
          <Note><b>Janssenov mikroskop (ok. 1595)</b>: prvi sestavljeni, trije tubusi z lečami, izostritev s spreminjanjem razdalje med lečami. <b>Leeuwenhoekov (ok. 1673)</b>: preprost, ena leča, do 270-kratna povečava.</Note>
          <DetailCard id="tem" note="Ernst Ruska, 1938. Elektrone, ki prodirajo skozi preparat, zberejo elektromagnetne leče. Kratka valovna dolžina pospešenih elektronov omogoča opazovanje zelo majhnih struktur. SEM (von Ardenne) prikazuje površino objektov." />
          <MiniCheck id="mc47" />
        </>)}
        {S('Spontani nastanek', 4, <>
          <Note>Pred celično teorijo so verjeli, da živi organizmi lahko nastanejo <b>spontano, iz neživega</b>. To je ovrgel <b>Pasteur</b>. Tvoj odgovor na listu: mikroskop je pomagal pri razvoju celične teorije, mikrobiologije in genetike.</Note>
          <MiniCheck id="od7" />
        </>)}
      </>}

      {id === 'organeli' && <>
        {S('Kaj so organeli', 5, <>
          <Note><b>Celični organeli</b> so z membrano obdane strukture, v katerih potekajo kemijski procesi ločeno od citosola.</Note>
          <figure className="figure" style={{ margin: 0 }}><CellView kind="animal" labels onPick={p => p !== 'dnk' && setOrg(p as OrgId)} /><figcaption className="fc">Tapni organel za podrobnosti.</figcaption></figure>
        </>)}
        {S('Endoplazemski retikulum', 5, <><OrgCard id="zrnatiER" onOpen={setOrg} /><OrgCard id="gladkiER" onOpen={setOrg} /><MiniCheck id="mc12" /></>)}
        {S('Ribosomi', 6, <><OrgCard id="ribosomi" onOpen={setOrg} /><MiniCheck id="tf6" /></>)}
        {S('Golgijev aparat', 6, <><OrgCard id="golgi" onOpen={setOrg} /><ProteinPath /><Proc3D id="protein" nav={nav} /><MiniCheck id="mc16" /></>)}
        {S('Vakuola in lizosomi', 7, <><OrgCard id="vakuola" onOpen={setOrg} /><OrgCard id="lizosom" onOpen={setOrg} /><Proc3D id="prebava" nav={nav} /><Proc3D id="turgor" nav={nav} /><MiniCheck id="mc20" /></>)}
        {S('Jedro in jedrce', 8, <><OrgCard id="jedro" onOpen={setOrg} /><OrgCard id="jedrce" onOpen={setOrg} /><MiniCheck id="mc22" /></>)}
        {S('Mitohondrij', 9, <><OrgCard id="mitohondrij" onOpen={setOrg} /><Proc3D id="dihanje" nav={nav} /><MiniCheck id="tf13" /></>)}
        {S('Plastidi in kloroplast', '9 in 10', <><OrgCard id="kloroplast" onOpen={setOrg} /><OrgCard id="skrobna" onOpen={setOrg} /><Proc3D id="fotosinteza" nav={nav} /><MiniCheck id="mc27" /></>)}
        {S('Centrioli', 10, <><OrgCard id="centrioli" onOpen={setOrg} /><MiniCheck id="tf16" /></>)}
      </>}

      {id === 'ovoj' && <>
        {S('Celično ogrodje (citoskelet)', 10, <><OrgCard id="citoskelet" onOpen={setOrg} /><MiniCheck id="od2" /></>)}
        {S('Migetalke in bički', 11, <><OrgCard id="migetalke" onOpen={setOrg} /><Proc3D id="migetalke" nav={nav} /><MiniCheck id="mc34" /></>)}
        {S('Celična membrana in tekoči mozaik', 11, <><OrgCard id="membrana" onOpen={setOrg} /><MiniCheck id="mc36" /></>)}
        {S('Celična stena', 12, <><OrgCard id="stena" onOpen={setOrg} /><MiniCheck id="tf21" /></>)}
      </>}

      {id === 'primerjava' && <>
        {S('Pet razlik', 13, <><CompareRZ /><MiniCheck id="od3" /></>)}
      </>}

      {id === 'mikroskop' && <>
        {S('Deli svetlobnega mikroskopa', 'prejšnje ure', <><DetailCard id="svetlobni" note="Makrometrski vijak: grobo ostrenje. Mikrometrski vijak: fino ostrenje." /><MiniCheck id="mc51" /></>)}
        {S('Povečava', 'prejšnje ure', <><ZoomLab /><MiniCheck id="mc52" /></>)}
        {S('Enote', 'prejšnje ure', <><Units /></>)}
        <div className="cap" style={{ marginTop: 10 }}>Ta sklop ni v Celica.pdf. Deli in enote so iz tvojih prejšnjih ur, opisi vijakov so dopolnjeni iz standardne snovi.</div>
      </>}

            <div className="stack" style={{ marginTop: 44 }}>
              <button className="btn accent full" onClick={practice}><Dumbbell size={18} /> Vadi ta sklop</button>
              <button className="btn full ghost" onClick={() => nav.oral(id)}><Sparkles size={18} /> Ustno spraševanje iz sklopa</button>
              <div className="cap" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 4 }}><BookOpen size={12} /> Vsa besedila so iz tvojih zapiskov Celica.pdf.</div>
            </div>
          </div>
        </div>
        <div className="edge" onPointerDown={e => drag.start(e)} />
      </motion.div>

      <Sheet open={toc} onClose={() => setToc(false)} title={<span className="t3">Vsebina</span>}>
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

/* povezava na animirano razlago v 3D celici */
function Proc3D({ id, nav }: { id: ProcId; nav: Nav }) {
  const p = PROCS.find(x => x.id === id)!
  return (
    <button className={`proc3d ${p.tone}`} onClick={() => nav.process(id)}>
      <Shape kind={p.shape} size={42} fill="var(--st)" spin={26}><Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 2 }} /></Shape>
      <span className="grow" style={{ minWidth: 0 }}>
        <span className="k">Animacija v 3D</span>
        <span className="n">{p.name}</span>
      </span>
      <ChevronRight size={18} className="chev" />
    </button>
  )
}

/* pot beljakovine, ki jo celica izloči */
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
          <div className="hl">Pot beljakovine, ki jo celica izloči</div>
          <div className="fn">Jedro, zrnati ER, mehurček, Golgijev aparat, membrana.</div>
        </div>
        <button className="iconbtn fill" style={{ width: 40, height: 40 }} onClick={() => { if (step >= PROTEIN_STEPS.length) setStep(0); setAuto(a => !a); if (step === 0) setStep(1) }} aria-label="Predvajaj">{auto ? <Pause size={18} /> : <Play size={18} />}</button>
      </div>
      <div className="stage plain"><CellView kind="animal" focus={cur?.org ?? null} protein={step} /></div>
      <div className="row" style={{ marginTop: 8 }}>
        <button className="iconbtn fill" disabled={step <= 1} onClick={() => { setAuto(false); setStep(x => Math.max(1, x - 1)) }} aria-label="Nazaj"><ChevronLeft size={18} /></button>
        <AnimatePresence mode="wait">
          <motion.div key={step} className="grow" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ textAlign: 'center', fontSize: 15, fontWeight: 500, minHeight: 42 }}>
            {cur ? <><span className="badge accent" style={{ marginRight: 6 }}>{step}/{PROTEIN_STEPS.length}</span>{cur.t}</> : <span className="fn">Pritisni predvajaj ali naprej.</span>}
          </motion.div>
        </AnimatePresence>
        <button className="iconbtn fill" disabled={step >= PROTEIN_STEPS.length} onClick={() => { setAuto(false); setStep(x => x + 1) }} aria-label="Naprej"><ChevronRight size={18} /></button>
      </div>
    </div>
  )
}

function SizeCompare() {
  // logaritemska lestvica: bakterija proti evkariontski celici
  const W = 320
  const x = (um: number) => ((Math.log10(um) + 1) / 3.2) * W
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="hl" style={{ marginBottom: 8 }}>Velikost na logaritemski lestvici</div>
      <svg viewBox={`0 0 ${W} 74`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <rect x={x(0.5)} y={18} width={x(8) - x(0.5)} height={14} rx={7} fill="var(--o-prokw)" opacity={0.55} />
        <rect x={x(10)} y={38} width={x(100) - x(10)} height={14} rx={7} fill="var(--o-jedro)" opacity={0.55} />
        <text x={x(0.5)} y={12} fontSize={10} fill="var(--ink-2)" fontWeight={600}>prokariontske</text>
        <text x={x(10)} y={64} fontSize={10} fill="var(--ink-2)" fontWeight={600} dy={4}>evkariontske</text>
        {[0.1, 1, 10, 100, 1000].map(u => <g key={u}><line x1={x(u)} x2={x(u)} y1={14} y2={56} stroke="var(--line-2)" /><text x={x(u)} y={74} fontSize={9} textAnchor="middle" fill="var(--ink-3)">{fmtUm(u)}</text></g>)}
      </svg>
    </div>
  )
}

export { CON }
