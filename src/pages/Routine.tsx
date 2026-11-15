import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, importRoutine, loadPlan } from '../db'
import { toggle } from '../lib/dates'
import { processImage } from '../lib/image'
import { groupByParent } from '../lib/group'
import { DayChips, Thumb } from '../components/ui'
import type { Exercise } from '../types'

const BASE = ['Back', 'Chest', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Abs', 'Cardio']

export default function Routine() {
  const [name, setName] = useState('')
  const [parent, setParent] = useState('')
  const [target, setTarget] = useState('')
  const [days, setDays] = useState<number[]>([])
  const [img, setImg] = useState('')
  const ex = useLiveQuery(() => db.ex.toArray(), []) ?? []
  const parents = [...new Set([...BASE, ...ex.map(e => e.parent).filter(Boolean)])]

  async function addEx() {
    if (!name.trim()) return alert('Enter an exercise name.')
    if (!parent.trim()) return alert('Enter a parent name (e.g. Back).')
    if (!days.length) return alert('Pick at least one weekday.')
    await db.ex.add({ id: 'e' + Date.now().toString(36), name: name.trim(), parent: parent.trim(), target: target.trim(), days: [...days].sort(), img })
    setName(''); setTarget(''); setDays([]); setImg('') // parent stays, so you can add several in a row
  }

  // Returns a data URL, or null (with an alert) if the file can't be used
  const pick = async (f: File) => {
    try { return await processImage(f) } catch (err) { alert(err instanceof Error ? err.message : 'Could not read that image.'); return null }
  }
  const changeImage = async (e: Exercise, f?: File) => {
    if (!f) return
    const v = await pick(f)
    if (v) db.ex.update(e.id, { img: v })
  }

  const changeParent = (e: Exercise) => {
    const p = prompt('Parent name', e.parent || '')
    if (p?.trim()) db.ex.update(e.id, { parent: p.trim() })
  }

  async function onRoutine(f?: File) {
    if (!f || !confirm('Replace all exercises with this file? Attendance logs and holidays are kept.')) return
    try { await importRoutine(f) } catch { alert('Not a valid routine file.') }
  }

  const onPlan = () => confirm('Replace all exercises with your 7-day plan? Attendance logs and holidays are kept.') && loadPlan()

  return (
    <>
      <h1 className="h1">Routine</h1>
      <div className="card">
        <b>Add exercise</b>
        <input className="inp mt-2" placeholder="Exercise name (e.g. Lat Pulldown)" value={name} onChange={e => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input className="inp" list="parents" placeholder="Parent (e.g. Back)" value={parent} onChange={e => setParent(e.target.value)} />
          <input className="inp" placeholder="Target (e.g. 4 × 10–12)" value={target} onChange={e => setTarget(e.target.value)} />
        </div>
        <datalist id="parents">{parents.map(p => <option key={p} value={p} />)}</datalist>
        <DayChips days={days} onToggle={d => setDays(toggle(days, d))} />
        <div className="flex items-center gap-2.5">
          <Thumb src={img} alt="Preview" />
          <input type="file" accept="image/*" className="min-w-0 flex-1 text-sm" onChange={async e => { const f = e.target.files?.[0]; const v = f && await pick(f); if (v) setImg(v) }} />
        </div>
        <button className="btn btn-p mt-2.5" onClick={addEx}>Add exercise</button>
      </div>

      {!ex.length && <div className="empty">Your exercises will appear here, grouped by parent.</div>}
      {groupByParent(ex).map(([p, items]) => (
        <section key={p}>
          <h2 className="h2">{p} <span className="text-mut font-normal">({items.length})</span></h2>
          {items.map(e => (
            <div key={e.id} className="card flex gap-2.5 items-start">
              <Thumb src={e.img} alt={e.name} />
              <div className="flex-1 min-w-0">
                <div className="font-bold break-words">{e.name}</div>
                {e.target && <div className="text-sm text-mut break-words">{e.target}</div>}
                <DayChips days={e.days} onToggle={d => db.ex.update(e.id, { days: toggle(e.days, d) })} />
                <div className="flex flex-col items-start gap-1 text-sm text-mut">
                  <button className="underline" onClick={() => changeParent(e)}>Change parent</button>
                  <label className="underline cursor-pointer">
                    {e.img ? 'Change image' : 'Add image / GIF'}
                    <input type="file" accept="image/*" hidden onChange={ev => { const f = ev.target.files?.[0]; ev.target.value = ''; changeImage(e, f) }} />
                  </label>
                  {e.img && <button className="underline" onClick={() => db.ex.update(e.id, { img: '' })}>Remove image</button>}
                </div>
              </div>
              <button className="btn btn-x" onClick={() => confirm('Delete this exercise? Past logs stay saved.') && db.ex.delete(e.id)}>Delete</button>
            </div>
          ))}
        </section>
      ))}

      <h2 className="h2">Load routine</h2>
      <div className="card">
        <button className="btn btn-p" onClick={onPlan}>Load my 7-day plan</button>
        <p className="text-sm text-mut my-2">Or load a routine JSON file. Both replace all exercises; attendance and holidays stay.</p>
        <input type="file" accept="application/json" className="block w-full max-w-full text-sm" onChange={e => onRoutine(e.target.files?.[0])} />
      </div>
    </>
  )
}
