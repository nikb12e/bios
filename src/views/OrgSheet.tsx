import { Dumbbell, Check, X, Minus } from 'lucide-react'
import { DetailView } from '../art/Details'
import { ORG, type OrgId } from '../data/organelles'
import { Sheet, Dot, ORG_COLOR } from '../ui/kit'
import { useStore } from '../engine/store'
import { orgMastery } from '../engine/stats'

export function OrgInfo({ id, onPractice, compact }: { id: OrgId; onPractice?: (id: OrgId) => void; compact?: boolean }) {
  const s = useStore(x => x)
  const o = ORG[id]
  const m = orgMastery(s)[id] ?? 0
  const pres = (v: boolean | 'nekatere') => v === true ? <Check size={14} strokeWidth={3} color="var(--accent)" /> : v === 'nekatere' ? <Minus size={14} strokeWidth={3} color="var(--warn)" /> : <X size={14} strokeWidth={3} color="var(--bad)" />
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="sub" style={{ marginTop: -4 }}>{o.short}</div>
      {o.detail && <div className="stage" style={{ padding: compact ? 4 : 8, background: 'var(--card)' }}><DetailView id={o.detail} mode="study" /></div>}
      <dl className="kv">
        {o.mesto && <><dt>Mesto</dt><dd>{o.mesto}</dd></>}
        {o.zgradba && <><dt>Zgradba</dt><dd>{o.zgradba}</dd></>}
        <dt>Vloga</dt><dd>{o.vloga}</dd>
      </dl>
      {o.pazi && <div className="pazi"><b>Pazi</b><span>{o.pazi}</span></div>}
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        <span className="badge">{pres(o.presence.zival)} živalska</span>
        <span className="badge">{pres(o.presence.rastl)} rastlinska</span>
        <span className="badge">{pres(o.presence.prok)} prokariontska</span>
        <span className="cap grow" style={{ textAlign: 'right' }}>Zapiski, str. {o.page}</span>
      </div>
      <div className="row">
        <div className="grow">
          <div className="cap">Tvoje znanje</div>
          <div className="bar" style={{ marginTop: 6 }}><i style={{ width: `${Math.round(m * 100)}%` }} /></div>
        </div>
        {onPractice && <button className="btn sm" onClick={() => onPractice(o.id)}><Dumbbell size={16} /> Vadi</button>}
      </div>
    </div>
  )
}

export function OrgSheet({ id, onClose, onPractice }: { id: OrgId | null; onClose: () => void; onPractice?: (id: OrgId) => void }) {
  const o = id ? ORG[id] : null
  return (
    <Sheet open={!!o} onClose={onClose} title={o && <div className="row"><Dot color={ORG_COLOR[o.id]} size={12} /><span className="t3">{o.name}</span></div>}>
      {o && <OrgInfo id={o.id} onPractice={onPractice} />}
    </Sheet>
  )
}
