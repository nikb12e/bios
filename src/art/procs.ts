/* Seznam animiranih razlag (brez three.js, da je seznam na voljo povsod brez nalaganja 3D). */

import type { ShapeKind } from '../ui/flux'
import type { OrgId } from '../data/organelles'

type Tone = 't-coral' | 't-amber' | 't-green' | 't-pink' | 't-sky' | 't-violet'

export type ProcId = 'protein' | 'dihanje' | 'fotosinteza' | 'prebava' | 'turgor' | 'migetalke'

export interface ProcMeta { id: ProcId; name: string; sub: string; kind: 'animal' | 'plant'; tone: Tone; shape: ShapeKind; color: string; org: OrgId }
export const PROCS: ProcMeta[] = [
  { id: 'protein', name: 'Pot beljakovine', sub: 'Od DNK v jedru do izločanja iz celice', kind: 'animal', tone: 't-coral', shape: 'flower', color: 'var(--coral)', org: 'golgi' },
  { id: 'dihanje', name: 'Celično dihanje', sub: 'Mitohondrij in nastanek ATP', kind: 'animal', tone: 't-amber', shape: 'sunny', color: 'var(--amber)', org: 'mitohondrij' },
  { id: 'fotosinteza', name: 'Fotosinteza', sub: 'Kloroplast, svetloba in škrob', kind: 'plant', tone: 't-green', shape: 'clover', color: 'var(--green)', org: 'kloroplast' },
  { id: 'prebava', name: 'Celična prebava', sub: 'Lizosom razgradi snov', kind: 'animal', tone: 't-pink', shape: 'blob', color: 'var(--pink)', org: 'lizosom' },
  { id: 'turgor', name: 'Vakuola in turgor', sub: 'Voda, opora in venenje rastline', kind: 'plant', tone: 't-sky', shape: 'cookie', color: 'var(--sky)', org: 'vakuola' },
  { id: 'migetalke', name: 'Migetalke', sub: 'Usklajeno utripanje in gibanje', kind: 'animal', tone: 't-violet', shape: 'gem', color: 'var(--violet)', org: 'migetalke' },
]

/** besedilo korakov; d = vsebina presega zapiske (prikaže se oznaka »Dodatna razlaga«) */
export interface StepText { title: string; text: string; d?: boolean }
export const PROC_TEXT: Record<ProcId, StepText[]> = {
  protein: [
    { title: 'Zapis v jedru', text: 'DNK v jedru nosi dedni zapis za beljakovino. Prepis zapisa pride skozi pore jedrnega ovoja do ribosomov.', d: true },
    { title: 'Ribosomi na zrnatem ER', text: 'Ribosomi na zrnatem ER sintetizirajo beljakovino, ki jo bo celica izločila. Veriga vstopa v notranjost ER.', d: true },
    { title: 'Mehurček do GA', text: 'Beljakovina v mehurčku (veziklu) potuje do Golgijevega aparata.' },
    { title: 'Golgijev aparat', text: 'Golgijev aparat pripravi produkt, ki ga celica izloča. Snov potuje skozi cisterne, ki ležijo ena na drugi.' },
    { title: 'Odcepi se mehurček', text: 'Od cistern na robovih zunanjega dela se odcepi mehurček (vezikel) s to snovjo in potuje do celične membrane.' },
    { title: 'Izločanje', text: 'Mehurček se zlije s celično membrano in celica snov izloči. Tako GA prispeva tudi membrano za obnavljanje celične membrane.' },
  ],
  dihanje: [
    { title: 'Zgradba', text: 'Mitohondrij ima zunanjo membrano, notranjo nagubano membrano in matriks s krožnimi molekulami DNK in ribosomi.' },
    { title: 'Vstop snovi', text: 'V mitohondriju poteka celično dihanje. Vanj vstopajo hranilne snovi (npr. glukoza) in kisik.', d: true },
    { title: 'Nastanek ATP', text: 'Pri celičnem dihanju nastaja ATP, oblika energije, ki jo celica lahko porabi. Večina ga nastane ob notranji nagubani membrani.', d: true },
    { title: 'Energija za celico', text: 'ATP potuje po celici in daje energijo za njeno delo. Celice, ki porabijo veliko energije (npr. mišične), imajo več mitohondrijev.', d: true },
  ],
  fotosinteza: [
    { title: 'Zgradba', text: 'Kloroplast obdajata zunanja in notranja membrana. V stromi so tilakoide, nanizane ena nad drugo v granume.' },
    { title: 'Svetloba', text: 'V kloroplastih poteka fotosinteza. Zeleno barvilo klorofil v tilakoidni membrani ujame svetlobo.' },
    { title: 'Sladkor in kisik', text: 'Iz ogljikovega dioksida in vode s pomočjo svetlobe nastane sladkor (glukoza). Sprosti se kisik.', d: true },
    { title: 'Shranjevanje škroba', text: 'Del sladkorja celica shrani kot škrob v škrobnih zrnih, specializiranih plastidih za shranjevanje škroba.' },
  ],
  prebava: [
    { title: 'Snov v mehurčku', text: 'Celica snov (npr. delec hrane) obda s celično membrano in jo v mehurčku prenese v notranjost.', d: true },
    { title: 'Lizosom', text: 'Lizosom vsebuje prebavne encime in je prosto v citoplazmi. Pripotuje do mehurčka in se z njim zlije.', d: true },
    { title: 'Razgradnja', text: 'Prebavni encimi razgradijo snov na manjše dele. To je celična prebava.' },
    { title: 'Uporabni deli', text: 'Uporabne snovi preidejo v citoplazmo. Pri nekaterih rastlinskih celicah vlogo lizosomov prevzame vakuola.', d: true },
  ],
  turgor: [
    { title: 'Osrednja vakuola', text: 'V rastlinski celici je navadno ena velika vakuola. Shranjuje vodo in snovi, nastale v celici (npr. barvila).' },
    { title: 'Voda vstopa', text: 'Voda vstopa v celico in v vakuolo, ki se napolni in nabrekne.', d: true },
    { title: 'Turgor', text: 'Polna vakuola pritiska na celično steno in daje celici oporo. Ta pritisk je turgor, trdna celulozna stena ga zdrži.', d: true },
    { title: 'Venenje', text: 'Ko vode zmanjka, vakuola splahni, celica izgubi oporo in rastlina oveni. Ko dobi vodo, se turgor povrne.', d: true },
  ],
  migetalke: [
    { title: 'Zgradba', text: 'Migetalke so iz mikrotubulov, zasidrane so v celični membrani in štrlijo v okolico.' },
    { title: 'Utripanje', text: 'Migetalke utripajo usklajeno, ena za drugo v valu, podobno kot vesla.', d: true },
    { title: 'Gibanje', text: 'Omogočajo premikanje celice. Pritrjene celice z njimi premikajo tekočino ob sebi (npr. sluz v dihalih).', d: true },
  ],
}

