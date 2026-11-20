import type { Task } from '../data/bank'
import { MCTask, TFTask, OddTask, FixTask, TypeTask, RecallTask } from './basic'
import { ClozeTask, MatchTask, SortTask, OrderTask, TableTask } from './arrange'
import { LocateTask, IdentifyTask, LabelsTask, ScaleTask } from './visual'
import { ExplainTask } from './explain'
import type { TaskProps } from './shared'

export function TaskView(p: TaskProps) {
  const t = p.task as Task
  switch (t.t) {
    case 'mc': return <MCTask {...p} task={t} />
    case 'tf': return <TFTask {...p} task={t} />
    case 'odd': return <OddTask {...p} task={t} />
    case 'fix': return <FixTask {...p} task={t} />
    case 'type': return <TypeTask {...p} task={t} />
    case 'recall': return <RecallTask {...p} task={t} />
    case 'cloze': return <ClozeTask {...p} task={t} />
    case 'match': return <MatchTask {...p} task={t} />
    case 'sort': return <SortTask {...p} task={t} />
    case 'order': return <OrderTask {...p} task={t} />
    case 'table': return <TableTask {...p} task={t} />
    case 'locate': return <LocateTask {...p} task={t} />
    case 'identify': return <IdentifyTask {...p} task={t} />
    case 'labels': return <LabelsTask {...p} task={t} />
    case 'scale': return <ScaleTask {...p} task={t} />
    case 'explain': return <ExplainTask {...p} task={t} />
  }
}
