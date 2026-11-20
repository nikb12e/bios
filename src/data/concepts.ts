// Pojmi (enote znanja). Vsak pojem ima svoj spomin (FSRS).
// text: kar piše v zapiskih; q: vprašanje za ustno razlago; kp: ključne točke, po katerih AI ocenjuje.

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
  // 1. Celica in vrste celic
  { id: 'celica.def', topic: 'osnove', page: 1, label: 'Kaj je celica',
    text: 'Celica je osnovna gradbena in dejavna enota živih bitij.',
    q: 'Kaj je celica?', kp: ['osnovna gradbena enota', 'osnovna dejavna (funkcionalna) enota', 'živih bitij'] },
  { id: 'celica.delitev', topic: 'osnove', page: 1, label: 'Pomen delitve celic',
    text: 'Delitev celic omogoča prenos dednih informacij iz materinske v hčerinsko celico.',
    q: 'Kaj omogoča delitev celic?', kp: ['prenos dednih informacij', 'iz materinske v hčerinsko celico'] },
  { id: 'celica.vrste', topic: 'osnove', page: 1, label: 'Prokariontske in evkariontske celice',
    text: 'Delovanje celice je povezano z njeno notranjo zgradbo. Glede na zgradbo ločimo prokariontske (predjedrne) celice bakterij in evkariontske celice s pravim jedrom in organeli: glive, rastline, živali.',
    q: 'Kako delimo celice glede na zgradbo in katera živa bitja spadajo v vsako skupino?',
    kp: ['prokariontske (predjedrne) celice', 'bakterije', 'evkariontske celice imajo pravo jedro in organele', 'glive, rastline, živali'] },
  { id: 'pe.velikost', topic: 'osnove', page: 2, label: 'Velikost celic',
    text: 'Prokariontske celice merijo večinoma med 0,5 in 8 µm, evkariontske večinoma med 10 in 100 µm.' },
  { id: 'pe.dedni', topic: 'osnove', page: 2, label: 'Dedni zapis pri pro- in evkariontih',
    text: 'Prokarionti: ena krožno oblikovana DNK, ki ni povezana z beljakovinami. Evkarionti: številne linearno oblikovane molekule DNK, povezane s posebnimi beljakovinami.',
    q: 'Primerjaj dedni zapis prokariontske in evkariontske celice.',
    kp: ['prokariontska: ena krožna DNK', 'prokariontska DNK ni povezana z beljakovinami', 'evkariontska: številne linearne molekule DNK', 'evkariontska DNK je povezana s posebnimi beljakovinami'] },
  { id: 'pe.jedro', topic: 'osnove', page: 2, label: 'Jedro in jedrni ovoj',
    text: 'Prokariontska celica nima jedra in jedrnega ovoja, evkariontska ju ima.' },
  { id: 'pe.delitev', topic: 'osnove', page: 2, label: 'Delitev pri pro- in evkariontih',
    text: 'Prokariontska celica se deli brez sodelovanja delitvenega vretena (cepitev), evkariontska s sodelovanjem delitvenega vretena (mitoza, mejoza).',
    q: 'Kako se delijo prokariontske in kako evkariontske celice?',
    kp: ['prokariontske brez delitvenega vretena', 'cepitev', 'evkariontske z delitvenim vretenom', 'mitoza in mejoza'] },
  { id: 'pe.organeli', topic: 'osnove', page: 2, label: 'Ribosomi in membranski organeli',
    text: 'Prokarionti imajo manjše ribosome in nimajo ER, Golgijevega aparata, mitohondrijev ali plastidov. Evkarionti imajo večje ribosome, ER, GA in mitohondrije; plastide (kloroplaste) imajo rastline.' },
  { id: 'evk.zgradba', topic: 'osnove', page: 3, label: 'Zgradba evkariontske celice',
    text: 'Celica je obdana z izbirno prepustno biotsko membrano, ki uravnava njeno interakcijo z okoljem. Strukture v celici opravljajo funkcije: pretvorba energije, transport molekul, razgradnja in sinteza novih molekul, odstranjevanje odpadnih snovi ter shranjevanje in izražanje genetske informacije.',
    q: 'Katere celične funkcije opravljajo strukture v evkariontski celici?',
    kp: ['pretvorba energije', 'transport molekul', 'razgradnja in sinteza novih molekul', 'odstranjevanje odpadnih snovi', 'shranjevanje in izražanje genetske informacije'] },
  { id: 'citoplazma.def', topic: 'osnove', page: 3, org: 'citoplazma', label: 'Citoplazma',
    text: 'Citoplazma = citosol + celični organeli.',
    q: 'Kaj je citoplazma in kaj citosol?',
    kp: ['citoplazma je citosol skupaj s celičnimi organeli', 'citosol je tekoči del citoplazme', 'pretežno voda', 'raztopljene snovi: beljakovine, maščobe, soli'] },
  { id: 'citosol.def', topic: 'osnove', page: 3, org: 'citoplazma', label: 'Citosol',
    text: 'Citosol je tekoči del citoplazme, pretežno iz vode in v njej raztopljenih snovi (beljakovin, maščob, soli ...).' },

  // 2. Celična teorija in mikroskopi
  { id: 'teorija.tocke', topic: 'teorija', page: 4, label: 'Celična teorija',
    text: '1. Vsa živa bitja so sestavljena iz celic in celičnih produktov. 2. Nove celice lahko nastanejo le z delitvijo obstoječih celic. 3. Celice vsebujejo dedni zapis z navodili za rast, delovanje in razvoj celic. 4. Celica je funkcionalna enota živega: v njej potekajo kemične reakcije, pomembne za življenje.',
    q: 'Naštej in razloži trditve celične teorije.',
    kp: ['vsa živa bitja so iz celic in celičnih produktov', 'nove celice nastanejo le z delitvijo obstoječih', 'celice vsebujejo dedni zapis z navodili za rast, delovanje in razvoj', 'celica je funkcionalna enota, v njej potekajo kemične reakcije, pomembne za življenje'] },
  { id: 'teorija.mikroskop', topic: 'teorija', page: 4, label: 'Pomen mikroskopa',
    text: 'Razvoj mikroskopa je odprl novo področje raziskav: celično biologijo in mikrobiologijo. Celična teorija je tesno povezana z razvojem mikroskopa.',
    q: 'V čem je iznajdba mikroskopa pomembna za biološko znanost?',
    kp: ['odprla je novo področje raziskav', 'preučevanje celične biologije', 'mikrobiologija', 'omogočila razvoj celične teorije'] },
  { id: 'teorija.spontani', topic: 'teorija', page: 4, label: 'Spontani nastanek',
    text: 'Pred celično teorijo so verjeli, da živi organizmi nastanejo spontano, iz neživega. To je ovrgel Pasteur; nove celice nastanejo le iz obstoječih celic.',
    q: 'Kaj pomeni spontani nastanek in zakaj so to teorijo zavrgli?',
    kp: ['živi organizmi naj bi nastali spontano iz neživega', 'Pasteur jo je ovrgel', 'nove celice nastanejo le z delitvijo obstoječih celic'] },
  { id: 'mejnik.janssen', topic: 'teorija', page: 4, label: 'Zaharias Janssen, 1595',
    text: 'Nizozemec Zaharias Janssen je okrog 1595 naredil prvi sestavljeni mikroskop z več kot eno lečo (trije tubusi z lečami, izostritev s spreminjanjem razdalje med lečami).' },
  { id: 'mejnik.leeuwenhoek', topic: 'teorija', page: 4, label: 'Antoni van Leeuwenhoek',
    text: 'Antoni van Leeuwenhoek (1632 do 1723) je izdelal približno 500 mikroskopov z eno lečo (do 270-kratna povečava) in odkril bakterije, rdeče krvničke, spermije in praživali.' },
  { id: 'mejnik.hooke', topic: 'teorija', page: 4, label: 'Robert Hooke',
    text: 'Robert Hooke je uvedel izraz celica za strukture v pluti; delo je predstavil leta 1665 v knjigi Mikrografija.' },
  { id: 'mejnik.schleiden', topic: 'teorija', page: 4, label: 'Schleiden in Schwann, 1838/39',
    text: 'Botanik Matthias Schleiden in zoolog Theodor Schwann sta 1838/39 razvila celično teorijo: rastline in živali sestavljajo skupine celic, celica je osnovna enota živih bitij.' },
  { id: 'mejnik.virchow', topic: 'teorija', page: 4, label: 'Rudolph Virchow, 1855',
    text: 'Rudolph Virchow je 1855 celično teorijo razširil: nove celice lahko nastanejo le z delitvijo obstoječih celic.' },
  { id: 'mejnik.weismann', topic: 'teorija', page: 4, label: 'August Weismann, 1880',
    text: 'August Weismann je 1880 nadgradil Virchowo idejo: vse danes živeče celice so potomke celic iz pradavnine. S tem je celično teorijo povezal z evolucijo.',
    q: 'Kaj sta k celični teoriji prispevala Virchow in Weismann?',
    kp: ['Virchow: nove celice nastanejo le z delitvijo obstoječih', 'Weismann: vse današnje celice so potomke celic iz pradavnine', 'Weismann je povezal celično teorijo z evolucijo'] },
  { id: 'mikro.tem', topic: 'teorija', page: 4, label: 'TEM in SEM',
    text: 'Ernst Ruska je 1938 izdelal presevni (transmisijski) elektronski mikroskop TEM: elektrone, ki prodirajo skozi preparat, zberejo elektromagnetne leče; zaradi kratke valovne dolžine pospešenih elektronov vidimo zelo majhne strukture. Manfred von Ardenne je približno sočasno razvil vrstični elektronski mikroskop SEM za opazovanje površine objektov.',
    q: 'Razloži razliko med TEM in SEM.',
    kp: ['TEM: elektroni prodirajo skozi preparat', 'elektrone zberejo elektromagnetne leče', 'kratka valovna dolžina pospešenih elektronov omogoča opazovanje zelo majhnih struktur', 'SEM: opazovanje površine objektov'] },
  { id: 'mikro.tem.deli', topic: 'teorija', page: 4, label: 'Deli TEM',
    text: 'Od zgoraj navzdol: elektronska puška, elektromagnetne leče kondenzorja, vzorec, elektromagnetne leče objektiva, elektromagnetne leče projektorja, okular in fosforescenčni zaslon ali fotografska plošča (danes digitalna kamera). Vakuumska črpalka ustvarja vakuum v stebru.' },

  // 3. Organeli
  { id: 'organel.def', topic: 'organeli', page: 5, label: 'Kaj so organeli',
    text: 'Celični organeli so z membrano obdane strukture, v katerih potekajo kemijski procesi ločeno od citosola.',
    q: 'Kaj so celični organeli?', kp: ['z membrano obdane strukture', 'v njih potekajo kemijski procesi', 'ločeno od citosola'] },
  { id: 'er.zgradba', topic: 'organeli', page: 5, org: 'zrnatiER', label: 'Zgradba ER',
    text: 'ER je splet različno oblikovanih prostorov, obdanih z membranami: cevasti ali sploščene mehurjaste tvorbe, cisterne. Ločimo zrnati ER (na površju so ribosomi) in gladki ER.',
    q: 'Opiši zgradbo endoplazemskega retikuluma in njegovi dve vrsti.',
    kp: ['splet prostorov, obdanih z membranami', 'cevasti ali sploščeni mehurjasti prostori (cisterne)', 'zrnati ER ima na površju ribosome', 'gladki ER nima ribosomov'] },
  { id: 'er.zrnati', topic: 'organeli', page: 5, org: 'zrnatiER', label: 'Vloga zrnatega ER',
    text: 'Zrnati ER: nastanek beljakovin, ki jih celica izloči; sinteza membran (za obnovo).',
    q: 'Kakšna je vloga zrnatega ER?', kp: ['nastanek beljakovin, ki jih celica izloči', 'sinteza membran za obnovo'] },
  { id: 'er.gladki', topic: 'organeli', page: 5, org: 'gladkiER', label: 'Vloga gladkega ER',
    text: 'Gladki ER: sinteza lipidov in steroidov; razgradnja strupenih snovi (npr. alkohola); kopičenje kalcijevih ionov (prenos signalov, krčenje mišic).',
    q: 'Kakšna je vloga gladkega ER?', kp: ['sinteza lipidov in steroidov', 'razgradnja strupenih snovi, npr. alkohola', 'kopičenje kalcijevih ionov', 'kalcij je pomemben za prenos signalov in krčenje mišic'] },
  { id: 'ribosomi.zgradba', topic: 'organeli', page: 6, org: 'ribosomi', label: 'Zgradba ribosomov',
    text: 'Ribosomi so zgrajeni iz ribonukleinske kisline (RNK) in beljakovin; sestavljeni so iz dveh podenot, večje in manjše.',
    q: 'Opiši ribosome: zgradbo, mesto in vlogo.', kp: ['iz RNK in beljakovin', 'dve podenoti, večja in manjša', 'prosti v citoplazmi ali vezani na ER', 'sinteza beljakovin'] },
  { id: 'ribosomi.mesto', topic: 'organeli', page: 6, org: 'ribosomi', label: 'Kje so ribosomi',
    text: 'Ribosomi so prosti v citoplazmi ali vezani na ER.' },
  { id: 'ribosomi.vloga', topic: 'organeli', page: 6, org: 'ribosomi', label: 'Vloga ribosomov',
    text: 'Ribosomi opravljajo sintezo beljakovin.' },
  { id: 'golgi.zgradba', topic: 'organeli', page: 6, org: 'golgi', label: 'Zgradba Golgijevega aparata',
    text: 'Membrane Golgijevega aparata tvorijo sploščene cisterne, ki ležijo ena na drugi.' },
  { id: 'golgi.vloga', topic: 'organeli', page: 6, org: 'golgi', label: 'Vloga Golgijevega aparata',
    text: 'Golgijev aparat pripravi produkte, ki jih celica izloča, in membrane za obnavljanje celične membrane. Od cistern na robovih zunanjega dela se odcepljajo mehurčki (vezikli), ki vsebujejo te snovi.',
    q: 'Opiši Golgijev aparat in njegovo vlogo.',
    kp: ['sploščene cisterne, ki ležijo ena na drugi', 'priprava produktov, ki jih celica izloča', 'priprava membran za obnavljanje celične membrane', 'od cistern se odcepljajo mehurčki (vezikli) s temi snovmi'] },
  { id: 'vakuola.rastl', topic: 'organeli', page: 7, org: 'vakuola', label: 'Vakuola v rastlinski celici',
    text: 'V rastlinski celici je navadno ena velika vakuola; shranjuje snovi, nastale v celici (npr. barvila), in vodo ter daje celici oporo.',
    q: 'Primerjaj vakuole v rastlinski in živalski celici.',
    kp: ['rastlinska celica: navadno ena velika vakuola', 'shranjuje snovi (npr. barvila) in vodo', 'daje celici oporo', 'živalska celica: več manjših vakuol (mehurčki)', 'v živalski: voda, odpadne snovi, vodotopna barvila'] },
  { id: 'vakuola.zival', topic: 'organeli', page: 7, org: 'vakuola', label: 'Vakuole v živalski celici',
    text: 'V živalski celici je vakuol več, so manjše (mehurčki) in shranjujejo vodo, odpadne snovi in vodotopna barvila.' },
  { id: 'lizosom', topic: 'organeli', page: 7, org: 'lizosom', label: 'Lizosomi',
    text: 'Lizosomi vsebujejo prebavne encime in omogočajo razgradnjo snovi; sodelujejo pri celični prebavi. So prosto v citoplazmi. Pri nekaterih rastlinskih celicah njihovo vlogo prevzame vakuola.',
    q: 'Kaj so lizosomi in kakšna je njihova vloga?',
    kp: ['vsebujejo prebavne encime', 'omogočajo razgradnjo snovi', 'sodelujejo pri celični prebavi', 'pri nekaterih rastlinskih celicah vlogo prevzame vakuola'] },
  { id: 'jedro.ovoj', topic: 'organeli', page: 8, org: 'jedro', label: 'Jedrni ovoj in pore',
    text: 'Jedro obdaja jedrni ovoj iz dveh membran, na površini so pritrjeni ribosomi. Notranjost jedra in citoplazma sta povezani s porami v jedrnem ovoju.',
    q: 'Opiši zgradbo jedra.',
    kp: ['jedrni ovoj iz dveh membran', 'na površini ovoja so ribosomi', 'pore povezujejo notranjost jedra in citoplazmo', 'v jedru je jedrce'] },
  { id: 'jedro.mesto', topic: 'organeli', page: 8, org: 'jedro', label: 'Mesto jedra',
    text: 'Jedro je samostojen organel; njegovo mesto v celici se spreminja.' },
  { id: 'jedro.kromatin', topic: 'organeli', page: 8, org: 'jedro', label: 'Kromatin in kromosomi',
    text: 'Molekule DNK so povezane s posebnimi jedrnimi beljakovinami, histoni. Skupaj tvorijo nitast preplet, kromatin. Med delitvijo celice se iz kromatina z dodatnim zvijanjem izoblikujejo kromosomi.',
    q: 'Kaj je kromatin in kako nastanejo kromosomi?',
    kp: ['DNK je povezana z jedrnimi beljakovinami histoni', 'skupaj tvorita nitast preplet, kromatin', 'med delitvijo celice', 'z dodatnim zvijanjem kromatina nastanejo kromosomi'] },
  { id: 'jedro.zapis', topic: 'organeli', page: 8, org: 'jedro', label: 'Jedro in lastnosti celice',
    text: 'V jedru je večina DNK. Molekule DNK nosijo dedni zapis za beljakovine; od tega zapisa so odvisne lastnosti celice in živega bitja, ki ga te celice sestavljajo.',
    q: 'Zakaj je jedro pomembno za lastnosti celice in organizma?',
    kp: ['v jedru je večina DNK', 'DNK nosi dedni zapis za beljakovine', 'od zapisa so odvisne lastnosti celice', 'in lastnosti živega bitja'] },
  { id: 'jedrce', topic: 'organeli', page: 8, org: 'jedrce', label: 'Jedrce',
    text: 'Jedrce je področje znotraj jedra, v katerem nastajajo večje in manjše podenote ribosomov.',
    q: 'Kaj je jedrce in kaj nastaja v njem?', kp: ['področje znotraj jedra', 'nastajajo podenote ribosomov', 'večje in manjše podenote'] },
  { id: 'mito.zgradba', topic: 'organeli', page: 9, org: 'mitohondrij', label: 'Zgradba mitohondrija',
    text: 'Mitohondrij ima zunanjo membrano, notranjo nagubano membrano in matriks, v katerem so krožne molekule DNK in ribosomi. V citoplazmi je kot samostojen organel.',
    q: 'Opiši zgradbo in vlogo mitohondrija.',
    kp: ['zunanja membrana', 'notranja nagubana membrana', 'matriks s krožno DNK in ribosomi', 'celično dihanje, nastanek ATP (energija)'] },
  { id: 'mito.vloga', topic: 'organeli', page: 9, org: 'mitohondrij', label: 'Vloga mitohondrija',
    text: 'V mitohondriju poteka celično dihanje (nastanek ATP, energija).' },
  { id: 'plastidi.def', topic: 'organeli', page: 9, org: 'kloroplast', label: 'Plastidi',
    text: 'Plastidi so značilni za rastlinske celice in so po zgradbi podobni mitohondrijem. Najpomembnejši so kloroplasti, ker v njih poteka fotosinteza.' },
  { id: 'kloro.zgradba', topic: 'organeli', page: 9, org: 'kloroplast', label: 'Zgradba kloroplasta',
    text: 'Kloroplast obdajata zunanja in notranja membrana. V notranjosti je stroma (matriks), v katero se zajeda tilakoidna membrana (izvira iz notranje membrane) in tvori sploščene tvorbe, tilakoide. Tilakoide, nanizane ena nad drugo, tvorijo granume. V kloroplastu sta tudi kloroplastna DNK in ribosomi.',
    q: 'Opiši zgradbo kloroplasta.',
    kp: ['dve membrani: zunanja in notranja', 'v notranjosti je stroma (matriks)', 'tilakoidna membrana izvira iz notranje membrane in tvori tilakoide', 'nanizane tilakoide tvorijo granume', 'v tilakoidni membrani so pigmenti, zlasti klorofil', 'kloroplastna DNK in ribosomi'] },
  { id: 'kloro.pigment', topic: 'organeli', page: 10, org: 'kloroplast', label: 'Klorofil',
    text: 'V tilakoidni membrani so številni pigmenti, zlasti zeleno barvilo klorofil.' },
  { id: 'skrobna', topic: 'organeli', page: 10, org: 'skrobna', label: 'Škrobna zrna',
    text: 'Škrobna zrna so specializirani plastidi za shranjevanje škroba.' },
  { id: 'centrioli', topic: 'organeli', page: 10, org: 'centrioli', label: 'Centrioli',
    text: 'Centrioli so v citoplazmi v bližini jedra in so vpleteni v celično delitev. Prisotni so v živalskih celicah in le v nekaterih rastlinskih celicah nižjih ravni.',
    q: 'Kje so centrioli, kakšna je njihova vloga in pri katerih celicah jih najdemo?',
    kp: ['v citoplazmi v bližini jedra', 'vpleteni v celično delitev', 'prisotni v živalskih celicah', 'le v nekaterih rastlinskih celicah nižjih ravni'] },

  // 4. Ogrodje, membrana, stena
  { id: 'citoskelet.zgradba', topic: 'ovoj', page: 10, org: 'citoskelet', label: 'Zgradba celičnega ogrodja',
    text: 'Celično ogrodje je preplet beljakovin, ki tvorijo nitke ali cevke: mikrofilamenti, intermediarni filamenti in mikrotubuli.',
    q: 'Kaj je celično ogrodje in kakšna je njegova vloga?',
    kp: ['preplet beljakovin', 'nitke ali cevke', 'mikrofilamenti, intermediarni filamenti, mikrotubuli', 'vzdržuje obliko celice', 'opora organelom in določa njihov položaj', 'premikanje celice in spreminjanje oblike'] },
  { id: 'citoskelet.vloga', topic: 'ovoj', page: 10, org: 'citoskelet', label: 'Vloga celičnega ogrodja',
    text: 'Celično ogrodje vzdržuje obliko celice, je opora organelom in določa njihov položaj, omogoča premikanje celice in spreminjanje njene oblike.' },
  { id: 'migetalke', topic: 'ovoj', page: 11, org: 'migetalke', label: 'Migetalke in bički',
    text: 'Migetalke in bički so iz mikrotubulov, zasidrani so v celični membrani in štrlijo v okolico. Omogočajo premikanje celice. Prisotni so pri živalskih celicah in le pri nekaterih rastlinskih (nekaterih enoceličnih algah).',
    q: 'Opiši migetalke in bičke.',
    kp: ['zgrajeni iz mikrotubulov', 'zasidrani v celični membrani in štrlijo v okolico', 'omogočajo premikanje celice', 'prisotni pri živalskih celicah, le pri nekaterih rastlinskih (enocelične alge)'] },
  { id: 'membrana.vloga', topic: 'ovoj', page: 11, org: 'membrana', label: 'Vloga celične membrane',
    text: 'Celična membrana (plazmalema) obdaja celico, ji daje obliko in zaščito ter nadzoruje prehajanje snovi v celico in iz nje (polprepustna).',
    q: 'Kakšna je vloga celične membrane?',
    kp: ['obdaja celico', 'daje obliko in zaščito', 'nadzoruje prehajanje snovi v celico in iz nje', 'je polprepustna (izbirno prepustna)'] },
  { id: 'mozaik.zgradba', topic: 'ovoj', page: 11, org: 'membrana', label: 'Model tekočega mozaika',
    text: 'Model tekočega mozaika je trenutno veljavni model zgradbe membran. Sestavlja ga dvosloj fosfolipidov, katerih hidrofobni repi (odbijajo vodo) so obrnjeni v notranjost dvosloja. Lipidni dvosloj je precej tekoč, proteini pa v njem nekako plavajo.',
    q: 'Opiši model tekočega mozaika.',
    kp: ['trenutno veljavni model zgradbe membran', 'dvosloj fosfolipidov', 'hidrofobni repi so obrnjeni v notranjost dvosloja', 'lipidni dvosloj je tekoč', 'proteini v njem plavajo', 'proteini sodelujejo tudi pri aktivnem transportu'] },
  { id: 'mozaik.proteini', topic: 'ovoj', page: 11, org: 'membrana', label: 'Proteini v membrani',
    text: 'Celični proteini v membrani opravljajo številne naloge, med drugim lahko sodelujejo pri aktivnem transportu.' },
  { id: 'stena', topic: 'ovoj', page: 12, org: 'stena', label: 'Celična stena',
    text: 'Celična stena obdaja celico z zunanje strani celične membrane. Je izloček celice in v odraslem stanju neživi del celice. Pri rastlinski celici je iz več plasti polisaharida celuloze, daje trdnost in ščiti pred spremembami turgorja. Pri živalskih celicah je ni.',
    q: 'Opiši celično steno.',
    kp: ['obdaja celico z zunanje strani celične membrane', 'je izloček celice, v odraslem stanju neživi del', 'pri rastlinah iz več plasti celuloze (polisaharid)', 'daje trdnost', 'ščiti pred spremembami turgorja', 'živalske celice je nimajo'] },

  // 5. Rastlinska in živalska celica
  { id: 'rz.razlike', topic: 'primerjava', page: 13, label: 'Rastlinska proti živalski',
    text: 'Rastlinska celica: celulozna celična stena, kloroplasti, vakuole, avtotrofna, pravilne oblike. Živalska celica: brez celulozne stene, brez kloroplastov, vakuole le v nekaterih celicah, heterotrofna, nepravilne oblike.',
    q: 'Naštej razlike med rastlinsko in živalsko celico.',
    kp: ['rastlinska ima celulozno celično steno, živalska ne', 'rastlinska ima kloroplaste, živalska ne', 'rastlinska ima vakuole, živalska le v nekaterih celicah', 'rastlinska je avtotrofna, živalska heterotrofna', 'rastlinska ima pravilno obliko, živalska ne'] },
  { id: 'rz.prehrana', topic: 'primerjava', page: 13, label: 'Avtotrofne in heterotrofne',
    text: 'Rastlinske celice so avtotrofne, živalske heterotrofne.' },
  { id: 'rz.oblika', topic: 'primerjava', page: 13, label: 'Oblika celic',
    text: 'Rastlinske celice so pravilnih oblik, živalske nimajo pravilnih oblik.' },

  // 6. Svetlobni mikroskop (iz prejšnjih ur)
  { id: 'svm.deli', topic: 'mikroskop', page: 'prejšnje ure', label: 'Deli svetlobnega mikroskopa',
    text: 'Okular, tubus, revolver, objektivi, stativ, predmetna mizica, preparat, makrometrski vijak, mikrometrski vijak, noga, vir svetlobe.' },
  { id: 'svm.vijaka', topic: 'mikroskop', page: 'prejšnje ure', label: 'Makrometrski in mikrometrski vijak',
    text: 'Z makrometrskim vijakom grobo izostrimo sliko, z mikrometrskim fino.' },
  { id: 'svm.povecava', topic: 'mikroskop', page: 'prejšnje ure', label: 'Skupna povečava',
    text: 'Skupna povečava = povečava okularja × povečava objektiva (npr. 10× · 40× = 400×).',
    q: 'Kako izračunaš skupno povečavo mikroskopa? Navedi primer.',
    kp: ['pomnožiš povečavo okularja in objektiva', 'primer: okular 10×, objektiv 40× da 400×'] },
  { id: 'svm.enote', topic: 'mikroskop', page: 'prejšnje ure', label: 'Enote: mm, µm, nm',
    text: '1 mm = 1000 µm, 1 µm = 1000 nm.' },
]

export const CON: Record<string, Concept> = Object.fromEntries(CONCEPTS.map(c => [c.id, c]))

export interface Topic {
  id: TopicId
  title: string
  sub: string
  pages: string
  tint: string // barva iz palete organelov
}

export const TOPICS: Topic[] = [
  { id: 'osnove', title: 'Celica in vrste celic', sub: 'Definicija, prokarionti in evkarionti, citoplazma', pages: 'str. 1 do 3', tint: 'var(--o-jedro)' },
  { id: 'teorija', title: 'Celična teorija', sub: 'Mejniki, mikroskopi, TEM in SEM', pages: 'str. 4', tint: 'var(--o-golgi)' },
  { id: 'organeli', title: 'Organeli', sub: 'ER, ribosomi, GA, jedro, mitohondrij, kloroplast ...', pages: 'str. 5 do 10', tint: 'var(--o-mito)' },
  { id: 'ovoj', title: 'Ogrodje, membrana, stena', sub: 'Citoskelet, migetalke, tekoči mozaik, celuloza', pages: 'str. 10 do 12', tint: 'var(--o-zer)' },
  { id: 'primerjava', title: 'Rastlinska in živalska', sub: 'Pet razlik, ki jih moraš znati', pages: 'str. 13', tint: 'var(--o-kloro)' },
  { id: 'mikroskop', title: 'Svetlobni mikroskop', sub: 'Deli, povečava, enote', pages: 'prejšnje ure', tint: 'var(--o-centri)' },
]

export const TOP: Record<TopicId, Topic> = Object.fromEntries(TOPICS.map(t => [t.id, t])) as Record<TopicId, Topic>

export const conceptsOf = (t: TopicId) => CONCEPTS.filter(c => c.topic === t)
