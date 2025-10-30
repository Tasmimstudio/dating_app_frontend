// src/pages/MessagesList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './MessagesList.css';

function MessagesList() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUserProfile();
    fetchConversations();
  }, []);

  const fetchCurrentUserProfile = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUserProfile(user);

    // Fetch user's primary photo
    try {
      const photoResponse = await api.get(`/photos/user/${user.user_id}`);
      const photos = photoResponse.data.photos || [];
      const primaryPhoto = photos.find(p => p.is_primary);
      setCurrentUserPhoto(primaryPhoto ? primaryPhoto.url : null);
    } catch (error) {
      console.error('Error fetching user photo:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      const response = await api.get(`/messages/${userId}/conversations`);
      console.log('Conversations:', response.data);
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Set empty array if endpoint doesn't exist yet
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return 'No messages yet';
    return message.length > maxLength
      ? message.substring(0, maxLength) + '...'
      : message;
  };

  if (loading) {
    return (
      <div className="messages-list-page">
        <div className="loading">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="messages-list-page">
      <header className="messages-list-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="home-btn" title="Home">
            🏠
          </button>
          <div className="profile-avatar" onClick={() => navigate('/profile')}>
            {currentUserPhoto ? (
              <img
                src={currentUserPhoto.startsWith('http')
                  ? currentUserPhoto
                  : `http://localhost:8002${currentUserPhoto}`}
                alt={currentUserProfile?.name}
              />
            ) : (
              currentUserProfile?.name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <h1>{currentUserProfile?.name || 'Messages'}</h1>
        </div>
        <button className="back-to-matches-btn" onClick={() => navigate('/matches')}>
          ← Matches
        </button>
      </header>

      <div className="messages-list-content">
        {conversations.length > 0 ? (
          <div className="conversations-list">
            {conversations.map((conversation) => (
              <div
                key={conversation.conversation_id || conversation.user_id}
                className={`conversation-item ${conversation.unread_count > 0 ? 'unread' : ''}`}
                onClick={() => navigate(`/chat/${conversation.user_id}`)}
              >
                <div className="conversation-avatar-wrapper">
                  <div className="conversation-avatar">
                    {conversation.photo ? (
                      <img
                        src={conversation.photo.startsWith('http')
                          ? conversation.photo
                          : `http://localhost:8002${conversation.photo}`}
                        alt={conversation.name}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {conversation.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  {conversation.unread_count > 0 && (
                    <div className="unread-badge">{conversation.unread_count}</div>
                  )}
                </div>

                <div className="conversation-details">
                  <div className="conversation-top">
                    <h3 className="conversation-name">{conversation.name}</h3>
                    <span className="conversation-time">
                      {formatTimestamp(conversation.last_message_time)}
                    </span>
                  </div>
                  <p className={`conversation-preview ${conversation.unread_count > 0 ? 'unread' : ''}`}>
                    {truncateMessage(conversation.last_message)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h2>No conversations yet</h2>
            <p>Start chatting with your matches!</p>
            <button className="goto-matches-btn" onClick={() => navigate('/matches')}>
              View Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesList;
