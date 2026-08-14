import { useState, useEffect, useRef } from "react"
import { getMediaUrl } from "../../utils/formatters" // We need to add this or use existing

export default function MediaUploader({
  existingMedia = [],
  onDeleteExisting,
  onChange,
  maxImages = 10,
  maxVideos = 3
}) {
  const [newFiles, setNewFiles] = useState([])
  const fileInputRef = useRef(null)

  // Nettoyage des URL d'objet pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      newFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview)
      })
    }
  }, [newFiles])

  // Notification du composant parent (ex: ListingForm)
  useEffect(() => {
    const images = newFiles.filter(f => f.type.startsWith('image/'))
    const videos = newFiles.filter(f => f.type.startsWith('video/'))
    onChange({ images, videos })
    // On ne met intentionnellement pas onChange dans les deps pour éviter les boucles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newFiles])

  const existingImages = existingMedia.filter(m => m.mediaType?.code === "IMAGE" || m.MediaType?.code === "IMAGE" || m.type === "image" || !m.type)
  const existingVideos = existingMedia.filter(m => m.mediaType?.code === "VIDEO" || m.MediaType?.code === "VIDEO" || m.type === "video")

  const newImagesCount = newFiles.filter(f => f.type.startsWith('image/')).length
  const newVideosCount = newFiles.filter(f => f.type.startsWith('video/')).length
  
  const canAddMoreImages = (existingImages.length + newImagesCount) < maxImages
  const canAddMoreVideos = (existingVideos.length + newVideosCount) < maxVideos

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    
    // Ajout de la prévisualisation pour chaque fichier
    const filesWithPreviews = selected.map(f => {
      // Pour éviter de modifier l'objet File original qui est readonly sur certaines props, on attache la preview
      f.preview = URL.createObjectURL(f)
      return f
    })

    setNewFiles(prev => [...prev, ...filesWithPreviews])
    
    // Réinitialiser l'input file pour permettre la sélection des mêmes fichiers si besoin
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeNewFile = (index) => {
    setNewFiles(prev => {
      const copy = [...prev]
      if (copy[index].preview) {
        URL.revokeObjectURL(copy[index].preview)
      }
      copy.splice(index, 1)
      return copy
    })
  }

  return (
    <div className="media-uploader">
      {/* Zone d'ajout */}
      <div className="mb-3">
        <label htmlFor="media-upload-input" className="form-label d-block fw-semibold">
          Ajouter des images/vidéos
        </label>
        <div className="d-flex align-items-center gap-3">
          <button 
            type="button" 
            className="btn btn-outline-success"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canAddMoreImages && !canAddMoreVideos}
          >
            Sélectionner des fichiers
          </button>
          <span className="text-secondary small">
            Limites : {maxImages} images (reste {maxImages - (existingImages.length + newImagesCount)}), 
            {maxVideos} vidéos (reste {maxVideos - (existingVideos.length + newVideosCount)})
          </span>
        </div>
        <input
          type="file"
          id="media-upload-input"
          className="d-none"
          multiple
          accept="image/*,video/mp4,video/webm"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={!canAddMoreImages && !canAddMoreVideos}
        />
        <div className="form-text">
          L'image qui apparaît en premier sera utilisée comme image de couverture de l'annonce.
        </div>
      </div>

      {/* Grille de prévisualisation */}
      {(existingMedia.length > 0 || newFiles.length > 0) && (
        <div className="media-preview-grid mt-4">
          <h6 className="fw-semibold mb-3 border-bottom pb-2">Aperçu des médias sélectionnés</h6>
          
          <div className="d-flex flex-wrap gap-3">
            {/* Médias existants (déjà sur le serveur) */}
            {existingMedia.map((m) => {
              const isVideo = m.mediaType?.code === "VIDEO" || m.MediaType?.code === "VIDEO" || m.type === "video"
              const imgUrl = m.url || m.path || m.file_path
              // L'URL de l'image (si c'est hébergé par le backend)
              const src = imgUrl?.startsWith("http") ? imgUrl : `${import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") || ""}/${imgUrl?.replace(/^\//, "")}`

              return (
                <div key={m.id} className="position-relative border rounded overflow-hidden shadow-sm" style={{ width: "120px", height: "120px", backgroundColor: "#f8f9fa" }}>
                  {isVideo ? (
                    <div className="d-flex align-items-center justify-content-center h-100 bg-dark text-white">
                      <span className="small">🎥 Vidéo</span>
                    </div>
                  ) : (
                    <img src={src} alt="Existant" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  <span className="position-absolute top-0 start-0 badge bg-dark m-1" style={{ fontSize: "0.6rem" }}>En ligne</span>
                  {onDeleteExisting && (
                    <button 
                      type="button" 
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0 d-flex align-items-center justify-content-center" 
                      style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                      onClick={() => onDeleteExisting(m.id)}
                      title="Supprimer ce média existant"
                    >
                      &times;
                    </button>
                  )}
                </div>
              )
            })}

            {/* Nouveaux médias en attente d'upload */}
            {newFiles.map((file, index) => {
              const isVideo = file.type.startsWith('video/')
              return (
                <div key={index} className="position-relative border rounded overflow-hidden shadow-sm" style={{ width: "120px", height: "120px", backgroundColor: "#f8f9fa" }}>
                  {isVideo ? (
                    <video src={file.preview} className="w-100 h-100 object-fit-cover" muted />
                  ) : (
                    <img src={file.preview} alt="Nouveau" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  <span className="position-absolute top-0 start-0 badge bg-success m-1" style={{ fontSize: "0.6rem" }}>Nouveau</span>
                  {(index === 0 && existingMedia.length === 0) && (
                    <span className="position-absolute bottom-0 start-0 badge bg-primary m-1" style={{ fontSize: "0.6rem" }}>Couverture</span>
                  )}
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0 d-flex align-items-center justify-content-center" 
                    style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                    onClick={() => removeNewFile(index)}
                    title="Retirer de la sélection"
                  >
                    &times;
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
