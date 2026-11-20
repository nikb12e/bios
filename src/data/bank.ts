// Ročno napisane naloge. Vse temeljijo na zapiskih Celica.pdf (in pri mikroskopu na prejšnjih urah).
// Distraktorji so namenoma prepričljivi in izhajajo iz pogostih zamenjav.

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
  mc: { name: 'Izbira', tier: 1, desc: 'Ena pravilna med štirimi' },
  tf: { name: 'Drži ali ne drži', tier: 1, desc: 'Če ne drži, še popraviš' },
  locate: { name: 'Pokaži na celici', tier: 1, desc: 'Tapni pravi organel' },
  identify: { name: 'Kaj je označeno', tier: 1, desc: 'Prepoznaj organel na sliki' },
  match: { name: 'Poveži pare', tier: 1, desc: 'Organel in njegova vloga' },
  sort: { name: 'Razvrsti', tier: 1, desc: 'Razporedi v skupine' },
  recall: { name: 'Spomni se', tier: 1, desc: 'Kartica s samooceno' },
  cloze: { name: 'Dopolni', tier: 2, desc: 'Vstavi manjkajoče pojme' },
  odd: { name: 'Vsiljivec', tier: 2, desc: 'Kaj ne spada zraven in zakaj' },
  fix: { name: 'Najdi napako', tier: 2, desc: 'Ena beseda v povedi je napačna' },
  order: { name: 'Vrstni red', tier: 2, desc: 'Razvrsti po času ali poteku' },
  labels: { name: 'Označi sliko', tier: 2, desc: 'Postavi oznake na prave dele' },
  table: { name: 'Primerjalna tabela', tier: 2, desc: 'Prokariontska proti evkariontski' },
  scale: { name: 'Velikost in povečava', tier: 2, desc: 'Mikrometri, nanometri, povečava' },
  type: { name: 'Vpiši pojem', tier: 3, desc: 'Iz opisa napiši strokovni izraz' },
  explain: { name: 'Razloži', tier: 3, desc: 'S svojimi besedami, oceni AI' },
}

export const BANK: Task[] = [
  // ───────── IZBIRA ─────────
  { t: 'mc', id: 'mc1', c: ['celica.def'], q: 'Celica je osnovna ...', opts: ['gradbena in dejavna enota živih bitij', 'enota dedovanja, ki nosi dedni zapis', 'gradbena enota, ki je ni pri bakterijah', 'kemijska spojina, iz katere so zgrajeni organeli'], a: 0 },
  { t: 'mc', id: 'mc2', c: ['celica.delitev'], q: 'Kaj omogoča delitev celic?', opts: ['Prenos dednih informacij iz materinske v hčerinsko celico', 'Nastanek novih organelov iz citosola', 'Pretvorbo energije v mitohondriju', 'Spontani nastanek živih bitij'], a: 0 },
  { t: 'mc', id: 'mc3', c: ['celica.vrste'], q: 'Katera živa bitja imajo prokariontske celice?', opts: ['Bakterije', 'Glive', 'Rastline', 'Praživali'], a: 0, why: 'Prokariontske (predjedrne) celice imajo bakterije. Glive, rastline in živali imajo evkariontske celice.' },
  { t: 'mc', id: 'mc4', c: ['pe.velikost'], q: 'Kolikšna je večinoma velikost evkariontske celice?', opts: ['10 do 100 µm', '0,5 do 8 µm', '1 do 10 nm', '1 do 10 mm'], a: 0, why: 'Prokarionti: 0,5 do 8 µm. Evkarionti: 10 do 100 µm.' },
  { t: 'mc', id: 'mc5', c: ['pe.dedni'], q: 'Kakšen je dedni zapis prokariontske celice?', opts: ['Ena krožna DNK, ki ni povezana z beljakovinami', 'Številne linearne DNK, povezane z beljakovinami', 'Ena linearna DNK v jedru', 'Krožna DNK, ovita okrog histonov v jedru'], a: 0 },
  { t: 'mc', id: 'mc6', c: ['pe.delitev'], q: 'Kako se deli prokariontska celica?', opts: ['S cepitvijo, brez delitvenega vretena', 'Z mitozo, z delitvenim vretenom', 'Z mejozo', 'Ne deli se'], a: 0 },
  { t: 'mc', id: 'mc7', c: ['pe.organeli'], q: 'Kaj ima prokariontska celica?', opts: ['Manjše ribosome', 'Mitohondrije', 'Golgijev aparat', 'Jedrni ovoj'], a: 0, why: 'Prokarionti imajo le manjše ribosome; ER, GA, mitohondrijev in jedrnega ovoja nimajo.' },
  { t: 'mc', id: 'mc8', c: ['citoplazma.def'], q: 'Iz česa je citoplazma?', opts: ['Iz citosola in celičnih organelov', 'Samo iz citosola', 'Iz citosola in jedra', 'Iz vode in soli'], a: 0, org: 'citoplazma' },
  { t: 'mc', id: 'mc9', c: ['citosol.def'], q: 'Kaj je citosol?', opts: ['Tekoči del citoplazme iz vode in raztopljenih snovi', 'Vsebina jedra', 'Citoplazma skupaj z organeli', 'Tekočina v vakuoli'], a: 0, org: 'citoplazma' },
  { t: 'mc', id: 'mc10', c: ['organel.def'], q: 'Kaj so celični organeli po zapiskih?', opts: ['Z membrano obdane strukture, v katerih potekajo kemijski procesi ločeno od citosola', 'Vse molekule v citosolu', 'Beljakovinske nitke in cevke v citoplazmi', 'Deli jedra, kjer nastajajo ribosomi'], a: 0 },
  { t: 'mc', id: 'mc11', c: ['er.zrnati'], q: 'Kakšna je vloga zrnatega ER?', opts: ['Nastanek beljakovin, ki jih celica izloči, in sinteza membran', 'Sinteza lipidov in razgradnja strupov', 'Kopičenje kalcijevih ionov', 'Celično dihanje'], a: 0, org: 'zrnatiER' },
  { t: 'mc', id: 'mc12', c: ['er.gladki'], q: 'Kje se razgrajujejo strupene snovi, npr. alkohol?', opts: ['V gladkem ER', 'V zrnatem ER', 'V Golgijevem aparatu', 'V jedrcu'], a: 0, org: 'gladkiER' },
  { t: 'mc', id: 'mc13', c: ['er.gladki'], q: 'Zakaj so kalcijevi ioni, ki se kopičijo v gladkem ER, pomembni?', opts: ['Za prenos signalov in krčenje mišic', 'Za fotosintezo', 'Za nastanek ribosomov', 'Za trdnost celične stene'], a: 0, org: 'gladkiER' },
  { t: 'mc', id: 'mc14', c: ['ribosomi.zgradba'], q: 'Iz česa so zgrajeni ribosomi?', opts: ['Iz RNK in beljakovin', 'Iz DNK in histonov', 'Iz fosfolipidov in beljakovin', 'Iz celuloze'], a: 0, org: 'ribosomi' },
  { t: 'mc', id: 'mc15', c: ['ribosomi.mesto'], q: 'Kje so ribosomi?', opts: ['Prosti v citoplazmi ali vezani na ER', 'Samo v jedru', 'Samo na gladkem ER', 'Samo v Golgijevem aparatu'], a: 0, org: 'ribosomi' },
  { t: 'mc', id: 'mc16', c: ['golgi.vloga'], q: 'Kaj pripravlja Golgijev aparat?', opts: ['Produkte, ki jih celica izloča, in membrane za obnovo celične membrane', 'Lipide in steroide', 'Podenote ribosomov', 'ATP'], a: 0, org: 'golgi' },
  { t: 'mc', id: 'mc17', c: ['golgi.vloga'], q: 'Kaj se odcepi od cistern Golgijevega aparata?', opts: ['Mehurčki (vezikli) s pripravljenimi snovmi', 'Ribosomi', 'Tilakoide', 'Kromosomi'], a: 0, org: 'golgi' },
  { t: 'mc', id: 'mc18', c: ['vakuola.rastl'], q: 'Kaj velja za vakuolo v rastlinski celici?', opts: ['Navadno je ena velika, shranjuje vodo in snovi ter daje oporo', 'Je več majhnih mehurčkov za odpadne snovi', 'Vsebuje prebavne encime in kromatin', 'Je ni'], a: 0, org: 'vakuola' },
  { t: 'mc', id: 'mc19', c: ['lizosom'], q: 'Kaj vsebujejo lizosomi?', opts: ['Prebavne encime', 'Klorofil', 'Krožno DNK', 'Kalcijeve ione'], a: 0, org: 'lizosom' },
  { t: 'mc', id: 'mc20', c: ['lizosom'], q: 'Kaj pri nekaterih rastlinskih celicah prevzame vlogo lizosomov?', opts: ['Vakuola', 'Kloroplast', 'Celična stena', 'Jedrce'], a: 0, org: 'lizosom' },
  { t: 'mc', id: 'mc21', c: ['jedro.ovoj'], q: 'Iz česa je jedrni ovoj?', opts: ['Iz dveh membran s porami', 'Iz ene membrane brez por', 'Iz celuloze', 'Iz mikrotubulov'], a: 0, org: 'jedro' },
  { t: 'mc', id: 'mc22', c: ['jedro.kromatin'], q: 'Kaj je kromatin?', opts: ['Nitast preplet DNK in histonov', 'Področje v jedru, kjer nastajajo ribosomi', 'Pigment v tilakoidah', 'Tekoči del jedra'], a: 0, org: 'jedro' },
  { t: 'mc', id: 'mc23', c: ['jedro.kromatin'], q: 'Kdaj se iz kromatina izoblikujejo kromosomi?', opts: ['Med delitvijo celice, z dodatnim zvijanjem', 'Ko celica raste', 'Ko celica umira', 'Med fotosintezo'], a: 0, org: 'jedro' },
  { t: 'mc', id: 'mc24', c: ['jedrce'], q: 'Kaj nastaja v jedrcu?', opts: ['Večje in manjše podenote ribosomov', 'Kromosomi', 'Mehurčki', 'ATP'], a: 0, org: 'jedrce' },
  { t: 'mc', id: 'mc25', c: ['mito.zgradba'], q: 'Kje v mitohondriju so krožne molekule DNK in ribosomi?', opts: ['V matriksu', 'V zunanji membrani', 'Med zunanjo in notranjo membrano', 'V tilakoidah'], a: 0, org: 'mitohondrij' },
  { t: 'mc', id: 'mc26', c: ['mito.vloga'], q: 'Kaj poteka v mitohondriju?', opts: ['Celično dihanje, nastanek ATP', 'Fotosinteza', 'Sinteza lipidov', 'Celična prebava'], a: 0, org: 'mitohondrij' },
  { t: 'mc', id: 'mc27', c: ['kloro.zgradba'], q: 'Kaj je granum?', opts: ['Kup tilakoid, nanizanih ena nad drugo', 'Tekoča notranjost kloroplasta', 'Zunanja membrana kloroplasta', 'Škrobno zrno'], a: 0, org: 'kloroplast' },
  { t: 'mc', id: 'mc28', c: ['kloro.pigment'], q: 'Kje je klorofil?', opts: ['V tilakoidni membrani', 'V stromi', 'V zunanji membrani kloroplasta', 'V vakuoli'], a: 0, org: 'kloroplast' },
  { t: 'mc', id: 'mc29', c: ['kloro.zgradba'], q: 'Iz katere membrane izvira tilakoidna membrana?', opts: ['Iz notranje membrane kloroplasta', 'Iz zunanje membrane kloroplasta', 'Iz celične membrane', 'Iz zrnatega ER'], a: 0, org: 'kloroplast' },
  { t: 'mc', id: 'mc30', c: ['plastidi.def'], q: 'Čemu so plastidi podobni po zgradbi?', opts: ['Mitohondrijem', 'Lizosomom', 'Ribosomom', 'Centriolom'], a: 0, org: 'kloroplast' },
  { t: 'mc', id: 'mc31', c: ['centrioli'], q: 'Kje so centrioli?', opts: ['V citoplazmi v bližini jedra', 'V jedrcu', 'Na celični steni', 'V matriksu mitohondrija'], a: 0, org: 'centrioli' },
  { t: 'mc', id: 'mc32', c: ['centrioli'], q: 'Pri čem sodelujejo centrioli?', opts: ['Pri celični delitvi', 'Pri celičnem dihanju', 'Pri fotosintezi', 'Pri razgradnji strupov'], a: 0, org: 'centrioli' },
  { t: 'mc', id: 'mc33', c: ['citoskelet.zgradba'], q: 'Kaj NI del celičnega ogrodja?', opts: ['Tilakoide', 'Mikrofilamenti', 'Intermediarni filamenti', 'Mikrotubuli'], a: 0, org: 'citoskelet' },
  { t: 'mc', id: 'mc34', c: ['migetalke'], q: 'Iz česa so zgrajeni migetalke in bički?', opts: ['Iz mikrotubulov', 'Iz celuloze', 'Iz fosfolipidov', 'Iz mikrofilamentov in DNK'], a: 0, org: 'migetalke' },
  { t: 'mc', id: 'mc35', c: ['membrana.vloga'], q: 'Zakaj pravimo, da je celična membrana polprepustna?', opts: ['Nadzoruje, katere snovi prehajajo v celico in iz nje', 'Ker je pol iz lipidov in pol iz celuloze', 'Ker prepušča samo vodo', 'Ker ima pore samo na eni strani'], a: 0, org: 'membrana' },
  { t: 'mc', id: 'mc36', c: ['mozaik.zgradba'], q: 'Kam so obrnjeni hidrofobni repi fosfolipidov?', opts: ['V notranjost dvosloja', 'Navzven, proti vodi', 'Proti celični steni', 'V citosol'], a: 0, org: 'membrana' },
  { t: 'mc', id: 'mc37', c: ['mozaik.proteini'], q: 'Pri čem lahko sodelujejo proteini v membrani?', opts: ['Pri aktivnem transportu', 'Pri nastanku ribosomov', 'Pri fotosintezi v stromi', 'Pri zvijanju kromatina'], a: 0, org: 'membrana' },
  { t: 'mc', id: 'mc38', c: ['stena'], q: 'Pred čim celična stena ščiti rastlinsko celico?', opts: ['Pred spremembami turgorja', 'Pred svetlobo', 'Pred delitvijo', 'Pred vstopom vode'], a: 0, org: 'stena' },
  { t: 'mc', id: 'mc39', c: ['stena'], q: 'Iz česa je celična stena rastlinske celice?', opts: ['Iz več plasti celuloze (polisaharid)', 'Iz fosfolipidov', 'Iz hitina', 'Iz škroba'], a: 0, org: 'stena' },
  { t: 'mc', id: 'mc40', c: ['rz.prehrana'], q: 'Kakšne so rastlinske celice glede prehrane?', opts: ['Avtotrofne', 'Heterotrofne', 'Prokariontske', 'Brez prehrane'], a: 0 },
  { t: 'mc', id: 'mc41', c: ['teorija.tocke'], q: 'Katera trditev NI del celične teorije?', opts: ['Živi organizmi lahko nastanejo spontano iz neživega', 'Nove celice nastanejo le z delitvijo obstoječih', 'Vsa živa bitja so iz celic in celičnih produktov', 'Celica je funkcionalna enota živega'], a: 0 },
  { t: 'mc', id: 'mc42', c: ['mejnik.hooke'], q: 'Kdo je uvedel izraz celica?', opts: ['Robert Hooke', 'Antoni van Leeuwenhoek', 'Rudolph Virchow', 'Theodor Schwann'], a: 0, why: 'Hooke je opisal strukture v pluti in delo predstavil leta 1665 v knjigi Mikrografija.' },
  { t: 'mc', id: 'mc43', c: ['mejnik.leeuwenhoek'], q: 'Kdo je prvi videl bakterije, rdeče krvničke, spermije in praživali?', opts: ['Antoni van Leeuwenhoek', 'Robert Hooke', 'Zaharias Janssen', 'Ernst Ruska'], a: 0 },
  { t: 'mc', id: 'mc44', c: ['mejnik.virchow'], q: 'Kdo je trdil, da nove celice nastanejo le z delitvijo obstoječih?', opts: ['Rudolph Virchow', 'August Weismann', 'Matthias Schleiden', 'Louis Pasteur'], a: 0 },
  { t: 'mc', id: 'mc45', c: ['mejnik.weismann'], q: 'Kdo je celično teorijo povezal z evolucijo?', opts: ['August Weismann', 'Rudolph Virchow', 'Theodor Schwann', 'Robert Hooke'], a: 0 },
  { t: 'mc', id: 'mc46', c: ['mejnik.schleiden'], q: 'Kdo sta razvila celično teorijo (1838/39)?', opts: ['Botanik Schleiden in zoolog Schwann', 'Hooke in Leeuwenhoek', 'Virchow in Weismann', 'Ruska in von Ardenne'], a: 0 },
  { t: 'mc', id: 'mc47', c: ['mikro.tem'], q: 'Zakaj s TEM vidimo zelo majhne strukture?', opts: ['Ker imajo pospešeni elektroni kratko valovno dolžino', 'Ker ima veliko steklenih leč', 'Ker preparat obarva', 'Ker gleda le površino'], a: 0 },
  { t: 'mc', id: 'mc48', c: ['mikro.tem'], q: 'Kateri mikroskop je namenjen opazovanju površine objektov?', opts: ['Vrstični elektronski mikroskop (SEM)', 'Presevni elektronski mikroskop (TEM)', 'Leeuwenhoekov mikroskop', 'Janssenov mikroskop'], a: 0 },
  { t: 'mc', id: 'mc49', c: ['mejnik.janssen'], q: 'Kaj je bilo posebnega pri Janssenovem mikroskopu (ok. 1595)?', opts: ['Bil je prvi sestavljeni mikroskop z več kot eno lečo', 'Uporabljal je elektrone', 'Imel je 270-kratno povečavo z eno lečo', 'Z njim so odkrili celico v pluti'], a: 0 },
  { t: 'mc', id: 'mc50', c: ['mejnik.leeuwenhoek'], q: 'Kolikšno povečavo je zmogel Leeuwenhoekov preprost mikroskop?', opts: ['Do 270-kratno', 'Do 40-kratno', 'Do 1000-kratno', 'Do milijon-kratno'], a: 0 },
  { t: 'mc', id: 'mc51', c: ['svm.vijaka'], q: 'S čim sliko pod mikroskopom fino izostriš?', opts: ['Z mikrometrskim vijakom', 'Z makrometrskim vijakom', 'Z revolverjem', 'S predmetno mizico'], a: 0 },
  { t: 'mc', id: 'mc52', c: ['svm.povecava'], q: 'Okular 10×, objektiv 40×. Kolikšna je skupna povečava?', opts: ['400×', '50×', '4×', '4000×'], a: 0 },
  { t: 'mc', id: 'mc53', c: ['evk.zgradba'], q: 'Katera celična funkcija je naštevana v zapiskih?', opts: ['Shranjevanje in izražanje genetske informacije', 'Spontani nastanek novih organelov', 'Fotosinteza v vseh celicah', 'Delitev brez vretena'], a: 0 },
  { t: 'mc', id: 'mc54', c: ['jedro.zapis'], q: 'Od česa so odvisne lastnosti celice in živega bitja?', opts: ['Od dednega zapisa za beljakovine v DNK', 'Od velikosti vakuole', 'Od števila mitohondrijev', 'Od debeline celične stene'], a: 0, org: 'jedro' },

  // ───────── DRŽI / NE DRŽI ─────────
  { t: 'tf', id: 'tf1', c: ['citoplazma.def'], s: 'Citosol in citoplazma sta sopomenki.', a: false, fix: { q: 'Kaj je pravilno?', opts: ['Citoplazma = citosol + celični organeli', 'Citosol = citoplazma + jedro', 'Citoplazma je samo tekočina brez organelov'], a: 0 }, org: 'citoplazma' },
  { t: 'tf', id: 'tf2', c: ['jedro.ovoj'], s: 'Jedrni ovoj je sestavljen iz dveh membran.', a: true, org: 'jedro' },
  { t: 'tf', id: 'tf3', c: ['jedro.ovoj', 'membrana.vloga'], s: 'Jedrni ovoj in celična membrana sta ista struktura.', a: false, fix: { q: 'Kaj velja?', opts: ['Jedrni ovoj obdaja jedro, celična membrana obdaja celo celico', 'Jedrni ovoj obdaja celico, membrana jedro', 'Oba obdajata samo jedro'], a: 0 }, org: 'jedro' },
  { t: 'tf', id: 'tf4', c: ['er.gladki'], s: 'Na površju gladkega ER so ribosomi.', a: false, fix: { q: 'Kje so ribosomi na ER?', opts: ['Na površju zrnatega ER', 'V notranjosti gladkega ER', 'Na obeh vrstah enako'], a: 0 }, org: 'gladkiER' },
  { t: 'tf', id: 'tf5', c: ['er.gladki'], s: 'Gladki ER kopiči kalcijeve ione.', a: true, org: 'gladkiER' },
  { t: 'tf', id: 'tf6', c: ['ribosomi.zgradba'], s: 'Ribosom je sestavljen iz dveh enako velikih podenot.', a: false, fix: { q: 'Popravi:', opts: ['Iz večje in manjše podenote', 'Iz treh podenot', 'Iz ene same podenote'], a: 0 }, org: 'ribosomi' },
  { t: 'tf', id: 'tf7', c: ['golgi.zgradba'], s: 'Cisterne Golgijevega aparata ležijo ena na drugi.', a: true, org: 'golgi' },
  { t: 'tf', id: 'tf8', c: ['vakuola.zival'], s: 'V živalski celici je navadno ena velika vakuola.', a: false, fix: { q: 'Kaj velja za živalsko celico?', opts: ['Vakuol je več in so manjše (mehurčki)', 'Vakuole sploh ni nikoli', 'Vakuola zavzema skoraj vso celico'], a: 0 }, org: 'vakuola' },
  { t: 'tf', id: 'tf9', c: ['lizosom'], s: 'Lizosomi sodelujejo pri celični prebavi.', a: true, org: 'lizosom' },
  { t: 'tf', id: 'tf10', c: ['jedro.mesto'], s: 'Jedro ima v celici vedno isto, stalno mesto.', a: false, fix: { q: 'Kaj piše v zapiskih?', opts: ['Jedro je samostojen organel, mesto se spreminja', 'Jedro je vedno na sredini celice', 'Jedro je pritrjeno na celično steno'], a: 0 }, org: 'jedro' },
  { t: 'tf', id: 'tf11', c: ['jedrce'], s: 'Jedrce je obdano z lastnim jedrnim ovojem.', a: false, fix: { q: 'Kaj je jedrce?', opts: ['Področje znotraj jedra, kjer nastajajo podenote ribosomov', 'Manjše jedro z dvema membranama', 'Organel v citoplazmi'], a: 0 }, org: 'jedrce' },
  { t: 'tf', id: 'tf12', c: ['mito.zgradba'], s: 'Notranja membrana mitohondrija je nagubana.', a: true, org: 'mitohondrij' },
  { t: 'tf', id: 'tf13', c: ['mito.zgradba'], s: 'Mitohondrij nima lastne DNK.', a: false, fix: { q: 'Kaj je v matriksu?', opts: ['Krožne molekule DNK in ribosomi', 'Klorofil in škrob', 'Histoni in kromosomi'], a: 0 }, org: 'mitohondrij' },
  { t: 'tf', id: 'tf14', c: ['kloro.zgradba'], s: 'Stroma je tekoča notranjost (matriks) kloroplasta.', a: true, org: 'kloroplast' },
  { t: 'tf', id: 'tf15', c: ['kloro.pigment'], s: 'Klorofil je raztopljen v stromi.', a: false, fix: { q: 'Kje je klorofil?', opts: ['V tilakoidni membrani', 'V zunanji membrani', 'V matriksu mitohondrija'], a: 0 }, org: 'kloroplast' },
  { t: 'tf', id: 'tf16', c: ['centrioli'], s: 'Centrioli so v vseh rastlinskih celicah.', a: false, fix: { q: 'Kje so centrioli?', opts: ['V živalskih celicah in le v nekaterih rastlinskih nižjih ravni', 'Samo v bakterijah', 'Samo v rastlinskih celicah'], a: 0 }, org: 'centrioli' },
  { t: 'tf', id: 'tf17', c: ['citoskelet.vloga'], s: 'Celično ogrodje omogoča premikanje celice in spreminjanje njene oblike.', a: true, org: 'citoskelet' },
  { t: 'tf', id: 'tf18', c: ['migetalke'], s: 'Migetalke in bički so zasidrani v celični membrani in štrlijo v okolico.', a: true, org: 'migetalke' },
  { t: 'tf', id: 'tf19', c: ['mozaik.zgradba'], s: 'Po modelu tekočega mozaika so proteini v membrani trdno pritrjeni in se ne premikajo.', a: false, fix: { q: 'Kaj pravi model?', opts: ['Lipidni dvosloj je tekoč, proteini v njem nekako plavajo', 'Membrana je trda kot celična stena', 'Proteini so samo na zunanji strani'], a: 0 }, org: 'membrana' },
  { t: 'tf', id: 'tf20', c: ['stena'], s: 'Celična stena je v odraslem stanju neživi del celice.', a: true, org: 'stena' },
  { t: 'tf', id: 'tf21', c: ['stena'], s: 'Celična stena je pod celično membrano.', a: false, fix: { q: 'Kje je stena?', opts: ['Z zunanje strani celične membrane', 'V citoplazmi', 'Okrog jedra'], a: 0 }, org: 'stena' },
  { t: 'tf', id: 'tf22', c: ['pe.jedro'], s: 'Prokariontska celica ima jedro brez jedrnega ovoja.', a: false, fix: { q: 'Popravi:', opts: ['Prokariontska celica nima ne jedra ne jedrnega ovoja', 'Ima jedro in jedrni ovoj', 'Ima jedrni ovoj brez jedra'], a: 0 } },
  { t: 'tf', id: 'tf23', c: ['pe.organeli'], s: 'Tudi prokariontske celice imajo ribosome.', a: true, why: 'Imajo jih, vendar so manjši kot pri evkariontih.' },
  { t: 'tf', id: 'tf24', c: ['teorija.tocke'], s: 'Celice vsebujejo dedni zapis z navodili za rast, delovanje in razvoj celic.', a: true },
  { t: 'tf', id: 'tf25', c: ['mejnik.hooke'], s: 'Robert Hooke je strukture, ki jih je imenoval celice, opisal v pluti.', a: true },
  { t: 'tf', id: 'tf26', c: ['mejnik.weismann'], s: 'Weismann je trdil, da vse danes živeče celice izvirajo iz celic iz pradavnine.', a: true },
  { t: 'tf', id: 'tf27', c: ['rz.oblika'], s: 'Živalske celice so pravilnih oblik.', a: false, fix: { q: 'Kaj velja?', opts: ['Rastlinske so pravilnih oblik, živalske ne', 'Obe sta vedno okrogli', 'Živalske so kvadratne'], a: 0 } },
  { t: 'tf', id: 'tf28', c: ['skrobna'], s: 'Škrobna zrna so specializirani plastidi za shranjevanje škroba.', a: true, org: 'skrobna' },
  { t: 'tf', id: 'tf29', c: ['svm.vijaka'], s: 'Z makrometrskim vijakom sliko grobo izostriš.', a: true },
  { t: 'tf', id: 'tf30', c: ['er.zrnati'], s: 'Zrnati ER sodeluje pri sintezi membran za obnovo.', a: true, org: 'zrnatiER' },

  // ───────── DOPOLNI ─────────
  { t: 'cloze', id: 'cl1', c: ['celica.def'], text: 'Celica je osnovna {gradbena} in {dejavna} enota živih bitij.', extra: ['dedna', 'kemijska'] },
  { t: 'cloze', id: 'cl2', c: ['citoplazma.def'], text: 'Citoplazma = {citosol} + celični {organeli}.', extra: ['jedro', 'vakuola'] },
  { t: 'cloze', id: 'cl3', c: ['citosol.def'], text: 'Citosol je {tekoči} del citoplazme, pretežno iz {vode} in v njej raztopljenih snovi.', extra: ['trdni', 'maščob'] },
  { t: 'cloze', id: 'cl4', c: ['er.zgradba'], text: 'Na površju {zrnatega} ER so {ribosomi}.', extra: ['gladkega', 'lizosomi'] },
  { t: 'cloze', id: 'cl5', c: ['ribosomi.zgradba'], text: 'Ribosomi so zgrajeni iz {RNK} in {beljakovin}.', extra: ['DNK', 'lipidov'] },
  { t: 'cloze', id: 'cl6', c: ['golgi.vloga'], text: 'Od cistern Golgijevega aparata se odcepljajo {mehurčki} ({vezikli}), ki vsebujejo pripravljene snovi.', extra: ['ribosomi', 'tilakoide'] },
  { t: 'cloze', id: 'cl7', c: ['jedro.kromatin'], text: 'DNK in {histoni} tvorijo nitast preplet, {kromatin}. Med delitvijo z dodatnim zvijanjem nastanejo {kromosomi}.', extra: ['jedrce', 'ribosomi'] },
  { t: 'cloze', id: 'cl8', c: ['jedrce'], text: 'V {jedrcu} nastajajo večje in manjše {podenote} ribosomov.', extra: ['jedrnem ovoju', 'cisterne'] },
  { t: 'cloze', id: 'cl9', c: ['mito.zgradba'], text: 'Mitohondrij ima {zunanjo} membrano, notranjo {nagubano} membrano in {matriks}.', extra: ['stromo', 'gladko'] },
  { t: 'cloze', id: 'cl10', c: ['kloro.zgradba'], text: 'Tilakoide, nanizane ena nad drugo, tvorijo {granume}. Tekoča notranjost kloroplasta je {stroma}.', extra: ['matriks', 'kriste'] },
  { t: 'cloze', id: 'cl11', c: ['citoskelet.zgradba'], text: 'Celično ogrodje sestavljajo {mikrofilamenti}, {intermediarni} filamenti in {mikrotubuli}.', extra: ['tilakoide', 'histoni'] },
  { t: 'cloze', id: 'cl12', c: ['mozaik.zgradba'], text: 'Membrano sestavlja {dvosloj} {fosfolipidov}; njihovi {hidrofobni} repi so obrnjeni v notranjost.', extra: ['hidrofilni', 'celuloze'] },
  { t: 'cloze', id: 'cl13', c: ['stena'], text: 'Rastlinska celična stena je iz več plasti polisaharida {celuloze} in celico ščiti pred spremembami {turgorja}.', extra: ['škroba', 'temperature'] },
  { t: 'cloze', id: 'cl14', c: ['pe.delitev'], text: 'Evkariontska celica se deli s sodelovanjem {delitvenega vretena} ({mitoza}, {mejoza}).', extra: ['cepitev'] },
  { t: 'cloze', id: 'cl15', c: ['teorija.tocke'], text: 'Nove celice lahko nastanejo le z {delitvijo} {obstoječih} celic.', extra: ['spontano', 'neživih'] },
  { t: 'cloze', id: 'cl16', c: ['er.gladki'], text: 'Gladki ER: sinteza {lipidov} in steroidov, razgradnja {strupenih} snovi, kopičenje {kalcijevih} ionov.', extra: ['beljakovin', 'natrijevih'] },
  { t: 'cloze', id: 'cl17', c: ['rz.prehrana'], text: 'Rastlinske celice so {avtotrofne}, živalske pa {heterotrofne}.', extra: ['prokariontske'] },
  { t: 'cloze', id: 'cl18', c: ['svm.enote'], text: '1 mm = {1000} µm, 1 µm = {1000} nm.', extra: ['100', '10'] },

  // ───────── VPIŠI POJEM ─────────
  { t: 'type', id: 'ty1', c: ['citosol.def'], q: 'Tekoči del citoplazme, pretežno iz vode in raztopljenih snovi.', a: ['citosol'] },
  { t: 'type', id: 'ty2', c: ['jedrce'], q: 'Področje znotraj jedra, v katerem nastajajo podenote ribosomov.', a: ['jedrce', 'nukleolus'] },
  { t: 'type', id: 'ty3', c: ['jedro.kromatin'], q: 'Nitast preplet DNK in histonov.', a: ['kromatin'] },
  { t: 'type', id: 'ty4', c: ['jedro.kromatin'], q: 'Jedrne beljakovine, s katerimi je povezana DNK.', a: ['histoni', 'histon'] },
  { t: 'type', id: 'ty5', c: ['kloro.zgradba'], q: 'Kup tilakoid, nanizanih ena nad drugo.', a: ['granum', 'granumi', 'grana'] },
  { t: 'type', id: 'ty6', c: ['kloro.pigment'], q: 'Zeleno barvilo v tilakoidni membrani.', a: ['klorofil'] },
  { t: 'type', id: 'ty7', c: ['golgi.vloga'], q: 'Mehurčki, ki se odcepijo od cistern Golgijevega aparata.', a: ['vezikli', 'vezikel', 'mehurcki'] },
  { t: 'type', id: 'ty8', c: ['lizosom'], q: 'Organel s prebavnimi encimi.', a: ['lizosom', 'lizosomi'] },
  { t: 'type', id: 'ty9', c: ['mito.vloga'], q: 'Organel, v katerem poteka celično dihanje.', a: ['mitohondrij', 'mitohondriji'] },
  { t: 'type', id: 'ty10', c: ['er.gladki'], q: 'Del ER brez ribosomov, ki razgrajuje strupene snovi.', a: ['gladki er', 'gladki endoplazemski retikulum'] },
  { t: 'type', id: 'ty11', c: ['mozaik.zgradba'], q: 'Ime trenutno veljavnega modela zgradbe membran.', a: ['model tekocega mozaika', 'tekoci mozaik'] },
  { t: 'type', id: 'ty12', c: ['membrana.vloga'], q: 'Drugo ime za celično membrano.', a: ['plazmalema'] },
  { t: 'type', id: 'ty13', c: ['stena'], q: 'Polisaharid, iz katerega je rastlinska celična stena.', a: ['celuloza'] },
  { t: 'type', id: 'ty14', c: ['celica.vrste'], q: 'Celice brez pravega jedra (drugo ime: predjedrne).', a: ['prokariontske', 'prokariontska', 'prokarionti', 'prokariontske celice'] },
  { t: 'type', id: 'ty15', c: ['pe.delitev'], q: 'Način delitve prokariontske celice.', a: ['cepitev'] },
  { t: 'type', id: 'ty16', c: ['kloro.zgradba'], q: 'Tekoča notranjost (matriks) kloroplasta.', a: ['stroma'] },
  { t: 'type', id: 'ty17', c: ['mejnik.hooke'], q: 'Kdo je uvedel izraz celica? (priimek)', a: ['hooke', 'robert hooke'] },
  { t: 'type', id: 'ty18', c: ['mejnik.virchow'], q: 'Kdo je 1855 trdil, da nove celice nastanejo le iz obstoječih? (priimek)', a: ['virchow', 'rudolph virchow', 'rudolf virchow'] },
  { t: 'type', id: 'ty19', c: ['teorija.spontani'], q: 'Kdo je ovrgel spontani nastanek? (priimek)', a: ['pasteur', 'louis pasteur'] },
  { t: 'type', id: 'ty20', c: ['skrobna'], q: 'Specializirani plastidi za shranjevanje škroba.', a: ['skrobna zrna', 'skrobno zrno', 'amiloplasti', 'amiloplast'] },
  { t: 'type', id: 'ty21', c: ['citoskelet.zgradba'], q: 'Najdebelejše cevke celičnega ogrodja, iz katerih so tudi migetalke.', a: ['mikrotubuli', 'mikrotubul'] },
  { t: 'type', id: 'ty22', c: ['svm.vijaka'], q: 'Vijak za fino ostrenje slike pri mikroskopu.', a: ['mikrometrski vijak', 'mikrometrski'] },

  // ───────── VSILJIVEC ─────────
  { t: 'odd', id: 'od1', c: ['pe.organeli'], q: 'Česa prokariontska celica NIMA? Trije imajo isto lastnost, eden ne.', items: ['Mitohondrij', 'Golgijev aparat', 'Ribosomi', 'Endoplazemski retikulum'], a: 2, why: 'Ribosome imajo tudi prokarionti (manjše). ER, GA in mitohondrijev nimajo.' },
  { t: 'odd', id: 'od2', c: ['citoskelet.zgradba'], q: 'Kaj ne sodi v celično ogrodje?', items: ['Mikrotubuli', 'Mikrofilamenti', 'Kromatin', 'Intermediarni filamenti'], a: 2, why: 'Kromatin je preplet DNK in histonov v jedru.' },
  { t: 'odd', id: 'od3', c: ['rz.razlike'], q: 'Kaj ne velja za rastlinsko celico?', items: ['Celulozna stena', 'Kloroplasti', 'Heterotrofnost', 'Velika vakuola'], a: 2, why: 'Rastlinske celice so avtotrofne. Heterotrofne so živalske.' },
  { t: 'odd', id: 'od4', c: ['kloro.zgradba'], q: 'Kaj ni del kloroplasta?', items: ['Tilakoida', 'Granum', 'Stroma', 'Jedrce'], a: 3, why: 'Jedrce je v jedru.' },
  { t: 'odd', id: 'od5', c: ['mito.zgradba'], q: 'Kaj ni del mitohondrija?', items: ['Matriks', 'Notranja nagubana membrana', 'Granum', 'Krožna DNK'], a: 2, why: 'Granum je kup tilakoid v kloroplastu.' },
  { t: 'odd', id: 'od6', c: ['er.gladki'], q: 'Kaj ni naloga gladkega ER?', items: ['Sinteza lipidov', 'Razgradnja alkohola', 'Nastanek beljakovin za izločanje', 'Kopičenje kalcijevih ionov'], a: 2, why: 'Beljakovine za izločanje nastajajo na zrnatem ER.' },
  { t: 'odd', id: 'od7', c: ['mejnik.schleiden', 'mejnik.virchow'], q: 'Kdo NI med mejniki celične biologije na listu iz učbenika?', items: ['Schwann', 'Virchow', 'Schleiden', 'Pasteur'], a: 3, why: 'Pasteur je v tvojem odgovoru na listu (ovrgel je spontani nastanek), med mejniki pa so Schleiden, Schwann in Virchow.' },
  { t: 'odd', id: 'od8', c: ['jedro.ovoj'], q: 'Kaj ne spada k jedru?', items: ['Jedrni ovoj', 'Pore', 'Kromatin', 'Tilakoide'], a: 3, why: 'Tilakoide so v kloroplastu.' },
  { t: 'odd', id: 'od9', c: ['membrana.vloga', 'mozaik.zgradba'], q: 'Kaj ne velja za celično membrano?', items: ['Je polprepustna', 'Je iz celuloze', 'Daje obliko in zaščito', 'Je dvosloj fosfolipidov'], a: 1, why: 'Iz celuloze je rastlinska celična stena, ne membrana.' },
  { t: 'odd', id: 'od10', c: ['svm.deli'], q: 'Kaj ni del svetlobnega mikroskopa?', items: ['Revolver', 'Okular', 'Elektronska puška', 'Predmetna mizica'], a: 2, why: 'Elektronska puška je del elektronskega mikroskopa (TEM).' },

  // ───────── NAJDI NAPAKO ─────────
  // [narobe|prav] označi napačno besedo in pravilno zamenjavo
  { t: 'fix', id: 'fx1', c: ['er.zrnati'], text: 'Na [gladkem|zrnatem] ER nastajajo beljakovine, ki jih celica izloči.', opts: ['zrnatem', 'jedrnem', 'celičnem'] },
  { t: 'fix', id: 'fx2', c: ['jedrce'], text: 'V [lizosomu|jedrcu] nastajajo večje in manjše podenote ribosomov.', opts: ['jedrcu', 'matriksu', 'citosolu'] },
  { t: 'fix', id: 'fx3', c: ['mito.zgradba'], text: 'Mitohondrij ima zunanjo membrano in notranjo [gladko|nagubano] membrano.', opts: ['nagubano', 'celulozno', 'zrnato'] },
  { t: 'fix', id: 'fx4', c: ['golgi.vloga'], text: 'Od cistern Golgijevega aparata se odcepljajo [ribosomi|mehurčki], ki vsebujejo pripravljene snovi.', opts: ['mehurčki', 'kromosomi', 'tilakoide'] },
  { t: 'fix', id: 'fx5', c: ['stena'], text: 'Rastlinska celična stena je zgrajena iz več plasti [škroba|celuloze].', opts: ['celuloze', 'fosfolipidov', 'beljakovin'] },
  { t: 'fix', id: 'fx6', c: ['mozaik.zgradba'], text: 'V modelu tekočega mozaika so [hidrofilni|hidrofobni] repi fosfolipidov obrnjeni v notranjost dvosloja.', opts: ['hidrofobni', 'celulozni', 'beljakovinski'] },
  { t: 'fix', id: 'fx7', c: ['pe.dedni'], text: 'Prokariontska celica ima eno [linearno|krožno] molekulo DNK, ki ni povezana z beljakovinami.', opts: ['krožno', 'jedrno', 'dvojno'] },
  { t: 'fix', id: 'fx8', c: ['mejnik.virchow'], text: 'Leta 1855 je [Hooke|Virchow] trdil, da nove celice nastanejo le z delitvijo obstoječih.', opts: ['Virchow', 'Weismann', 'Schwann'] },
  { t: 'fix', id: 'fx9', c: ['centrioli'], text: 'Centrioli so v citoplazmi v bližini [stene|jedra] in sodelujejo pri celični delitvi.', opts: ['jedra', 'vakuole', 'membrane'] },
  { t: 'fix', id: 'fx10', c: ['vakuola.rastl'], text: 'Vakuola v rastlinski celici shranjuje vodo in snovi ter celici daje [energijo|oporo].', opts: ['oporo', 'dedni zapis', 'encime'] },
  { t: 'fix', id: 'fx11', c: ['mikro.tem'], text: 'TEM izkorišča kratko valovno dolžino pospešenih [fotonov|elektronov].', opts: ['elektronov', 'protonov', 'ionov'] },
  { t: 'fix', id: 'fx12', c: ['kloro.zgradba'], text: 'Tilakoidna membrana kloroplasta izvira iz [zunanje|notranje] membrane.', opts: ['notranje', 'celične', 'jedrne'] },

  // ───────── POVEŽI PARE (ročni) ─────────
  { t: 'match', id: 'ma1', c: ['mejnik.hooke', 'mejnik.virchow', 'mejnik.weismann', 'mejnik.leeuwenhoek'], q: 'Poveži znanstvenika z dosežkom.', pairs: [['Hooke', 'izraz celica (plutovina)'], ['Leeuwenhoek', 'odkril bakterije in krvničke'], ['Virchow', 'celice le iz obstoječih celic'], ['Weismann', 'povezava z evolucijo']] },
  { t: 'match', id: 'ma2', c: ['citoskelet.zgradba', 'migetalke', 'kloro.zgradba', 'jedro.kromatin'], q: 'Poveži strukturo z gradnikom.', pairs: [['Migetalke', 'mikrotubuli'], ['Granum', 'tilakoide'], ['Kromatin', 'DNK in histoni'], ['Ribosom', 'RNK in beljakovine']] },
  { t: 'match', id: 'ma3', c: ['mikro.tem', 'mejnik.janssen', 'mejnik.leeuwenhoek'], q: 'Poveži mikroskop z značilnostjo.', pairs: [['Janssen', 'prvi sestavljeni, tri tubuse'], ['Leeuwenhoek', 'ena leča, do 270-krat'], ['TEM', 'elektroni skozi preparat'], ['SEM', 'površina objektov']] },

  // ───────── RAZVRSTI ─────────
  { t: 'sort', id: 'so1', c: ['pe.organeli', 'pe.jedro'], q: 'Kaj ima katera celica?', bins: ['Samo evkariontska', 'Obe'], items: [['Mitohondrij', 0], ['Ribosomi', 1], ['Jedrni ovoj', 0], ['Celična membrana', 1], ['Golgijev aparat', 0], ['DNK', 1], ['ER', 0], ['Citoplazma', 1]] },
  { t: 'sort', id: 'so2', c: ['rz.razlike'], q: 'Rastlinska ali živalska celica?', bins: ['Rastlinska', 'Živalska'], items: [['celulozna celična stena', 0], ['heterotrofna', 1], ['kloroplasti', 0], ['vakuole le v nekaterih', 1], ['pravilne oblike', 0], ['brez pravilne oblike', 1], ['avtotrofna', 0], ['centrioli', 1]] },
  { t: 'sort', id: 'so3', c: ['er.zrnati', 'er.gladki'], q: 'Zrnati ali gladki ER?', bins: ['Zrnati ER', 'Gladki ER'], items: [['ribosomi na površju', 0], ['sinteza lipidov', 1], ['beljakovine za izločanje', 0], ['razgradnja alkohola', 1], ['sinteza membran za obnovo', 0], ['kopičenje kalcijevih ionov', 1], ['steroidi', 1]] },
  { t: 'sort', id: 'so4', c: ['pe.dedni', 'pe.delitev', 'pe.velikost'], q: 'Prokariontska ali evkariontska?', bins: ['Prokariontska', 'Evkariontska'], items: [['0,5 do 8 µm', 0], ['10 do 100 µm', 1], ['krožna DNK', 0], ['linearne DNK z beljakovinami', 1], ['cepitev', 0], ['mitoza in mejoza', 1], ['bakterije', 0], ['glive', 1]] },
  { t: 'sort', id: 'so5', c: ['mito.zgradba', 'kloro.zgradba'], q: 'Mitohondrij ali kloroplast?', bins: ['Mitohondrij', 'Kloroplast', 'Oba'], items: [['nagubana notranja membrana', 0], ['tilakoide', 1], ['dve membrani', 2], ['lastna DNK in ribosomi', 2], ['klorofil', 1], ['nastanek ATP', 0], ['stroma', 1], ['matriks', 0]] },
  { t: 'sort', id: 'so6', c: ['jedro.ovoj', 'jedrce', 'jedro.kromatin', 'golgi.zgradba'], q: 'V jedru ali v citoplazmi?', bins: ['V jedru', 'V citoplazmi'], items: [['jedrce', 0], ['kromatin', 0], ['Golgijev aparat', 1], ['mitohondrij', 1], ['večina DNK', 0], ['lizosom', 1], ['centrioli', 1]] },

  // ───────── VRSTNI RED ─────────
  { t: 'order', id: 'or1', c: ['mejnik.janssen', 'mejnik.hooke', 'mejnik.schleiden', 'mejnik.virchow', 'mejnik.weismann'], q: 'Razvrsti mejnike od najstarejšega.', items: ['Janssen: prvi sestavljeni mikroskop', 'Hooke: izraz celica, Mikrografija', 'Schleiden in Schwann: celična teorija', 'Virchow: celice le iz celic', 'Weismann: povezava z evolucijo', 'Ruska: TEM'], why: '1595, 1665, 1838/39, 1855, 1880, 1938.' },
  { t: 'order', id: 'or2', c: ['mikro.tem.deli'], q: 'Razvrsti dele TEM od vrha stebra navzdol (pot elektronov).', items: ['elektronska puška', 'leče kondenzorja', 'vzorec', 'leče objektiva', 'leče projektorja', 'zaslon ali kamera'] },
  { t: 'order', id: 'or3', c: ['er.zrnati', 'golgi.vloga', 'ribosomi.vloga'], q: 'Pot beljakovine, ki jo celica izloči. Razvrsti korake.', items: ['DNK v jedru nosi zapis za beljakovino', 'ribosom na zrnatem ER sintetizira beljakovino', 'beljakovina v mehurčku potuje do Golgijevega aparata', 'Golgijev aparat pripravi produkt', 'mehurček se odcepi in pripotuje do membrane', 'celica snov izloči'] },
  { t: 'order', id: 'or4', c: ['pe.velikost', 'svm.enote'], q: 'Razvrsti od najmanjšega do največjega.', items: ['ribosom (nekaj 10 nm)', 'bakterija (0,5 do 8 µm)', 'živalska celica (10 do 100 µm)', '1 mm'] },
  { t: 'order', id: 'or5', c: ['jedro.kromatin'], q: 'Od DNK do kromosoma. Razvrsti.', items: ['molekula DNK', 'DNK se poveže s histoni', 'nitast preplet: kromatin', 'dodatno zvijanje med delitvijo', 'kromosom'] },
]
