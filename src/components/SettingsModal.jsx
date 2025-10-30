// src/components/SettingsModal.jsx
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="settings-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
