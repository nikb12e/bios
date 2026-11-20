// Organelles and parts of the cell. The texts come from the cell notes (pages 3 to 13).
// "watch" lists common mix ups (typical weak spots from class).

export type OrgId =
  | 'membrana' | 'citoplazma' | 'jedro' | 'jedrce' | 'zrnatiER' | 'gladkiER' | 'ribosomi'
  | 'golgi' | 'mitohondrij' | 'kloroplast' | 'vakuola' | 'lizosom' | 'centrioli'
  | 'citoskelet' | 'migetalke' | 'stena' | 'skrobna'

export type Presence = { zival: boolean | 'nekatere'; rastl: boolean | 'nekatere'; prok: boolean }

export interface Organelle {
  id: OrgId
  name: string
  aliases: string[]
  short: string // one line
  mesto?: string
  zgradba?: string
  vloga: string
  pazi?: string
  presence: Presence
  page: number // page in the notes
  detail?: DetailId
  concepts: string[]
}

export type DetailId =
  | 'mitohondrij' | 'kloroplast' | 'jedro' | 'er' | 'golgi' | 'membrana' | 'citoskelet'
  | 'ribosom' | 'prokariont' | 'svetlobni' | 'tem' | 'migetalke' | 'stena' | 'lizosom' | 'vakuola' | 'centrioli'

export const ORGANELLES: Organelle[] = [
  {
    id: 'membrana', name: 'Cell membrane', aliases: ['plasmalemma', 'membrane', 'cell membrane', 'biological membrane'],
    short: 'Surrounds the cell and controls the passage of substances.',
    mesto: 'Surrounds the cell.',
    zgradba: 'Fluid mosaic model: a phospholipid bilayer, the hydrophobic tails face the inside of the bilayer; proteins more or less float in the fluid lipid bilayer.',
    vloga: 'Gives the cell shape and protection, controls the passage of substances into and out of the cell (semipermeable).',
    pazi: 'The cell membrane surrounds the whole cell. The nuclear envelope (two membranes) surrounds only the nucleus. Do not mix them up.',
    presence: { zival: true, rastl: true, prok: true }, page: 11, detail: 'membrana',
    concepts: ['membrana.vloga', 'mozaik.zgradba', 'mozaik.proteini'],
  },
  {
    id: 'citoplazma', name: 'Cytoplasm', aliases: ['cytosol'],
    short: 'Cytosol together with the cell organelles.',
    zgradba: 'Cytoplasm = cytosol + cell organelles. Cytosol is the fluid part of the cytoplasm, mostly water and the substances dissolved in it (proteins, fats, salts ...).',
    vloga: 'The space that holds the organelles; cytosol is its fluid part.',
    pazi: 'Cytosol is not the same as cytoplasm. Cytosol is only the fluid part, cytoplasm is cytosol and organelles together. Do not write "organelles float", write "the cytoplasm is made of cytosol and organelles".',
    presence: { zival: true, rastl: true, prok: true }, page: 3,
    concepts: ['citoplazma.def', 'citosol.def'],
  },
  {
    id: 'jedro', name: 'Nucleus', aliases: ['nucleus'],
    short: 'Holds most of the DNA with the code for proteins.',
    mesto: 'A separate organelle, its position changes.',
    zgradba: 'Surrounded by a nuclear envelope of two membranes with ribosomes attached to its surface. Pores in the nuclear envelope connect the inside of the nucleus with the cytoplasm.',
    vloga: 'Most of the DNA is in the nucleus. DNA is bound to nuclear proteins called histones, and together they form a threadlike tangle, chromatin. During division, chromatin coils further and forms chromosomes. DNA carries the genetic code for proteins, which the properties of the cell and the living thing depend on.',
    pazi: 'The nuclear envelope (two membranes with pores) is not the cell membrane.',
    presence: { zival: true, rastl: true, prok: false }, page: 8, detail: 'jedro',
    concepts: ['jedro.ovoj', 'jedro.mesto', 'jedro.kromatin', 'jedro.zapis'],
  },
  {
    id: 'jedrce', name: 'Nucleolus', aliases: ['nucleolus'],
    short: 'Ribosome subunits are made here.',
    mesto: 'Inside the nucleus.',
    vloga: 'The area inside the nucleus where large and small ribosome subunits are made.',
    pazi: 'The nucleolus has no membrane and is not a "smaller nucleus". It is an area in the nucleus.',
    presence: { zival: true, rastl: true, prok: false }, page: 8, detail: 'jedro',
    concepts: ['jedrce'],
  },
  {
    id: 'zrnatiER', name: 'Rough ER', aliases: ['rough endoplasmic reticulum', 'rough er', 'granular er'],
    short: 'ER with ribosomes on its surface.',
    mesto: 'A network of membrane spaces in the cytoplasm, with ribosomes on the surface.',
    zgradba: 'A network of differently shaped spaces surrounded by membranes: tubes or flattened sacs (cisternae). Ribosomes sit on the surface.',
    vloga: 'Making proteins the cell secretes; synthesising membranes (for renewal).',
    pazi: 'It is rough because of the ribosomes on its surface. The smooth ER has no ribosomes and different roles.',
    presence: { zival: true, rastl: true, prok: false }, page: 5, detail: 'er',
    concepts: ['er.zgradba', 'er.zrnati'],
  },
  {
    id: 'gladkiER', name: 'Smooth ER', aliases: ['smooth endoplasmic reticulum', 'smooth er'],
    short: 'ER without ribosomes: lipids, toxins, calcium.',
    mesto: 'A network of membrane tubes in the cytoplasm, without ribosomes.',
    vloga: 'Synthesis of lipids and steroids; breakdown of toxic substances (for example alcohol); storage of calcium ions (important for signal transmission and muscle contraction).',
    pazi: 'Proteins for secretion are made on the rough ER, not on the smooth ER.',
    presence: { zival: true, rastl: true, prok: false }, page: 5, detail: 'er',
    concepts: ['er.zgradba', 'er.gladki'],
  },
  {
    id: 'ribosomi', name: 'Ribosomes', aliases: ['ribosome'],
    short: 'Protein synthesis.',
    mesto: 'Free in the cytoplasm or attached to the ER.',
    zgradba: 'Made of ribonucleic acid (RNA) and proteins. Two subunits: a large and a small one.',
    vloga: 'Protein synthesis.',
    pazi: 'The notes list them among organelles, but ribosomes have no membrane. They are smaller in prokaryotes and larger in eukaryotes.',
    presence: { zival: true, rastl: true, prok: true }, page: 6, detail: 'ribosom',
    concepts: ['ribosomi.zgradba', 'ribosomi.mesto', 'ribosomi.vloga'],
  },
  {
    id: 'golgi', name: 'Golgi apparatus', aliases: ['ga', 'golgi', 'golgi apparatus', 'golgi body'],
    short: 'Prepares products for secretion and membranes.',
    zgradba: 'The membranes form flattened cisternae stacked on top of each other.',
    vloga: 'Preparing products the cell secretes and preparing membranes to renew the cell membrane. Vesicles carrying these substances bud off the edges of the outer cisternae.',
    pazi: 'Do not just write "sorts" or "packages". Correct: it prepares products the cell secretes and membranes to renew the cell membrane; vesicles carry the substances away.',
    presence: { zival: true, rastl: true, prok: false }, page: 6, detail: 'golgi',
    concepts: ['golgi.zgradba', 'golgi.vloga'],
  },
  {
    id: 'mitohondrij', name: 'Mitochondrion', aliases: ['mitochondria'],
    short: 'Cellular respiration, ATP production.',
    mesto: 'In the cytoplasm as separate organelles.',
    zgradba: 'An outer membrane, a folded inner membrane and the matrix; the matrix contains circular DNA molecules and ribosomes.',
    vloga: 'Cellular respiration (ATP production, energy).',
    pazi: 'It has two membranes and its own circular DNA. The inner membrane is folded.',
    presence: { zival: true, rastl: true, prok: false }, page: 9, detail: 'mitohondrij',
    concepts: ['mito.zgradba', 'mito.vloga'],
  },
  {
    id: 'kloroplast', name: 'Chloroplast', aliases: ['chloroplasts', 'plastid', 'plastids'],
    short: 'A plastid in which photosynthesis takes place.',
    mesto: 'In the cytoplasm of plant cells.',
    zgradba: 'It is surrounded by two membranes (outer and inner). Inside is the stroma (matrix), into which the thylakoid membrane folds (it comes from the inner membrane) and forms flattened sacs, the thylakoids. Thylakoids stacked on top of each other form grana. The thylakoid membrane holds pigments, especially chlorophyll. It has chloroplast DNA and ribosomes.',
    vloga: 'Photosynthesis. It is the most important type of plastid; plastids are typical of plant cells and are similar in structure to mitochondria.',
    pazi: 'A granum is a stack of thylakoids, not a single thylakoid. Chlorophyll is in the thylakoid membrane, not in the stroma.',
    presence: { zival: false, rastl: true, prok: false }, page: 9, detail: 'kloroplast',
    concepts: ['plastidi.def', 'kloro.zgradba', 'kloro.pigment'],
  },
  {
    id: 'vakuola', name: 'Vacuole', aliases: ['vacuole', 'vacuoles'],
    short: 'Stores water and substances; supports the plant.',
    mesto: 'In the cytoplasm.',
    vloga: 'A plant cell usually has one large vacuole: it stores some substances made in the cell (for example pigments) and water, and supports the cell. An animal cell has several smaller vacuoles (vesicles) that store water, waste and water soluble pigments.',
    pazi: 'In some plant cells the vacuole takes over the role of lysosomes.',
    presence: { zival: 'nekatere', rastl: true, prok: false }, page: 7, detail: 'vakuola',
    concepts: ['vakuola.rastl', 'vakuola.zival'],
  },
  {
    id: 'lizosom', name: 'Lysosome', aliases: ['lysosomes'],
    short: 'Digestive enzymes, cellular digestion.',
    mesto: 'Free in the cytoplasm.',
    zgradba: 'An organelle that contains digestive enzymes.',
    vloga: 'Breaks down substances; takes part in cellular digestion. In some plant cells the vacuole takes over its role.',
    presence: { zival: true, rastl: 'nekatere', prok: false }, page: 7, detail: 'lizosom',
    concepts: ['lizosom'],
  },
  {
    id: 'centrioli', name: 'Centrioles', aliases: ['centriole'],
    short: 'Take part in cell division.',
    mesto: 'In the cytoplasm, near the nucleus.',
    vloga: 'Involved in cell division. Found in animal cells and only in some cells of lower plants.',
    presence: { zival: true, rastl: 'nekatere', prok: false }, page: 10, detail: 'centrioli',
    concepts: ['centrioli'],
  },
  {
    id: 'citoskelet', name: 'Cytoskeleton', aliases: ['cytoskeleton', 'cell skeleton', 'skeleton'],
    short: 'Protein filaments and tubes for shape and movement.',
    mesto: 'In the cytoplasm.',
    zgradba: 'A network of proteins that form filaments or tubes: microfilaments, intermediate filaments, microtubules.',
    vloga: 'Keeps the shape of the cell, supports organelles and sets their position, lets the cell move and change its shape.',
    presence: { zival: true, rastl: true, prok: false }, page: 10, detail: 'citoskelet',
    concepts: ['citoskelet.zgradba', 'citoskelet.vloga'],
  },
  {
    id: 'migetalke', name: 'Cilia and flagella', aliases: ['cilia', 'flagella', 'flagellum', 'flagellum', 'cilium'],
    short: 'Made of microtubules, they move the cell.',
    mesto: 'Anchored in the cell membrane and stick out into the surroundings.',
    zgradba: 'Made of microtubules.',
    vloga: 'Moving the cell. Found in animal cells and only in some plant cells (some single celled algae).',
    presence: { zival: 'nekatere', rastl: 'nekatere', prok: false }, page: 11, detail: 'migetalke',
    concepts: ['migetalke'],
  },
  {
    id: 'stena', name: 'Cell wall', aliases: ['wall', 'cellulose wall'],
    short: 'Cellulose support outside the membrane.',
    mesto: 'Surrounds the cell on the outside of the cell membrane.',
    zgradba: 'In a plant cell, made of several layers of the polysaccharide cellulose.',
    vloga: 'It is secreted by the cell and in its mature state it is a nonliving part of the cell. It gives the cell strength and protects it against changes in turgor. Animal cells do not have one.',
    pazi: 'The wall is outside the cell membrane, and the membrane is still there.',
    presence: { zival: false, rastl: true, prok: true }, page: 12, detail: 'stena',
    concepts: ['stena'],
  },
  {
    id: 'skrobna', name: 'Starch grains', aliases: ['starch grains', 'starch grain', 'amyloplast'],
    short: 'Plastids for storing starch.',
    vloga: 'Specialised plastids for storing starch.',
    presence: { zival: false, rastl: true, prok: false }, page: 10,
    concepts: ['skrobna'],
  },
]

export const ORG: Record<OrgId, Organelle> = Object.fromEntries(ORGANELLES.map(o => [o.id, o])) as Record<OrgId, Organelle>

// Which organelles are drawn on which cell (interactive pictures).
export const ON_ANIMAL: OrgId[] = ['membrana', 'citoplazma', 'jedro', 'jedrce', 'zrnatiER', 'gladkiER', 'ribosomi', 'golgi', 'mitohondrij', 'vakuola', 'lizosom', 'centrioli', 'citoskelet', 'migetalke']
export const ON_PLANT: OrgId[] = ['stena', 'membrana', 'citoplazma', 'jedro', 'jedrce', 'zrnatiER', 'gladkiER', 'ribosomi', 'golgi', 'mitohondrij', 'kloroplast', 'vakuola', 'skrobna', 'citoskelet']
