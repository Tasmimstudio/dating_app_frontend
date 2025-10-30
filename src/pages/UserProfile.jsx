// src/pages/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import './UserProfile.css';

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMatched, setIsMatched] = useState(false);
  const currentUserId = JSON.parse(localStorage.getItem('user')).user_id;

  useEffect(() => {
    fetchUserProfile();
    fetchUserPhotos();
    checkIfMatched();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPhotos = async () => {
    try {
      const response = await api.get(`/photos/user/${userId}`);
      setPhotos(response.data.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const checkIfMatched = async () => {
    try {
      const response = await api.get(`/matches/${currentUserId}`);
      const matches = response.data || [];
      const matched = matches.some(match =>
        match.user_id === userId || match.matched_user_id === userId
      );
      setIsMatched(matched);
    } catch (error) {
      console.error('Error checking match status:', error);
    }
  };

  const handleSwipe = async (action) => {
    try {
      const response = await api.post('/swipes/', {
        from_user_id: currentUserId,
        to_user_id: userId,
        action: action,
      });

      if (response.data.is_match) {
        setIsMatched(true);
        alert('It\'s a Match! 🎉');
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error swiping:', error);
    }
  };

  const handleSendMessage = () => {
    navigate(`/chat/${userId}`);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? photos.length - 1 : prev - 1
    );
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="user-profile-page">
        <div className="error-state">
          <h2>User not found</h2>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const displayPhoto = photos.length > 0
    ? photos[currentPhotoIndex].url
    : user.primary_photo;

  return (
    <div className="user-profile-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="user-profile-content">
        {/* Photo Carousel */}
        <div className="photo-carousel">
          {displayPhoto ? (
            <img
              src={`http://localhost:8001${displayPhoto}`}
              alt={user.name}
              className="profile-main-photo"
            />
          ) : (
            <div className="profile-photo-placeholder">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button className="photo-nav-btn prev" onClick={prevPhoto}>
                ‹
              </button>
              <button className="photo-nav-btn next" onClick={nextPhoto}>
                ›
              </button>
              <div className="photo-indicators">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Profile Information */}
        <div className="profile-info-section">
          <div className="profile-header-info">
            <h1 className="profile-name">{user.name}, {user.age}</h1>
          </div>

          {user.bio && (
            <div className="profile-section">
              <h3 className="section-title">About</h3>
              <p className="profile-bio">{user.bio}</p>
            </div>
          )}

          <div className="profile-section">
            <h3 className="section-title">Details</h3>
            <div className="details-grid">
              {user.city && (
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <div>
                    <div className="detail-label">Location</div>
                    <div className="detail-value">{user.city}</div>
                  </div>
                </div>
              )}
              {user.occupation && (
                <div className="detail-item">
                  <span className="detail-icon">💼</span>
                  <div>
                    <div className="detail-label">Occupation</div>
                    <div className="detail-value">{user.occupation}</div>
                  </div>
                </div>
              )}
              {user.education && (
                <div className="detail-item">
                  <span className="detail-icon">🎓</span>
                  <div>
                    <div className="detail-label">Education</div>
                    <div className="detail-value">{user.education}</div>
                  </div>
                </div>
              )}
              {user.height && (
                <div className="detail-item">
                  <span className="detail-icon">📏</span>
                  <div>
                    <div className="detail-label">Height</div>
                    <div className="detail-value">{user.height} cm</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {photos.length > 0 && (
            <div className="profile-section">
              <h3 className="section-title">Photos</h3>
              <div className="photo-gallery">
                {photos.map((photo, index) => (
                  <div
                    key={photo.photo_id}
                    className="gallery-item"
                    onClick={() => setCurrentPhotoIndex(index)}
                  >
                    <img
                      src={`http://localhost:8001${photo.url}`}
                      alt={`${user.name} ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="profile-actions">
        {isMatched ? (
          <button className="btn-send-msg" onClick={handleSendMessage}>
            💬 Send Message
          </button>
        ) : (
          <div className="swipe-actions-bottom">
            <button
              className="btn-action dislike"
              onClick={() => handleSwipe('dislike')}
              title="Pass"
            >
              ✕
            </button>
            <button
              className="btn-action super-like"
              onClick={() => handleSwipe('super_like')}
              title="Super Like"
            >
              ⭐
            </button>
            <button
              className="btn-action like"
              onClick={() => handleSwipe('like')}
              title="Like"
            >
              ❤️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
