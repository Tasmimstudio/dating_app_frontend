// src/pages/BlockedUsers.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './BlockedUsers.css';

function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUserProfile();
    fetchBlockedUsers();
  }, []);

  const fetchCurrentUserProfile = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUserProfile(user);
  };

  const fetchBlockedUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/blocks/user/${user.user_id}`);
      console.log('Blocked users:', response.data);
      setBlockedUsers(response.data);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to unblock ${userName}?`)) {
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await api.delete(`/blocks/${user.user_id}/${userId}`);

      // Remove from local state
      setBlockedUsers(blockedUsers.filter(u => u.user_id !== userId));

      alert(`${userName} has been unblocked successfully!`);
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="blocked-users-page">
        <header className="page-header">
          <div className="header-left">
            <button onClick={() => navigate('/settings')} className="back-btn" title="Back to Settings">
              ê
            </button>
            <h1>Blocked Users</h1>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blocked users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blocked-users-page">
      <header className="page-header">
        <div className="header-left">
          <button onClick={() => navigate('/settings')} className="back-btn" title="Back to Settings">
            ê
          </button>
          <h1>Blocked Users</h1>
        </div>
        <div className="header-right">
          <span className="blocked-count">{blockedUsers.length} blocked</span>
        </div>
      </header>

      <div className="blocked-users-container">
        {blockedUsers.length > 0 ? (
          <div className="blocked-users-list">
            {blockedUsers.map((user) => (
              <div key={user.user_id} className="blocked-user-card">
                <div className="user-avatar">
                  {user.primary_photo ? (
                    <img
                      src={`http://localhost:8000${user.primary_photo}`}
                      alt={user.name}
                      className="avatar-img"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                <div className="user-info">
                  <h3 className="user-name">
                    {user.name || 'Unknown'}{user.age ? `, ${user.age}` : ''}
                  </h3>
                  <p className="user-bio">{user.bio || 'No bio'}</p>
                  <p className="blocked-date">
                    Blocked on {formatDate(user.blocked_at)}
                  </p>
                  {user.reason && (
                    <p className="block-reason">
                      <strong>Reason:</strong> {user.reason}
                    </p>
                  )}
                </div>

                <button
                  className="unblock-btn"
                  onClick={() => handleUnblock(user.user_id, user.name)}
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">=´</div>
            <h2>No Blocked Users</h2>
            <p>You haven't blocked anyone yet.</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockedUsers;
