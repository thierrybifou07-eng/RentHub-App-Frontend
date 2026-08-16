import MediaUploader from "../media/MediaUploader"
import { FREE_PLAN_LIMITS } from "../../utils/subscriptionLimits"

export default function MediaSection({
  existingMedia,
  onDeleteExisting,
  onChange,
  maxImages = FREE_PLAN_LIMITS.max_media,
  maxVideos = 3,
}) {
  return (
    <MediaUploader
      existingMedia={existingMedia}
      onDeleteExisting={onDeleteExisting}
      onChange={onChange}
      maxImages={maxImages}
      maxVideos={maxVideos}
    />
  )
}
