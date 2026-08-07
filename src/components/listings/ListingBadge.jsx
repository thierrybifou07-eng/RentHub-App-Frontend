import { LISTING_STATUS } from "../../constants/listingOptions"

const STATUS_VARIANT = {
  draft: "secondary",
  pending: "info",
  published: "success",
  archived: "dark",
  rejected: "danger",
}

function ListingBadge({ status }) {
  const variant = STATUS_VARIANT[status] || "secondary"
  const label = LISTING_STATUS[status] || status

  return (
    <span className={`badge text-bg-${variant} listing-badge`}>
      {label}
    </span>
  )
}

export default ListingBadge
