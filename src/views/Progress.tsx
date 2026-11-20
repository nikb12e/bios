import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Volume2, Sparkles, Trash, Pencil, Hash } from 'lucide-react'
import type { Nav } from '../App'
import { useStore, set, resetAll, dayKey } from '../engine/store'
import { useAuth, setPassword, deleteAccount, rename } from '../engine/auth'
import { topicMastery, orgMastery, levelCounts, forecast, accuracy } from '../engine/stats'
import { TOPICS } from '../data/concepts'
import { LEVEL_NAME } from '../engine/fsrs'
import { Avatar, CountUp, Screen, Group, Row, Toggle, Sheet, TOPIC_LOOK } from '../ui/kit'
import { Shape, WavyRing } from '../ui/flux'
import { AnimalCell } from '../art/Cells'
import { GOAL } from './Home'

const LV_COLOR = { nov: 'var(--fill)', ucim: 'var(--amber)', utrjujem: 'var(--sky)', obvladam: 'var(--green)' }
const WD = ['ned', 'pon', 'tor', 'sre', 'čet', 'pet', 'sob']

export default function Progress({ nav }: { nav: Nav }) {
  const s = useStore(x => x)
  const { user, offline } = useAuth()
  const total = topicMastery(s)
  const lv = levelCounts(s)
  const all = lv.nov + lv.ucim + lv.utrjujem + lv.obvladam
  const fc = forecast(s)
  const week = Array.from({ length: 7 }, (_, i) => { const t = Date.now() - (6 - i) * 86400000; const k = dayKey(t); return { k, wd: WD[new Date(t).getDay()], n: s.days[k]?.n ?? 0, ok: s.days[k]?.ok ?? 0 } })
  const weekN = week.reduce((a, d) => a + d.n, 0)
  const maxN = Math.max(GOAL, ...week.map(d => d.n))
  const [edit, setEdit] = useState<'' | 'name' | 'pw' | 'delete'>('')
  const settings = (k: 'sound' | 'ai') => set(x => ({ ...x, settings: { ...x.settings, [k]: !x.settings[k] } }))

  return (
    <Screen title="Napredek" tone="sky" deco={['gem', 'sunny']} sub={user ? (offline ? 'Brez povezave · uskladi se pozneje' : user.email) : undefined}
      right={user ? <button onClick={() => document.getElementById('racun')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Račun"><Avatar name={user.name} src={user.picture} size={42} /></button> : undefined}>

      <div className="bento">
        <motion.div className="tile t-ink span2" initial={{ opacity: 0, y: 22, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.28, duration: 0.7 }}>
          <Shape kind="cookie12" size={220} spin={90} className="deco" style={{ right: -70, top: -80 }} />
          <div className="row" style={{ gap: 18, alignItems: 'center' }}>
            <WavyRing value={total} size={124} stroke={10} color="var(--lime)">
              <div style={{ lineHeight: 1 }}><div className="big sm" style={{ color: 'var(--on-dock)' }}><CountUp to={Math.round(total * 100)} /><span className="unit">%</span></div><div className="cap" style={{ color: 'color-mix(in srgb, var(--on-dock) 60%, transparent)', marginTop: 4 }}>znanja</div></div>
            </WavyRing>
            <div className="grow stack" style={{ gap: 8 }}>
              {(['obvladam', 'utrjujem', 'ucim', 'nov'] as const).map(k => (
                <div key={k} className="row" style={{ gap: 9, fontSize: 15 }}>
                  <span className="legend-dot" style={{ background: k === 'nov' ? 'color-mix(in srgb, var(--on-dock) 22%, transparent)' : LV_COLOR[k], width: 12, height: 12 }} />
                  <span className="grow" style={{ opacity: 0.8 }}>{LEVEL_NAME[k]}</span>
                  <span className="num" style={{ fontWeight: 780 }}>{lv[k]}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 3, height: 12, marginTop: 6 }}>
            {(['obvladam', 'utrjujem', 'ucim'] as const).map(k => <motion.div key={k} initial={{ width: 0 }} animate={{ width: `${(lv[k] / all) * 100}%` }} transition={{ type: 'spring', bounce: 0, duration: 0.9 }} style={{ background: LV_COLOR[k], borderRadius: 99, minWidth: lv[k] ? 12 : 0 }} />)}
            <div style={{ flex: 1, borderRadius: 99, background: 'color-mix(in srgb, var(--on-dock) 14%, transparent)' }} />
          </div>
        </motion.div>
      </div>

      <Group header="Zadnjih 7 dni" footer={`${weekN} nalog · natančnost ${Math.round(accuracy(s) * 100)} % · dnevni cilj ${GOAL} nalog`}>
        <div className="li" style={{ display: 'block', padding: '18px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${(GOAL / maxN) * 100}%`, borderTop: '1px dashed var(--line-2)' }} />
            {week.map((d, i) => (
              <div key={d.k} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} title={`${d.n} nalog`}>
                <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ type: 'spring', bounce: 0.15, duration: 0.7, delay: i * 0.03 }}
                  style={{ transformOrigin: 'bottom', height: `${Math.max(8, (d.n / maxN) * 100)}%`, borderRadius: 99, background: d.n >= GOAL ? 'var(--lime)' : d.n ? 'var(--ink)' : 'var(--fill)', boxShadow: d.n >= GOAL ? 'inset 0 0 0 2px var(--on-lime)' : undefined }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>{week.map((d, i) => <div key={d.k} className="cap" style={{ flex: 1, textAlign: 'center', fontWeight: i === 6 ? 700 : 400, color: i === 6 ? 'var(--ink)' : undefined }}>{i === 6 ? 'danes' : d.wd}</div>)}</div>
        </div>
      </Group>

      <Group header="Po sklopih">
        {TOPICS.map(t => {
          const m = topicMastery(s, t.id)
          const look = TOPIC_LOOK[t.id]
          return <Row key={t.id} lead={<Shape kind={look.shape} size={38} fill={`var(--${look.tone}-c)`}><span style={{ fontSize: 11, fontWeight: 800, color: `var(--on-${look.tone})` }}>{Math.round(m * 100)}</span></Shape>} title={t.title} value={`${Math.round(m * 100)} %`} onClick={() => nav.lesson(t.id)} />
        })}
      </Group>

      <Group header="Celica znanja" footer="Bolj ko je organel obarvan, bolje ga znaš.">
        <div className="li" style={{ display: 'block', padding: 12 }}><AnimalCell kind="animal" mastery={orgMastery(s)} /></div>
      </Group>

      <Group header="Ponovitve v naslednjih 7 dneh">
        <div className="li" style={{ display: 'block', padding: '16px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 74 }}>
            {fc.map((n, i) => <div key={i} style={{ flex: 1, textAlign: 'center' }}><div className="cap num" style={{ marginBottom: 3, fontWeight: 700 }}>{n || ''}</div><div style={{ height: Math.max(8, Math.min(50, n * 5)), borderRadius: 99, background: i === 0 ? 'var(--sky)' : 'var(--sky-c)' }} /></div>)}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>{fc.map((_, i) => <div key={i} className="cap" style={{ flex: 1, textAlign: 'center' }}>{i === 0 ? 'danes' : i === 1 ? 'jutri' : WD[new Date(Date.now() + i * 86400000).getDay()]}</div>)}</div>
        </div>
      </Group>

      {s.tests.length > 0 && (
        <Group header="Preizkusi">
          {s.tests.slice(-5).reverse().map(t => (
            <Row key={t.at} lead={<span className="ico" style={{ background: t.grade >= 4 ? 'var(--green)' : t.grade >= 2 ? 'var(--amber)' : 'var(--bad)', fontWeight: 800, fontSize: 17 }}>{t.grade}</span>}
              title={`${Math.round(t.pct * 100)} % pravilno`} sub={`${new Date(t.at).toLocaleDateString('sl-SI')} · ${t.n} nalog`} />
          ))}
        </Group>
      )}

      <Group header="Nastavitve">
        <Row icon={<Volume2 size={17} />} tint="var(--coral)" title="Zvok ob odgovoru" right={<Toggle on={s.settings.sound} />} onClick={() => settings('sound')} chevron={false} />
        <Row icon={<Sparkles size={17} />} tint="var(--ink)" title="AI ocenjevanje in naloge" right={<Toggle on={s.settings.ai} />} onClick={() => settings('ai')} chevron={false} />
        <Row icon={<Hash size={17} />} tint="var(--sky)" title="Novih pojmov na trening"
          right={<span className="row" style={{ gap: 4 }}>{[3, 5, 8].map(n => <button key={n} className={`chip ${s.settings.newPerSession === n ? 'on' : ''}`} style={{ height: 30, padding: '0 11px' }} onClick={e => { e.stopPropagation(); set(x => ({ ...x, settings: { ...x.settings, newPerSession: n } })) }}>{n}</button>)}</span>} />
      </Group>

      {user && (
        <div id="racun">
          <Group header="Profil" footer="Open source različica: napredek je shranjen samo v tem brskalniku.">
            <Row icon={<Pencil size={16} />} tint="var(--amber)" title="Ime" value={user.name} onClick={() => setEdit('name')} />
            <Row icon={<Trash size={16} />} tint="var(--amber)" title="Ponastavi napredek" danger onClick={() => { if (window.confirm('Res izbrišem ves napredek v tem brskalniku?')) resetAll() }} chevron={false} />
          </Group>
        </div>
      )}
      <div className="cap" style={{ textAlign: 'center', marginTop: 22 }}>Bios · oblikovni jezik Živa · XTRSlab · open source</div>

      <AccountSheet mode={edit} onClose={() => setEdit('')} name={user?.name ?? ''} />
    </Screen>
  )
}

function AccountSheet({ mode, onClose, name }: { mode: '' | 'name' | 'pw' | 'delete'; onClose: () => void; name: string }) {
  const [val, setVal] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [lastMode, setLastMode] = useState(mode)
  if (mode !== lastMode) { setLastMode(mode); setVal(mode === 'name' ? name : ''); setMsg('') }
  const run = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setMsg('')
    try {
      if (mode === 'name') { await rename(val); set(x => ({ ...x, settings: { ...x.settings, name: val.split(' ')[0] || x.settings.name } })) }
      else if (mode === 'pw') { if (val.length < 8) throw new Error('Geslo naj ima vsaj 8 znakov.'); await setPassword(val) }
      else if (mode === 'delete') { if (val !== 'IZBRIŠI') throw new Error('Za potrditev vpiši IZBRIŠI.'); await deleteAccount(); return }
      onClose()
    } catch (x) { setMsg((x as Error).message) }
    setBusy(false)
  }
  const title = mode === 'name' ? 'Ime' : mode === 'pw' ? 'Geslo' : 'Izbriši račun'
  return (
    <Sheet open={!!mode} onClose={onClose} title={<span className="t3">{title}</span>}>
      <form onSubmit={run} className="stack" style={{ gap: 12, paddingTop: 4 }}>
        {mode === 'delete' && <div className="sub" style={{ color: 'var(--bad)' }}>Izbriše račun in ves napredek v oblaku. Tega ni mogoče razveljaviti. Za potrditev vpiši IZBRIŠI.</div>}
        {mode === 'pw' && <div className="sub">Novo geslo odjavi vse druge naprave.</div>}
        <input className="field" autoFocus type={mode === 'pw' ? 'password' : 'text'} autoComplete={mode === 'pw' ? 'new-password' : 'off'} placeholder={mode === 'name' ? 'Ime' : mode === 'pw' ? 'Novo geslo (vsaj 8 znakov)' : 'IZBRIŠI'} value={val} onChange={e => setVal(e.target.value)} maxLength={mode === 'name' ? 40 : 200} />
        {msg && <div className="auth-msg bad">{msg}</div>}
        <button className={`btn full ${mode === 'delete' ? 'bad' : 'accent'}`} disabled={busy || !val} type="submit">{busy ? <span className="spin" /> : mode === 'delete' ? 'Izbriši račun' : 'Shrani'}</button>
      </form>
    </Sheet>
  )
}
