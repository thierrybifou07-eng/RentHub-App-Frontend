import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { APP_ROUTES } from "../../constants/routes"
import { useAuthStore } from "../../stores/authStore"
import { useSubscriptionsStore } from "../../stores/subscriptionsStore"
import { getPlanFeatures } from "../../utils/subscriptionLimits"
import { getOwnerListings } from "../../services/ownerService"
import { getConversationsByUser } from "../../services/messagingService"
import { getUnreadCount } from "../../api/conversationsApi"
import PageHeader from "../../components/common/PageHeader"
import StatCard from "../../components/common/StatCard"
import ListingBadge from "../../components/listings/ListingBadge"
import { SkeletonDashboard } from "../../components/feedback/SkeletonLoader"
import { formatXAF } from "../../utils/formatters"
import { CircleCheck, ClipboardList, Clock, Archive, CreditCard, Mail, MessageSquare, Star } from "lucide-react"
import { ANNOUNCEMENT_STATUS } from "../../constants/apiStatuses"

function OwnerDashboard() {
  const user = useAuthStore((s) => s.user)
  const { currentSubscription, fetchMySubscription } = useSubscriptionsStore()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState([])
  const [conversationCount, setConversationCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    let active = true

    fetchMySubscription()

    Promise.all([
      getOwnerListings({ limit: 100 }),
      getConversationsByUser(),
      getUnreadCount().catch(() => ({ count: 0 })),
    ]).then(([result, convs, unread]) => {
      if (active) {
        setListings(result.items || result || [])
        setConversationCount(Array.isArray(convs) ? convs.length : 0)
        setUnreadCount(unread?.data?.count ?? unread?.count ?? unread?.unreadCount ?? 0)
      }
    }).finally(() => {
      if (active) setLoading(false)
    })

    return () => { active = false }
  }, [user, fetchMySubscription])

  const publishedCount = listings.filter((l) => l.status_id === ANNOUNCEMENT_STATUS.ACTIVE.id).length
  const pendingCount = listings.filter((l) => l.status_id === ANNOUNCEMENT_STATUS.PENDING_REVIEW.id).length
  const archivedCount = listings.filter((l) => l.status_id === ANNOUNCEMENT_STATUS.ARCHIVED.id).length
  const favoritesReceived = listings.reduce(
    (sum, l) => sum + Number(l.favoritesCount || l.favorites_count || 0),
    0
  )
  const recentListings = listings.slice(0, 5)
  const planLimits = getPlanFeatures(currentSubscription)

  return (
    <div>
      <PageHeader
        title="Espace propriétaire"
        description={`Gérez vos annonces et suivez votre activité, ${user?.name || "propriétaire"}.`}
      />

      {loading ? (
        <SkeletonDashboard stats={8} rows={4} />
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-md-4 col-xl-3">
              <StatCard icon={ClipboardList} value={listings.length} label="Annonces" color="primary" />
            </div>
            <div className="col-sm-6 col-md-4 col-xl-3">
              <StatCard icon={CircleCheck} value={publishedCount} label="Publiées" color="success" />
            </div>
            <div className="col-sm-6 col-md-4 col-xl-3">
              <StatCard
                icon={CreditCard}
                value={`${publishedCount}/${planLimits.max_active_announcements}`}
                label="Annonces actives / quota"
                color={publishedCount >= planLimits.max_active_announcements ? "danger" : "primary"}
              />
            </div>
            <div className="col-sm-6 col-md-4 col-xl-3">
              <StatCard icon={Clock} value={pendingCount} label="En attente de revue" color="warning" />
            </div>
            <div className="col-sm-6 col-md-4 col-xl-3">
              <StatCard icon={Archive} value={archivedCount} label="Archivées" color="info" />
            </div>
            <div className="col-sm-6 col-md-4 col-xl-3">
              <StatCard icon={Mail} value={conversationCount} label="Conversations" color="info" />
            </div>
            <div className="col-sm-6 col-md-4 col-xl-3">
              <StatCard icon={MessageSquare} value={unreadCount} label="Messages non lus" color="danger" />
            </div>
            <div className="col-sm-6 col-md-4 col-xl-3">
              <StatCard icon={Star} value={favoritesReceived} label="Favoris reçus" color="warning" />
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h6 mb-0">Dernières annonces</h2>
                <Link to={APP_ROUTES.ownerListings} className="btn btn-outline-success btn-sm">
                  Gérer mes annonces
                </Link>
              </div>

              {recentListings.length === 0 ? (
                <p className="text-secondary small mb-0">
                  Vous n'avez pas encore créé d'annonce.{" "}
                  <Link to={APP_ROUTES.ownerListingNew} className="text-decoration-none">Créer ma première annonce</Link>.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle table-renthub mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Titre</th>
                        <th scope="col" className="text-end">Prix</th>
                        <th scope="col" className="text-center">Statut</th>
                        <th scope="col" className="text-end">Aperçu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentListings.map((listing) => (
                        <tr key={listing.id}>
                          <td className="fw-semibold">{listing.title}</td>
                          <td className="text-end fw-bold text-success small">
                            {formatXAF(listing.price)} XAF
                          </td>
                          <td className="text-center">
                            <ListingBadge statusId={listing.status_id} />
                          </td>
                          <td className="text-end">
                            <Link
                              to={APP_ROUTES.ownerListingDetail.replace(":id", listing.id)}
                              className="btn btn-outline-secondary btn-sm"
                            >
                              Aperçu
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default OwnerDashboard
