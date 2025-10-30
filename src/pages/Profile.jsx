// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PhotoUpload from '../components/PhotoUpload';
import ProfileCompletenessIndicator from '../components/ProfileCompletenessIndicator';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'male',
    bio: '',
    city: '',
    height: '',
    occupation: '',
    education: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchPhotos();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.user_id) {
        const response = await api.get(`/users/${user.user_id}`);
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.user_id) {
        const response = await api.get(`/photos/user/${user.user_id}`);
        setPhotos(response.data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await api.put(`/users/${user.user_id}`, profile);

      // Update localStorage user data
      localStorage.setItem('user', JSON.stringify({ ...user, ...profile }));

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePhotoUploadSuccess = (photoData) => {
    setShowPhotoUpload(false);
    fetchPhotos();
  };

  const handleSetPrimaryPhoto = async (photoId) => {
    try {
      await api.patch(`/photos/${photoId}`, { is_primary: true });
      fetchPhotos();
    } catch (error) {
      console.error('Error setting primary photo:', error);
      alert('Failed to set primary photo');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await api.delete(`/photos/${photoId}`);
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <header className="profile-nav-header">
        <div className="header-left">
          <div className="profile-avatar-small">
            {photos.length > 0 && photos.find(p => p.is_primary) ? (
              <img
                src={photos.find(p => p.is_primary).url.startsWith('http')
                  ? photos.find(p => p.is_primary).url
                  : `http://localhost:8002${photos.find(p => p.is_primary).url}`}
                alt={profile.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              profile.name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <h1 className="username-header">{profile.name || 'User'}</h1>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/dashboard')} className="home-btn" title="Home">
            🏠
          </button>
          <button onClick={() => navigate('/dashboard')} className="nav-btn discover-btn">Discover</button>
          <nav className="profile-nav">
            <button onClick={() => navigate('/matches')} className="nav-btn">Matches</button>
            <button onClick={() => navigate('/messages')} className="nav-btn">Messages</button>
            <button onClick={handleLogout} className="nav-btn logout-btn">Logout</button>
          </nav>
        </div>
      </header>

      <div className="profile-content">
        <div className="profile-header-section">
          <div className="profile-avatar-large">
            {photos.length > 0 && photos[0] ? (
              <img
                src={photos[0].url.startsWith('http')
                  ? photos[0].url
                  : `http://localhost:8002${photos[0].url}`}
                alt={profile.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              profile.name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <h2 className="profile-name">{profile.name || 'User'}</h2>
          {!isEditing && (
            <>
              <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
              <button className="edit-profile-btn" onClick={() => navigate('/photo-upload')}>
                📷 Manage Photos
              </button>
            </>
          )}
        </div>

        {/* Profile Completeness Indicator */}
        <ProfileCompletenessIndicator profile={profile} photos={photos} />

        {/* Photos Section */}
        <div className="profile-details-card">
          <h3>My Photos ({photos.length})</h3>
          <div className="photos-grid">
            {photos.length > 0 ? (
              photos.map((photo, index) => (
                <div key={photo.photo_id} className="photo-item">
                  <img
                    src={photo.url.startsWith('http')
                      ? photo.url
                      : `http://localhost:8002${photo.url}`}
                    alt={`Photo ${index + 1}`}
                  />
                  {photo.is_primary && <span className="primary-badge">Primary</span>}
                </div>
              ))
            ) : (
              <p className="no-photos">No photos yet. Add photos to get more matches!</p>
            )}
          </div>
          <button className="btn-primary" onClick={() => navigate('/photo-upload')}>
            {photos.length > 0 ? 'Manage Photos' : 'Add Photos'}
          </button>
        </div>

        <div className="profile-details-card">
          <div className="form-group">
            <label>Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={profile.name || ''}
                onChange={handleInputChange}
                className="form-input"
              />
            ) : (
              <p className="form-value">{profile.name || 'Not set'}</p>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            <p className="form-value read-only">{profile.email}</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <p className="form-value read-only">{profile.age}</p>
            </div>

            <div className="form-group">
              <label>Gender</label>
              <p className="form-value read-only">{profile.gender}</p>
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={profile.bio || ''}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="4"
                className="form-textarea"
              />
            ) : (
              <p className="form-value">{profile.bio || 'No bio yet...'}</p>
            )}
          </div>

          <div className="form-group">
            <label>City</label>
            {isEditing ? (
              <input
                type="text"
                name="city"
                value={profile.city || ''}
                onChange={handleInputChange}
                placeholder="Your city"
                className="form-input"
              />
            ) : (
              <p className="form-value">{profile.city || 'Not set'}</p>
            )}
          </div>

          <div className="form-group">
            <label>Height (cm)</label>
            {isEditing ? (
              <input
                type="number"
                name="height"
                value={profile.height || ''}
                onChange={handleInputChange}
                placeholder="Your height in cm"
                className="form-input"
              />
            ) : (
              <p className="form-value">{profile.height ? `${profile.height} cm` : 'Not set'}</p>
            )}
          </div>

          <div className="form-group">
            <label>Occupation</label>
            {isEditing ? (
              <input
                type="text"
                name="occupation"
                value={profile.occupation || ''}
                onChange={handleInputChange}
                placeholder="Your occupation"
                className="form-input"
              />
            ) : (
              <p className="form-value">{profile.occupation || 'Not set'}</p>
            )}
          </div>

          <div className="form-group">
            <label>Education</label>
            {isEditing ? (
              <input
                type="text"
                name="education"
                value={profile.education || ''}
                onChange={handleInputChange}
                placeholder="Your education"
                className="form-input"
              />
            ) : (
              <p className="form-value">{profile.education || 'Not set'}</p>
            )}
          </div>

          {isEditing && (
            <div className="form-actions">
              <button className="btn-save" onClick={handleSave}>
                Save Changes
              </button>
              <button className="btn-cancel" onClick={() => {
                setIsEditing(false);
                fetchProfile();
              }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
