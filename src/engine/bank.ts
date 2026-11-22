// Shared bank of AI written tasks. In the hosted app it lives on the server; in this open source build it ships with the app
// (src/data/aibank.json: 388 tasks written by a model and kept only when a second, independent model call gave the same answer).
// Difficulty is calibrated from your own answers (state.tstat); there is no shared statistics server here.
import type { Task } from '../data/bank'
import { setShared } from './gen'
import { setGlobalStats } from './adapt'
import type { TopicId } from '../data/concepts'
import BANK_AI from '../data/aibank.json'

const have: Record<string, number> = {}
let loaded = false

export async function loadBank() {
  if (loaded) return
  loaded = true
  const tasks = BANK_AI as unknown as Task[]
  setShared(tasks)
  setGlobalStats({})
  for (const t of tasks) have[t.c[0]] = (have[t.c[0]] ?? 0) + 1
}
loadBank()

export const aiCount = (concept: string) => have[concept] ?? 0

// The hosted app asks its server to write more tasks for concepts with few of them. Here you can write new tasks
// with your own key in Practice (AI tasks), so this is intentionally a no-op.
export function requestFill(_topic?: TopicId) { /* no server in the open source build */ }

// The hosted app sends answers to the server to calibrate difficulty for everyone. Here your answers stay in the browser.
export function queueStat(_id: string, _ok: boolean) { /* no server in the open source build */ }
