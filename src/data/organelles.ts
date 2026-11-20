// Organeli in deli celice. Besedila so iz zapiskov Celica.pdf (strani 3 do 13).
// "pazi" so pogoste zamenjave (tudi Nikove šibke točke iz preteklih ur).

export type OrgId =
  | 'membrana' | 'citoplazma' | 'jedro' | 'jedrce' | 'zrnatiER' | 'gladkiER' | 'ribosomi'
  | 'golgi' | 'mitohondrij' | 'kloroplast' | 'vakuola' | 'lizosom' | 'centrioli'
  | 'citoskelet' | 'migetalke' | 'stena' | 'skrobna'

export type Presence = { zival: boolean | 'nekatere'; rastl: boolean | 'nekatere'; prok: boolean }

export interface Organelle {
  id: OrgId
  name: string
  aliases: string[]
  short: string // ena vrstica
  mesto?: string
  zgradba?: string
  vloga: string
  pazi?: string
  presence: Presence
  page: number // stran v zapiskih
  detail?: DetailId
  concepts: string[]
}

export type DetailId =
  | 'mitohondrij' | 'kloroplast' | 'jedro' | 'er' | 'golgi' | 'membrana' | 'citoskelet'
  | 'ribosom' | 'prokariont' | 'svetlobni' | 'tem' | 'migetalke' | 'stena' | 'lizosom' | 'vakuola' | 'centrioli'

export const ORGANELLES: Organelle[] = [
  {
    id: 'membrana', name: 'Celična membrana', aliases: ['plazmalema', 'membrana', 'celicna membrana', 'biotska membrana'],
    short: 'Obdaja celico in nadzoruje prehajanje snovi.',
    mesto: 'Obdaja celico.',
    zgradba: 'Model tekočega mozaika: dvosloj fosfolipidov, hidrofobni repi so obrnjeni v notranjost dvosloja; proteini v tekočem lipidnem dvosloju nekako plavajo.',
    vloga: 'Celici daje obliko in zaščito, nadzoruje prehajanje snovi v celico in iz nje (polprepustna).',
    pazi: 'Celična membrana obdaja celo celico. Jedrni ovoj (dve membrani) obdaja samo jedro. Ne zamenjuj ju.',
    presence: { zival: true, rastl: true, prok: true }, page: 11, detail: 'membrana',
    concepts: ['membrana.vloga', 'mozaik.zgradba', 'mozaik.proteini'],
  },
  {
    id: 'citoplazma', name: 'Citoplazma', aliases: ['citosol'],
    short: 'Citosol skupaj s celičnimi organeli.',
    zgradba: 'Citoplazma = citosol + celični organeli. Citosol je tekoči del citoplazme, pretežno iz vode in v njej raztopljenih snovi (beljakovin, maščob, soli ...).',
    vloga: 'Prostor, v katerem so organeli; citosol je njen tekoči del.',
    pazi: 'Citosol ni isto kot citoplazma. Citosol je le tekoči del, citoplazma pa citosol in organeli skupaj. Ne piši "organeli plavajo", ampak "citoplazmo sestavljata citosol in organeli".',
    presence: { zival: true, rastl: true, prok: true }, page: 3,
    concepts: ['citoplazma.def', 'citosol.def'],
  },
  {
    id: 'jedro', name: 'Jedro', aliases: ['nukleus'],
    short: 'Hrani večino DNK z zapisom za beljakovine.',
    mesto: 'Samostojen organel, mesto se spreminja.',
    zgradba: 'Obdano z jedrnim ovojem iz dveh membran, na površini so pritrjeni ribosomi. Notranjost jedra in citoplazma sta povezani s porami v jedrnem ovoju.',
    vloga: 'V jedru je večina DNK. DNK je povezana z jedrnimi beljakovinami histoni, skupaj tvorita nitast preplet kromatin. Med delitvijo se iz kromatina z dodatnim zvijanjem izoblikujejo kromosomi. DNK nosi dedni zapis za beljakovine, od katerega so odvisne lastnosti celice in živega bitja.',
    pazi: 'Jedrni ovoj (dve membrani s porami) ni celična membrana.',
    presence: { zival: true, rastl: true, prok: false }, page: 8, detail: 'jedro',
    concepts: ['jedro.ovoj', 'jedro.mesto', 'jedro.kromatin', 'jedro.zapis'],
  },
  {
    id: 'jedrce', name: 'Jedrce', aliases: ['nukleolus'],
    short: 'Tu nastajajo podenote ribosomov.',
    mesto: 'Znotraj jedra.',
    vloga: 'Področje znotraj jedra, v katerem nastajajo večje in manjše podenote ribosomov.',
    pazi: 'Jedrce ni obdano z membrano in ni "manjše jedro". Je področje v jedru.',
    presence: { zival: true, rastl: true, prok: false }, page: 8, detail: 'jedro',
    concepts: ['jedrce'],
  },
  {
    id: 'zrnatiER', name: 'Zrnati ER', aliases: ['zrnati endoplazemski retikulum', 'hrapavi er', 'grobi er'],
    short: 'ER z ribosomi na površju.',
    mesto: 'Splet membranskih prostorov v citoplazmi, na površju so ribosomi.',
    zgradba: 'Splet različno oblikovanih prostorov, obdanih z membranami: cevasti ali sploščene mehurjaste tvorbe (cisterne). Na površju so ribosomi.',
    vloga: 'Nastanek beljakovin, ki jih celica izloči; sinteza membran (za obnovo).',
    pazi: 'Zrnat je zaradi ribosomov na površju. Gladki ER ribosomov nima in ima druge vloge.',
    presence: { zival: true, rastl: true, prok: false }, page: 5, detail: 'er',
    concepts: ['er.zgradba', 'er.zrnati'],
  },
  {
    id: 'gladkiER', name: 'Gladki ER', aliases: ['gladki endoplazemski retikulum'],
    short: 'ER brez ribosomov: lipidi, strupi, kalcij.',
    mesto: 'Splet membranskih cevk v citoplazmi, brez ribosomov.',
    vloga: 'Sinteza lipidov in steroidov; razgradnja strupenih snovi (npr. alkohola); kopičenje kalcijevih ionov (pomembni pri prenosu signalov in krčenju mišic).',
    pazi: 'Beljakovine za izločanje nastajajo na zrnatem ER, ne na gladkem.',
    presence: { zival: true, rastl: true, prok: false }, page: 5, detail: 'er',
    concepts: ['er.zgradba', 'er.gladki'],
  },
  {
    id: 'ribosomi', name: 'Ribosomi', aliases: ['ribosom'],
    short: 'Sinteza beljakovin.',
    mesto: 'Prosti v citoplazmi ali vezani na ER.',
    zgradba: 'Iz ribonukleinske kisline (RNK) in beljakovin. Dve podenoti: večja in manjša.',
    vloga: 'Sinteza beljakovin.',
    pazi: 'V zapiskih so med organeli, vendar ribosomi nimajo membrane. Pri prokariontih so manjši, pri evkariontih večji.',
    presence: { zival: true, rastl: true, prok: true }, page: 6, detail: 'ribosom',
    concepts: ['ribosomi.zgradba', 'ribosomi.mesto', 'ribosomi.vloga'],
  },
  {
    id: 'golgi', name: 'Golgijev aparat', aliases: ['ga', 'golgi', 'golgijev', 'golgijevo telo'],
    short: 'Pripravi produkte za izločanje in membrane.',
    zgradba: 'Membrane tvorijo sploščene cisterne, ki ležijo ena na drugi.',
    vloga: 'Priprava produktov, ki jih celica izloča, ter priprava membran za obnavljanje celične membrane. Od cistern na robovih zunanjega dela se odcepljajo mehurčki (vezikli), ki vsebujejo te snovi.',
    pazi: 'Ne piši samo "presortira" ali "zapakira". Pravilno: pripravi produkte, ki jih celica izloča, in membrane za obnovo celične membrane; snovi odnašajo mehurčki (vezikli).',
    presence: { zival: true, rastl: true, prok: false }, page: 6, detail: 'golgi',
    concepts: ['golgi.zgradba', 'golgi.vloga'],
  },
  {
    id: 'mitohondrij', name: 'Mitohondrij', aliases: ['mitohondriji'],
    short: 'Celično dihanje, nastanek ATP.',
    mesto: 'V citoplazmi kot samostojni organeli.',
    zgradba: 'Zunanja membrana, notranja nagubana membrana in matriks; v matriksu so krožne molekule DNK in ribosomi.',
    vloga: 'Celično dihanje (nastanek ATP, energija).',
    pazi: 'Ima dve membrani in svojo krožno DNK. Notranja membrana je nagubana.',
    presence: { zival: true, rastl: true, prok: false }, page: 9, detail: 'mitohondrij',
    concepts: ['mito.zgradba', 'mito.vloga'],
  },
  {
    id: 'kloroplast', name: 'Kloroplast', aliases: ['kloroplasti', 'plastid', 'plastidi'],
    short: 'Plastid, v katerem poteka fotosinteza.',
    mesto: 'V citoplazmi rastlinskih celic.',
    zgradba: 'Obdajata ga dve membrani (zunanja in notranja). V notranjosti je stroma (matriks), v katero se zajeda tilakoidna membrana (izvira iz notranje membrane) in tvori sploščene tvorbe tilakoide. Tilakoide, nanizane ena nad drugo, tvorijo granume. V tilakoidni membrani so pigmenti, zlasti klorofil. Ima kloroplastno DNK in ribosome.',
    vloga: 'Fotosinteza. Je najpomembnejša vrsta plastidov; plastidi so značilni za rastlinske celice in so po zgradbi podobni mitohondrijem.',
    pazi: 'Granum je kup tilakoid, ne posamezna tilakoida. Klorofil je v tilakoidni membrani, ne v stromi.',
    presence: { zival: false, rastl: true, prok: false }, page: 9, detail: 'kloroplast',
    concepts: ['plastidi.def', 'kloro.zgradba', 'kloro.pigment'],
  },
  {
    id: 'vakuola', name: 'Vakuola', aliases: ['vakuole'],
    short: 'Shranjuje vodo in snovi; v rastlini daje oporo.',
    mesto: 'V citoplazmi.',
    vloga: 'V rastlinski celici je navadno ena velika vakuola: shranjuje nekatere snovi, nastale v celici (npr. barvila), in vodo ter daje celici oporo. V živalski celici je vakuol več, so manjše (mehurčki) in shranjujejo vodo, odpadne snovi in vodotopna barvila.',
    pazi: 'Pri nekaterih rastlinskih celicah vakuola prevzame vlogo lizosomov.',
    presence: { zival: 'nekatere', rastl: true, prok: false }, page: 7, detail: 'vakuola',
    concepts: ['vakuola.rastl', 'vakuola.zival'],
  },
  {
    id: 'lizosom', name: 'Lizosom', aliases: ['lizosomi'],
    short: 'Prebavni encimi, celična prebava.',
    mesto: 'Prosto v citoplazmi.',
    zgradba: 'Organel, ki vsebuje prebavne encime.',
    vloga: 'Omogoča razgradnjo snovi; sodeluje pri celični prebavi. Pri nekaterih rastlinskih celicah njegovo vlogo prevzame vakuola.',
    presence: { zival: true, rastl: 'nekatere', prok: false }, page: 7, detail: 'lizosom',
    concepts: ['lizosom'],
  },
  {
    id: 'centrioli', name: 'Centrioli', aliases: ['centriol'],
    short: 'Sodelujejo pri celični delitvi.',
    mesto: 'V citoplazmi, v bližini jedra.',
    vloga: 'Vpleteni v celično delitev. Prisotni v živalskih celicah in le v nekaterih rastlinskih celicah nižjih ravni.',
    presence: { zival: true, rastl: 'nekatere', prok: false }, page: 10, detail: 'centrioli',
    concepts: ['centrioli'],
  },
  {
    id: 'citoskelet', name: 'Celično ogrodje', aliases: ['citoskelet', 'celicno ogrodje', 'ogrodje'],
    short: 'Beljakovinske nitke in cevke za obliko in gibanje.',
    mesto: 'V citoplazmi.',
    zgradba: 'Preplet beljakovin, ki tvorijo nitke ali cevke: mikrofilamenti, intermediarni filamenti, mikrotubuli.',
    vloga: 'Vzdržuje obliko celice, je opora organelom in določa njihov položaj, omogoča premikanje celice in spreminjanje njene oblike.',
    presence: { zival: true, rastl: true, prok: false }, page: 10, detail: 'citoskelet',
    concepts: ['citoskelet.zgradba', 'citoskelet.vloga'],
  },
  {
    id: 'migetalke', name: 'Migetalke in bički', aliases: ['migetalke', 'bicki', 'biček', 'bicek', 'migetalka'],
    short: 'Iz mikrotubulov, premikajo celico.',
    mesto: 'Zasidrani v celični membrani in štrlijo v okolico.',
    zgradba: 'Iz mikrotubulov.',
    vloga: 'Premikanje celice. Prisotni pri živalskih celicah in le pri nekaterih rastlinskih (nekaterih enoceličnih algah) celicah.',
    presence: { zival: 'nekatere', rastl: 'nekatere', prok: false }, page: 11, detail: 'migetalke',
    concepts: ['migetalke'],
  },
  {
    id: 'stena', name: 'Celična stena', aliases: ['stena', 'celulozna stena'],
    short: 'Celulozna opora zunaj membrane.',
    mesto: 'Obdaja celico z zunanje strani celične membrane.',
    zgradba: 'Pri rastlinski celici iz več plasti polisaharida celuloze.',
    vloga: 'Je izloček celice in v odraslem stanju neživi del celice. Celici daje trdnost in jo ščiti pred spremembami turgorja. Pri živalskih celicah ni prisotna.',
    pazi: 'Stena je zunaj celične membrane, membrana je še vedno prisotna.',
    presence: { zival: false, rastl: true, prok: true }, page: 12, detail: 'stena',
    concepts: ['stena'],
  },
  {
    id: 'skrobna', name: 'Škrobna zrna', aliases: ['skrobna zrna', 'škrobno zrno', 'amiloplast'],
    short: 'Plastidi za shranjevanje škroba.',
    vloga: 'Specializirani plastidi za shranjevanje škroba.',
    presence: { zival: false, rastl: true, prok: false }, page: 10,
    concepts: ['skrobna'],
  },
]

export const ORG: Record<OrgId, Organelle> = Object.fromEntries(ORGANELLES.map(o => [o.id, o])) as Record<OrgId, Organelle>

// Kateri organeli so narisani na kateri celici (interaktivne slike).
export const ON_ANIMAL: OrgId[] = ['membrana', 'citoplazma', 'jedro', 'jedrce', 'zrnatiER', 'gladkiER', 'ribosomi', 'golgi', 'mitohondrij', 'vakuola', 'lizosom', 'centrioli', 'citoskelet', 'migetalke']
export const ON_PLANT: OrgId[] = ['stena', 'membrana', 'citoplazma', 'jedro', 'jedrce', 'zrnatiER', 'gladkiER', 'ribosomi', 'golgi', 'mitohondrij', 'kloroplast', 'vakuola', 'skrobna', 'citoskelet']
