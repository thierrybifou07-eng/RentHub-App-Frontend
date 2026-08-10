export function formatXAF(amount) {
  return new Intl.NumberFormat("fr-CM", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount)
}

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
