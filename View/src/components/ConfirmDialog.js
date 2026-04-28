import { useEffect } from 'react'

const ConfirmDialog = ({
  open,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCancel?.()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="cf-modal-overlay" role="presentation" onMouseDown={onCancel}>
      <div
        className="cf-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="cf-modal-header">
          <h3 className="cf-modal-title">{title}</h3>
          <button type="button" className="cf-modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>
        {message && <p className="cf-modal-message">{message}</p>}
        <div className="cf-modal-actions">
          <button type="button" className="cf-btn cf-btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`cf-btn ${tone === 'danger' ? 'cf-btn-danger' : 'cf-btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

