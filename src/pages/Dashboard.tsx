import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { add, nice, parse, today } from '../lib/dates'

export default function Dashboard() {
  const [wk, setWk] = useState(0)
  const t = today()
  const mon = add(t, -((parse(t).getDay() + 6) % 7) + wk * 7)
  const sun = add(mon, 6)
  const ex = useLiveQuery(() => db.ex.toArray(), []) ?? []
  const hols = useLiveQuery(() => db.holidays.toArray(), []) ?? []
  const logs = useLiveQuery(() => db.logs.where('date').between(mon, sun, true, true).toArray(), [mon, sun]) ?? []

  let attD = 0, planD = 0, done = 0, plan = 0
  const miss: Record<string, { p: number; d: number }> = {}
  const days = [0, 1, 2, 3, 4, 5, 6].map(i => {
    const d = add(mon, i)
    const pl = ex.filter(e => e.days.includes(parse(d).getDay()))
    const h = hols.find(x => x.date === d)
    const l = logs.find(x => x.date === d)
    const dn = pl.filter(e => l?.done[e.id]?.ok).length
    let tag = 'Rest', cls = 'text-mut'
    if (h) { tag = 'Holiday'; cls = 'text-hol' }
    else if (pl.length) {
      if (d > t) tag = 'Upcoming'
      else if (l?.att) { tag = 'Present'; cls = 'text-ok' }
      else if (d === t) tag = 'Not marked'
      else { tag = 'Absent'; cls = 'text-bad' }
    }
    if (!h && pl.length && d <= t) {
      planD++; if (l?.att) attD++
      plan += pl.length; done += dn
      pl.forEach(e => { const m = (miss[e.name] ??= { p: 0, d: 0 }); m.p++; if (l?.done[e.id]?.ok) m.d++ })
    }
    return { d, pl, h, dn, tag, cls }
  })
  const pct = plan ? Math.round((done / plan) * 100) : 0
  const skipped = Object.entries(miss).filter(([, m]) => m.d < m.p)

  return (
    <>
      <h1 className="h1">Dashboard</h1>
      <div className="card flex items-center justify-between">
        <button className="btn" onClick={() => setWk(wk - 1)}>‹</button>
        <div className="text-center">
          <b>{nice(mon)} – {nice(sun)}</b>
          {wk !== 0 && <div className="text-sm text-mut cursor-pointer" onClick={() => setWk(0)}>This week</div>}
        </div>
        <button className="btn" onClick={() => setWk(wk + 1)}>›</button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="card">
          <div className="text-sm text-mut">Attendance</div>
          <div className="text-3xl font-extrabold tracking-tight">{attD} / {planD}</div>
          <div className="text-sm text-mut">gym days</div>
        </div>
        <div className="card">
          <div className="text-sm text-mut">Exercises done</div>
          <div className="text-3xl font-extrabold tracking-tight">{done} / {plan}</div>
          <div className="h-2 mt-1.5 rounded-full bg-bg border border-line overflow-hidden"><i className="block h-full bg-acc" style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      <h2 className="h2">Days</h2>
      {days.map(x => (
        <Link key={x.d} to={`/?d=${x.d}`} className="card flex items-center justify-between">
          <div>
            <b>{nice(x.d)}</b>
            <div className="text-sm text-mut">{x.h ? x.h.label : x.pl.length ? `${x.dn} / ${x.pl.length} exercises` : 'No exercises planned'}</div>
          </div>
          <span className={`tag ${x.cls}`}>{x.tag}</span>
        </Link>
      ))}

      <h2 className="h2">Skipped this week</h2>
      {skipped.length
        ? skipped.map(([n, m]) => (
            <div key={n} className="card flex justify-between"><b>{n}</b><span className="text-sm text-mut">{m.d} / {m.p} done</span></div>
          ))
        : <div className="empty">{plan ? 'Nothing skipped. Nice.' : 'No data yet for this week.'}</div>}
    </>
  )
}
