import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { DN, WEEK } from '../lib/dates'

// Thumbnail; tap to open the full image (GIFs animate) in a popup
export function Thumb({ src, alt }: { src?: string; alt: string }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', h)
    return () => removeEventListener('keydown', h)
  }, [open])

  const c = 'size-16 rounded-lg object-cover bg-bg border border-line'
  if (!src) return <div className={`${c} shrink-0`} />
  return (
    <>
      <button type="button" aria-label={`View ${alt}`} className="shrink-0 rounded-lg cursor-zoom-in focus-visible:outline-2 focus-visible:outline-acc" onClick={() => setOpen(true)}>
        <img src={src} alt={alt} className={c} />
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-3 p-4" onClick={() => setOpen(false)}>
          <img src={src} alt={alt} className="max-w-full max-h-[78vh] rounded-xl bg-card" />
          <div className="text-white font-bold text-center">{alt}</div>
          <button className="btn" onClick={() => setOpen(false)}>Close</button>
        </div>,
        document.body
      )}
    </>
  )
}

export function DayChips({ days, onToggle }: { days: number[]; onToggle: (d: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 my-2">
      {WEEK.map(i => (
        <span key={i} className={`chip ${days.includes(i) ? 'chip-on' : ''}`} onClick={() => onToggle(i)}>{DN[i]}</span>
      ))}
    </div>
  )
}
