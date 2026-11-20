// Arena v živo potrebuje strežnik (igre v realnem času, lestvica, tekmeci). Open source različica ga nima,
// zato tukaj pokaže kratko pojasnilo in napoti na samostojne vaje, ki delujejo brez povezave.
import { motion } from 'motion/react'
import { Swords, X } from 'lucide-react'

export default function Arena({ onClose }: { code?: string; onClose: () => void }) {
  return (
    <motion.div
      role="dialog" aria-modal="true" aria-label="Arena v živo"
      onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'grid', placeItems: 'center', padding: 24, background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
    >
      <motion.div
        className="card" onClick={e => e.stopPropagation()}
        initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.97 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        style={{ maxWidth: 420, width: '100%', padding: 24, borderRadius: 28, background: 'var(--bg-2, #fff)', position: 'relative' }}
      >
        <button className="fn" aria-label="Zapri" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16 }}><X size={20} /></button>
        <div style={{ width: 52, height: 52, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'var(--violet, #7c5cff)', color: '#fff', marginBottom: 16 }}><Swords size={26} /></div>
        <h2 className="hl" style={{ margin: '0 0 8px' }}>Arena v živo</h2>
        <p className="cap" style={{ margin: 0, lineHeight: 1.5 }}>
          Arena tekmuje z drugimi igralci v realnem času, zato potrebuje strežnik. Ta open source različica deluje brez strežnika,
          zato Arena tukaj ni na voljo. Vse vaje, lekcije, 3D celica in preizkusi delujejo normalno.
        </p>
      </motion.div>
    </motion.div>
  )
}
