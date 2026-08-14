import MediaUploader from "../media/MediaUploader"

export default function MediaSection({ existingMedia, onDeleteExisting, onChange }) {
  return (
    <MediaUploader
      existingMedia={existingMedia}
      onDeleteExisting={onDeleteExisting}
      onChange={onChange}
      maxImages={10}
      maxVideos={3}
    />
  )
}
