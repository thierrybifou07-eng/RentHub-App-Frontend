import { formatXAF } from "../../utils/formatters"

function ListingPrice({ price, period = "mois" }) {
  return (
    <p className="listing-price fw-bold text-success mb-0">
      {formatXAF(price)} <span className="fw-normal text-secondary small">XAF / {period}</span>
    </p>
  )
}

export default ListingPrice
