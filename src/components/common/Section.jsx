function Section({ title, children, className = "" }) {
  return (
    <section className={`section ${className}`}>
      {title && <h2 className="h5 fw-bold mb-3">{title}</h2>}
      {children}
    </section>
  )
}

export default Section
