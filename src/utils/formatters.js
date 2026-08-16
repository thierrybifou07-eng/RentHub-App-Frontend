export function formatXAF(amount) {
  return new Intl.NumberFormat("fr-CM", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount)
}
export const PAGE_LIMIT = 10

export function formatName(person) {
  return `${person.firstname} ${person.lastname}`
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr))
}

export function formatRelativeTime(dateStr) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)

  if (diffMin < 1) return "\u00e0 l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  if (diffH < 24) return `il y a ${diffH} h`
  if (diffD < 7) return `il y a ${diffD} j`
  return formatDate(dateStr)
}

export function formatMessageTime(dateStr) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateStr))
}

export function formatDayLabel(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (sameDay(date, today)) return "Aujourd'hui"
  if (sameDay(date, yesterday)) return "Hier"
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  }).format(date)
}
