export type Exercise = { id: string; name: string; parent: string; target?: string; days: number[]; img: string }
export type Done = Record<string, { ok: boolean; note: string }>
export type Log = { date: string; att: boolean; done: Done }
export type Holiday = { date: string; label: string }
