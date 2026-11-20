import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ArrowUp, Sparkles, Flag } from 'lucide-react'
import { TOPICS, CON, CONCEPTS, type TopicId } from '../data/concepts'
import { oral, aiDown, type OralTurn, type OralReply } from '../engine/ai'
import { useDictation, MicButton, VERDICT } from '../tasks/explain'
import { get, record } from '../engine/store'
import { retrievability } from '../engine/fsrs'
import { spring, sound } from '../ui/kit'
import type { Task } from '../data/bank'

interface Msg extends OralTurn { verdict?: OralReply['verdict']; missing?: string[]; concept?: string }

export default function Oral({ topic: initial, onClose }: { topic?: string; onClose: () => void }) {
  const [topic, setTopic] = useState<string | null>(initial ?? null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [v, setV] = useState('')
  const first = useRef(new Set<string>())
  const scroller = useRef<HTMLDivElement>(null)
  const dict = useDictation(t => setV(x => (x ? x.trimEnd() + ' ' : '') + t))

  const focusList = (t: string) => {
    const s = get()
    const now = Date.now()
    return CONCEPTS.filter(c => (t === 'vse' || c.topic === t) && c.q)
      .map(c => ({ c, r: s.mem[c.id]?.reps ? retrievability(s.mem[c.id], now) : 0.5 }))
      .sort((a, b) => a.r - b.r).slice(0, 8).map(x => x.c.id)
  }

  const ask = async (history: Msg[]) => {
    if (!topic) return
    setBusy(true); setErr('')
    try {
      const r = await oral(topic, history.map(({ role, text }) => ({ role, text })), focusList(topic))
      if (r.verdict && r.concept && CON[r.concept]) {
        const g = r.verdict === 'pravilno' ? 3 : r.verdict === 'ne_zna' ? 1 : 2
        const pseudo: Task = { t: 'explain', id: 'oral:' + r.concept, c: [r.concept], q: CON[r.concept].q ?? '', kp: CON[r.concept].kp ?? [], ref: CON[r.concept].text }
        record({ task: pseudo, concepts: [r.concept], grade: g, ms: 30000, firstInSession: first.current, xp: g >= 2 ? 15 : 3 })
        sound(g >= 3 ? 'good' : g === 2 ? 'tap' : 'bad')
      }
      setMsgs(m => [...m, { role: 'ai', text: r.say, verdict: r.verdict, missing: r.missing, concept: r.concept }])
    } catch {
      setErr(aiDown() ? 'Ustno spraševanje z AI potrebuje strežnik, ki ga open source različica nima. Za vajo uporabi naloge Razloži v treningu.' : 'AI se ni odzval. Preveri povezavo in poskusi znova.')
    }
    setBusy(false)
  }

  useEffect(() => { if (topic && msgs.length === 0) void ask([]) }, [topic])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' }) }, [msgs, busy])

  const send = () => {
    const text = v.trim()
    if (!text || busy) return
    const nm: Msg[] = [...msgs, { role: 'me', text }]
    setMsgs(nm); setV('')
    void ask(nm)
  }
  const verdicts = msgs.filter(m => m.verdict)
  const score = verdicts.length ? verdicts.reduce((a, m) => a + (m.verdict === 'pravilno' ? 1 : m.verdict === 'ne_zna' ? 0 : 0.5), 0) / verdicts.length : 0

  return (
    <motion.div className="session" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={spring}>
      <div className="s-top">
        <button className="iconbtn glass" onClick={onClose} aria-label="Zapri"><X size={20} /></button>
        <div className="grow">
          <div className="hl" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={16} color="var(--accent)" /> Ustno spraševanje</div>
          <div className="cap">{topic ? (topic === 'vse' ? 'Vse teme' : TOPICS.find(t => t.id === topic)?.title) : 'Izberi temo'}{verdicts.length ? ` · ${verdicts.length} odgovorov · ${Math.round(score * 100)}%` : ''}</div>
        </div>
        {verdicts.length > 0 && <button className="btn xs ghost" onClick={onClose}><Flag size={14} /> Končaj</button>}
      </div>
      <div className="s-body" ref={scroller}>
        <div className="s-inner" style={{ paddingBottom: 170 }}>
          {!topic ? (
            <div className="stack" style={{ marginTop: 10 }}>
              <h2 className="t1">Iz česa te sprašujem?</h2>
              <div className="sub">Sprašujem kot profesorica na ustnem: eno vprašanje naenkrat, strogo ocenim po tvojih zapiskih in povem, kaj manjka. Najprej pridejo pojmi, ki jih najslabše znaš.</div>
              <div className="list" style={{ marginTop: 8 }}>
                <button className="li nolead" onClick={() => setTopic('vse')}><span className="hl grow">Vse teme</span></button>
                {TOPICS.map(t => <button key={t.id} className="li nolead" onClick={() => setTopic(t.id as TopicId)}><span className="legend-dot" style={{ background: t.tint }} /><span className="hl grow">{t.title}</span><span className="cap">{t.pages}</span></button>)}
              </div>
            </div>
          ) : (
            <div className="chat">
              <AnimatePresence initial={false}>
                {msgs.map((m, i) => (
                  <motion.div key={i} className={`msg ${m.role}`} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}>
                    {m.verdict && <div className={`badge ${VERDICT[m.verdict].tone === 'good' ? 'accent' : VERDICT[m.verdict].tone === 'bad' ? 'bad' : 'warn'}`} style={{ marginBottom: 6 }}>{VERDICT[m.verdict].label}</div>}
                    <div>{m.text}</div>
                    {m.missing && m.missing.length > 0 && <div className="fn" style={{ marginTop: 6 }}>Manjka: {m.missing.join('; ')}</div>}
                    {m.concept && CON[m.concept] && <div className="cap" style={{ marginTop: 6 }}>Zapiski, str. {CON[m.concept].page}</div>}
                  </motion.div>
                ))}
              </AnimatePresence>
              {busy && <div className="msg ai"><span className="typing"><span /><span /><span /></span></div>}
              {err && <div className="msg ai" style={{ color: 'var(--bad)' }}>{err} <button className="btn xs ghost" style={{ marginLeft: 6 }} onClick={() => ask(msgs)}>Znova</button></div>}
            </div>
          )}
        </div>
      </div>
      {topic && (
        <div className="s-foot glass" style={{ borderRadius: '30px 30px 0 0' }}>
          <div className="inner row" style={{ alignItems: 'flex-end' }}>
            <MicButton d={dict} />
            <textarea className="field" rows={1} value={v} onChange={e => setV(e.target.value)} placeholder={dict.rec ? 'Snemam …' : 'Odgovori ali govori'} style={{ minHeight: 56, maxHeight: 160, fontSize: 16, padding: '15px 16px' }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
            <button className="mic" style={{ background: v.trim() ? 'var(--ink)' : 'var(--card)', color: v.trim() ? 'var(--bg)' : 'var(--ink-3)' }} onClick={send} disabled={!v.trim() || busy} aria-label="Pošlji"><ArrowUp size={22} /></button>
          </div>
          {dict.err && <div className="fn inner" style={{ marginTop: 6, color: 'var(--bad)' }}>{dict.err}</div>}
        </div>
      )}
    </motion.div>
  )
}
