// src/pages/Search.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Search.css';

function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await api.get('/users/search/by-name', {
        params: {
          query: searchQuery,
          current_user_id: currentUser.user_id,
          limit: 20
        }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="search-page">
      <header className="search-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Back
          </button>
          <h1 className="search-title">Search</h1>
        </div>
      </header>

      <div className="search-content">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={handleClearSearch}
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="search-submit-btn" disabled={!searchQuery.trim()}>
            Search
          </button>
        </form>

        <div className="search-results">
          {loading ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <p>Searching...</p>
            </div>
          ) : hasSearched ? (
            searchResults.length > 0 ? (
              <div className="results-list">
                <p className="results-count">
                  Found {searchResults.length} {searchResults.length === 1 ? 'person' : 'people'}
                </p>
                {searchResults.map((user) => (
                  <div
                    key={user.user_id}
                    className="search-result-card"
                    onClick={() => handleViewProfile(user.user_id)}
                  >
                    <div className="result-avatar">
                      {user.primary_photo ? (
                        <img
                          src={user.primary_photo.startsWith('http')
                            ? user.primary_photo
                            : `http://localhost:8002${user.primary_photo}`}
                          alt={user.name}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="result-info">
                      <h3 className="result-name">
                        {user.name}
                        {user.age && <span className="result-age">, {user.age}</span>}
                      </h3>
                      {user.city && (
                        <p className="result-location">📍 {user.city}</p>
                      )}
                      {user.occupation && (
                        <p className="result-occupation">💼 {user.occupation}</p>
                      )}
                      {user.bio && (
                        <p className="result-bio">{user.bio}</p>
                      )}
                    </div>
                    <div className="result-arrow">›</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try searching with a different name</p>
              </div>
            )
          ) : (
            <div className="search-empty-state">
              <div className="empty-state-icon">💬</div>
              <h3>Search for people</h3>
              <p>Enter a name to find people on the platform</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
