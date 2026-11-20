// AI with your own API key (OpenRouter, Anthropic or OpenAI, see engine/llm.ts). Everything has a fallback when AI is not available.
import { CONCEPTS, TOPICS } from '../data/concepts'
import { llmJson, llmReady, getLlm, transcribe } from './llm'

export interface GradeResult {
  covered: number[] // indexes of the key points that are covered
  partial: number[]
  wrong: string[]
  verdict: 'pravilno' | 'delno' | 'napacna_formulacija' | 'ne_zna'
  feedback: string
  better?: string
  ai: boolean
}
type Verdict = GradeResult['verdict']

/** True when no AI key is set (or the provider just failed): callers use their offline fallback. */
export const aiDown = () => !llmReady()
/** True when speech input can use the provider (OpenAI transcription). */
export const sttAvailable = () => getLlm()?.provider === 'openai'

const STYLE = 'Write in clear, simple English and address the student as "you". Keep it short. Do not use dashes; use a comma or a full stop instead. No emojis.'
const VERDICTS: Record<string, Verdict> = { correct: 'pravilno', partial: 'delno', wrong_wording: 'napacna_formulacija', unknown: 'ne_zna' }
const toVerdict = (v: unknown): Verdict | undefined => VERDICTS[String(v)]

function material(topic: string) {
  return CONCEPTS.filter(c => topic === 'vse' || c.topic === topic)
    .map(c => `[${c.id}] ${c.label}: ${c.text}${c.kp ? `\n   key points: ${c.kp.join('; ')}` : ''}`).join('\n')
}

/* ───────── grading a free explanation ───────── */
const GRADE_SYS = `You are a strict but fair biology teacher in the first year of upper secondary school. You grade a student's spoken or written answer ONLY against their notes (the reference) and the list of key points.
Rules:
1. A point is "covered" only if its full meaning is in the answer, with the correct scientific term.
2. A point is "partial" if the idea is hinted at but incomplete or said without the proper term (e.g. "sorts it", "packs it", "organelles float").
3. In "wrong" list concrete false statements from the answer (mixed up concepts, e.g. nuclear envelope instead of cell membrane). Do not invent mistakes.
4. Do not require anything that is not in the reference. Do not add material from outside the notes.
5. "verdict": "correct" (all points covered, no mistakes), "wrong_wording" (almost all content, but with non scientific wording), "partial" (part of the content is missing), "unknown" (the core is missing or wrong).
6. "feedback": 1 to 2 sentences saying exactly what is missing or what to fix. "model": a model answer in 1 to 3 sentences using only the reference.
${STYLE}
Return only JSON: {"covered":[indexes],"partial":[indexes],"wrong":["..."],"verdict":"...","feedback":"...","model":"..."}`

export async function grade(q: string, ref: string, kp: string[], answer: string): Promise<GradeResult> {
  if (!llmReady()) throw new Error('no_ai')
  const points = kp.slice(0, 10)
  const user = `Question: ${q}\nReference from the notes: ${ref}\nKey points:\n${points.map((k, i) => `${i}: ${k}`).join('\n')}\n\nStudent's answer: """${answer.slice(0, 2500)}"""`
  const p = await llmJson<{ covered?: number[]; partial?: number[]; wrong?: string[]; verdict?: string; feedback?: string; model?: string }>(GRADE_SYS, user, { maxTokens: 1400, temperature: 0.2 })
  if (!p) throw new Error('parse')
  const ok = (a?: number[]) => [...new Set((a ?? []).map(Number).filter(i => Number.isInteger(i) && i >= 0 && i < points.length))]
  const covered = ok(p.covered)
  const partial = ok(p.partial).filter(i => !covered.includes(i))
  const wrong = (p.wrong ?? []).map(String).filter(Boolean).slice(0, 4)
  let verdict: Verdict = toVerdict(p.verdict) ?? 'delno'
  if (verdict === 'pravilno' && (covered.length < points.length || wrong.length)) verdict = covered.length + partial.length >= points.length ? 'napacna_formulacija' : 'delno'
  if (covered.length === points.length && !wrong.length) verdict = 'pravilno'
  if (covered.length === 0 && partial.length === 0) verdict = 'ne_zna'
  return { covered, partial, wrong, verdict, feedback: String(p.feedback ?? ''), better: String(p.model ?? ''), ai: true }
}

/* ───────── oral exam ───────── */
export interface OralTurn { role: 'ai' | 'me'; text: string }
export interface OralReply { say: string; verdict?: Verdict; missing?: string[]; concept?: string; done?: boolean }

const ORAL_SYS = (mat: string, focus: string) => `You are a biology teacher giving a first year upper secondary school student an oral exam about the cell. The questions are based ONLY on the notes below; do not ask anything outside them.
How it goes:
1. Ask exactly one clear question at a time (like in a real oral exam), with no hints and no answer.
2. When the student answers, grade strictly against the key points of that concept: "correct", "partial", "wrong_wording" (right content, non scientific terms) or "unknown". Say exactly what is missing or wrong and give the correct scientific wording in one sentence.
3. Then ask the next question: if the answer was weak, a follow up on the same concept (from another angle); if it was good, a harder question (links between organelles, a comparison, applying it to an example) or a new concept. Concepts on the "focus" list come first.
4. If the student says they do not know, briefly explain it from the notes and ask a simpler question.
${STYLE}
Return only JSON:
{"say":"text for the student (grade and feedback, then the new question)","verdict":"correct|partial|wrong_wording|unknown or null if there was no answer yet","missing":["short note on what is missing"],"concept":"id of the concept you just graded, or null","next":"id of the concept of the new question"}

NOTES (id, text, key points):
${mat}

Focus (concepts known worst): ${focus}`

export async function oral(topic: string, history: OralTurn[], focus: string[]): Promise<OralReply> {
  if (!llmReady()) throw new Error('no_ai')
  const t = TOPICS.some(x => x.id === topic) ? topic : 'vse'
  const valid = new Set(CONCEPTS.filter(c => t === 'vse' || c.topic === t).map(c => c.id))
  const f = focus.filter(x => valid.has(x)).slice(0, 8)
  const hist = history.slice(-14).map(h => `${h.role === 'ai' ? 'TEACHER' : 'STUDENT'}: ${h.text.slice(0, 1500)}`).join('\n')
  const user = hist ? `Conversation so far:\n${hist}\n\nContinue.` : 'Start the exam: greet briefly (one sentence) and ask the first question.'
  const p = await llmJson<{ say?: string; verdict?: string | null; missing?: string[]; concept?: string | null }>(ORAL_SYS(material(t), f.join(', ') || 'none'), user, { maxTokens: 1500, temperature: 0.3, timeoutMs: 45_000 })
  if (!p?.say) throw new Error('parse')
  return {
    say: String(p.say).slice(0, 1600),
    verdict: toVerdict(p.verdict),
    missing: (p.missing ?? []).map(String).filter(Boolean).slice(0, 4),
    concept: p.concept && valid.has(p.concept) ? p.concept : undefined,
  }
}

/* ───────── speech to text ───────── */
export async function stt(blob: Blob): Promise<string> {
  return transcribe(blob, 'Biology, the cell: cytoplasm, cytosol, organelles, ribosomes, endoplasmic reticulum, Golgi apparatus, mitochondrion, chloroplast, thylakoids, grana, stroma, nucleolus, chromatin, histones, lysosomes, vacuole, centrioles, microtubules, cell membrane, phospholipids.')
}

/* ───────── new AI tasks ───────── */
const GEN_SYS = (mat: string) => `You write demanding biology tasks for the first year of upper secondary school. You write tasks ONLY from the notes below. The tasks should test understanding and connecting ideas (not just copying), the distractors should be convincing (common mix ups of concepts), and every task has exactly one clearly correct answer according to the notes.
${STYLE}
Return only JSON: {"items":[{"t":"mc","c":"concept id","q":"question","opts":["4 options"],"a":index_of_correct,"why":"short explanation from the notes"} or {"t":"tf","c":"concept id","s":"statement","a":true|false,"why":"..."}]}
Mix both types (mostly mc).

NOTES:
${mat}`
const SOLVE_SYS = (mat: string) => `Solve the tasks using only the notes. Return JSON {"answers":[...]} with the index of the correct option for multiple choice questions, or true/false for statements, in the same order.\n\nNOTES:\n${mat}`

interface GenRaw { t?: string; c?: string; q?: string; opts?: unknown[]; a?: unknown; s?: string; why?: string }

export async function genTasks(topic: string, n = 6): Promise<{ items: unknown[] }> {
  if (!llmReady()) throw new Error('no_ai')
  const t = TOPICS.some(x => x.id === topic) ? topic : 'organeli'
  const count = Math.min(8, Math.max(3, n))
  const valid = [...new Set(CONCEPTS.filter(c => c.topic === t).map(c => c.id))]
  const mat = material(t)
  const p = await llmJson<{ items?: GenRaw[] }>(GEN_SYS(mat), `Write ${count} new tasks.`, { maxTokens: 2600, temperature: 0.7, timeoutMs: 60_000 })
  const items = (p?.items ?? []).map((it, k) => {
    const c = it?.c && valid.includes(it.c) ? it.c : valid[0]
    const id = 'ai:' + t + ':' + Date.now().toString(36) + k
    if (it?.t === 'mc' && Array.isArray(it.opts) && it.opts.length === 4 && Number.isInteger(it.a) && (it.a as number) >= 0 && (it.a as number) < 4 && new Set(it.opts.map(String)).size === 4 && it.q)
      return { t: 'mc', id, c: [c], q: String(it.q), opts: it.opts.map(String), a: it.a as number, why: String(it.why ?? '') }
    if (it?.t === 'tf' && typeof it.a === 'boolean' && it.s) return { t: 'tf', id, c: [c], s: String(it.s), a: it.a, why: String(it.why ?? '') }
    return null
  }).filter(Boolean) as { t: string; a: number | boolean; q?: string; opts?: string[]; s?: string }[]
  if (!items.length) throw new Error('empty')
  // check: a second call solves the tasks without the key; only those that match are kept
  const quiz = items.map((it, i) => it.t === 'mc' ? `${i}. ${it.q}\n${(it.opts ?? []).map((o, j) => `  ${j}) ${o}`).join('\n')}` : `${i}. True or false: ${it.s}`).join('\n')
  let keep = items
  const sol = await llmJson<{ answers?: (number | boolean)[] }>(SOLVE_SYS(mat), quiz, { maxTokens: 1500, temperature: 0 })
  if (sol?.answers?.length === items.length) keep = items.filter((it, i) => sol.answers![i] === it.a)
  if (!keep.length) throw new Error('verify')
  return { items: keep }
}

// When AI is not reachable: rough keyword matching (only as help for the self rating).
export function localCoverage(kp: string[], answer: string): number[] {
  const strip = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const a = strip(answer)
  return kp.map((k, i) => {
    const words = strip(k).split(/[^a-z0-9]+/).filter(w => w.length >= 5).map(w => w.slice(0, Math.max(5, w.length - 2)))
    if (!words.length) return -1
    const hit = words.filter(w => a.includes(w)).length / words.length
    return hit >= 0.5 ? i : -1
  }).filter(i => i >= 0)
}
