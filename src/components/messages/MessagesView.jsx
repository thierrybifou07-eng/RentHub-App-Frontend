import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import { useConversationsStore } from "../../stores/conversationsStore"
import { useNotificationsStore } from "../../stores/notificationsStore"
import { messageFormSchema } from "../../schemas/messageSchema"
import { formatName } from "../../utils/formatters"
import PageHeader from "../common/PageHeader"
import EmptyState from "../feedback/EmptyState"
import LoadingState from "../feedback/LoadingState"
import ConversationList from "./ConversationList"
import ConversationHeader from "./ConversationHeader"
import ConversationThread from "./ConversationThread"
import MessageInput from "./MessageInput"

/* ── Variantes tenant / owner ─────────────────────────────────── */

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
    messagesMeta,
    loadingOlder,
    fetchConversations,
    openConversation,
    closeConversation,
    loadOlderMessages,
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
    if (loadingMessages || !threadRef.current?.querySelector(".message-bubble")) return
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
  }, [activeMessages, loadingMessages])

  const getFirstVisibleBubble = (container) => {
    const bubbles = container?.querySelectorAll(".message-bubble")
    if (!bubbles || bubbles.length === 0) return null
    const scrollTop = container.scrollTop
    for (const b of bubbles) {
      if (b.offsetTop + b.offsetHeight > scrollTop) return b
    }
    return bubbles[0]
  }

  const handleLoadOlder = useCallback(() => {
    if (!activeConversation) return
    const container = threadRef.current
    if (!container) return
    // On conserve la position de lecture via un élément ancré : après insertion
    // des anciens messages, on re-scrolle pour le replacer à la même hauteur.
    const anchor = getFirstVisibleBubble(container)
    const anchorDistance = anchor ? anchor.offsetTop - container.scrollTop : 0
    loadOlderMessages(activeConversation.id).then(() => {
      requestAnimationFrame(() => {
        if (!container || !anchor || !anchor.isConnected) return
        container.scrollTop = anchor.offsetTop - anchorDistance
      })
    })
  }, [activeConversation, loadOlderMessages])

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

  const hasOlder = messagesMeta.page > 0 && messagesMeta.page < messagesMeta.totalPages

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
                <div className="conversations-pane-header">
                  <span className="fw-bold small">
                    {conversations.length} conversation{conversations.length > 1 ? "s" : ""}
                  </span>
                </div>
                <ConversationList
                  conversations={conversations}
                  variant={variant}
                  activeId={activeConversation?.id}
                  onSelect={handleSelectConversation}
                  getParticipant={cfg.getParticipant}
                  participantFallback={cfg.participantFallback}
                />
              </section>

              {/* ── Fil de discussion ───────────────────────── */}
              <section className="col-12 col-md-8 thread-pane">
                {!activeConversation ? (
                  <div className="d-flex align-items-center justify-content-center h-100 text-secondary py-5">
                    <p className="mb-0">Sélectionnez une conversation pour la lire.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column thread-inner">
                    <ConversationHeader
                      conversation={activeConversation}
                      onBack={closeConversation}
                      getParticipant={cfg.getParticipant}
                      participantFallback={cfg.participantFallback}
                    />

                    <ConversationThread
                      messages={activeMessages}
                      loading={loadingMessages}
                      loadingOlder={loadingOlder}
                      hasOlder={hasOlder}
                      onLoadOlder={handleLoadOlder}
                      currentUserId={user?.id}
                      threadRef={threadRef}
                      messagesEndRef={messagesEndRef}
                    />

                    <MessageInput
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      onSubmit={handleSend}
                      placeholder={cfg.inputPlaceholder}
                      sending={sending}
                      error={sendError}
                    />
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
