import { resolveMediaUrl } from "./mediaUrl"

export function getUserAvatarUrl(user) {
  if (!user) return null

  const direct = user.avatarUrl || user.avatar_url || user.avatar || user.photo || user.profilePicture || user.profile_picture
  if (direct) {
    return typeof direct === "string" ? resolveMediaUrl(direct) || direct : resolveMediaUrl(direct)
  }

  const media = user.Media || user.media
  if (Array.isArray(media)) {
    const avatar = media.find((m) =>
      m.MediaType?.code === "USER_AVATAR" || m.mediaType?.code === "USER_AVATAR" || m.type === "avatar"
    )
    if (avatar) return resolveMediaUrl(avatar)
  }
  return null
}
