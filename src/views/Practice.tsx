import { useState } from 'react'
import { motion } from 'motion/react'
import { Sparkles, GraduationCap, Brain, Wand2, ListChecks, ToggleLeft, MousePointerClick, ScanSearch, Link, Shapes, Repeat, TextCursorInput, Puzzle, Highlighter, ListOrdered, Tag, Table, Ruler, PenLine, MessageCircle, ChevronDown, Check, Play } from 'lucide-react'
import type { Nav } from '../App'
import { TOPICS, type TopicId } from '../data/concepts'
import { TYPE_INFO, type TaskType, type Task } from '../data/bank'
import { useStore, set } from '../engine/store'
import { allTasks } from '../engine/gen'
import { genTasks, aiDown } from '../engine/ai'
import { dueCount } from '../engine/stats'
import { Screen, Sheet, SH, TOPIC_LOOK, type Tone } from '../ui/kit'
import { Shape, type ShapeKind } from '../ui/flux'
import { ArrowUpRight, Swords, NotebookPen, BookA } from 'lucide-react'
import { MissBook, Glossary } from './Notebook'
import { ResumeCard } from './Resume'

const ICONS: Record<TaskType, React.ReactNode> = {
  mc: <ListChecks size={17} />, tf: <ToggleLeft size={17} />, locate: <MousePointerClick size={17} />, identify: <ScanSearch size={17} />, match: <Link size={17} />,
  sort: <Shapes size={17} />, recall: <Repeat size={17} />, cloze: <TextCursorInput size={17} />, odd: <Puzzle size={17} />, fix: <Highlighter size={17} />,
  order: <ListOrdered size={17} />, labels: <Tag size={17} />, table: <Table size={17} />, scale: <Ruler size={17} />, type: <PenLine size={17} />, explain: <MessageCircle size={17} />,
}
const TIER: Record<1 | 2 | 3, { name: string; tone: Tone; shape: ShapeKind; d: string }> = {
  1: { name: 'Recognition', tone: 'sky', shape: 'cookie', d: 'You recognise the right answer' },
  2: { name: 'Recall', tone: 'amber', shape: 'clover', d: 'You recall it from memory' },
  3: { name: 'Production', tone: 'coral', shape: 'flower', d: 'You write and explain it yourself' },
}

export default function Practice({ nav }: { nav: Nav }) {
  const s = useStore(x => x)
  const [topic, setTopic] = useState<TopicId | 'vse'>('vse')
  const [pickTopic, setPickTopic] = useState(false)
  const [gen, setGen] = useState<'idle' | 'busy' | 'err'>('idle')
  const [book, setBook] = useState<'napake' | 'slovar' | null>(null)
  const openMiss = Object.values(s.misses ?? {}).filter(m => !m.fixed).length
  const t = topic === 'vse' ? undefined : topic
  const title = t ? TOPICS.find(x => x.id === t)!.title : 'All topics'
  const types = (Object.keys(TYPE_INFO) as TaskType[]).filter(ty => s.settings.ai || ty !== 'explain')
  const all = allTasks()
  const due = dueCount(s, t)

  const makeAI = async () => {
    setGen('busy')
    try {
      const r = await genTasks(t ?? 'organeli', 6)
      const items = (r.items as Task[]).filter(Boolean)
      if (!items.length) throw new Error('empty')
      set(st => ({ ...st, ai: [...st.ai.filter(a => !items.some(b => b.id === a.id)), ...items].slice(-200) }))
      setGen('idle')
      nav.start({ mode: 'smart' }, 'New AI tasks', items.map(task => ({ kind: 'task' as const, task, key: task.id })))
    } catch { setGen('err') }
  }

  const tone: Tone = t ? TOPIC_LOOK[t].tone : 'violet'
  const pop = (k: number) => ({ initial: { opacity: 0, y: 22, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { type: 'spring' as const, bounce: 0.28, duration: 0.7, delay: 0.06 + k * 0.05 } })

  return (
    <Screen title="Practice" tone={tone} deco={['clover', 'cookie']} sub="Choose a mode. All tasks come from your notes."
      right={<button className="chip" style={{ background: 'var(--on)', color: 'var(--c)', boxShadow: 'none' }} onClick={() => setPickTopic(true)}>{title}<ChevronDown size={16} strokeWidth={2.6} /></button>}>

      <ResumeCard nav={nav} />
      <div className="bento">
        <motion.button {...pop(0)} className="tile t-ink span2 hero-tile" data-morph onClick={() => nav.start({ mode: 'smart', topic: t, size: 14 }, title)}>
          <Shape kind="flower" size={200} spin={70} className="deco" style={{ right: -50, top: -60 }} />
          <div className="top">
            <Shape kind="cookie" size={58} fill="var(--lime)" spin={30}><Brain size={27} color="var(--on-lime)" /></Shape>
            <div className="meta">
              <div className="lbl">{due > 0 ? `${due} due` : 'Adaptive'}</div>
              <h2 style={{ margin: '2px 0 0' }}>Smart training</h2>
            </div>
          </div>
          <div className="sub">Reviews at the right time, new concepts and difficulty that adapts to you.</div>
          <span className="btn lime full" style={{ pointerEvents: 'none' }}><Play size={17} fill="currentColor" /> Start</span>
        </motion.button>

        <motion.button {...pop(1)} className="tile t-violet span2" style={{ minHeight: 0, flexDirection: 'row', alignItems: 'center', gap: 14 }} data-morph onClick={() => nav.arena()}>
          <Shape kind="flower" size={150} spin={30} className="deco" style={{ right: 40, top: -60 }} />
          <Shape kind="cookie" size={54} fill="var(--violet)" spin={18}><Swords size={24} color="#fff" /></Shape>
          <div className="grow">
            <div className="ttl" style={{ fontSize: 18 }}><span className="a-live" style={{ marginRight: 7 }} />Live Arena</div>
            <div className="sub" style={{ fontSize: 13.5, marginTop: 2 }}>Quick game or a room with a code for classmates</div>
          </div>
          <span className="go"><ArrowUpRight size={20} strokeWidth={2.5} /></span>
        </motion.button>

        <motion.button {...pop(1)} className="tile t-lime" data-morph onClick={() => nav.oral(t)}>
          <Shape kind="sunny" size={120} spin={40} className="deco" style={{ right: -36, top: -36 }} />
          <Shape kind="sunny" size={44} fill="var(--on-lime)"><Sparkles size={21} color="var(--lime)" /></Shape>
          <div className="ttl" style={{ marginTop: 'auto' }}>Oral exam</div>
          <div className="sub" style={{ fontSize: 13 }}>AI teacher, also by voice</div>
        </motion.button>

        <motion.button {...pop(2)} className="tile t-amber" data-morph onClick={() => nav.start({ mode: 'test', topic: t, size: 18 }, `Test: ${title}`)}>
          <Shape kind="gem" size={120} spin={44} className="deco" style={{ right: -36, top: -36 }} />
          <Shape kind="gem" size={44} fill="var(--amber)"><GraduationCap size={21} color="#fff" /></Shape>
          <div className="ttl" style={{ marginTop: 'auto' }}>Knowledge test</div>
          <div className="sub" style={{ fontSize: 13 }}>18 tasks, grade 1 to 5</div>
        </motion.button>

        <motion.button {...pop(2)} className="tile t-coral" data-morph onClick={() => setBook('napake')}>
          <Shape kind="clover" size={120} spin={40} className="deco" style={{ right: -36, top: -36 }} />
          <Shape kind="clover" size={44} fill="var(--coral)"><NotebookPen size={20} color="#fff" /></Shape>
          {openMiss > 0 && <span className="pc num" style={{ position: 'absolute', right: 14, top: 14 }}>{openMiss}</span>}
          <div className="ttl" style={{ marginTop: 'auto' }}>Mistake notebook</div>
          <div className="sub" style={{ fontSize: 13 }}>{openMiss ? `${openMiss} ${openMiss === 1 ? 'task waiting' : openMiss === 2 ? 'tasks waiting' : openMiss < 5 ? 'tasks waiting' : 'tasks waiting'} to fix` : 'Your mistakes collect here'}</div>
        </motion.button>

        <motion.button {...pop(2)} className="tile t-sky" data-morph onClick={() => setBook('slovar')}>
          <Shape kind="cookie" size={120} spin={44} className="deco" style={{ right: -36, top: -36 }} />
          <Shape kind="cookie" size={44} fill="var(--sky)"><BookA size={20} color="#fff" /></Shape>
          <div className="ttl" style={{ marginTop: 'auto' }}>Glossary</div>
          <div className="sub" style={{ fontSize: 13 }}>Search the notes</div>
        </motion.button>

        {s.settings.ai && (
          <motion.button {...pop(3)} className="tile t-pink span2" style={{ minHeight: 0, flexDirection: 'row', alignItems: 'center', gap: 14 }} data-morph onClick={gen === 'busy' ? undefined : makeAI}>
            <Shape kind="blob" size={54} fill="var(--pink)" spin={gen === 'busy' ? 3 : 20}>{gen === 'busy' ? <span className="spin" style={{ width: 20, height: 20, color: '#fff' }} /> : <Wand2 size={23} color="#fff" />}</Shape>
            <div className="grow">
              <div className="ttl" style={{ fontSize: 18 }}>New AI tasks</div>
              <div className="sub" style={{ fontSize: 13.5, marginTop: 2 }}>{gen === 'busy' ? 'Writing and checking tasks from the notes …' : gen === 'err' ? (aiDown() ? 'Add your own AI key in Progress → AI key to turn this on.' : 'The AI did not answer. Try again.') : `Fresh tasks for: ${title}`}</div>
            </div>
            <span className="go"><ArrowUpRight size={20} strokeWidth={2.5} /></span>
          </motion.button>
        )}
      </div>

      {([1, 2, 3] as const).map(tier => (
        <section key={tier}>
          <SH action={<span className="a">{TIER[tier].d}</span>}>{TIER[tier].name}</SH>
          <div className="types">
            {types.filter(ty => TYPE_INFO[ty].tier === tier).map((ty, k) => {
              const st = s.types[ty]
              const info = TYPE_INFO[ty]
              return (
                <motion.button key={ty} className={`ttile t-${TIER[tier].tone}`} data-morph
                  initial={{ opacity: 0, y: 18, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', bounce: 0.3, duration: 0.6, delay: (k % 4) * 0.04 }}
                  onClick={() => nav.start({ mode: 'type', type: ty, topic: t, size: ty === 'labels' ? 6 : ty === 'explain' ? 5 : 10 }, info.name)}>
                  <Shape kind={TIER[tier].shape} size={40} fill="var(--c)" style={{ color: 'var(--on)' }}><span style={{ color: 'var(--on)', display: 'grid' }}>{ICONS[ty]}</span></Shape>
                  {st?.n ? <span className="pc num">{Math.round((st.ok / st.n) * 100)} %</span> : null}
                  <div style={{ marginTop: 'auto' }}>
                    <div className="n">{info.name}</div>
                    <div className="d">{info.desc}</div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </section>
      ))}
      <div className="cap" style={{ textAlign: 'center', marginTop: 22 }}>Total {all.length} tasks · {s.ai.length} from AI</div>

      <MissBook open={book === 'napake'} onClose={() => setBook(null)} nav={nav} />
      <Glossary open={book === 'slovar'} onClose={() => setBook(null)} nav={nav} />

      <Sheet open={pickTopic} onClose={() => setPickTopic(false)} title={<span className="t3">Topic</span>}>
        <div className="list">
          {[{ id: 'vse' as const, title: 'All topics', tint: 'var(--ink)' }, ...TOPICS.map(x => ({ ...x, tint: `var(--${TOPIC_LOOK[x.id].tone})` }))].map(x => (
            <button key={x.id} className="li" onClick={() => { setTopic(x.id as TopicId | 'vse'); setPickTopic(false) }}>
              <span style={{ width: 30, display: 'grid', placeItems: 'center' }}><span className="legend-dot" style={{ background: x.tint, width: 12, height: 12 }} /></span>
              <span className="grow t">{x.title}</span>
              {topic === x.id && <Check size={19} color="var(--accent-ink)" strokeWidth={2.6} />}
            </button>
          ))}
        </div>
      </Sheet>
    </Screen>
  )
}
