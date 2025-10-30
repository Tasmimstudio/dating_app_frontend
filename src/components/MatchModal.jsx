// src/components/MatchModal.jsx
import { useNavigate } from 'react-router-dom';
import './MatchModal.css';

function MatchModal({ isOpen, currentUser, matchedUser, onClose }) {
  const navigate = useNavigate();

  if (!isOpen || !matchedUser) return null;

  const handleSendMessage = () => {
    navigate(`/chat/${matchedUser.user_id}`);
    onClose();
  };

  const handleKeepSwiping = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay, not the modal content
    if (e.target.classList.contains('match-modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="match-modal-overlay" onClick={handleOverlayClick}>
      <div className="match-modal-card">
        <div className="match-celebration">
          <h1 className="match-headline">🎉 It's a Match! 🎉</h1>
          <p className="match-subtext">You and {matchedUser.name} liked each other!</p>
        </div>

        <div className="match-photos">
          <div className="match-photo-wrapper">
            <div className="match-photo current-user">
              {currentUser?.photo ? (
                <img
                  src={`http://localhost:8001${currentUser.photo}`}
                  alt={currentUser.name}
                />
              ) : (
                <div className="photo-placeholder">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <p className="match-name">{currentUser?.name || 'You'}</p>
          </div>

          <div className="match-heart">❤️</div>

          <div className="match-photo-wrapper">
            <div className="match-photo matched-user">
              {matchedUser.photo ? (
                <img
                  src={`http://localhost:8001${matchedUser.photo}`}
                  alt={matchedUser.name}
                />
              ) : (
                <div className="photo-placeholder">
                  {matchedUser.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <p className="match-name">{matchedUser.name}</p>
          </div>
        </div>

        <div className="match-actions">
          <button className="btn-send-message" onClick={handleSendMessage}>
            💬 Send Message
          </button>
          <button className="btn-keep-swiping" onClick={handleKeepSwiping}>
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}

export default MatchModal;
