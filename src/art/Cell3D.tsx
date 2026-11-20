import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { partName, type PartId } from './Cells'
import { buildProcess, type ProcId, type Proc, type Spots } from './process3d'

/* Cartoon 3D model of the cell: flat colours in three tones, black outlines (inverted hull),
   a quarter of the cell cut away so the inside is visible. The structure follows the cell notes. */

export interface Cell3DProps {
  kind: 'animal' | 'plant' | 'prok'
  focus: PartId | null
  onPick: (id: PartId | null) => void
  labels: boolean
  cut: boolean
  spin: boolean
  /** animated explanation of a process: step and automatic continuation; n restarts the step when it changes */
  proc?: { id: ProcId; step: number; auto: boolean; n: number } | null
  onStepDone?: () => void
  /** height of the floating card at the bottom (px), so the highlighted part sits above it */
  padBottom?: number
  /** width of the floating panel on the right (px, desktop) */
  padRight?: number
}

type Rand = () => number
function rng(seed: number): Rand {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const css = (name: string, fb: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb
const PRIO: PartId[] = ['jedro', 'dnk', 'membrana', 'stena', 'kloroplast', 'vakuola', 'mitohondrij', 'zrnatiER', 'golgi', 'gladkiER', 'ribosomi', 'lizosom', 'jedrce', 'citoplazma', 'centrioli', 'migetalke', 'skrobna', 'citoskelet']
// label positions relative to the point: [direction (-1 above, 1 below), lift in label heights]
const OPTS: [number, number][] = [[-1, 0], [1, 0], [-1, 1], [1, 1], [-1, 2]]
const mixHex = (a: string, b: string, k: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString()

interface Built {
  root: THREE.Group
  orgs: Map<PartId, THREE.Object3D[]>
  anchors: Map<PartId, THREE.Vector3>
  mats: Map<PartId, THREE.Material[]>
  geos: THREE.BufferGeometry[]
  cutMats: THREE.Material[]
  halves: { plane: THREE.Plane; pos: THREE.Vector3; axis: THREE.Vector3 }[]
  /* candidate points for each organelle's label (the visible one is chosen) */
  cands: Map<PartId, THREE.Vector3[]>
  /* labels that follow the view (phiC = camera azimuth, atan2(z, x)) */
  dyn: Map<PartId, (phiC: number) => THREE.Vector3>
  /* for the bacterium: the cut is always along the long axis (x axis); cutN points to the viewer, perpendicular to the axis */
  cutN?: THREE.Vector3
  spots: Spots
  tick: (t: number) => void
}

function wobbleSphere(r: number, seg: number, amp: number, seed: number) {
  const g = new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75))
  const p = g.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n = v.clone().normalize()
    const k = 1 + amp * (Math.sin(3.1 * n.x + seed) * Math.sin(2.3 * n.y + seed * 0.7) + 0.6 * Math.sin(4.2 * n.z + seed * 1.3) * Math.cos(2.7 * n.x))
    p.setXYZ(i, n.x * r * k, n.y * r * k, n.z * r * k)
  }
  g.computeVertexNormals()
  return g
}

/* A cisterna of the rough ER: a thin curved surface (part of a spherical shell around the nucleus) with a thickness
   that tapers to a sharp edge at the rims so it is closed. Polar angle a from the top, azimuth f = atan2(z, x). */
function erSheet(rho: number, a1: number, a2: number, f1: number, f2: number, h: number, wob: number) {
  const SU = 120, SV = 18
  const pos: number[] = []
  const taper = (t: number) => { const e = Math.min(1, t / 0.07, (1 - t) / 0.07); return e * e * (3 - 2 * e) }
  for (let i = 0; i <= SU; i++) {
    const t = i / SU, f = f1 + (f2 - f1) * t, k = taper(t)
    for (let j = 0; j < SV; j++) {
      const w = (j / SV) * Math.PI * 2, cv = Math.cos(w), sv = Math.sin(w)
      const a = (a1 + a2) / 2 + ((a2 - a1) / 2) * cv
      const r = rho + wob * Math.sin(3 * f + 2.2 * a) + (h / 2) * Math.sign(sv) * Math.sqrt(Math.abs(sv)) * k
      pos.push(r * Math.sin(a) * Math.cos(f), r * Math.cos(a), r * Math.sin(a) * Math.sin(f))
    }
  }
  const idx: number[] = []
  for (let i = 0; i < SU; i++) for (let j = 0; j < SV; j++) {
    const A = i * SV + j, B = i * SV + ((j + 1) % SV), C = (i + 1) * SV + j, D = (i + 1) * SV + ((j + 1) % SV)
    idx.push(A, C, B, B, C, D)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  // normals must point outwards, otherwise the outline (inverted hull) falls inwards
  const nAt = g.attributes.normal as THREE.BufferAttribute, pAt = g.attributes.position as THREE.BufferAttribute
  const q = (SU >> 1) * SV + (SV >> 2)
  const pv = new THREE.Vector3().fromBufferAttribute(pAt, q), nv = new THREE.Vector3().fromBufferAttribute(nAt, q)
  if (nv.dot(pv) < 0) {
    const ix = g.index!.array as unknown as number[]
    for (let i = 0; i < ix.length; i += 3) { const tmp = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = tmp }
    g.index!.needsUpdate = true
    g.computeVertexNormals()
  }
  return g
}

function gradientMap(steps: number[]) {
  const data = new Uint8Array(steps.length * 4)
  steps.forEach((s, i) => { const v = Math.round(s * 255); data.set([v, v, v, 255], i * 4) })
  const t = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat)
  t.minFilter = THREE.NearestFilter; t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true
  return t
}

function build(kind: 'animal' | 'plant' | 'prok', wedge: THREE.Plane[]): Built {
  const root = new THREE.Group()
  const orgs = new Map<PartId, THREE.Object3D[]>()
  const anchors = new Map<PartId, THREE.Vector3>()
  const mats = new Map<PartId, THREE.Material[]>()
  const geos: THREE.BufferGeometry[] = []
  const cutMats: THREE.Material[] = []
  const cands = new Map<PartId, THREE.Vector3[]>()
  const dyn = new Map<PartId, (phiC: number) => THREE.Vector3>()
  const R = rng(kind === 'animal' ? 7 : 13)
  const ticks: ((t: number) => void)[] = []
  const spots: Spots = { kind, nPos: new THREE.Vector3(), nR: 1, mito: [], lizo: [], kloro: [], skrob: [], amp: { cilia: 1, wave: 0 } }
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const INK = dark ? '#06070a' : '#1a1d24'
  const grad = gradientMap([0.58, 0.8, 1])
  let cur: PartId = 'citoplazma'

  const reg = (m: THREE.Material) => { m.userData.base = { o: m.opacity, t: m.transparent, d: m.depthWrite }; mats.set(cur, [...(mats.get(cur) ?? []), m]); return m }
  const geo = <G extends THREE.BufferGeometry>(g: G) => { geos.push(g); return g }
  const toon = (color: string, o: Partial<THREE.MeshToonMaterialParameters> = {}, clip?: THREE.Plane[] | 'wedge') => {
    const m = new THREE.MeshToonMaterial({ color: new THREE.Color(color), gradientMap: grad, ...o })
    if (clip === 'wedge') { m.clippingPlanes = wedge; m.clipIntersection = true; cutMats.push(m) } else if (clip) m.clippingPlanes = clip
    return reg(m)
  }
  const inkMat = (t: number, clip?: THREE.Plane[] | 'wedge') => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(INK), side: THREE.BackSide })
    m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n  transformed += normalize(normal) * ${t.toFixed(4)};`) }
    m.customProgramCacheKey = () => 'ink' + t.toFixed(4)
    if (clip === 'wedge') { m.clippingPlanes = wedge; m.clipIntersection = true; cutMats.push(m) } else if (clip) m.clippingPlanes = clip
    return reg(m)
  }
  // body + outline
  const solid = (g: THREE.BufferGeometry, color: string, ink = 0.02, o: Partial<THREE.MeshToonMaterialParameters> = {}, clip?: THREE.Plane[] | 'wedge') => {
    const grp = new THREE.Group()
    grp.add(new THREE.Mesh(geo(g), toon(color, o, clip)))
    if (ink > 0) grp.add(new THREE.Mesh(g, inkMat(ink, clip)))
    return grp
  }
  const add = (id: PartId, o: THREE.Object3D, anchor?: THREE.Vector3) => {
    o.traverse(c => { c.userData.org = id })
    root.add(o)
    orgs.set(id, [...(orgs.get(id) ?? []), o])
    if (anchor && !anchors.has(id)) anchors.set(id, anchor)
    const c = anchor ?? (o.position.lengthSq() > 1e-4 ? o.position.clone() : null)
    if (c) cands.set(id, [...(cands.get(id) ?? []), c])
  }
  const as = (id: PartId) => { cur = id }

  const P = {
    mem: css('--o-mem', '#3a414b'), jedro: css('--o-jedro', '#6a5ecb'), jedroF: css('--o-jedro-f', '#ebe8fb'), jedrce: css('--o-jedrce', '#4b3fa6'),
    zer: css('--o-zer', '#4b7fc2'), ger: css('--o-ger', '#6fa7d6'), ribo: css('--o-ribo', '#27324a'), golgi: css('--o-golgi', '#d2922a'), golgiF: css('--o-golgi-f', '#f7e6c3'),
    mito: css('--o-mito', '#d9664a'), mitoF: css('--o-mito-f', '#fbe3db'), kloro: css('--o-kloro', '#3e9a52'), kloroF: css('--o-kloro-f', '#dcefdc'), vak: css('--o-vak', '#5fa8bd'), vakF: css('--o-vak-f', '#e2f2f6'),
    lizo: css('--o-lizo', '#c5547e'), lizoF: css('--o-lizo-f', '#f7dfe8'), centri: css('--o-centri', '#b0852b'), cito: css('--o-cito-d', '#6b7480'), mig: css('--o-mig', '#56606c'),
    stena: css('--o-stena', '#86ac62'), stenaF: css('--o-stena-f', '#e7f0db'), skrob: css('--o-skrob', '#bba65d'), skrobF: css('--o-skrob-f', '#f6f0da'),
  }
  const memOut = dark ? '#d9cfba' : '#f3e7cf'
  const cytoIn = dark ? '#2a2723' : '#fbf6ec'
  const m2 = (a: string, b: string, k = 0.45) => mixHex(a, b, k)
  const tmp = new THREE.Object3D()

  /* ───── prokaryotic cell (bacterium, rod shaped): cell wall, cell membrane,
     cytoplasm, one circular DNA without proteins and without a nuclear envelope, smaller ribosomes.
     No nucleus, ER, Golgi, mitochondria or plastids (notes, p. 2). ───── */
  if (kind === 'prok') {
    const L = 2.9, RW = 1.0, RWI = 0.93, RM = 0.885, RC = 0.86
    const cap = (r: number, seg = 64) => { const g = new THREE.CapsuleGeometry(r, L, 18, seg); g.rotateZ(Math.PI / 2); return g }
    const prokW = css('--o-prokw', '#8d97a3'), prokWF = css('--o-prokw-f', '#eceef2')
    // wall: outer and inner surface (shows as a thicker edge in the cut)
    as('stena')
    const wg = cap(RW)
    const wall = new THREE.Group()
    wall.add(new THREE.Mesh(geo(wg), toon(m2(prokW, prokWF, 0.55), {}, 'wedge')))
    wall.add(new THREE.Mesh(wg, inkMat(0.03, 'wedge')))
    wall.add(new THREE.Mesh(geo(cap(RWI)), toon(m2(prokW, prokWF, 0.15), { side: THREE.BackSide }, 'wedge')))
    add('stena', wall, new THREE.Vector3(0, RW, 0))
    // cut edge: direction in the cut plane, perpendicular to the axis, facing up
    const cutN = new THREE.Vector3(0, 0, 1)
    const rimUp = () => {
      const e = new THREE.Vector3(0, cutN.z, -cutN.y)
      if (e.y < -1e-3 || (Math.abs(e.y) <= 1e-3 && e.z > 0)) e.negate()
      return e.normalize()
    }
    const behind = (v: THREE.Vector3, d = 0.05) => v.sub(cutN.clone().multiplyScalar(d))
    dyn.set('stena', () => behind(rimUp().multiplyScalar(RW * 0.97).setX(-0.35)))
    // membrane: a thin dark layer just under the wall
    as('membrana')
    const mem = new THREE.Mesh(geo(cap(RM)), toon(P.mem, { side: THREE.BackSide }, 'wedge'))
    add('membrana', mem, new THREE.Vector3(0, -RM, 0))
    dyn.set('membrana', () => behind(rimUp().multiplyScalar(-RM * 0.985).setX(0.55)))
    // citoplazma
    as('citoplazma')
    const cyto = new THREE.Mesh(geo(cap(RC)), toon(cytoIn, { side: THREE.BackSide }, 'wedge'))
    add('citoplazma', cyto, new THREE.Vector3(-1.3, -0.35, 0))
    dyn.set('citoplazma', () => {
      const p0 = new THREE.Vector3(-1.75, 0, 0).add(rimUp().multiplyScalar(-0.42))
      return p0.sub(cutN.clone().multiplyScalar(cutN.dot(p0) + 0.06))
    })
    // circular DNA: one closed, twisted ring in the nucleoid (not surrounded by a membrane). It stays whole in the cut,
    // so it is visible that it is a single circular molecule.
    as('dnk')
    const ringN = new THREE.Vector3(0, Math.cos(0.5), Math.sin(0.5))
    const ringU = new THREE.Vector3(1, 0, 0), ringV = new THREE.Vector3().crossVectors(ringN, ringU)
    const ringAt = (t: number) => {
      const rad = ringU.clone().multiplyScalar(Math.cos(t)).add(ringV.clone().multiplyScalar(Math.sin(t)))
      const c = ringU.clone().multiplyScalar(1.12 * Math.cos(t)).add(ringV.clone().multiplyScalar(0.36 * Math.sin(t)))
      const r = 0.15 + 0.045 * Math.sin(5 * t)
      return c.add(rad.normalize().multiplyScalar(r * Math.cos(15 * t))).add(ringN.clone().multiplyScalar(r * Math.sin(15 * t + 0.5 * Math.sin(3 * t))))
    }
    const dnaCurve = new THREE.CatmullRomCurve3(Array.from({ length: 360 }, (_, i) => ringAt((i / 360) * Math.PI * 2)), true, 'catmullrom', 0.5)
    const dna = solid(new THREE.TubeGeometry(dnaCurve, 1400, 0.024, 7, true), P.jedro, 0.008)
    add('dnk', dna)
    cands.set('dnk', dnaCurve.getSpacedPoints(48))
    anchors.set('dnk', dnaCurve.getPoint(0.1))
    // ribosomes (smaller than in eukaryotes), throughout the cytoplasm, sparser in the nucleoid
    as('ribosomi')
    const rpts: THREE.Vector3[] = []
    const inside = (v: THREE.Vector3) => { const cx = Math.max(-L / 2, Math.min(L / 2, v.x)); return Math.hypot(v.x - cx, v.y, v.z) < RC - 0.07 }
    for (let k = 0; rpts.length < 260 && k < 9000; k++) {
      const v = new THREE.Vector3((R() - 0.5) * (L + 2 * RC), (R() - 0.5) * 2 * RC, (R() - 0.5) * 2 * RC)
      if (!inside(v)) continue
      const inNuc = (v.x / 1.4) ** 2 + (v.dot(ringV) / 0.62) ** 2 + (v.dot(ringN) / 0.3) ** 2 < 1
      if (inNuc && R() < 0.85) continue
      rpts.push(v)
    }
    const rib = new THREE.InstancedMesh(geo(new THREE.SphereGeometry(0.036, 10, 8)), toon(P.ribo, {}, 'wedge'), rpts.length)
    rpts.forEach((v, i) => { tmp.position.copy(v); tmp.rotation.set(0, 0, 0); tmp.scale.setScalar(1); tmp.updateMatrix(); rib.setMatrixAt(i, tmp.matrix) })
    add('ribosomi', rib)
    cands.set('ribosomi', rpts.filter((_, i) => i % 9 === 0))
    anchors.set('ribosomi', rpts[0])
    // slow “breathing” of the DNA (the look of a living cell)
    ticks.push(t => { dna.rotation.x = Math.sin(t * 0.35) * 0.04; dna.rotation.y = Math.sin(t * 0.27) * 0.03 })
    return { root, orgs, anchors, mats, geos, cutMats, halves: [], cands, dyn, cutN, spots, tick: t => ticks.forEach(f => f(t)) }
  }

  /* ───── the cell's envelope: membrane (and the wall in plants) ───── */
  if (kind === 'animal') {
    as('membrana')
    const mg = wobbleSphere(3.2, 96, 0.045, 1.7)
    const shell = new THREE.Group()
    shell.add(new THREE.Mesh(geo(mg), toon(memOut, { side: THREE.FrontSide }, 'wedge')))
    shell.add(new THREE.Mesh(mg, inkMat(0.035, 'wedge')))
    add('membrana', shell, new THREE.Vector3(2.4, 2.25, 0.9))
    dyn.set('membrana', f => new THREE.Vector3(Math.cos(0.45) * Math.cos(f + 1.05), Math.sin(0.45), Math.cos(0.45) * Math.sin(f + 1.05)).multiplyScalar(3.22))
    as('citoplazma')
    const inner = new THREE.Mesh(geo(wobbleSphere(3.1, 96, 0.045, 1.7)), toon(cytoIn, { side: THREE.BackSide }, 'wedge'))
    add('citoplazma', inner, new THREE.Vector3(1.5, -2.0, 1.4))
    dyn.set('citoplazma', f => new THREE.Vector3(Math.cos(f + 0.45) * 1.6, -2.1, Math.sin(f + 0.45) * 1.6))
  } else {
    as('stena')
    const wg = new RoundedBoxGeometry(6.7, 4.7, 4.7, 6, 0.6)
    const wall = new THREE.Group()
    wall.add(new THREE.Mesh(geo(wg), toon(m2(P.stena, P.stenaF, 0.55), {}, 'wedge')))
    wall.add(new THREE.Mesh(wg, inkMat(0.035, 'wedge')))
    add('stena', wall, new THREE.Vector3(2.9, 2.35, 1.4))
    dyn.set('stena', f => { const d = new THREE.Vector3(Math.cos(0.5) * Math.cos(f + 1.05), Math.sin(0.5), Math.cos(0.5) * Math.sin(f + 1.05)); return d.multiplyScalar(Math.min(3.35 / Math.abs(d.x || 1e-6), 2.35 / Math.abs(d.y || 1e-6), 2.35 / Math.abs(d.z || 1e-6)) * 0.98) })
    as('membrana')
    const memIn = new THREE.Mesh(geo(new RoundedBoxGeometry(6.3, 4.3, 4.3, 6, 0.46)), toon(m2(P.stena, P.mem, 0.55), { side: THREE.BackSide }, 'wedge'))
    add('membrana', memIn, new THREE.Vector3(-3.0, 1.7, 1.2))
    as('citoplazma')
    const cyto = new THREE.Mesh(geo(new RoundedBoxGeometry(6.2, 4.2, 4.2, 6, 0.44)), toon(cytoIn, { side: THREE.BackSide }, 'wedge'))
    add('citoplazma', cyto, new THREE.Vector3(-2.3, -1.75, 1.6))
  }

  /* ───── nucleus: double nuclear envelope with pores, chromatin, nucleolus ───── */
  as('jedro')
  const nPos = kind === 'animal' ? new THREE.Vector3(0.12, 0.2, 0.12) : new THREE.Vector3(2.05, 0.75, 0.85)
  const nR = kind === 'animal' ? 1.02 : 0.82
  const nuc = new THREE.Group()
  nuc.position.copy(nPos)
  const nOuter = new THREE.SphereGeometry(nR, 64, 48)
  nuc.add(new THREE.Mesh(geo(nOuter), toon(P.jedro, {}, 'wedge')))
  nuc.add(new THREE.Mesh(nOuter, inkMat(0.026, 'wedge')))
  nuc.add(new THREE.Mesh(geo(new THREE.SphereGeometry(nR * 0.9, 48, 36)), toon(m2(P.jedro, P.jedroF, 0.7), { side: THREE.BackSide }, 'wedge')))
  const poreG = geo(new THREE.TorusGeometry(nR * 0.05, nR * 0.016, 8, 18))
  const pores = new THREE.InstancedMesh(poreG, toon(P.jedrce, {}, 'wedge'), 58)
  for (let i = 0; i < 58; i++) {
    const y = 1 - (i / 57) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963
    const n = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r)
    tmp.position.copy(n).multiplyScalar(nR * 1.005); tmp.lookAt(n.clone().multiplyScalar(nR * 2)); tmp.updateMatrix()
    pores.setMatrixAt(i, tmp.matrix)
  }
  nuc.add(pores)
  const chromM = toon(m2(P.jedro, P.jedrce, 0.5))
  for (let k = 0; k < 9; k++) {
    const pts: THREE.Vector3[] = []
    for (let j = 0; j < 7; j++) pts.push(new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(nR * (0.3 + R() * 0.5)))
    nuc.add(new THREE.Mesh(geo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 70, nR * 0.02, 6, false)), chromM))
  }
  add('jedro', nuc, nPos.clone().add(new THREE.Vector3(-0.55, -0.95, 0.55)))
  spots.nPos = nPos.clone(); spots.nR = nR
  dyn.set('jedro', f => nPos.clone().add(new THREE.Vector3(Math.cos(f) * nR * 0.3, -nR * 0.62, Math.sin(f) * nR * 0.3)))
  as('jedrce')
  const ncl = solid(wobbleSphere(nR * 0.32, 32, 0.12, 4), P.jedrce, 0.016)
  ncl.position.copy(nPos).add(kind === 'animal' ? new THREE.Vector3(0.28, 0.12, 0.3) : new THREE.Vector3(0.2, 0.16, 0.22))
  add('jedrce', ncl, ncl.position.clone().add(new THREE.Vector3(0.05, 0.42, 0.2)))

  /* ───── rough ER: parallel flattened cisternae around the nucleus (outwards from the nuclear envelope),
     studded with ribosomes. The cut slices them like the nucleus, so parallel arcs show in the cut away part. ───── */
  as('zrnatiER')
  const er = new THREE.Group()
  const erPts: THREE.Vector3[] = []
  const erCol = m2(P.zer, '#ffffff', 0.28)
  // animal: a gap at the Golgi apparatus (azimuth ~0.45); plant: none on the side towards the wall (+x) and past the vacuole
  const sheets = kind === 'animal'
    ? [{ rho: 1.25, a1: 0.45, a2: 2.05 }, { rho: 1.4, a1: 0.5, a2: 2.0 }, { rho: 1.55, a1: 0.56, a2: 1.94 }].map(o => ({ ...o, f1: 1.07, f2: 6.1 }))
    : [{ rho: 1.0, a1: 1.0, a2: 2.25 }, { rho: 1.14, a1: 1.05, a2: 2.2 }].map(o => ({ ...o, f1: 1.25, f2: 5.05 }))
  const H = 0.07
  sheets.forEach((sh, si) => {
    const g = solid(erSheet(sh.rho, sh.a1, sh.a2, sh.f1, sh.f2, H, 0.025), erCol, 0.014, { side: THREE.DoubleSide }, 'wedge')
    g.position.copy(nPos)
    er.add(g)
    const n = Math.round((sh.f2 - sh.f1) * (sh.a2 - sh.a1) * sh.rho * sh.rho * 15)
    for (let k = 0; k < n; k++) {
      const t = 0.08 + R() * 0.84, f = sh.f1 + (sh.f2 - sh.f1) * t
      const a = sh.a1 + 0.08 + R() * (sh.a2 - sh.a1 - 0.16)
      const side = (k + si) % 2 ? 1 : -1
      const r = sh.rho + 0.025 * Math.sin(3 * f + 2.2 * a) + side * (H / 2 + 0.018)
      erPts.push(new THREE.Vector3(r * Math.sin(a) * Math.cos(f), r * Math.cos(a), r * Math.sin(a) * Math.sin(f)).add(nPos))
    }
  })
  const erAnchor = (() => { const sh = sheets[sheets.length - 1], f = kind === 'animal' ? 2.05 : 2.3, a = kind === 'animal' ? 0.75 : 1.5; return new THREE.Vector3(sh.rho * Math.sin(a) * Math.cos(f), sh.rho * Math.cos(a), sh.rho * Math.sin(a) * Math.sin(f)).add(nPos) })()
  add('zrnatiER', er, erAnchor)
  {
    const sh = sheets[sheets.length - 1], a = kind === 'animal' ? 0.9 : 1.45
    const fit = (f: number) => { const x = (((f - sh.f1) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) + sh.f1; return x > sh.f1 + 0.12 && x < sh.f2 - 0.12 ? x : null }
    dyn.set('zrnatiER', fc => {
      const f = fit(fc + Math.PI / 4 + 0.32) ?? fit(fc - Math.PI / 4 - 0.32) ?? sh.f1 + 0.3
      return new THREE.Vector3(sh.rho * Math.sin(a) * Math.cos(f), sh.rho * Math.cos(a), sh.rho * Math.sin(a) * Math.sin(f)).add(nPos)
    })
  }

  /* ───── smooth ER: branching tubes ───── */
  as('gladkiER')
  const ger = new THREE.Group()
  const gerBase = kind === 'animal' ? new THREE.Vector3(0.75, -1.45, 0.55) : new THREE.Vector3(2.2, -0.6, -0.6)
  const gerCol = m2(P.ger, '#ffffff', 0.25)
  for (let k = 0; k < 6; k++) {
    const pts: THREE.Vector3[] = []
    let dir = new THREE.Vector3(R() - 0.5, (R() - 0.5) * 0.6, R() - 0.5).normalize()
    let p = gerBase.clone().add(new THREE.Vector3((R() - 0.5) * 0.4, (R() - 0.5) * 0.3, (R() - 0.5) * 0.4))
    for (let j = 0; j < 5; j++) { pts.push(p.clone()); dir = dir.add(new THREE.Vector3((R() - 0.5) * 0.8, (R() - 0.5) * 0.5, (R() - 0.5) * 0.8)).normalize(); p = p.add(dir.clone().multiplyScalar(0.28)) }
    ger.add(solid(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.07, 10, false), gerCol, 0.016))
    // the tubes are closed: rounded ends
    for (const e of [pts[0], pts[pts.length - 1]]) { const cap = solid(new THREE.SphereGeometry(0.07, 14, 10), gerCol, 0.016); cap.position.copy(e); ger.add(cap) }
  }
  add('gladkiER', ger, gerBase.clone().add(new THREE.Vector3(0.25, -0.5, 0.45)))

  /* ───── Golgi apparatus: a stack of 5 curved flattened cisternae (cis side towards the ER and nucleus,
     trans side towards the membrane) and vesicles budding from the rims ───── */
  as('golgi')
  const gPos = kind === 'animal' ? new THREE.Vector3(1.62, -0.58, 0.86) : new THREE.Vector3(-0.55, -1.35, 1.25)
  const gAxis = (kind === 'animal' ? gPos.clone().sub(nPos) : new THREE.Vector3(0, -0.55, 0.84)).normalize()
  const gS = kind === 'animal' ? 1 : 0.75
  const golgi = new THREE.Group()
  const gCol = m2(P.golgi, P.golgiF, 0.35)
  const cisterna = (ax: number, az: number, bend: number) => {
    const g = new THREE.SphereGeometry(1, 44, 18)
    const pa = g.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i) * ax, z = pa.getZ(i) * az
      // slightly thickened rims (widened ends of the cisternae) and a bend into a bowl
      const rim = Math.min(1, Math.hypot(pa.getX(i), pa.getZ(i)))
      const y = pa.getY(i) * 0.045 * (1 + 0.5 * rim ** 6) + bend * (x * x + 0.55 * z * z)
      pa.setXYZ(i, x, y, z)
    }
    g.computeVertexNormals()
    return g
  }
  for (let k = 0; k < 5; k++) {
    const c = solid(cisterna(0.72 - k * 0.045, 0.5 - k * 0.03, 0.62), gCol, 0.016)
    c.position.y = k * 0.14
    golgi.add(c)
  }
  golgi.position.copy(gPos)
  golgi.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), gAxis)
  golgi.rotateY(kind === 'animal' ? 0.5 : 1.2)
  golgi.scale.setScalar(gS)
  golgi.updateMatrixWorld(true)
  add('golgi', golgi, golgi.localToWorld(new THREE.Vector3(0.1, 0.62, 0.1)))
  spots.golgi = golgi; spots.gAxis = gAxis.clone()
  const vesG = new THREE.SphereGeometry(0.085, 20, 14)
  const vesicles: { o: THREE.Object3D; a: THREE.Vector3; b: THREE.Vector3; ph: number; travel: boolean }[] = []
  for (let k = 0; k < 9; k++) {
    const vo = solid(vesG.clone(), gCol, 0.014)
    // vesicles along the rims of the trans side and above it
    const side = k % 2 ? 1 : -1, lvl = 2 + (k % 3)
    const loc = k < 6
      ? new THREE.Vector3(side * (0.72 - lvl * 0.045 + 0.1 + R() * 0.06), lvl * 0.14 + 0.3, (R() - 0.5) * 0.5)
      : new THREE.Vector3((R() - 0.5) * 0.6, 1.0 + R() * 0.25, (R() - 0.5) * 0.4)
    const a = golgi.localToWorld(loc)
    const travel = k >= 6 && kind === 'animal'
    const b = travel ? a.clone().add(gAxis.clone().multiplyScalar(0.2)).normalize().multiplyScalar(2.95) : a.clone()
    vo.position.copy(a)
    vo.scale.setScalar(gS)
    vesicles.push({ o: vo, a, b, ph: R(), travel })
    add('golgi', vo)
  }
  ticks.push(t => vesicles.forEach(ve => {
    if (ve.travel) { const s = (t * 0.12 + ve.ph) % 1; const e = s * s * (3 - 2 * s); ve.o.position.lerpVectors(ve.a, ve.b, e); ve.o.scale.setScalar(s > 0.92 ? Math.max(0.01, (1 - s) / 0.08) : 1) }
    else ve.o.position.set(ve.a.x + Math.sin(t * 0.7 + ve.ph * 6) * 0.04, ve.a.y + Math.cos(t * 0.6 + ve.ph * 6) * 0.04, ve.a.z)
  }))

  /* ───── mitochondria: lengthwise cut ───── */
  as('mitohondrij')
  const mSpots = kind === 'animal'
    ? [[-1.95, 1.3, 0.95], [-0.2, -1.7, 1.75], [-1.55, -1.55, 0.2], [0.85, 2.05, -1.0], [-0.6, -1.95, -1.2], [2.25, 0.45, 0.6]]
    : [[0.5, 1.75, 1.25], [1.9, -1.6, 0.2], [-0.45, -1.75, 1.4], [2.6, 1.5, -1.2]]
  const halves: Built['halves'] = []
  // a lengthwise cut that always turns towards the viewer (updated while rotating)
  const halfCut = (g: THREE.Object3D, axis: THREE.Vector3) => {
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)
    halves.push({ plane, pos: g.position.clone(), axis: axis.clone() })
    return [plane]
  }
  mSpots.forEach((p, k) => {
    const g = new THREE.Group()
    g.position.set(p[0], p[1], p[2])
    g.rotation.set(R() * 3, R() * 3, R() * 3)
    g.updateMatrixWorld()
    const len = kind === 'animal' ? 0.62 : 0.5
    const clip = halfCut(g, new THREE.Vector3(0, 1, 0).applyQuaternion(g.quaternion))
    const outer = new THREE.CapsuleGeometry(0.25, len, 10, 28)
    g.add(new THREE.Mesh(geo(outer), toon(m2(P.mito, P.mitoF, 0.25), { side: THREE.DoubleSide }, clip)))
    g.add(new THREE.Mesh(outer, inkMat(0.016, clip)))
    g.add(new THREE.Mesh(geo(new THREE.CapsuleGeometry(0.205, len, 10, 28)), toon(m2(P.mito, P.mitoF, 0.7), { side: THREE.BackSide }, clip)))
    const crM = toon(P.mito, { side: THREE.DoubleSide }, clip)
    for (let j = 0; j < 6; j++) {
      const c = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 18, 1, false, 0, Math.PI)), crM)
      c.position.y = -len / 2 - 0.05 + j * ((len + 0.1) / 5)
      c.rotation.y = j % 2 ? 0 : Math.PI
      c.position.x = j % 2 ? 0.055 : -0.055
      g.add(c)
    }
    const dna = new THREE.Mesh(geo(new THREE.TorusGeometry(0.055, 0.009, 6, 24)), toon(P.jedro, {}, clip))
    dna.position.set(0, len * 0.18, 0)
    g.add(dna)
    add('mitohondrij', g, k === 0 ? new THREE.Vector3(p[0], p[1] + 0.52, p[2] + 0.2) : undefined)
    spots.mito.push(g.position.clone())
  })

  if (kind === 'plant') {
    /* ───── chloroplasts: cut with grana ───── */
    as('kloroplast')
    const kSpots: [number, number, number][] = [[-0.95, 1.8, 1.3], [1.5, 1.85, 0.4], [2.6, -0.95, 1.55], [2.75, -0.75, -1.0], [1.2, -1.85, 1.4], [-1.35, -1.85, -0.9], [-2.75, -0.45, 1.25], [0.2, 1.85, -1.5], [-0.15, -1.85, 0.25], [2.75, 1.4, -0.6]]
    kSpots.forEach((p, k) => {
      const g = new THREE.Group()
      g.position.set(p[0], p[1], p[2])
      g.rotation.set(R() * 0.5, R() * 3, R() * 0.5)
      g.updateMatrixWorld()
      const clip = halfCut(g, new THREE.Vector3(1, 0, 0).applyQuaternion(g.quaternion))
      const body = new THREE.SphereGeometry(0.44, 36, 22)
      const outer = new THREE.Mesh(geo(body), toon(m2(P.kloro, P.kloroF, 0.4), { side: THREE.DoubleSide }, clip)); outer.scale.set(1, 0.5, 0.64)
      const ink = new THREE.Mesh(body, inkMat(0.03, clip)); ink.scale.copy(outer.scale)
      const inner = new THREE.Mesh(geo(new THREE.SphereGeometry(0.41, 30, 18)), toon(m2(P.kloro, P.kloroF, 0.8), { side: THREE.BackSide }, clip)); inner.scale.copy(outer.scale)
      g.add(outer, ink, inner)
      const gm = toon(m2(P.kloro, '#0b3d1a', 0.25), {}, clip)
      for (const sx of [-0.24, 0, 0.24]) for (let j = 0; j < 5; j++) {
        const disc = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.075, 0.075, 0.022, 16)), gm)
        disc.position.set(sx, -0.065 + j * 0.032, 0)
        g.add(disc)
      }
      g.add(new THREE.Mesh(geo(new THREE.BoxGeometry(0.6, 0.008, 0.05)), gm))
      add('kloroplast', g, k === 0 ? new THREE.Vector3(p[0], p[1] + 0.45, p[2] + 0.3) : undefined)
      spots.kloro.push(g.position.clone())
    })
    /* ───── large central vacuole ───── */
    as('vakuola')
    const vg = wobbleSphere(1.0, 64, 0.06, 3)
    const vac = new THREE.Group()
    vac.add(new THREE.Mesh(geo(vg), toon(m2(P.vak, P.vakF, 0.55), {}, 'wedge')))
    vac.add(new THREE.Mesh(vg, inkMat(0.022, 'wedge')))
    vac.add(new THREE.Mesh(geo(wobbleSphere(0.97, 48, 0.06, 3)), toon(m2(P.vak, P.vakF, 0.85), { side: THREE.BackSide }, 'wedge')))
    vac.scale.set(1.75, 1.25, 1.3)
    vac.position.set(-0.35, -0.05, -0.25)
    add('vakuola', vac, new THREE.Vector3(-0.2, 0.2, 1.2))
    spots.vac = vac
    /* ───── starch grains ───── */
    as('skrobna')
    ;[[-2.65, 1.65, -0.6], [1.9, -1.8, -0.95], [-0.9, 1.75, -1.45]].forEach((p, k) => {
      const s = solid(new THREE.SphereGeometry(0.17, 22, 16), m2(P.skrob, P.skrobF, 0.4), 0.014)
      s.scale.set(1.3, 0.9, 1); s.position.set(p[0], p[1], p[2])
      add('skrobna', s, k === 0 ? new THREE.Vector3(p[0], p[1] + 0.38, p[2] + 0.4) : undefined)
      spots.skrob.push(s)
    })
  } else {
    /* ───── lizosomi ───── */
    as('lizosom')
    ;[[0.6, 1.75, 1.45], [-1.95, -0.4, -1.6], [1.95, -1.6, -0.4]].forEach((p, k) => {
      const s = solid(new THREE.SphereGeometry(0.21, 26, 18), m2(P.lizo, P.lizoF, 0.35), 0.016)
      s.position.set(p[0], p[1], p[2])
      add('lizosom', s, k === 0 ? new THREE.Vector3(p[0], p[1] + 0.38, p[2] + 0.2) : undefined)
      spots.lizo.push(s)
    })
    /* ───── smaller vacuoles ───── */
    as('vakuola')
    ;[[-2.25, 0.6, 1.25], [0.2, -2.25, 1.35]].forEach((p, k) => {
      const s = solid(new THREE.SphereGeometry(0.28, 26, 18), m2(P.vak, P.vakF, 0.55), 0.016)
      s.position.set(p[0], p[1], p[2])
      add('vakuola', s, k === 0 ? new THREE.Vector3(p[0] - 0.1, p[1] + 0.42, p[2] + 0.2) : undefined)
    })
    /* ───── centrioles: two perpendicular cylinders of 9 microtubule triplets ───── */
    as('centrioli')
    const cPos = new THREE.Vector3(-0.85, -1.3, 1.05)
    const cm = toon(m2(P.centri, '#ffffff', 0.15))
    const tubeG = geo(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 8))
    const centriole = () => {
      const g = new THREE.Group()
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2
        for (let j = 0; j < 3; j++) {
          const rr = 0.085 + j * 0.022
          const m = new THREE.Mesh(tubeG, cm)
          m.position.set(Math.cos(a + j * 0.18) * rr, 0, Math.sin(a + j * 0.18) * rr)
          g.add(m)
        }
      }
      return g
    }
    const c1 = centriole(), c2 = centriole()
    c2.rotation.z = Math.PI / 2; c2.position.set(0.26, 0.17, 0)
    const cg = new THREE.Group(); cg.add(c1, c2); cg.position.copy(cPos)
    add('centrioli', cg, cPos.clone().add(new THREE.Vector3(0.1, 0.42, 0.1)))
    /* ───── migetalke ───── */
    as('migetalke')
    const cilia: THREE.Object3D[] = []
    const cilM = toon(m2(P.mig, '#ffffff', 0.15))
    const cilInk = inkMat(0.012)
    for (let k = 0; k < 18; k++) {
      const th = (k / 18) * Math.PI * 2, ph = 0.22 + (k % 3) * 0.09
      const n = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th))
      const pivot = new THREE.Group()
      pivot.position.copy(n.clone().multiplyScalar(3.1))
      pivot.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n)
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05, 0.28, 0), new THREE.Vector3(-0.04, 0.55, 0.03), new THREE.Vector3(0.02, 0.78, 0)])
      const tg = geo(new THREE.TubeGeometry(curve, 16, 0.026, 8, false))
      pivot.add(new THREE.Mesh(tg, cilM), new THREE.Mesh(tg, cilInk))
      pivot.userData.ph = th
      cilia.push(pivot)
      add('migetalke', pivot, n.clone().multiplyScalar(3.62))
    }
    // in the explanation they beat harder and in a wave (metachronal): the phase follows the position around the cell
    let cph = 0, lastT = 0
    ticks.push(t => {
      const dt = Math.min(0.1, Math.max(0, t - lastT)); lastT = t
      cph += dt * (2.4 + spots.amp.wave * 3.2)
      const amp = 0.12 * spots.amp.cilia
      cilia.forEach(c => { const s = Math.sin(cph + c.userData.ph * (1 + spots.amp.wave)) * amp; c.children.forEach(ch => { ch.rotation.z = s; ch.rotation.x = s * 0.5 }) })
    })
  }

  /* ───── ribosomi ───── */
  as('ribosomi')
  const free: THREE.Vector3[] = []
  const inCell = (v: THREE.Vector3) => kind === 'animal' ? v.length() < 2.85 : Math.abs(v.x) < 2.9 && Math.abs(v.y) < 1.9 && Math.abs(v.z) < 1.9
  const avoid = (v: THREE.Vector3) => v.distanceTo(nPos) < nR + 0.95 || (kind === 'plant' && ((v.x + 0.35) / 1.85) ** 2 + (v.y / 1.35) ** 2 + ((v.z + 0.25) / 1.4) ** 2 < 1)
  for (let k = 0; free.length < (kind === 'animal' ? 150 : 110) && k < 6000; k++) {
    const v = new THREE.Vector3((R() - 0.5) * 6.4, (R() - 0.5) * 6.4, (R() - 0.5) * 6.4)
    if (inCell(v) && !avoid(v)) free.push(v)
  }
  const rG = geo(new THREE.SphereGeometry(0.026, 8, 6))
  const ribo = new THREE.InstancedMesh(rG, toon(P.ribo, {}, 'wedge'), free.length)
  free.forEach((p, i) => { tmp.position.copy(p); tmp.rotation.set(0, 0, 0); tmp.scale.setScalar(1.25); tmp.updateMatrix(); ribo.setMatrixAt(i, tmp.matrix) })
  add('ribosomi', ribo, kind === 'animal' ? new THREE.Vector3(-1.25, 2.05, 1.35) : new THREE.Vector3(-1.6, -1.55, 1.6))
  // ribosomes on the rough ER: cut together with the ER
  const riboER = new THREE.InstancedMesh(rG, toon(P.ribo, {}, 'wedge'), erPts.length)
  erPts.forEach((p, i) => { tmp.position.copy(p); tmp.rotation.set(0, 0, 0); tmp.scale.setScalar(0.85); tmp.updateMatrix(); riboER.setMatrixAt(i, tmp.matrix) })
  add('ribosomi', riboER)

  /* ───── cytoskeleton ───── */
  as('citoskelet')
  const cs = new THREE.Group()
  const csM = toon(m2(P.cito, '#ffffff', 0.35))
  const hub = kind === 'animal' ? new THREE.Vector3(-0.85, -1.3, 1.05) : new THREE.Vector3(1.6, 0.9, -1.3)
  for (let k = 0; k < (kind === 'animal' ? 16 : 10); k++) {
    const d = new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize()
    const pts: THREE.Vector3[] = [hub.clone()]
    let p = hub.clone()
    for (let j = 0; j < 6; j++) { p = p.clone().add(d.clone().multiplyScalar(0.42)).add(new THREE.Vector3((R() - 0.5) * 0.12, (R() - 0.5) * 0.12, (R() - 0.5) * 0.12)); if (!inCell(p) || p.distanceTo(nPos) < sheets[sheets.length - 1].rho + 0.12) break; pts.push(p) }
    if (pts.length < 3) continue
    cs.add(new THREE.Mesh(geo(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.012, 5, false)), csM))
  }
  add('citoskelet', cs, kind === 'animal' ? new THREE.Vector3(-2.35, 0.3, -0.4) : new THREE.Vector3(2.0, 1.45, -1.6))

  return { root, orgs, anchors, mats, geos, cutMats, halves, cands, dyn, spots, tick: t => ticks.forEach(f => f(t)) }
}

interface Api {
  setFocus: (f: PartId | null) => void
  setCut: (c: boolean) => void
  setSpin: (s: boolean) => void
  setLabels: (l: boolean) => void
  setProc: (id: ProcId | null) => void
  setStep: (k: number) => void
  setAuto: (a: boolean) => void
  setPad: (px: number, pr: number) => void
}

export default function Cell3D({ kind, focus, onPick, labels, cut, spin, proc = null, onStepDone, padBottom = 0, padRight = 0 }: Cell3DProps) {
  const host = useRef<HTMLDivElement>(null)
  const labelHost = useRef<HTMLDivElement>(null)
  const api = useRef<Api | null>(null)
  const pickRef = useRef(onPick)
  pickRef.current = onPick
  const doneRef = useRef(onStepDone)
  doneRef.current = onStepDone
  const init = useRef({ proc, padBottom, padRight })
  init.current = { proc, padBottom, padRight }

  useEffect(() => {
    const el = host.current!
    const lh = labelHost.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.localClippingEnabled = true
    el.appendChild(renderer.domElement)
    renderer.domElement.style.touchAction = 'none'

    const scene = new THREE.Scene()
    scene.add(new THREE.AmbientLight(0xffffff, 1.15))
    const key = new THREE.DirectionalLight(0xffffff, 2.1)
    scene.add(key)

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200)
    if (kind === 'prok') camera.position.set(1.7, 3.1, 8.8)
    else camera.position.set(5.6, 3.4, 8.6)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.rotateSpeed = 0.75
    controls.autoRotateSpeed = 0.6
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    controls.autoRotate = !reduce

    const wedge = [new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)]
    const built = build(kind, wedge)
    scene.add(built.root)
    const lightDir = new THREE.Vector3(0.35, 0.8, 0.5)

    const labelEls = new Map<PartId, HTMLDivElement>()
    built.anchors.forEach((_, id) => {
      const d = document.createElement('div')
      d.className = 'l3d'
      d.textContent = partName(id)
      d.onclick = () => pickRef.current(id)
      lh.appendChild(d)
      labelEls.set(id, d)
    })

    let frame = 0
    const chosen = new Map<PartId, THREE.Vector3 | null>()
    const sizes = new Map<PartId, { w: number; h: number }>()
    const camDir = new THREE.Vector3()
    let focusId: PartId | null = null
    let showLabels = labels
    let cutOn = cut
    // highlighted parts: in a process explanation the parts of the current step, otherwise the selected organelle
    let procHi: PartId[] | null = null
    let procLab: Partial<Record<PartId, () => THREE.Vector3>> | null = null
    let procTarget: THREE.Vector3 | null = null
    const hiList = () => procHi ?? (focusId ? [focusId] : null)
    const isHi = (id: PartId) => !!hiList()?.includes(id)
    const applyFocus = () => {
      const hi = hiList()
      built.mats.forEach((ms, id) => ms.forEach(m => {
        const b = m.userData.base as { o: number; t: boolean; d: boolean }
        // the cytoplasm is the background of the cut (inner wall of the cell): it is never dimmed, otherwise the dark membrane outline would show
        const dim = !!hi && !hi.includes(id) && id !== 'citoplazma'
        m.transparent = dim ? true : b.t
        m.opacity = dim ? (id === 'membrana' || id === 'stena' ? 0.07 : 0.14) : b.o
        m.depthWrite = dim ? false : b.d
        m.needsUpdate = true
      }))
      labelEls.forEach((d, id) => { d.classList.toggle('on', isHi(id)); d.style.display = (procHi ? isHi(id) : showLabels || isHi(id)) ? '' : 'none' })
      frame = 0; sizes.clear()
    }
    const setCut = (c: boolean) => {
      cutOn = c
      frame = 0
      built.cutMats.forEach(m => { m.clippingPlanes = c ? wedge : []; m.needsUpdate = true })
    }
    setCut(cut)
    applyFocus()

    /* ───── animated explanation of a process ───── */
    let P: Proc | null = null
    let pid: ProcId | null = null
    let pStep = 0, pT = 0, pA = 0, pDone = false, pAuto = true
    let pad = init.current.padBottom, padR = init.current.padRight
    // camera move: the focus point and position blend smoothly (even if the user rotates in between)
    let tw: { t: number; fT: THREE.Vector3; fP: THREE.Vector3; tT: THREE.Vector3; tP: THREE.Vector3 } | null = null
    const homeDist = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1
      const vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * (w / h))
      const radius = (kind === 'animal' ? 3.75 : kind === 'prok' ? 2.5 : 4.4) * (el.closest('.explore-full') ? (w > h ? 1.4 : 1.12) : 1)
      return radius / Math.sin(Math.min(vf, hf) / 2)
    }
    const fitDist = (r: number) => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1
      const hEff = Math.max(120, h - pad), wEff = Math.max(160, w - padR)
      const vf = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * (hEff / h))
      const hf = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * (wEff / h))
      return r / Math.sin(Math.min(vf, hf) / 2)
    }
    const applyPad = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1
      if (P && (pad > 0 || padR > 0)) camera.setViewOffset(w, h, padR / 2, pad / 2, w, h)
      else camera.clearViewOffset()
      camera.updateProjectionMatrix()
    }
    const flyTo = (tT: THREE.Vector3, tP: THREE.Vector3) => {
      tw = { t: 0, fT: controls.target.clone(), fP: camera.position.clone(), tT: tT.clone(), tP: tP.clone() }
      controls.enabled = false
    }
    const autoDir = (p: THREE.Vector3) => {
      // the camera is offset a little from the point's direction: the point lies right by the cut surface and is visible in the cut
      if (Math.hypot(p.x, p.z) < 0.45) return new THREE.Vector3(0.55, 0.42, 0.72).normalize()
      const az = Math.atan2(p.x, p.z) + 0.82
      return new THREE.Vector3(Math.sin(az) * 0.9, 0.44, Math.cos(az) * 0.9).normalize()
    }
    const goStep = (k: number) => {
      if (!P) return
      pStep = Math.max(0, Math.min(P.steps.length - 1, k)); pT = 0; pA = 0; pDone = false
      const st = P.steps[pStep]
      procHi = st.hi
      procLab = st.lab ?? null
      procTarget = st.target
      applyFocus()
      flyTo(st.target, st.target.clone().add((st.dir ?? autoDir(st.target)).clone().multiplyScalar(fitDist(st.r))))
      controls.minDistance = 0.6
      controls.maxDistance = homeDist() * 1.6
    }
    const setProc = (id: ProcId | null) => {
      if (id === pid) return
      if (P) { P.dispose(); P = null }
      pid = id
      if (id && kind !== 'prok') {
        P = buildProcess(id, built.spots, scene, window.matchMedia('(prefers-color-scheme: dark)').matches)
        controls.autoRotate = false
        setCut(true)
        applyPad()
        goStep(init.current.proc?.step ?? 0)
      } else {
        procHi = null; procLab = null; procTarget = null
        applyFocus()
        applyPad()
        const d = camera.position.clone().sub(controls.target).normalize()
        flyTo(new THREE.Vector3(), d.multiplyScalar(homeDist()))
        controls.minDistance = homeDist() * 0.35
      }
    }

    api.current = {
      setFocus: f => { focusId = f; applyFocus(); if (f) controls.autoRotate = false },
      setCut,
      setSpin: s => { controls.autoRotate = s && !reduce && !P },
      setLabels: l => { showLabels = l; applyFocus() },
      setProc,
      setStep: goStep,
      setAuto: a => { pAuto = a },
      setPad: (px, pr) => { pad = px; padR = pr; applyPad() },
    }

    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let down: { x: number; y: number } | null = null
    const pickables: THREE.Object3D[] = []
    built.orgs.forEach((objs, id) => { if (id !== 'citoplazma') objs.forEach(o => pickables.push(o)) })
    // tiny parts (ribosomes, fibres, cilia) do not cover the labels
    const occluders = pickables.filter(o => !['ribosomi', 'citoskelet', 'migetalke'].includes(o.userData.org))
    const clipOk = (h: THREE.Intersection) => {
      const mat = (h.object as THREE.Mesh).material as THREE.Material
      const planes = mat?.clippingPlanes
      if (!planes || !planes.length) return true
      if (planes === wedge) return !(cutOn && wedge.every(p => p.distanceToPoint(h.point) < 0))
      return planes.every(p => p.distanceToPoint(h.point) >= 0)
    }
    const oray = new THREE.Raycaster()
    const odir = new THREE.Vector3()
    const hidden = (id: PartId, p: THREE.Vector3) => {
      odir.copy(p).sub(camera.position)
      const dist = odir.length()
      oray.set(camera.position, odir.normalize())
      oray.far = dist - 0.06
      return oray.intersectObjects(occluders, true).some(h => h.object.userData.org !== id && clipOk(h))
    }
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; controls.autoRotate = false }
    const onUp = (e: PointerEvent) => {
      if (!down) return
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y)
      down = null
      if (moved > 7) return
      const r = renderer.domElement.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hits = ray.intersectObjects(pickables, true).filter(clipOk)
      const pri = (id: PartId) => (id === 'membrana' || id === 'stena' ? 2 : 0)
      hits.sort((a, b) => pri(a.object.userData.org) - pri(b.object.userData.org) || a.distance - b.distance)
      pickRef.current((hits[0]?.object.userData.org as PartId | undefined) ?? null)
    }
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = w + 'px'
      renderer.domElement.style.height = h + 'px'
      camera.aspect = w / h
      const dist = homeDist()
      controls.maxDistance = dist * 1.6
      if (P) { applyPad(); goStep(pStep); return }
      camera.position.setLength(dist)
      controls.minDistance = dist * 0.35
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    let visible = true
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting })
    io.observe(el)

    const t0 = performance.now()
    let tPrev = 0
    const u1 = new THREE.Vector3(), u2 = new THREE.Vector3(), tc = new THREE.Vector3()
    const v = new THREE.Vector3()
    const q = new THREE.Vector3()
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden) return
      const t = (performance.now() - t0) / 1000
      const dt = Math.min(0.1, t - tPrev); tPrev = t
      if (tw) {
        tw.t = Math.min(1, tw.t + dt / (reduce ? 0.01 : 1.15))
        const e = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2
        controls.target.lerpVectors(tw.fT, tw.tT, e)
        // position along an arc around the focus point (not through the cell)
        const a = tw.fP.clone().sub(tw.fT), b = tw.tP.clone().sub(tw.tT)
        const la = a.length(), lb = b.length()
        const dir = a.normalize().lerp(b.normalize(), e).normalize()
        camera.position.copy(controls.target).add(dir.multiplyScalar(la + (lb - la) * e))
        if (tw.t >= 1) { tw = null; controls.enabled = true }
      }
      if (P) {
        // the animation always runs; the clock for the automatic next step only when playback is not paused
        pT += dt
        if (pAuto) pA += dt
        P.update(pStep, pT)
        if (!pDone && pA >= P.steps[pStep].dur) { pDone = true; doneRef.current?.() }
      }
      controls.update()
      q.copy(lightDir).applyQuaternion(camera.quaternion)
      key.position.copy(q).multiplyScalar(10)
      // the cut away quarter always faces the viewer
      const az = Math.atan2(camera.position.x, camera.position.z)
      if (built.cutN) {
        // bacterium: the cut is always along the long axis, front half removed (even when viewed from the end)
        built.cutN.set(0, camera.position.y, camera.position.z).normalize()
        wedge[0].normal.copy(built.cutN).negate(); wedge[1].normal.copy(built.cutN).negate()
      } else {
        u1.set(Math.sin(az + Math.PI / 4), 0, Math.cos(az + Math.PI / 4))
        u2.set(Math.sin(az - Math.PI / 4), 0, Math.cos(az - Math.PI / 4))
        wedge[0].normal.copy(u1).negate(); wedge[1].normal.copy(u2).negate()
      }
      built.halves.forEach(hf => {
        tc.copy(camera.position).sub(hf.pos)
        tc.sub(hf.axis.clone().multiplyScalar(tc.dot(hf.axis))).normalize().negate()
        hf.plane.setFromNormalAndCoplanarPoint(tc, hf.pos)
      })
      built.tick(t)
      renderer.render(scene, camera)
      if (showLabels || focusId || procHi) {
        const w = el.clientWidth, h = el.clientHeight
        // every few frames: for each organelle pick a visible point (not hidden by another organelle)
        if (frame++ % 6 === 0) {
          const phiC = Math.atan2(camera.position.z, camera.position.x)
          camDir.copy(camera.position).normalize()
          labelEls.forEach((d, id) => {
            if (d.style.display === 'none') { chosen.set(id, null); return }
            const list = built.dyn.has(id) ? [built.dyn.get(id)!(phiC)] : [...(built.cands.get(id) ?? [])].filter(p => !(cutOn && wedge.every(w => w.distanceToPoint(p) < 0))).sort((a, b) => b.dot(camDir) - a.dot(camDir)).slice(0, 4)
            if (id === focusId && !procHi) { chosen.set(id, list[0] ?? null); return }
            if (procHi && isHi(id)) {
              // in an explanation: the label on the part closest to the action
              const tg = procTarget
              const near = built.dyn.has(id) || !tg ? list : [...(built.cands.get(id) ?? [])].filter(p => !(cutOn && wedge.every(w => w.distanceToPoint(p) < 0))).sort((a, b) => a.distanceTo(tg) - b.distanceTo(tg)).slice(0, 4)
              chosen.set(id, near.find(p => !hidden(id, p)) ?? near[0] ?? null); return
            }
            chosen.set(id, list.find(p => !(cutOn && wedge.every(w => w.distanceToPoint(p) < 0)) && !hidden(id, p)) ?? null)
          })
        }
        // layout without overlap: from the bottom up, a label rises above its point if needed
        const items: { id: PartId; d: HTMLDivElement; x: number; y: number; bw: number; bh: number }[] = []
        labelEls.forEach((d, id) => {
          const p = procLab?.[id]?.() ?? chosen.get(id)
          if (d.style.display === 'none') return
          if (!p) { d.style.visibility = 'hidden'; return }
          v.copy(p).project(camera)
          if (v.z >= 1) { d.style.visibility = 'hidden'; return }
          let sz = sizes.get(id)
          if (!sz || !sz.w) { sz = { w: d.offsetWidth, h: d.offsetHeight }; sizes.set(id, sz) }
          items.push({ id, d, x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, bw: sz.w, bh: sz.h })
        })
        // more important organelles get space first; on a small screen less important labels are hidden
        items.sort((a, b) => (isHi(a.id) === isHi(b.id) ? PRIO.indexOf(a.id) - PRIO.indexOf(b.id) : isHi(a.id) ? -1 : 1))
        const placed: [number, number, number, number][] = []
        // floating controls (tools, title, choice) are a no go zone for labels
        const box = el.getBoundingClientRect()
        el.parentElement?.querySelectorAll('.c3d-ctl, .ex-top > *, .tabbar, .proc-card').forEach(c => { const a = c.getBoundingClientRect(); if (a.width) placed.push([a.left - box.left - 4, a.top - box.top - 4, a.right - box.left + 4, a.bottom - box.top + 4]) })
        // there is no room for labels above the title (a label would merge with the screen edge)
        const ttl = el.parentElement?.querySelector('.ex-top')?.getBoundingClientRect()
        if (ttl) placed.push([0, -100, w, ttl.top - box.top + 4])
        const tb = document.querySelector('.tabbar')
        if (tb) { const a = tb.getBoundingClientRect(); placed.push([a.left - box.left - 4, a.top - box.top - 4, a.right - box.left + 4, a.bottom - box.top + 4]) }
        for (const it of items) {
          let best: { x0: number; y0: number; dir: number; lift: number } | null = null
          for (const [dir, k] of OPTS) {
            const lift = k * (it.bh + 4)
            const x0 = Math.min(Math.max(it.x - it.bw / 2, 4), w - it.bw - 4)
            const y0 = dir < 0 ? it.y - 9 - lift - it.bh : it.y + 9 + lift
            if (y0 < 2 || y0 + it.bh > h - 2) continue
            if (placed.some(r => x0 - 3 < r[2] && x0 + it.bw + 3 > r[0] && y0 - 3 < r[3] && y0 + it.bh + 3 > r[1])) continue
            best = { x0, y0, dir, lift }
            break
          }
          if (!best && isHi(it.id)) best = { x0: Math.min(Math.max(it.x - it.bw / 2, 4), w - it.bw - 4), y0: it.y - 9 - it.bh, dir: -1, lift: 0 }
          if (!best) { it.d.style.visibility = 'hidden'; continue }
          placed.push([best.x0, best.y0, best.x0 + it.bw, best.y0 + it.bh])
          // point on the organelle: a small circle below or above the label
          placed.push([it.x - 5, it.y - 5, it.x + 5, it.y + 5])
          it.d.style.visibility = ''
          it.d.classList.toggle('down', best.dir > 0)
          it.d.style.setProperty('--lift', best.lift + 'px')
          it.d.style.setProperty('--dx', (it.x - best.x0 - it.bw / 2).toFixed(1) + 'px')
          it.d.style.transform = `translate(${best.x0}px, ${best.y0}px)`
        }
      }
    }
    loop()

    if (init.current.proc) setProc(init.current.proc.id)

    return () => {
      cancelAnimationFrame(raf)
      if (P) P.dispose()
      ro.disconnect(); io.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      controls.dispose()
      built.geos.forEach(g => g.dispose())
      built.mats.forEach(ms => ms.forEach(m => m.dispose()))
      renderer.dispose()
      renderer.domElement.remove()
      lh.innerHTML = ''
      api.current = null
    }
  }, [kind])

  useEffect(() => { api.current?.setFocus(focus) }, [focus, kind])
  useEffect(() => { api.current?.setCut(cut) }, [cut, kind])
  useEffect(() => { api.current?.setSpin(spin) }, [spin, kind])
  useEffect(() => { api.current?.setLabels(labels) }, [labels, kind])
  useEffect(() => { api.current?.setProc(proc?.id ?? null) }, [proc?.id, kind])
  useEffect(() => { if (proc) api.current?.setStep(proc.step) }, [proc?.step, proc?.n, kind])
  useEffect(() => { api.current?.setAuto(proc?.auto ?? true) }, [proc?.auto, kind])
  useEffect(() => { api.current?.setPad(padBottom, padRight) }, [padBottom, padRight, kind])

  return (
    <div className="c3d" ref={host}>
      <div className="l3d-host" ref={labelHost} />
    </div>
  )
}
