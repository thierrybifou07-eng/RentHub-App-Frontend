export const MOCK_USERS = [
  {
    id: "user-1",
    name: "Admin Général",
    email: "admin@renthub.cm",
    role: "admin",
    status: "active",
    avatar: null,
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "user-2",
    name: "Jean Kamga",
    email: "jean.kamga@email.cm",
    role: "owner",
    status: "active",
    avatar: null,
    createdAt: "2025-02-20T14:00:00Z",
  },
  {
    id: "user-3",
    name: "Marie Njoya",
    email: "marie.njoya@email.cm",
    role: "owner",
    status: "active",
    avatar: null,
    createdAt: "2025-03-10T09:00:00Z",
  },
  {
    id: "user-4",
    name: "Amina Bello",
    email: "amina.bello@email.cm",
    role: "tenant",
    status: "active",
    avatar: null,
    createdAt: "2025-04-05T11:00:00Z",
  },
  {
    id: "user-5",
    name: "Paul Mbarga",
    email: "paul.mbarga@email.cm",
    role: "tenant",
    status: "banned",
    avatar: null,
    createdAt: "2025-05-01T08:00:00Z",
  },
]

export function getUserById(id) {
  return MOCK_USERS.find((u) => u.id === id) || null
}
