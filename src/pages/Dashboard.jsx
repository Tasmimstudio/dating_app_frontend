// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import MatchModal from '../components/MatchModal';
import ProfileViewModal from '../components/ProfileViewModal';
import CardSkeleton from '../components/CardSkeleton';
import SuperLikeAnimation from '../components/SuperLikeAnimation';
import FilterPanel from '../components/FilterPanel';
import './Dashboard.css';

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [isAnimatingSwipe, setIsAnimatingSwipe] = useState(false);
  const [swipeAnimationDirection, setSwipeAnimationDirection] = useState(null);
  const [showSuperLikeAnimation, setShowSuperLikeAnimation] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('matchFilters');
    return saved ? JSON.parse(saved) : {
      minAge: 18,
      maxAge: 100,
      gender: [],
      maxDistance: 100,
    };
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Always fetch fresh data on mount and when filters change
    setLoading(true);
    fetchUsers();
    fetchCurrentUserProfile();
    fetchCurrentUserPhoto();
  }, [filters]); // Refetch when filters change

  // Separate effect to ensure data refreshes when navigating to dashboard
  useEffect(() => {
    // Force refresh user profile and photo on component mount
    fetchCurrentUserProfile();
    fetchCurrentUserPhoto();
  }, []); // Run once on mount

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ignore if modal is open
      if (showProfileModal || showMatchModal) {
        return;
      }

      // Ignore if no current user
      if (currentIndex >= users.length) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleSwipe('dislike');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSwipe('like');
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleSwipe('super_like');
          break;
        case 'Escape':
          e.preventDefault();
          if (showProfileModal) {
            setShowProfileModal(false);
          }
          if (showMatchModal) {
            setShowMatchModal(false);
          }
          if (showMenu) {
            setShowMenu(false);
          }
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (users[currentIndex]) {
            handleViewProfile(users[currentIndex]);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, users, showProfileModal, showMatchModal, showMenu]);

  const fetchCurrentUserProfile = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUserProfile(user);
  };

  const fetchCurrentUserPhoto = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/photos/user/${user.user_id}`);
      const photos = response.data.photos || [];
      const primaryPhoto = photos.find(p => p.is_primary);
      if (primaryPhoto) {
        setCurrentUserPhoto(primaryPhoto.url);
      }
    } catch (error) {
      console.error('Error fetching user photo:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      console.log('Fetching potential matches for user:', userId);

      // Build query parameters from filters
      const params = new URLSearchParams();
      if (filters.minAge && filters.minAge > 18) {
        params.append('min_age', filters.minAge);
      }
      if (filters.maxAge && filters.maxAge < 100) {
        params.append('max_age', filters.maxAge);
      }
      if (filters.gender && filters.gender.length > 0) {
        params.append('gender', filters.gender.join(','));
      }
      if (filters.maxDistance && filters.maxDistance < 100) {
        params.append('max_distance', filters.maxDistance);
      }

      const queryString = params.toString();
      const url = `/users/${userId}/potential-matches${queryString ? '?' + queryString : ''}`;

      console.log('Fetching with filters:', url);
      const response = await api.get(url);
      console.log('Received potential matches:', response.data);
      console.log('Total matches:', response.data.length);

      // Fetch primary photo for each user
      const usersWithPhotos = await Promise.all(
        response.data.map(async (user) => {
          try {
            const photoResponse = await api.get(`/photos/user/${user.user_id}`);
            const photos = photoResponse.data.photos || [];
            const primaryPhoto = photos.find(p => p.is_primary);
            return {
              ...user,
              primary_photo: primaryPhoto ? primaryPhoto.url : null
            };
          } catch (error) {
            console.error(`Error fetching photo for user ${user.user_id}:`, error);
            return { ...user, primary_photo: null };
          }
        })
      );

      setUsers(usersWithPhotos);
      setCurrentIndex(0); // Reset to first card when filters change
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (currentIndex >= users.length || isAnimatingSwipe) {
      console.log('Swipe blocked:', { currentIndex, usersLength: users.length, isAnimatingSwipe });
      return;
    }

    const currentUser = users[currentIndex];
    const userId = JSON.parse(localStorage.getItem('user')).user_id;

    console.log('Swiping:', { action, currentUser: currentUser.name, currentIndex });

    // Show Super Like animation
    if (action === 'super_like' || action === 'super_like_vertical') {
      setShowSuperLikeAnimation(true);
    }

    // Start swipe animation
    setIsAnimatingSwipe(true);
    if (action === 'like' || action === 'super_like') {
      setSwipeAnimationDirection('right');
    } else if (action === 'dislike') {
      setSwipeAnimationDirection('left');
    } else if (action === 'super_like_vertical') {
      setSwipeAnimationDirection('up');
    }

    // Wait for animation to complete before moving to next card
    // Different durations for different animations: 400ms for like/dislike, 500ms for super like
    const animationDuration = (action === 'super_like' || action === 'super_like_vertical') ? 500 : 400;

    setTimeout(async () => {
      try {
        const response = await api.post('/swipes/', {
          from_user_id: userId,
          to_user_id: currentUser.user_id,
          action: action === 'super_like_vertical' ? 'super_like' : action,
        });

        console.log('Swipe response:', response.data);

        if (response.data.is_match) {
          // Show match modal with both users' data
          setMatchData({
            user_id: currentUser.user_id,
            name: currentUser.name,
            photo: currentUser.primary_photo,
          });
          setShowMatchModal(true);
        }

        const newIndex = currentIndex + 1;
        console.log('Moving to next card:', newIndex, 'Total users:', users.length, 'Next user:', users[newIndex]?.name);
        setCurrentIndex(newIndex);

        // Reset animation states
        setIsAnimatingSwipe(false);
        setSwipeAnimationDirection(null);
        setShowSuperLikeAnimation(false);
      } catch (error) {
        console.error('Error swiping:', error);
        // Always reset animation states on error
        setIsAnimatingSwipe(false);
        setSwipeAnimationDirection(null);
        setShowSuperLikeAnimation(false);
      }
    }, animationDuration); // Match animation duration with circular orbital motion
  };

  const handleLogout = () => {
    // Clear all user-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('matchFilters');

    // Clear component state
    setCurrentUserProfile(null);
    setCurrentUserPhoto(null);
    setUsers([]);
    setCurrentIndex(0);

    // Navigate to login
    navigate('/login');
  };

  const handleSettings = () => {
    setShowMenu(false);
    navigate('/settings');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    document.body.classList.toggle('dark-mode', newMode);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    localStorage.setItem('matchFilters', JSON.stringify(newFilters));
    setShowFilterPanel(false);
  };

  const handleViewProfile = async (user) => {
    // Fetch all photos for the user
    try {
      const response = await api.get(`/photos/user/${user.user_id}`);
      const photos = response.data.photos || [];

      setSelectedProfile({
        ...user,
        photos: photos.length > 0 ? photos : (user.primary_photo ? [{ url: user.primary_photo }] : [])
      });
      setShowProfileModal(true);
    } catch (error) {
      console.error('Error fetching user photos:', error);
      // Still show modal with just primary photo
      setSelectedProfile({
        ...user,
        photos: user.primary_photo ? [{ url: user.primary_photo }] : []
      });
      setShowProfileModal(true);
    }
  };

  // Drag handlers for swipe animation
  const handleDragStart = (e) => {
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    const offsetX = clientX - dragStart.x;
    const offsetY = clientY - dragStart.y;

    setDragOffset({ x: offsetX, y: offsetY });

    // Determine swipe direction
    if (Math.abs(offsetX) > 50) {
      if (offsetX > 0) {
        setSwipeDirection('like');
      } else {
        setSwipeDirection('dislike');
      }
    } else {
      setSwipeDirection(null);
    }
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;

    const threshold = 100;

    // Check if swipe was strong enough
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        // Swiped right - Like
        handleSwipe('like');
      } else {
        // Swiped left - Dislike
        handleSwipe('dislike');
      }
    }

    // Reset drag state
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
  };

  const handleCardClick = (e, user) => {
    // Only open profile if not dragging
    if (Math.abs(dragOffset.x) < 5 && Math.abs(dragOffset.y) < 5) {
      handleViewProfile(user);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="profile-avatar">
              {currentUserProfile?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h1>{currentUserProfile?.name || 'Dating App'}</h1>
          </div>
          <nav>
            <button className="nav-btn filter-btn" onClick={() => setShowFilterPanel(true)}>
              Filter
              {(filters.gender.length > 0 || filters.minAge > 18 || filters.maxAge < 100 || filters.maxDistance < 100) && (
                <span className="filter-badge"></span>
              )}
            </button>
            <button className="nav-btn search-btn" onClick={() => navigate('/search')}>
              Search
            </button>
            <button className="nav-btn matches-btn" onClick={() => navigate('/matches')}>
              Matches
            </button>
            <button className="nav-btn messages-btn" onClick={() => navigate('/messages')}>
              Messages
            </button>

            <button className="hamburger-btn" onClick={() => setShowMenu(!showMenu)}>
              <span className="hamburger-icon">☰</span>
            </button>

            {showMenu && (
              <div className="dropdown-menu" onMouseLeave={() => setShowMenu(false)}>
                <button onClick={toggleDarkMode}>
                  <span>{darkMode ? '☀️' : '🌙'}</span> {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={handleSettings}>
                  <span>⚙️</span> Settings
                </button>
                <button onClick={handleLogout} className="menu-logout">
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </nav>
        </header>

        <div className="swipe-container">
          <div className="animated-sphere">
            <div className="sphere-inner"></div>
            <div className="sphere-pulse"></div>
          </div>

          <div className="card-stack">
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="profile-avatar" onClick={() => navigate('/profile')}>
            {currentUserPhoto ? (
              <img
                src={currentUserPhoto.startsWith('http')
                  ? currentUserPhoto
                  : `http://localhost:8002${currentUserPhoto}`}
                alt={currentUserProfile?.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              currentUserProfile?.name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <h1>{currentUserProfile?.name || 'Dating App'}</h1>
        </div>
        <nav>
          <button className="nav-btn filter-btn" onClick={() => setShowFilterPanel(true)}>
            Filter
            {(filters.gender.length > 0 || filters.minAge > 18 || filters.maxAge < 100 || filters.maxDistance < 100) && (
              <span className="filter-badge"></span>
            )}
          </button>
          <button className="nav-btn search-btn" onClick={() => navigate('/search')}>
            Search
          </button>
          <button className="nav-btn matches-btn" onClick={() => navigate('/matches')}>
            Matches
          </button>
          <button className="nav-btn messages-btn" onClick={() => navigate('/messages')}>
            Messages
          </button>

          {/* Hamburger Menu */}
          <button className="hamburger-btn" onClick={() => setShowMenu(!showMenu)}>
            <span className="hamburger-icon">☰</span>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="dropdown-menu" onMouseLeave={() => setShowMenu(false)}>
              <button onClick={toggleDarkMode}>
                <span>{darkMode ? '☀️' : '🌙'}</span> {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={handleSettings}>
                <span>⚙️</span> Settings
              </button>
              <button onClick={handleLogout} className="menu-logout">
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </nav>
      </header>

      <div className="swipe-container">
        <div className="animated-sphere">
          <div className="sphere-inner"></div>
          <div className="sphere-pulse"></div>
        </div>

        {currentUser ? (
          <div className="card-stack">
            {/* Current card (front) */}
            <div
              key={`front-card-${currentUser.user_id}`}
              className={`user-card card-front ${isDragging ? 'dragging' : ''} ${
                isAnimatingSwipe && swipeAnimationDirection === 'right' ? 'card-swiping-right' : ''
              } ${
                isAnimatingSwipe && swipeAnimationDirection === 'left' ? 'card-swiping-left' : ''
              } ${
                isAnimatingSwipe && swipeAnimationDirection === 'up' ? 'card-swiping-up' : ''
              }`}
              onClick={(e) => handleCardClick(e, currentUser)}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              style={{
                cursor: isAnimatingSwipe ? 'default' : 'grab',
                transform: !isAnimatingSwipe ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)` : '',
                transition: isDragging ? 'none' : 'transform 0.3s ease'
              }}
            >
              <div className="user-photo">
                {currentUser.primary_photo ? (
                  <img
                    src={currentUser.primary_photo.startsWith('http')
                      ? currentUser.primary_photo
                      : `http://localhost:8002${currentUser.primary_photo}`}
                    alt={currentUser.name}
                    className="user-photo-img"
                  />
                ) : (
                  <div className="placeholder-photo">
                    {currentUser.name?.charAt(0)}
                  </div>
                )}

                {/* Swipe Direction Overlays */}
                {swipeDirection === 'like' && (
                  <div className="swipe-overlay like-overlay">
                    <span className="swipe-label">LIKE</span>
                  </div>
                )}
                {swipeDirection === 'dislike' && (
                  <div className="swipe-overlay nope-overlay">
                    <span className="swipe-label">NOPE</span>
                  </div>
                )}

                {/* User info overlay on photo */}
                <div className="photo-overlay">
                  <h2>{currentUser.name}, {currentUser.age}</h2>
                  {currentUser.city && <p className="overlay-location">📍 {currentUser.city}</p>}
                </div>
              </div>

              <div className="user-info">
                <p className="user-bio">{currentUser.bio || 'No bio yet...'}</p>
                <div className="user-details">
                  {currentUser.occupation && (
                    <div className="detail-item">
                      <span className="detail-icon">💼</span>
                      <span>{currentUser.occupation}</span>
                    </div>
                  )}
                  {currentUser.education && (
                    <div className="detail-item">
                      <span className="detail-icon">🎓</span>
                      <span>{currentUser.education}</span>
                    </div>
                  )}
                  {currentUser.height && (
                    <div className="detail-item">
                      <span className="detail-icon">📏</span>
                      <span>{currentUser.height} cm</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="swipe-actions">
                <button
                  className="btn-dislike"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe('dislike');
                  }}
                  title="Nope"
                ></button>
                <button
                  className="btn-super-like"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe('super_like');
                  }}
                  title="Super Like"
                ></button>
                <button
                  className="btn-like"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe('like');
                  }}
                  title="Like"
                ></button>
              </div>
            </div>

            {/* Show next 2 cards in the background (stacked) */}
            {users.slice(currentIndex + 1, currentIndex + 3).map((user, idx) => (
              <div
                key={user.user_id}
                className={`user-card card-background card-${idx + 1}`}
                style={{ pointerEvents: 'none' }}
              >
                <div className="user-photo">
                  {user.primary_photo ? (
                    <img
                      src={user.primary_photo.startsWith('http')
                        ? user.primary_photo
                        : `http://localhost:8002${user.primary_photo}`}
                      alt={user.name}
                      className="user-photo-img"
                    />
                  ) : (
                    <div className="placeholder-photo">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="no-users">
            <h2>No more users nearby</h2>
            <p>Check back later for new matches!</p>
          </div>
        )}
      </div>

      {showMatchModal && (
        <MatchModal
          isOpen={showMatchModal}
          currentUser={{
            name: currentUserProfile?.name,
            photo: null, // Can fetch current user's photo if needed
          }}
          matchedUser={matchData}
          onClose={() => setShowMatchModal(false)}
        />
      )}

      {showProfileModal && selectedProfile && (
        <ProfileViewModal
          user={selectedProfile}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onLike={() => handleSwipe('like')}
          onDislike={() => handleSwipe('dislike')}
          onSuperLike={() => handleSwipe('super_like')}
        />
      )}

      <SuperLikeAnimation
        isVisible={showSuperLikeAnimation}
        onAnimationEnd={() => setShowSuperLikeAnimation(false)}
      />

      {showFilterPanel && (
        <FilterPanel
          onApplyFilters={handleApplyFilters}
          onClose={() => setShowFilterPanel(false)}
          initialFilters={filters}
        />
      )}
    </div>
  );
}

export default Dashboard;
