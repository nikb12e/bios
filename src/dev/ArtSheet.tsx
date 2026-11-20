import { AnimalCell, PlantCell, ProkCell } from '../art/Cells'
import { DETAILS, DetailView } from '../art/Details'
import type { DetailId } from '../data/organelles'

export default function ArtSheet() {
  const q = new URLSearchParams(location.search)
  const labels = q.get('labels') === '1'
  return (
    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, background: 'var(--bg)' }}>
      <div className="stage"><AnimalCell kind="animal" labels={labels} /></div>
      <div className="stage"><PlantCell kind="plant" labels={labels} /></div>
      <div className="stage"><ProkCell kind="prok" labels={labels} /></div>
      {(Object.keys(DETAILS) as DetailId[]).map(id => (
        <div key={id} className="stage"><div className="hl" style={{ padding: 6 }}>{DETAILS[id].title}</div><DetailView id={id} mode={q.get('pins') ? 'pins' : 'study'} /></div>
      ))}
    </div>
  )
}
