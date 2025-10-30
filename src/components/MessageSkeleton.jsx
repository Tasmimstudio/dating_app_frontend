// src/components/MessageSkeleton.jsx
import './MessageSkeleton.css';

function MessageSkeleton() {
  return (
    <div className="skeleton-messages-container">
      <div className="skeleton-message received">
        <div>
          <div className="skeleton-message-bubble">
            <div className="skeleton-message-text"></div>
            <div className="skeleton-message-text"></div>
          </div>
          <div className="skeleton-message-timestamp"></div>
        </div>
      </div>

      <div className="skeleton-message sent">
        <div>
          <div className="skeleton-message-bubble">
            <div className="skeleton-message-text"></div>
          </div>
          <div className="skeleton-message-timestamp"></div>
        </div>
      </div>

      <div className="skeleton-message received">
        <div>
          <div className="skeleton-message-bubble">
            <div className="skeleton-message-text"></div>
            <div className="skeleton-message-text"></div>
            <div className="skeleton-message-text"></div>
          </div>
          <div className="skeleton-message-timestamp"></div>
        </div>
      </div>

      <div className="skeleton-message sent">
        <div>
          <div className="skeleton-message-bubble">
            <div className="skeleton-message-text"></div>
            <div className="skeleton-message-text"></div>
          </div>
          <div className="skeleton-message-timestamp"></div>
        </div>
      </div>
    </div>
  );
}

export default MessageSkeleton;
