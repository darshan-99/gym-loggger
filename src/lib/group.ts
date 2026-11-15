import type { Exercise } from '../types'

// Group by parent name, keeping the order in which parents first appear
export function groupByParent(list: Exercise[]): [string, Exercise[]][] {
  const groups: [string, Exercise[]][] = []
  for (const e of list) {
    const p = e.parent || 'Other'
    let g = groups.find(x => x[0] === p)
    if (!g) { g = [p, []]; groups.push(g) }
    g[1].push(e)
  }
  return groups
}
