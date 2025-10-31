// src/pages/Matches.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import MatchCardSkeleton from '../components/MatchCardSkeleton';
import './Matches.css';

function Matches() {
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState(null);
  const [expandedBios, setExpandedBios] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchReceivedLikes();
    fetchMatches();
    fetchLikedProfiles();
    fetchCurrentUserProfile();
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

  const fetchReceivedLikes = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      console.log('Fetching received likes for user:', userId);

      const response = await api.get(`/swipes/received-likes/${userId}`);
      console.log('Received likes response:', response.data);

      // Fetch photos for each user who liked you
      const likesWithPhotos = await Promise.all(
        response.data.map(async (user) => {
          try {
            const photoResponse = await api.get(`/photos/user/${user.user_id}`);
            const photos = photoResponse.data.photos || [];
            const primaryPhoto = photos.find(p => p.is_primary);
            return {
              ...user,
              photo: primaryPhoto ? primaryPhoto.url : null
            };
          } catch (error) {
            console.error('Error fetching photo:', error);
            return { ...user, photo: null };
          }
        })
      );

      setReceivedLikes(likesWithPhotos);
    } catch (error) {
      console.error('Error fetching received likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      console.log('Fetching matches for user:', userId);

      const response = await api.get(`/matches/user/${userId}`);
      console.log('Matches response:', response.data);

      // Fetch photos and unread count for each match
      const matchesWithDetails = await Promise.all(
        response.data.map(async (match) => {
          try {
            // Extract user_id from match data (backend returns other_user_id or other_user object)
            const otherUserId = match.other_user_id || match.other_user?.user_id;

            if (!otherUserId) {
              console.error('No user_id found in match:', match);
              return null;
            }

            // Use other_user data if available, otherwise fetch
            let userData = match.other_user || {};
            let primaryPhoto = userData.primary_photo || match.other_user?.primary_photo;

            // Fetch photos if not in match data
            if (!primaryPhoto) {
              try {
                const photoResponse = await api.get(`/photos/user/${otherUserId}`);
                const photos = photoResponse.data.photos || [];
                const photo = photos.find(p => p.is_primary);
                primaryPhoto = photo?.url || null;
              } catch (err) {
                console.error('Error fetching photos:', err);
              }
            }

            // Fetch unread count
            let unreadCount = 0;
            try {
              const unreadResponse = await api.get(`/messages/unread/${userId}`);
              unreadCount = unreadResponse.data.unread_count || 0;
            } catch (err) {
              console.log('No unread messages');
            }

            return {
              user_id: otherUserId,
              name: userData.name || match.other_user_name,
              age: userData.age,
              bio: userData.bio,
              gender: userData.gender,
              city: userData.city,
              occupation: userData.occupation,
              photo: primaryPhoto,
              lastMessage: match.last_message,
              lastMessageTime: match.last_message_time,
              unreadCount,
              matched_at: match.matched_at,
              match_id: match.match_id
            };
          } catch (error) {
            console.error('Error fetching match details:', error);
            return null;
          }
        })
      );

      // Filter out null values
      const validMatches = matchesWithDetails.filter(m => m !== null);

      // Sort by last message time (most recent first)
      validMatches.sort((a, b) => {
        const timeA = a.lastMessageTime || a.matched_at;
        const timeB = b.lastMessageTime || b.matched_at;
        return new Date(timeB) - new Date(timeA);
      });

      setMatches(validMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchLikedProfiles = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      console.log('Fetching liked profiles for user:', userId);

      const response = await api.get(`/swipes/likes/${userId}`);
      console.log('Liked profiles response:', response.data);

      // Fetch user details and photos for each liked profile
      const likedWithPhotos = await Promise.all(
        response.data.map(async (swipe) => {
          try {
            // Fetch user details
            const userResponse = await api.get(`/users/${swipe.to_user_id}`);
            const user = userResponse.data;

            // Fetch photos
            const photoResponse = await api.get(`/photos/user/${swipe.to_user_id}`);
            const photos = photoResponse.data.photos || [];
            const primaryPhoto = photos.find(p => p.is_primary);

            return {
              ...user,
              photo: primaryPhoto ? primaryPhoto.url : null
            };
          } catch (error) {
            console.error('Error fetching liked profile details:', error);
            return null;
          }
        })
      );

      setLikedProfiles(likedWithPhotos.filter(profile => profile !== null));
    } catch (error) {
      console.error('Error fetching liked profiles:', error);
    }
  };

  const handleLikeBack = async (userId) => {
    try {
      const currentUserId = JSON.parse(localStorage.getItem('user')).user_id;

      // Send like (swipe right)
      const response = await api.post('/swipes/', {
        from_user_id: currentUserId,
        to_user_id: userId,
        action: 'like'
      });

      console.log('Like back response:', response.data);

      if (response.data.is_match) {
        alert('It\'s a match! 🎉 You can now message each other in Messages!');
      }

      // Refresh all lists
      await fetchReceivedLikes();
      await fetchMatches();
      await fetchLikedProfiles();

    } catch (error) {
      console.error('Error liking back:', error);
      if (error.response?.status === 400) {
        alert('You already swiped on this user');
      }
    }
  };

  const toggleBio = (userId) => {
    setExpandedBios(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const truncateBio = (bio, userId, maxLength = 80) => {
    if (!bio) return 'No bio';
    if (bio.length <= maxLength) return bio;

    const isExpanded = expandedBios[userId];
    if (isExpanded) {
      return (
        <>
          {bio}{' '}
          <span
            className="see-more-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleBio(userId);
            }}
          >
            See less
          </span>
        </>
      );
    }

    return (
      <>
        {bio.substring(0, maxLength)}...{' '}
        <span
          className="see-more-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleBio(userId);
          }}
        >
          See more
        </span>
      </>
    );
  };

  if (loading) {
    return (
      <div className="matches-page">
        <header className="page-header">
          <div className="header-left">
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
            <h1>{currentUserProfile?.name || 'User'}</h1>
          </div>
          <div className="header-right">
            <button onClick={() => navigate('/dashboard')} className="home-btn" title="Home">
              🏠
            </button>
            <button onClick={() => navigate('/dashboard')} className="discover-btn">
              Discover
            </button>
          </div>
        </header>

        <div className="matches-container">
          <div className="matches-section">
            <h2 className="section-title">Your Matches</h2>
            <p className="section-subtitle">Loading your matches...</p>
            <div className="matches-grid">
              <MatchCardSkeleton count={3} />
            </div>
          </div>

          <div className="matches-section">
            <h2 className="section-title">Profiles You Liked</h2>
            <p className="section-subtitle">Loading liked profiles...</p>
            <div className="matches-grid">
              <MatchCardSkeleton count={3} />
            </div>
          </div>

          <div className="matches-section">
            <h2 className="section-title">People Who Like You</h2>
            <p className="section-subtitle">Loading...</p>
            <div className="matches-grid">
              <MatchCardSkeleton count={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <header className="page-header">
        <div className="header-left">
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
          <h1>{currentUserProfile?.name || 'User'}</h1>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/dashboard')} className="home-btn" title="Home">
            🏠
          </button>
          <button onClick={() => navigate('/dashboard')} className="discover-btn">
            Discover
          </button>
        </div>
      </header>

      <div className="matches-container">
        {/* Mutual Matches Section */}
        <div className="matches-section">
          <h2 className="section-title">Your Matches ({matches.length})</h2>
          <p className="section-subtitle">You can now message these users!</p>

          <div className="matches-grid">
            {matches.length > 0 ? (
              matches.map((user) => (
                <div
                  key={user.user_id}
                  className="match-card"
                  onClick={() => navigate(`/chat/${user.user_id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="match-photo-wrapper">
                    <div className="match-photo">
                      {user.photo ? (
                        <img
                          src={user.photo.startsWith('http')
                            ? user.photo
                            : `http://localhost:8002${user.photo}`}
                          alt={user.name}
                          className="match-photo-img"
                        />
                      ) : (
                        <div className="match-photo-placeholder">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    {user.unreadCount > 0 && (
                      <span className="unread-badge">{user.unreadCount}</span>
                    )}
                  </div>
                  <div className="match-info">
                    <div className="match-header">
                      <h3>{user.name || 'Unknown'}{user.age ? `, ${user.age}` : ''}</h3>
                    </div>
                    {user.lastMessage ? (
                      <p className="last-message">
                        {user.lastMessage.length > 50
                          ? `${user.lastMessage.substring(0, 50)}...`
                          : user.lastMessage}
                      </p>
                    ) : (
                      <p className="match-bio">{user.bio || 'Say hi! 👋'}</p>
                    )}
                    {user.lastMessageTime && (
                      <p className="last-message-time">
                        {new Date(user.lastMessageTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                  <button
                    className="message-btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/chat/${user.user_id}`);
                    }}
                  >
                    💬
                  </button>
                </div>
              ))
            ) : (
              <div className="no-matches">
                <h2>No matches yet</h2>
                <p>Start swiping to find your matches!</p>
              </div>
            )}
          </div>
        </div>

        {/* Liked Profiles Section */}
        <div className="matches-section">
          <h2 className="section-title">Profiles You Liked ({likedProfiles.length})</h2>
          <p className="section-subtitle">Waiting for them to like you back... (Last 24 hours)</p>

          <div className="matches-grid">
            {likedProfiles.length > 0 ? (
              likedProfiles.map((user) => (
                <div key={user.user_id} className="match-card liked-profile">
                  <div className="match-photo">
                    {user.photo ? (
                      <img
                        src={user.photo.startsWith('http')
                          ? user.photo
                          : `http://localhost:8002${user.photo}`}
                        alt={user.name}
                        className="match-photo-img"
                      />
                    ) : (
                      <div className="match-photo-placeholder">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="match-info">
                    <h3>{user.name || 'Unknown'}{user.age ? `, ${user.age}` : ''}</h3>
                    <p className="match-bio">{truncateBio(user.bio, user.user_id)}</p>
                  </div>
                  <div className="liked-badge">
                    ❤️ Liked
                  </div>
                </div>
              ))
            ) : (
              <div className="no-matches">
                <h2>No liked profiles yet</h2>
                <p>Start swiping and like profiles to see them here!</p>
              </div>
            )}
          </div>
        </div>

        {/* Received Likes Section */}
        <div className="matches-section">
          <h2 className="section-title">People Who Like You ({receivedLikes.length})</h2>
          <p className="section-subtitle">Like them back to start messaging!</p>

          <div className="matches-grid">
            {receivedLikes.length > 0 ? (
              receivedLikes.map((user) => (
                <div key={user.user_id} className="match-card pending-match">
                  <div className="match-photo">
                    {user.photo ? (
                      <img
                        src={user.photo.startsWith('http')
                          ? user.photo
                          : `http://localhost:8002${user.photo}`}
                        alt={user.name}
                        className="match-photo-img"
                      />
                    ) : (
                      <div className="match-photo-placeholder">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="match-info">
                    <h3>{user.name || 'Unknown'}{user.age ? `, ${user.age}` : ''}</h3>
                    <p className="match-bio">{truncateBio(user.bio, user.user_id)}</p>
                  </div>
                  <button
                    className="like-back-btn"
                    onClick={() => handleLikeBack(user.user_id)}
                  >
                    ❤️ Like Back
                  </button>
                </div>
              ))
            ) : (
              <div className="no-matches">
                <h2>No one has liked you yet</h2>
                <p>Keep swiping! Your matches will appear here.</p>
                <button onClick={() => navigate('/dashboard')} className="btn-primary">
                  Start Swiping
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Matches;
