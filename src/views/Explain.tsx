/* The "Let's explain" card: it appears only when the app notices that a concept is not going well.
   It shows your answer next to the correct one, an animation, a personal AI explanation (with your own key, cached) and a voice. */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, Volume2, Square, Sparkles, X as XIcon, Check } from 'lucide-react'
import { CON, TOP } from '../data/concepts'
import { ORG } from '../data/organelles'
import type { ExplainCtx } from '../engine/gen'
import { levelOfConcept } from '../engine/gen'
import { get } from '../engine/store'
import { llmJson, llmReady } from '../engine/llm'
import { sfx, speak, stopSpeak, onSpeaking, preloadVoice } from '../ui/sfx'
import { Shape } from '../ui/flux'
import { explainerFor } from '../art/Explainers'
import { ConceptVisual, hasConceptVisual } from './Session'

export interface AiExplain { lead: string; why?: string; steps: string[]; tip?: string; analogy?: string }

const LS = 'bios.expl.v1'
function cacheGet(k: string): AiExplain | undefined {
  try { return (JSON.parse(localStorage.getItem(LS) ?? '{}') as Record<string, AiExplain>)[k] } catch { return undefined }
}
function cachePut(k: string, v: AiExplain) {
  try {
    const all = JSON.parse(localStorage.getItem(LS) ?? '{}') as Record<string, AiExplain>
    all[k] = v
    const keys = Object.keys(all)
    if (keys.length > 120) keys.slice(0, keys.length - 120).forEach(x => delete all[x])
    localStorage.setItem(LS, JSON.stringify(all))
  } catch { /* storage full */ }
}

// explanation from the notes when AI is not available (always correct, because it is the material itself)
function notesExplain(id: string, ctx: ExplainCtx, deep: boolean): AiExplain {
  const c = CON[id]
  const o = c.org ? ORG[c.org] : undefined
  const steps = (c.kp ?? []).map(k => k[0].toUpperCase() + k.slice(1) + '.')
  return {
    lead: c.text,
    why: ctx.idk ? undefined : ctx.chosen && ctx.correct ? `You chose “${ctx.chosen}”, but the correct answer is “${ctx.correct}”.` : undefined,
    steps: deep ? steps : steps.slice(0, 3),
    tip: o?.pazi,
  }
}

function Foot({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null)
  useEffect(() => { setEl(document.getElementById('s-foot-slot')) }, [])
  return el ? createPortal(children, el) : null
}

export function ExplainCard({ concept, ctx, onNext }: { concept: string; ctx: ExplainCtx; onNext: () => void }) {
  const c = CON[concept]
  const th = levelOfConcept(concept)
  const deep = th < 2.6 || ctx.misses >= 2 || !!ctx.idk
  const key = `${concept}|${ctx.taskId}|${ctx.idk ? 'idk' : (ctx.chosen ?? '').slice(0, 60)}|${deep ? 'd' : 's'}`
  const base = useMemo(() => notesExplain(concept, ctx, deep), [concept, ctx, deep])
  const [ai, setAi] = useState<AiExplain | undefined>(() => cacheGet(key))
  const [loading, setLoading] = useState(!ai && get().settings.ai && llmReady())
  const [speaking, setSpeaking] = useState(false)
  const [stage, setStage] = useState(0)
  const ex = ai ?? base
  const viz = explainerFor(concept)
  const voiceText = useMemo(() => [ex.lead, ex.why, ...ex.steps, ex.tip].filter(Boolean).join(' '), [ex])
  const autoSpoke = useRef(false)

  // sound when it opens, then a staged reveal
  useEffect(() => {
    sfx('explain')
    const ts = [1, 2, 3, 4, 5].map(k => setTimeout(() => setStage(k), 180 + k * 260))
    return () => { ts.forEach(clearTimeout); stopSpeak() }
  }, [])
  useEffect(() => onSpeaking(setSpeaking), [])

  // personal explanation with your own AI key, cached in this browser
  useEffect(() => {
    if (ai || !get().settings.ai || !llmReady()) { setLoading(false); return }
    let dead = false
    const c = CON[concept]
    const related = Object.values(CON).filter(x => x.topic === c.topic && x.id !== c.id).slice(0, 10)
    void llmJson<{ why?: string; lead?: string; steps?: unknown[]; analogy?: string; tip?: string }>(EXPLAIN_SYS, explainUser(c, related, ctx, deep), { maxTokens: 1400, temperature: 0.3, timeoutMs: 20000 })
      .then(p => {
        if (dead) return
        if (p?.lead && Array.isArray(p.steps)) {
          const clean = (x: unknown, n: number) => String(x ?? '').replace(/\s[–—-]\s/g, ', ').trim().slice(0, n)
          const ex: AiExplain = { lead: clean(p.lead, 400), why: ctx.idk ? undefined : clean(p.why, 320) || undefined, steps: p.steps.map(x => clean(x, 260)).filter(Boolean).slice(0, 6), analogy: clean(p.analogy, 260) || undefined, tip: clean(p.tip, 220) || undefined }
          setAi(ex); cachePut(key, ex)
        }
        setLoading(false)
      })
    return () => { dead = true }
  }, [key])

  // voice: when "Read explanations aloud" is on, it speaks by itself
  useEffect(() => {
    if (loading) return
    if (get().settings.voice && !autoSpoke.current) {
      preloadVoice(voiceText)
      autoSpoke.current = true
      const t = setTimeout(() => { void speak(voiceText) }, 900)
      return () => clearTimeout(t)
    }
  }, [loading, voiceText])

  const toggleVoice = () => {
    if (speaking) { stopSpeak(); return }
    sfx('tap')
    void speak(voiceText)
  }

  const st = (k: number) => ({ initial: { opacity: 0, y: 18, filter: 'blur(6px)' }, animate: stage >= k ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}, transition: { type: 'spring' as const, bounce: 0.22, duration: 0.7 } })

  return (
    <div className="ex">
      <motion.div className="qtype" {...st(0)} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}>
        <Shape kind="sunny" size={30} fill="var(--violet)" spin={10}><Sparkles size={15} color="#fff" /></Shape>
        <span className="hl" style={{ fontSize: 15 }}>Let's explain</span>
        <span className="fn">· {TOP[c.topic].src !== TOP[c.topic].title ? TOP[c.topic].title + ' · ' + TOP[c.topic].src : TOP[c.topic].title}, {/^\d/.test(String(c.page)) ? 'p. ' + c.page : c.page}</span>
      </motion.div>
      <motion.h2 className="t1" style={{ margin: '4px 2px 14px' }} initial={{ opacity: 0, fontWeight: 360 }} animate={{ opacity: 1, fontWeight: 770 }} transition={{ type: 'spring', bounce: 0.2, duration: 0.9, delay: 0.1 }}>{c.label}</motion.h2>

      {(ctx.correct || ctx.idk) && (
        <motion.div className="ex-vs" {...st(1)}>
          <div className={`ex-side ${ctx.idk ? 'idk' : 'bad'}`}>
            <span className="ex-ic">{ctx.idk ? '?' : <XIcon size={14} strokeWidth={3} />}</span>
            <div><div className="ex-lbl">{ctx.idk ? 'You said' : 'Your answer'}</div><div className="ex-val">{ctx.idk ? 'I don\'t know' : ctx.chosen || 'wrong answer'}</div></div>
          </div>
          {ctx.correct && (
            <div className="ex-side good">
              <span className="ex-ic"><Check size={14} strokeWidth={3} /></span>
              <div><div className="ex-lbl">Correct</div><div className="ex-val">{ctx.correct}</div></div>
            </div>
          )}
        </motion.div>
      )}

      <motion.div style={{ marginBottom: 14 }} {...st(2)}>
        {viz ?? (hasConceptVisual(concept) ? <ConceptVisual id={concept} /> : null)}
      </motion.div>

      <motion.div className="ex-body" {...st(3)}>
        <div className="ex-head">
          <span className="ex-src">{ai ? <><Sparkles size={13} /> Personal explanation</> : loading ? <><Sparkles size={13} /> Writing an explanation for you</> : 'From the notes'}</span>
          <button className={`ex-voice${speaking ? ' on' : ''}`} onClick={toggleVoice} aria-label={speaking ? 'Stop the voice' : 'Listen to the explanation'}>
            {speaking ? <Square size={14} fill="currentColor" /> : <Volume2 size={16} />}
            {speaking ? <span className="ex-wave"><i /><i /><i /><i /></span> : 'Listen'}
          </button>
        </div>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="sk" className="ex-sk" exit={{ opacity: 0 }}><i /><i /><i style={{ width: '62%' }} /></motion.div>
          ) : (
            <motion.div key={ai ? 'ai' : 'n'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {ex.why && <p className="ex-why">{ex.why}</p>}
              <p className="read" style={{ margin: '0 0 10px' }}>{ex.lead}</p>
              {ex.steps.length > 0 && (
                <ol className="ex-steps">
                  {ex.steps.map((s, i) => (
                    <motion.li key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.18, type: 'spring', bounce: 0.2 }}>
                      <span className="n">{i + 1}</span><span>{s}</span>
                    </motion.li>
                  ))}
                </ol>
              )}
              {ex.analogy && <div className="ex-ana"><b>Picture this</b><span>{ex.analogy}</span></div>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {ex.tip && !loading && <motion.div className="pazi" style={{ marginTop: 12 }} {...st(4)}><b>Watch out</b><span>{ex.tip}</span></motion.div>}

      <Foot><button className="btn full accent" onClick={() => { stopSpeak(); sfx('tap'); onNext() }}>Got it, test me <ArrowRight size={18} /></button></Foot>
    </div>
  )
}

const EXPLAIN_SYS = `You are a patient and precise biology tutor for a first year upper secondary student. Write in clear, simple English, address the student as "you", use short sentences and no dashes.
Use ONLY facts from the material (the student's notes). Write scientific terms exactly as they are in the material.
The student has just answered wrongly or said "I don't know". First show clearly where their thinking went wrong (if they chose a wrong answer), then explain the core idea in logical steps and add one vivid comparison from everyday life.
Return only JSON: {"why":"one or two sentences on why their answer is wrong (empty if they said I don't know)","lead":"one or two sentences with the core idea","steps":["step","step","step"],"analogy":"one sentence: picture this ...","tip":"one sentence: what to watch out for in a test"}`

function explainUser(c: (typeof CON)[string], related: (typeof CON)[string][], ctx: ExplainCtx, deep: boolean) {
  const line = (x: (typeof CON)[string]) => `[${x.id}] ${x.label}: ${x.text}${x.kp?.length ? ` (key points: ${x.kp.join('; ')})` : ''}`
  return `Material for the concept:\n${line(c)}\n\nRelated material:\n${related.map(line).join('\n')}\n\nTask: ${ctx.prompt}\n${ctx.idk ? 'The student said: I don\'t know.' : `Student's answer: ${ctx.chosen ?? '(wrong)'}`}\nCorrect answer: ${ctx.correct ?? '(see the material)'}\n\n${deep ? 'The student does not know this concept well yet: 4 to 5 steps, start from the basics.' : 'The student partly knows the concept: 2 to 3 short steps, focus on the mistake.'}`
}
