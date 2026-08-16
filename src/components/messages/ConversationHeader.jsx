import { Link } from "react-router-dom"
import { getListingDetailPath } from "../../constants/routes"
import { getPrimaryMediaUrl } from "../../utils/mediaUrl"

function ConversationHeader({ conversation, onBack, getParticipant, participantFallback }) {
  const title = conversation.Announcement?.title || "Annonce"
  const participant = getParticipant(conversation) || participantFallback
  const city = conversation.Announcement?.City?.name || conversation.announcement?.city?.name
  const coverUrl = getPrimaryMediaUrl(conversation.Announcement?.Media)

  return (
    <div className="conversation-header">
      <button
        type="button"
        className="btn btn-sm btn-light d-md-none flex-shrink-0"
        onClick={onBack}
        aria-label="Retour aux conversations"
      >
        &larr;
      </button>
      {coverUrl && (
        <img className="conversation-header-thumb" src={coverUrl} alt="" loading="lazy" />
      )}
      <div className="conversation-header-main">
        <Link to={getListingDetailPath(conversation.announcement_id)} className="conversation-header-title">
          {title}
        </Link>
        <span className="conversation-header-sub">
          {participant}
          {city ? ` \u00b7 ${city}` : ""}
        </span>
      </div>
    </div>
  )
}

export default ConversationHeader
