function StatCard({ icon, value, label }) {
  return (
    <div className="card border-0 shadow-sm h-100 stat-card">
      <div className="card-body text-center">
        <div className="display-6 mb-2" dangerouslySetInnerHTML={{ __html: icon }} />
        <h2 className="h3 fw-bold mb-0">{value}</h2>
        <p className="text-secondary small mb-0">{label}</p>
      </div>
    </div>
  )
}

export default StatCard
