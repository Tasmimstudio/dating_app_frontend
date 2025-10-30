// src/components/PhotoUpload.jsx
import { useState } from 'react';
import api from '../api/axios';
import './PhotoUpload.css';

function PhotoUpload({ userId, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_id', userId);
      formData.append('is_primary', 'false');
      formData.append('order', '0');

      const response = await api.post('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setSelectedFile(null);
      setPreview(null);

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
  };

  return (
    <div className="photo-upload">
      <div className="upload-container">
        {!preview ? (
          <div className="upload-area">
            <input
              type="file"
              id="photo-input"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="photo-input" className="upload-label">
              <div className="upload-icon">📷</div>
              <p>Click to select a photo</p>
              <span className="upload-hint">JPG, PNG, GIF or WEBP (max 5MB)</span>
            </label>
          </div>
        ) : (
          <div className="preview-area">
            <img src={preview} alt="Preview" className="preview-image" />
            <div className="preview-actions">
              <button onClick={handleCancel} className="btn-cancel" disabled={uploading}>
                Cancel
              </button>
              <button onClick={handleUpload} className="btn-upload" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>
        )}

        {error && <div className="upload-error">{error}</div>}
      </div>
    </div>
  );
}

export default PhotoUpload;
