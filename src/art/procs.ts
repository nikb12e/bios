/* List of animated explanations (without three.js, so the list is available everywhere without loading 3D). */

import type { ShapeKind } from '../ui/flux'
import type { OrgId } from '../data/organelles'

type Tone = 't-coral' | 't-amber' | 't-green' | 't-pink' | 't-sky' | 't-violet'

export type ProcId = 'protein' | 'dihanje' | 'fotosinteza' | 'prebava' | 'turgor' | 'migetalke'

export interface ProcMeta { id: ProcId; name: string; sub: string; kind: 'animal' | 'plant'; tone: Tone; shape: ShapeKind; color: string; org: OrgId }
export const PROCS: ProcMeta[] = [
  { id: 'protein', name: 'Protein pathway', sub: 'From DNA in the nucleus to secretion from the cell', kind: 'animal', tone: 't-coral', shape: 'flower', color: 'var(--coral)', org: 'golgi' },
  { id: 'dihanje', name: 'Cellular respiration', sub: 'Mitochondrion and ATP production', kind: 'animal', tone: 't-amber', shape: 'sunny', color: 'var(--amber)', org: 'mitohondrij' },
  { id: 'fotosinteza', name: 'Photosynthesis', sub: 'Chloroplast, light and starch', kind: 'plant', tone: 't-green', shape: 'clover', color: 'var(--green)', org: 'kloroplast' },
  { id: 'prebava', name: 'Cellular digestion', sub: 'A lysosome breaks down a substance', kind: 'animal', tone: 't-pink', shape: 'blob', color: 'var(--pink)', org: 'lizosom' },
  { id: 'turgor', name: 'Vacuole and turgor', sub: 'Water, support and wilting of the plant', kind: 'plant', tone: 't-sky', shape: 'cookie', color: 'var(--sky)', org: 'vakuola' },
  { id: 'migetalke', name: 'Cilia', sub: 'Coordinated beating and movement', kind: 'animal', tone: 't-violet', shape: 'gem', color: 'var(--violet)', org: 'migetalke' },
]

/** text of the steps; d = content goes beyond the notes (shows the “Extra explanation” label) */
export interface StepText { title: string; text: string; d?: boolean }
export const PROC_TEXT: Record<ProcId, StepText[]> = {
  protein: [
    { title: 'The code in the nucleus', text: 'DNA in the nucleus carries the genetic code for the protein. A copy of the code leaves through the pores of the nuclear envelope and reaches the ribosomes.', d: true },
    { title: 'Ribosomes on the rough ER', text: 'Ribosomes on the rough ER synthesise the protein the cell will secrete. The chain enters the inside of the ER.', d: true },
    { title: 'Vesicle to the Golgi', text: 'The protein travels in a vesicle to the Golgi apparatus.' },
    { title: 'Golgi apparatus', text: 'The Golgi apparatus prepares the product the cell secretes. The substance moves through cisternae stacked on top of each other.' },
    { title: 'A vesicle buds off', text: 'A vesicle carrying the substance buds off the edges of the outer cisternae and travels to the cell membrane.' },
    { title: 'Secretion', text: 'The vesicle fuses with the cell membrane and the cell secretes the substance. This is also how the Golgi apparatus supplies membrane to renew the cell membrane.' },
  ],
  dihanje: [
    { title: 'Structure', text: 'A mitochondrion has an outer membrane, a folded inner membrane and a matrix with circular DNA molecules and ribosomes.' },
    { title: 'Substances enter', text: 'Cellular respiration takes place in the mitochondrion. Nutrients (for example glucose) and oxygen enter it.', d: true },
    { title: 'ATP production', text: 'Cellular respiration produces ATP, a form of energy the cell can use. Most of it is made along the folded inner membrane.', d: true },
    { title: 'Energy for the cell', text: 'ATP moves through the cell and powers its work. Cells that use a lot of energy (for example muscle cells) have more mitochondria.', d: true },
  ],
  fotosinteza: [
    { title: 'Structure', text: 'A chloroplast is surrounded by an outer and an inner membrane. Inside the stroma are thylakoids, stacked on top of each other into grana.' },
    { title: 'Light', text: 'Photosynthesis takes place in chloroplasts. The green pigment chlorophyll in the thylakoid membrane captures light.' },
    { title: 'Sugar and oxygen', text: 'Carbon dioxide and water are turned into sugar (glucose) with the help of light. Oxygen is released.', d: true },
    { title: 'Storing starch', text: 'The cell stores part of the sugar as starch in starch grains, specialised plastids for storing starch.' },
  ],
  prebava: [
    { title: 'A substance in a vesicle', text: 'The cell surrounds a substance (for example a food particle) with its membrane and brings it inside in a vesicle.', d: true },
    { title: 'Lysosome', text: 'A lysosome contains digestive enzymes and floats freely in the cytoplasm. It travels to the vesicle and fuses with it.', d: true },
    { title: 'Breakdown', text: 'Digestive enzymes break the substance down into smaller parts. This is cellular digestion.' },
    { title: 'Useful parts', text: 'Useful substances pass into the cytoplasm. In some plant cells the vacuole takes over the role of lysosomes.', d: true },
  ],
  turgor: [
    { title: 'Central vacuole', text: 'A plant cell usually has one large vacuole. It stores water and substances made in the cell (for example pigments).' },
    { title: 'Water enters', text: 'Water enters the cell and the vacuole, which fills up and swells.', d: true },
    { title: 'Turgor', text: 'The full vacuole presses against the cell wall and supports the cell. This pressure is turgor, and the firm cellulose wall withstands it.', d: true },
    { title: 'Wilting', text: 'When water runs out, the vacuole shrinks, the cell loses support and the plant wilts. When it gets water again, turgor returns.', d: true },
  ],
  migetalke: [
    { title: 'Structure', text: 'Cilia are made of microtubules, anchored in the cell membrane and stick out into the surroundings.' },
    { title: 'Beating', text: 'Cilia beat in coordination, one after another in a wave, much like oars.', d: true },
    { title: 'Movement', text: 'They let the cell move. Attached cells use them to move fluid past them (for example mucus in the airways).', d: true },
  ],
}

