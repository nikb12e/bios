import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Volume2, AudioLines, History, Sparkles, Trash, Pencil, Hash, KeyRound } from 'lucide-react'
import { PROVIDERS, getLlm, setLlm, testLlm, onLlmChange, type Provider } from '../engine/llm'
import type { Nav } from '../App'
import { useStore, set, resetAll, dayKey } from '../engine/store'
import { useAuth, setPassword, deleteAccount, rename } from '../engine/auth'
import { topicMastery, orgMastery, levelCounts, forecast, accuracy } from '../engine/stats'
import { TOPICS, CONCEPTS } from '../data/concepts'
import { levelOfConcept } from '../engine/gen'
import { fmt1 } from '../engine/adapt'
import { LEVEL_NAME } from '../engine/fsrs'
import { Avatar, CountUp, Screen, Group, Row, Toggle, Sheet, TOPIC_LOOK } from '../ui/kit'
import { Shape, WavyRing } from '../ui/flux'
import { AnimalCell } from '../art/Cells'
import { GOAL } from './Home'
import { VersionsSheet } from './Versions'
import { CURRENT } from '../data/versions'

const LV_COLOR = { nov: 'var(--fill)', ucim: 'var(--amber)', utrjujem: 'var(--sky)', obvladam: 'var(--green)' }
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
  const [keySheet, setKeySheet] = useState(false)
  const [vh, setVh] = useState(false)
  const [llm, setLlmState] = useState(getLlm())
  useEffect(() => onLlmChange(() => setLlmState(getLlm())), [])
  const settings = (k: 'sound' | 'ai' | 'voice') => set(x => ({ ...x, settings: { ...x.settings, [k]: !x.settings[k] } }))

  return (
    <Screen title="Progress" tone="sky" deco={['gem', 'sunny']} sub={user ? (offline ? 'Offline · syncs later' : user.email) : undefined}
      right={user ? <button onClick={() => document.getElementById('racun')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Account"><Avatar name={user.name} src={user.picture} size={42} /></button> : undefined}>

      <div className="bento">
        <motion.div className="tile t-ink span2" initial={{ opacity: 0, y: 22, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.28, duration: 0.7 }}>
          <Shape kind="cookie12" size={220} spin={90} className="deco" style={{ right: -70, top: -80 }} />
          <div className="row" style={{ gap: 18, alignItems: 'center' }}>
            <WavyRing value={total} size={124} stroke={10} color="var(--lime)">
              <div style={{ lineHeight: 1 }}><div className="big sm" style={{ color: 'var(--on-dock)' }}><CountUp to={Math.round(total * 100)} /><span className="unit">%</span></div><div className="cap" style={{ color: 'color-mix(in srgb, var(--on-dock) 60%, transparent)', marginTop: 4 }}>known</div></div>
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

      <Group header="Last 7 days" footer={`${weekN} tasks · accuracy ${Math.round(accuracy(s) * 100)} % · daily goal ${GOAL} tasks`}>
        <div className="li" style={{ display: 'block', padding: '18px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${(GOAL / maxN) * 100}%`, borderTop: '1px dashed var(--line-2)' }} />
            {week.map((d, i) => (
              <div key={d.k} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} title={`${d.n} tasks`}>
                <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ type: 'spring', bounce: 0.15, duration: 0.7, delay: i * 0.03 }}
                  style={{ transformOrigin: 'bottom', height: `${Math.max(8, (d.n / maxN) * 100)}%`, borderRadius: 99, background: d.n >= GOAL ? 'var(--lime)' : d.n ? 'var(--ink)' : 'var(--fill)', boxShadow: d.n >= GOAL ? 'inset 0 0 0 2px var(--on-lime)' : undefined }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>{week.map((d, i) => <div key={d.k} className="cap" style={{ flex: 1, textAlign: 'center', fontWeight: i === 6 ? 700 : 400, color: i === 6 ? 'var(--ink)' : undefined }}>{i === 6 ? 'today' : d.wd}</div>)}</div>
        </div>
      </Group>

      <Group header="By topic" footer="The knowledge level from 1 to 5 comes from which tasks you solve and how hard they are.">
        {TOPICS.map(t => {
          const m = topicMastery(s, t.id)
          const look = TOPIC_LOOK[t.id]
          const seen = CONCEPTS.filter(c => c.topic === t.id && (s.abil?.[c.id] || s.mem[c.id]))
          const lvl = seen.length ? seen.reduce((x, c) => x + levelOfConcept(c.id), 0) / seen.length : 0
          return <Row key={t.id} lead={<Shape kind={look.shape} size={38} fill={`var(--${look.tone}-c)`}><span style={{ fontSize: 11, fontWeight: 800, color: `var(--on-${look.tone})` }}>{Math.round(m * 100)}</span></Shape>} title={t.title}
            sub={seen.length ? `Knowledge level ${fmt1(lvl)}/5 · ${seen.length} of ${CONCEPTS.filter(c => c.topic === t.id).length} concepts checked` : 'Not checked yet'} value={`${Math.round(m * 100)} %`} onClick={() => nav.lesson(t.id)} />
        })}
      </Group>

      <Group header="Knowledge cell" footer="The more an organelle is coloured in, the better you know it.">
        <div className="li" style={{ display: 'block', padding: 12 }}><AnimalCell kind="animal" mastery={orgMastery(s)} /></div>
      </Group>

      <Group header="Reviews in the next 7 days">
        <div className="li" style={{ display: 'block', padding: '16px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 74 }}>
            {fc.map((n, i) => <div key={i} style={{ flex: 1, textAlign: 'center' }}><div className="cap num" style={{ marginBottom: 3, fontWeight: 700 }}>{n || ''}</div><div style={{ height: Math.max(8, Math.min(50, n * 5)), borderRadius: 99, background: i === 0 ? 'var(--sky)' : 'var(--sky-c)' }} /></div>)}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>{fc.map((_, i) => <div key={i} className="cap" style={{ flex: 1, textAlign: 'center' }}>{i === 0 ? 'today' : i === 1 ? 'tomorrow' : WD[new Date(Date.now() + i * 86400000).getDay()]}</div>)}</div>
        </div>
      </Group>

      {s.tests.length > 0 && (
        <Group header="Tests">
          {s.tests.slice(-5).reverse().map(t => (
            <Row key={t.at} lead={<span className="ico" style={{ background: t.grade >= 4 ? 'var(--green)' : t.grade >= 2 ? 'var(--amber)' : 'var(--bad)', fontWeight: 800, fontSize: 17 }}>{t.grade}</span>}
              title={`${Math.round(t.pct * 100)} % correct`} sub={`${new Date(t.at).toLocaleDateString('en-GB')} · ${t.n} tasks`} />
          ))}
        </Group>
      )}

      <Group header="Settings">
        <Row icon={<Volume2 size={17} />} tint="var(--coral)" title="Sound on answer" right={<Toggle on={s.settings.sound} />} onClick={() => settings('sound')} chevron={false} />
        <Row icon={<AudioLines size={17} />} tint="var(--violet)" title="Read explanations aloud" sub="An explanation reads itself when it appears" right={<Toggle on={!!s.settings.voice} />} onClick={() => settings('voice')} chevron={false} />
        <Row icon={<KeyRound size={16} />} tint="var(--violet, var(--ink))" title="AI key" value={llm ? PROVIDERS[llm.provider].name : 'Off'} onClick={() => setKeySheet(true)} />
        <Row icon={<Sparkles size={17} />} tint="var(--ink)" title="AI grading and tasks" right={<Toggle on={s.settings.ai} />} onClick={() => settings('ai')} chevron={false} />
        <Row icon={<Hash size={17} />} tint="var(--sky)" title="New concepts per session"
          right={<span className="row" style={{ gap: 4 }}>{[3, 5, 8].map(n => <button key={n} className={`chip ${s.settings.newPerSession === n ? 'on' : ''}`} style={{ height: 30, padding: '0 11px' }} onClick={e => { e.stopPropagation(); set(x => ({ ...x, settings: { ...x.settings, newPerSession: n } })) }}>{n}</button>)}</span>} />
      </Group>

      {user && (
        <div id="racun">
          <Group header="Profile" footer="Open source build: progress is stored only in this browser.">
            <Row icon={<Pencil size={16} />} tint="var(--amber)" title="Name" value={user.name} onClick={() => setEdit('name')} />
            <Row icon={<Trash size={16} />} tint="var(--amber)" title="Reset progress" danger onClick={() => { if (window.confirm('Really delete all progress in this browser?')) resetAll() }} chevron={false} />
          </Group>
          <Group>
            <Row icon={<History size={16} />} tint="var(--violet)" title="Version history" value={CURRENT} onClick={() => setVh(true)} />
          </Group>
        </div>
      )}
      <div className="cap" style={{ textAlign: 'center', marginTop: 22 }}>Bios · Živa design language · XTRSlab · open source</div>

      <VersionsSheet open={vh} onClose={() => setVh(false)} />
      <AccountSheet mode={edit} onClose={() => setEdit('')} name={user?.name ?? ''} />
      <AiKeySheet open={keySheet} onClose={() => setKeySheet(false)} />
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
      else if (mode === 'pw') { if (val.length < 8) throw new Error('The password must have at least 8 characters.'); await setPassword(val) }
      else if (mode === 'delete') { if (val !== 'DELETE') throw new Error('Type DELETE to confirm.'); await deleteAccount(); return }
      onClose()
    } catch (x) { setMsg((x as Error).message) }
    setBusy(false)
  }
  const title = mode === 'name' ? 'Name' : mode === 'pw' ? 'Password' : 'Delete account'
  return (
    <Sheet open={!!mode} onClose={onClose} title={<span className="t3">{title}</span>}>
      <form onSubmit={run} className="stack" style={{ gap: 12, paddingTop: 4 }}>
        {mode === 'delete' && <div className="sub" style={{ color: 'var(--bad)' }}>Deletes the account and all progress in the cloud. This cannot be undone. Type DELETE to confirm.</div>}
        {mode === 'pw' && <div className="sub">A new password signs out all other devices.</div>}
        <input className="field" autoFocus type={mode === 'pw' ? 'password' : 'text'} autoComplete={mode === 'pw' ? 'new-password' : 'off'} placeholder={mode === 'name' ? 'Name' : mode === 'pw' ? 'New password (at least 8 characters)' : 'DELETE'} value={val} onChange={e => setVal(e.target.value)} maxLength={mode === 'name' ? 40 : 200} />
        {msg && <div className="auth-msg bad">{msg}</div>}
        <button className={`btn full ${mode === 'delete' ? 'bad' : 'accent'}`} disabled={busy || !val} type="submit">{busy ? <span className="spin" /> : mode === 'delete' ? 'Delete account' : 'Save'}</button>
      </form>
    </Sheet>
  )
}

/** Bring your own key: provider, API key and model. The key stays in this browser and goes only to the chosen provider. */
function AiKeySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const saved = getLlm()
  const [provider, setProvider] = useState<Provider>(saved?.provider ?? 'openrouter')
  const [key, setKey] = useState(saved?.key ?? '')
  const [model, setModel] = useState(saved?.model ?? '')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const p = PROVIDERS[provider]
  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (key.trim().length < 12) { setMsg('Paste your API key first.'); return }
    setBusy(true); setMsg('')
    const cfg = { provider, key: key.trim(), model: model.trim() || p.model }
    const problem = await testLlm(cfg)
    setBusy(false)
    if (problem) { setMsg(problem); return }
    setLlm(cfg); setModel(cfg.model); onClose()
  }
  const remove = () => { setLlm(null); setKey(''); setModel(''); setMsg(''); onClose() }
  return (
    <Sheet open={open} onClose={onClose} title={<span className="t3">AI key</span>}>
      <form onSubmit={save} className="stack" style={{ gap: 12, paddingTop: 4 }}>
        <div className="sub">Add your own key to turn on AI grading of explanations, the oral exam and new AI tasks. With an OpenAI key, voice answers are transcribed too.</div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }} role="radiogroup" aria-label="Provider">
          {(Object.keys(PROVIDERS) as Provider[]).map(id => (
            <button type="button" key={id} role="radio" aria-checked={provider === id} className={`chip ${provider === id ? 'on' : ''}`} onClick={() => { setProvider(id); setModel(''); setMsg('') }}>{PROVIDERS[id].name}</button>
          ))}
        </div>
        <input className="field" type="password" autoComplete="off" spellCheck={false} placeholder={`API key (${p.keyHint})`} value={key} onChange={e => setKey(e.target.value)} aria-label="API key" />
        <input className="field" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder={`Model (default ${p.model})`} value={model} onChange={e => setModel(e.target.value)} aria-label="Model" />
        {msg && <div className="auth-msg bad">{msg}</div>}
        <button className="btn full accent" disabled={busy} type="submit">{busy ? <span className="spin" /> : 'Test and save'}</button>
        {saved && <button type="button" className="btn full ghost" onClick={remove}>Remove key</button>}
        <div className="cap" style={{ lineHeight: 1.5 }}>The key is stored only in this browser and is sent only to {p.name}. Usage is billed to your account there. Get a key at <a href={p.keysUrl} target="_blank" rel="noreferrer">{p.keysUrl.replace('https://', '')}</a>. Do not save a key on a shared device.</div>
      </form>
    </Sheet>
  )
}
