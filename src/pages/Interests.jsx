// src/pages/Interests.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Interests.css';

const INTERESTS_DATA = [
  { id: 'travel', name: 'Travel', emoji: '✈️' },
  { id: 'photography', name: 'Photography', emoji: '📸' },
  { id: 'fitness', name: 'Fitness', emoji: '💪' },
  { id: 'cooking', name: 'Cooking', emoji: '🍳' },
  { id: 'music', name: 'Music', emoji: '🎵' },
  { id: 'movies', name: 'Movies', emoji: '🎬' },
  { id: 'reading', name: 'Reading', emoji: '📚' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮' },
  { id: 'sports', name: 'Sports', emoji: '⚽' },
  { id: 'art', name: 'Art', emoji: '🎨' },
  { id: 'dancing', name: 'Dancing', emoji: '💃' },
  { id: 'yoga', name: 'Yoga', emoji: '🧘' },
  { id: 'hiking', name: 'Hiking', emoji: '🥾' },
  { id: 'pets', name: 'Pets', emoji: '🐾' },
  { id: 'fashion', name: 'Fashion', emoji: '👗' },
  { id: 'foodie', name: 'Foodie', emoji: '🍕' },
  { id: 'coffee', name: 'Coffee', emoji: '☕' },
  { id: 'wine', name: 'Wine', emoji: '🍷' },
  { id: 'beach', name: 'Beach', emoji: '🏖️' },
  { id: 'nature', name: 'Nature', emoji: '🌿' },
  { id: 'tech', name: 'Technology', emoji: '💻' },
  { id: 'cars', name: 'Cars', emoji: '🚗' },
  { id: 'motorcycles', name: 'Motorcycles', emoji: '🏍️' },
  { id: 'volunteering', name: 'Volunteering', emoji: '🤝' },
];

function Interests() {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interestId) => {
    setError('');
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else {
        if (prev.length >= 10) {
          setError('You can select up to 10 interests');
          return prev;
        }
        return [...prev, interestId];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedInterests.length < 3) {
      setError('Please select at least 3 interests');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.user_id) {
        setError('User not found. Please log in again.');
        navigate('/login');
        return;
      }

      // Save interests to backend
      await api.put(`/users/${user.user_id}/interests`, {
        interests: selectedInterests
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving interests:', err);
      setError(err.response?.data?.detail || 'Failed to save interests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="interests-container">
      <div className="interests-card">
        <button className="back-nav-btn" onClick={() => navigate('/register')}>
          &lt;
        </button>

        {/* Progress Indicator */}
        <div className="step-indicator">
          <div className="step completed">1</div>
          <div className="step-line completed"></div>
          <div className="step completed">2</div>
          <div className="step-line completed"></div>
          <div className="step active">3</div>
        </div>

        <div className="interests-header">
          <h1>What are your interests? 🎯</h1>
          <p>Select at least 3 interests to help us find your perfect match</p>
          <div className="selection-counter">
            {selectedInterests.length} / 10 selected
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="interests-grid">
          {INTERESTS_DATA.map(interest => (
            <button
              key={interest.id}
              className={`interest-chip ${selectedInterests.includes(interest.id) ? 'selected' : ''}`}
              onClick={() => toggleInterest(interest.id)}
            >
              <span className="interest-emoji">{interest.emoji}</span>
              <span className="interest-name">{interest.name}</span>
            </button>
          ))}
        </div>

        <div className="interests-actions">
          <button className="skip-btn" onClick={handleSkip}>
            Skip for now
          </button>
          <button
            className="continue-btn"
            onClick={handleContinue}
            disabled={selectedInterests.length < 3 || loading}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>

      {/* Animated Background */}
      <div className="floating-circle circle1"></div>
      <div className="floating-circle circle2"></div>
      <div className="floating-circle circle3"></div>
    </div>
  );
}

export default Interests;
