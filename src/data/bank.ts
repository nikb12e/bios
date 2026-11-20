// Hand written tasks. All of them are based on the cell notes (and for the microscope, on earlier lessons).
// The distractors are deliberately convincing and come from common mix ups.

import type { OrgId, DetailId } from './organelles'

export type Cell = 'animal' | 'plant' | 'prok'

export type Task =
  | { t: 'mc'; id: string; c: string[]; q: string; opts: string[]; a: number; why?: string; org?: OrgId }
  | { t: 'tf'; id: string; c: string[]; s: string; a: boolean; fix?: { q: string; opts: string[]; a: number }; why?: string; org?: OrgId }
  | { t: 'cloze'; id: string; c: string[]; text: string; extra?: string[]; why?: string }
  | { t: 'type'; id: string; c: string[]; q: string; a: string[]; hint?: string; why?: string }
  | { t: 'odd'; id: string; c: string[]; q: string; items: string[]; a: number; why: string }
  | { t: 'fix'; id: string; c: string[]; text: string; opts: string[]; why?: string }
  | { t: 'match'; id: string; c: string[]; q: string; pairs: [string, string][] }
  | { t: 'sort'; id: string; c: string[]; q: string; bins: string[]; items: [string, number][]; why?: string }
  | { t: 'order'; id: string; c: string[]; q: string; items: string[]; hint?: string; why?: string }
  | { t: 'locate'; id: string; c: string[]; cell: Cell; target: OrgId }
  | { t: 'identify'; id: string; c: string[]; cell: Cell; target: OrgId; mode: 'choose' | 'type' }
  | { t: 'labels'; id: string; c: string[]; diagram: DetailId }
  | { t: 'table'; id: string; c: string[] }
  | { t: 'explain'; id: string; c: string[]; q: string; kp: string[]; ref: string }
  | { t: 'scale'; id: string; c: string[]; kind: 'size' | 'zoom' | 'units' }
  | { t: 'recall'; id: string; c: string[]; front: string; back: string }

export type TaskType = Task['t']

export const TYPE_INFO: Record<TaskType, { name: string; tier: 1 | 2 | 3; desc: string }> = {
  mc: { name: 'Choice', tier: 1, desc: 'One correct out of four' },
  tf: { name: 'True or false', tier: 1, desc: 'If it is false, you correct it' },
  locate: { name: 'Point on the cell', tier: 1, desc: 'Tap the right organelle' },
  identify: { name: 'What is marked', tier: 1, desc: 'Recognise the organelle in the picture' },
  match: { name: 'Match the pairs', tier: 1, desc: 'The organelle and its role' },
  sort: { name: 'Sort', tier: 1, desc: 'Sort into groups' },
  recall: { name: 'Recall', tier: 1, desc: 'Self rated flashcard' },
  cloze: { name: 'Fill in', tier: 2, desc: 'Insert the missing terms' },
  odd: { name: 'Odd one out', tier: 2, desc: 'What does not belong and why' },
  fix: { name: 'Find the mistake', tier: 2, desc: 'One word in the sentence is wrong' },
  order: { name: 'Order', tier: 2, desc: 'Order by time or by sequence' },
  labels: { name: 'Label the picture', tier: 2, desc: 'Place the labels on the right parts' },
  table: { name: 'Comparison table', tier: 2, desc: 'Prokaryotic versus eukaryotic' },
  scale: { name: 'Size and magnification', tier: 2, desc: 'Micrometres, nanometres, magnification' },
  type: { name: 'Type the term', tier: 3, desc: 'Write the scientific term from the description' },
  explain: { name: 'Explain', tier: 3, desc: 'In your own words, graded by AI' },
}

export const BANK: Task[] = [
  // ───────── CHOICE ─────────
  { t: 'mc', id: 'mc1', c: ['celica.def'], q: 'The cell is the basic ...', opts: ['structural and functional unit of living things', 'unit of inheritance that carries the genetic code', 'structural unit that bacteria do not have', 'chemical compound that organelles are made of'], a: 0 },
  { t: 'mc', id: 'mc2', c: ['celica.delitev'], q: 'What does cell division make possible?', opts: ['Passing genetic information from the mother cell to the daughter cell', 'Forming new organelles from the cytosol', 'Converting energy in the mitochondrion', 'Spontaneous generation of living things'], a: 0 },
  { t: 'mc', id: 'mc3', c: ['celica.vrste'], q: 'Which living things have prokaryotic cells?', opts: ['Bacteria', 'Fungi', 'Plants', 'Protozoa'], a: 0, why: 'Bacteria have prokaryotic cells. Fungi, plants and animals have eukaryotic cells.' },
  { t: 'mc', id: 'mc4', c: ['pe.velikost'], q: 'What is the usual size of a eukaryotic cell?', opts: ['10 to 100 µm', '0.5 to 8 µm', '1 to 10 nm', '1 to 10 mm'], a: 0, why: 'Prokaryotes: 0.5 to 8 µm. Eukaryotes: 10 to 100 µm.' },
  { t: 'mc', id: 'mc5', c: ['pe.dedni'], q: 'What is the genetic material of a prokaryotic cell like?', opts: ['One circular DNA that is not bound to proteins', 'Many linear DNA molecules bound to proteins', 'One linear DNA in the nucleus', 'Circular DNA wrapped around histones in the nucleus'], a: 0 },
  { t: 'mc', id: 'mc6', c: ['pe.delitev'], q: 'How does a prokaryotic cell divide?', opts: ['By fission, without a spindle', 'By mitosis, with a spindle', 'By meiosis', 'It does not divide'], a: 0 },
  { t: 'mc', id: 'mc7', c: ['pe.organeli'], q: 'What does a prokaryotic cell have?', opts: ['Smaller ribosomes', 'Mitochondria', 'Golgi apparatus', 'Nuclear envelope'], a: 0, why: 'Prokaryotes only have smaller ribosomes; they have no ER, Golgi apparatus, mitochondria or nuclear envelope.' },
  { t: 'mc', id: 'mc8', c: ['citoplazma.def'], q: 'What is the cytoplasm made of?', opts: ['Cytosol and cell organelles', 'Only cytosol', 'Cytosol and the nucleus', 'Water and salts'], a: 0, org: 'citoplazma' },
  { t: 'mc', id: 'mc9', c: ['citosol.def'], q: 'What is cytosol?', opts: ['The fluid part of the cytoplasm, made of water and dissolved substances', 'The contents of the nucleus', 'Cytoplasm together with organelles', 'The fluid in the vacuole'], a: 0, org: 'citoplazma' },
  { t: 'mc', id: 'mc10', c: ['organel.def'], q: 'What are cell organelles according to the notes?', opts: ['Membrane bound structures in which chemical processes run separately from the cytosol', 'All molecules in the cytosol', 'Protein filaments and tubes in the cytoplasm', 'Parts of the nucleus where ribosomes are made'], a: 0 },
  { t: 'mc', id: 'mc11', c: ['er.zrnati'], q: 'What is the role of the rough ER?', opts: ['Making proteins the cell secretes, and synthesising membranes', 'Lipid synthesis and breakdown of toxins', 'Storing calcium ions', 'Cellular respiration'], a: 0, org: 'zrnatiER' },
  { t: 'mc', id: 'mc12', c: ['er.gladki'], q: 'Where are toxic substances, for example alcohol, broken down?', opts: ['In the smooth ER', 'In the rough ER', 'In the Golgi apparatus', 'In the nucleolus'], a: 0, org: 'gladkiER' },
  { t: 'mc', id: 'mc13', c: ['er.gladki'], q: 'Why are the calcium ions stored in the smooth ER important?', opts: ['For signal transmission and muscle contraction', 'For photosynthesis', 'For making ribosomes', 'For the strength of the cell wall'], a: 0, org: 'gladkiER' },
  { t: 'mc', id: 'mc14', c: ['ribosomi.zgradba'], q: 'What are ribosomes made of?', opts: ['RNA and proteins', 'DNA and histones', 'Phospholipids and proteins', 'Cellulose'], a: 0, org: 'ribosomi' },
  { t: 'mc', id: 'mc15', c: ['ribosomi.mesto'], q: 'Where are ribosomes found?', opts: ['Free in the cytoplasm or attached to the ER', 'Only in the nucleus', 'Only on the smooth ER', 'Only in the Golgi apparatus'], a: 0, org: 'ribosomi' },
  { t: 'mc', id: 'mc16', c: ['golgi.vloga'], q: 'What does the Golgi apparatus prepare?', opts: ['Products the cell secretes, and membranes to renew the cell membrane', 'Lipids and steroids', 'Ribosome subunits', 'ATP'], a: 0, org: 'golgi' },
  { t: 'mc', id: 'mc17', c: ['golgi.vloga'], q: 'What buds off the cisternae of the Golgi apparatus?', opts: ['Vesicles carrying prepared substances', 'Ribosomes', 'Thylakoids', 'Chromosomes'], a: 0, org: 'golgi' },
  { t: 'mc', id: 'mc18', c: ['vakuola.rastl'], q: 'What is true of the vacuole in a plant cell?', opts: ['There is usually one large vacuole that stores water and substances and gives support', 'It is many small vesicles for waste', 'It contains digestive enzymes and chromatin', 'There is none'], a: 0, org: 'vakuola' },
  { t: 'mc', id: 'mc19', c: ['lizosom'], q: 'What do lysosomes contain?', opts: ['Digestive enzymes', 'Chlorophyll', 'Circular DNA', 'Calcium ions'], a: 0, org: 'lizosom' },
  { t: 'mc', id: 'mc20', c: ['lizosom'], q: 'In some plant cells, what takes over the role of lysosomes?', opts: ['Vacuole', 'Chloroplast', 'Cell wall', 'Nucleolus'], a: 0, org: 'lizosom' },
  { t: 'mc', id: 'mc21', c: ['jedro.ovoj'], q: 'What is the nuclear envelope made of?', opts: ['Two membranes with pores', 'One membrane without pores', 'Cellulose', 'Microtubules'], a: 0, org: 'jedro' },
  { t: 'mc', id: 'mc22', c: ['jedro.kromatin'], q: 'What is chromatin?', opts: ['A threadlike tangle of DNA and histones', 'The area in the nucleus where ribosomes are made', 'A pigment in the thylakoids', 'The fluid part of the nucleus'], a: 0, org: 'jedro' },
  { t: 'mc', id: 'mc23', c: ['jedro.kromatin'], q: 'When do chromosomes form from chromatin?', opts: ['During cell division, through extra coiling', 'When the cell grows', 'When the cell dies', 'During photosynthesis'], a: 0, org: 'jedro' },
  { t: 'mc', id: 'mc24', c: ['jedrce'], q: 'What is made in the nucleolus?', opts: ['Large and small ribosome subunits', 'Chromosomes', 'Vesicles', 'ATP'], a: 0, org: 'jedrce' },
  { t: 'mc', id: 'mc25', c: ['mito.zgradba'], q: 'Where in the mitochondrion are the circular DNA molecules and ribosomes?', opts: ['In the matrix', 'In the outer membrane', 'Between the outer and inner membrane', 'In the thylakoids'], a: 0, org: 'mitohondrij' },
  { t: 'mc', id: 'mc26', c: ['mito.vloga'], q: 'What takes place in the mitochondrion?', opts: ['Cellular respiration, ATP production', 'Photosynthesis', 'Lipid synthesis', 'Cellular digestion'], a: 0, org: 'mitohondrij' },
  { t: 'mc', id: 'mc27', c: ['kloro.zgradba'], q: 'What is a granum?', opts: ['A stack of thylakoids piled on top of each other', 'The fluid interior of the chloroplast', 'The outer membrane of the chloroplast', 'A starch grain'], a: 0, org: 'kloroplast' },
  { t: 'mc', id: 'mc28', c: ['kloro.pigment'], q: 'Where is chlorophyll?', opts: ['In the thylakoid membrane', 'In the stroma', 'In the outer membrane of the chloroplast', 'In the vacuole'], a: 0, org: 'kloroplast' },
  { t: 'mc', id: 'mc29', c: ['kloro.zgradba'], q: 'Which membrane does the thylakoid membrane come from?', opts: ['The inner membrane of the chloroplast', 'The outer membrane of the chloroplast', 'The cell membrane', 'The rough ER'], a: 0, org: 'kloroplast' },
  { t: 'mc', id: 'mc30', c: ['plastidi.def'], q: 'What are plastids similar to in structure?', opts: ['Mitochondria', 'Lysosomes', 'Ribosomes', 'Centrioles'], a: 0, org: 'kloroplast' },
  { t: 'mc', id: 'mc31', c: ['centrioli'], q: 'Where are the centrioles?', opts: ['In the cytoplasm near the nucleus', 'In the nucleolus', 'On the cell wall', 'In the mitochondrial matrix'], a: 0, org: 'centrioli' },
  { t: 'mc', id: 'mc32', c: ['centrioli'], q: 'What do centrioles take part in?', opts: ['Cell division', 'Cellular respiration', 'Photosynthesis', 'Breaking down toxins'], a: 0, org: 'centrioli' },
  { t: 'mc', id: 'mc33', c: ['citoskelet.zgradba'], q: 'What is NOT part of the cytoskeleton?', opts: ['Thylakoids', 'Microfilaments', 'Intermediate filaments', 'Microtubules'], a: 0, org: 'citoskelet' },
  { t: 'mc', id: 'mc34', c: ['migetalke'], q: 'What are cilia and flagella made of?', opts: ['Microtubules', 'Cellulose', 'Phospholipids', 'Microfilaments and DNA'], a: 0, org: 'migetalke' },
  { t: 'mc', id: 'mc35', c: ['membrana.vloga'], q: 'Why do we call the cell membrane semipermeable?', opts: ['It controls which substances enter and leave the cell', 'Because it is half lipid and half cellulose', 'Because it only lets water through', 'Because it has pores on one side only'], a: 0, org: 'membrana' },
  { t: 'mc', id: 'mc36', c: ['mozaik.zgradba'], q: 'Which way do the hydrophobic tails of phospholipids face?', opts: ['Into the inside of the bilayer', 'Outwards, towards the water', 'Towards the cell wall', 'Into the cytosol'], a: 0, org: 'membrana' },
  { t: 'mc', id: 'mc37', c: ['mozaik.proteini'], q: 'What can membrane proteins take part in?', opts: ['Active transport', 'Making ribosomes', 'Photosynthesis in the stroma', 'Coiling chromatin'], a: 0, org: 'membrana' },
  { t: 'mc', id: 'mc38', c: ['stena'], q: 'What does the cell wall protect a plant cell against?', opts: ['Changes in turgor', 'Light', 'Division', 'Water entering'], a: 0, org: 'stena' },
  { t: 'mc', id: 'mc39', c: ['stena'], q: 'What is the cell wall of a plant cell made of?', opts: ['Several layers of cellulose (a polysaccharide)', 'Phospholipids', 'Chitin', 'Starch'], a: 0, org: 'stena' },
  { t: 'mc', id: 'mc40', c: ['rz.prehrana'], q: 'How do plant cells get their food?', opts: ['Autotrophic', 'Heterotrophic', 'Prokaryotic', 'They need no food'], a: 0 },
  { t: 'mc', id: 'mc41', c: ['teorija.tocke'], q: 'Which statement is NOT part of the cell theory?', opts: ['Living organisms can arise spontaneously from nonliving matter', 'New cells only arise by division of existing cells', 'All living things are made of cells and cell products', 'The cell is the functional unit of life'], a: 0 },
  { t: 'mc', id: 'mc42', c: ['mejnik.hooke'], q: 'Who introduced the term cell?', opts: ['Robert Hooke', 'Antoni van Leeuwenhoek', 'Rudolph Virchow', 'Theodor Schwann'], a: 0, why: 'Hooke described structures in cork and presented his work in 1665 in the book Micrographia.' },
  { t: 'mc', id: 'mc43', c: ['mejnik.leeuwenhoek'], q: 'Who first saw bacteria, red blood cells, sperm cells and protozoa?', opts: ['Antoni van Leeuwenhoek', 'Robert Hooke', 'Zaharias Janssen', 'Ernst Ruska'], a: 0 },
  { t: 'mc', id: 'mc44', c: ['mejnik.virchow'], q: 'Who claimed that new cells only arise by division of existing cells?', opts: ['Rudolph Virchow', 'August Weismann', 'Matthias Schleiden', 'Louis Pasteur'], a: 0 },
  { t: 'mc', id: 'mc45', c: ['mejnik.weismann'], q: 'Who linked the cell theory to evolution?', opts: ['August Weismann', 'Rudolph Virchow', 'Theodor Schwann', 'Robert Hooke'], a: 0 },
  { t: 'mc', id: 'mc46', c: ['mejnik.schleiden'], q: 'Who developed the cell theory (1838/39)?', opts: ['The botanist Schleiden and the zoologist Schwann', 'Hooke and Leeuwenhoek', 'Virchow and Weismann', 'Ruska and von Ardenne'], a: 0 },
  { t: 'mc', id: 'mc47', c: ['mikro.tem'], q: 'Why can we see very small structures with a TEM?', opts: ['Because accelerated electrons have a short wavelength', 'Because it has many glass lenses', 'Because it stains the specimen', 'Because it only looks at the surface'], a: 0 },
  { t: 'mc', id: 'mc48', c: ['mikro.tem'], q: 'Which microscope is used to look at the surface of objects?', opts: ['Scanning electron microscope (SEM)', 'Transmission electron microscope (TEM)', 'Leeuwenhoek\'s microscope', 'Janssen\'s microscope'], a: 0 },
  { t: 'mc', id: 'mc49', c: ['mejnik.janssen'], q: 'What was special about Janssen\'s microscope (around 1595)?', opts: ['It was the first compound microscope with more than one lens', 'It used electrons', 'It magnified 270 times with one lens', 'It was used to discover the cell in cork'], a: 0 },
  { t: 'mc', id: 'mc50', c: ['mejnik.leeuwenhoek'], q: 'How much could Leeuwenhoek\'s simple microscope magnify?', opts: ['Up to 270 times', 'Up to 40 times', 'Up to 1000 times', 'Up to a million times'], a: 0 },
  { t: 'mc', id: 'mc51', c: ['svm.vijaka'], q: 'What do you use to fine focus the image under a microscope?', opts: ['The fine focus knob', 'The coarse focus knob', 'The revolving nosepiece', 'The stage'], a: 0 },
  { t: 'mc', id: 'mc52', c: ['svm.povecava'], q: 'Eyepiece 10×, objective 40×. What is the total magnification?', opts: ['400×', '50×', '4×', '4000×'], a: 0 },
  { t: 'mc', id: 'mc53', c: ['evk.zgradba'], q: 'Which cell function is listed in the notes?', opts: ['Storing and expressing genetic information', 'Spontaneous formation of new organelles', 'Photosynthesis in all cells', 'Division without a spindle'], a: 0 },
  { t: 'mc', id: 'mc54', c: ['jedro.zapis'], q: 'What do the properties of a cell and a living thing depend on?', opts: ['The genetic code for proteins in DNA', 'The size of the vacuole', 'The number of mitochondria', 'The thickness of the cell wall'], a: 0, org: 'jedro' },

  // ───────── TRUE / FALSE ─────────
  { t: 'tf', id: 'tf1', c: ['citoplazma.def'], s: 'Cytosol and cytoplasm are synonyms.', a: false, fix: { q: 'What is correct?', opts: ['Cytoplasm = cytosol + cell organelles', 'Cytosol = cytoplasm + nucleus', 'Cytoplasm is only fluid without organelles'], a: 0 }, org: 'citoplazma' },
  { t: 'tf', id: 'tf2', c: ['jedro.ovoj'], s: 'The nuclear envelope is made of two membranes.', a: true, org: 'jedro' },
  { t: 'tf', id: 'tf3', c: ['jedro.ovoj', 'membrana.vloga'], s: 'The nuclear envelope and the cell membrane are the same structure.', a: false, fix: { q: 'What is true?', opts: ['The nuclear envelope surrounds the nucleus, the cell membrane surrounds the whole cell', 'The nuclear envelope surrounds the cell, the membrane surrounds the nucleus', 'Both surround only the nucleus'], a: 0 }, org: 'jedro' },
  { t: 'tf', id: 'tf4', c: ['er.gladki'], s: 'The smooth ER has ribosomes on its surface.', a: false, fix: { q: 'Where are the ribosomes on the ER?', opts: ['On the surface of the rough ER', 'Inside the smooth ER', 'The same on both types'], a: 0 }, org: 'gladkiER' },
  { t: 'tf', id: 'tf5', c: ['er.gladki'], s: 'The smooth ER stores calcium ions.', a: true, org: 'gladkiER' },
  { t: 'tf', id: 'tf6', c: ['ribosomi.zgradba'], s: 'A ribosome is made of two subunits of equal size.', a: false, fix: { q: 'Correct it:', opts: ['A large and a small subunit', 'Three subunits', 'A single subunit'], a: 0 }, org: 'ribosomi' },
  { t: 'tf', id: 'tf7', c: ['golgi.zgradba'], s: 'The cisternae of the Golgi apparatus are stacked on top of each other.', a: true, org: 'golgi' },
  { t: 'tf', id: 'tf8', c: ['vakuola.zival'], s: 'An animal cell usually has one large vacuole.', a: false, fix: { q: 'What is true of an animal cell?', opts: ['There are several smaller vacuoles (vesicles)', 'There is never a vacuole', 'The vacuole fills almost the whole cell'], a: 0 }, org: 'vakuola' },
  { t: 'tf', id: 'tf9', c: ['lizosom'], s: 'Lysosomes take part in cellular digestion.', a: true, org: 'lizosom' },
  { t: 'tf', id: 'tf10', c: ['jedro.mesto'], s: 'The nucleus always has the same fixed place in the cell.', a: false, fix: { q: 'What do the notes say?', opts: ['The nucleus is a separate organelle and its position changes', 'The nucleus is always in the middle of the cell', 'The nucleus is attached to the cell wall'], a: 0 }, org: 'jedro' },
  { t: 'tf', id: 'tf11', c: ['jedrce'], s: 'The nucleolus has its own nuclear envelope.', a: false, fix: { q: 'What is the nucleolus?', opts: ['An area inside the nucleus where ribosome subunits are made', 'A smaller nucleus with two membranes', 'An organelle in the cytoplasm'], a: 0 }, org: 'jedrce' },
  { t: 'tf', id: 'tf12', c: ['mito.zgradba'], s: 'The inner membrane of the mitochondrion is folded.', a: true, org: 'mitohondrij' },
  { t: 'tf', id: 'tf13', c: ['mito.zgradba'], s: 'The mitochondrion has no DNA of its own.', a: false, fix: { q: 'What is in the matrix?', opts: ['Circular DNA molecules and ribosomes', 'Chlorophyll and starch', 'Histones and chromosomes'], a: 0 }, org: 'mitohondrij' },
  { t: 'tf', id: 'tf14', c: ['kloro.zgradba'], s: 'The stroma is the fluid interior (matrix) of the chloroplast.', a: true, org: 'kloroplast' },
  { t: 'tf', id: 'tf15', c: ['kloro.pigment'], s: 'Chlorophyll is dissolved in the stroma.', a: false, fix: { q: 'Where is chlorophyll?', opts: ['In the thylakoid membrane', 'In the outer membrane', 'In the mitochondrial matrix'], a: 0 }, org: 'kloroplast' },
  { t: 'tf', id: 'tf16', c: ['centrioli'], s: 'Centrioles are found in all plant cells.', a: false, fix: { q: 'Where are the centrioles?', opts: ['In animal cells and only in some cells of lower plants', 'Only in bacteria', 'Only in plant cells'], a: 0 }, org: 'centrioli' },
  { t: 'tf', id: 'tf17', c: ['citoskelet.vloga'], s: 'The cytoskeleton lets the cell move and change its shape.', a: true, org: 'citoskelet' },
  { t: 'tf', id: 'tf18', c: ['migetalke'], s: 'Cilia and flagella are anchored in the cell membrane and stick out into the surroundings.', a: true, org: 'migetalke' },
  { t: 'tf', id: 'tf19', c: ['mozaik.zgradba'], s: 'According to the fluid mosaic model, membrane proteins are firmly fixed and do not move.', a: false, fix: { q: 'What does the model say?', opts: ['The lipid bilayer is fluid and proteins more or less float in it', 'The membrane is as rigid as the cell wall', 'Proteins are only on the outer side'], a: 0 }, org: 'membrana' },
  { t: 'tf', id: 'tf20', c: ['stena'], s: 'In its mature state the cell wall is a nonliving part of the cell.', a: true, org: 'stena' },
  { t: 'tf', id: 'tf21', c: ['stena'], s: 'The cell wall is beneath the cell membrane.', a: false, fix: { q: 'Where is the wall?', opts: ['On the outside of the cell membrane', 'In the cytoplasm', 'Around the nucleus'], a: 0 }, org: 'stena' },
  { t: 'tf', id: 'tf22', c: ['pe.jedro'], s: 'A prokaryotic cell has a nucleus without a nuclear envelope.', a: false, fix: { q: 'Correct it:', opts: ['A prokaryotic cell has neither a nucleus nor a nuclear envelope', 'It has a nucleus and a nuclear envelope', 'It has a nuclear envelope without a nucleus'], a: 0 } },
  { t: 'tf', id: 'tf23', c: ['pe.organeli'], s: 'Prokaryotic cells have ribosomes too.', a: true, why: 'They do, but they are smaller than in eukaryotes.' },
  { t: 'tf', id: 'tf24', c: ['teorija.tocke'], s: 'Cells contain genetic material with instructions for the growth, function and development of cells.', a: true },
  { t: 'tf', id: 'tf25', c: ['mejnik.hooke'], s: 'Robert Hooke described the structures he called cells in cork.', a: true },
  { t: 'tf', id: 'tf26', c: ['mejnik.weismann'], s: 'Weismann claimed that all cells living today come from cells of the distant past.', a: true },
  { t: 'tf', id: 'tf27', c: ['rz.oblika'], s: 'Animal cells have regular shapes.', a: false, fix: { q: 'What is true?', opts: ['Plant cells have regular shapes, animal cells do not', 'Both are always round', 'Animal cells are square'], a: 0 } },
  { t: 'tf', id: 'tf28', c: ['skrobna'], s: 'Starch grains are specialised plastids for storing starch.', a: true, org: 'skrobna' },
  { t: 'tf', id: 'tf29', c: ['svm.vijaka'], s: 'The coarse focus knob gives a rough focus.', a: true },
  { t: 'tf', id: 'tf30', c: ['er.zrnati'], s: 'The rough ER takes part in synthesising membranes for renewal.', a: true, org: 'zrnatiER' },

  // ───────── FILL IN ─────────
  { t: 'cloze', id: 'cl1', c: ['celica.def'], text: 'The cell is the basic {structural} and {functional} unit of living things.', extra: ['hereditary', 'chemical'] },
  { t: 'cloze', id: 'cl2', c: ['citoplazma.def'], text: 'Cytoplasm = {cytosol} + cell {organelles}.', extra: ['nucleus', 'vacuole'] },
  { t: 'cloze', id: 'cl3', c: ['citosol.def'], text: 'Cytosol is the {fluid} part of the cytoplasm, mostly made of {water} and the substances dissolved in it.', extra: ['solid', 'fats'] },
  { t: 'cloze', id: 'cl4', c: ['er.zgradba'], text: 'On the surface of the {rough} ER there are {ribosomes}.', extra: ['smooth', 'lysosomes'] },
  { t: 'cloze', id: 'cl5', c: ['ribosomi.zgradba'], text: 'Ribosomes are made of {RNA} and {proteins}.', extra: ['DNA', 'lipids'] },
  { t: 'cloze', id: 'cl6', c: ['golgi.vloga'], text: '{Vesicles} containing prepared substances bud off the cisternae of the Golgi apparatus.', extra: ['ribosomes', 'thylakoids'] },
  { t: 'cloze', id: 'cl7', c: ['jedro.kromatin'], text: 'DNA and {histones} form a threadlike tangle, {chromatin}. During division, extra coiling forms {chromosomes}.', extra: ['nucleolus', 'ribosomes'] },
  { t: 'cloze', id: 'cl8', c: ['jedrce'], text: 'Large and small ribosome {subunits} are made in the {nucleolus}.', extra: ['nuclear envelope', 'cisternae'] },
  { t: 'cloze', id: 'cl9', c: ['mito.zgradba'], text: 'A mitochondrion has an {outer} membrane, a {folded} inner membrane and a {matrix}.', extra: ['stroma', 'smooth'] },
  { t: 'cloze', id: 'cl10', c: ['kloro.zgradba'], text: 'Thylakoids stacked on top of each other form {grana}. The fluid interior of the chloroplast is the {stroma}.', extra: ['matrix', 'cristae'] },
  { t: 'cloze', id: 'cl11', c: ['citoskelet.zgradba'], text: 'The cytoskeleton is made of {microfilaments}, {intermediate} filaments and {microtubules}.', extra: ['thylakoids', 'histones'] },
  { t: 'cloze', id: 'cl12', c: ['mozaik.zgradba'], text: 'The membrane is a {phospholipid} {bilayer}; their {hydrophobic} tails face the inside.', extra: ['hydrophilic', 'cellulose'] },
  { t: 'cloze', id: 'cl13', c: ['stena'], text: 'The plant cell wall is made of several layers of the polysaccharide {cellulose} and protects the cell against changes in {turgor}.', extra: ['starch', 'temperature'] },
  { t: 'cloze', id: 'cl14', c: ['pe.delitev'], text: 'A eukaryotic cell divides with the help of a {spindle} ({mitosis}, {meiosis}).', extra: ['fission'] },
  { t: 'cloze', id: 'cl15', c: ['teorija.tocke'], text: 'New cells can only arise by {division} of {existing} cells.', extra: ['spontaneously', 'nonliving'] },
  { t: 'cloze', id: 'cl16', c: ['er.gladki'], text: 'Smooth ER: synthesis of {lipids} and steroids, breakdown of {toxic} substances, storage of {calcium} ions.', extra: ['proteins', 'sodium'] },
  { t: 'cloze', id: 'cl17', c: ['rz.prehrana'], text: 'Plant cells are {autotrophic}, animal cells are {heterotrophic}.', extra: ['prokaryotic'] },
  { t: 'cloze', id: 'cl18', c: ['svm.enote'], text: '1 mm = {1000} µm, 1 µm = {1000} nm.', extra: ['100', '10'] },

  // ───────── TYPE THE TERM ─────────
  { t: 'type', id: 'ty1', c: ['citosol.def'], q: 'The fluid part of the cytoplasm, mostly water and dissolved substances.', a: ['cytosol'] },
  { t: 'type', id: 'ty2', c: ['jedrce'], q: 'The area inside the nucleus where ribosome subunits are made.', a: ['nucleolus', 'nucleolus'] },
  { t: 'type', id: 'ty3', c: ['jedro.kromatin'], q: 'A threadlike tangle of DNA and histones.', a: ['chromatin'] },
  { t: 'type', id: 'ty4', c: ['jedro.kromatin'], q: 'Nuclear proteins that DNA is bound to.', a: ['histones', 'histone'] },
  { t: 'type', id: 'ty5', c: ['kloro.zgradba'], q: 'A stack of thylakoids piled on top of each other.', a: ['granum', 'grana', 'grana'] },
  { t: 'type', id: 'ty6', c: ['kloro.pigment'], q: 'The green pigment in the thylakoid membrane.', a: ['chlorophyll'] },
  { t: 'type', id: 'ty7', c: ['golgi.vloga'], q: 'Vesicles that bud off the cisternae of the Golgi apparatus.', a: ['vesicles', 'vesicle', 'vesicles'] },
  { t: 'type', id: 'ty8', c: ['lizosom'], q: 'An organelle with digestive enzymes.', a: ['lysosome', 'lysosomes'] },
  { t: 'type', id: 'ty9', c: ['mito.vloga'], q: 'The organelle where cellular respiration takes place.', a: ['mitochondrion', 'mitochondria'] },
  { t: 'type', id: 'ty10', c: ['er.gladki'], q: 'The part of the ER without ribosomes that breaks down toxic substances.', a: ['smooth er', 'smooth endoplasmic reticulum'] },
  { t: 'type', id: 'ty11', c: ['mozaik.zgradba'], q: 'The name of the currently accepted model of membrane structure.', a: ['fluid mosaic model', 'fluid mosaic'] },
  { t: 'type', id: 'ty12', c: ['membrana.vloga'], q: 'Another name for the cell membrane.', a: ['plasmalemma'] },
  { t: 'type', id: 'ty13', c: ['stena'], q: 'The polysaccharide the plant cell wall is made of.', a: ['cellulose'] },
  { t: 'type', id: 'ty14', c: ['celica.vrste'], q: 'Cells without a true nucleus.', a: ['prokaryotic', 'prokaryotic', 'prokaryotes', 'prokaryotic cells'] },
  { t: 'type', id: 'ty15', c: ['pe.delitev'], q: 'The way a prokaryotic cell divides.', a: ['fission'] },
  { t: 'type', id: 'ty16', c: ['kloro.zgradba'], q: 'The fluid interior (matrix) of the chloroplast.', a: ['stroma'] },
  { t: 'type', id: 'ty17', c: ['mejnik.hooke'], q: 'Who introduced the term cell? (surname)', a: ['hooke', 'robert hooke'] },
  { t: 'type', id: 'ty18', c: ['mejnik.virchow'], q: 'Who claimed in 1855 that new cells only arise from existing ones? (surname)', a: ['virchow', 'rudolph virchow', 'rudolf virchow'] },
  { t: 'type', id: 'ty19', c: ['teorija.spontani'], q: 'Who disproved spontaneous generation? (surname)', a: ['pasteur', 'louis pasteur'] },
  { t: 'type', id: 'ty20', c: ['skrobna'], q: 'Specialised plastids for storing starch.', a: ['starch grains', 'starch grain', 'amyloplasts', 'amyloplast'] },
  { t: 'type', id: 'ty21', c: ['citoskelet.zgradba'], q: 'The thickest tubes of the cytoskeleton, which cilia are also made of.', a: ['microtubules', 'microtubule'] },
  { t: 'type', id: 'ty22', c: ['svm.vijaka'], q: 'The knob for fine focusing the image on a microscope.', a: ['fine focus knob', 'fine focus'] },

  // ───────── VSILJIVEC ─────────
  { t: 'odd', id: 'od1', c: ['pe.organeli'], q: 'What does a prokaryotic cell NOT have? Three share the same property, one does not.', items: ['Mitochondrion', 'Golgi apparatus', 'Ribosomes', 'Endoplasmic reticulum'], a: 2, why: 'Prokaryotes also have ribosomes (smaller ones). They have no ER, Golgi apparatus or mitochondria.' },
  { t: 'odd', id: 'od2', c: ['citoskelet.zgradba'], q: 'What does not belong to the cytoskeleton?', items: ['Microtubules', 'Microfilaments', 'Chromatin', 'Intermediate filaments'], a: 2, why: 'Chromatin is the tangle of DNA and histones in the nucleus.' },
  { t: 'odd', id: 'od3', c: ['rz.razlike'], q: 'What is not true of a plant cell?', items: ['Cellulose wall', 'Chloroplasts', 'Heterotrophy', 'Large vacuole'], a: 2, why: 'Plant cells are autotrophic. Animal cells are heterotrophic.' },
  { t: 'odd', id: 'od4', c: ['kloro.zgradba'], q: 'What is not part of the chloroplast?', items: ['Thylakoid', 'Granum', 'Stroma', 'Nucleolus'], a: 3, why: 'The nucleolus is in the nucleus.' },
  { t: 'odd', id: 'od5', c: ['mito.zgradba'], q: 'What is not part of the mitochondrion?', items: ['Matrix', 'Folded inner membrane', 'Granum', 'Circular DNA'], a: 2, why: 'A granum is a stack of thylakoids in the chloroplast.' },
  { t: 'odd', id: 'od6', c: ['er.gladki'], q: 'What is not a role of the smooth ER?', items: ['Lipid synthesis', 'Breaking down alcohol', 'Making proteins for secretion', 'Storing calcium ions'], a: 2, why: 'Proteins for secretion are made on the rough ER.' },
  { t: 'odd', id: 'od7', c: ['mejnik.schleiden', 'mejnik.virchow'], q: 'Who is NOT among the milestones of cell biology on the textbook sheet?', items: ['Schwann', 'Virchow', 'Schleiden', 'Pasteur'], a: 3, why: 'Pasteur is in your answer on the sheet (he disproved spontaneous generation), but the milestones are Schleiden, Schwann and Virchow.' },
  { t: 'odd', id: 'od8', c: ['jedro.ovoj'], q: 'What does not belong to the nucleus?', items: ['Nuclear envelope', 'Pores', 'Chromatin', 'Thylakoids'], a: 3, why: 'Thylakoids are in the chloroplast.' },
  { t: 'odd', id: 'od9', c: ['membrana.vloga', 'mozaik.zgradba'], q: 'What is not true of the cell membrane?', items: ['It is semipermeable', 'It is made of cellulose', 'It gives shape and protection', 'It is a phospholipid bilayer'], a: 1, why: 'The plant cell wall is made of cellulose, not the membrane.' },
  { t: 'odd', id: 'od10', c: ['svm.deli'], q: 'What is not part of a light microscope?', items: ['Revolving nosepiece', 'Eyepiece', 'Electron gun', 'Stage'], a: 2, why: 'The electron gun is part of an electron microscope (TEM).' },

  // ───────── FIND THE MISTAKE ─────────
  // [wrong|right] marks the wrong word and the correct replacement
  { t: 'fix', id: 'fx1', c: ['er.zrnati'], text: 'Proteins the cell secretes are made on the [smooth|rough] ER.', opts: ['rough', 'nuclear', 'cell'] },
  { t: 'fix', id: 'fx2', c: ['jedrce'], text: 'Large and small ribosome subunits are made in the [lysosome|nucleolus].', opts: ['nucleolus', 'matrix', 'cytosol'] },
  { t: 'fix', id: 'fx3', c: ['mito.zgradba'], text: 'A mitochondrion has an outer membrane and a [smooth|folded] inner membrane.', opts: ['folded', 'cellulose', 'rough'] },
  { t: 'fix', id: 'fx4', c: ['golgi.vloga'], text: '[Ribosomes|Vesicles] containing prepared substances bud off the cisternae of the Golgi apparatus.', opts: ['vesicles', 'chromosomes', 'thylakoids'] },
  { t: 'fix', id: 'fx5', c: ['stena'], text: 'The plant cell wall is made of several layers of [starch|cellulose].', opts: ['cellulose', 'phospholipid', 'proteins'] },
  { t: 'fix', id: 'fx6', c: ['mozaik.zgradba'], text: 'In the fluid mosaic model the [hydrophilic|hydrophobic] tails of phospholipids face the inside of the bilayer.', opts: ['hydrophobic', 'cellulose', 'protein'] },
  { t: 'fix', id: 'fx7', c: ['pe.dedni'], text: 'A prokaryotic cell has one [linear|circular] DNA molecule that is not bound to proteins.', opts: ['circular', 'nuclear', 'double'] },
  { t: 'fix', id: 'fx8', c: ['mejnik.virchow'], text: 'In 1855 [Hooke|Virchow] claimed that new cells only arise by division of existing cells.', opts: ['Virchow', 'Weismann', 'Schwann'] },
  { t: 'fix', id: 'fx9', c: ['centrioli'], text: 'Centrioles are in the cytoplasm near the [wall|nucleus] and take part in cell division.', opts: ['nucleus', 'vacuoles', 'membranes'] },
  { t: 'fix', id: 'fx10', c: ['vakuola.rastl'], text: 'The vacuole in a plant cell stores water and substances and gives the cell [energy|support].', opts: ['support', 'genetic code', 'enzymes'] },
  { t: 'fix', id: 'fx11', c: ['mikro.tem'], text: 'TEM uses the short wavelength of accelerated [photons|electrons].', opts: ['electrons', 'protons', 'ions'] },
  { t: 'fix', id: 'fx12', c: ['kloro.zgradba'], text: 'The thylakoid membrane of the chloroplast comes from the [outer|inner] membrane.', opts: ['inner', 'cell', 'nuclear'] },

  // ───────── MATCH PAIRS (hand written) ─────────
  { t: 'match', id: 'ma1', c: ['mejnik.hooke', 'mejnik.virchow', 'mejnik.weismann', 'mejnik.leeuwenhoek'], q: 'Match the scientist with the discovery.', pairs: [['Hooke', 'the term cell (cork)'], ['Leeuwenhoek', 'discovered bacteria and blood cells'], ['Virchow', 'cells only from existing cells'], ['Weismann', 'link to evolution']] },
  { t: 'match', id: 'ma2', c: ['citoskelet.zgradba', 'migetalke', 'kloro.zgradba', 'jedro.kromatin'], q: 'Match the structure with what it is made of.', pairs: [['Cilia', 'microtubules'], ['Granum', 'thylakoids'], ['Chromatin', 'DNA and histones'], ['Ribosome', 'RNA and proteins']] },
  { t: 'match', id: 'ma3', c: ['mikro.tem', 'mejnik.janssen', 'mejnik.leeuwenhoek'], q: 'Match the microscope with its feature.', pairs: [['Janssen', 'first compound, three tubes'], ['Leeuwenhoek', 'one lens, up to 270 times'], ['TEM', 'electrons through the specimen'], ['SEM', 'surface of objects']] },

  // ───────── SORT ─────────
  { t: 'sort', id: 'so1', c: ['pe.organeli', 'pe.jedro'], q: 'Which cell has what?', bins: ['Eukaryotic only', 'Both'], items: [['Mitochondrion', 0], ['Ribosomes', 1], ['Nuclear envelope', 0], ['Cell membrane', 1], ['Golgi apparatus', 0], ['DNA', 1], ['ER', 0], ['Cytoplasm', 1]] },
  { t: 'sort', id: 'so2', c: ['rz.razlike'], q: 'Plant or animal cell?', bins: ['Plant', 'Animal'], items: [['cellulose cell wall', 0], ['heterotrophic', 1], ['chloroplasts', 0], ['vacuoles only in some cells', 1], ['regular shape', 0], ['no regular shape', 1], ['autotrophic', 0], ['centrioles', 1]] },
  { t: 'sort', id: 'so3', c: ['er.zrnati', 'er.gladki'], q: 'Rough or smooth ER?', bins: ['Rough ER', 'Smooth ER'], items: [['ribosomes on the surface', 0], ['lipid synthesis', 1], ['proteins for secretion', 0], ['breakdown of alcohol', 1], ['membrane synthesis for renewal', 0], ['storing calcium ions', 1], ['steroids', 1]] },
  { t: 'sort', id: 'so4', c: ['pe.dedni', 'pe.delitev', 'pe.velikost'], q: 'Prokaryotic or eukaryotic?', bins: ['Prokaryotic', 'Eukaryotic'], items: [['0.5 to 8 µm', 0], ['10 to 100 µm', 1], ['circular DNA', 0], ['linear DNA with proteins', 1], ['fission', 0], ['mitosis and meiosis', 1], ['bacteria', 0], ['fungi', 1]] },
  { t: 'sort', id: 'so5', c: ['mito.zgradba', 'kloro.zgradba'], q: 'Mitochondrion or chloroplast?', bins: ['Mitochondrion', 'Chloroplast', 'Both'], items: [['folded inner membrane', 0], ['thylakoids', 1], ['two membranes', 2], ['own DNA and ribosomes', 2], ['chlorophyll', 1], ['ATP production', 0], ['stroma', 1], ['matrix', 0]] },
  { t: 'sort', id: 'so6', c: ['jedro.ovoj', 'jedrce', 'jedro.kromatin', 'golgi.zgradba'], q: 'In the nucleus or in the cytoplasm?', bins: ['In the nucleus', 'In the cytoplasm'], items: [['nucleolus', 0], ['chromatin', 0], ['Golgi apparatus', 1], ['mitochondrion', 1], ['most of the DNA', 0], ['lysosome', 1], ['centrioles', 1]] },

  // ───────── ORDER ─────────
  { t: 'order', id: 'or1', c: ['mejnik.janssen', 'mejnik.hooke', 'mejnik.schleiden', 'mejnik.virchow', 'mejnik.weismann'], q: 'Order the milestones from the oldest.', items: ['Janssen: first compound microscope', 'Hooke: the term cell, Micrographia', 'Schleiden and Schwann: cell theory', 'Virchow: cells only from cells', 'Weismann: link to evolution', 'Ruska: TEM'], why: '1595, 1665, 1838/39, 1855, 1880, 1938.' },
  { t: 'order', id: 'or2', c: ['mikro.tem.deli'], q: 'Order the parts of a TEM from the top of the column down (the path of the electrons).', items: ['electron gun', 'condenser lenses', 'specimen', 'objective lenses', 'projector lenses', 'screen or camera'] },
  { t: 'order', id: 'or3', c: ['er.zrnati', 'golgi.vloga', 'ribosomi.vloga'], q: 'The path of a protein the cell secretes. Put the steps in order.', items: ['DNA in the nucleus carries the code for the protein', 'a ribosome on the rough ER synthesises the protein', 'the protein travels in a vesicle to the Golgi apparatus', 'the Golgi apparatus prepares the product', 'a vesicle buds off and travels to the membrane', 'the cell secretes the substance'] },
  { t: 'order', id: 'or4', c: ['pe.velikost', 'svm.enote'], q: 'Order from the smallest to the largest.', items: ['ribosome (a few 10 nm)', 'bacterium (0.5 to 8 µm)', 'animal cell (10 to 100 µm)', '1 mm'] },
  { t: 'order', id: 'or5', c: ['jedro.kromatin'], q: 'From DNA to a chromosome. Put in order.', items: ['DNA molecule', 'DNA binds to histones', 'threadlike tangle: chromatin', 'extra coiling during division', 'chromosome'] },
]
