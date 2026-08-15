import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable Confirmation Dialog Component
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls visibility of the dialog
 * @param {string|React.ReactNode} props.title - Title of the modal
 * @param {string|React.ReactNode} props.message - Descriptive text or message
 * @param {string} [props.confirmText="Confirm"] - Text for the confirmation button
 * @param {string} [props.cancelText="Cancel"] - Text for the cancel button
 * @param {string} [props.confirmVariant="danger"] - Bootstrap button variant for confirm button ('danger'|'primary'|'warning'|'success')
 * @param {string} [props.cancelVariant="secondary"] - Bootstrap button variant for cancel button
 * @param {React.ReactNode} [props.icon] - Custom icon component to display
 * @param {Function} props.onConfirm - Callback executed when user confirms action
 * @param {Function} props.onCancel - Callback executed when user cancels action
 * @param {string} [props.className] - Additional class name for modal card
 * @param {string} [props.overlayClassName] - Additional class name for backdrop overlay
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'Please confirm this action.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  cancelVariant = 'secondary',
  icon = null,
  onConfirm,
  onCancel,
  className = '',
  overlayClassName = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onCancel) {
        onCancel();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getVariantClass = (variant) => {
    switch (variant) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'btn-warning';
      case 'success':
        return 'btn-success';
      case 'primary':
        return 'btn-primary';
      case 'outline-secondary':
        return 'btn-outline-secondary';
      case 'outline-danger':
        return 'btn-outline-danger';
      case 'secondary':
      default:
        return 'btn-secondary';
    }
  };

  const dialogContent = (
    <div
      className={`confirm-dialog-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3 ${overlayClassName}`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 10600,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onCancel) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className={`confirm-dialog-card card border-0 shadow-lg rounded-4 overflow-hidden w-100 ${className}`}
        style={{
          maxWidth: '420px',
          background: 'var(--bs-body-bg, #0f172a)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div className="card-body p-4 text-center">
          {icon ? (
            <div className="mb-3 d-inline-flex align-items-center justify-content-center">{icon}</div>
          ) : (
            <div
              className={`mb-3 d-inline-flex align-items-center justify-content-center rounded-circle p-3 bg-${confirmVariant}-subtle text-${confirmVariant}`}
              style={{ width: '56px', height: '56px' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 9v4" />
                <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
                <path d="M12 16h.01" />
              </svg>
            </div>
          )}

          <h5 id="confirm-dialog-title" className="fw-bold mb-2 text-wrap">
            {title}
          </h5>

          {message && (
            <div className="text-secondary small mb-4 text-wrap px-2" style={{ opacity: 0.9 }}>
              {message}
            </div>
          )}

          <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
            <button
              type="button"
              className={`btn ${getVariantClass(cancelVariant)} px-4 py-2 rounded-3 fw-medium`}
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn ${getVariantClass(confirmVariant)} px-4 py-2 rounded-3 fw-medium`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
