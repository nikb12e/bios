import { motion, AnimatePresence } from 'motion/react'
import { Play, X } from 'lucide-react'
import type { Nav } from '../App'
import { useSavedSession, clearSession } from '../engine/store'
import { Shape } from '../ui/flux'

const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000)
  if (m < 1) return 'pravkar'
  if (m < 60) return `pred ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `pred ${h} h`
  const d = Math.round(h / 24)
  return d === 1 ? 'včeraj' : `pred ${d} dnevi`
}

// nedokončana seja na tej napravi: en dotik in nadaljuješ, kjer si ostal
export function ResumeCard({ nav }: { nav: Nav }) {
  const s = useSavedSession()
  const answered = s ? (s.log as unknown[]).length : 0
  return (
    <AnimatePresence initial={false}>
      {s && (
        <motion.div key="resume" className="resume t-lime" initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 12 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}>
          <button className="resume-main" onClick={() => nav.resume(s)}>
            <Shape kind="sunny" size={46} fill="var(--on-lime)" spin={24}><Play size={18} color="var(--lime)" fill="var(--lime)" style={{ marginLeft: 2 }} /></Shape>
            <span className="grow" style={{ minWidth: 0 }}>
              <span className="rk">Nedokončana seja · {ago(s.at)}</span>
              <span className="rt">{s.title}</span>
              <span className="rb"><i style={{ width: `${Math.round((s.i / Math.max(1, s.items.length)) * 100)}%` }} /></span>
              <span className="rs">{Math.min(s.i + 1, s.items.length)} od {s.items.length} · {answered} {answered === 1 ? 'odgovor shranjen' : answered === 2 ? 'odgovora shranjena' : answered < 5 ? 'odgovori shranjeni' : 'odgovorov shranjenih'}</span>
            </span>
          </button>
          <button className="resume-x" onClick={clearSession} aria-label="Opusti nedokončano sejo"><X size={16} strokeWidth={2.6} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
