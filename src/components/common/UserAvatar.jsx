import { useState } from "react"
import { getUserAvatarUrl } from "../../utils/userAvatar"

function getInitials(user) {
  if (!user) return "?"
  const first = (user.firstname || user.name || "?")[0] || ""
  const last = user.lastname ? user.lastname[0] : ""
  return (first + last).toUpperCase() || "?"
}

function UserAvatar({ user, size = 40, className = "", style, title }) {
  const [imgError, setImgError] = useState(false)
  const url = getUserAvatarUrl(user)
  const baseStyle = { width: size, height: size, ...style }

  if (url && !imgError) {
    return (
      <img
        src={url}
        alt={user?.name || user?.email || "Avatar"}
        className={`rounded-circle object-fit-cover ${className}`}
        style={baseStyle}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className={`rounded-circle text-white d-flex align-items-center justify-content-center fw-bold ${className}`}
      style={{
        ...baseStyle,
        background: "var(--gradient-primary)",
        fontSize: Math.round(size * 0.38),
        letterSpacing: "var(--tracking-wider)",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(15,81,50,0.5)",
      }}
      title={title || user?.email || user?.name}
    >
      {getInitials(user)}
    </div>
  )
}

export default UserAvatar
