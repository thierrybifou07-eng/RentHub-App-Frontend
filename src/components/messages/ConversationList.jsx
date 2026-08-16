import { useState } from "react"
import { Building2, ChevronDown, MapPin } from "lucide-react"
import { getPrimaryMediaUrl } from "../../utils/mediaUrl"
import { formatRelativeTime } from "../../utils/formatters"
import { useAuthStore } from "../../stores/authStore"

const groupStateKey = (userId) => `renthub:expanded-groups:${userId}`

const dateOf = (c) => new Date(c.updatedAt || c.last_message_at || 0).getTime()

function groupByAnnouncement(conversations) {
  const groups = new Map()
  for (const conv of conversations) {
    const key = conv.announcement_id ?? conv.announcement?.id
    if (key == null) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(conv)
  }
  return [...groups.values()]
    .map((items) => ({
      announcement: items[0].Announcement || items[0].announcement || {},
      items: items.sort((a, b) => dateOf(b) - dateOf(a)),
    }))
    .sort((a, b) => dateOf(b.items[0]) - dateOf(a.items[0]))
}

function FlatList({ conversations, activeId, onSelect, getParticipant, participantFallback }) {
  return (
    <>
      {conversations.map((conv) => {
        const title = conv.Announcement?.title || "Annonce"
        const participant = getParticipant(conv) || participantFallback
        const lastMsg = conv.last_message?.content
        const unread = conv.unread_count || 0
        const coverUrl = getPrimaryMediaUrl(conv.Announcement?.Media)

        return (
          <button
            key={conv.id}
            type="button"
            className={`conversation-item ${activeId === conv.id ? "active" : ""}`}
            onClick={() => onSelect(conv.id)}
          >
            <div className="conversation-item-top">
              <span className="conversation-thumb">
                {coverUrl ? (
                  <img src={coverUrl} alt="" loading="lazy" />
                ) : (
                  <Building2 size={16} aria-hidden="true" />
                )}
              </span>
              <span className="conversation-main">
                <span className="conversation-title">{title}</span>
                <span className="conversation-participant">{participant}</span>
              </span>
              <span className="conversation-meta">
                {unread > 0 && (
                  <span className="badge bg-danger rounded-pill">{unread > 99 ? "99+" : unread}</span>
                )}
                <span className="conversation-time">
                  {formatRelativeTime(conv.updatedAt || conv.last_message_at)}
                </span>
              </span>
            </div>
            {lastMsg && <p className="conversation-preview">{lastMsg}</p>}
          </button>
        )
      })}
    </>
  )
}

function OwnerGroupedList({ conversations, activeId, onSelect, getParticipant, participantFallback }) {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id
  const groups = groupByAnnouncement(conversations)

  // Repli par défaut ; on garde en mémoire de session les groupes DÉPLIÉS
  // (clé par utilisateur pour ne pas fuiter entre comptes).
  const [expandedIds, setExpandedIds] = useState(() => {
    try {
      const raw = sessionStorage.getItem(groupStateKey(userId))
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  })

  const toggleGroup = (announcementId) => {
    const id = String(announcementId)
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      try {
        sessionStorage.setItem(groupStateKey(userId), JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  return (
    <>
      {groups.map((group) => {
        const ann = group.announcement
        const annId = String(ann.id)
        const expanded = expandedIds.has(annId)
        const coverUrl = getPrimaryMediaUrl(ann.Media || ann.media)
        const city = ann.City?.name || ann.city?.name
        const unreadTotal = group.items.reduce((sum, c) => sum + (c.unread_count || 0), 0)

        return (
          <div key={ann.id} className={`conversation-group ${expanded ? "expanded" : "collapsed"}`}>
            <button
              type="button"
              className="conversation-group-header"
              onClick={() => toggleGroup(annId)}
              aria-expanded={expanded}
            >
              <span className="conversation-thumb">
                {coverUrl ? (
                  <img src={coverUrl} alt="" loading="lazy" />
                ) : (
                  <Building2 size={16} aria-hidden="true" />
                )}
              </span>
              <span className="conversation-main">
                <span className="conversation-title conversation-group-title">
                  {ann.title || "Annonce"}
                </span>
                {city && (
                  <span className="conversation-participant">
                    <MapPin size={11} aria-hidden="true" /> {city}
                  </span>
                )}
              </span>
              <span className="conversation-meta">
                {unreadTotal > 0 && (
                  <span className="badge bg-danger rounded-pill">
                    {unreadTotal > 99 ? "99+" : unreadTotal}
                  </span>
                )}
                <span className="conversation-time">
                  {group.items.length} demand{group.items.length > 1 ? "es" : "e"}
                </span>
              </span>
              <ChevronDown size={16} className="conversation-group-chevron" aria-hidden="true" />
            </button>

            <div className="conversation-group-items">
              {group.items.map((conv) => {
                const participant = getParticipant(conv) || participantFallback
                const unread = conv.unread_count || 0
                const lastMsg = conv.last_message?.content
                return (
                  <button
                    key={conv.id}
                    type="button"
                    className={`conversation-item ${activeId === conv.id ? "active" : ""}`}
                    onClick={() => onSelect(conv.id)}
                  >
                    <div className="conversation-item-top">
                      <span className="conversation-avatar">
                        {participant.charAt(0).toUpperCase()}
                      </span>
                      <span className="conversation-main">
                        <span className="conversation-participant-strong">{participant}</span>
                      </span>
                      <span className="conversation-meta">
                        {unread > 0 && (
                          <span className="badge bg-danger rounded-pill">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                        <span className="conversation-time">
                          {formatRelativeTime(conv.updatedAt || conv.last_message_at)}
                        </span>
                      </span>
                    </div>
                    {lastMsg && <p className="conversation-preview">{lastMsg}</p>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

function ConversationList({ conversations, variant, activeId, onSelect, getParticipant, participantFallback }) {
  const listProps = { conversations, activeId, onSelect, getParticipant, participantFallback }
  return (
    <div className="list-group list-group-flush conversation-list">
      {variant === "owner"
        ? <OwnerGroupedList {...listProps} />
        : <FlatList {...listProps} />}
    </div>
  )
}

export default ConversationList
