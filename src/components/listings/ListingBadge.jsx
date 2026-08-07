import { getAnnouncementStatusLabel, getAnnouncementStatusTheme } from "../../constants/apiStatuses"

function ListingBadge({ statusId }) {
  const label = getAnnouncementStatusLabel(statusId)
  const theme = getAnnouncementStatusTheme(statusId)

  // Utilisation de badge-pill défini dans global.css
  return (
    <span className={`badge-pill badge-pill-${theme}`}>
      {label}
    </span>
  )
}

export default ListingBadge
