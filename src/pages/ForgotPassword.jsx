// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Password reset code has been sent to your email! Check your inbox and spam folder.');

      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="back-nav-btn" onClick={() => navigate('/login')} title="Back to login">
          &lt;
        </button>

        <h1>Forgot Password? 🔒</h1>
        <p className="subtitle">Enter your email to reset your password</p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>

        <p className="auth-footer">
          Already have a code? <Link to="/reset-password">Enter code here</Link>
        </p>

        <p className="auth-footer">
          Remember your password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
