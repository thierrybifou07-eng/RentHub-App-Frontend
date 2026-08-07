function ListingLocation({ city, neighborhood }) {
  return (
    <p className="listing-location text-secondary small mb-0">
      {city}
      {neighborhood && <span> &middot; {neighborhood}</span>}
    </p>
  )
}

export default ListingLocation
