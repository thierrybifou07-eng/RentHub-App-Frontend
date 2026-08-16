function MessageInput({ value, onChange, onSubmit, placeholder, sending, error }) {
  return (
    <form onSubmit={onSubmit} className="message-input-area">
      {error && (
        <div className="alert alert-danger py-1 px-2 small mb-2">{error}</div>
      )}
      <div className="d-flex gap-2 w-100">
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={sending}
          maxLength={2000}
        />
        <button
          type="submit"
          className="btn btn-success"
          disabled={sending || !value.trim()}
        >
          {sending ? "Envoi..." : "Envoyer"}
        </button>
      </div>
    </form>
  )
}

export default MessageInput
