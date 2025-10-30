// src/components/MatchCardSkeleton.jsx
import './MatchCardSkeleton.css';

function MatchCardSkeleton({ count = 3 }) {
  return (
    <>
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="skeleton-match-card">
          <div className="skeleton-match-photo"></div>
          <div className="skeleton-match-info">
            <div className="skeleton-match-name"></div>
            <div className="skeleton-match-bio"></div>
            <div className="skeleton-match-bio"></div>
          </div>
          <div className="skeleton-match-button"></div>
        </div>
      ))}
    </>
  );
}

export default MatchCardSkeleton;
