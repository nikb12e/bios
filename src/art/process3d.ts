import * as THREE from 'three'
import type { PartId } from './Cells'
import type { ProcId } from './procs'
export type { ProcId } from './procs'

/* Animated explanations of processes in the 3D cell. Every process has steps: a caption, which parts are highlighted,
   where the camera moves and what happens (particles, vesicles, light). The content follows the cell notes. */

export interface Spots {
  kind: 'animal' | 'plant' | 'prok'
  nPos: THREE.Vector3; nR: number
  golgi?: THREE.Object3D; gAxis?: THREE.Vector3
  mito: THREE.Vector3[]
  lizo: THREE.Object3D[]
  kloro: THREE.Vector3[]
  skrob: THREE.Object3D[]
  vac?: THREE.Object3D
  amp: { cilia: number; wave: number }
}

/** a camera step: highlighted parts, focus point, the radius that should be visible, camera direction (by default from the point's position) */
export interface ProcStep { hi: PartId[]; target: THREE.Vector3; r: number; dir?: THREE.Vector3; dur: number; /** label point that follows a moving part */ lab?: Partial<Record<PartId, () => THREE.Vector3>> }
export interface Proc { steps: ProcStep[]; update: (step: number, local: number) => void; dispose: () => void }

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const ease = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c) }
const seg = (x: number, a: number, b: number) => Math.min(1, Math.max(0, (x - a) / (b - a)))

export function buildProcess(id: ProcId, S: Spots, scene: THREE.Scene, dark: boolean): Proc {
  const group = new THREE.Group()
  scene.add(group)
  const geos: THREE.BufferGeometry[] = []
  const mats: THREE.Material[] = []
  const INK = dark ? '#06070a' : '#1a1d24'
  const grad = (() => {
    const t = new THREE.DataTexture(new Uint8Array([148, 148, 148, 255, 204, 204, 204, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat)
    t.minFilter = THREE.NearestFilter; t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true
    return t
  })()
  const sph = (r: number, d = 18) => { const g = new THREE.SphereGeometry(r, d, Math.round(d * 0.7)); geos.push(g); return g }
  const toon = (c: string, o: Partial<THREE.MeshToonMaterialParameters> = {}) => { const m = new THREE.MeshToonMaterial({ color: new THREE.Color(c), gradientMap: grad, transparent: true, ...o }); mats.push(m); return m }
  const ink = () => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(INK), side: THREE.BackSide, transparent: true }); mats.push(m); return m }
  /** a small ball with an outline */
  const bead = (r: number, c: string, outline = 0.18) => {
    const g = new THREE.Group()
    const body = new THREE.Mesh(sph(r), toon(c))
    g.add(body)
    if (outline > 0) { const o = new THREE.Mesh(sph(r * (1 + outline)), ink()); g.add(o) }
    g.visible = false
    group.add(g)
    return g
  }
  /** a glowing beam (light) */
  const glow = (r: number, c: string, onTop = false) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(c), transparent: true, opacity: 0.5, depthWrite: false, depthTest: !onTop })
    mats.push(m)
    const s = new THREE.Mesh(sph(r, 24), m)
    s.visible = false
    group.add(s)
    return s
  }
  const fade = (o: THREE.Object3D, a: number) => o.traverse(c => { const m = (c as THREE.Mesh).material as THREE.Material | undefined; if (m) m.opacity = a })
  const show = (o: THREE.Object3D, on: boolean) => { o.visible = on }
  const hideAll = () => group.children.forEach(c => { c.visible = false })

  const C = {
    lime: '#c8ee3c', amber: '#f0b429', sky: '#5ab4dc', coral: '#ef6a43', pink: '#d0588a', violet: '#7d6ce0', green: '#3fae5b', white: '#ffffff',
  }
  const steps: ProcStep[] = []
  const restore: (() => void)[] = []
  let update: (step: number, local: number) => void = () => {}

  /* ═════════ the path of a protein ═════════ */
  if (id === 'protein' && S.golgi && S.gAxis) {
    const nPos = S.nPos, nR = S.nR
    const erP = V(0.6, 0.0, 1.58)
    const pore = nPos.clone().add(erP.clone().sub(nPos).normalize().multiplyScalar(nR))
    const cis = S.golgi.localToWorld(V(0, -0.12, 0))
    const trans = S.golgi.localToWorld(V(0, 0.78, 0))
    const out = trans.clone().add(S.gAxis.clone().multiplyScalar(0.3)).normalize().multiplyScalar(3.08)
    const outer = out.clone().normalize().multiplyScalar(3.9)
    const zapisCurve = new THREE.CatmullRomCurve3([nPos.clone().add(V(0.15, 0.05, 0.2)), pore, pore.clone().lerp(erP, 0.55).add(V(0, 0.12, 0)), erP])
    const toGolgi = new THREE.CatmullRomCurve3([erP, erP.clone().lerp(cis, 0.5).add(V(0.15, 0.25, 0.25)), cis])
    const toMem = new THREE.CatmullRomCurve3([trans, trans.clone().lerp(out, 0.5).add(V(0, 0.2, 0.2)), out])
    const halo = glow(nR * 1.05, C.violet)
    const zapis = bead(0.06, C.lime)
    const ribo = bead(0.07, '#27324a')
    const chain = Array.from({ length: 9 }, () => bead(0.035, C.amber, 0.12))
    const ves = bead(0.12, '#f7d68a', 0.1)
    const cargo = bead(0.055, C.amber, 0.12)
    const golGlow = glow(0.2, C.amber, true)
    const ves2 = bead(0.12, '#f7d68a', 0.1)
    const cargo2 = bead(0.055, C.amber, 0.12)
    const burst = Array.from({ length: 7 }, () => bead(0.045, C.amber, 0.12))
    const dirs = burst.map((_, i) => out.clone().normalize().multiplyScalar(0.9).add(V(Math.cos(i * 0.9) * 0.45, Math.sin(i * 1.7) * 0.45, Math.sin(i * 0.9) * 0.45)))
    steps.push(
      { hi: ['jedro', 'zrnatiER'], target: nPos.clone().lerp(erP, 0.35), r: 2.0, dur: 7 },
      { hi: ['zrnatiER', 'ribosomi'], target: erP, r: 1.25, dur: 7 },
      { hi: ['zrnatiER', 'golgi'], target: erP.clone().lerp(cis, 0.5), r: 1.25, dur: 7 },
      { hi: ['golgi'], target: S.golgi.localToWorld(V(0, 0.35, 0)), r: 1.0, dur: 7 },
      { hi: ['golgi', 'membrana'], target: trans.clone().lerp(out, 0.5), r: 1.5, dur: 7 },
      { hi: ['membrana'], target: out, r: 1.4, dur: 7 },
    )
    update = (k, t) => {
      hideAll()
      if (k === 0) {
        show(halo, true); fade(halo, 0.18 + 0.14 * Math.sin(t * 3)); halo.position.copy(nPos)
        const p = seg(t, 1.2, 4.2)
        if (p > 0) { show(zapis, true); zapis.position.copy(zapisCurve.getPoint(ease(p))) }
      } else if (k === 1) {
        show(ribo, true); ribo.position.copy(erP.clone().add(V(0, 0.13, 0.05)))
        show(zapis, true); zapis.position.copy(erP.clone().add(V(0.12, 0.16, 0.05)))
        const n = Math.floor(seg(t, 0.4, 4) * chain.length)
        chain.forEach((c, i) => { show(c, i < n); c.position.copy(erP.clone().add(V(-0.05 - i * 0.03, 0.05 - i * 0.045, Math.sin(i * 1.3) * 0.05))) })
      } else if (k === 2) {
        const p = ease(seg(t, 0.8, 4))
        show(ves, true); ves.position.copy(toGolgi.getPoint(p)); ves.scale.setScalar(Math.min(1, t / 0.8))
        show(cargo, true); cargo.position.copy(ves.position)
      } else if (k === 3) {
        const p = seg(t, 0, 3.8)
        show(ves, p < 0.15); ves.position.copy(cis); ves.scale.setScalar(1 - p / 0.15)
        show(golGlow, true); golGlow.position.copy(cis.clone().lerp(trans, ease(p))); fade(golGlow, 0.45 + 0.15 * Math.sin(t * 5)); golGlow.renderOrder = 5
      } else if (k === 4) {
        const p = ease(seg(t, 0.5, 3.6))
        show(ves2, true); ves2.position.copy(toMem.getPoint(p)); ves2.scale.setScalar(Math.min(1, t / 0.5))
        show(cargo2, true); cargo2.position.copy(ves2.position)
      } else if (k === 5) {
        const f = seg(t, 0, 1.2)
        show(ves2, f < 1); ves2.position.copy(out); ves2.scale.set(1 + f * 0.6, 1 - f * 0.85, 1 + f * 0.6); ves2.lookAt(outer)
        const b = seg(t, 0.9, 3.8)
        burst.forEach((c, i) => { show(c, b > 0 && b < 1); c.position.copy(out.clone().add(dirs[i].clone().multiplyScalar(ease(b)))); fade(c, 1 - b * b) })
      }
    }
  }

  /* ═════════ cellular respiration ═════════ */
  if (id === 'dihanje') {
    const m = S.mito[0]
    const food = Array.from({ length: 6 }, () => bead(0.05, C.amber, 0.12))
    const oxy = Array.from({ length: 6 }, () => bead(0.04, C.sky, 0.12))
    const atp = Array.from({ length: 14 }, () => bead(0.04, C.lime, 0.14))
    const halo = glow(0.42, C.coral)
    const sinks = [S.nPos, S.golgi ? S.golgi.localToWorld(V(0, 0.4, 0)) : V(1.6, -0.6, 0.9), V(0, 3.0, 0.5), V(-2.4, -0.8, 1.2), V(1.2, 1.8, 1.6), V(-0.4, -2.4, 0.9)]
    const from = (i: number) => m.clone().add(V(Math.cos(i * 1.1) * 1.3, Math.sin(i * 0.7) * 1.1, Math.sin(i * 1.1) * 1.3))
    steps.push(
      { hi: ['mitohondrij'], target: m, r: 0.75, dur: 7, lab: { mitohondrij: () => m.clone().add(V(0, 0.36, 0)) } },
      { hi: ['mitohondrij'], target: m, r: 1.3, dur: 7, lab: { mitohondrij: () => m.clone().add(V(0, 0.36, 0)) } },
      { hi: ['mitohondrij'], target: m, r: 1.0, dur: 7, lab: { mitohondrij: () => m.clone().add(V(0, 0.36, 0)) } },
      { hi: ['mitohondrij', 'jedro', 'golgi'], target: V(0, 0.2, 0), r: 3.5, dur: 7 },
    )
    update = (k, t) => {
      hideAll()
      show(halo, k === 2); halo.position.copy(m); fade(halo, 0.1 + 0.06 * Math.sin(t * 4))
      if (k === 1) {
        ;[...food, ...oxy].forEach((b, i) => {
          const p = ((t * 0.32 + i * 0.083) % 1)
          show(b, true); b.position.copy(from(i).lerp(m, ease(p))); fade(b, p > 0.85 ? (1 - p) / 0.15 : 1)
        })
      }
      if (k === 2) atp.forEach((b, i) => {
        const p = ((t * 0.45 + i / atp.length) % 1)
        show(b, true)
        b.position.copy(m.clone().add(V(Math.cos(i * 2.4) * 0.1, (i % 5 - 2) * 0.08, Math.sin(i * 2.4) * 0.1).multiplyScalar(1 + p * 4)))
        b.scale.setScalar(0.4 + p)
      })
      if (k === 3) atp.forEach((b, i) => {
        const p = ((t * 0.28 + i / atp.length) % 1)
        show(b, true)
        b.position.copy(m.clone().lerp(sinks[i % sinks.length], ease(p)))
        b.scale.setScalar(2.2)
        fade(b, p > 0.85 ? (1 - p) / 0.15 : 1)
      })
    }
  }

  /* ═════════ fotosinteza ═════════ */
  if (id === 'fotosinteza') {
    const k0 = S.kloro[0]
    const sun = V(1.5, 9, 3.5)
    const rays = Array.from({ length: 5 }, (_, i) => {
      const m = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd84a'), transparent: true, opacity: 0.0, depthWrite: false })
      mats.push(m)
      const g = new THREE.CylinderGeometry(0.035, 0.035, 1, 8); geos.push(g)
      const r = new THREE.Mesh(g, m); r.userData.i = i; r.visible = false; group.add(r)
      return r
    })
    const targets = [k0, ...S.kloro.slice(1, 5)]
    const halo = glow(0.5, '#ffe36b')
    const co2 = Array.from({ length: 5 }, () => bead(0.045, '#8b8f99', 0.12))
    const water = Array.from({ length: 5 }, () => bead(0.045, C.sky, 0.12))
    const o2 = Array.from({ length: 6 }, () => bead(0.04, '#bfe8ff', 0.12))
    const sugar = Array.from({ length: 8 }, () => bead(0.045, C.amber, 0.12))
    const skr = S.skrob.map(s => s.position.clone())
    const skrBase = S.skrob.map(s => s.scale.clone())
    restore.push(() => S.skrob.forEach((s, i) => s.scale.copy(skrBase[i])))
    const tmpQ = new THREE.Quaternion()
    steps.push(
      { hi: ['kloroplast'], target: k0, r: 0.7, dur: 7 },
      { hi: ['kloroplast'], target: k0.clone().add(V(0, 0.4, 0)), r: 1.7, dur: 7 },
      { hi: ['kloroplast'], target: k0, r: 1.2, dur: 7 },
      { hi: ['kloroplast', 'skrobna'], target: k0.clone().lerp(skr[0] ?? k0, 0.5), r: 2.3, dur: 7 },
    )
    update = (k, t) => {
      hideAll()
      S.skrob.forEach((s, i) => s.scale.copy(skrBase[i]))
      if (k === 1 || k === 2) {
        rays.forEach((r, i) => {
          const tg = targets[i % targets.length]
          const from = sun.clone().add(V((i - 2) * 0.9, 0, (i % 2) * 0.8))
          const grow = k === 1 ? ease(seg(t, i * 0.25, 1.4 + i * 0.25)) : 1
          const end = from.clone().lerp(tg, grow)
          const mid = from.clone().add(end).multiplyScalar(0.5)
          r.visible = true
          r.position.copy(mid)
          r.scale.set(1, from.distanceTo(end), 1)
          tmpQ.setFromUnitVectors(V(0, 1, 0), end.clone().sub(from).normalize())
          r.quaternion.copy(tmpQ)
          ;(r.material as THREE.MeshBasicMaterial).opacity = 0.32 + 0.1 * Math.sin(t * 6 + i)
        })
        show(halo, true); halo.position.copy(k0); fade(halo, (k === 1 ? seg(t, 1.2, 2.2) : 1) * (0.22 + 0.12 * Math.sin(t * 4)))
      }
      if (k === 2) {
        ;[...co2, ...water].forEach((b, i) => {
          const p = ((t * 0.3 + i * 0.1) % 1)
          const from = k0.clone().add(V(Math.cos(i * 1.3) * 1.4, -0.6 + Math.sin(i) * 0.5, Math.sin(i * 1.3) * 1.4))
          show(b, true); b.position.copy(from.lerp(k0, ease(p))); fade(b, p > 0.85 ? (1 - p) / 0.15 : 1)
        })
        o2.forEach((b, i) => {
          const p = ((t * 0.35 + i / o2.length) % 1)
          show(b, true); b.position.copy(k0.clone().add(V(Math.cos(i * 2) * p * 0.8, p * 2.2, Math.sin(i * 2) * p * 0.8))); fade(b, 1 - p)
        })
        sugar.slice(0, 4).forEach((b, i) => {
          const p = ((t * 0.4 + i / 4) % 1)
          show(b, true); b.position.copy(k0.clone().add(V(Math.cos(i * 1.6 + 1) * 0.6 * p, -0.2 * p, Math.sin(i * 1.6 + 1) * 0.6 * p)))
        })
      }
      if (k === 3) {
        sugar.forEach((b, i) => {
          const tg = skr[i % Math.max(1, skr.length)] ?? k0
          const p = ((t * 0.3 + i / sugar.length) % 1)
          show(b, true); b.position.copy(k0.clone().lerp(tg, ease(p))); fade(b, p > 0.85 ? (1 - p) / 0.15 : 1)
        })
        const gr = 1 + 0.35 * ease(seg(t, 0.5, 4.5))
        S.skrob.forEach((s, i) => s.scale.copy(skrBase[i]).multiplyScalar(gr))
        show(halo, true); halo.position.copy(k0); fade(halo, 0.12)
      }
    }
  }

  /* ═════════ cellular digestion (lysosome) ═════════ */
  if (id === 'prebava') {
    const mem = V(-2.0, 2.15, 1.05).normalize()
    const outside = mem.clone().multiplyScalar(3.9)
    const atMem = mem.clone().multiplyScalar(3.12)
    const inside = mem.clone().multiplyScalar(1.95).add(V(0.2, -0.2, 0.3))
    const lyso = S.lizo[0]
    const lysoP = lyso ? lyso.position.clone() : V(0.6, 1.75, 1.45)
    const food = new THREE.Group()
    ;[[0, 0, 0], [0.09, 0.05, 0.02], [-0.07, 0.06, -0.04], [0.02, -0.08, 0.06], [-0.05, -0.04, 0.08]].forEach(([x, y, z]) => {
      const b = new THREE.Mesh(sph(0.085, 14), toon(C.amber)); b.position.set(x, y, z); food.add(b)
    })
    food.add(new THREE.Mesh(sph(0.2, 18), ink()))
    food.visible = false; group.add(food)
    const wrap = glow(0.27, '#f3e7cf')
    const lys = bead(0.21, '#e58ab0', 0.08)
    const enz = Array.from({ length: 10 }, () => bead(0.025, C.pink, 0.15))
    const bits = Array.from({ length: 8 }, () => bead(0.035, C.amber, 0.15))
    steps.push(
      { hi: ['membrana'], target: atMem, r: 1.5, dur: 7 },
      { hi: ['lizosom'], target: inside.clone().lerp(lysoP, 0.4), r: 1.5, dur: 7, lab: { lizosom: () => lys.position.clone().add(V(0, 0.22, 0)) } },
      { hi: ['lizosom'], target: inside, r: 0.8, dur: 7, lab: { lizosom: () => inside.clone().add(V(0, 0.3, 0)) } },
      { hi: ['lizosom', 'citoplazma'], target: inside, r: 1.5, dur: 7, lab: { lizosom: () => inside.clone().add(V(0, 0.3, 0)) } },
    )
    update = (k, t) => {
      hideAll()
      if (lyso) lyso.visible = !(k >= 1)
      if (k === 0) {
        const a = ease(seg(t, 0, 1.8)), b = ease(seg(t, 2.2, 4.6))
        show(food, true); food.position.copy(outside.clone().lerp(atMem, a).lerp(inside, b))
        show(wrap, a > 0.95); wrap.position.copy(food.position); fade(wrap, 0.55 * Math.min(1, (a - 0.95) * 20))
      } else if (k === 1) {
        show(food, true); food.position.copy(inside)
        show(wrap, true); wrap.position.copy(inside); fade(wrap, 0.5)
        const p = ease(seg(t, 0.3, 3.4))
        show(lys, true); lys.position.copy(lysoP.clone().lerp(inside.clone().add(V(0.1, 0.08, 0.05)), p)); lys.scale.setScalar(1 + p * 0.35)
      } else if (k === 2) {
        show(lys, true); lys.position.copy(inside); lys.scale.setScalar(1.45); fade(lys, 0.55)
        const p = seg(t, 0, 4)
        show(food, true); food.position.copy(inside); food.scale.setScalar(Math.max(0.05, 1 - p))
        enz.forEach((e, i) => { show(e, true); const a = t * 2.4 + i * 0.63; e.position.copy(inside.clone().add(V(Math.cos(a) * 0.2, Math.sin(a * 1.3) * 0.18, Math.sin(a) * 0.2))) })
      } else if (k === 3) {
        show(lys, true); lys.position.copy(inside); lys.scale.setScalar(1.35); fade(lys, 0.5)
        bits.forEach((b, i) => {
          const p = ((t * 0.3 + i / bits.length) % 1)
          show(b, true); b.position.copy(inside.clone().add(V(Math.cos(i * 0.8), Math.sin(i * 1.9) * 0.6, Math.sin(i * 0.8)).multiplyScalar(0.25 + 1.6 * ease(p)))); fade(b, 1 - p * p)
        })
      }
    }
  }

  /* ═════════ vakuola in turgor ═════════ */
  if (id === 'turgor' && S.vac) {
    const vac = S.vac
    const base = vac.scale.clone()
    restore.push(() => vac.scale.copy(base))
    const vp = vac.position.clone()
    const drops = Array.from({ length: 14 }, () => bead(0.05, C.sky, 0.14))
    const from = (i: number) => V(Math.cos(i * 0.9) * 3.4, (i % 3 - 1) * 2.2, 2.6 + Math.sin(i) * 0.2)
    const press = Array.from({ length: 6 }, () => bead(0.035, C.white, 0.2))
    steps.push(
      { hi: ['vakuola'], target: vp, r: 4.2, dur: 7 },
      { hi: ['vakuola'], target: vp, r: 4.3, dur: 7 },
      { hi: ['vakuola', 'stena'], target: vp, r: 4.3, dur: 7 },
      { hi: ['vakuola'], target: vp, r: 4.3, dur: 7 },
    )
    update = (k, t) => {
      hideAll()
      let s = 1
      if (k === 1) s = 1 + 0.12 * ease(seg(t, 0.5, 4.5))
      if (k === 2) s = 1.12 + 0.015 * Math.sin(t * 4)
      if (k === 3) s = t < 3.4 ? 1.12 - 0.5 * ease(seg(t, 0.2, 3.2)) : 0.62 + 0.5 * ease(seg(t, 3.6, 5))
      vac.scale.set(base.x * Math.min(s, 1.13), base.y * s, base.z * s)
      if (k === 1) drops.forEach((d, i) => {
        const p = ((t * 0.35 + i / drops.length) % 1)
        show(d, true); d.position.copy(from(i).lerp(vp, ease(p))); fade(d, p > 0.85 ? (1 - p) / 0.15 : 1)
      })
      if (k === 3 && t < 3.4) drops.forEach((d, i) => {
        const p = ((t * 0.4 + i / drops.length) % 1)
        show(d, true); d.position.copy(vp.clone().lerp(from(i), ease(p))); fade(d, 1 - p)
      })
      if (k === 2) press.forEach((d, i) => {
        const dir = [V(1, 0, 0), V(-1, 0, 0), V(0, 1, 0), V(0, -1, 0), V(0, 0, 1), V(0, 0, -1)][i]
        const lim = [3.0, 3.0, 2.05, 2.05, 2.05, 2.05][i]
        const p = (Math.sin(t * 3 + i) + 1) / 2
        show(d, true); d.position.copy(vp.clone().add(dir.clone().multiplyScalar(lim * (0.82 + 0.12 * p))))
      })
    }
  }

  /* ═════════ migetalke ═════════ */
  if (id === 'migetalke') {
    const top = V(0, 3.4, 0)
    const flow = Array.from({ length: 16 }, () => bead(0.04, C.sky, 0.14))
    steps.push(
      { hi: ['migetalke'], target: top.clone().multiplyScalar(0.85), r: 1.9, dir: V(0.5, 0.75, 0.6).normalize(), dur: 7 },
      { hi: ['migetalke'], target: top.clone().multiplyScalar(0.85), r: 1.9, dir: V(0.5, 0.75, 0.6).normalize(), dur: 7 },
      { hi: ['migetalke'], target: top.clone().multiplyScalar(0.7), r: 2.6, dir: V(0.5, 0.75, 0.6).normalize(), dur: 7 },
    )
    update = (k, t) => {
      hideAll()
      S.amp.cilia = k === 0 ? 1 : 3.2
      S.amp.wave = k === 0 ? 0 : 1
      if (k === 2) flow.forEach((b, i) => {
        const p = ((t * 0.22 + i / flow.length) % 1)
        const a = -1.6 + p * 3.2
        const r = 3.75 + (i % 3) * 0.12
        show(b, true); b.position.set(Math.sin(a) * r, Math.cos(a) * r * 0.95, ((i % 4) - 1.5) * 0.45)
      })
    }
  }

  return {
    steps,
    update,
    dispose: () => {
      S.amp.cilia = 1; S.amp.wave = 0
      S.lizo.forEach(l => { l.visible = true })
      restore.forEach(f => f())
      scene.remove(group)
      geos.forEach(g => g.dispose())
      mats.forEach(m => m.dispose())
      grad.dispose()
    },
  }
}
