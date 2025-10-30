// src/pages/Welcome.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: '👥',
      title: 'Meet New People',
      description: 'Connect with singles nearby who share your interests'
    },
    {
      icon: '💗',
      title: 'Swipe to Match',
      description: 'Like profiles you love, pass on the ones you don\'t'
    },
    {
      icon: '💬',
      title: 'Chat Instantly',
      description: 'Start meaningful conversations with your matches'
    },
    {
      icon: '✨',
      title: 'Find Your Perfect Match',
      description: 'Discover your soulmate and start your love story'
    }
  ];

  // Auto-rotate carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-logo">
          <div className="welcome-heart">❤️</div>
          <h1>Dating App</h1>
        </div>

        <div className="carousel-container">
          <div className="carousel-slides">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="slide-icon">{slide.icon}</div>
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>

        <div className="welcome-actions">
          <button
            className="btn-create-account"
            onClick={() => navigate('/register')}
          >
            Create Account
          </button>
          <p className="login-link">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
