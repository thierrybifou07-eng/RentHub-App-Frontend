function PageHeader({ title, description, children }) {
  return (
    <div className="page-header d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        {description && <p className="text-secondary mb-0">{description}</p>}
      </div>
      {children && <div>{children}</div>}
    </div>
  )
}

export default PageHeader
