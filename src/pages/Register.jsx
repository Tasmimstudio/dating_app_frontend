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
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextStep = () => {
    setError('');

    // Validate Step 1 fields
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Please enter your name');
        return;
      }
      if (!formData.email.trim()) {
        setError('Please enter your email');
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
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

    // Frontend validation for password
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Frontend validation for age
    const age = parseInt(formData.age);
    if (age < 18 || age > 100) {
      setError('Age must be between 18 and 100');
      return;
    }

    setLoading(true);

    try {
      // Convert age to number
      const payload = {
        ...formData,
        age: parseInt(formData.age),
      };

      // POST request to FastAPI backend
      const response = await api.post('/auth/register', payload);

      // Show success message
      alert('Registration successful! 🎉\n\nYou can now login with your credentials.');

      // Redirect to login page (user must login manually)
      navigate('/login');
    } catch (err) {
      console.error(err);

      // Handle validation errors (422)
      if (err.response?.status === 422 && err.response?.data?.detail) {
        const details = err.response.data.detail;
        if (Array.isArray(details)) {
          // Format validation errors nicely
          const errorMessages = details.map(error =>
            `${error.loc[error.loc.length - 1]}: ${error.msg}`
          ).join(', ');
          setError(errorMessages);
        } else if (typeof details === 'string') {
          setError(details);
        } else {
          setError('Validation error. Please check your input.');
        }
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Back button for Step 2 */}
        {currentStep === 2 && (
          <button className="back-nav-btn" onClick={handlePreviousStep} title="Go back">
            &lt;
          </button>
        )}

        <h1>Join Us! 💕</h1>
        <p className="subtitle">Create your dating profile</p>

        {/* Progress indicator */}
        <div className="step-indicator">
          <div className={`step ${currentStep === 1 ? 'active' : 'completed'}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${currentStep === 2 ? 'active' : ''}`}>2</div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={currentStep === 2 ? handleSubmit : (e) => e.preventDefault()}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="form-step" key="step-1">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
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

          {/* Step 2: Additional Info */}
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
                    placeholder="18+"
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
                <label>Bio (optional)</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
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
