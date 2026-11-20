// Concepts (units of knowledge). Every concept has its own memory (FSRS).
// text: what the notes say; q: the question for an oral explanation; kp: the key points the AI grades against.

import type { OrgId } from './organelles'

export type TopicId = 'osnove' | 'teorija' | 'organeli' | 'ovoj' | 'primerjava' | 'mikroskop'

export interface Concept {
  id: string
  topic: TopicId
  label: string
  text: string
  q?: string
  kp?: string[]
  org?: OrgId
  page: number | string
}

export const CONCEPTS: Concept[] = [
  // 1. The cell and types of cells
  { id: 'celica.def', topic: 'osnove', page: 1, label: 'What a cell is',
    text: 'The cell is the basic structural and functional unit of living things.',
    q: 'What is a cell?', kp: ['basic structural unit', 'basic functional unit', 'of living things'] },
  { id: 'celica.delitev', topic: 'osnove', page: 1, label: 'Why cells divide',
    text: 'Cell division passes genetic information from the mother cell to the daughter cell.',
    q: 'What does cell division make possible?', kp: ['passing on genetic information', 'from the mother cell to the daughter cell'] },
  { id: 'celica.vrste', topic: 'osnove', page: 1, label: 'Prokaryotic and eukaryotic cells',
    text: 'How a cell works is linked to its inner structure. By structure we distinguish the prokaryotic cells of bacteria and eukaryotic cells with a true nucleus and organelles: fungi, plants, animals.',
    q: 'How do we classify cells by structure, and which living things belong to each group?',
    kp: ['prokaryotic cells (without a true nucleus)', 'bacteria', 'eukaryotic cells have a true nucleus and organelles', 'fungi, plants, animals'] },
  { id: 'pe.velikost', topic: 'osnove', page: 2, label: 'Cell size',
    text: 'Prokaryotic cells mostly measure between 0.5 and 8 µm, eukaryotic cells mostly between 10 and 100 µm.' },
  { id: 'pe.dedni', topic: 'osnove', page: 2, label: 'Genetic material in prokaryotes and eukaryotes',
    text: 'Prokaryotes: one circular DNA that is not bound to proteins. Eukaryotes: many linear DNA molecules bound to special proteins.',
    q: 'Compare the genetic material of a prokaryotic and a eukaryotic cell.',
    kp: ['prokaryotic: one circular DNA', 'prokaryotic DNA is not bound to proteins', 'eukaryotic: many linear DNA molecules', 'eukaryotic DNA is bound to special proteins'] },
  { id: 'pe.jedro', topic: 'osnove', page: 2, label: 'Nucleus and nuclear envelope',
    text: 'A prokaryotic cell has no nucleus and no nuclear envelope, a eukaryotic cell has both.' },
  { id: 'pe.delitev', topic: 'osnove', page: 2, label: 'Division in prokaryotes and eukaryotes',
    text: 'A prokaryotic cell divides without a spindle (fission), a eukaryotic cell divides with a spindle (mitosis, meiosis).',
    q: 'How do prokaryotic and eukaryotic cells divide?',
    kp: ['prokaryotic without a spindle', 'fission', 'eukaryotic with a spindle', 'mitosis and meiosis'] },
  { id: 'pe.organeli', topic: 'osnove', page: 2, label: 'Ribosomes and membrane organelles',
    text: 'Prokaryotes have smaller ribosomes and no ER, Golgi apparatus, mitochondria or plastids. Eukaryotes have larger ribosomes, ER, Golgi apparatus and mitochondria; plants also have plastids (chloroplasts).' },
  { id: 'evk.zgradba', topic: 'osnove', page: 3, label: 'Structure of the eukaryotic cell',
    text: 'The cell is surrounded by a selectively permeable biological membrane that regulates its interaction with the environment. Structures in the cell carry out functions: energy conversion, transport of molecules, breakdown and synthesis of new molecules, removal of waste and storage and expression of genetic information.',
    q: 'Which cell functions do the structures in a eukaryotic cell carry out?',
    kp: ['energy conversion', 'transport of molecules', 'breakdown and synthesis of new molecules', 'removal of waste', 'storage and expression of genetic information'] },
  { id: 'citoplazma.def', topic: 'osnove', page: 3, org: 'citoplazma', label: 'Cytoplasm',
    text: 'Cytoplasm = cytosol + cell organelles.',
    q: 'What are cytoplasm and cytosol?',
    kp: ['cytoplasm is the cytosol together with the cell organelles', 'cytosol is the fluid part of the cytoplasm', 'mostly water', 'dissolved substances: proteins, fats, salts'] },
  { id: 'citosol.def', topic: 'osnove', page: 3, org: 'citoplazma', label: 'Cytosol',
    text: 'Cytosol is the fluid part of the cytoplasm, mostly made of water and the substances dissolved in it (proteins, fats, salts ...).' },

  // 2. Cell theory and microscopes
  { id: 'teorija.tocke', topic: 'teorija', page: 4, label: 'Cell theory',
    text: '1. All living things are made of cells and cell products. 2. New cells can only arise by division of existing cells. 3. Cells contain genetic material with instructions for the growth, function and development of cells. 4. The cell is the functional unit of life: chemical reactions essential for life take place in it.',
    q: 'List and explain the statements of the cell theory.',
    kp: ['all living things are made of cells and cell products', 'new cells only arise by division of existing cells', 'cells contain genetic material with instructions for growth, function and development', 'the cell is the functional unit, chemical reactions essential for life take place in it'] },
  { id: 'teorija.mikroskop', topic: 'teorija', page: 4, label: 'Why the microscope matters',
    text: 'The development of the microscope opened a new field of research: cell biology and microbiology. The cell theory is closely tied to the development of the microscope.',
    q: 'Why is the invention of the microscope important for biology?',
    kp: ['it opened a new field of research', 'the study of cell biology', 'microbiology', 'it made the cell theory possible'] },
  { id: 'teorija.spontani', topic: 'teorija', page: 4, label: 'Spontaneous generation',
    text: 'Before the cell theory people believed that living organisms arise spontaneously from nonliving matter. Pasteur disproved this; new cells only arise from existing cells.',
    q: 'What does spontaneous generation mean and why was the theory rejected?',
    kp: ['living organisms were thought to arise spontaneously from nonliving matter', 'Pasteur disproved it', 'new cells only arise by division of existing cells'] },
  { id: 'mejnik.janssen', topic: 'teorija', page: 4, label: 'Zaharias Janssen, 1595',
    text: 'Around 1595 the Dutchman Zaharias Janssen made the first compound microscope with more than one lens (three tubes with lenses, focused by changing the distance between the lenses).' },
  { id: 'mejnik.leeuwenhoek', topic: 'teorija', page: 4, label: 'Antoni van Leeuwenhoek',
    text: 'Antoni van Leeuwenhoek (1632 to 1723) built about 500 single lens microscopes (up to 270× magnification) and discovered bacteria, red blood cells, sperm cells and protozoa.' },
  { id: 'mejnik.hooke', topic: 'teorija', page: 4, label: 'Robert Hooke',
    text: 'Robert Hooke introduced the term cell for structures in cork; he presented his work in 1665 in the book Micrographia.' },
  { id: 'mejnik.schleiden', topic: 'teorija', page: 4, label: 'Schleiden and Schwann, 1838/39',
    text: 'In 1838/39 the botanist Matthias Schleiden and the zoologist Theodor Schwann developed the cell theory: plants and animals are made of groups of cells, and the cell is the basic unit of living things.' },
  { id: 'mejnik.virchow', topic: 'teorija', page: 4, label: 'Rudolph Virchow, 1855',
    text: 'In 1855 Rudolph Virchow extended the cell theory: new cells can only arise by division of existing cells.' },
  { id: 'mejnik.weismann', topic: 'teorija', page: 4, label: 'August Weismann, 1880',
    text: 'In 1880 August Weismann built on Virchow\'s idea: all cells living today descend from cells of the distant past. This linked the cell theory to evolution.',
    q: 'What did Virchow and Weismann add to the cell theory?',
    kp: ['Virchow: new cells only arise by division of existing cells', 'Weismann: all present cells descend from cells of the distant past', 'Weismann linked the cell theory to evolution'] },
  { id: 'mikro.tem', topic: 'teorija', page: 4, label: 'TEM and SEM',
    text: 'In 1938 Ernst Ruska built the transmission electron microscope (TEM): electrons passing through the specimen are focused by electromagnetic lenses; because accelerated electrons have a short wavelength, we can see very small structures. At about the same time Manfred von Ardenne developed the scanning electron microscope (SEM) for looking at the surface of objects.',
    q: 'Explain the difference between TEM and SEM.',
    kp: ['TEM: electrons pass through the specimen', 'electromagnetic lenses focus the electrons', 'the short wavelength of accelerated electrons lets us see very small structures', 'SEM: looking at the surface of objects'] },
  { id: 'mikro.tem.deli', topic: 'teorija', page: 4, label: 'Parts of a TEM',
    text: 'From top to bottom: electron gun, electromagnetic condenser lenses, specimen, electromagnetic objective lenses, electromagnetic projector lenses, eyepiece and a phosphorescent screen or photographic plate (today a digital camera). A vacuum pump creates a vacuum in the column.' },

  // 3. Organeli
  { id: 'organel.def', topic: 'organeli', page: 5, label: 'What organelles are',
    text: 'Cell organelles are membrane bound structures in which chemical processes run separately from the cytosol.',
    q: 'What are cell organelles?', kp: ['membrane bound structures', 'chemical processes take place in them', 'separately from the cytosol'] },
  { id: 'er.zgradba', topic: 'organeli', page: 5, org: 'zrnatiER', label: 'Structure of the ER',
    text: 'The ER is a network of differently shaped spaces surrounded by membranes: tubes or flattened sacs called cisternae. We distinguish the rough ER (with ribosomes on its surface) and the smooth ER.',
    q: 'Describe the structure of the endoplasmic reticulum and its two types.',
    kp: ['a network of spaces surrounded by membranes', 'tubular or flattened sac like spaces (cisternae)', 'the rough ER has ribosomes on its surface', 'the smooth ER has no ribosomes'] },
  { id: 'er.zrnati', topic: 'organeli', page: 5, org: 'zrnatiER', label: 'Role of the rough ER',
    text: 'Rough ER: making proteins the cell secretes; synthesising membranes (for renewal).',
    q: 'What is the role of the rough ER?', kp: ['making proteins the cell secretes', 'membrane synthesis for renewal'] },
  { id: 'er.gladki', topic: 'organeli', page: 5, org: 'gladkiER', label: 'Role of the smooth ER',
    text: 'Smooth ER: synthesis of lipids and steroids; breakdown of toxic substances (for example alcohol); storage of calcium ions (signal transmission, muscle contraction).',
    q: 'What is the role of the smooth ER?', kp: ['synthesis of lipids and steroids', 'breakdown of toxic substances, for example alcohol', 'storing calcium ions', 'calcium is important for signal transmission and muscle contraction'] },
  { id: 'ribosomi.zgradba', topic: 'organeli', page: 6, org: 'ribosomi', label: 'Structure of ribosomes',
    text: 'Ribosomes are made of ribonucleic acid (RNA) and proteins; they consist of two subunits, a large one and a small one.',
    q: 'Describe ribosomes: structure, location and role.', kp: ['made of RNA and proteins', 'two subunits, a large and a small one', 'free in the cytoplasm or attached to the ER', 'protein synthesis'] },
  { id: 'ribosomi.mesto', topic: 'organeli', page: 6, org: 'ribosomi', label: 'Where ribosomes are',
    text: 'Ribosomes are free in the cytoplasm or attached to the ER.' },
  { id: 'ribosomi.vloga', topic: 'organeli', page: 6, org: 'ribosomi', label: 'Role of ribosomes',
    text: 'Ribosomes carry out protein synthesis.' },
  { id: 'golgi.zgradba', topic: 'organeli', page: 6, org: 'golgi', label: 'Structure of the Golgi apparatus',
    text: 'The membranes of the Golgi apparatus form flattened cisternae stacked on top of each other.' },
  { id: 'golgi.vloga', topic: 'organeli', page: 6, org: 'golgi', label: 'Role of the Golgi apparatus',
    text: 'The Golgi apparatus prepares products the cell secretes and membranes to renew the cell membrane. Vesicles carrying these substances bud off the edges of the outer cisternae.',
    q: 'Describe the Golgi apparatus and its role.',
    kp: ['flattened cisternae stacked on top of each other', 'preparing products the cell secretes', 'preparing membranes to renew the cell membrane', 'vesicles carrying these substances bud off the cisternae'] },
  { id: 'vakuola.rastl', topic: 'organeli', page: 7, org: 'vakuola', label: 'Vacuole in a plant cell',
    text: 'A plant cell usually has one large vacuole; it stores substances made in the cell (for example pigments) and water, and supports the cell.',
    q: 'Compare vacuoles in plant and animal cells.',
    kp: ['plant cell: usually one large vacuole', 'stores substances (for example pigments) and water', 'supports the cell', 'animal cell: several smaller vacuoles (vesicles)', 'in animal cells: water, waste, water soluble pigments'] },
  { id: 'vakuola.zival', topic: 'organeli', page: 7, org: 'vakuola', label: 'Vacuoles in an animal cell',
    text: 'An animal cell has several smaller vacuoles (vesicles) that store water, waste and water soluble pigments.' },
  { id: 'lizosom', topic: 'organeli', page: 7, org: 'lizosom', label: 'Lysosomes',
    text: 'Lysosomes contain digestive enzymes and break down substances; they take part in cellular digestion. They float freely in the cytoplasm. In some plant cells the vacuole takes over their role.',
    q: 'What are lysosomes and what is their role?',
    kp: ['contain digestive enzymes', 'they break down substances', 'they take part in cellular digestion', 'in some plant cells the vacuole takes over their role'] },
  { id: 'jedro.ovoj', topic: 'organeli', page: 8, org: 'jedro', label: 'Nuclear envelope and pores',
    text: 'The nucleus is surrounded by a nuclear envelope of two membranes with ribosomes attached to its surface. Pores in the nuclear envelope connect the inside of the nucleus with the cytoplasm.',
    q: 'Describe the structure of the nucleus.',
    kp: ['nuclear envelope of two membranes', 'ribosomes on the surface of the envelope', 'pores connect the inside of the nucleus with the cytoplasm', 'the nucleolus is inside the nucleus'] },
  { id: 'jedro.mesto', topic: 'organeli', page: 8, org: 'jedro', label: 'Position of the nucleus',
    text: 'The nucleus is a separate organelle; its position in the cell changes.' },
  { id: 'jedro.kromatin', topic: 'organeli', page: 8, org: 'jedro', label: 'Chromatin and chromosomes',
    text: 'DNA molecules are bound to special nuclear proteins called histones. Together they form a threadlike tangle, chromatin. During cell division, chromatin coils further and forms chromosomes.',
    q: 'What is chromatin and how do chromosomes form?',
    kp: ['DNA is bound to nuclear proteins called histones', 'together they form a threadlike tangle, chromatin', 'during cell division', 'extra coiling of chromatin forms chromosomes'] },
  { id: 'jedro.zapis', topic: 'organeli', page: 8, org: 'jedro', label: 'The nucleus and the properties of the cell',
    text: 'Most of the DNA is in the nucleus. DNA molecules carry the genetic code for proteins; the properties of the cell, and of the living thing made of these cells, depend on this code.',
    q: 'Why does the nucleus matter for the properties of the cell and the organism?',
    kp: ['most of the DNA is in the nucleus', 'DNA carries the genetic code for proteins', 'the properties of the cell depend on this code', 'and the properties of the living thing'] },
  { id: 'jedrce', topic: 'organeli', page: 8, org: 'jedrce', label: 'Nucleolus',
    text: 'The nucleolus is an area inside the nucleus where large and small ribosome subunits are made.',
    q: 'What is the nucleolus and what is made in it?', kp: ['an area inside the nucleus', 'ribosome subunits are made there', 'large and small subunits'] },
  { id: 'mito.zgradba', topic: 'organeli', page: 9, org: 'mitohondrij', label: 'Structure of the mitochondrion',
    text: 'A mitochondrion has an outer membrane, a folded inner membrane and a matrix containing circular DNA molecules and ribosomes. It sits in the cytoplasm as a separate organelle.',
    q: 'Describe the structure and role of the mitochondrion.',
    kp: ['outer membrane', 'folded inner membrane', 'matrix with circular DNA and ribosomes', 'cellular respiration, ATP production (energy)'] },
  { id: 'mito.vloga', topic: 'organeli', page: 9, org: 'mitohondrij', label: 'Role of the mitochondrion',
    text: 'Cellular respiration takes place in the mitochondrion (ATP production, energy).' },
  { id: 'plastidi.def', topic: 'organeli', page: 9, org: 'kloroplast', label: 'Plastids',
    text: 'Plastids are typical of plant cells and are similar in structure to mitochondria. The most important are chloroplasts, because photosynthesis takes place in them.' },
  { id: 'kloro.zgradba', topic: 'organeli', page: 9, org: 'kloroplast', label: 'Structure of the chloroplast',
    text: 'A chloroplast is surrounded by an outer and an inner membrane. Inside is the stroma (matrix), into which the thylakoid membrane folds (it comes from the inner membrane) and forms flattened sacs, the thylakoids. Thylakoids stacked on top of each other form grana. The chloroplast also has its own DNA and ribosomes.',
    q: 'Describe the structure of the chloroplast.',
    kp: ['two membranes: outer and inner', 'inside is the stroma (matrix)', 'the thylakoid membrane comes from the inner membrane and forms thylakoids', 'stacked thylakoids form grana', 'the thylakoid membrane holds pigments, especially chlorophyll', 'chloroplast DNA and ribosomes'] },
  { id: 'kloro.pigment', topic: 'organeli', page: 10, org: 'kloroplast', label: 'Chlorophyll',
    text: 'The thylakoid membrane holds many pigments, especially the green pigment chlorophyll.' },
  { id: 'skrobna', topic: 'organeli', page: 10, org: 'skrobna', label: 'Starch grains',
    text: 'Starch grains are specialised plastids for storing starch.' },
  { id: 'centrioli', topic: 'organeli', page: 10, org: 'centrioli', label: 'Centrioles',
    text: 'Centrioles are in the cytoplasm near the nucleus and are involved in cell division. They are found in animal cells and only in some cells of lower plants.',
    q: 'Where are centrioles, what is their role and in which cells do we find them?',
    kp: ['in the cytoplasm near the nucleus', 'involved in cell division', 'present in animal cells', 'only in some cells of lower plants'] },

  // 4. Cytoskeleton, membrane, wall
  { id: 'citoskelet.zgradba', topic: 'ovoj', page: 10, org: 'citoskelet', label: 'Structure of the cytoskeleton',
    text: 'The cytoskeleton is a network of proteins that form filaments or tubes: microfilaments, intermediate filaments and microtubules.',
    q: 'What is the cytoskeleton and what is its role?',
    kp: ['a network of proteins', 'filaments or tubes', 'microfilaments, intermediate filaments, microtubules', 'keeps the shape of the cell', 'supports organelles and sets their position', 'lets the cell move and change shape'] },
  { id: 'citoskelet.vloga', topic: 'ovoj', page: 10, org: 'citoskelet', label: 'Role of the cytoskeleton',
    text: 'The cytoskeleton keeps the shape of the cell, supports organelles and sets their position, and lets the cell move and change its shape.' },
  { id: 'migetalke', topic: 'ovoj', page: 11, org: 'migetalke', label: 'Cilia and flagella',
    text: 'Cilia and flagella are made of microtubules, anchored in the cell membrane and stick out into the surroundings. They let the cell move. They are found in animal cells and only in some plant cells (some single celled algae).',
    q: 'Describe cilia and flagella.',
    kp: ['made of microtubules', 'anchored in the cell membrane and stick out into the surroundings', 'let the cell move', 'present in animal cells, only in some plant cells (single celled algae)'] },
  { id: 'membrana.vloga', topic: 'ovoj', page: 11, org: 'membrana', label: 'Role of the cell membrane',
    text: 'The cell membrane (plasmalemma) surrounds the cell, gives it shape and protection, and controls the passage of substances into and out of the cell (semipermeable).',
    q: 'What is the role of the cell membrane?',
    kp: ['surrounds the cell', 'gives shape and protection', 'controls the passage of substances into and out of the cell', 'it is semipermeable (selectively permeable)'] },
  { id: 'mozaik.zgradba', topic: 'ovoj', page: 11, org: 'membrana', label: 'Fluid mosaic model',
    text: 'The fluid mosaic model is the currently accepted model of membrane structure. It is made of a phospholipid bilayer whose hydrophobic tails (they repel water) face the inside of the bilayer. The lipid bilayer is fairly fluid and proteins more or less float in it.',
    q: 'Describe the fluid mosaic model.',
    kp: ['the currently accepted model of membrane structure', 'phospholipid bilayer', 'the hydrophobic tails face the inside of the bilayer', 'the lipid bilayer is fluid', 'proteins float in it', 'proteins also take part in active transport'] },
  { id: 'mozaik.proteini', topic: 'ovoj', page: 11, org: 'membrana', label: 'Proteins in the membrane',
    text: 'Cell proteins in the membrane do many jobs; among other things they can take part in active transport.' },
  { id: 'stena', topic: 'ovoj', page: 12, org: 'stena', label: 'Cell wall',
    text: 'The cell wall surrounds the cell on the outside of the cell membrane. It is secreted by the cell and in its mature state it is a nonliving part of the cell. In a plant cell it is made of several layers of the polysaccharide cellulose, gives strength and protects against changes in turgor. Animal cells do not have one.',
    q: 'Describe the cell wall.',
    kp: ['surrounds the cell on the outside of the cell membrane', 'secreted by the cell, nonliving in its mature state', 'in plants made of several layers of cellulose (a polysaccharide)', 'gives strength', 'protects against changes in turgor', 'animal cells do not have one'] },

  // 5. Plant and animal cells
  { id: 'rz.razlike', topic: 'primerjava', page: 13, label: 'Plant versus animal',
    text: 'Plant cell: cellulose cell wall, chloroplasts, vacuoles, autotrophic, regular shape. Animal cell: no cellulose wall, no chloroplasts, vacuoles only in some cells, heterotrophic, irregular shape.',
    q: 'List the differences between a plant cell and an animal cell.',
    kp: ['a plant cell has a cellulose cell wall, an animal cell does not', 'a plant cell has chloroplasts, an animal cell does not', 'a plant cell has vacuoles, an animal cell only in some cells', 'a plant cell is autotrophic, an animal cell heterotrophic', 'a plant cell has a regular shape, an animal cell does not'] },
  { id: 'rz.prehrana', topic: 'primerjava', page: 13, label: 'Autotrophic and heterotrophic',
    text: 'Plant cells are autotrophic, animal cells heterotrophic.' },
  { id: 'rz.oblika', topic: 'primerjava', page: 13, label: 'Cell shape',
    text: 'Plant cells have regular shapes, animal cells do not.' },

  // 6. Light microscope (from earlier lessons)
  { id: 'svm.deli', topic: 'mikroskop', page: 'earlier lessons', label: 'Parts of a light microscope',
    text: 'Eyepiece, tube, revolving nosepiece, objectives, arm, stage, specimen, coarse focus knob, fine focus knob, base, light source.' },
  { id: 'svm.vijaka', topic: 'mikroskop', page: 'earlier lessons', label: 'Coarse and fine focus knobs',
    text: 'The coarse focus knob gives a rough focus, the fine focus knob a sharp one.' },
  { id: 'svm.povecava', topic: 'mikroskop', page: 'earlier lessons', label: 'Total magnification',
    text: 'Total magnification = eyepiece magnification × objective magnification (for example 10× · 40× = 400×).',
    q: 'How do you calculate the total magnification of a microscope? Give an example.',
    kp: ['multiply the eyepiece and objective magnification', 'example: eyepiece 10×, objective 40× gives 400×'] },
  { id: 'svm.enote', topic: 'mikroskop', page: 'earlier lessons', label: 'Units: mm, µm, nm',
    text: '1 mm = 1000 µm, 1 µm = 1000 nm.' },
]

export const CON: Record<string, Concept> = Object.fromEntries(CONCEPTS.map(c => [c.id, c]))

export interface Topic {
  id: TopicId
  title: string
  sub: string
  pages: string
  tint: string // colour from the organelle palette
}

export const TOPICS: Topic[] = [
  { id: 'osnove', title: 'The cell and types of cells', sub: 'Definition, prokaryotes and eukaryotes, cytoplasm', pages: 'p. 1 to 3', tint: 'var(--o-jedro)' },
  { id: 'teorija', title: 'Cell theory', sub: 'Milestones, microscopes, TEM and SEM', pages: 'p. 4', tint: 'var(--o-golgi)' },
  { id: 'organeli', title: 'Organelles', sub: 'ER, ribosomes, Golgi, nucleus, mitochondrion, chloroplast ...', pages: 'p. 5 to 10', tint: 'var(--o-mito)' },
  { id: 'ovoj', title: 'Cytoskeleton, membrane, wall', sub: 'Cytoskeleton, cilia, fluid mosaic, cellulose', pages: 'p. 10 to 12', tint: 'var(--o-zer)' },
  { id: 'primerjava', title: 'Plant and animal', sub: 'Five differences you need to know', pages: 'p. 13', tint: 'var(--o-kloro)' },
  { id: 'mikroskop', title: 'Light microscope', sub: 'Parts, magnification, units', pages: 'earlier lessons', tint: 'var(--o-centri)' },
]

export const TOP: Record<TopicId, Topic> = Object.fromEntries(TOPICS.map(t => [t.id, t])) as Record<TopicId, Topic>

export const conceptsOf = (t: TopicId) => CONCEPTS.filter(c => c.topic === t)
