export const MOCK_MESSAGES = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-4",
    text: "Bonjour, le studio \u00e0 Akwa est-il encore disponible ?",
    createdAt: "2025-07-12T09:00:00Z",
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "user-2",
    text: "Bonjour Amina, oui il est encore libre. Vous souhaitez le visiter ?",
    createdAt: "2025-07-12T09:15:00Z",
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    senderId: "user-4",
    text: "Oui, est-ce possible ce weekend ?",
    createdAt: "2025-07-12T09:20:00Z",
  },
  {
    id: "msg-4",
    conversationId: "conv-1",
    senderId: "user-2",
    text: "Pas de problème, samedi \u00e0 10h ça vous convient ? Je vous envoie l'adresse exacte.",
    createdAt: "2025-07-12T09:30:00Z",
  },
  {
    id: "msg-5",
    conversationId: "conv-2",
    senderId: "user-5",
    text: "Bonjour, je suis intéressé par l'appartement 3 chambres \u00e0 Akwa. Le prix est-il négociable ?",
    createdAt: "2025-07-14T14:30:00Z",
  },
  {
    id: "msg-6",
    conversationId: "conv-2",
    senderId: "user-2",
    text: "Bonjour Paul, le prix est fixe \u00e0 180 000 XAF. Par contre je peux inclure le premier mois d'eau.",
    createdAt: "2025-07-14T15:00:00Z",
  },
  {
    id: "msg-7",
    conversationId: "conv-2",
    senderId: "user-5",
    text: "D'accord, et l'appartement est meublé ?",
    createdAt: "2025-07-14T15:10:00Z",
  },
  {
    id: "msg-8",
    conversationId: "conv-2",
    senderId: "user-2",
    text: "Non, il est vide. Mais il y a la cuisine équipée et le salon a des banquettes.",
    createdAt: "2025-07-14T15:20:00Z",
  },
  {
    id: "msg-9",
    conversationId: "conv-3",
    senderId: "user-4",
    text: "Bonjour Madame Njoya, la maison \u00e0 Bastos est encore en location ?",
    createdAt: "2025-07-16T11:00:00Z",
  },
  {
    id: "msg-10",
    conversationId: "conv-3",
    senderId: "user-3",
    text: "Bonjour Amina, oui toujours disponible. C'est une maison familiale, idéale pour un couple ou une famille.",
    createdAt: "2025-07-16T11:15:00Z",
  },
  {
    id: "msg-11",
    conversationId: "conv-3",
    senderId: "user-4",
    text: "Super, et le quartier est-il sûr ?",
    createdAt: "2025-07-16T11:20:00Z",
  },
  {
    id: "msg-12",
    conversationId: "conv-3",
    senderId: "user-3",
    text: "Très sûr, c'est Bastos. Il y a un gardien la nuit et la maison a un portail électrique.",
    createdAt: "2025-07-16T11:30:00Z",
  },
]

let nextId = 13

export function getMessagesByConversation(conversationId) {
  return MOCK_MESSAGES.filter((m) => m.conversationId === conversationId).sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  )
}

export function sendMessage(conversationId, senderId, text) {
  const msg = {
    id: `msg-${nextId++}`,
    conversationId,
    senderId,
    text,
    createdAt: new Date().toISOString(),
  }
  MOCK_MESSAGES.push(msg)
  return msg
}
