// src/components/SuperLikeAnimation.jsx
import { useEffect } from 'react';
import './SuperLikeAnimation.css';

function SuperLikeAnimation({ isVisible, onAnimationEnd }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationEnd]);

  if (!isVisible) return null;

  return (
    <div className="super-like-animation-overlay">
      <div className="super-like-stars-container">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="super-like-star"
            style={{
              '--angle': `${(360 / 12) * i}deg`,
              '--delay': `${i * 0.05}s`
            }}
          >
            ★
          </div>
        ))}
        <div className="super-like-center-star">
          ★
        </div>
      </div>
      <div className="super-like-text">SUPER LIKE!</div>
    </div>
  );
}

export default SuperLikeAnimation;
