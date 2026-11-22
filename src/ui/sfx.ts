/* The Bios sound engine: synthesised sounds (WebAudio, no files) and playback of the explanation voice.
   Everything runs through one AudioContext with a compressor and a short reverb, so it sounds full and soft. */
import { get } from '../engine/store'
import { getLlm } from '../engine/llm'

type Kind = 'good' | 'bad' | 'idk' | 'tap' | 'done' | 'reveal' | 'explain' | 'level' | 'milestone' | 'tick'
interface Opt { streak?: number; hard?: boolean; acc?: number }

let ac: AudioContext | undefined
let master: GainNode | undefined
let wet: GainNode | undefined

function ctx(): AudioContext | undefined {
  try {
    if (!ac) {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ac = new C()
      const comp = ac.createDynamicsCompressor()
      comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.18
      master = ac.createGain(); master.gain.value = 0.9
      master.connect(comp).connect(ac.destination)
      // a short generated reverb (a noise impulse with an exponential decay)
      const len = Math.floor(ac.sampleRate * 1.4)
      const ir = ac.createBuffer(2, len, ac.sampleRate)
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch)
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2)
      }
      const conv = ac.createConvolver(); conv.buffer = ir
      wet = ac.createGain(); wet.gain.value = 0.22
      wet.connect(conv).connect(master)
    }
    if (ac.state === 'suspended') void ac.resume()
    return ac
  } catch { return undefined }
}

// one tone with an envelope; type, volume, duration, reverb
function tone(f: number, at: number, dur: number, vol: number, type: OscillatorType = 'sine', rev = 0.6, glide?: number) {
  const a = ac!, t = a.currentTime + at
  const o = a.createOscillator(), g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(f, t)
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur * 0.9)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(master!)
  if (rev > 0) { const s = a.createGain(); s.gain.value = rev; g.connect(s).connect(wet!) }
  o.start(t); o.stop(t + dur + 0.05)
}

// bell: a fundamental plus inharmonic partials (soft metal, like an iOS confirmation)
function bell(f: number, at: number, vol: number, dur = 0.9) {
  tone(f, at, dur, vol, 'sine', 0.7)
  tone(f * 2.01, at, dur * 0.55, vol * 0.32, 'sine', 0.7)
  tone(f * 3.98, at, dur * 0.3, vol * 0.12, 'sine', 0.5)
}

// noise (for a whoosh and soft hits)
function noise(at: number, dur: number, vol: number, from = 600, to = 3200, q = 0.9) {
  const a = ac!, t = a.currentTime + at
  const len = Math.floor(a.sampleRate * dur)
  const b = a.createBuffer(1, len, a.sampleRate)
  const d = b.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const s = a.createBufferSource(); s.buffer = b
  const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q
  bp.frequency.setValueAtTime(from, t); bp.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(bp).connect(g).connect(master!)
  const sw = a.createGain(); sw.gain.value = 0.5; g.connect(sw).connect(wet!)
  s.start(t); s.stop(t + dur + 0.02)
}

// pentatonic scale (C major), so a streak of correct answers climbs and always sounds nice
const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5, 1568, 1760]

export function sfx(kind: Kind, o: Opt = {}) {
  const st = get().settings
  const vib = (p: number | number[]) => { if ('vibrate' in navigator) navigator.vibrate?.(p) }
  if (!st.sound) {
    if (kind === 'good') vib(12); else if (kind === 'bad') vib([18, 40, 18])
    return
  }
  const a = ctx()
  if (!a || !master) return
  try {
    switch (kind) {
      case 'tap':
        tone(1320, 0, 0.05, 0.035, 'sine', 0.1)
        break
      case 'tick':
        tone(2093, 0, 0.04, 0.02, 'sine', 0.2)
        break
      case 'reveal':
        tone(880, 0, 0.12, 0.03, 'sine', 0.6, 1320)
        break
      case 'good': {
        const s = Math.min(o.streak ?? 1, 8)
        const base = PENTA[Math.min(s - 1, PENTA.length - 3)]
        bell(base, 0, 0.09)
        bell(base * 1.5, 0.075, 0.075)
        if (o.hard) bell(base * 2, 0.15, 0.06, 1.1)
        if (s >= 3) tone(base * 4, 0.12, 0.25, 0.018, 'triangle', 0.8)
        if (s === 5 || s === 10) setTimeout(() => sfx('milestone'), 260)
        vib(o.hard ? [10, 30, 14] : 12)
        break
      }
      case 'bad':
        // soft, low, not punishing: two falling tones, slightly muted
        tone(311.1, 0, 0.22, 0.06, 'triangle', 0.3)
        tone(261.6, 0.1, 0.32, 0.06, 'triangle', 0.3)
        noise(0, 0.08, 0.012, 300, 200, 2)
        vib([18, 40, 18])
        break
      case 'idk':
        // a questioning, friendly motif: up and back
        tone(587.3, 0, 0.18, 0.05, 'sine', 0.6)
        tone(698.5, 0.1, 0.26, 0.045, 'sine', 0.6)
        vib(10)
        break
      case 'explain':
        // a whoosh and a warm chord pad: now it is about understanding
        noise(0, 0.42, 0.05, 400, 2600, 0.7)
        ;[261.6, 329.6, 392, 493.9].forEach((f, i) => tone(f, 0.12 + i * 0.03, 1.5, 0.028, 'sine', 0.9))
        tone(130.8, 0.12, 1.6, 0.03, 'triangle', 0.5)
        break
      case 'milestone':
        ;[1568, 1976, 2349, 3136].forEach((f, i) => tone(f, i * 0.045, 0.35, 0.03, 'sine', 0.9))
        vib([8, 20, 8, 20, 8])
        break
      case 'level':
        ;[523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => bell(f, i * 0.07, 0.07, 1))
        vib([10, 30, 10, 30, 30])
        break
      case 'done': {
        const acc = o.acc ?? 0.7
        const ch = acc >= 0.8 ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : acc >= 0.55 ? [523.25, 659.25, 783.99, 1046.5] : [440, 523.25, 659.25]
        ch.forEach((f, i) => bell(f, i * 0.09, 0.075, 1.3))
        tone(130.8, 0, 1.8, 0.04, 'triangle', 0.6)
        if (acc >= 0.8) setTimeout(() => sfx('milestone'), ch.length * 90 + 120)
        vib([12, 40, 12, 40, 40])
        break
      }
    }
  } catch { /* no sound */ }
}

/* ───────── voice for explanations ─────────
   With an OpenAI or OpenRouter key: a natural voice from the provider (played through the same AudioContext as the sounds, cached per text).
   Otherwise (no key or Anthropic): the browser's own speech synthesis (English voice), free and offline where available. */

const voiceCache = new Map<string, AudioBuffer>()
let cur: AudioBufferSourceNode | undefined
const listeners = new Set<(on: boolean) => void>()
let speakingNow = false
function setSpeaking(on: boolean) { speakingNow = on; listeners.forEach(f => f(on)) }
export function onSpeaking(f: (on: boolean) => void) { listeners.add(f); return () => { listeners.delete(f) } }
export const isSpeaking = () => speakingNow

export function stopSpeak() {
  try { cur?.stop() } catch { /* already stopped */ }
  cur = undefined
  try { window.speechSynthesis?.cancel() } catch { /* no speech synthesis */ }
  setSpeaking(false)
}

async function openaiVoice(text: string): Promise<AudioBuffer | null> {
  const c = getLlm()
  if (!c || c.provider === 'anthropic') return null
  const key = text.slice(0, 1200)
  const hit = voiceCache.get(key)
  if (hit) return hit
  const a = ctx()
  if (!a) return null
  // OpenAI: gpt-4o-mini-tts (OpenAI plans to retire it on 6 January 2027; after that the browser voice takes over).
  // OpenRouter: ElevenLabs through OpenRouter's speech endpoint.
  const r = c.provider === 'openai'
    ? await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { authorization: `Bearer ${c.key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'coral', input: key, response_format: 'mp3', instructions: 'Speak like a calm, friendly biology tutor.' }),
    })
    : await fetch('https://openrouter.ai/api/v1/audio/speech', {
      method: 'POST',
      headers: { authorization: `Bearer ${c.key}`, 'content-type': 'application/json', 'X-Title': 'Bios', 'HTTP-Referer': location.origin },
      body: JSON.stringify({ model: 'elevenlabs/eleven-v4-turbo', voice: 'sarah', input: key, response_format: 'mp3' }),
    })
  if (!r.ok) return null
  const audio = await a.decodeAudioData(await r.arrayBuffer())
  voiceCache.set(key, audio)
  return audio
}

// warms up the voice (only with a provider voice, which is what takes time)
export function preloadVoice(text: string) { void openaiVoice(text).catch(() => null) }

function browserVoice(text: string, onEnd?: () => void): boolean {
  const ss = window.speechSynthesis
  if (!ss) return false
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 1.02
  const v = ss.getVoices().find(x => /en(-|_)(US|GB)/i.test(x.lang) && /natural|premium|enhanced|samantha|google/i.test(x.name)) ?? ss.getVoices().find(x => /^en/i.test(x.lang))
  if (v) u.voice = v
  u.onend = () => { setSpeaking(false); onEnd?.() }
  u.onerror = () => setSpeaking(false)
  ss.cancel()
  ss.speak(u)
  return true
}

// Speaks an explanation. On iOS the call has to come from a tap (or after the AudioContext has been unlocked by one).
export async function speak(text: string, onEnd?: () => void): Promise<boolean> {
  stopSpeak()
  const a = ctx()
  setSpeaking(true)
  try {
    const audio = a && master ? await openaiVoice(text) : null
    if (!speakingNow) return false
    if (audio && a && master) {
      const s = a.createBufferSource(); s.buffer = audio
      const g = a.createGain(); g.gain.value = 1.15
      s.connect(g).connect(master)
      s.onended = () => { if (cur === s) { cur = undefined; setSpeaking(false); onEnd?.() } }
      cur = s
      s.start()
      return true
    }
    if (browserVoice(text, onEnd)) return true
    setSpeaking(false)
    return false
  } catch {
    if (browserVoice(text, onEnd)) return true
    setSpeaking(false)
    return false
  }
}
