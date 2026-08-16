import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import { useFavoritesStore } from "../../stores/favoritesStore"
import { getConversationsByUser } from "../../services/messagingService"
import { getAnnouncements } from "../../api/announcementsApi"
import PageHeader from "../../components/common/PageHeader"
import StatCard from "../../components/common/StatCard"
import { Heart, Mail, Search } from "lucide-react"

function TenantDashboard() {
  const user = useAuthStore((s) => s.user)
  const favorites = useFavoritesStore((s) => s.favorites)
  const [conversationCount, setConversationCount] = useState(0)
  const [announcementCount, setAnnouncementCount] = useState(0)

  useEffect(() => {
    if (!user) return
    let active = true
    getConversationsByUser(user.id).then((convs) => {
      if (active) setConversationCount(convs.length)
    })
    getAnnouncements({ limit: 1 }).then((result) => {
      if (!active) return
      const pagination = result.data?.pagination || result.pagination || null
      const total = pagination?.totalItems ?? pagination?.total ?? null
      if (total != null) setAnnouncementCount(total)
    })
    return () => { active = false }
  }, [user])

  return (
    <div>
      <PageHeader
        title="Espace locataire"
        description={`Bienvenue, ${user?.name || "locataire"}.`}
      />

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <StatCard icon={Heart} value={favorites.length} label="Favoris" />
        </div>
        <div className="col-md-4">
          <StatCard icon={Mail} value={conversationCount} label="Conversations" />
        </div>
        <div className="col-md-4">
          <StatCard icon={Search} value={announcementCount} label="Annonces disponibles" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-6 mb-2"><Heart size={44} /></div>
              <h2 className="h6">Mes favoris</h2>
              <p className="text-secondary small">
                Retrouvez les annonces que vous avez sauvegardées.
              </p>
              <Link to={APP_ROUTES.tenantFavorites} className="btn btn-outline-success btn-sm">
                Voir mes favoris
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-6 mb-2"><Mail size={44} /></div>
              <h2 className="h6">Messages</h2>
              <p className="text-secondary small">
                Discutez avec les propriéaires de vos annonces.
              </p>
              <Link to={APP_ROUTES.tenantMessages} className="btn btn-outline-success btn-sm">
                Voir mes messages
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-6 mb-2"><Search size={44} /></div>
              <h2 className="h6">Rechercher</h2>
              <p className="text-secondary small">
                Trouvez votre prochain logement au Cameroun.
              </p>
              <Link to={APP_ROUTES.listings} className="btn btn-outline-success btn-sm">
                Parcourir les annonces
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TenantDashboard
