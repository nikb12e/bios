// Geometrija za ročno narisane celice: gladke organske oblike iz točk.

export type P = [number, number]

export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (n: number) => Math.round(n * 10) / 10

// Zaprta gladka krivulja skozi točke (Catmull Rom v Bezier).
export function smoothClosed(pts: P[], k = 1): string {
  const n = pts.length
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    const c1: P = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k]
    const c2: P = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k]
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`
  }
  return d + 'Z'
}

export function smoothOpen(pts: P[], k = 1): string {
  const n = pts.length
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)]
    const c1: P = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k]
    const c2: P = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k]
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`
  }
  return d
}

// Točka na "mehurju": elipsa z rahlim valovanjem.
export function blobPoint(cx: number, cy: number, rx: number, ry: number, a: number, wob: number[] = [], phase = 0): P {
  let r = 1
  wob.forEach((w, i) => { r += w * Math.sin((i + 2) * a + phase * (i + 1)) })
  return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]
}

export function blob(cx: number, cy: number, rx: number, ry: number, wob: number[] = [], phase = 0, n = 18): string {
  const pts: P[] = []
  for (let i = 0; i < n; i++) pts.push(blobPoint(cx, cy, rx, ry, (i / n) * Math.PI * 2, wob, phase))
  return smoothClosed(pts)
}

// Kapsula (mitohondrij, bakterija) dolžine w, debeline h, centrirana v 0,0.
export function capsule(w: number, h: number): string {
  const r = h / 2, x = w / 2 - r
  return `M${-x},${-r}H${x}A${r},${r} 0 0 1 ${x},${r}H${-x}A${r},${r} 0 0 1 ${-x},${-r}Z`
}

// Notranja nagubana membrana mitohondrija: ena zaprta pot s prstastimi gubami (kriste).
export function cristae(w: number, h: number, folds: number, depth = 0.62): string {
  const r = h / 2, xL = -w / 2 + r, xR = w / 2 - r
  const x0 = -w / 2 + r * 0.95, x1 = w / 2 - r * 0.95
  const step = (x1 - x0) / folds
  const fw = Math.min(step * 0.42, h * 0.16) // debelina gube
  const reach = h * depth
  let d = `M${f(xL)},${f(-r)}`
  // zgornji rob: gube navzdol pri sodih indeksih
  for (let i = 0; i < folds; i++) {
    if (i % 2) continue
    const xm = x0 + step * (i + 0.5)
    const tip = -r + reach
    d += `L${f(xm - fw / 2 - 4)},${f(-r)}Q${f(xm - fw / 2)},${f(-r)} ${f(xm - fw / 2)},${f(-r + 4)}L${f(xm - fw / 2)},${f(tip - fw / 2)}A${f(fw / 2)},${f(fw / 2)} 0 0 0 ${f(xm + fw / 2)},${f(tip - fw / 2)}L${f(xm + fw / 2)},${f(-r + 4)}Q${f(xm + fw / 2)},${f(-r)} ${f(xm + fw / 2 + 4)},${f(-r)}`
  }
  d += `L${f(xR)},${f(-r)}A${f(r)},${f(r)} 0 0 1 ${f(xR)},${f(r)}`
  // spodnji rob od desne proti levi: gube navzgor pri lihih indeksih
  for (let i = folds - 1; i >= 0; i--) {
    if (!(i % 2)) continue
    const xm = x0 + step * (i + 0.5)
    const tip = r - reach
    d += `L${f(xm + fw / 2 + 4)},${f(r)}Q${f(xm + fw / 2)},${f(r)} ${f(xm + fw / 2)},${f(r - 4)}L${f(xm + fw / 2)},${f(tip + fw / 2)}A${f(fw / 2)},${f(fw / 2)} 0 0 0 ${f(xm - fw / 2)},${f(tip + fw / 2)}L${f(xm - fw / 2)},${f(r - 4)}Q${f(xm - fw / 2)},${f(r)} ${f(xm - fw / 2 - 4)},${f(r)}`
  }
  d += `L${f(xL)},${f(r)}A${f(r)},${f(r)} 0 0 1 ${f(xL)},${f(-r)}Z`
  return d
}

export const deg = (d: number) => (d * Math.PI) / 180

export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p0: P = [cx + Math.cos(deg(a0)) * r, cy + Math.sin(deg(a0)) * r]
  const p1: P = [cx + Math.cos(deg(a1)) * r, cy + Math.sin(deg(a1)) * r]
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0
  return `M${f(p0[0])},${f(p0[1])}A${r},${r} 0 ${large} 1 ${f(p1[0])},${f(p1[1])}`
}

export function pointsOnArc(cx: number, cy: number, r: number, a0: number, a1: number, n: number): P[] {
  const out: P[] = []
  for (let i = 0; i < n; i++) {
    const a = deg(a0 + ((a1 - a0) * (i + 0.5)) / n)
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
  return out
}

// Vijugasta nit (kromatin, DNK).
export function squiggle(seed: number, cx: number, cy: number, rad: number, n = 9): string {
  const R = rng(seed)
  const pts: P[] = []
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * rad
    pts.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d])
  }
  return smoothOpen(pts, 1.1)
}

export function scatter(seed: number, n: number, inside: (p: P) => boolean, box: [number, number, number, number], minGap = 10): P[] {
  const R = rng(seed)
  const out: P[] = []
  let guard = 0
  while (out.length < n && guard++ < n * 400) {
    const p: P = [box[0] + R() * (box[2] - box[0]), box[1] + R() * (box[3] - box[1])]
    if (!inside(p)) continue
    if (out.some(q => (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 < minGap * minGap)) continue
    out.push(p)
  }
  return out
}
