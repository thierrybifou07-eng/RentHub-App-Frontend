import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import { getOwnerListings } from "../../services/ownerService"
import { getConversationsByUser } from "../../services/messagingService"
import PageHeader from "../../components/common/PageHeader"
import StatCard from "../../components/common/StatCard"

function OwnerDashboard() {
  const user = useAuthStore((s) => s.user)
  const [listingCount, setListingCount] = useState(0)
  const [publishedCount, setPublishedCount] = useState(0)
  const [conversationCount, setConversationCount] = useState(0)

  useEffect(() => {
    if (!user) return
    let active = true
    Promise.all([
      getOwnerListings(user.id),
      getConversationsByUser(user.id),
    ]).then(([listings, convs]) => {
      if (active) {
        setListingCount(listings.length)
        setPublishedCount(listings.filter((l) => l.status === "published").length)
        setConversationCount(convs.length)
      }
    })
    return () => { active = false }
  }, [user])

  return (
    <div>
      <PageHeader
        title="Espace propriétaire"
        description={`Gérez vos annonces et suivez votre activité, ${user?.name || "propriétaire"}.`}
      />

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <StatCard icon="&#128203;" value={listingCount} label="Annonces" />
        </div>
        <div className="col-md-4">
          <StatCard icon="&#9989;" value={publishedCount} label="Publiées" />
        </div>
        <div className="col-md-4">
          <StatCard icon="&#9993;" value={conversationCount} label="Conversations" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-6 mb-2">&#128203;</div>
              <h2 className="h6">Mes annonces</h2>
              <p className="text-secondary small">
                Créez, modifiez et publiez vos annonces.
              </p>
              <Link to={APP_ROUTES.ownerListings} className="btn btn-outline-success btn-sm">
                Gérer mes annonces
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-6 mb-2">&#9993;</div>
              <h2 className="h6">Messages</h2>
              <p className="text-secondary small">
                Répondez aux demandes des locataires.
              </p>
              <Link to={APP_ROUTES.ownerMessages} className="btn btn-outline-success btn-sm">
                Voir les messages
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-6 mb-2">&#128200;</div>
              <h2 className="h6">Activité</h2>
              <p className="text-secondary small">
                {publishedCount} annonce{publishedCount > 1 ? "s" : ""} active{publishedCount > 1 ? "s" : ""} sur le marché.
              </p>
              <span className="badge text-bg-success">
                {publishedCount} en ligne
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
