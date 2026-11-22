/* Version history: a timeline of updates and a card with what is new after an update. */
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, Wrench, X, ChevronRight } from 'lucide-react'
import { VERSIONS, CURRENT, fmtDate } from '../data/versions'
import { Sheet } from '../ui/kit'
import { Shape } from '../ui/flux'
import { get } from '../engine/store'

const SEEN = 'bios.seenVersion'

export function VersionsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title={<span className="t3">Version history</span>}>
      <div className="vh">
        {VERSIONS.map((r, i) => (
          <motion.section key={r.v} className={`vh-item${i === 0 ? ' now' : ''}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.6, delay: Math.min(i, 6) * 0.05 }}>
            <div className="vh-rail"><span className="vh-dot" /></div>
            <div className="vh-body">
              <div className="vh-head">
                <span className="vh-v">{r.v}</span>
                <span className="vh-date">{fmtDate(r.date)}</span>
                {i === 0 && <span className="badge accent">Current</span>}
              </div>
              <h3 className="vh-title">{r.title}</h3>
              <p className="vh-sub">{r.sub}</p>
              <ul className="vh-list">
                {r.added.map(a => <li key={a}><Sparkles size={14} />{a}</li>)}
                {r.fixed?.map(a => <li key={a} className="fix"><Wrench size={14} />{a}</li>)}
              </ul>
            </div>
          </motion.section>
        ))}
      </div>
    </Sheet>
  )
}

// card on the home screen: shown once after every update
export function WhatsNew() {
  const [seen, setSeen] = useState(() => { try { return localStorage.getItem(SEEN) } catch { return CURRENT } })
  const [open, setOpen] = useState(false)
  const r = VERSIONS[0]
  const close = () => { try { localStorage.setItem(SEEN, CURRENT) } catch { /* private mode */ } setSeen(CURRENT) }
  // a brand new user (no progress): no news card, just remember the version
  if (seen === null && !Object.keys(get().mem).length) { try { localStorage.setItem(SEEN, CURRENT) } catch { /* */ } return null }
  return (
    <>
      <AnimatePresence>
        {seen !== CURRENT && (
          <motion.div className="whatsnew" initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}>
            <button className="wn-main" onClick={() => setOpen(true)}>
              <Shape kind="sunny" size={40} fill="var(--violet)" spin={12}><Sparkles size={17} color="#fff" /></Shape>
              <span className="grow">
                <span className="wn-k">New in version {r.v}</span>
                <span className="wn-t">{r.title}: {r.sub.charAt(0).toLowerCase() + r.sub.slice(1)}</span>
              </span>
              <ChevronRight size={18} className="chev" />
            </button>
            <button className="iconbtn wn-x" onClick={close} aria-label="Hide"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
      <VersionsSheet open={open} onClose={() => { setOpen(false); close() }} />
    </>
  )
}
