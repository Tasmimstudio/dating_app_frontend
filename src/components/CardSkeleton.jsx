// src/components/CardSkeleton.jsx
import './CardSkeleton.css';

function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-photo">
        <div className="skeleton-overlay">
          <div className="skeleton-name"></div>
          <div className="skeleton-location"></div>
        </div>
      </div>

      <div className="skeleton-info">
        <div className="skeleton-bio"></div>
        <div className="skeleton-bio"></div>
        <div className="skeleton-bio"></div>

        <div className="skeleton-details">
          <div className="skeleton-detail">
            <div className="skeleton-icon"></div>
            <div className="skeleton-text"></div>
          </div>
          <div className="skeleton-detail">
            <div className="skeleton-icon"></div>
            <div className="skeleton-text"></div>
          </div>
          <div className="skeleton-detail">
            <div className="skeleton-icon"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
      </div>

      <div className="skeleton-actions">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
}

export default CardSkeleton;
