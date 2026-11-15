// Resize to max 360px JPEG data URL so images stay small in IndexedDB
export function resizeImage(file: File, max = 360): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const im = new Image()
    im.onload = () => {
      const s = Math.min(1, max / Math.max(im.width, im.height))
      const c = document.createElement('canvas')
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s)
      c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.7))
    }
    im.onerror = reject
    im.src = url
  })
}

export const MAX_GIF_BYTES = 5 * 1024 * 1024

// GIFs are stored as-is (resizing through a canvas would drop the animation); other images are resized
export async function processImage(file: File): Promise<string> {
  if (file.type !== 'image/gif') return resizeImage(file)
  if (file.size > MAX_GIF_BYTES) throw new Error('This GIF is larger than 5 MB. Compress it and try again.')
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}
