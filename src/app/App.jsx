import { useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "../routes/Router"
import { useAuthStore } from "../stores/authStore"
import { useFavoritesStore } from "../stores/favoritesStore"

function App() {
  const hydrateAuth = useAuthStore((s) => s.hydrate)
  const hydrateFavorites = useFavoritesStore((s) => s.hydrate)

  useEffect(() => {
    hydrateAuth()
    hydrateFavorites()
  }, [hydrateAuth, hydrateFavorites])

  return <RouterProvider router={router} />
}

export default App
