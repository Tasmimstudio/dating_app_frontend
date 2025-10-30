// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    // Set auth header for admin requests
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, matchesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=10'),
        api.get('/admin/matches?limit=10')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setMatches(matchesRes.data.matches || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    delete api.defaults.headers.common['Authorization'];
    navigate('/admin/login');
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      alert('User deleted successfully');
      fetchDashboardData();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      alert('User verified successfully');
      fetchDashboardData();
    } catch (error) {
      alert('Error verifying user');
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;

    try {
      await api.put(`/admin/users/${userId}/ban`);
      alert('User banned successfully');
      fetchDashboardData();
    } catch (error) {
      alert('Error banning user');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>🔐 Admin Panel</h2>
          <p>Dating App</p>
        </div>

        <nav className="admin-nav">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={activeTab === 'matches' ? 'active' : ''}
            onClick={() => setActiveTab('matches')}
          >
            💕 Matches
          </button>
          <button
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {activeTab === 'overview' && '📊 Dashboard Overview'}
            {activeTab === 'users' && '👥 User Management'}
            {activeTab === 'matches' && '💕 Match Management'}
            {activeTab === 'analytics' && '📈 Analytics & Reports'}
          </h1>
        </header>

        <div className="admin-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>{stats.total_users}</h3>
                    <p>Total Users</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <h3>{stats.verified_users}</h3>
                    <p>Verified Users</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💕</div>
                  <div className="stat-info">
                    <h3>{stats.total_matches}</h3>
                    <p>Total Matches</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💬</div>
                  <div className="stat-info">
                    <h3>{stats.total_messages}</h3>
                    <p>Total Messages</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity">
                <h2>Recent Users</h2>
                <div className="activity-list">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.user_id} className="activity-item">
                      <div className="activity-avatar">
                        {user.name?.charAt(0) || '?'}
                      </div>
                      <div className="activity-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                      <span className="activity-badge">
                        {user.is_verified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h2>All Users ({users.length})</h2>
                <button className="btn-refresh" onClick={fetchDashboardData}>
                  🔄 Refresh
                </button>
              </div>

              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.user_id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              {user.name?.charAt(0) || '?'}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.age}</td>
                        <td>{user.gender}</td>
                        <td>
                          <span className={`status-badge ${user.is_verified ? 'verified' : 'pending'}`}>
                            {user.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {!user.is_verified && (
                              <button
                                className="btn-verify"
                                onClick={() => handleVerifyUser(user.user_id)}
                              >
                                ✅
                              </button>
                            )}
                            <button
                              className="btn-ban"
                              onClick={() => handleBanUser(user.user_id)}
                            >
                              🚫
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteUser(user.user_id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && (
            <div className="matches-section">
              <div className="section-header">
                <h2>All Matches ({matches.length})</h2>
                <button className="btn-refresh" onClick={fetchDashboardData}>
                  🔄 Refresh
                </button>
              </div>

              <div className="matches-grid">
                {matches.map((match) => (
                  <div key={match.match_id} className="match-item">
                    <div className="match-info">
                      <span>Match ID: {match.match_id}</span>
                      <span>Date: {new Date(match.matched_at).toLocaleDateString()}</span>
                    </div>
                    <button
                      className="btn-delete-match"
                      onClick={async () => {
                        if (window.confirm('Delete this match?')) {
                          try {
                            await api.delete(`/admin/matches/${match.match_id}`);
                            alert('Match deleted');
                            fetchDashboardData();
                          } catch (error) {
                            alert('Error deleting match');
                          }
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && stats && (
            <div className="analytics-section">
              <h2>Platform Analytics</h2>

              <div className="analytics-card">
                <h3>User Statistics</h3>
                <div className="analytics-stat">
                  <span>Total Users:</span>
                  <strong>{stats.total_users}</strong>
                </div>
                <div className="analytics-stat">
                  <span>Verified Users:</span>
                  <strong>{stats.verified_users}</strong>
                </div>
                <div className="analytics-stat">
                  <span>Verification Rate:</span>
                  <strong>
                    {stats.total_users > 0
                      ? ((stats.verified_users / stats.total_users) * 100).toFixed(1)
                      : 0}%
                  </strong>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Engagement Metrics</h3>
                <div className="analytics-stat">
                  <span>Total Matches:</span>
                  <strong>{stats.total_matches}</strong>
                </div>
                <div className="analytics-stat">
                  <span>Total Messages:</span>
                  <strong>{stats.total_messages}</strong>
                </div>
                <div className="analytics-stat">
                  <span>Avg Messages per Match:</span>
                  <strong>
                    {stats.total_matches > 0
                      ? (stats.total_messages / stats.total_matches).toFixed(1)
                      : 0}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
