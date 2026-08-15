const MEDIA_BASE_URL = import.meta.env.VITE_API_MEDIA_URL

const UPLOADS_MARKER = "public/uploads/"

export function getMediaBaseUrl() {
  return MEDIA_BASE_URL
}

export function resolveMediaUrl(value) {
  if (!value) return null

  const path =
    typeof value === "string"
      ? value
      : value.url || value.path || value.file_path || value.original_url

  if (!path) return null

  const normalized = String(path).replace(/\\/g, "/")

  if (/^https?:\/\//i.test(normalized)) return normalized

  const markerIdx = normalized.indexOf(UPLOADS_MARKER)
  const relative = markerIdx !== -1 ? normalized.substring(markerIdx + "public/".length) : normalized.replace(/^\/+/, "")

  if (!relative) return null

  return `${MEDIA_BASE_URL}/${relative}`
}

export function isImageMedia(m) {
  if (!m) return false
  const code = String(m.MediaType?.code || m.mediaType?.code || "").toUpperCase()
  const mime = String(m.mime_type || m.mimeType || "").toLowerCase()
  return code === "ANNOUNCEMENT_IMAGE" || code === "IMAGE" || m.type === "image" || mime.startsWith("image/")
}

export function isVideoMedia(m) {
  if (!m) return false
  const code = String(m.MediaType?.code || m.mediaType?.code || "").toUpperCase()
  const mime = String(m.mime_type || m.mimeType || "").toLowerCase()
  return code === "ANNOUNCEMENT_VIDEO" || code === "VIDEO" || m.type === "video" || mime.startsWith("video/")
}

export function getPrimaryMedia(mediaList) {
  if (!Array.isArray(mediaList) || mediaList.length === 0) return null

  const primary = mediaList.find((m) => m.is_primary) || mediaList[0]
  if (isImageMedia(primary)) return primary
  const image = mediaList.find((m) => isImageMedia(m))
  return image || primary
}

export function getPrimaryMediaUrl(mediaList) {
  return resolveMediaUrl(getPrimaryMedia(mediaList))
}

export function getMediaUrlByType(mediaList, code) {
  if (!Array.isArray(mediaList)) return null
  const match = mediaList.find((m) => m.MediaType?.code === code || m.mediaType?.code === code)
  return match ? resolveMediaUrl(match) : null
}
