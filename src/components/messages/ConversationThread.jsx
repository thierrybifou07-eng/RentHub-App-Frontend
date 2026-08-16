import { Check, CheckCheck } from "lucide-react"
import { formatMessageTime, formatDayLabel } from "../../utils/formatters"

function groupMessagesByDay(messages) {
  const groups = []
  for (const msg of messages) {
    const ts = msg.created_at || msg.createdAt || msg.updatedAt
    const key = new Date(ts).toDateString()
    const last = groups[groups.length - 1]
    if (last && last.key === key) {
      last.messages.push(msg)
    } else {
      groups.push({ key, label: formatDayLabel(ts), messages: [msg] })
    }
  }
  return groups
}

function ReadReceipt({ message, isOwn }) {
  if (!isOwn) return null
  const read = Boolean(message.read_at || message.is_read || message.isRead)
  return (
    <span className="message-receipt" title={read ? "Lu" : "Envoyé"}>
      {read ? <CheckCheck size={13} aria-hidden="true" /> : <Check size={13} aria-hidden="true" />}
    </span>
  )
}

function ConversationThread({
  messages,
  loading,
  loadingOlder,
  hasOlder,
  onLoadOlder,
  currentUserId,
  threadRef,
  messagesEndRef,
}) {
  return (
    <div className="message-thread flex-grow-1" ref={threadRef}>
      {loading ? (
        <p className="text-center text-secondary small mb-0">Chargement...</p>
      ) : (
        <>
          {hasOlder && (
            <button
              type="button"
              className="load-older-btn"
              onClick={onLoadOlder}
              onMouseDown={(e) => e.preventDefault()}
              disabled={loadingOlder}
            >
              {loadingOlder ? "Chargement..." : "Charger les messages précédents"}
            </button>
          )}
          {messages.length === 0 ? (
            <p className="text-center text-secondary small mb-0">Aucun message.</p>
          ) : (
            groupMessagesByDay(messages).map((group) => (
              <div key={group.key} className="message-day-group">
                <div className="message-day-separator">
                  <span>{group.label}</span>
                </div>
                {group.messages.map((msg) => {
                  const isOwn =
                    currentUserId &&
                    (msg.sender_id === currentUserId || msg.senderId === currentUserId)
                  const senderName = msg.sender?.firstname
                  const isUnread = !isOwn && !(msg.is_read || msg.isRead || msg.read_at)
                  return (
                    <div
                      key={msg.id}
                      className={`message-bubble ${isOwn ? "own" : "other"}`}
                      data-message-id={msg.id}
                      data-read={isUnread ? "0" : "1"}
                    >
                      {!isOwn && senderName && (
                        <div className="message-sender">{senderName}</div>
                      )}
                      <p className="message-text">{msg.content || msg.text}</p>
                      <div className="message-meta-row">
                        <span className="message-time">
                          {formatMessageTime(msg.created_at || msg.createdAt || msg.updatedAt)}
                        </span>
                        <ReadReceipt message={msg} isOwn={isOwn} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  )
}

export default ConversationThread
