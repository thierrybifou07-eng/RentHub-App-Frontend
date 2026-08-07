import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import {
  getConversationsByUser,
  getMessagesByConversation,
  sendMessage as sendMockMessage,
} from "../../services/messagingService"
import { messageFormSchema } from "../../schemas/messageSchema"
import { formatRelativeTime } from "../../utils/formatters"
import PageHeader from "../../components/common/PageHeader"
import EmptyState from "../../components/feedback/EmptyState"
import LoadingState from "../../components/feedback/LoadingState"

function OwnerMessages() {
  const user = useAuthStore((s) => s.user)

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newText, setNewText] = useState("")
  const [sendError, setSendError] = useState(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!user) return
    let active = true
    getConversationsByUser(user.id).then((convs) => {
      if (active) {
        setConversations(convs)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [user])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!selectedId) { setMessages([]); return }
    let active = true
    setLoadingMessages(true)
    setMessages([])
    getMessagesByConversation(selectedId).then((msgs) => {
      if (active) {
        setMessages(msgs)
        setLoadingMessages(false)
      }
    })
    return () => { active = false }
  }, [selectedId])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSelectConversation(convId) {
    setSelectedId(convId)
    setNewText("")
    setSendError(null)
  }

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
      const sent = await sendMockMessage(selectedId, user.id, newText)
      setMessages((prev) => [
        ...prev,
        { ...sent, senderName: user.name },
      ])
      setNewText("")
    } catch {
      setSendError("Erreur lors de l'envoi.")
    } finally {
      setSending(false)
    }
  }

  const selectedConv = conversations.find((c) => c.id === selectedId)

  return (
    <div>
      <PageHeader
        title="Messages reçus"
        description="Les demandes des locataires pour vos biens, regroupées par annonce."
      />

      {loading ? (
        <LoadingState message="Chargement de vos conversations..." />
      ) : conversations.length === 0 ? (
        <EmptyState
          title="Aucune conversation"
          description="Les locataires qui vous contactent apparaîtront ici."
          action={{ to: APP_ROUTES.ownerListings, label: "Voir mes annonces" }}
        />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <div className="row g-0">
              <div className="col-md-4 border-end">
                <div className="p-3 border-bottom">
                  <h2 className="h6 fw-bold mb-0">
                    {conversations.length} conversation{conversations.length > 1 ? "s" : ""}
                  </h2>
                </div>
                <div className="list-group list-group-flush" style={{ maxHeight: 480, overflowY: "auto" }}>
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      type="button"
                      className={`list-group-item list-group-item-action conversation-item ${selectedId === conv.id ? "active" : ""}`}
                      onClick={() => handleSelectConversation(conv.id)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold small text-truncate" style={{ maxWidth: "70%" }}>
                          {conv.listing?.title || "Annonce"}
                        </span>
                        {conv.lastMessage && (
                          <small className="text-secondary text-nowrap ms-2">
                            {formatRelativeTime(conv.lastMessage.createdAt)}
                          </small>
                        )}
                      </div>
                      <p className="mb-1 small text-secondary">
                        {conv.otherParticipant?.name || "Locataire"}
                      </p>
                      {conv.lastMessage && (
                        <p className="mb-0 small text-truncate" style={{ maxWidth: "90%" }}>
                          {conv.lastMessage.text}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-md-8">
                {!selectedId ? (
                  <div className="d-flex align-items-center justify-content-center h-100 text-secondary py-5">
                    <p className="mb-0">Sélectionnez une conversation pour la lire.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column" style={{ minHeight: 480 }}>
                    {selectedConv && (
                      <div className="px-3 py-2 border-bottom">
                        <h3 className="h6 fw-bold mb-0">
                          {selectedConv.listing?.title || "Annonce"}
                        </h3>
                        <small className="text-secondary">
                          {selectedConv.otherParticipant?.name || "Locataire"}
                          {selectedConv.listing?.city ? ` \u00b7 ${selectedConv.listing.city}` : ""}
                        </small>
                      </div>
                    )}

                    <div className="message-thread flex-grow-1">
                      {loadingMessages ? (
                        <p className="text-center text-secondary small mb-0">Chargement...</p>
                      ) : messages.length === 0 ? (
                        <p className="text-center text-secondary small mb-0">Aucun message.</p>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`message-bubble ${msg.senderId === user.id ? "own" : "other"}`}
                          >
                            {msg.senderId !== user.id && (
                              <div className="message-sender">{msg.senderName}</div>
                            )}
                            <p className="message-text">{msg.text}</p>
                            <div className="message-time">{formatRelativeTime(msg.createdAt)}</div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="message-input-area">
                      {sendError && (
                        <div className="alert alert-danger py-1 px-2 small mb-2">{sendError}</div>
                      )}
                      <div className="d-flex gap-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="écrivez votre réponse..."
                          value={newText}
                          onChange={(e) => setNewText(e.target.value)}
                          disabled={sending}
                          maxLength={2000}
                        />
                        <button
                          type="submit"
                          className="btn btn-success btn-sm"
                          disabled={sending || !newText.trim()}
                        >
                          {sending ? "Envoi..." : "Envoyer"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-4">
        <Link to={APP_ROUTES.ownerDashboard} className="btn btn-outline-success btn-sm">
          &larr; Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}

export default OwnerMessages
