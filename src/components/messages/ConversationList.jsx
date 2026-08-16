import { Building2 } from "lucide-react"
import { getPrimaryMediaUrl } from "../../utils/mediaUrl"
import { formatRelativeTime } from "../../utils/formatters"

function ConversationList({ conversations, variant, activeId, onSelect, getParticipant, participantFallback }) {
  return (
    <div className="list-group list-group-flush conversation-list">
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
            {lastMsg && (
              <p className="conversation-preview">{lastMsg}</p>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ConversationList
