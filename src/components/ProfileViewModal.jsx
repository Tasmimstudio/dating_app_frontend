// src/components/ProfileViewModal.jsx
import { useState, useEffect } from 'react';
import './ProfileViewModal.css';

function ProfileViewModal({ user, isOpen, onClose, onLike, onDislike, onSuperLike }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Keyboard shortcuts for modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevPhoto();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextPhoto();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentPhotoIndex, onClose]);

  if (!isOpen || !user) return null;

  const photos = user.photos || (user.primary_photo ? [{ url: user.primary_photo }] : []);

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleAction = (action) => {
    onClose();
    if (action === 'like' && onLike) onLike();
    if (action === 'dislike' && onDislike) onDislike();
    if (action === 'super_like' && onSuperLike) onSuperLike();
  };

  return (
    <div className="profile-view-modal-overlay" onClick={onClose}>
      <div className="profile-view-modal split-layout" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        {/* Left Side - Photo Gallery & Album */}
        <div className="modal-left-section">
          <div className="modal-photo-section">
            {photos.length > 0 ? (
              <>
                <img
                  src={photos[currentPhotoIndex].url?.startsWith('http')
                    ? photos[currentPhotoIndex].url
                    : `http://localhost:8002${photos[currentPhotoIndex].url || photos[currentPhotoIndex]}`}
                  alt={user.name}
                  className="modal-photo"
                />

                {photos.length > 1 && (
                  <>
                    {currentPhotoIndex > 0 && (
                      <button className="photo-nav-btn prev" onClick={prevPhoto}>‹</button>
                    )}
                    {currentPhotoIndex < photos.length - 1 && (
                      <button className="photo-nav-btn next" onClick={nextPhoto}>›</button>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="modal-photo-placeholder">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          {/* Photo Album Thumbnails */}
          {photos.length > 1 && (
            <div className="photo-album">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className={`album-thumbnail ${idx === currentPhotoIndex ? 'active' : ''}`}
                  onClick={() => setCurrentPhotoIndex(idx)}
                >
                  <img
                    src={photo.url?.startsWith('http')
                      ? photo.url
                      : `http://localhost:8002${photo.url || photo}`}
                    alt={`Photo ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - User Details */}
        <div className="modal-right-section">
          <div className="modal-header-info">
            <h2>{user.name}, {user.age}</h2>
            {user.city && <p className="modal-location">📍 {user.city}</p>}
          </div>

          <div className="modal-content">
            <div className="modal-section">
              <h3>About</h3>
              <p className="modal-bio">{user.bio || 'No bio available...'}</p>
            </div>

            {(user.occupation || user.education || user.height || user.gender) && (
              <div className="modal-section">
                <h3>Details</h3>
                <div className="modal-details-grid">
                  {user.occupation && (
                    <div className="modal-detail-item">
                      <span className="detail-icon">💼</span>
                      <div>
                        <div className="detail-label">Occupation</div>
                        <div className="detail-value">{user.occupation}</div>
                      </div>
                    </div>
                  )}
                  {user.education && (
                    <div className="modal-detail-item">
                      <span className="detail-icon">🎓</span>
                      <div>
                        <div className="detail-label">Education</div>
                        <div className="detail-value">{user.education}</div>
                      </div>
                    </div>
                  )}
                  {user.height && (
                    <div className="modal-detail-item">
                      <span className="detail-icon">📏</span>
                      <div>
                        <div className="detail-label">Height</div>
                        <div className="detail-value">{user.height} cm</div>
                      </div>
                    </div>
                  )}
                  {user.gender && (
                    <div className="modal-detail-item">
                      <span className="detail-icon">⚧</span>
                      <div>
                        <div className="detail-label">Gender</div>
                        <div className="detail-value">{user.gender}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {(onLike || onDislike || onSuperLike) && (
            <div className="modal-actions">
              {onDislike && (
                <button
                  className="modal-btn-dislike"
                  onClick={() => handleAction('dislike')}
                  title="Pass"
                ></button>
              )}
              {onSuperLike && (
                <button
                  className="modal-btn-super-like"
                  onClick={() => handleAction('super_like')}
                  title="Super Like"
                ></button>
              )}
              {onLike && (
                <button
                  className="modal-btn-like"
                  onClick={() => handleAction('like')}
                  title="Like"
                ></button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileViewModal;
