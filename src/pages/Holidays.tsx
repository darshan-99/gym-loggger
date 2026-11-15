import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, exportData, importData } from '../db'
import { add, nice, today } from '../lib/dates'

type Group = { start: string; end: string; label: string }

const rangeDates = (a: string, b: string) => {
  const out: string[] = []
  for (let d = a; d <= b; d = add(d, 1)) out.push(d)
  return out
}

export default function Holidays() {
  const [from, setFrom] = useState(today())
  const [to, setTo] = useState('')
  const [label, setLabel] = useState('')
  const hs = useLiveQuery(() => db.holidays.orderBy('date').toArray(), []) ?? []

  // Group consecutive days with the same name into one entry
  const groups: Group[] = []
  for (const h of hs) {
    const g = groups[groups.length - 1]
    if (g && g.label === h.label && add(g.end, 1) === h.date) g.end = h.date
    else groups.push({ start: h.date, end: h.date, label: h.label })
  }
  groups.reverse()

  async function addHoliday() {
    const end = to || from
    if (!from) return
    if (end < from) return alert('The end date is before the start date.')
    const days = rangeDates(from, end)
    if (days.length > 90) return alert('A range can be at most 90 days.')
    await db.holidays.bulkPut(days.map(date => ({ date, label: label.trim() || 'Holiday' })))
    setLabel(''); setTo('')
  }

  async function onImport(f?: File) {
    if (!f || !confirm('Replace current data with this backup?')) return
    try { await importData(f) } catch { alert('Not a valid backup file.') }
  }

  return (
    <>
      <h1 className="h1">Holidays</h1>
      <div className="card space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm text-mut min-w-0">From
            <input type="date" className="inp mt-1" value={from} onChange={e => setFrom(e.target.value)} />
          </label>
          <label className="text-sm text-mut min-w-0">To (optional)
            <input type="date" className="inp mt-1" min={from} value={to} onChange={e => setTo(e.target.value)} />
          </label>
        </div>
        <input className="inp" placeholder="Name (e.g. Diwali)" value={label} onChange={e => setLabel(e.target.value)} />
        <button className="btn btn-p" onClick={addHoliday}>Add holiday</button>
      </div>

      {!groups.length && <div className="empty">No holidays stored. Holidays are left out of attendance totals.</div>}
      {groups.map(g => {
        const n = rangeDates(g.start, g.end).length
        return (
          <div key={g.start} className="card flex items-center justify-between">
            <div>
              <b>{g.label}</b>
              <div className="text-sm text-mut">
                {n === 1 ? nice(g.start) : `${nice(g.start)} – ${nice(g.end)}`}, {g.end.slice(0, 4)}
                {n > 1 && ` · ${n} days`}
              </div>
            </div>
            <button className="btn btn-x" onClick={() => db.holidays.bulkDelete(rangeDates(g.start, g.end))}>Remove</button>
          </div>
        )
      })}

      <h2 className="h2">Backup</h2>
      <div className="card">
        <p className="text-sm text-mut mb-2.5">Data is stored on this device only. Export a backup, or import one to move to another device.</p>
        <div className="flex flex-col items-start gap-3">
          <button className="btn btn-p" onClick={exportData}>Export</button>
          <label className="text-sm text-mut w-full min-w-0">Import backup
            <input type="file" accept="application/json" className="block w-full max-w-full mt-1" onChange={e => onImport(e.target.files?.[0])} />
          </label>
        </div>
      </div>
    </>
  )
}
