// src/pages/Splash.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');

    const timer = setTimeout(() => {
      if (token) {
        navigate('/dashboard');
      } else {
        navigate('/welcome');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="heart-container">
          <div className="animated-heart-large">
            <div className="heart-large"></div>
          </div>
        </div>
        <h1 className="splash-title">Dating App</h1>
        <p className="splash-tagline">Swipe to find love</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default Splash;
