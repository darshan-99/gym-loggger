export const DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const WEEK = [1, 2, 3, 4, 5, 6, 0] // Monday first
const pad = (n: number) => String(n).padStart(2, '0')
export const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const add = (s: string, n: number) => { const d = parse(s); d.setDate(d.getDate() + n); return fmt(d) }
export const today = () => fmt(new Date())
export const nice = (s: string) => { const d = parse(s); return `${DN[d.getDay()]}, ${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}` }
export const toggle = (a: number[], i: number) => (a.includes(i) ? a.filter(x => x !== i) : [...a, i])
