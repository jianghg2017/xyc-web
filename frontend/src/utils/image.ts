const backendBase =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path || path === 'null' || path === 'undefined' || path.trim() === '') {
    return null
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${backendBase}${path}`
}
