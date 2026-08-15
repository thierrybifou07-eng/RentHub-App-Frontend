import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { APP_ROUTES, getListingDetailPath } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import { useConversationsStore } from "../../stores/conversationsStore"
import { useNotificationsStore } from "../../stores/notificationsStore"
import { messageFormSchema } from "../../schemas/messageSchema"
import { formatMessageTime, formatDayLabel, formatRelativeTime, formatName } from "../../utils/formatters"
import PageHeader from "../common/PageHeader"
import EmptyState from "../feedback/EmptyState"
import LoadingState from "../feedback/LoadingState"

/* ── Variantes tenant / owner ─────────────────────────────────── */

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

const CONFIGS = {
  tenant: {
    headerTitle: "Mes conversations",
    headerDescription: "Vos échanges avec les propriétaires, regroupés par annonce.",
    emptyTitle: "Aucune conversation",
    emptyDescription: "Contactez un propriétaire depuis une annonce pour démarrer une conversation.",
    emptyAction: { to: APP_ROUTES.listings, label: "Parcourir les annonces" },
    getParticipant: (conv) => formatName(conv.owner),
    participantFallback: "Propriétaire",
    senderFallback: "Propriétaire",
    inputPlaceholder: "écrivez votre message...",
    backTo: APP_ROUTES.tenantDashboard,
  },
  owner: {
    headerTitle: "Messages reçus",
    headerDescription: "Les demandes des locataires pour vos biens, regroupées par annonce.",
    emptyTitle: "Aucune conversation",
    emptyDescription: "Les locataires qui vous contactent apparaîtront ici.",
    emptyAction: { to: APP_ROUTES.ownerListings, label: "Voir mes annonces" },
    getParticipant: (conv) => formatName(conv.tenant),
    participantFallback: "Locataire",
    senderFallback: "Locataire",
    inputPlaceholder: "écrivez votre réponse...",
    backTo: APP_ROUTES.ownerDashboard,
  },
}

/* ── Composant ────────────────────────────────────────────────── */

function MessagesView({ variant = "tenant" }) {
  const cfg = CONFIGS[variant] || CONFIGS.tenant
  const user = useAuthStore((s) => s.user)
  const [searchParams] = useSearchParams()

  const {
    conversations,
    activeConversation,
    activeMessages,
    fetchConversations,
    openConversation,
    closeConversation,
    sendMessage,
  } = useConversationsStore()

  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newText, setNewText] = useState("")
  const [sendError, setSendError] = useState(null)
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef(null)
  const threadRef = useRef(null)
  const pendingScrollRef = useRef(null)

  useEffect(() => {
    if (!user) return
    let active = true
    fetchConversations().then(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [user, fetchConversations])

  const handleSelectConversation = useCallback((convId) => {
    setLoadingMessages(true)
    pendingScrollRef.current = "firstUnread"
    openConversation(convId)
      .then(() => useNotificationsStore.getState().clearConversationNotifications(convId))
      .finally(() => setLoadingMessages(false))
    setNewText("")
    setSendError(null)
  }, [openConversation])

  // Auto-ouverture depuis ?listing= ou ?conversation= (ex. navigation via une notification)
  useEffect(() => {
    if (!user || conversations.length === 0 || activeConversation) return
    const listingParam = searchParams.get("listing")
    const conversationParam = searchParams.get("conversation")
    if (!listingParam && !conversationParam) return
    let match
    if (listingParam) {
      match = conversations.find((c) => c.announcement_id === listingParam || c.announcement?.id === listingParam)
    } else {
      match = conversations.find((c) => String(c.id) === String(conversationParam))
    }
    if (!match) return
    const { openConversation: open } = useConversationsStore.getState()
    pendingScrollRef.current = "firstUnread"
    open(match.id).then(() => {
      useNotificationsStore.getState().clearConversationNotifications(match.id)
      setNewText("")
      setSendError(null)
    })
  }, [searchParams, conversations, user, activeConversation])

  // Au chargement d'une conversation : scroll vers le premier message non lu,
  // sinon vers le dernier message. Le scroll vers le bas après envoi est géré dans handleSend.
  useEffect(() => {
    const pending = pendingScrollRef.current
    if (!pending) return
    pendingScrollRef.current = null
    requestAnimationFrame(() => {
      if (pending !== "firstUnread") {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        return
      }
      const threadEl = threadRef.current
      const unread = threadEl?.querySelector('[data-read="0"]')
      if (unread) {
        unread.scrollIntoView({ behavior: "smooth", block: "center" })
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    })
  }, [activeMessages])

  async function handleSend(e) {
    e.preventDefault()
    setSendError(null)
    const result = messageFormSchema.safeParse({ text: newText })
    if (!result.success) {
      setSendError(result.error.issues[0]?.message || "Message invalide")
      return
    }
    setSending(true)
    try {
      await sendMessage(activeConversation.id, newText)
      setNewText("")
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      })
    } catch {
      setSendError("Erreur lors de l'envoi.")
    } finally {
      setSending(false)
    }
  }

  const isOwnMessage = (msg) =>
    msg.sender_id === user.id || msg.senderId === user.id

  return (
    <div className="messages-view">
      <PageHeader title={cfg.headerTitle} description={cfg.headerDescription} />

      {loading ? (
        <LoadingState message="Chargement de vos conversations..." />
      ) : conversations.length === 0 ? (
        <EmptyState
          title={cfg.emptyTitle}
          description={cfg.emptyDescription}
          action={cfg.emptyAction}
        />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className={`row g-0 messages-layout${activeConversation ? " has-active-conversation" : ""}`}>

              {/* ── Liste des conversations ─────────────────── */}
              <section className="col-12 col-md-4 border-end conversations-pane">
                <div className="p-3 border-bottom">
                  <h2 className="h6 fw-bold mb-0">
                    {conversations.length} conversation{conversations.length > 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="list-group list-group-flush conversation-list">
                  {conversations.map((conv) => {
                    const title = conv.Announcement?.title || "Annonce"
                    const participant = cfg.getParticipant(conv) || cfg.participantFallback
                    const lastMsg = conv.last_message
                    const unread = conv.unread_count || 0
                    return (
                      <button
                        key={conv.id}
                        type="button"
                        className={`list-group-item list-group-item-action conversation-item ${activeConversation?.id === conv.id ? "active" : ""}`}
                        onClick={() => handleSelectConversation(conv.id)}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <span className="fw-bold small text-truncate" style={{ maxWidth: "70%" }}>
                            {title}
                          </span>
                          <span className="d-flex align-items-center gap-2">
                            {unread > 0 && (
                              <span className="badge bg-danger rounded-pill">{unread > 99 ? "99+" : unread}</span>
                            )}
                            {lastMsg && (
                              <small className="text-secondary text-nowrap">
                                {formatRelativeTime(conv.updatedAt)}
                              </small>
                            )}
                          </span>
                        </div>
                        <p className="mb-1 small text-secondary">
                          {participant}
                        </p>
                        {lastMsg && (
                          <p className={`mb-0 small text-truncate ${unread > 0 ? "fw-bold text-dark" : ""}`} style={{ maxWidth: "90%" }}>
                            {lastMsg}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* ── Fil de discussion ───────────────────────── */}
              <section className="col-12 col-md-8 thread-pane">
                {!activeConversation ? (
                  <div className="d-flex align-items-center justify-content-center h-100 text-secondary py-5">
                    <p className="mb-0">Sélectionnez une conversation pour la lire.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column thread-inner">
                    <div className="px-3 py-2 border-bottom d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-light d-md-none flex-shrink-0"
                        onClick={closeConversation}
                        aria-label="Retour aux conversations"
                      >
                        &larr;
                      </button>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Link to={getListingDetailPath(activeConversation.announcement_id)}>
                          <h3 className="h6 fw-bold mb-0 text-truncate">
                            {activeConversation.Announcement?.title || "Annonce"}
                          </h3>
                        </Link>
                        <small className="text-secondary">
                          {cfg.getParticipant(activeConversation) || cfg.participantFallback}
                          {activeConversation.announcement?.city?.name ? ` \u00b7 ${activeConversation.announcement.city.name}` : ""}
                        </small>
                      </div>
                    </div>

                    <div className="message-thread flex-grow-1 p-3" ref={threadRef}>
                      {loadingMessages ? (
                        <p className="text-center text-secondary small mb-0">Chargement...</p>
                      ) : activeMessages.length === 0 ? (
                        <p className="text-center text-secondary small mb-0">Aucun message.</p>
                      ) : (
                        groupMessagesByDay(activeMessages).map((group) => (
                          <div key={group.key} className="message-day-group">
                            <div className="message-day-separator">
                              <span>{group.label}</span>
                            </div>
                            {group.messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`message-bubble ${isOwnMessage(msg) ? "own" : "other"}`}
                                data-message-id={msg.id}
                                data-read={msg.is_read || msg.isRead || msg.read_at ? "1" : "0"}
                              >
                                <p className="message-text">{msg.content || msg.text}</p>
                                <div className="message-time">{formatMessageTime(msg.created_at || msg.createdAt || msg.updatedAt)}</div>
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="message-input-area p-3 border-top bg-light">
                      {sendError && (
                        <div className="alert alert-danger py-1 px-2 small mb-2">{sendError}</div>
                      )}
                      <div className="d-flex gap-2 w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder={cfg.inputPlaceholder}
                          value={newText}
                          onChange={(e) => setNewText(e.target.value)}
                          disabled={sending}
                          maxLength={2000}
                        />
                        <button
                          type="submit"
                          className="btn btn-success"
                          disabled={sending || !newText.trim()}
                        >
                          {sending ? "Envoi..." : "Envoyer"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-4">
        <Link to={cfg.backTo} className="btn btn-outline-success btn-sm">
          &larr; Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}

export default MessagesView
