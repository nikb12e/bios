import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useTransform } from 'motion/react'
import { GraduationCap, Dumbbell, ChartNoAxesColumn, Sparkles, WifiOff, X, Swords } from 'lucide-react'
import Home from './views/Home'
import { LessonView } from './views/Lesson'
import Practice from './views/Practice'
import Progress from './views/Progress'
import Session from './views/Session'
import Oral from './views/Oral'
import Login from './views/Login'
import type { SessionOpts, Item } from './engine/gen'
import type { SavedSession } from './engine/store'
import { boot, useAuth, clearNote } from './engine/auth'
import { TOP, type TopicId } from './data/concepts'
import { spring, Avatar, useWide } from './ui/kit'
import { BurstHost, useLiquid } from './ui/flux'

import type { ProcId } from './art/procs'
import type { OrgId } from './data/organelles'
export type CellReq = { proc?: ProcId; org?: OrgId; k: number }
const Explore = lazy(() => import('./views/Explore'))
const Arena = lazy(() => import('./views/Arena'))

export type Tab = 'danes' | 'celica' | 'vaje' | 'napredek'
export interface Nav {
  tab: (t: Tab) => void
  start: (opts: SessionOpts, title: string, items?: Item[]) => void
  /** nadaljuje nedokončano sejo, shranjeno na tej napravi */
  resume: (s: SavedSession) => void
  oral: (topic?: string) => void
  lesson: (topic: string | null) => void
  arena: (code?: string) => void
  /** odpre celico v 3D z animirano razlago procesa */
  process: (id: ProcId) => void
  /** odpre celico in poudari organel */
  cell: (org: OrgId) => void
}

function CellIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round">
      <path d="M12 3.2c4.9 0 8.8 3.6 8.8 8.4 0 5-3.7 9.2-8.6 9.2-4.6 0-9-3.4-9-8.5 0-5.2 3.9-9.1 8.8-9.1Z" />
      <circle cx="10.5" cy="11.5" r="3.1" />
      <path d="M16.3 8.2c.6.8 1 1.8 1 2.9M15.5 15.6l1.4.8" />
    </svg>
  )
}

const TABS: { id: Tab; label: string; icon: (s: number) => React.ReactNode }[] = [
  { id: 'danes', label: 'Učenje', icon: s => <GraduationCap size={s} strokeWidth={1.9} /> },
  { id: 'celica', label: 'Celica', icon: s => <CellIcon size={s} /> },
  { id: 'vaje', label: 'Vaje', icon: s => <Dumbbell size={s} strokeWidth={1.9} /> },
  { id: 'napredek', label: 'Napredek', icon: s => <ChartNoAxesColumn size={s} strokeWidth={1.9} /> },
]
const ORDER = TABS.map(t => t.id)

export default function App() {
  const auth = useAuth()
  useEffect(() => { void boot() }, [])
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {auth.status === 'loading' ? <Splash key="splash" />
          : auth.status === 'out' ? <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}><Login /></motion.div>
          : <motion.div key={'app:' + auth.user!.id} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0, duration: 0.55 }}><Shell /></motion.div>}
      </AnimatePresence>
    </MotionConfig>
  )
}

// temen dok: limetni mehurček teče do izbranega zavihka (sprednji rob prehiti, zadnji dohiti)
function TabBar({ tab, go }: { tab: Tab; go: (t: Tab) => void }) {
  const i = ORDER.indexOf(tab)
  const { start, size, squash } = useLiquid(i, 25)
  const left = useTransform(start, v => `${v}%`)
  const width = useTransform(size, v => `${v}%`)
  return (
    <nav className="tabbar" aria-label="Glavni meni">
      <div className="rail"><motion.span className="liq" style={{ left, width, scaleY: squash }} /></div>
      {TABS.map(t => (
        <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => go(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
          <motion.span animate={{ scale: tab === t.id ? 1.1 : 1, y: tab === t.id ? -1 : 0 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }}>{t.icon(23)}</motion.span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

function SideNav({ tab, go }: { tab: Tab; go: (t: Tab) => void }) {
  const i = ORDER.indexOf(tab)
  const { start, size, squash } = useLiquid(i, 52)
  const height = useTransform(size, v => v - 4)
  return (
    <nav className="side-nav">
      <motion.span className="liq" style={{ top: start, height, scaleX: squash }} />
      {TABS.map(t => (
        <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => go(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
          <span className="i">{t.icon(20)}</span><span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

function Splash() {
  return (
    <motion.div className="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <motion.img src="/icon.svg" alt="Bios" width={76} height={76} animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />
    </motion.div>
  )
}

function Shell() {
  const { user, offline, note } = useAuth()
  const wide = useWide()
  const [tab, setTabRaw] = useState<Tab>(() => { const h = location.hash.slice(1) as Tab; return ORDER.includes(h) ? h : 'danes' })
  const scrolls = useRef<Partial<Record<Tab, number>>>({})
  const [session, setSession] = useState<{ opts: SessionOpts; title: string; items?: Item[]; resume?: SavedSession; k: number } | null>(null)
  const [oralOpen, setOralOpen] = useState<{ topic?: string } | null>(null)
  const [lessonTopic, setLessonTopic] = useState<TopicId | null>(null)
  const [cellReq, setCellReq] = useState<CellReq | null>(null)
  // povezava ?arena=KODA odpre sobo neposredno
  const [arena, setArena] = useState<{ code?: string } | null>(() => {
    const c = new URLSearchParams(location.search).get('arena')
    if (!c) return null
    history.replaceState(null, '', location.pathname + location.hash)
    return { code: c.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || undefined }
  })

  const setTab = useCallback((t: Tab) => {
    setTabRaw(prev => { if (prev !== t) scrolls.current[prev] = window.scrollY; return t })
  }, [])

  // vsak zavihek si zapomni, kje si bil (kot iOS)
  useLayoutEffect(() => {
    history.replaceState(null, '', '#' + tab)
    window.scrollTo({ top: scrolls.current[tab] ?? 0 })
  }, [tab])

  const nav: Nav = {
    tab: setTab,
    start: useCallback((opts, title, items) => setSession({ opts, title, items, k: Date.now() }), []),
    resume: useCallback((s: SavedSession) => { setLessonTopic(null); setSession({ opts: s.opts as unknown as SessionOpts, title: s.title, resume: s, k: Date.now() }) }, []),
    oral: useCallback(topic => setOralOpen({ topic }), []),
    lesson: useCallback(t => { if (t && TOP[t as TopicId]) setLessonTopic(t as TopicId) }, []),
    arena: useCallback(code => setArena({ code }), []),
    process: useCallback((id: ProcId) => { setLessonTopic(null); setCellReq({ proc: id, k: Date.now() }); setTab('celica') }, [setTab]),
    cell: useCallback((org: OrgId) => { setLessonTopic(null); setCellReq({ org, k: Date.now() }); setTab('celica') }, [setTab]),
  }
  // obvestilo (npr. dobrodošlica) se po nekaj sekundah samo umakne
  useEffect(() => {
    if (!note) return
    const tm = setTimeout(clearNote, 6500)
    return () => clearTimeout(tm)
  }, [note])
  useEffect(() => {
    if (!offline) return
    const f = () => { void boot() }
    window.addEventListener('online', f)
    return () => window.removeEventListener('online', f)
  }, [offline])
  const go = (t: Tab) => { if (t === tab) { window.scrollTo({ top: 0, behavior: 'smooth' }); return } setTab(t) }

  return (
    <div className={`app ${wide ? 'is-wide' : ''}`}>
      {wide && (
        <aside className="side glass" aria-label="Glavni meni">
          <div className="brand"><img src="/icon.svg" alt="" width={30} height={30} /><span>Bios</span></div>
          <SideNav tab={tab} go={go} />
          <div className="grow" />
          <button className="side-quick" onClick={() => setArena({})}><Swords size={17} /> Arena v živo</button>
          <button className="side-quick" onClick={() => setOralOpen({})}><Sparkles size={17} /> Ustno spraševanje</button>
          <button className="side-user" onClick={() => go('napredek')}>
            <Avatar name={user!.name} src={user!.picture} size={36} />
            <span className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
              <span className="hl" style={{ display: 'block', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user!.name}</span>
              <span className="cap" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{offline ? 'Brez povezave' : user!.email}</span>
            </span>
          </button>
        </aside>
      )}

      {/* zavihki se zamenjajo takoj, z zelo kratkim prelivom (brez čakanja na izhod) */}
      <motion.main key={tab} className="main" initial={{ opacity: 0, y: 14, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0, duration: 0.42 }}>
        {tab === 'danes' && <Home nav={nav} />}
        {tab === 'celica' && <Suspense fallback={<div className="page"><div className="empty">Nalagam celico …</div></div>}><Explore nav={nav} req={cellReq} /></Suspense>}
        {tab === 'vaje' && <Practice nav={nav} />}
        {tab === 'napredek' && <Progress nav={nav} />}
      </motion.main>

      <AnimatePresence>
        {lessonTopic && <LessonView key={lessonTopic} nav={nav} id={lessonTopic} onBack={() => setLessonTopic(null)} />}
      </AnimatePresence>

      {!wide && tab !== 'celica' && <div className="edgefade" />}
      {!wide && (
        <TabBar tab={tab} go={go} />
      )}
      <BurstHost />

      <AnimatePresence>
        {(note || offline) && (
          <motion.div className="toast glass row" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={spring} style={{ gap: 10, maxWidth: 'min(92vw, 520px)' }}>
            {offline ? <><WifiOff size={16} /><span className="fn" style={{ color: 'var(--ink)' }}>Brez povezave. Napredek se shrani in uskladi pozneje.</span></> : <span className="fn" style={{ color: 'var(--ink)' }}>{note}</span>}
            {note && <button className="iconbtn" style={{ width: 28, height: 28 }} onClick={clearNote} aria-label="Zapri"><X size={15} /></button>}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {session && <Session key={session.k} opts={session.opts} title={session.title} items={session.items} resume={session.resume} onClose={() => setSession(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {oralOpen && <Oral topic={oralOpen.topic} onClose={() => setOralOpen(null)} />}
      </AnimatePresence>
      <Suspense fallback={null}>
        <AnimatePresence>
          {arena && <Arena key="arena" code={arena.code} onClose={() => setArena(null)} />}
        </AnimatePresence>
      </Suspense>
    </div>
  )
}
