// src/pages/PhotoUploadScreen.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './PhotoUploadScreen.css';

function PhotoUploadScreen() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState(Array(6).fill(null));
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const userId = JSON.parse(localStorage.getItem('user')).user_id;

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await api.get(`/photos/user/${userId}`);
      const userPhotos = response.data.photos || [];
      const photoArray = Array(6).fill(null);
      userPhotos.forEach((photo, index) => {
        if (index < 6) {
          photoArray[index] = photo;
        }
      });
      setPhotos(photoArray);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleFileSelect = async (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);
      formData.append('is_primary', index === 0 ? 'true' : 'false');

      const response = await api.post('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newPhotos = [...photos];
      newPhotos[index] = response.data;
      setPhotos(newPhotos);
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (index) => {
    const photo = photos[index];
    if (!photo) return;

    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      await api.delete(`/photos/${photo.photo_id}`);
      const newPhotos = [...photos];
      newPhotos[index] = null;
      setPhotos(newPhotos);
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    const droppedPhoto = newPhotos[dropIndex];

    newPhotos[draggedIndex] = droppedPhoto;
    newPhotos[dropIndex] = draggedPhoto;

    setPhotos(newPhotos);
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    const uploadedPhotos = photos.filter(p => p !== null);

    if (uploadedPhotos.length < 3) {
      alert('Please add at least 3 photos for better matches');
      return;
    }

    // Update photo order on backend
    try {
      const photoUpdates = photos
        .map((photo, index) => ({
          photo_id: photo?.photo_id,
          order: index,
          is_primary: index === 0,
        }))
        .filter(p => p.photo_id);

      await api.put(`/photos/user/${userId}/reorder`, { photos: photoUpdates });
      alert('Photos saved successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error saving photo order:', error);
      alert('Failed to save changes');
    }
  };

  const photoCount = photos.filter(p => p !== null).length;

  return (
    <div className="photo-upload-page">
      <header className="photo-upload-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          ← Back
        </button>
        <h1 className="page-title">Add Photos</h1>
      </header>

      <div className="photo-upload-content">
        <div className="upload-tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">
            Add at least 3 photos for better matches ({photoCount}/6 uploaded)
          </span>
        </div>

        <div className="photo-grid">
          {photos.map((photo, index) => (
            <div
              key={index}
              className={`photo-slot ${photo ? 'has-photo' : ''} ${index === 0 ? 'primary' : ''}`}
              draggable={photo !== null}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              {photo ? (
                <>
                  <img
                    src={`http://localhost:8000${photo.url}`}
                    alt={`Photo ${index + 1}`}
                    className="photo-preview"
                  />
                  {index === 0 && <div className="primary-badge">Primary</div>}
                  <button
                    className="delete-photo-btn"
                    onClick={() => handleDeletePhoto(index)}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(index, e)}
                    disabled={loading}
                    className="file-input"
                  />
                  <div className="upload-icon">+</div>
                  <div className="upload-text">
                    {index === 0 ? 'Add Primary' : 'Add Photo'}
                  </div>
                </label>
              )}
            </div>
          ))}
        </div>

        <button
          className="save-photos-btn"
          onClick={handleSave}
          disabled={loading || photoCount < 3}
        >
          {loading ? 'Saving...' : 'Save Photos'}
        </button>

        <div className="photo-tips">
          <h3>Photo Tips:</h3>
          <ul>
            <li>Use clear, recent photos of yourself</li>
            <li>Show your face clearly in at least one photo</li>
            <li>Avoid group photos where you're hard to identify</li>
            <li>First photo is your primary photo (most important!)</li>
            <li>Drag and drop to reorder photos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PhotoUploadScreen;
