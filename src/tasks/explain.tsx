import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Check, Minus, X, Mic, Square, Sparkles, BookOpen } from 'lucide-react'
import type { Task } from '../data/bank'
import { CON } from '../data/concepts'
import { grade as aiGrade, localCoverage, stt, sttAvailable, type GradeResult } from '../engine/ai'
import { CheckBtn, Foot, type TaskProps } from './shared'
import type { Grade } from '../engine/fsrs'

type T<K extends Task['t']> = Extract<Task, { t: K }>

export const VERDICT: Record<GradeResult['verdict'], { label: string; tone: 'good' | 'warn' | 'bad' }> = {
  pravilno: { label: 'Fully correct', tone: 'good' },
  delno: { label: 'Partly correct', tone: 'warn' },
  napacna_formulacija: { label: 'Wrong formulation', tone: 'warn' },
  ne_zna: { label: 'Doesn\'t know', tone: 'bad' },
}

export function verdictGrade(r: GradeResult, n: number): Grade {
  if (r.verdict === 'pravilno') return 3
  if (r.verdict === 'napacna_formulacija') return 2
  if (r.verdict === 'delno') return r.covered.length + r.partial.length * 0.5 >= n * 0.6 ? 2 : 1
  return 1
}

// Voice input: with an OpenAI key, MediaRecorder → OpenAI transcription; otherwise the browser's own speech recognition, where available.
type Rec = { lang: string; interimResults: boolean; continuous: boolean; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null; start: () => void; stop: () => void }
const BrowserRec = (window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec }).SpeechRecognition
  ?? (window as unknown as { webkitSpeechRecognition?: new () => Rec }).webkitSpeechRecognition

export function useDictation(onText: (t: string) => void) {
  const [rec, setRec] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const mr = useRef<MediaRecorder | null>(null)
  const sr = useRef<Rec | null>(null)
  const chunks = useRef<Blob[]>([])
  const startBrowser = () => {
    if (!BrowserRec) { setErr('Speech input needs an OpenAI key (Progress → AI key) or a browser with speech recognition. You can type instead.'); return }
    const r = new BrowserRec()
    r.lang = 'en-GB'; r.interimResults = false; r.continuous = true
    r.onresult = e => {
      let t = ''
      for (let i = 0; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript + ' '
      if (t.trim()) onText(t.trim())
    }
    r.onerror = e => { if (e.error !== 'no-speech' && e.error !== 'aborted') setErr('Speech recognition failed. Try again or type.') }
    r.onend = () => { sr.current = null; setRec(false) }
    try { r.start(); sr.current = r; setRec(true) } catch { setErr('Speech recognition is not available. Type instead.') }
  }
  const start = async () => {
    setErr('')
    if (!sttAvailable()) { startBrowser(); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const type = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : ''
      const m = new MediaRecorder(stream, type ? { mimeType: type } : undefined)
      chunks.current = []
      m.ondataavailable = e => { if (e.data.size) chunks.current.push(e.data) }
      m.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunks.current, { type: m.mimeType || 'audio/webm' })
        if (blob.size < 1200) return
        setBusy(true)
        try { const t = await stt(blob); if (t.trim()) onText(t.trim()) } catch { setErr('Transcription failed. Try again or type.') }
        setBusy(false)
      }
      m.start()
      mr.current = m
      setRec(true)
    } catch { setErr('Microphone not allowed.') }
  }
  const stop = () => {
    if (sr.current) { sr.current.stop(); return }
    mr.current?.stop(); mr.current = null; setRec(false)
  }
  useEffect(() => () => { mr.current?.stop(); sr.current?.stop() }, [])
  return { rec, busy, err, start, stop }
}

export function MicButton({ d }: { d: ReturnType<typeof useDictation> }) {
  return (
    <button className={`mic ${d.rec ? 'rec' : ''}`} onClick={d.rec ? d.stop : d.start} aria-label={d.rec ? 'Stop recording' : 'Speak'} disabled={d.busy}>
      {d.busy ? <span className="typing"><span /><span /><span /></span> : d.rec ? <Square size={20} fill="currentColor" /> : <Mic size={22} />}
    </button>
  )
}

export function KeyPoints({ kp, res, self, onToggle }: { kp: string[]; res?: GradeResult; self?: Set<number>; onToggle?: (i: number) => void }) {
  return (
    <div>
      {kp.map((k, i) => {
        const st = res ? (res.covered.includes(i) ? 'ok' : res.partial.includes(i) ? 'part' : 'no') : self?.has(i) ? 'ok' : 'no'
        return (
          <div key={i} className="kp" onClick={onToggle ? () => onToggle(i) : undefined} style={onToggle ? { cursor: 'pointer' } : undefined}>
            <span className={`m ${st}`}>{st === 'ok' ? <Check size={14} strokeWidth={3} /> : st === 'part' ? <Minus size={14} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}</span>
            <span>{k}</span>
          </div>
        )
      })}
    </div>
  )
}

export function ExplainTask({ task, done, onAnswer }: TaskProps<T<'explain'>>) {
  const [v, setV] = useState('')
  const [phase, setPhase] = useState<'write' | 'wait' | 'self' | 'end'>('write')
  const [res, setRes] = useState<GradeResult | null>(null)
  const [self, setSelf] = useState<Set<number>>(new Set())
  const dict = useDictation(t => setV(x => (x ? x.trimEnd() + ' ' : '') + t))
  const c = CON[task.c[0]]
  const submit = async () => {
    setPhase('wait')
    try {
      const r = await aiGrade(task.q, task.ref, task.kp, v)
      setRes(r)
      setPhase('end')
      const g = verdictGrade(r, task.kp.length)
      onAnswer({ ok: g >= 2, grade: g, title: VERDICT[r.verdict].label, msg: <ExplainResult r={r} kp={task.kp} refText={task.ref} page={c?.page} /> })
    } catch {
      setSelf(new Set(localCoverage(task.kp, v)))
      setPhase('self')
    }
  }
  const finishSelf = () => {
    const frac = self.size / task.kp.length
    const g: Grade = frac >= 0.999 ? 3 : frac >= 0.6 ? 2 : 1
    setPhase('end')
    onAnswer({ ok: g >= 2, grade: g, title: frac >= 0.999 ? 'Self rating: all key points' : `Self rating: ${self.size} of ${task.kp.length} points`, msg: <div><div className="fn" style={{ marginBottom: 6 }}>From the notes (p. {c?.page}):</div><div style={{ fontSize: 15 }}>{task.ref}</div></div> })
  }
  return (
    <div>
      <div className="qtype"><span className="badge accent"><Sparkles size={13} /> Explain, graded by AI against your notes</span></div>
      <h2 className="q">{task.q}</h2>
      {phase !== 'self' ? (
        <>
          <textarea className="field" value={v} onChange={e => setV(e.target.value)} placeholder="Answer in full sentences with scientific terms, as in an oral exam." disabled={done || phase === 'wait'} />
          <div className="row" style={{ marginTop: 12 }}>
            <MicButton d={dict} />
            <div className="fn grow">{dict.err || (dict.rec ? 'Recording … tap to finish' : dict.busy ? 'Transcribing …' : 'You can also speak.')}</div>
          </div>
          {phase === 'wait' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}><span className="typing"><span /><span /><span /></span><span className="sub">Grading against the key points from the notes …</span></motion.div>}
          {!done && phase === 'write' && <CheckBtn disabled={v.trim().length < 8} onClick={submit} label="Grade the answer" />}
        </>
      ) : (
        <div className="card">
          <div className="hl" style={{ marginBottom: 4 }}>AI is not available right now. Rate yourself.</div>
          <div className="fn" style={{ marginBottom: 10 }}>Tap the points you really covered in your answer (correctly and with the right term).</div>
          <KeyPoints kp={task.kp} self={self} onToggle={i => setSelf(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })} />
          <Foot><button className="btn full" onClick={finishSelf}>Confirm self rating</button></Foot>
        </div>
      )}
      {res && phase === 'end' && null}
    </div>
  )
}

export function ExplainResult({ r, kp, refText, page }: { r: GradeResult; kp: string[]; refText: string; page?: number | string }) {
  return (
    <div style={{ marginTop: 4 }}>
      <KeyPoints kp={kp} res={r} />
      {r.wrong.length > 0 && <div className="fn" style={{ marginTop: 6, color: 'var(--bad)' }}>Wrong: {r.wrong.join('; ')}</div>}
      {r.feedback && <p style={{ marginTop: 8 }}>{r.feedback}</p>}
      {r.better && <div style={{ marginTop: 8, fontSize: 15 }}><span className="over">Model answer</span><div style={{ marginTop: 3 }}>{r.better}</div></div>}
      <details style={{ marginTop: 8 }}>
        <summary className="fn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><BookOpen size={14} /> From the notes{page ? `, p. ${page}` : ''}</summary>
        <div style={{ fontSize: 14.5, marginTop: 6, color: 'var(--ink-2)' }}>{refText}</div>
      </details>
    </div>
  )
}
