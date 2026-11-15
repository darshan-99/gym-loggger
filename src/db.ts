import Dexie, { type Table } from 'dexie'
import type { Done, Exercise, Holiday, Log } from './types'
import plan from './data/plan.json'

class GymDB extends Dexie {
  ex!: Table<Exercise, string>
  logs!: Table<Log, string>
  holidays!: Table<Holiday, string>
  constructor() {
    super('gymlog')
    this.version(1).stores({ ex: 'id', logs: 'date', holidays: 'date' })
  }
}
export const db = new GymDB()

export async function patchLog(date: string, fn: (l: Log) => void) {
  const l = (await db.logs.get(date)) ?? { date, att: false, done: {} }
  fn(l)
  await db.logs.put(l)
}

// Backup format matches the earlier single-file version: { ex, logs: {date: {att, done}}, holidays }
export async function exportData() {
  const logs: Record<string, { att: boolean; done: Done }> = {}
  for (const l of await db.logs.toArray()) logs[l.date] = { att: l.att, done: l.done }
  const data = { ex: await db.ex.toArray(), logs, holidays: await db.holidays.toArray() }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }))
  a.download = `gym-log-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
}

export async function importData(file: File) {
  const d = JSON.parse(await file.text())
  if (!Array.isArray(d.ex) || typeof d.logs !== 'object') throw new Error('Invalid backup')
  await db.transaction('rw', db.ex, db.logs, db.holidays, async () => {
    await Promise.all([db.ex.clear(), db.logs.clear(), db.holidays.clear()])
    await db.ex.bulkPut(d.ex)
    await db.logs.bulkPut(Object.entries(d.logs).map(([date, v]) => ({ date, ...(v as object) }) as Log))
    await db.holidays.bulkPut(d.holidays ?? [])
  })
}

// Replaces only the exercises (keeps attendance logs and holidays). Accepts { ex: [...] }
export async function importRoutine(file: File) {
  const d = JSON.parse(await file.text())
  if (!Array.isArray(d.ex)) throw new Error('Invalid routine file')
  await db.transaction('rw', db.ex, async () => { await db.ex.clear(); await db.ex.bulkPut(d.ex) })
}

// Replaces only the exercises with the plan bundled in src/data/plan.json
export async function loadPlan() {
  await db.transaction('rw', db.ex, async () => { await db.ex.clear(); await db.ex.bulkPut(plan.ex as Exercise[]) })
}
