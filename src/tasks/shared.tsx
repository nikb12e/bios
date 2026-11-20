import { createPortal } from 'react-dom'
import { useEffect, useState, type ReactNode } from 'react'
import type { Grade } from '../engine/fsrs'
import type { Task } from '../data/bank'
import { useWide, Kbd } from '../ui/kit'

export interface Result {
  ok: boolean
  grade: Grade
  title?: string // npr. "Pravilno" ali "Skoraj"
  msg?: ReactNode // razlaga
  answer?: ReactNode // pravilen odgovor
}

export interface TaskProps<T extends Task = Task> {
  task: T
  done: boolean
  onAnswer: (r: Result) => void
}

// Gumb v spodnji stekleni vrstici seje (portal), da je akcija vedno na istem mestu.
export function Foot({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null)
  useEffect(() => { setEl(document.getElementById('s-foot-slot')) }, [])
  return el ? createPortal(children, el) : null
}

export function CheckBtn({ disabled, onClick, label = 'Preveri' }: { disabled?: boolean; onClick: () => void; label?: string }) {
  const wide = useWide()
  return (
    <Foot>
      <button className="btn full" disabled={disabled} onClick={onClick}>{label}{wide && <Kbd>Enter</Kbd>}</button>
    </Foot>
  )
}

export const gradeFrac = (f: number): Grade => (f >= 0.999 ? 3 : f >= 0.7 ? 2 : 1)

export function useShuffled<T>(arr: T[], key: string): T[] {
  const [s] = useState(() => {
    const b = [...arr]
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] }
    return b
  })
  void key
  return s
}
