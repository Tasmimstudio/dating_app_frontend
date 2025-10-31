// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'male',
    bio: '',
    city: '',
    latitude: 0,
    longitude: 0,
    height: 0,
    occupation: '',
    education: '',
    preferences: {
      min_age: 18,
      max_age: 30,
      max_distance: 10,
      gender_preference: ['male', 'female'],
    },
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('preferences.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.name.trim()) return setError('Please enter your name');
      if (!formData.email.trim()) return setError('Please enter your email');
      if (formData.password.length < 8)
        return setError('Password must be at least 8 characters long');
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setError('');
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) return setError('Password too short');
    const age = parseInt(formData.age);
    if (age < 18 || age > 100) return setError('Age must be between 18 and 100');

    setLoading(true);

    try {
      // Convert age and preferences numeric values
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        height: parseFloat(formData.height),
        preferences: {
          ...formData.preferences,
          min_age: parseInt(formData.preferences.min_age),
          max_age: parseInt(formData.preferences.max_age),
          max_distance: parseInt(formData.preferences.max_distance),
        },
      };

      const response = await api.post('/auth/register', payload);

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/interests');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {currentStep === 2 && (
          <button className="back-nav-btn" onClick={handlePreviousStep} title="Go back">
            &lt;
          </button>
        )}

        <h1>Join Us! 💕</h1>
        <p className="subtitle">Create your dating profile</p>

        <div className="step-indicator">
          <div className={`step ${currentStep === 1 ? 'active' : 'completed'}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${currentStep === 2 ? 'active' : ''}`}>2</div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={currentStep === 2 ? handleSubmit : (e) => e.preventDefault()}>
          {currentStep === 1 && (
            <div className="form-step" key="step-1">
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              <button type="button" className="btn-primary" onClick={handleNextStep}>
                Next Step →
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-step" key="step-2">
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="18"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" />
              </div>

              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="number" name="latitude" value={formData.latitude} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="number" name="longitude" value={formData.longitude} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Occupation</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Education</label>
                <input type="text" name="education" value={formData.education} onChange={handleChange} />
              </div>

              {/* Preferences */}
              <h4>Preferences</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Min Age</label>
                  <input type="number" name="preferences.min_age" value={formData.preferences.min_age} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Max Age</label>
                  <input type="number" name="preferences.max_age" value={formData.preferences.max_age} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Max Distance (km)</label>
                  <input type="number" name="preferences.max_distance" value={formData.preferences.max_distance} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Gender Preference</label>
                <select multiple name="preferences.gender_preference" value={formData.preferences.gender_preference} onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, gender_preference: selected }
                  }));
                }}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Register'}
              </button>
            </div>
          )}
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
