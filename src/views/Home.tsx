import { useState } from 'react'
import { motion } from 'motion/react'
import { Glossary } from './Notebook'
import { ResumeCard } from './Resume'
import { Play, Target, Flame, RotateCcw, ArrowUpRight, Brain, Swords, Search } from 'lucide-react'
import type { Nav } from '../App'
import { useStore, streak, dayKey } from '../engine/store'
import { useAuth } from '../engine/auth'
import { topicMastery, dueCount, newCount, weakest, levelCounts } from '../engine/stats'
import { TOPICS, conceptsOf } from '../data/concepts'
import { Screen, Avatar, CountUp, SH, TOPIC_LOOK } from '../ui/kit'
import { Shape, Wavy, WavyRing } from '../ui/flux'
import { PROCS } from '../art/procs'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const GOAL = 20

const pop = (i: number) => ({ initial: { opacity: 0, y: 22, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { type: 'spring' as const, bounce: 0.28, duration: 0.7, delay: 0.06 + i * 0.05 } })

export default function Home({ nav }: { nav: Nav }) {
  const s = useStore(x => x)
  const [gl, setGl] = useState(false)
  const { user } = useAuth()
  const d = new Date()
  const done = s.days[dayKey()]?.n ?? 0
  const due = dueCount(s), fresh = newCount(s)
  const newN = Math.min(fresh, s.settings.newPerSession)
  const started = Object.keys(s.mem).length > 0
  const goalMet = done >= GOAL
  const st = streak(s)
  const know = topicMastery(s)
  const weak = weakest(s, 3)
  const mins = Math.max(5, Math.round((Math.min(14, due + newN * 2) * 40) / 60))
  const plan = due > 0
    ? `${due} ${due === 1 ? 'concept to review' : 'concepts to review'}${newN ? ` and ${newN} new` : ''}`
    : newN > 0 ? `${newN} ${newN === 1 ? 'new concept' : 'new concepts'} from the notes` : 'Everything is reviewed. Lock it in with a test.'
  const firstName = (user?.name ?? s.settings.name).split(' ')[0]
  const dni = st === 1 ? 'day' : 'days'

  return (
    <Screen title="Learn" tone="lime" kicker={`${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`} sub={goalMet ? `Daily goal reached, ${firstName}.` : `Hi, ${firstName}. ${plan}.`}
      right={<div className="row" style={{ gap: 8 }}>
        <button className="iconbtn solid home-search" onClick={() => setGl(true)} aria-label="Glossary"><Search size={19} strokeWidth={2.4} /></button>
        <button onClick={() => nav.tab('napredek')} aria-label="Profile"><Avatar name={user?.name ?? 'B'} src={user?.picture} size={42} /></button>
      </div>}>

      <ResumeCard nav={nav} />
      <div className="bento">
        <motion.button {...pop(0)} className="tile t-ink span2 hero-tile" data-morph onClick={() => nav.start({ mode: 'smart' }, 'Today\'s training')}>
          <Shape kind="cookie12" size={210} spin={80} className="deco" style={{ right: -60, bottom: -80 }} />
          <div className="top">
            <WavyRing value={done / GOAL} size={104} stroke={9} color="var(--lime)">
              <div style={{ lineHeight: 1 }}>
                <div className="big sm" style={{ color: 'var(--on-dock)' }}><CountUp to={Math.min(done, 99)} /></div>
                <div className="cap" style={{ color: 'color-mix(in srgb, var(--on-dock) 60%, transparent)', marginTop: 3 }}>of {GOAL}</div>
              </div>
            </WavyRing>
            <div className="meta">
              <div className="lbl">{goalMet ? 'Goal reached' : 'Today\'s training'}</div>
              <h2>{goalMet ? 'One more round?' : started ? 'Continue where you left off' : 'Start with the cell'}</h2>
              <div className="sub">{mins} min · {plan}</div>
            </div>
          </div>
          <span className="btn lime full" style={{ pointerEvents: 'none' }}>
            {goalMet ? <><RotateCcw size={18} strokeWidth={2.6} /> One more round</> : <><Play size={17} fill="currentColor" /> {started ? 'Continue' : 'Start'}</>}
          </span>
        </motion.button>

        <motion.div {...pop(1)} className="tile t-coral">
          <Shape kind="sunny" size={120} spin={40} className="deco" style={{ right: -34, top: -34 }} />
          <Shape kind="sunny" size={42} fill="var(--coral)"><Flame size={21} color="#fff" fill="#fff" /></Shape>
          <div className="foot" style={{ alignItems: 'baseline' }}><span className="big md"><CountUp to={st} /></span><span className="lbl">{dni} in a row</span></div>
        </motion.div>

        <motion.div {...pop(2)} className="tile t-violet">
          <Shape kind="flower" size={120} spin={46} className="deco" style={{ right: -34, top: -34 }} />
          <div className="lbl">Knowledge</div>
          <div className="big md" style={{ marginTop: 'auto' }}><CountUp to={Math.round(know * 100)} /><span className="unit">%</span></div>
          <Wavy value={know} />
        </motion.div>

        <motion.button {...pop(3)} className="tile t-sky span2" style={{ minHeight: 0, flexDirection: 'row', alignItems: 'center', gap: 14 }} data-morph
          onClick={() => nav.start({ mode: weak.length ? 'weak' : 'smart', size: 12 }, weak.length ? 'Weak spots' : 'Reviews')}>
          <Shape kind="clover" size={54} fill="var(--sky)">{weak.length ? <Target size={24} color="#fff" /> : <Brain size={24} color="#fff" />}</Shape>
          <div className="grow">
            <div className="ttl" style={{ fontSize: 18 }}>{weak.length ? 'Fix weak spots' : `${due} to review`}</div>
            <div className="sub" style={{ fontSize: 13.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{weak.length ? weak.map(w => w.c.label).join(', ') : 'Reviews at the right time'}</div>
          </div>
          <span className="go"><ArrowUpRight size={20} strokeWidth={2.5} /></span>
        </motion.button>
        <motion.button {...pop(4)} className="tile t-violet span2 arena-tile" style={{ minHeight: 0, flexDirection: 'row', alignItems: 'center', gap: 14 }} data-morph onClick={() => nav.arena()}>
          <Shape kind="flower" size={150} spin={30} className="deco" style={{ right: 40, top: -60 }} />
          <Shape kind="cookie" size={54} fill="var(--violet)" spin={18}><Swords size={24} color="#fff" /></Shape>
          <div className="grow">
            <div className="ttl" style={{ fontSize: 18 }}><span className="a-live" style={{ marginRight: 7 }} />Live Arena</div>
            <div className="sub" style={{ fontSize: 13.5, marginTop: 2 }}>Compete with others in real time</div>
          </div>
          <span className="go"><ArrowUpRight size={20} strokeWidth={2.5} /></span>
        </motion.button>
      </div>

      <SH action={<span className="a">the cell in 3D</span>}>Animated explanations</SH>
      <div className="proc-row" role="list">
        {PROCS.map((p, i) => (
          <motion.button key={p.id} role="listitem" className={`proc-tile ${p.tone}`} data-morph onClick={() => nav.process(p.id)}
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: 'spring', bounce: 0.2, duration: 0.6, delay: Math.min(i, 3) * 0.05 }}>
            <Shape kind={p.shape} size={130} spin={50 + i * 6} className="deco" style={{ right: -40, top: -40 }} />
            <Shape kind={p.shape} size={44} fill="var(--st)" spin={22}><Play size={17} color="#fff" fill="#fff" style={{ marginLeft: 2 }} /></Shape>
            <div className="pt">{p.name}</div>
            <div className="ps">{p.sub}</div>
          </motion.button>
        ))}
      </div>

      <SH action={<span className="a">from the Cell.pdf notes</span>}>Topics</SH>
      <div className="topics">
        {TOPICS.map((t, i) => {
          const m = topicMastery(s, t.id)
          const lv = levelCounts(s, t.id)
          const n = conceptsOf(t.id).length
          const look = TOPIC_LOOK[t.id]
          return (
            <motion.button key={t.id} className={`topic t-${look.tone}`} data-morph onClick={() => nav.lesson(t.id)}
              initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -6% 0px' }} transition={{ type: 'spring', bounce: 0.25, duration: 0.7, delay: (i % 2) * 0.05 }}>
              <Shape kind={look.shape} size={170} spin={60 + i * 7} className="deco" />
              <Shape kind={m >= 0.8 ? 'sunny' : look.shape} size={52} fill="var(--st)" spin={m > 0 ? 24 : 0} style={{ gridRow: 'span 2' }}><span className="sn" style={{ color: 'var(--c)' }}>{i + 1}</span></Shape>
              <div>
                <div className="tt">{t.title}</div>
                <div className="ts">{lv.obvladam + lv.utrjujem} of {n} mastered · {t.pages}</div>
              </div>
              <Wavy value={m} />
            </motion.button>
          )
        })}
      </div>
      <Glossary open={gl} onClose={() => setGl(false)} nav={nav} />
    </Screen>
  )
}
