import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, patchLog } from '../db'
import { add, nice, parse, today } from '../lib/dates'
import { groupByParent } from '../lib/group'
import { Thumb } from '../components/ui'

export default function Today() {
  const [sp] = useSearchParams()
  const [cur, setCur] = useState(sp.get('d') || today())
  const ex = useLiveQuery(() => db.ex.toArray(), []) ?? []
  const log = useLiveQuery(() => db.logs.get(cur), [cur])
  const hol = useLiveQuery(() => db.holidays.get(cur), [cur])
  const wd = parse(cur).getDay()
  const list = ex.filter(e => e.days.includes(wd))
  const groups = groupByParent(list)
  const done = list.filter(e => log?.done[e.id]?.ok).length
  const isToday = cur === today()

  const toggleDone = (id: string) =>
    patchLog(cur, l => { l.done[id] = { ok: !l.done[id]?.ok, note: l.done[id]?.note ?? '' } })
  const saveNote = (id: string, note: string) =>
    patchLog(cur, l => { l.done[id] = { ok: l.done[id]?.ok ?? false, note } })

  return (
    <>
      <h1 className="h1">{isToday ? 'Today' : nice(cur)}</h1>
      <div className="card flex items-center justify-between">
        <button className="btn" onClick={() => setCur(add(cur, -1))}>‹</button>
        <div className="text-center">
          <b>{nice(cur)}</b>
          {!isToday && <div className="text-sm text-mut cursor-pointer" onClick={() => setCur(today())}>Back to today</div>}
        </div>
        <button className="btn" onClick={() => setCur(add(cur, 1))}>›</button>
      </div>

      {hol && <div className="rounded-xl border border-dashed border-hol text-hol font-bold p-3 mb-2.5 bg-card">Holiday: {hol.label}</div>}

      <button
        className={`btn w-full p-4 text-lg font-extrabold ${log?.att ? 'bg-ok border-ok text-white' : ''}`}
        onClick={() => patchLog(cur, l => { l.att = !l.att })}
      >
        {log?.att ? '✓ Attended' : 'Mark attendance'}
      </button>

      <div className="flex items-center justify-between">
        <h2 className="h2">{groups.length ? groups.map(g => g[0]).join(' · ') : 'Exercises'}</h2>
        <span className="text-sm text-mut shrink-0 ml-2">{done} / {list.length} done</span>
      </div>

      {!list.length && <div className="empty">{ex.length ? 'Nothing planned for this day.' : 'No exercises yet. Add your routine in the Routine tab.'}</div>}

      {groups.map(([parent, items]) => (
        <section key={parent}>
          <div className="flex justify-between text-sm font-bold text-mut mt-3 mb-1.5">
            <span>{parent}</span>
            <span>{items.filter(e => log?.done[e.id]?.ok).length} / {items.length}</span>
          </div>
          {items.map(e => {
            const k = log?.done[e.id]
            return (
              <div key={e.id} className={`card flex gap-2.5 items-start ${k?.ok ? 'opacity-75' : ''}`}>
                <Thumb src={e.img} alt={e.name} />
                <div className="flex-1 min-w-0">
                  <div className={`font-bold ${k?.ok ? 'line-through' : ''}`}>{e.name}</div>
                  {e.target && <div className="text-sm text-mut">{e.target}</div>}
                  <input
                    key={cur + e.id + (k?.note ?? '')}
                    className="inp mt-1.5 py-1.5 text-sm"
                    placeholder="Sets × reps / weight (optional)"
                    defaultValue={k?.note ?? ''}
                    onBlur={ev => ev.target.value !== (k?.note ?? '') && saveNote(e.id, ev.target.value)}
                  />
                </div>
                <button
                  aria-label="Mark done"
                  className={`btn size-9 p-0 text-lg shrink-0 ${k?.ok ? 'bg-ok border-ok text-white' : ''}`}
                  onClick={() => toggleDone(e.id)}
                >✓</button>
              </div>
            )
          })}
        </section>
      ))}
    </>
  )
}
